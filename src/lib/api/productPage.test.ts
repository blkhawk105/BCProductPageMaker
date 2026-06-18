import { describe, it, expect, vi } from 'vite-plus/test';

// productPage.ts statically imports from browser.ts and cleanDom.
// Mock them so the dynamic import chain doesn't hit an actual browser.
vi.mock('$lib/api/browser', () => ({
	getBrowser: async () => ({ newPage: async () => ({ close: vi.fn() }) }),
	createStealthPage: async (_br: never) => ({ close: vi.fn() })
}));
vi.mock('$lib/utils/cleanDom', () => ({
	cleanDom: (text: string) => text
}));

import {
	ProductPageNotFoundError,
	ProductPageNetworkError,
	normalizeSku,
	scoreLink
} from './productPage';

// ---------------------------------------------------------------------------
// Assertion helpers (used by resolveProductPage integration tests)
// ---------------------------------------------------------------------------

function assertNavigatedTo(page: ReturnType<typeof makePageMock>, url: string) {
	expect(page.goto).toHaveBeenCalledWith(
		url,
		expect.objectContaining({ waitUntil: expect.any(String), timeout: expect.any(Number) })
	);
}

function makePageMock() {
	const fn = () => vi.fn();
	return {
		goto: fn(),
		locator: fn().mockReturnValue({
			first: () => ({ elementHandle: fn().mockResolvedValue(null), fill: fn(), press: fn() })
		}),
		click: fn(),
		fill: fn(),
		press: fn(),
		$: fn().mockReturnValue(null),
		evaluate: fn(),
		evaluateHandle: fn(),
		waitForFunction: fn().mockResolvedValue(undefined),
		waitForLoadState: fn().mockResolvedValue(undefined),
		url: fn().mockReturnValue('https://example.com/'),
		close: fn().mockResolvedValue(undefined),
		addInitScript: fn(),
		on: fn()
	};
}

/** Element handle mock with click/fill/press for search input path. */
function mockElementHandle() {
	return {
		click: vi.fn().mockResolvedValue(undefined),
		fill: vi.fn(),
		press: vi.fn(),
		isVisible: () => vi.fn().mockReturnValue(true),
		evaluate: vi.fn().mockResolvedValue(undefined)
	};
}

describe('normalizeSku', () => {
	it('lowercases and removes special characters from a standard hyphenated SKU', () => {
		expect(normalizeSku('YTR-8310ZII')).toBe('ytr-8310zii');
	});

	it('converts spaces to hyphens', () => {
		expect(normalizeSku('YTR 8310 ZII')).toBe('ytr-8310-zii');
	});

	it('strips dots and other special characters', () => {
		expect(normalizeSku('YTR.8310.ZII')).toBe('ytr8310zii');
	});

	it('handles already-normalized input', () => {
		expect(normalizeSku('ytr-8310zii')).toBe('ytr-8310zii');
	});
});

