import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { callLlm } from '$lib/api/llm';
import { fetchPageText } from '$lib/api/browser';
import { getBrandUrl } from '$lib/registry/brands';
// import { normalizeBcCdnUrl } from '$lib/utils/cdn';
import type { LlmProvider } from '$lib/api/llm';
import type { ProductRecord } from '$lib/csv/schema';

export async function runSpecs(
	product: ProductRecord,
	provider: LlmProvider
): Promise<{ mpn?: string }> {
	const brand = product['Brand'] ?? '';
	const model = product['Model'] ?? '';
	const sku = product['SKU'] ?? '';
	const url = getBrandUrl(brand);

	// Make sure there is a valid URL for the requested brand in the registry
	if (!url) {
		throw new Error(`No URL found in brand registry for ${brand}`);
	}

	const pageText = await fetchPageText(url);
	const result = await callLlm('product-specs.md', pageText, provider);

	const outputDir = join('output', brand, model, sku);
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
