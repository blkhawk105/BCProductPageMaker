import type { ProductRecord, DiffRecord } from '$lib/csv/schema';
import { BC_COLUMNS } from '$lib/csv/schema';
import type { LlmProvider } from '$lib/api/llm';
import { getBrandName } from '$lib/api/bc-graphql';
import { runSpecs } from './steps/specs';
import { runCustomFields } from './steps/customFields';
import { runCopy } from './steps/copy';
import { runSeo } from './steps/seo';
import { getVariantRows } from '$lib/csv/group-product';
import { buildProductContext } from './product-context';

type StepName = 'Specs' | 'Custom Fields' | 'Copy' | 'SEO';

async function step(name: StepName, fn: () => Promise<unknown>): Promise<unknown> {
	process.stdout.write(`  Running: ${name}...`);
	const result = await fn();
	process.stdout.write(` ✓\n`);
	return result;
}

export async function runPipeline(
	product: ProductRecord,
	allRows: ProductRecord[],
	provider: LlmProvider
): Promise<DiffRecord> {
	// Guard before Number() — Number('') === 0, not NaN, so an empty Brand ID
	// would silently pass a 0 to getBrandName() and rely on its internal fallback.
	if (!product[BC_COLUMNS.brandId]) {
		throw new Error(
			`Product "${product[BC_COLUMNS.name]}" has no Brand ID — cannot look up brand name`
		);
	}
	const brandId = Number(product[BC_COLUMNS.brandId]);
	const sku = product[BC_COLUMNS.sku] ?? '';
	const brandName = await getBrandName(brandId, sku);
	if (!brandName) throw new Error(`Brand ID ${brandId} not found in BC brand registry`);

	const variantRows = getVariantRows(allRows, product);
	const ctx = buildProductContext(product, variantRows, brandName);

	// Assemble identity fields upfront so they survive early returns.
	const record: DiffRecord = {
		item: product['Item'] ?? '',
		id: product[BC_COLUMNS.id] ?? '',
		name: product['Name'] ?? '',
		sku
	};

	const specsResult = (await step('Specs', () => runSpecs(product, ctx, provider))) as Awaited<
		ReturnType<typeof runSpecs>
	>;
	if (specsResult.skipped) {
		console.warn(`[pipeline] Skipping product ${sku} — specs step was skipped`);
		return record;
	}
	const cfResult = (await step('Custom Fields', () =>
		runCustomFields(product, ctx, provider)
	)) as Awaited<ReturnType<typeof runCustomFields>>;
	const copyResult = (await step('Copy', () => runCopy(product, ctx, provider))) as Awaited<
		ReturnType<typeof runCopy>
	>;
	if (!copyResult.description) {
		console.warn(`[pipeline] Skipping product ${sku} — copy step produced no description`);
		return record;
	}
	const seoResult = (await step('SEO', () => runSeo(product, ctx, provider))) as Awaited<
		ReturnType<typeof runSeo>
	>;

	if (specsResult.mpn) record.mpn = specsResult.mpn;
	// Emit categories column when any source categories were removed,
	// so BC import can delete them. Write kept IDs (partial removal) or
	// empty string (all removed) to signal the deletion request.
	if (cfResult.keptCategoryIds.length > 0 || cfResult.removedCategoriesCount > 0) {
		if (cfResult.keptCategoryIds.length > 0) {
			record.categories = cfResult.keptCategoryIds.map(String).join(';');
		} else {
			record.categories = ''; // all removed → empty string triggers deletion
		}
	}
	if (Array.isArray(cfResult.customFields) && cfResult.customFields.length > 0)
		record.customFields = cfResult.customFields;
	if (copyResult.description) record.description = copyResult.description;
	if (seoResult.pageTitle) record.pageTitle = seoResult.pageTitle;
	if (seoResult.metaDescription) record.metaDescription = seoResult.metaDescription;
	if (seoResult.searchKeywords) record.searchKeywords = seoResult.searchKeywords;

	return record;
}
