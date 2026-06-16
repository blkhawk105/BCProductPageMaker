import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { getBrowser } from '$lib/api/browser';

/** @returns subset of `missingIds` to keep, or `[]` to remove all missing. Never returns `null`. */
export type MissingCategoryResolver = (missingIds: number[], sku: string) => Promise<number[]>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoreWindow extends Window {
	BC_STOREFRONT_TOKEN?: string;
}

interface CategoryTreeNode {
	entityId: number;
	name: string;
	path: string;
	children?: CategoryTreeNode[];
}

interface ProductDataResult {
	site: {
		product: {
			brand: { entityId: number; name: string } | null;
			categories: { edges: { node: { entityId: number; name: string; path: string } }[] };
		} | null;
	};
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRAPHQL_ENDPOINT = 'https://store-10xdzq6qo9.mybigcommerce.com/graphql';
const STORE_URL = 'https://www.tedbrownmusic.com';
const BRANDS_CACHE_PATH = 'registry/bc-brands.json';
const CATEGORIES_CACHE_PATH = 'registry/bc-categories.json';

// ---------------------------------------------------------------------------
// Token extraction
// ---------------------------------------------------------------------------

async function getToken(): Promise<string> {
	// Env override is authoritative — skip Playwright entirely.
	if (process.env.BC_STOREFRONT_TOKEN) return process.env.BC_STOREFRONT_TOKEN;

	// Lazy-resolve from the storefront via Playwright (retry once).
	let lastErr: Error | null = null;
	for (let attempt = 1; attempt <= 2; attempt++) {
		const browser = await getBrowser();
		const page = await browser.newPage();
		try {
			await page.goto(STORE_URL, { waitUntil: 'domcontentloaded' });
			const token = await page.evaluate(
				() => (window as unknown as StoreWindow).BC_STOREFRONT_TOKEN
			);
			if (!token) throw new Error('window.BC_STOREFRONT_TOKEN not found');
			return token;
		} catch (err) {
			lastErr = err instanceof Error ? err : new Error(String(err));
		} finally {
			await page.close();
		}
	}
	throw new Error(
		`Could not find token — tried ${STORE_URL} twice: ${lastErr?.message ?? 'unknown error'}`
	);
}

// ---------------------------------------------------------------------------
// Shared GraphQL fetch helper
// ---------------------------------------------------------------------------

/** Return the full JSON — GraphQL responses are shapeless at compile time. */
type GqlResponseBody = { data?: unknown; errors?: { message: string }[] };

export async function gqlFetch(token: string, query: string): Promise<GqlResponseBody> {
	const res = await fetch(GRAPHQL_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ query })
	});

	if (!res.ok) throw new Error(`BC GraphQL ${res.status}: ${await res.text()}`);

	const json = (await res.json()) as GqlResponseBody;
	if (json.errors?.length) {
		throw new Error(`BC GraphQL errors: ${JSON.stringify(json.errors)}`);
	}
	return json;
}

// ---------------------------------------------------------------------------
// Brand cache — lazy load + persist
// ---------------------------------------------------------------------------

let _brandCache: Map<number, string> | null = null;

function loadBrandCache(): Map<number, string> {
	if (_brandCache) return _brandCache;

	_brandCache = new Map<number, string>();

	if (existsSync(BRANDS_CACHE_PATH)) {
		const raw = JSON.parse(readFileSync(BRANDS_CACHE_PATH, 'utf-8')) as Record<
			number | string,
			string
		>;
		for (const [id, name] of Object.entries(raw)) {
			_brandCache.set(Number(id), name);
		}
	}

	return _brandCache;
}

