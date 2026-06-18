import { writeFileSync, mkdirSync } from 'node:fs';
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
import { BC_COLUMNS } from '$lib/csv/schema';
import { cleanDom } from '$lib/utils/cleanDom';
import type { LlmProvider } from '$lib/api/llm';
import type { ProductRecord } from '$lib/csv/schema';
import type { ProductContext } from '../product-context';
import { formatProductContext } from '../product-context';

export async function runSpecs(
	product: ProductRecord,
	ctx: ProductContext,
	provider: LlmProvider
): Promise<{ mpn?: string; skipped?: boolean }> {
	const brand = ctx.brandName;
	const sku = product[BC_COLUMNS.sku];

	// Verify the resolved brand name exists in our local registry.
	// TODO: revisit when we have a UI — consider adding products dynamically or fetching from BC.
	const entry = getBrandEntry(brand);
	if (!entry) {
		throw new Error(`Resolved brand "${brand}" not found in local brand registry`);
	}
	const outputDir = join('output', brand, sku);

	let pageResult: ProductPageResult;
	try {
		pageResult = await resolveProductPage(entry, sku, brand);
	} catch (err) {
		if (err instanceof ProductPageNotFoundError) {
			// Product page not locatable — skip with a flag file
			flagForReview(outputDir, brand, sku, err.reason);
			return { skipped: true };
		}
		if (err instanceof ProductPageNetworkError) {
			// Infrastructure failure — surface clearly but still skip this product
			console.error(`[specs] Network error for ${brand} ${sku}: ${err.message}`);
			flagForReview(outputDir, brand, sku, `Network error: ${err.message}`);
			return { skipped: true };
		}
		throw err;
	}

	const contextBlock = formatProductContext(ctx);
	const userMessage = `${contextBlock}\n\n---\n\nManufacturer product page (${pageResult.url}):\n\n${cleanDom(pageResult.text)}`;
	const result = await callLlm('product-specs.md', userMessage, provider);

	mkdirSync(outputDir, { recursive: true });
	writeFileSync(join(outputDir, 'product-features.md'), result, 'utf-8');

	// Extract MPN from the raw features text for CSV column mapping
	const mpn = extractMpn(result);

	if (!result.includes('## Specifications')) {
		console.warn(
			`[specs] product-features.md missing ## Specifications — LLM may not have extracted structured specs. Review before continuing.`
		);
	}

	return { mpn };
}

function extractMpn(features: string): string | undefined {
	const match = features.match(/MPN\s*[|:]?\s*([A-Za-z0-9-]+)/i);
	return match ? match[1].trim() : undefined;
}