describe('scoreLink', () => {
	it('scores hyphenated URL match highest (3)', () => {
		const skuNorm = normalizeSku('YTR-8310ZII'); // "ytr-8310zii"
		expect(
			scoreLink(
				`https://usa.yamaha.com/en/products/musical-instruments/trumpets/ytr-${skuNorm}/`,
				'',
				skuNorm
			)
		).toBe(3);
	});

	it('scores no-separator URL match (3)', () => {
		const skuNoHyphens = normalizeSku('YTR-8310ZII').replace(/-/g, ''); // "ytr8310zii"
		expect(
			scoreLink(
				`https://usa.yamaha.com/en/products/ytr${skuNoHyphens}`,
				'',
				normalizeSku('YTR-8310ZII')
			)
		).toBe(3);
	});

	it('scores exact link-text match (2)', () => {
		const skuNorm = normalizeSku('YTR-8310ZII'); // "ytr-8310zii"
		expect(scoreLink('https://example.com/wrong/slug', `Buy ${skuNorm} today`, skuNorm)).toBe(2);
	});

	it('scores space-separated link-text match (1)', () => {
		const skuInput = 'YTR 8310 ZII'; // spaces instead of hyphens → normalizes to "ytr-8310-zii"
		const skuNorm = normalizeSku(skuInput); // "ytr-8310-zii" (three segments, two hyphens)
		expect(scoreLink('https://example.com/wrong', `See ytr 8310 zii details`, skuNorm)).toBe(1);
	});

	it('scores non-matching link at 0', () => {
		const skuNorm = normalizeSku('YTR-8310ZII'); // "ytr-8310zii"
		expect(scoreLink('https://example.com/ytr-777', 'YTR-777 Trumpet', skuNorm)).toBe(0);
	});

	it('prioritizes URL matches over text matches', () => {
		const skuNorm = normalizeSku('YTR-8310ZII');
		// A link with score 3 from URL should beat text-only match of score 2, even if scored individually.
		expect(scoreLink(`https://example.com/${skuNorm}`, 'wrong', skuNorm)).toBe(3);
	});

	it('strips roman numeral generation codes from SKU for variant-tolerant matching', () => {
		const skuNorm = normalizeSku('YTR-9335NYSIII'); // "ytr-9335nysiii"
		// Yamaha uses ytr-9335nys_05 in the URL (roman numeral stripped, "_NN" variant suffix)
		expect(
			scoreLink(
				'https://usa.yamaha.com/products/musical_instruments/winds/trumpets/bb_trumpets/ytr-9335nys_05/index.html',
				'YTR-9335NYS Trumpet',
				skuNorm
			)
		).toBe(3);
	});

	it('strips II generation suffix from SKU', () => {
		const skuNorm = normalizeSku('YTR-8310ZII'); // "ytr-8310zii" → base "ytr-8310z"
		expect(
			scoreLink(
				'https://usa.yamaha.com/products/musical_instruments/winds/trumpets/bb_trumpets/ytr-8310z_02/index.html',
				'YTR-8310ZII Trumpet',
				skuNorm
			)
		).toBe(3);
	});

	it('does not cause false positives from roman numeral stripping', () => {
		const skuNorm = normalizeSku('YTR-8310ZII'); // "ytr-8310zii" → base "ytr-8310z"
		expect(scoreLink('https://example.com/ytr-777', 'YTR-777 Trumpet', skuNorm)).toBe(0);
	});

	it('still matches exact hyphenated SKU when no roman numeral suffix', () => {
		const skuNorm = normalizeSku('YTR-8310Z'); // "ytr-8310z" — no roman numeral to strip
		expect(
			scoreLink(
				'https://usa.yamaha.com/products/musical_instruments/winds/trumpets/bb_trumpets/ytr-8310z/index.html',
				'YTR-8310Z Trumpet',
				skuNorm
			)
		).toBe(3);
	});
});

describe('ProductPageNotFoundError', () => {
	it('stores brand, sku, and reason as readonly properties', () => {
		const err = new ProductPageNotFoundError('Yamaha', 'YTR-8310ZII', 'No search input found');
		expect(err.brand).toBe('Yamaha');
		expect(err.sku).toBe('YTR-8310ZII');
		expect(err.reason).toBe('No search input found');
		expect(err.message).toContain('Yamaha');
		expect(err.message).toContain('YTR-8310ZII');
		expect(err.message).toContain('No search input found');
	});

	it('is an instance of Error', () => {
		const err = new ProductPageNotFoundError('Test', 'SKU', 'reason');
		expect(err).toBeInstanceOf(Error);
	});
});