function persistBrandCache(cache: Map<number, string>): void {
	writeFileSync(BRANDS_CACHE_PATH, JSON.stringify(Object.fromEntries(cache), null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Category tree helpers
// ---------------------------------------------------------------------------

export type CategoryNode = { name: string; path: string; parentId?: number };

/** @internal -- exported only for testing. */
export function flattenCategoryTree(
	nodes: CategoryTreeNode[],
	parentId: number | undefined
): Map<number, CategoryNode> {
	const flat = new Map<number, CategoryNode>();
	for (const node of nodes) {
		const entry: CategoryNode = { name: node.name, path: node.path, parentId };
		flat.set(node.entityId, entry);
		if (node.children?.length) {
			const childFlat = flattenCategoryTree(node.children, node.entityId);
			for (const [id, c] of childFlat) flat.set(id, c);
		}
	}
	return flat;
}

// ---------------------------------------------------------------------------
// Category cache — lazy load + persist
// ---------------------------------------------------------------------------

let _categoryCache: Map<number, CategoryNode> | null = null;

function loadCategoryCache(): Map<number, CategoryNode> {
	if (_categoryCache) return _categoryCache;

	_categoryCache = new Map<number, CategoryNode>();

	if (existsSync(CATEGORIES_CACHE_PATH)) {
		const raw = JSON.parse(readFileSync(CATEGORIES_CACHE_PATH, 'utf-8')) as Record<
			number | string,
			{ name: string; path: string; parentId?: number }
		>;
		for (const [id, node] of Object.entries(raw)) {
			_categoryCache.set(Number(id), node);
		}
	}

	return _categoryCache;
}

function persistCategoryCache(cache: Map<number, CategoryNode>): void {
	writeFileSync(CATEGORIES_CACHE_PATH, JSON.stringify(Object.fromEntries(cache), null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Shared product lookup — populates both caches in one query
// ---------------------------------------------------------------------------

/**
 * Fetch brand + categories for a product by SKU and write both into their
 * respective disk caches. Called only on a cache miss; subsequent lookups for
 * the same brand/category IDs hit the in-memory map and never touch the API.
 */
async function fetchAndCacheProductData(sku: string): Promise<void> {
	const token = await getToken();
	const query = `{
  site {
    product(sku: "${sku}") {
      brand { entityId name }
      categories {
        edges {
          node { entityId name path }
        }
      }
    }
  }
}`;
	const res = await gqlFetch(token, query);
	const data = (res.data ?? {}) as ProductDataResult;
	if (!data.site.product) throw new Error(`Product "${sku}" not found in BigCommerce`);

	const { brand, categories } = data.site.product;

	const brandCache = loadBrandCache();
	if (brand) {
		brandCache.set(brand.entityId, brand.name);
		persistBrandCache(brandCache);
	}

	const categoryCache = loadCategoryCache();
	for (const { node } of categories.edges) {
		categoryCache.set(node.entityId, { name: node.name, path: node.path });
	}
	persistCategoryCache(categoryCache);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up a brand name by its BC entity ID.
 *
 * Served from disk cache (registry/bc-brands.json) when available. On a miss,
 * the product is fetched by SKU — which also warms the category cache — so
 * brand and category lookups for the same product share a single API call.
 */
export async function getBrandName(brandId: number, sku?: string): Promise<string | undefined> {
	const cache = loadBrandCache();
	if (cache.has(brandId)) return cache.get(brandId);

	if (!sku) return undefined;

	await fetchAndCacheProductData(sku);
	return cache.get(brandId);
}

/** Result of resolving category IDs — names for LLM context, keptIds for the import CSV. */
export interface CategoryResolution {
	names: string[];
	keptIds: number[]; // IDs that exist in BigCommerce (survived removal prompt)
}

/**
 * Resolve names for a list of category IDs.
 *
 * Served from disk cache (registry/bc-categories.json) when available. On a
 * miss, the product is fetched by SKU — which also warms the brand cache — so
 * brand and category lookups for the same product share a single API call.
 *
 * When `onMissing` is provided, unresolved IDs are resolved interactively (user
 * selects which to keep). The returned `keptIds` reflect what was actually kept
 * so the import CSV can be updated without touching source data.
 *
 * Only throws if the product ends up with zero valid categories after resolution.
 */
export async function getCategoryNames(
	categoryIds: number[],
	sku?: string,
	onMissing?: MissingCategoryResolver
): Promise<CategoryResolution> {
	const cache = loadCategoryCache();

	// Step 1: check all source IDs against disk cache. If everything found, return immediately.
	const allInCache = categoryIds.every((id) => cache.has(id));
	if (allInCache) {
		return { names: categoryIds.map((id) => cache.get(id)!.name), keptIds: [...categoryIds] };
	}

	// Step 2: fetch from BigCommerce to update the cache with this product's actual categories.
	if (!sku) {
		throw new Error(
			`Category IDs [${categoryIds.filter((id) => !cache.has(id)).join(', ')}] not in cache and no SKU provided for lookup`
		);
	}

	await fetchAndCacheProductData(sku);

	// Step 3: after the fetch, check which source CSV IDs are STILL missing.
	// These are genuinely unavailable — they don't belong to this product on BC.
	const trulyUnavailable = categoryIds.filter((id) => !cache.has(id));

	if (trulyUnavailable.length > 0 && onMissing) {
		const keptIds = await onMissing(trulyUnavailable, sku);
		if (keptIds.length === 0) {
			// User removed all → nothing left, will error below
		} else if (keptIds.length < trulyUnavailable.length) {
			// Some were removed — remove from cache so they don't appear in names or keptIds
			trulyUnavailable.forEach((id) => {
				if (!keptIds.includes(id)) cache.delete(id);
			});
		}
	} else if (trulyUnavailable.length > 0 && !onMissing) {
		throw new Error(
			`Category IDs [${trulyUnavailable.join(', ')}] not found among categories for "${sku}"`
		);
	}

	const keptIds = categoryIds.filter((id) => cache.has(id));
	if (keptIds.length === 0) {
		throw new Error(`Product "${sku}" has no valid categories — cannot proceed`);
	}

	return {
		names: keptIds.map((id) => cache.get(id)!.name),
		keptIds
	};
}
