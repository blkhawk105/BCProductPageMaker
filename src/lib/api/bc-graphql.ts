import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { getBrowser } from '$lib/api/browser';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoreWindow extends Window {
	BC_STOREFRONT_TOKEN?: string;
}

interface PageInfo {
	hasNextPage: boolean;
	endCursor: string;
}

interface BrandEdge {
	node: { entityId: number; name: string };
}

interface BrandsResult {
	site: { brands: { pageInfo: PageInfo; edges: BrandEdge[] } };
}

interface CategoryTreeNode {
	entityId: number;
	name: string;
	path: string;
	children?: CategoryTreeNode[];
}

interface CategoryTreeResult {
	site: { categoryTree: CategoryTreeNode | CategoryTreeNode[] };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRAPHQL_ENDPOINT = 'https://store-10xdzq6qo9.mybigcommerce.com/graphql';
const STORE_URL = 'https://www.tedbrownmusic.com';
const BRANDS_CACHE_PATH = 'registry/bc-brands.json';
const CATEGORIES_CACHE_PATH = 'registry/bc-categories.json';
const SHOP_BY_CATEGORY_ROOT_ID = 30;
const FIRST_PAGE_SIZE = 50;

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

async function gqlFetch(token: string, query: string): Promise<GqlResponseBody> {
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

async function loadBrandCache(): Promise<Map<number, string>> {
	if (_brandCache) return _brandCache;

	// Try disk first.
	if (existsSync(BRANDS_CACHE_PATH)) {
		const raw = JSON.parse(readFileSync(BRANDS_CACHE_PATH, 'utf-8')) as Record<
			number | string,
			string
		>;
		_brandCache = new Map<number, string>();
		for (const [id, name] of Object.entries(raw)) {
			_brandCache.set(Number(id), name);
		}
		return _brandCache;
	}

	// Cold start — fetch from API.
	const token = await getToken();
	const map = new Map<number, string>();
	let after: string | null = null;
	do {
		const cursorArg = after ? `, after: "${after}"` : '';
		const query = `{ site { brands(first: ${FIRST_PAGE_SIZE}${cursorArg}) {
      pageInfo { hasNextPage endCursor }
      edges { node { entityId name } }
    } } }`;
		const res = await gqlFetch(token, query);
		const data = (res.data ?? {}) as BrandsResult;
		const page = data.site.brands;
		for (const { node } of page.edges) map.set(node.entityId, node.name);
		after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
	} while (after);

	_brandCache = map;
	writeFileSync(BRANDS_CACHE_PATH, JSON.stringify(Object.fromEntries(map), null, 2), 'utf-8');
	return _brandCache;
}

export async function getBrandName(brandId: number): Promise<string | undefined> {
	const cache = await loadBrandCache();
	return cache.get(brandId);
}

// ---------------------------------------------------------------------------
// Category tree helpers
// ---------------------------------------------------------------------------

export type CategoryNode = { name: string; path: string; parentId?: number };

function flattenCategoryTree(
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

/**
 * Resolve the category tree from a BC Storefront API response.
 * categoryTree may be returned as:
 *   - A single node (object) with `children` arrays at each depth
 *   - An array of root-level nodes (when multiple top-level categories exist)
 * We recurse into children lists, building a flat Map keyed by entityId.
 */
function resolveCategoryTree(root: CategoryTreeNode | CategoryTreeNode[]): CategoryTreeNode[] {
	if (Array.isArray(root)) return root; // already the list we need

	// Single node — return its children if present, otherwise this node alone.
	return root.children?.length ? root.children : [root];
}

// ---------------------------------------------------------------------------
// Category cache — lazy load + persist
// ---------------------------------------------------------------------------

let _categoryCache: Map<number, CategoryNode> | null = null;

async function loadCategoryCache(): Promise<Map<number, CategoryNode>> {
	if (_categoryCache) return _categoryCache;

	// Try disk first.
	if (existsSync(CATEGORIES_CACHE_PATH)) {
		const raw = JSON.parse(readFileSync(CATEGORIES_CACHE_PATH, 'utf-8')) as Record<
			number | string,
			{ name: string; path: string; parentId?: number }
		>;
		_categoryCache = new Map<number, CategoryNode>();
		for (const [id, node] of Object.entries(raw)) {
			_categoryCache.set(Number(id), node);
		}
		return _categoryCache;
	}

	// Cold start — fetch the full category tree from BC.
	const token = await getToken();

	const query = `{ site { categoryTree {
    entityId name path children {
      entityId name path children {
        entityId name path children {
          entityId name path children {
            entityId name path children {
              entityId name path
            }
          }
        }
      }
    }
  } } }`;

	const res = await gqlFetch(token, query);
	const data = (res.data ?? {}) as CategoryTreeResult;
	const rawList = resolveCategoryTree(data.site.categoryTree);

	// Find the "Shop By Category" root (entityId === 30).
	let treeRoot: CategoryTreeNode | null = null;
	for (const node of rawList) {
		if (node.entityId === SHOP_BY_CATEGORY_ROOT_ID) {
			treeRoot = node;
			break;
		}
	}

	if (!treeRoot) {
		throw new Error(
			`Could not find "Shop By Category" node (entityId: ${SHOP_BY_CATEGORY_ROOT_ID}) in BC category tree`
		);
	}

	// Flatten starting from treeRoot.children (depth 1), with parentId = root's entityId.
	const children = treeRoot.children ?? [];
	const flat = flattenCategoryTree(children, treeRoot.entityId);

	_categoryCache = flat;
	writeFileSync(CATEGORIES_CACHE_PATH, JSON.stringify(Object.fromEntries(flat), null, 2), 'utf-8');
	return _categoryCache;
}

/**
 * Resolve names for a list of category IDs.
 * Throws on any unknown ID — no silent skipping.
 */
export async function getCategoryNames(categoryIds: number[]): Promise<string[]> {
	const cache = await loadCategoryCache();
	return categoryIds.map((id) => {
		const node = cache.get(id);
		if (!node) throw new Error(`Category ID ${id} not found in BC category registry`);
		return node.name;
	});
}
