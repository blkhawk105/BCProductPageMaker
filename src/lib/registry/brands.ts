import brandsData from '../../../registry/brands.json' with { type: 'json' };

export type BrandEntry = {
	url: string;
	altUrls?: string[];
	cdn?: 'shopify' | 'bc' | 'proprietary';
	notes?: string;
};

export type BrandRegistry = Record<string, BrandEntry>;

const registry = brandsData as BrandRegistry;

export function getBrandUrl(name: string): string | undefined {
	return (registry[name] ?? registry[name.toLowerCase()])?.url;
}

export function getBrandEntry(name: string): BrandEntry | undefined {
	return registry[name] ?? registry[name.toLowerCase()];
}
