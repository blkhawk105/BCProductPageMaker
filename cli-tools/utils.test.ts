import { describe, it, expect } from 'vite-plus/test';
import {
	normalizeBcCdnUrl,
	processWithConcurrency,
	toKebab,
	parseVariantValues,
	extFromUrl,
	buildExportImageName
} from './utils.mjs';

describe('normalizeBcCdnUrl', () => {
	it('leaves non-BC URLs unchanged', () => {
		const url = 'https://example.com/image.jpg';
		expect(normalizeBcCdnUrl(url)).toBe(url);
	});

	it('swaps thumbnail size to 1280x1280', () => {
		const input =
			'https://cdn11.bigcommerce.com/s-10xdzq6qo9/products/912/images/14272/CB-60SCE.1744044437.386.513.jpg?c=1';
		const expected =
			'https://cdn11.bigcommerce.com/s-10xdzq6qo9/products/912/images/14272/CB-60SCE.1744044437.1280.1280.jpg?c=1';
		expect(normalizeBcCdnUrl(input)).toBe(expected);
	});

	it('preserves the query string', () => {
		const result = normalizeBcCdnUrl(
			'https://cdn11.bigcommerce.com/s-abc/products/1/images/1/photo.123456.386.513.jpg?c=2'
		);
		expect(result).toContain('?c=2');
	});

	it('handles URLs with no query string', () => {
		const input =
			'https://cdn11.bigcommerce.com/s-abc/products/1/images/1/photo.123456.386.513.jpg';
		expect(normalizeBcCdnUrl(input)).toMatch(/\.1280\.1280\.jpg$/);
	});

	it('works with .png extension', () => {
		const input =
			'https://cdn11.bigcommerce.com/s-abc/products/1/images/1/photo.123456.386.513.png';
		expect(normalizeBcCdnUrl(input)).toMatch(/\.1280\.1280\.png$/);
	});

	it('works with .webp extension', () => {
		const input =
			'https://cdn11.bigcommerce.com/s-abc/products/1/images/1/photo.123456.386.513.webp';
		expect(normalizeBcCdnUrl(input)).toMatch(/\.1280\.1280\.webp$/);
	});

	it('works with .gif extension', () => {
		const input =
			'https://cdn11.bigcommerce.com/s-abc/products/1/images/1/photo.123456.386.513.gif';
		expect(normalizeBcCdnUrl(input)).toMatch(/\.1280\.1280\.gif$/);
	});

	it('leaves a URL already at 1280x1280 unchanged', () => {
		const url =
			'https://cdn11.bigcommerce.com/s-abc/products/1/images/1/photo.123456.1280.1280.jpg?c=1';
		expect(normalizeBcCdnUrl(url)).toBe(url);
	});
});

describe('processWithConcurrency', () => {
	it('processes all items and returns results', async () => {
		const items = [1, 2, 3];
		const results = await processWithConcurrency(items, async (x) => x * 2, 2);
		expect(results).toEqual([2, 4, 6]);
	});

	it('preserves result order regardless of completion order', async () => {
		const delays = [30, 10, 20];
		const results = await processWithConcurrency(
			delays,
			(ms) => new Promise((resolve) => setTimeout(() => resolve(ms), ms)),
			3
		);
		expect(results).toEqual([30, 10, 20]);
	});

	it('handles an empty array', async () => {
		const results = await processWithConcurrency([], async (x) => x, 5);
		expect(results).toEqual([]);
	});

	it('works when concurrency exceeds item count', async () => {
		const items = [1, 2];
		const results = await processWithConcurrency(items, async (x) => x + 10, 20);
		expect(results).toEqual([11, 12]);
	});

	it('works with concurrency of 1', async () => {
		const order: number[] = [];
		const items = [1, 2, 3];
		await processWithConcurrency(
			items,
			async (x) => {
				order.push(x);
				return x;
			},
			1
		);
		expect(order).toEqual([1, 2, 3]);
	});
});

