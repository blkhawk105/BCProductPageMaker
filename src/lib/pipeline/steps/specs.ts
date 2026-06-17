import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { callLlm } from '$lib/api/llm';
import { fetchPageText } from '$lib/api/browser';
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
): Promise<{ mpn?: string }> {
	const brand = ctx.brandName;

	// Verify the resolved brand name exists in our local registry.
	// TODO: revisit when we have a UI — consider adding products dynamically or fetching from BC.
	const entry = getBrandEntry(brand);
	if (!entry) {
		throw new Error(`Resolved brand "${brand}" not found in local brand registry`);
	}
	const url = entry.url;

	const rawText = await fetchPageText(url);
	const contextBlock = formatProductContext(ctx);
	const userMessage = `${contextBlock}\n\n---\n\nManufacturer homepage content:\n\n${cleanDom(rawText)}`;
	const result = await callLlm('product-specs.md', userMessage, provider);

	const outputDir = join('output', brand, product[BC_COLUMNS.sku]);
	mkdirSync(outputDir, { recursive: true });
	writeFileSync(join(outputDir, 'product-features.md'), result, 'utf-8');

	// Extract MPN from the raw features text for CSV column mapping
	const mpn = extractMpn(result);

	return { mpn };
}

function extractMpn(features: string): string | undefined {
	const match = features.match(/MPN\s*[|:]?\s*([A-Za-z0-9-]+)/i);
	return match ? match[1].trim() : undefined;
}
