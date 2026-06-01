#!/usr/bin/env node
/**
 * Check if images at URLs are square, and detect their type.
 *
 * Supports two input formats (auto-detected by column names):
 *
 * BC export mode — full BigCommerce product export CSV:
 *   Checks "Variant Image URL" and "Internal Image URL (Export)" columns.
 *   Output columns: productId, productSku, productName, imageId, sourceColumn,
 *                   URL, isSquare, imageType, width, height
 *
 * Legacy mode — simple CSV with ID and URL columns:
 *   Output columns: (original columns) + isSquare, imageType, width, height
 *
 * Usage:
 *   node checkSquareImages.mjs input.csv output.csv
 *   node checkSquareImages.mjs input.csv output.csv --workers 20
 *
 * Dependencies:
 *   npm install image-size csv-parse csv-stringify
 */

import fs from 'fs';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import imageSize from 'image-size';
import { normalizeBcCdnUrl, processWithConcurrency } from './utils.mjs';

export { normalizeBcCdnUrl };

// --- Fetch image bytes (streaming, stops early once dimensions are detected) ---
export function fetchImageBytes(url, redirectCount = 0) {
	return new Promise((resolve, reject) => {
		if (redirectCount > 5) return reject(new Error('Too many redirects'));

		const protocol = url.startsWith('https') ? https : http;
		const MAX_BYTES = 5 * 1024 * 1024; // 5MB cap

		const req = protocol.get(url, { timeout: 10000 }, (res) => {
			if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
				return fetchImageBytes(res.headers.location, redirectCount + 1)
					.then(resolve)
					.catch(reject);
			}
			if (res.statusCode !== 200) {
				return reject(new Error(`HTTP ${res.statusCode}`));
			}

			const chunks = [];
			let total = 0;

			res.on('data', (chunk) => {
				chunks.push(chunk);
				total += chunk.length;

				// Try to detect dimensions early — abort once we have them
				try {
					const buf = Buffer.concat(chunks);
					const result = imageSize(buf);
					if (result?.width && result?.height) {
						req.destroy();
						resolve(buf);
					}
				} catch {
					// Not enough bytes yet — keep going
				}

				if (total > MAX_BYTES) {
					req.destroy();
					reject(new Error('Exceeded 5MB without detecting dimensions'));
				}
			});

			res.on('end', () => resolve(Buffer.concat(chunks)));
			res.on('error', reject);
		});

		req.on('timeout', () => {
			req.destroy();
			reject(new Error('Timeout'));
		});
		req.on('error', reject);
	});
}

// --- Check a single row ---
export async function checkSquare(row) {
	const url = (row.URL || '').trim();
	if (!url) {
		return { ...row, isSquare: 'error: no URL', imageType: '', width: '', height: '' };
	}

	const fetchUrl = normalizeBcCdnUrl(url);

	try {
		const buf = await fetchImageBytes(fetchUrl);
		const { width, height, type } = imageSize(buf);
		return {
			...row,
			URL: fetchUrl,
			isSquare: width === height ? 'TRUE' : 'FALSE',
			imageType: type ?? '',
			width: width ?? '',
			height: height ?? ''
		};
	} catch (err) {
		return {
			...row,
			URL: fetchUrl,
			isSquare: `error: ${err.message}`,
			imageType: '',
			width: '',
			height: ''
		};
	}
}

const BC_URL_COLUMNS = ['Variant Image URL', 'Internal Image URL (Export)'];

// Flatten a BC export into one check-item per non-empty URL.
// Tracks the current product context (ID/SKU/Name) from Product rows so that
// Image rows — which carry the actual URLs but no product identifiers — can be
// annotated with their parent product.
export function flattenBcRows(rows) {
	const items = [];
	let currentProduct = { ID: '', SKU: '', Name: '' };

	for (const row of rows) {
		if (row.Item === 'Product') {
			currentProduct = { ID: row.ID, SKU: row.SKU, Name: row.Name };
		}

		for (const col of BC_URL_COLUMNS) {
			const url = (row[col] || '').trim();
			if (url) {
				items.push({
					productId: currentProduct.ID,
					productSku: currentProduct.SKU,
					productName: currentProduct.Name,
					imageId: row.ID,
					sourceColumn: col,
					options: row.Options || '',
					URL: url
				});
			}
		}
	}

	return items;
}

// --- Main ---
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const args = process.argv.slice(2);
	const workerFlag = args.indexOf('--workers');
	const CONCURRENCY = workerFlag !== -1 ? parseInt(args[workerFlag + 1], 10) : 10;
	const positional = args.filter(
		(a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--workers'
	);
	const [inputPath, outputPath] = positional;

	if (!inputPath || !outputPath) {
		console.error('Usage: node checkSquareImages.mjs <input.csv> <output.csv> [--workers N]');
		process.exit(1);
	}

	const inputRaw = fs.readFileSync(inputPath, 'utf8');
	const rows = parse(inputRaw, { columns: true, skip_empty_lines: true });

	const firstRowKeys = Object.keys(rows[0]);
	const isBcExport = BC_URL_COLUMNS.some((col) => firstRowKeys.includes(col));

	let checkItems;
	let headers;

	if (isBcExport) {
		console.log('Detected BigCommerce export format.');
		checkItems = flattenBcRows(rows);
		headers = [
			'productId',
			'productSku',
			'productName',
			'imageId',
			'sourceColumn',
			'options',
			'URL',
			'isSquare',
			'imageType',
			'width',
			'height'
		];
	} else {
		checkItems = rows;
		headers = [...firstRowKeys];
		if (!headers.includes('isSquare')) headers.push('isSquare');
		if (!headers.includes('imageType')) headers.push('imageType');
		if (!headers.includes('width')) headers.push('width');
		if (!headers.includes('height')) headers.push('height');
	}

	console.log(`Processing ${checkItems.length} URLs with ${CONCURRENCY} workers...`);

	const results = await processWithConcurrency(checkItems, checkSquare, CONCURRENCY);

	const output = stringify(results, { header: true, columns: headers });
	fs.writeFileSync(outputPath, output, 'utf8');

	const errors = results.filter((r) => String(r.isSquare).startsWith('error'));
	const notSquare = results.filter((r) => r.isSquare === 'FALSE');

	console.log(`\nDone! Output written to: ${outputPath}`);
	console.log(
		`  Total: ${results.length} | Not square: ${notSquare.length} | Errors: ${errors.length}`
	);

	if (isBcExport) {
		const byColumn = {};
		for (const r of results) {
			byColumn[r.sourceColumn] ??= { total: 0, notSquare: 0, errors: 0 };
			byColumn[r.sourceColumn].total++;
			if (r.isSquare === 'FALSE') byColumn[r.sourceColumn].notSquare++;
			if (String(r.isSquare).startsWith('error')) byColumn[r.sourceColumn].errors++;
		}
		console.log('\nBy column:');
		for (const [col, stats] of Object.entries(byColumn)) {
			console.log(
				`  "${col}": ${stats.total} checked, ${stats.notSquare} not square, ${stats.errors} errors`
			);
		}
	}

	if (errors.length) {
		console.log('\nRows with errors:');
		errors.forEach((r) => {
			const id = r.imageId ?? r.ID ?? '?';
			console.log(`  imageId=${id}  ${r.isSquare}`);
		});
	}
}
