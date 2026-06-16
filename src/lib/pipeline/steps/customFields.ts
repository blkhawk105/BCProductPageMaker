import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { askCategoriesToRemove } from '$lib/pipeline/resolveMissingCategories';
import { getBrandName, getCategoryNames } from '$lib/api/bc-graphql';
import type { CategoryResolution } from '$lib/api/bc-graphql';
import { callLlm } from '$lib/api/llm';
import type { LlmProvider } from '$lib/api/llm';
import type { ProductRecord, CustomField } from '$lib/csv/schema';
import { BC_COLUMNS } from '$lib/csv/schema';

const SKILL_FILE = 'product-custom-fields.md';

interface CustomFieldsResult {
	customFields: CustomField[]; // alias for `fields` — matches DiffRecord key
	fields: CustomField[]; // legacy name, kept for backwards compat
	category: string | null;
	unresolved: string[];
	skipped: boolean; // true if no category found (skill says not to write output)
	keptCategoryIds: number[]; // IDs that survived removal prompt — for the import CSV
	removedCategoriesCount: number; // how many source categories were removed (0 = none removed)
}

export async function runCustomFields(
	product: ProductRecord,
	provider: LlmProvider
): Promise<CustomFieldsResult> {
	const sku = product[BC_COLUMNS.sku];
	const brandId = Number(product[BC_COLUMNS.brandId]);
	const brand = (await getBrandName(brandId, sku)) ?? '';
	const rawCategories = product[BC_COLUMNS.categories] ?? '';

	const originalCategoryIds = rawCategories
		.split(';')
		.map((s) => Number(s.trim()))
		.filter((n) => n > 0);

	let resolution: CategoryResolution;
	if (originalCategoryIds.length > 0) {
		resolution = await getCategoryNames(originalCategoryIds, sku, (missing, sku2) =>
			askCategoriesToRemove(missing, sku2)
		);
	} else {
		resolution = { names: [], keptIds: [] };
	}

	const category = resolution.names.join(', ');

	if (!category) {
		throw new Error(`No category found for ${brand} (${sku}) — cannot look up custom fields`);
	}

	// Check that product-features.md exists (required by skill)
	const outputDir = join('output', brand, sku);
	const featuresPath = join(outputDir, 'product-features.md');
	if (!existsSync(featuresPath)) {
		throw new Error(`product-features.md not found at ${featuresPath} — run product-specs first`);
	}

	const featuresText = readFileSync(featuresPath, 'utf-8');

	const userMessage = [
		`Brand: ${brand}`,
		`SKU: ${sku}`,
		`Category: ${category}`,
		'',
		'Spec table:',
		featuresText
	].join('\n');

	const result = await callLlm(SKILL_FILE, userMessage, provider);

	// Parse the LLM output to extract CustomField entries.
	// The skill produces a markdown table like:
	// | Custom Field Name | Value        |
	// | ----------------- | ------------ |
	// | Type              | Tenor Sax    |
	// We parse rows after the header separator line.
	const fields = parseCustomFieldTable(result);

	if (fields.length === 0) {
		// The skill may stop before writing if no category match — check for that signal
		const skipped =
			/no custom field definitions found/i.test(result) ||
			/do not create/i.test(result) ||
			/stop/i.test(result);
		return {
			customFields: [],
			fields: [],
			category,
			unresolved: [],
			skipped,
			keptCategoryIds: resolution.keptIds,
			removedCategoriesCount: originalCategoryIds.length - resolution.keptIds.length
		};
	}

	// Write output
	mkdirSync(outputDir, { recursive: true });
	writeFileSync(join(outputDir, 'product-bc-custom-fields.md'), result, 'utf-8');

	// Extract unresolved count from the summary
	const unresolved = extractUnresolved(result);

	return {
		customFields: fields,
		fields,
		category,
		unresolved,
		skipped: false,
		keptCategoryIds: resolution.keptIds,
		removedCategoriesCount: originalCategoryIds.length - resolution.keptIds.length
	};
}

function parseCustomFieldTable(text: string): CustomField[] {
	const lines = text.split('\n');
	const fields: CustomField[] = [];
	let inTable = false;
	let foundHeader = false;

	for (const line of lines) {
		if (!line.includes('|')) continue;

		if (!foundHeader && line.includes('Custom Field Name') && line.includes('Value')) {
			inTable = true;
			foundHeader = true;
			continue;
		}

		if (inTable && foundHeader) {
			// Stop at the separator line or when we hit a non-table line
			if (/^[\s|:-]+$/.test(line.replace(/\|/g, '')) && line.includes('|')) continue; // skip separator
			if (!line.startsWith('|') || !line.endsWith('|')) {
				inTable = false;
				continue;
			}

			const parts = line
				.split('|')
				.map((s) => s.trim())
				.filter((_, i, arr) => i > 0 && i < arr.length - 1);
			if (parts.length >= 2) {
				fields.push({ name: parts[0], value: parts[1] });
			}
		}
	}

	return fields;
}

function extractUnresolved(text: string): string[] {
	const unresolved: string[] = [];
	const lines = text.split('\n');
	let inUnresolvedSection = false;

	for (const line of lines) {
		if (/^Unresolved fields?:/i.test(line)) {
			inUnresolvedSection = true;
			continue;
		}
		if (inUnresolvedSection && line.startsWith('•')) {
			unresolved.push(line.replace(/^•\s*/, ''));
		}
		if (inUnresolvedSection && !line.startsWith('•') && !line.startsWith(' ')) {
			inUnresolvedSection = false;
		}
	}

	return unresolved;
}