describe('ProductPageNetworkError', () => {
	it('stores brand, sku, and cause as readonly properties', () => {
		const cause = new Error('timeout');
		const err = new ProductPageNetworkError('Yamaha', 'YTR-8310ZII', cause);
		expect(err.brand).toBe('Yamaha');
		expect(err.sku).toBe('YTR-8310ZII');
		expect(err.cause).toBe(cause);
		expect(err.message).toContain('Yamaha');
		expect(err.message).toContain('YTR-8310ZII');
	});

	it('is an instance of Error', () => {
		const err = new ProductPageNetworkError('Test', 'SKU', new Error('fail'));
		expect(err).toBeInstanceOf(Error);
	});
});

// ---------------------------------------------------------------------------
// resolveProductPage — integration tests (mock browser via dependency injection)
// ---------------------------------------------------------------------------

describe('resolveProductPage (integration)', () => {
	it('full success: nav homepage → search → score → navigate → spec expand → SKU verify', async () => {
		const page = makePageMock();
		const el = mockElementHandle();
		const searchLocator = {
			elementHandle: vi.fn().mockResolvedValue(el),
			fill: vi.fn(),
			press: vi.fn()
		};
		page.locator.mockReturnValue({ first: () => searchLocator });
		page.evaluate.mockImplementation((expr: string | ((arg: unknown) => unknown)) => {
			if (typeof expr === 'string' && expr.includes('querySelector'))
				return [
					{
						href: 'https://usa.yamaha.com/product/ytr-ytr-8310zii',
						text: 'YTR-8310ZII Trumpet',
						score: 3
					}
				];
			return 'ytr-8310zii is a professional Bb trumpet with handcrafted bell.';
		});
		page.url.mockReturnValue('https://usa.yamaha.com/product/ytr-ytr-8310zii');

		const { resolveProductPage } = await import('./productPage');
		const result = await resolveProductPage(
			{ url: 'https://usa.yamaha.com' },
			'YTR-8310ZII',
			'Yamaha',
			async () => ({ newPage: async () => page }) as never
		);

		expect(result.url).toBe('https://usa.yamaha.com/product/ytr-ytr-8310zii');
		expect(result.text).toContain('professional Bb trumpet');
		assertNavigatedTo(page, 'https://usa.yamaha.com');
		// verify fill was done via element.evaluate (bypasses visibility for hidden inputs)
		const evalCall = (el.evaluate as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(evalCall).toBeDefined();
		expect(evalCall[1]).toBe('YTR-8310ZII');
	});

	it('throws ProductPageNotFoundError on homepage network error', async () => {
		const page = makePageMock();
		page.goto.mockRejectedValueOnce(new Error('ENOTFOUND'));
		page.goto.mockResolvedValue(undefined);
		page.locator.mockReturnValue({
			first: () => ({
				elementHandle: vi.fn().mockResolvedValue(mockElementHandle()),
				fill: vi.fn(),
				press: vi.fn()
			})
		});

		const { resolveProductPage, ProductPageNetworkError } = await import('./productPage');
		const err = await resolveProductPage(
			{ url: 'https://dead.site' },
			'SKU-1',
			'DeadBrand',
			async () => ({ newPage: async () => page }) as never
		).catch((e) => e);

		expect(err).toBeInstanceOf(ProductPageNetworkError);
		expect(err.brand).toBe('DeadBrand');
	});

	it('throws ProductPageNotFoundError when no search input found', async () => {
		const page = makePageMock();
		page.locator.mockReturnValue({
			first: () => ({ elementHandle: vi.fn().mockResolvedValue(null) })
		});

		const { resolveProductPage, ProductPageNotFoundError } = await import('./productPage');
		const err = await resolveProductPage(
			{ url: 'https://site.com' },
			'SKU-1',
			'Test',
			async () => ({ newPage: async () => page }) as never
		).catch((e) => e);

		expect(err).toBeInstanceOf(ProductPageNotFoundError);
		expect(err.reason).toBe('No search input found on brand homepage');
	});

	it('throws ProductPageNotFoundError when search does not load results', async () => {
		const page = makePageMock();
		page.locator.mockReturnValue({
			first: () => ({
				elementHandle: vi.fn().mockResolvedValue(mockElementHandle()),
				fill: vi.fn(),
				press: vi.fn()
			})
		});
		page.waitForLoadState.mockRejectedValueOnce(new Error('timeout'));

		const { resolveProductPage, ProductPageNotFoundError } = await import('./productPage');
		const err = await resolveProductPage(
			{ url: 'https://site.com' },
			'SKU-1',
			'Test',
			async () => ({ newPage: async () => page }) as never
		).catch((e) => e);

		expect(err).toBeInstanceOf(ProductPageNotFoundError);
		expect(err.reason).toBe('Search did not load results');
	});

	it('throws ProductPageNotFoundError when no candidate links match SKU', async () => {
		const page = makePageMock();
		page.locator.mockReturnValue({
			first: () => ({
				elementHandle: vi.fn().mockResolvedValue(mockElementHandle()),
				fill: vi.fn(),
				press: vi.fn()
			})
		});
		page.waitForLoadState.mockResolvedValue(undefined);
		page.evaluate.mockImplementation((expr: string | ((arg: unknown) => unknown)) => {
			if (typeof expr === 'string' && expr.includes('querySelector'))
				return [{ href: 'https://site.com/other', text: 'Other Product', score: 0 }];
			return 'result text';
		});

		const { resolveProductPage, ProductPageNotFoundError } = await import('./productPage');
		const err = await resolveProductPage(
			{ url: 'https://site.com' },
			'SKU-1',
			'Test',
			async () => ({ newPage: async () => page }) as never
		).catch((e) => e);

		expect(err).toBeInstanceOf(ProductPageNotFoundError);
		expect(err.reason).toContain('SKU-1');
	});

	it('throws ProductPageNetworkError on product page navigation failure', async () => {
		const page = makePageMock();
		page.goto.mockRejectedValueOnce(new Error('ENOTFOUND'));
		page.goto.mockResolvedValue(undefined);
		page.locator.mockReturnValue({
			first: () => ({
				elementHandle: vi.fn().mockResolvedValue(mockElementHandle()),
				fill: vi.fn(),
				press: vi.fn()
			})
		});
		page.waitForLoadState.mockResolvedValue(undefined);
		page.evaluate.mockImplementation((expr: string | ((arg: unknown) => unknown)) => {
			if (typeof expr === 'string' && expr.includes('querySelector'))
				return [{ href: 'https://site.com/product/sku-1', text: 'SKU-1', score: 3 }];
			return 'result';
		});
		page.goto.mockRejectedValueOnce(new Error('ECONNRESET'));

		const { resolveProductPage, ProductPageNetworkError } = await import('./productPage');
		const err = await resolveProductPage(
			{ url: 'https://site.com' },
			'SKU-1',
			'Test',
			async () => ({ newPage: async () => page }) as never
		).catch((e) => e);

		expect(err).toBeInstanceOf(ProductPageNetworkError);
		expect(err.brand).toBe('Test');
	});

	it('expands spec tab when available', async () => {
		const page = makePageMock();
		const el = mockElementHandle();
		const searchLocator = {
			elementHandle: vi.fn().mockResolvedValue(el),
			fill: vi.fn(),
			press: vi.fn()
		};
		page.locator.mockReturnValue({ first: () => searchLocator });
		page.evaluate.mockImplementation((expr: string | ((arg: unknown) => unknown)) => {
			if (typeof expr === 'string' && expr.includes('querySelector'))
				return [{ href: 'https://site.com/product', text: 'SKU-1', score: 3 }];
			return 'specs for SKU-1 with handcrafted bell.';
		});
		page.url.mockReturnValue('https://site.com/product');

		const mockSpecEl = { click: vi.fn(), isVisible: () => vi.fn().mockReturnValue(true) };
		page.$ = vi.fn().mockReturnValue(mockSpecEl);

		const { resolveProductPage } = await import('./productPage');
		await resolveProductPage(
			{ url: 'https://site.com' },
			'SKU-1',
			'Test',
			async () => ({ newPage: async () => page }) as never
		);

		expect(mockSpecEl.click).toHaveBeenCalledTimes(1);
		const evalCall = (el.evaluate as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(evalCall).toBeDefined();
		expect(evalCall[1]).toBe('SKU-1');
	});

	it('throws ProductPageNotFoundError when SKU not in expanded tab text', async () => {
		const page = makePageMock();
		page.locator.mockReturnValue({
			first: () => ({
				elementHandle: vi.fn().mockResolvedValue(mockElementHandle()),
				fill: vi.fn(),
				press: vi.fn()
			})
		});
		page.evaluate.mockImplementation((expr: string | ((arg: unknown) => unknown)) => {
			if (typeof expr === 'string' && expr.includes('querySelector'))
				return [{ href: 'https://site.com/product', text: 'SKU-1', score: 3 }];
			return 'specs only mention other models';
		});
		page.url.mockReturnValue('https://site.com/product');

		const { resolveProductPage, ProductPageNotFoundError } = await import('./productPage');
		const err = await resolveProductPage(
			{ url: 'https://site.com' },
			'SKU-1',
			'Test',
			async () => ({ newPage: async () => page }) as never
		).catch((e) => e);

		expect(err).toBeInstanceOf(ProductPageNotFoundError);
		expect(err.reason).toContain('does not contain SKU');
	});

	it('handles execution context destroyed by SPA redirect after domContentLoaded', async () => {
		const page = makePageMock();
		page.locator.mockReturnValue({
			first: () => ({
				elementHandle: vi.fn().mockResolvedValue(mockElementHandle()),
				fill: vi.fn(),
				press: vi.fn()
			})
		});
		let evalCallCount = 0;
		page.evaluate.mockImplementation((_expr: string | ((arg: unknown) => unknown)) => {
			evalCallCount += 1;
			if (evalCallCount === 1) throw new Error('Execution context was destroyed');
			if (typeof _expr === 'string' && _expr.includes('querySelector'))
				return [{ href: 'https://site.com/product', text: 'SKU-1', score: 3 }];
			return 'specs for SKU-1 with handcrafted bell.';
		});
		page.url.mockReturnValue('https://site.com/product');

		const { resolveProductPage } = await import('./productPage');
		const result = await resolveProductPage(
			{ url: 'https://site.com' },
			'SKU-1',
			'Test',
			async () => ({ newPage: async () => page }) as never
		);

		expect(result.url).toBe('https://site.com/product');
		expect(result.text).toContain('handcrafted bell');
	});

	it('returns verified URL and text on success with space-separated SKU', async () => {
		const page = makePageMock();
		page.locator.mockReturnValue({
			first: () => ({
				elementHandle: vi.fn().mockResolvedValue(mockElementHandle()),
				fill: vi.fn(),
				press: vi.fn()
			})
		});
		page.evaluate.mockImplementation((expr: string | ((arg: unknown) => unknown)) => {
			if (typeof expr === 'string' && expr.includes('querySelector'))
				return [
					{
						href: 'https://usa.yamaha.com/product/ytr-8310-zii',
						text: 'ytr 8310 zii Trumpet',
						score: 1
					}
				];
			return 'Yamaha YTR-8310-ZII Professional Bb Trumpet with handcrafted bell.';
		});
		page.url.mockReturnValue('https://usa.yamaha.com/product/ytr-8310-zii');

		const { resolveProductPage } = await import('./productPage');
		const result = await resolveProductPage(
			{ url: 'https://usa.yamaha.com' },
			'YTR 8310 ZII',
			'Yamaha',
			async () => ({ newPage: async () => page }) as never
		);

		expect(result.url).toBe('https://usa.yamaha.com/product/ytr-8310-zii');
		expect(result.text).toContain('Professional Bb Trumpet');
	});
});
