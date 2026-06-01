#!/usr/bin/env node
/**
 * Prepare a BigCommerce product export CSV for image downloading.
 * Reads a BC product export CSV and outputs a download-ready CSV with:
 *   ID, URL, export_image_name
 *
 * Variant images:  {kebab-product-name}_{value1}_{value2}.{ext}
 * Internal images: {kebab-product-name}_{imageID}.{ext}
 *
 * Feed the output into downloadImages.mjs.
 *
 * Usage:
 *   node prepareImageExport.mjs input.csv output.csv
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { toKebab, parseVariantValues, extFromUrl } from './utils.mjs';

export { toKebab, parseVariantValues, extFromUrl };

// Transform a parsed BC export into download-ready rows.
export function buildImageRows(rows) {
	const output = [];
	let currentProductName = '';

	for (const row of rows) {
		if (row.Item === 'Product') {
			currentProductName = toKebab(row.Name || '');
			continue;
		}

		if (row.Item === 'Variant') {
			const url = (row['Variant Image URL'] || '').trim();
			if (!url) continue;

			const values = parseVariantValues(row.Options);
			const suffix = values.length ? '_' + values.join('_') : '';
			output.push({
				ID: row.ID,
				URL: url,
				export_image_name: `${currentProductName}${suffix}${extFromUrl(url)}`
			});
			continue;
		}

		if (row.Item === 'Image') {
			const url = (row['Internal Image URL (Export)'] || '').trim();
			if (!url) continue;

			output.push({
				ID: row.ID,
				URL: url,
				export_image_name: `${currentProductName}_${row.ID}${extFromUrl(url)}`
			});
		}
	}

	return output;
}

// --- Main ---
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const [, , inputPath, outputPath] = process.argv;

	if (!inputPath || !outputPath) {
		console.error('Usage: node prepareImageExport.mjs <input.csv> <output.csv>');
		process.exit(1);
	}

	const rows = parse(fs.readFileSync(inputPath, 'utf8'), {
		columns: true,
		skip_empty_lines: true
	});

	const output = buildImageRows(rows);

	fs.writeFileSync(
		outputPath,
		stringify(output, { header: true, columns: ['ID', 'URL', 'export_image_name'] }),
		'utf8'
	);

	const variantCount = output.filter((r) => !r.export_image_name.match(/_\d+\.\w+$/)).length;
	const imageCount = output.length - variantCount;

	console.log(`Done! ${output.length} images prepared → ${outputPath}`);
	console.log(`  Variant images:  ${variantCount}`);
	console.log(`  Internal images: ${imageCount}`);
}
