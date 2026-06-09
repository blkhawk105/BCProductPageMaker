import { stringify } from 'csv-stringify/sync';
import { writeFileSync, mkdirSync } from 'node:fs';
import { BC_COLUMNS } from './schema';
import type { CustomField } from './schema';
import type { DiffRecord } from './schema';

export function mergeCustomFields(
	existing: string, // raw JSON string from BC export
	incoming: CustomField[]
): string {
	let fields: CustomField[];

	try {
		fields = JSON.parse(existing || '[]');
	} catch {
		fields = [];
	}

	for (const field of incoming) {
		const idx = fields.findIndex((f) => f.name === field.name);

		if (idx >= 0) {
			fields[idx].value = field.value; // Update existing fields with new values - preserves the id
		} else {
			fields.push({ name: field.name, value: field.value }); // Add a new custom field - id assigned on import
		}
	}

	return JSON.stringify(fields);
}

export function writeDiffCSV(records: DiffRecord[], outputPath: string): void {
	mkdirSync(new URL('../../../output', import.meta.url).pathname, { recursive: true });

	const rows = records.map((r): Record<string, string> => {
		const row: Record<string, string> = {
			[BC_COLUMNS.item]: r.item,
			[BC_COLUMNS.id]: r.id
		};

		row[BC_COLUMNS.item] = r.item;

		if (r.name) {
			row[BC_COLUMNS.name] = r.name;
		}

		if (r.sku) {
			row[BC_COLUMNS.sku] = r.sku;
		}

		if (r.description) {
			row[BC_COLUMNS.description] = r.description;
		}

		if (r.customFields) {
			row[BC_COLUMNS.customFields] = JSON.stringify(r.customFields);
		}

		if (r.pageTitle) {
			row[BC_COLUMNS.pageTitle] = r.pageTitle;
		}

		if (r.metaDescription) {
			row[BC_COLUMNS.metaDescription] = r.metaDescription;
		}

		if (r.searchKeywords) {
			row[BC_COLUMNS.searchKeywords] = r.searchKeywords;
		}

		if (r.mpn) {
			row[BC_COLUMNS.mpn] = r.mpn;
		}

		return row;
	});

	writeFileSync(outputPath, stringify(rows, { header: true }), 'utf-8');
}
