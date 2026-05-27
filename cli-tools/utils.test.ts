import { describe, it, expect } from 'vite-plus/test';
import { normalizeBcCdnUrl, processWithConcurrency } from './utils.mjs';

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
