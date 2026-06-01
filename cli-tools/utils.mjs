/**
 * Shared utilities for cli-tools image scripts.
 */

// Swap BC CDN size variant to largest pre-generated tier (1280x1280).
// e.g. filename.1777446497.386.513.jpg?c=1  →  filename.1777446497.1280.1280.jpg?c=1
export function normalizeBcCdnUrl(url) {
	if (!url.includes('bigcommerce.com')) return url;
	return url.replace(/\.\d+\.\d+(\.(?:jpe?g|png|gif|webp))(\?.*)?$/i, '.1280.1280$1$2');
}

export function toKebab(str) {
	return str
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

// Options format: "Type=Dropdown|Name=Color|Value=Natural|Type=Dropdown|Name=Neck|Value=Maple"
export function parseVariantValues(options) {
	return (options || '')
		.split('|')
		.filter((p) => p.startsWith('Value='))
		.map((p) => p.slice(6).trim().toLowerCase());
}

export function extFromUrl(url) {
	const match = url.split('?')[0].match(/\.(jpe?g|png|gif|webp)$/i);
	if (!match) return '.jpg';
	return match[0].toLowerCase() === '.jpeg' ? '.jpg' : match[0].toLowerCase();
}

// Build the export filename for a BC check report row.
// Variant images: {kebab-product-name}_{value1}_{value2}.{ext}
// Internal images: {kebab-product-name}_{imageId}.{ext}
export function buildExportImageName(row) {
	const base = toKebab(row.productName || '');
	const ext = extFromUrl(row.URL || '');
	if (row.sourceColumn === 'Variant Image URL') {
		const values = parseVariantValues(row.options || '');
		const suffix = values.length ? '_' + values.join('_') : '';
		return `${base}${suffix}${ext}`;
	}
	return `${base}_${row.imageId}${ext}`;
}

// Run `fn` over all `items` with at most `concurrency` in-flight at once.
// Reports progress to stdout every `reportEvery` completions.
export async function processWithConcurrency(items, fn, concurrency, reportEvery = 50) {
	const results = Array.from({ length: items.length });
	let next = 0;
	let completed = 0;

	async function worker() {
		while (next < items.length) {
			const i = next++;
			results[i] = await fn(items[i]);
			completed++;
			if (completed % reportEvery === 0 || completed === items.length) {
				process.stdout.write(`  ${completed}/${items.length} done\n`);
			}
		}
	}

	await Promise.all(Array.from({ length: concurrency }, worker));
	return results;
}
