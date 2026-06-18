import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { callLlm } from '$lib/api/llm';
import {
	resolveProductPage,
	ProductPageNotFoundError,
	ProductPageNetworkError,
	type ProductPageResult
} from '$lib/api/productPage';
import { flagForReview } from '$lib/pipeline/review-queue';
import { getBrandEntry } from '$lib/registry/brands';
import type { ProductRecord } from '$lib/csv/schema';
import type { ProductContext } from '../product-context';
import type { LlmProvider } from '$lib/api/llm';
import { cleanDom } from '$lib/utils/cleanDom';
import { formatProductContext } from '../product-context';

const SKILL_FILE = 'product-copy.md';

interface CopyResult {
	description: string;
	sourceUrl: string | null;
}

export async function runCopy(
	product: ProductRecord,
	ctx: ProductContext,
	provider: LlmProvider
): Promise<CopyResult> {
	const brand = ctx.brandName;
	const sku = product['SKU'] ?? '';

	const outputDir = join('output', brand, sku);
	const featuresPath = join(outputDir, 'product-features.md');

	// Check that product-features.md exists (required by skill)
	if (!existsSync(featuresPath)) {
		throw new Error(`product-features.md not found at ${featuresPath} — run product-specs first`);
	}

	const featuresText = readFileSync(featuresPath, 'utf-8');

	// Read custom fields if they exist (optional input)
	let customFieldsText: string | null = null;
	const customFieldsPath = join(outputDir, 'product-bc-custom-fields.md');
	if (existsSync(customFieldsPath)) {
		customFieldsText = readFileSync(customFieldsPath, 'utf-8');
	}

	// Resolve verified product page via site search
	const brandEntry = getBrandEntry(brand);
	if (!brandEntry) {
		throw new Error(`Resolved brand "${brand}" not found in local brand registry`);
	}

	let pageResult: ProductPageResult;
	try {
		pageResult = await resolveProductPage(brandEntry, sku, brand);
	} catch (err) {
		if (err instanceof ProductPageNotFoundError) {
			flagForReview(outputDir, brand, sku, err.reason);
			return { description: '', sourceUrl: null };
		}
		if (err instanceof ProductPageNetworkError) {
			console.error(`[copy] Network error for ${brand} ${sku}: ${err.message}`);
			flagForReview(outputDir, brand, sku, `Network error: ${err.message}`);
			return { description: '', sourceUrl: null };
		}
		throw err;
	}

	const contextBlock = formatProductContext(ctx);
	const userMessage = [
		contextBlock,
		'',
		'Spec table:',
		featuresText,
		customFieldsText ? `\nCustom fields:\n${customFieldsText}` : '',
		`Manufacturer product page (${pageResult.url}):\n\n${cleanDom(pageResult.text)}`
	].join('\n');

	const result = await callLlm(SKILL_FILE, userMessage, provider);

	// Detect conversational LLM response — fail loud instead of writing garbage.
	const CONVERSATIONAL =
		/^(thank you|how would you|i have reviewed|what would you|i can help|here are some|let me know)/i;
	if (CONVERSATIONAL.test(result.trim())) {
		throw new Error(
			`LLM returned a conversational response instead of product copy for ${brand} ${sku}. ` +
				`Source page: ${pageResult.url}`
		);
	}

	// Extract the body copy from the LLM output.
	// The skill produces: body copy paragraphs, then a source note line.
	// We strip the source note and any trailing flags to get clean description text.
	const { description, sourceUrl } = extractCopy(result, pageResult.url);

	// Write output
	mkdirSync(outputDir, { recursive: true });
	writeFileSync(join(outputDir, 'product-description.md'), result, 'utf-8');

	return { description, sourceUrl };
}

interface ExtractedCopy {
	description: string;
	sourceUrl: string | null;
}

function extractCopy(text: string, verifiedUrl?: string): ExtractedCopy {
	let sourceUrl: string | null = verifiedUrl ?? null;
	const lines = text.split('\n');

	// Look for source note pattern
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (/^copy based on/i.test(line)) {
			const urlMatch = line.match(/:\s*(https?:\/\/\S+)/);
			if (urlMatch) sourceUrl = urlMatch[1];
			break;
		}
	}

	// Extract body copy: everything before the source note
	// Find where the source note starts and strip it
	let descEnd = lines.length;
	for (let i = 0; i < lines.length; i++) {
		if (/^copy based on/i.test(lines[i].trim())) {
			descEnd = i;
			break;
		}
	}

	const descriptionLines = lines.slice(0, descEnd).filter((line) => line.trim().length > 0);
	const description = descriptionLines.join('\n').trim();

	return { description, sourceUrl };
}
