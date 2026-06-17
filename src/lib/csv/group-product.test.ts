import { describe, it, expect } from 'vite-plus/test';
import { getVariantRows } from './group-product';
import { BC_COLUMNS } from './schema';
import type { ProductRecord } from './schema';

function makeProductRow(extra: Record<string, string> = {}): ProductRecord {
	return {
		[BC_COLUMNS.brandId]: '',
		[BC_COLUMNS.upcEan]: '',
		[BC_COLUMNS.categories]: '',
		[BC_COLUMNS.item]: 'Product',
		[BC_COLUMNS.id]: '1',
		[BC_COLUMNS.name]: 'Test Product',
		[BC_COLUMNS.sku]: 'TEST-001',
		[BC_COLUMNS.options]: '',
		[BC_COLUMNS.inventoryTracking]: 'None',
		[BC_COLUMNS.description]: '',
		[BC_COLUMNS.customFields]: '',
		[BC_COLUMNS.pageTitle]: '',
		[BC_COLUMNS.metaDescription]: '',
		[BC_COLUMNS.searchKeywords]: '',
		[BC_COLUMNS.mpn]: '',
		[BC_COLUMNS.Weight]: '',
		[BC_COLUMNS.Width]: '',
		[BC_COLUMNS.Height]: '',
		[BC_COLUMNS.Depth]: '',
		[BC_COLUMNS.IsVisible]: '1',
		[BC_COLUMNS.IsFeatured]: '',
		...extra
	} as unknown as ProductRecord;
}

function makeVariantRow(): ProductRecord {
	const row = makeProductRow();
	row[BC_COLUMNS.item] = 'Variant';
	return row;
}

function makeImageRow(): ProductRecord {
	const row = makeProductRow();
	row[BC_COLUMNS.item] = 'Image';
	return row;
}

function makeVideoRow(): ProductRecord {
	const row = makeProductRow();
	row[BC_COLUMNS.item] = 'Video';
	return row;
}

describe('getVariantRows', () => {
	it('returns [] when product rows are consecutive (no variants)', () => {
		const allRows = [makeProductRow(), makeProductRow({ id: '2' })];
		expect(getVariantRows(allRows, allRows[0])).toEqual([]);
	});

	it('collects 3 variant rows between two products', () => {
		const allRows: ProductRecord[] = [
			makeProductRow(),
			makeVariantRow(),
			makeVariantRow(),
			makeVariantRow(),
			makeProductRow({ id: '2' })
		];
		expect(getVariantRows(allRows, allRows[0])).toHaveLength(3);
	});

	it('skips interleaved Image/Video rows and collects only Variant rows', () => {
		const allRows: ProductRecord[] = [
			makeProductRow(),
			makeVariantRow(),
			makeImageRow(),
			makeVariantRow(),
			makeVideoRow(),
			makeVariantRow(),
			makeProductRow({ id: '2' })
		];
		expect(getVariantRows(allRows, allRows[0])).toHaveLength(3);
	});

	it('returns [] when productRow is not found in allRows', () => {
		const orphan = makeProductRow();
		const allRows = [makeProductRow({ id: '1' }), makeProductRow({ id: '2' })];
		expect(getVariantRows(allRows, orphan)).toEqual([]);
	});

	it('returns [] when product is at the end of the array', () => {
		const allRows: ProductRecord[] = [makeVariantRow(), makeProductRow()];
		expect(getVariantRows(allRows, allRows[1])).toEqual([]);
	});
});
