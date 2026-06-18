import { getBrowser, createStealthPage } from '$lib/api/browser';
import type { Page } from 'playwright';

/** Opaque browser handle — lets tests inject a fake via `browserFactory`. */
export interface FakeBrowser {
	newPage(): Promise<Page>;
}
import { cleanDom } from '$lib/utils/cleanDom';
import type { BrandEntry } from '$lib/registry/brands';

export interface ProductPageResult {
	url: string;
	text: string;
}

/**
 * Product page not locatable or verifiable on the site.
 * Skippable — caller should flag for human review and move on.
 */
export class ProductPageNotFoundError extends Error {
	constructor(
		public readonly brand: string,
		public readonly sku: string,
		public readonly reason: string
	) {
		super(`Product page not found for ${brand} ${sku}: ${reason}`);
	}
}

/**
 * Infrastructure failure reaching the brand site.
 * Retryable — caller should surface and decide whether to retry or skip.
 */
export class ProductPageNetworkError extends Error {
	constructor(
		public readonly brand: string,
		public readonly sku: string,
		public readonly cause: unknown
	) {
		super(`Network error reaching ${brand} site for SKU ${sku}`);
	}
}

/** Normalize SKU for slug/text matching (case-insensitive). */
export function normalizeSku(sku: string): string {
	return sku
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
}

/** Score a candidate link against the normalized SKU. Higher = better match. */
export function scoreLink(href: string, text: string, skuNorm: string): number {
	const h = href.toLowerCase();
	const t = text.toLowerCase();
	const skuNoHyphens = skuNorm.replace(/-/g, ''); // e.g. "ytr8310zii"
	const skuSpaced = skuNorm.replace(/-/g, ' '); // e.g. "ytr 8310zii"

	if (h.includes(skuNorm)) return 3; // hyphenated in URL path
	if (h.includes(skuNoHyphens)) return 3; // no-separator URL variant

	// Variant-tolerant matching: strip Roman-numeral generation suffixes from SKU,
	// and trailing manufacturer codes like "_05" from URL.
	// Yamaha uses ytr-9335nys_05 for YTR-9335NYSIII — the "III" is a generation marker,
	// not part of the base model name used in URLs.
	const skuBase = skuNorm.replace(/-?[iivxclmd]+$/i, ''); // strip trailing roman numerals
	if (skuBase && h.includes(skuBase)) return 3;

	if (t.includes(skuNorm)) return 2; // exact in link text
	if (t.includes(skuSpaced)) return 1; // space-separated in link text
	return 0;
}

const SEARCH_INPUT_SELECTORS = [
	'input[type="search"]',
	'input[name="q"]',
	'input[name="search"]',
	'input[name="keyword"]',
	'input[placeholder*="search" i]',
	'input[aria-label*="search" i]',
	'[role="searchbox"]'
];

const SPEC_TAB_SELECTORS = [
	'button:has-text("Specifications")',
	'button:has-text("Specs")',
	'[data-tab="specifications"]',
	'[aria-controls*="spec" i]',
	'li:has-text("Specifications") a',
	'a.tab:has-text("Spec")'
];

/**
 * Navigate to a brand's product page via site search, score links,
 * verify the SKU is confirmed on the resolved page.
 *
 * Returns a verified `ProductPageResult` or throws.
 */
