import { BC_COLUMNS } from '$lib/csv/schema';
import type { ProductRecord } from '$lib/csv/schema';
import { parseOptions } from '$lib/csv/parse-options';

export type ProductOption = { name: string; value: string };

export type ProductContext = {
	name: string;
	sku: string;
	brandName: string;
	upc?: string;
	options?: ProductOption[];
};

/**
 * Build a grounded ProductContext from CSV rows and the resolved brand name.
 * Options are deduplicated across all variant rows.
 */
export function buildProductContext(
	product: ProductRecord,
	variantRows: ProductRecord[],
	brandName: string
): ProductContext {
	const allVariantOptions = variantRows.flatMap((r) => parseOptions(r[BC_COLUMNS.options] ?? ''));
	const seen = new Set<string>();
	const options = allVariantOptions.filter((o) => {
		const key = `${o.name}::${o.value}`;
		return seen.has(key) ? false : (seen.add(key), true);
	});
	return {
		name: product[BC_COLUMNS.name] ?? '',
		sku: product[BC_COLUMNS.sku] ?? '',
		brandName,
		upc: product['UPC/EAN'] || undefined,
		options: options.length > 0 ? options : undefined
	};
}

/**
 * Format a ProductContext as a markdown header block for inclusion in LLM user messages.
 */
export function formatProductContext(ctx: ProductContext): string {
	const lines = [`Brand: ${ctx.brandName}`, `Product name: ${ctx.name}`, `SKU: ${ctx.sku}`];
	if (ctx.upc) lines.push(`UPC/EAN: ${ctx.upc}`);
	if (ctx.options?.length) {
		lines.push('Variants:');
		ctx.options.forEach((o) => lines.push(`  ${o.name}: ${o.value}`));
	}
	return lines.join('\n');
}
