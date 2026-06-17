import { BC_COLUMNS } from './schema';
import type { ProductRecord } from './schema';

/**
 * Collect all Variant rows that follow `productRow` until the next Product row.
 *
 * Interleaved Image/Video rows are skipped naturally — only Item === 'Variant' rows
 * are collected.
 */
export function getVariantRows(
	allRows: ProductRecord[],
	productRow: ProductRecord
): ProductRecord[] {
	const start = allRows.indexOf(productRow);
	if (start === -1) return [];
	const variants: ProductRecord[] = [];
	for (let i = start + 1; i < allRows.length; i++) {
		const item = allRows[i][BC_COLUMNS.item];
		if (item === 'Product') break; // next product — stop
		if (item === 'Variant') variants.push(allRows[i]); // skip Image/Video rows
	}
	return variants;
}
