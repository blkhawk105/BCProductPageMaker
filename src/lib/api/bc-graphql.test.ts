import { describe, it, expect, vi } from 'vite-plus/test';
import { writeFileSync, existsSync, rmSync } from 'node:fs';

// ---------------------------------------------------------------------------
// flattenCategoryTree — pure function tests
// ---------------------------------------------------------------------------

describe('flattenCategoryTree', () => {
	it('flattens a 5-level tree rooted under Shop By Category (entityId 30)', async () => {
		const { flattenCategoryTree } = await import('$lib/api/bc-graphql');

		const tree = [
			{
				entityId: 100,
				name: 'Brass',
				path: '/shop-by-category/brass/',
				children: [
					{
						entityId: 200,
						name: 'Trumpets',
						path: '/shop-by-category/brass/trumpets/',
						children: [
							{
								entityId: 300,
								name: 'Student Trumpets',
								path: '/shop-by-category/brass/trumpets/student/',
								children: []
							}
						]
					},
					{
						entityId: 400,
						name: 'Trombones',
						path: '/shop-by-category/brass/trombones/',
						children: []
					}
				]
			}
		];

		const flat = flattenCategoryTree(tree as never[], 30);

		expect(flat.size).toBe(4);
		const trumpets = flat.get(200);
		expect(trumpets?.name).toBe('Trumpets');
		expect(trumpets?.parentId).toBe(100);
		const student = flat.get(300);
		expect(student?.name).toBe('Student Trumpets');
		expect(student?.parentId).toBe(200);
	});

	it('handles a tree with no children', async () => {
		const { flattenCategoryTree } = await import('$lib/api/bc-graphql');

		const tree = [
			{ entityId: 1, name: 'A', path: '/a/', children: [] },
			{ entityId: 2, name: 'B', path: '/b/', children: null as unknown as never[] }
		];

		const flat = flattenCategoryTree(tree as never[], undefined);
		expect(flat.size).toBe(2);
		expect(flat.get(1)?.name).toBe('A');
	});
});

// ---------------------------------------------------------------------------
// gqlFetch — error handling (requires mocked fetch)
// ---------------------------------------------------------------------------

describe('gqlFetch', () => {
	it('throws on HTTP error status', async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 401,
			text: () => Promise.resolve('Unauthorized')
		});

		try {
			const { gqlFetch } = await import('$lib/api/bc-graphql');
			await expect(gqlFetch('bad-token', '{}')).rejects.toThrow('BC GraphQL 401');
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	it('throws on GraphQL errors array', async () => {
		const originalFetch = globalThis.fetch;
		const errorDetail = [{ message: 'Field not found' }];
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: null, errors: errorDetail })
		});

		try {
			const { gqlFetch } = await import('$lib/api/bc-graphql');
			await expect(gqlFetch('bad-token', '{}')).rejects.toThrow(
				'BC GraphQL errors: [{"message":"Field not found"}]'
			);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});

// ---------------------------------------------------------------------------
// getCategoryNames — cache hit and no-SKU miss
// ---------------------------------------------------------------------------

describe('getCategoryNames', () => {
	const CACHE_PATH = 'registry/bc-categories.json';

	it('resolves names from disk cache', async () => {
		writeFileSync(
			CACHE_PATH,
			JSON.stringify({ 10: { name: 'Trumpets', path: '/trumpets/' } }),
			'utf-8'
		);
		vi.resetModules();
		try {
			const { getCategoryNames } = await import('$lib/api/bc-graphql');
			await expect(getCategoryNames([10])).resolves.toEqual(['Trumpets']);
		} finally {
			if (existsSync(CACHE_PATH)) rmSync(CACHE_PATH);
		}
	});

	it('throws with a clear message when ID is missing and no SKU is provided', async () => {
		writeFileSync(
			CACHE_PATH,
			JSON.stringify({ 10: { name: 'Trumpets', path: '/trumpets/' } }),
			'utf-8'
		);
		vi.resetModules();
		try {
			const { getCategoryNames } = await import('$lib/api/bc-graphql');
			await expect(getCategoryNames([99])).rejects.toThrow(
				'Category IDs [99] not in cache and no SKU provided for lookup'
			);
		} finally {
			if (existsSync(CACHE_PATH)) rmSync(CACHE_PATH);
		}
	});
});

// ---------------------------------------------------------------------------
// getBrandName — cache hit and no-SKU miss
// ---------------------------------------------------------------------------

describe('getBrandName', () => {
	const CACHE_PATH = 'registry/bc-brands.json';

	it('resolves a name from disk cache', async () => {
		writeFileSync(CACHE_PATH, JSON.stringify({ 42: 'Yamaha' }), 'utf-8');
		vi.resetModules();
		try {
			const { getBrandName } = await import('$lib/api/bc-graphql');
			await expect(getBrandName(42)).resolves.toBe('Yamaha');
		} finally {
			if (existsSync(CACHE_PATH)) rmSync(CACHE_PATH);
		}
	});

	it('returns undefined when ID is missing and no SKU is provided', async () => {
		vi.resetModules();
		const { getBrandName } = await import('$lib/api/bc-graphql');
		await expect(getBrandName(999)).resolves.toBeUndefined();
	});
});
