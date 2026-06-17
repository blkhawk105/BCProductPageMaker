import { describe, it, expect } from 'vite-plus/test';
import { BC_COLUMNS } from '$lib/csv/schema';
import type { ProductRecord } from '$lib/csv/schema';
import { buildProductContext, formatProductContext } from './product-context';

function makeProductRow(extra: Record<string, string> = {}): ProductRecord {
	return {
		[BC_COLUMNS.brandId]: '1',
		[BC_COLUMNS.upcEan]: '',
		[BC_COLUMNS.categories]: '',
		[BC_COLUMNS.item]: 'Product',
		[BC_COLUMNS.id]: '1',
		[BC_COLUMNS.name]: 'Yamaha YTR-2800',
		[BC_COLUMNS.sku]: 'YAM-YTR2800',
		[BC_COLUMNS.options]: '',
		[BC_COLUMNS.inventoryTracking]: 'None',
		[BC_COLUMNS.description]: '',
		[BC_COLUMNS.customFields]: '',
		[BC_COLUMNS.pageTitle]: '',
		[BC_COLUMNS.metaDescription]: '',
		[BC_COLUMNS.searchKeywords]: '',
		[BC_COLUMNS.mpn]: 'YTR2800',
		[BC_COLUMNS.Weight]: '',
		[BC_COLUMNS.Width]: '',
		[BC_COLUMNS.Height]: '',
		[BC_COLUMNS.Depth]: '',
		[BC_COLUMNS.IsVisible]: '1',
		[BC_COLUMNS.IsFeatured]: '',
		...extra
	};
}

function makeVariantRow(options: string = ''): ProductRecord {
	const row = makeProductRow();
	row[BC_COLUMNS.item] = 'Variant';
	if (options) {
		row[BC_COLUMNS.options] = options;
	}
	return row;
}

describe('formatProductContext', () => {
	it('formats a minimal context (no UPC, no options) as a 3-line string', () => {
		const ctx = {
			name: 'Yamaha YTR-2800',
			sku: 'YAM-YTR2800',
			brandName: 'Ted Brown Music'
		};
		const result = formatProductContext(ctx);
		const lines = result.split('\n');
		expect(lines).toHaveLength(3);
		expect(lines[0]).toBe('Brand: Ted Brown Music');
		expect(lines[1]).toBe('Product name: Yamaha YTR-2800');
		expect(lines[2]).toBe('SKU: YAM-YTR2800');
	});

	it('formats a full context with UPC and variants', () => {
		const ctx = {
			name: 'Yamaha YTR-2800',
			sku: 'YAM-YTR2800',
			brandName: 'Yamaha',
			upc: '123456789012',
			options: [
				{ name: 'Color', value: 'Silver' },
				{ name: 'Finish', value: 'Lacquer' }
			]
		};
		const result = formatProductContext(ctx);
		expect(result).toContain('UPC/EAN: 123456789012');
		expect(result).toContain('Variants:');
		expect(result).toContain('  Color: Silver');
		expect(result).toContain('  Finish: Lacquer');
	});
});

describe('buildProductContext', () => {
	it('deduplicates options across 3 variant rows when same name::value appears twice', () => {
		const product = makeProductRow();
		const variants: ProductRecord[] = [
			makeVariantRow('Type=Dropdown|Name=Color|Value=Silver'),
			makeVariantRow('Type=Dropdown|Name=Finish|Value=Lacquer'),
			makeVariantRow('Type=Dropdown|Name=Color|Value=Silver') // duplicate
		];
		const ctx = buildProductContext(product, variants, 'Yamaha');
		expect(ctx.options).toHaveLength(2);
		const colorOpt = ctx.options!.find((o) => o.name === 'Color');
		expect(colorOpt?.value).toBe('Silver');
	});

	it('returns options as undefined when no variant rows are provided', () => {
		const ctx = buildProductContext(makeProductRow(), [], 'Yamaha');
		expect(ctx.options).toBeUndefined();
	});

	it('returns options as undefined when variant rows exist but all have empty Options column', () => {
		const product = makeProductRow();
		const variants: ProductRecord[] = [makeVariantRow(), makeVariantRow()];
		const ctx = buildProductContext(product, variants, 'Yamaha');
		expect(ctx.options).toBeUndefined();
	});

	it('includes the UPC when present on the product row', () => {
		const product = makeProductRow({ [BC_COLUMNS.upcEan]: '987654321' });
		const ctx = buildProductContext(product, [], 'Yamaha');
		expect(ctx.upc).toBe('987654321');
	});

	it('excludes the UPC when the field is empty', () => {
		const product = makeProductRow(); // upcEan is ''
		const ctx = buildProductContext(product, [], 'Yamaha');
		expect(ctx.upc).toBeUndefined();
	});
});
