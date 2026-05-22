import { describe, it, expect } from 'vite-plus/test';
import { parseExportCSV } from './parser';
import { BC_COLUMNS } from './schema';
import { join } from 'node:path';

describe('parseExportCSV', () => {
	const rows = parseExportCSV(join(import.meta.dirname, 'fixtures/minimal.csv'));

	it('returns an array', () => {
		expect(Array.isArray(rows)).toBe(true);
	});

	it('has the expected columns', () => {
		expect(rows[0]).toHaveProperty(BC_COLUMNS.name);
		expect(rows[0]).toHaveProperty(BC_COLUMNS.sku);
	});

	it('parse Custom Fields as a string (not pre-parsed', () => {
		expect(typeof rows[0][BC_COLUMNS.customFields]).toBe('string');
	});
});
