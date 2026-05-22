import { parse } from 'csv-parse/sync';
import { readFileSync } from 'node:fs';
import type { ProductRecord } from './schema';

export function parseExportCSV(filePath: string): ProductRecord[] {
	const content = readFileSync(filePath, 'utf-8');

	return parse(content, {
		columns: true, // use first row as keys
		skip_empty_lines: true,
		trim: true
	}) as ProductRecord[];
}
