// All the columns in a BigCommerce product export that can be worked on
export const BC_COLUMNS = {
	brandId: 'Brand ID',
	categories: 'Categories',
	item: 'Item',
	id: 'ID',
	name: 'Name',
	sku: 'SKU',
	options: 'Options',
	inventoryTracking: 'Inventory Tracking',
	description: 'Description',
	customFields: 'Custom Fields',
	pageTitle: 'Page Title',
	metaDescription: 'Meta Description',
	searchKeywords: 'Search Keywords',
	mpn: 'Manufacturer Part Number',
	Weight: 'Weight:',
	Width: 'Width:',
	Height: 'Height:',
	Depth: 'Depth:',
	IsVisible: 'IsVisible:',
	IsFeatured: 'IsFeatured:'
} as const;

// One row from the BC export
export type ProductRecord = {
	[K in keyof typeof BC_COLUMNS]: string;
} & Record<string, string>; // This allows extra columns to pass through

// A parsed Custom Fields array entry
export type CustomField = {
	id?: number;
	name: string;
	value: string;
};

// The record produced by the pipeline.
// Item and ID are the only required values, but the caller must make sure there is at least one other,
// otherwise an import doesn't make sense.
export type DiffRecord = {
	item: string;
	id: string;
	brandId?: string;
	name?: string;
	sku?: string;
	options?: string;
	inventoryTracking?: string;
	categories?: string;
	description?: string;
	customFields?: CustomField[];
	pageTitle?: string;
	metaDescription?: string;
	searchKeywords?: string;
	mpn?: string;
	Weight?: string;
	Width?: string;
	Height?: string;
	Depth?: string;
	IsVisible?: string;
	IsFeatured?: string;
};
