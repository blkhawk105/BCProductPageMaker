import { describe, it, expect } from 'vite-plus/test';
import { checkSquare, flattenBcRows } from './checkSquareImages.mjs';

describe('checkSquare', () => {
	it('returns an error result when URL is missing', async () => {
		const result = await checkSquare({ imageId: '1', URL: '' });
		expect(result.isSquare).toBe('error: no URL');
		expect(result.imageType).toBe('');
		expect(result.width).toBe('');
		expect(result.height).toBe('');
	});

	it('returns an error result when URL is whitespace only', async () => {
		const result = await checkSquare({ imageId: '1', URL: '   ' });
		expect(result.isSquare).toBe('error: no URL');
	});

	it('spreads the original row fields into the result', async () => {
		const row = { imageId: '42', URL: '', extra: 'data' };
		const result = await checkSquare(row);
		expect(result.imageId).toBe('42');
		expect(result.extra).toBe('data');
	});
});

describe('flattenBcRows', () => {
	it('returns an empty array for empty input', () => {
		expect(flattenBcRows([])).toEqual([]);
	});

	it('skips Product rows (they carry no image URLs)', () => {
		const rows = [{ Item: 'Product', ID: '1', SKU: 'SKU', Name: 'Guitar' }];
		expect(flattenBcRows(rows)).toEqual([]);
	});

	it('skips rows where both URL columns are empty', () => {
		const rows = [
			{ Item: 'Product', ID: '1', SKU: 'A', Name: 'Product A' },
			{ Item: 'Image', ID: '10', 'Internal Image URL (Export)': '', 'Variant Image URL': '' }
		];
		expect(flattenBcRows(rows)).toHaveLength(0);
	});

	it('extracts an internal image URL and inherits product context', () => {
		const rows = [
			{ Item: 'Product', ID: '100', SKU: 'SKU-1', Name: 'My Guitar', Options: '' },
			{
				Item: 'Image',
				ID: '200',
				'Internal Image URL (Export)': 'https://example.com/photo.jpg',
				'Variant Image URL': '',
				Options: ''
			}
		];
		const result = flattenBcRows(rows);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			productId: '100',
			productSku: 'SKU-1',
			productName: 'My Guitar',
			imageId: '200',
			sourceColumn: 'Internal Image URL (Export)',
			options: '',
			URL: 'https://example.com/photo.jpg'
		});
	});

	it('extracts a variant image URL and preserves Options', () => {
		const rows = [
			{ Item: 'Product', ID: '100', SKU: 'SKU-1', Name: 'Drum', Options: '' },
			{
				Item: 'Variant',
				ID: '300',
				'Variant Image URL': 'https://example.com/variant.jpg',
				'Internal Image URL (Export)': '',
				Options: 'Type=Dropdown|Name=Color|Value=Natural'
			}
		];
		const result = flattenBcRows(rows);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			productId: '100',
			sourceColumn: 'Variant Image URL',
			options: 'Type=Dropdown|Name=Color|Value=Natural',
			URL: 'https://example.com/variant.jpg'
		});
	});

	it('inherits the most recent Product context for each image', () => {
		const rows = [
			{
				Item: 'Product',
				ID: '1',
				SKU: 'A',
				Name: 'Product A',
				'Internal Image URL (Export)': '',
				'Variant Image URL': ''
			},
			{
				Item: 'Image',
				ID: '10',
				'Internal Image URL (Export)': 'https://example.com/a.jpg',
				'Variant Image URL': ''
			},
			{
				Item: 'Product',
				ID: '2',
				SKU: 'B',
				Name: 'Product B',
				'Internal Image URL (Export)': '',
				'Variant Image URL': ''
			},
			{
				Item: 'Image',
				ID: '20',
				'Internal Image URL (Export)': 'https://example.com/b.jpg',
				'Variant Image URL': ''
			}
		];
		const result = flattenBcRows(rows);
		expect(result).toHaveLength(2);
		expect(result[0].productId).toBe('1');
		expect(result[1].productId).toBe('2');
	});

	it('emits one item per non-empty URL column per row', () => {
		const rows = [
			{ Item: 'Product', ID: '1', SKU: 'A', Name: 'Product A' },
			{
				Item: 'Variant',
				ID: '10',
				'Variant Image URL': 'https://example.com/v.jpg',
				'Internal Image URL (Export)': 'https://example.com/i.jpg',
				Options: ''
			}
		];
		const result = flattenBcRows(rows);
		expect(result).toHaveLength(2);
		const columns = result.map((r) => r.sourceColumn);
		expect(columns).toContain('Variant Image URL');
		expect(columns).toContain('Internal Image URL (Export)');
	});
});
