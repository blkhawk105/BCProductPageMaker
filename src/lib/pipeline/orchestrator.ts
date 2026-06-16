import type { ProductRecord, DiffRecord } from '$lib/csv/schema';
import { BC_COLUMNS } from '$lib/csv/schema';
import type { LlmProvider } from '$lib/api/llm';
import { runSpecs } from './steps/specs';
import { runCustomFields } from './steps/customFields';
import { runCopy } from './steps/copy';
import { runSeo } from './steps/seo';

type StepName = 'Specs' | 'Custom Fields' | 'Copy' | 'SEO';

async function step(name: StepName, fn: () => Promise<unknown>): Promise<unknown> {
	process.stdout.write(`  Running: ${name}...`);
	const result = await fn();
	process.stdout.write(` ✓\n`);
	return result;
}

export async function runPipeline(
	product: ProductRecord,
	provider: LlmProvider
): Promise<DiffRecord> {
	const item = product['Item'] ?? '';
	const id = product[BC_COLUMNS.id] ?? '';
	const name = product['Name'] ?? '';
	const sku = product['SKU'] ?? '';

	const specsResult = (await step('Specs', () => runSpecs(product, provider))) as Awaited<
		ReturnType<typeof runSpecs>
	>;
	const cfResult = (await step('Custom Fields', () =>
		runCustomFields(product, provider)
	)) as Awaited<ReturnType<typeof runCustomFields>>;
	const copyResult = (await step('Copy', () => runCopy(product, provider))) as Awaited<
		ReturnType<typeof runCopy>
	>;
	const seoResult = (await step('SEO', () => runSeo(product, provider))) as Awaited<
		ReturnType<typeof runSeo>
	>;

	// Assemble DiffRecord — only include properties that have a truthy value.
	const record: DiffRecord = { item, id, name, sku };
	if (specsResult.mpn) record.mpn = specsResult.mpn;
	if (Array.isArray(cfResult.customFields) && cfResult.customFields.length > 0)
		record.customFields = cfResult.customFields;
	if (copyResult.description) record.description = copyResult.description;
	if (seoResult.pageTitle) record.pageTitle = seoResult.pageTitle;
	if (seoResult.metaDescription) record.metaDescription = seoResult.metaDescription;
	if (seoResult.searchKeywords) record.searchKeywords = seoResult.searchKeywords;

	return record;
}
