import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { callLlm } from '$lib/api/llm';
import { fetchPageText } from '$lib/api/browser';
import { getBrandName } from '$lib/api/bc-graphql';
import { getBrandEntry } from '$lib/registry/brands';
import { BC_COLUMNS } from '$lib/csv/schema';
// import { normalizeBcCdnUrl } from '$lib/utils/cdn';
import type { LlmProvider } from '$lib/api/llm';
import type { ProductRecord } from '$lib/csv/schema';

export async function runSpecs(
	product: ProductRecord,
	provider: LlmProvider
): Promise<{ mpn?: string }> {
	const brandId = Number(product[BC_COLUMNS.brandId]);
	const brand = await getBrandName(brandId);
	if (!brand) throw new Error(`Brand ID ${brandId} not found in BC brand registry`);

	// Verify the resolved brand name exists in our local registry.
	// TODO: revisit when we have a UI — consider adding products dynamically or fetching from BC.
	const entry = getBrandEntry(brand);
	if (!entry) {
		throw new Error(`Resolved brand "${brand}" (ID ${brandId}) not found in local brand registry`);
	}
	const url = entry.url;

	const pageText = await fetchPageText(url);
	const result = await callLlm('product-specs.md', pageText, provider);

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