describe('toKebab', () => {
	it('lowercases and hyphenates words', () => {
		expect(toKebab('My Product Name')).toBe('my-product-name');
	});

	it('replaces special characters with hyphens', () => {
		expect(toKebab('Guitar & Bass')).toBe('guitar-bass');
	});

	it('collapses multiple separators into one hyphen', () => {
		expect(toKebab('foo  --  bar')).toBe('foo-bar');
	});

	it('trims leading and trailing hyphens', () => {
		expect(toKebab('  Leading/Trailing  ')).toBe('leading-trailing');
	});

	it('handles empty string', () => {
		expect(toKebab('')).toBe('');
	});

	it('handles all-uppercase input', () => {
		expect(toKebab('UPPERCASE')).toBe('uppercase');
	});
});

describe('parseVariantValues', () => {
	it('returns empty array for empty string', () => {
		expect(parseVariantValues('')).toEqual([]);
	});

	it('extracts a single value', () => {
		expect(parseVariantValues('Type=Dropdown|Name=Color|Value=Natural')).toEqual(['natural']);
	});

	it('extracts multiple values', () => {
		expect(
			parseVariantValues(
				'Type=Dropdown|Name=Color|Value=Natural|Type=Dropdown|Name=Neck|Value=Maple'
			)
		).toEqual(['natural', 'maple']);
	});

	it('returns empty array when no Value= segments exist', () => {
		expect(parseVariantValues('Type=Dropdown|Name=Color')).toEqual([]);
	});

	it('lowercases values', () => {
		expect(parseVariantValues('Value=5A')).toEqual(['5a']);
	});
});

describe('extFromUrl', () => {
	it('extracts .jpg extension', () => {
		expect(extFromUrl('https://example.com/photo.jpg')).toBe('.jpg');
	});

	it('normalizes .jpeg to .jpg', () => {
		expect(extFromUrl('https://example.com/photo.jpeg')).toBe('.jpg');
	});

	it('lowercases the extension', () => {
		expect(extFromUrl('https://example.com/photo.PNG')).toBe('.png');
	});

	it('strips the query string before matching', () => {
		expect(extFromUrl('https://example.com/photo.webp?c=1')).toBe('.webp');
	});

	it('defaults to .jpg when no extension is found', () => {
		expect(extFromUrl('https://example.com/photo')).toBe('.jpg');
	});

	it('defaults to .jpg for empty string', () => {
		expect(extFromUrl('')).toBe('.jpg');
	});
});

describe('buildExportImageName', () => {
	it('builds an internal image filename from product name and imageId', () => {
		const row = {
			productName: 'My Guitar',
			imageId: '200',
			sourceColumn: 'Internal Image URL (Export)',
			options: '',
			URL: 'https://example.com/photo.jpg'
		};
		expect(buildExportImageName(row)).toBe('my-guitar_200.jpg');
	});

	it('builds a variant filename with option values', () => {
		const row = {
			productName: 'Drum Sticks',
			imageId: '300',
			sourceColumn: 'Variant Image URL',
			options: 'Type=Dropdown|Name=Color|Value=Natural|Type=Dropdown|Name=Size|Value=5A',
			URL: 'https://example.com/photo.jpg'
		};
		expect(buildExportImageName(row)).toBe('drum-sticks_natural_5a.jpg');
	});

	it('builds a variant filename with no option values (no suffix)', () => {
		const row = {
			productName: 'Snare',
			imageId: '400',
			sourceColumn: 'Variant Image URL',
			options: '',
			URL: 'https://example.com/photo.jpg'
		};
		expect(buildExportImageName(row)).toBe('snare.jpg');
	});

	it('uses the URL extension', () => {
		const row = {
			productName: 'Drum',
			imageId: '500',
			sourceColumn: 'Internal Image URL (Export)',
			options: '',
			URL: 'https://example.com/photo.png'
		};
		expect(buildExportImageName(row)).toBe('drum_500.png');
	});
});