export async function resolveProductPage(
	brandEntry: BrandEntry,
	sku: string,
	brand: string,
	browserFactory?: () => Promise<FakeBrowser>
): Promise<ProductPageResult> {
	let browser = await (browserFactory ? browserFactory() : getBrowser());

	// When using the real browser (no factory), wrap with stealth.
	// Tests inject a FakeBrowser — don't apply stealth to test doubles.
	if (!browserFactory) {
		const stealthBrowser = browser as import('playwright').Browser;
		browser = new Proxy(browser as unknown as FakeBrowser, {
			get: (target, prop, receiver) => {
				if (prop === 'newPage') {
					return () => createStealthPage(stealthBrowser);
				}
				return Reflect.get(target, prop, receiver);
			}
		}) as unknown as FakeBrowser;
	}

	const page = await (browser as FakeBrowser).newPage();
	const skuNorm = normalizeSku(sku);

	try {
		// --- Step 1: Navigate to brand homepage ---
		try {
			await page.goto(brandEntry.url, { waitUntil: 'domcontentloaded', timeout: 15_000 });
		} catch (err) {
			throw new ProductPageNetworkError(brand, sku, err);
		}

		// --- Step 2: Find the site's search input ---
		const searchLocator = page.locator(SEARCH_INPUT_SELECTORS.join(', ')).first();
		const searchInput = await searchLocator.elementHandle();
		if (!searchInput) {
			throw new ProductPageNotFoundError(brand, sku, 'No search input found on brand homepage');
		}

		// --- Step 3: Type the SKU and submit ---
		// The search input may be behind a toggle (e.g. Bootstrap collapse).
		// Try clicking any visible toggle button first; if none is visible, proceed to fill.
		const TOGGLE_SELECTORS = [
			'a[href*="#search"]',
			'button[data-toggle="collapse"][data-target*="search" i]',
			'button[data-bs-target*="search" i]',
			'button[aria-controls*="search" i]',
			'a[aria-controls*="search" i]'
		];
		const toggle = await page.locator(TOGGLE_SELECTORS.join(', ')).first().elementHandle();
		if (toggle) {
			await toggle.click().catch(() => {}); // not visible or no-op — ignore
		}

		// Evaluate to write value into the input, then submit via parent form requestSubmit
		// (or keyboard Enter if no form). This avoids blocking on hidden/overlayed inputs.
		const handle = await searchLocator.elementHandle();
		if (!handle) return { url: page.url(), text: '' }; // no input found — shouldn't happen (gated above)
		await handle.evaluate((el: HTMLInputElement, value: string) => {
			const input = el as HTMLInputElement;
			input.focus();
			input.value = value;
			el.dispatchEvent(new Event('input', { bubbles: true }));
			el.dispatchEvent(new Event('change', { bubbles: true }));
			const form = el.closest('form');
			if (form) {
				form.requestSubmit();
				return;
			}
			el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
			el.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', bubbles: true }));
			el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
		}, sku);

		try {
			await page.waitForLoadState('domcontentloaded', { timeout: 15_000 });
			// Wait for any SPA/hydration client-side navigation to settle before evaluating.
			// This covers sites that redirect after DOMContentLoaded (e.g., Yamaha search results).
			try {
				await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10_000 });
			} catch {
				/* no further navigation — page is stable */
			}
		} catch {
			throw new ProductPageNotFoundError(brand, sku, 'Search did not load results');
		}

		// --- Verify search results loaded with our SKU (covers sites whose analytics keep networkidle from firing) ---
		let onResults = false;
		try {
			onResults = await page.evaluate((skuNorm: string) => {
				const url = window.location.href;
				const isSearchResults = /\/search(\/index)?\.html/.test(url);
				if (!isSearchResults) return false;
				const bodyText = document.body.textContent ?? '';
				return bodyText.toLowerCase().includes(skuNorm);
			}, skuNorm);
		} catch {
			// Execution context may have been destroyed by SPA redirect after domContentLoaded.
			// That means navigation happened successfully — treat as results present.
			onResults = true;
		}

		if (!onResults) {
			throw new ProductPageNotFoundError(
				brand,
				sku,
				'Search returned no results matching SKU ' + sku
			);
		}

		// --- Step 4: Extract and score candidate links (product URLs only) ---
		const candidates = (await page.evaluate((skuNorm: string) => {
			const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'));
			const skuNoHyphens = skuNorm.replace(/-/g, '');
			const skuSpaced = skuNorm.replace(/-/g, ' ');

			return links
				.map((a) => ({ href: a.href, text: (a.textContent ?? '').trim() }))
				.filter((l) => {
					if (!l.href || !l.text) return false;
					const h = l.href.toLowerCase();
					// Reject non-product URLs inlined to avoid nested function declarations
					// that can leak bundler polyfills into the evaluate context.
					if (h.includes('/search/')) return false;
					if (h.includes('/news_events/')) return false;
					if (h.includes('/promotions/') || h.includes('/promote/')) return false;
					if (/\.com\/products\/musical_instruments\//.test(h)) return true;
					return (
						/\/products\/[^/]+\/[a-z]/i.test(h) && !l.href.includes('.html') && l.href.length > 60
					);
				})
				.map((l) => {
					const h = l.href.toLowerCase();
					const t = l.text.toLowerCase();
					let score = 0;
					if (h.includes(skuNorm)) score = 3;
					else if (h.includes(skuNoHyphens)) score = 3;
					// Variant-tolerant: strip Roman-numeral generation suffixes from SKU.
					const skuBase = skuNorm.replace(/-?[iivxclmd]+$/i, '');
					if (score < 3 && skuBase && h.includes(skuBase)) score = 3;
					if (score === 0 && t.includes(skuNorm)) score = 2;
					if (score === 0 && t.includes(skuSpaced)) score = 1;
					return { ...l, score };
				})
				.filter((l) => l.score >= 1)
				.sort((a, b) => b.score - a.score);
		}, skuNorm)) as Array<{ href: string; text: string; score: number }>;

		if (candidates.length === 0) {
			throw new ProductPageNotFoundError(
				brand,
				sku,
				`Search returned no results matching SKU ${sku}`
			);
		}

		const bestLink = candidates[0].href;

		// --- Step 5: Navigate to the best matching link ---
		try {
			await page.goto(bestLink, { waitUntil: 'networkidle', timeout: 15_000 });
		} catch (err) {
			throw new ProductPageNetworkError(brand, sku, err);
		}

		// --- Step 6: Expand spec tabs/accordions ---
		for (const sel of SPEC_TAB_SELECTORS) {
			const el = await page.$(sel);
			if (el) {
				await el.click();
				// Prefer aria-expanded state change; fall back to DOM update wait.
				try {
					await page.waitForFunction(
						(s) => document.querySelector(s)?.getAttribute('aria-expanded') === 'true',
						sel,
						{ timeout: 2_000 }
					);
				} catch {
					await page.waitForLoadState('domcontentloaded', { timeout: 2_000 }).catch(() => {});
				}
				break;
			}
		}

		// --- Step 7: Extract page text (including hidden tab content) ---
		const rawText = await page.evaluate(() => {
			document.querySelectorAll('script, style, noscript').forEach((el) => el.remove());
			return document.body.textContent ?? '';
		});

		const text = cleanDom(rawText);

		// --- Step 8: Verify SKU is on the page (hard gate) ---
		const textNorm = text.toLowerCase().replace(/[^a-z0-9-]/g, '');
		if (!textNorm.includes(skuNorm)) {
			throw new ProductPageNotFoundError(
				brand,
				sku,
				`Page at ${page.url()} does not contain SKU "${sku}" — may be wrong product or variant`
			);
		}

		return { url: page.url(), text };
	} finally {
		await page.close();
	}
}
