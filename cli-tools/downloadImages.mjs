#!/usr/bin/env node
/**
 * Download max-resolution images from a CSV list.
 * Reads a CSV with columns: ID, URL, export_image_name
 * Normalizes BigCommerce CDN URLs to the largest available tier (1280x1280).
 * Saves each image as <output-dir>/<export_image_name>
 *
 * Usage:
 *   node downloadImages.mjs input.csv output-dir/
 *   node downloadImages.mjs input.csv output-dir/ --workers 5
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { normalizeBcCdnUrl, processWithConcurrency, buildExportImageName } from './utils.mjs';

export { normalizeBcCdnUrl, buildExportImageName };

// --- Download a URL to a file path ---
export function downloadToFile(url, dest, redirectCount = 0) {
	return new Promise((resolve, reject) => {
		if (redirectCount > 5) return reject(new Error('Too many redirects'));

		const protocol = url.startsWith('https') ? https : http;

		const req = protocol.get(url, { timeout: 30000 }, (res) => {
			if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
				return downloadToFile(res.headers.location, dest, redirectCount + 1)
					.then(resolve)
					.catch(reject);
			}
			if (res.statusCode !== 200) {
				return reject(new Error(`HTTP ${res.statusCode}`));
			}

			const out = fs.createWriteStream(dest);
			res.pipe(out);
			out.on('finish', () => out.close(resolve));
			out.on('error', reject);
			res.on('error', reject);
		});

		req.on('timeout', () => {
			req.destroy();
			reject(new Error('Timeout'));
		});
		req.on('error', reject);
	});
}

// --- Process a single row ---
// Accepts either legacy format (ID, URL, export_image_name) or BC check format
// (productId, productSku, productName, imageId, sourceColumn, options, URL).
export async function downloadRow(row, outputDir) {
	const isBcCheckFormat = 'productName' in row && 'sourceColumn' in row;
	const id = isBcCheckFormat ? (row.imageId || '').trim() : (row.ID || '').trim();
	const url = (row.URL || '').trim();
	const exportName = isBcCheckFormat
		? buildExportImageName(row)
		: (row.export_image_name || '').trim();

	if (!url) return { id, status: 'error: no URL', dest: '' };
	if (!id) return { id: '(no ID)', status: 'error: no ID', dest: '' };
	if (!exportName) return { id, status: 'error: no export_image_name', dest: '' };

	const fetchUrl = normalizeBcCdnUrl(url);
	const dest = path.join(outputDir, exportName);

	try {
		await downloadToFile(fetchUrl, dest);
		return { id, status: 'ok', dest };
	} catch (err) {
		try {
			fs.unlinkSync(dest);
		} catch {
			// ignore
		}
		return { id, status: `error: ${err.message}`, dest: '' };
	}
}

// --- Main ---
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const args = process.argv.slice(2);
	const workerFlag = args.indexOf('--workers');
	const CONCURRENCY = workerFlag !== -1 ? parseInt(args[workerFlag + 1], 10) : 5;
	const positional = args.filter(
		(a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--workers'
	);
	const [inputPath, outputDir] = positional;

	if (!inputPath || !outputDir) {
		console.error('Usage: node downloadImages.mjs <input.csv> <output-dir/> [--workers N]');
		process.exit(1);
	}

	fs.mkdirSync(outputDir, { recursive: true });

	const inputRaw = fs.readFileSync(inputPath, 'utf8');
	const rows = parse(inputRaw, { columns: true, skip_empty_lines: true });

	console.log(`Downloading ${rows.length} images with ${CONCURRENCY} workers → ${outputDir}`);

	const results = await processWithConcurrency(
		rows,
		(row) => downloadRow(row, outputDir),
		CONCURRENCY,
		10
	);

	const errors = results.filter((r) => r.status !== 'ok');
	console.log(
		`\nDone! ${results.length - errors.length}/${results.length} downloaded to: ${outputDir}`
	);
	if (errors.length) {
		console.log('\nFailed:');
		errors.forEach((r) => console.log(`  ID=${r.id}  ${r.status}`));
	}
}
