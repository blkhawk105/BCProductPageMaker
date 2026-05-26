#!/usr/bin/env node
/**
 * Check if images at URLs are square, and detect their type.
 * Reads a CSV with columns: ID, URL, isSquare (and optionally imageType)
 * Fills in the isSquare and imageType columns and writes output CSV.
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
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import imageSize from 'image-size';

// --- CLI args ---
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

// --- Swap the BigCommerce CDN size variant in the filename to the largest available (1280x1280).
//     BC/Akamai pre-generates fixed size tiers; this store has .386.513 (thumbnail) and
//     .1280.1280 (zoom). Anything larger 404s.
//     e.g. filename.1777446497.386.513.jpg?c=1  →  filename.1777446497.1280.1280.jpg?c=1
function normalizeBcCdnUrl(url) {
	if (!url.includes('bigcommerce.com')) return url;
	return url.replace(/\.\d+\.\d+(\.(?:jpe?g|png|gif|webp))(\?.*)?$/i, '.1280.1280$1$2');
}

// --- Fetch image bytes (streaming, stops early once dimensions are detected) ---
function fetchImageBytes(url, redirectCount = 0) {
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
async function checkSquare(row) {
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

// --- Concurrency pool ---
async function processWithConcurrency(items, fn, concurrency) {
	const results = Array.from({ length: items.length });
	let next = 0;
	let completed = 0;

	async function worker() {
		while (next < items.length) {
			const i = next++;
			results[i] = await fn(items[i]);
			completed++;
			if (completed % 50 === 0 || completed === items.length) {
				process.stdout.write(`  ${completed}/${items.length} done\n`);
			}
		}
	}

	await Promise.all(Array.from({ length: concurrency }, worker));
	return results;
}

// --- Main ---
const inputRaw = fs.readFileSync(inputPath, 'utf8');
const rows = parse(inputRaw, { columns: true, skip_empty_lines: true });

const headers = Object.keys(rows[0]);
if (!headers.includes('isSquare')) headers.push('isSquare');
if (!headers.includes('imageType')) headers.push('imageType');
if (!headers.includes('width')) headers.push('width');
if (!headers.includes('height')) headers.push('height');

console.log(`Processing ${rows.length} rows with ${CONCURRENCY} workers...`);

const results = await processWithConcurrency(rows, checkSquare, CONCURRENCY);

const output = stringify(results, { header: true, columns: headers });
fs.writeFileSync(outputPath, output, 'utf8');

const errors = results.filter((r) => String(r.isSquare).startsWith('error'));
console.log(`\nDone! Output written to: ${outputPath}`);
console.log(`  Total: ${results.length} | Errors: ${errors.length}`);
if (errors.length) {
	console.log('\nRows with errors:');
	errors.forEach((r) => console.log(`  ID=${r.ID ?? '?'}  ${r.isSquare}`));
}
