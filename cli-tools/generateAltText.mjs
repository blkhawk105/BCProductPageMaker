#!/usr/bin/env node
/**
 * Generate alt text for BC product images using a local Ollama vision model.
 * Writes results into the "Image Description" column of a BC import CSV.
 *
 * Usage:
 *   node generateAltText.mjs <images.csv> <import.csv> <images-dir/> <output.csv>
 *   node generateAltText.mjs <images.csv> <import.csv> <images-dir/> <output.csv> --model llava
 *   node generateAltText.mjs <images.csv> <import.csv> <images-dir/> <output.csv> --resume
 *   node generateAltText.mjs <images.csv> <import.csv> <images-dir/> <output.csv> --lm-studio
 *   node generateAltText.mjs <images.csv> <import.csv> <images-dir/> <output.csv> --lm-studio --host http://192.168.1.50:1234
 *
 * images.csv  — download manifest: ID, URL, export_image_name
 * import.csv  — BC product export/import CSV (must include "Image Description" column)
 * images-dir  — directory containing downloaded image files
 * output.csv  — destination for the updated BC import CSV
 *
 * --model <name>      Vision model name (default: llava)
 * --resume            Skip image IDs already recorded in the progress sidecar
 * --progress <file>   Path to the progress sidecar (default: <output.csv>.progress.json)
 * --lm-studio         Use LM Studio's OpenAI-compatible API instead of Ollama
 * --host <url>        Override the default host (Ollama: http://localhost:11434, LM Studio: http://localhost:1234)
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const DEFAULT_OLLAMA_HOST = 'http://localhost:11434';
const DEFAULT_LM_STUDIO_HOST = 'http://localhost:1234';
const SESSION_SIZE = 10;

const SYSTEM_PROMPT = `You are a product image analyst writing alt text for a musical instrument retailer's website.

For each image you receive, write a single line of alt text following these rules:
- Describe what is actually visible — do not describe what you expect based on a product name
- Include: brand name, model name/number, key visual details (angle, finish, background, any notable visible feature)
- Target length: 100–175 characters
- Do not start with "Image of", "Photo of", or "Picture of" — begin with the subject directly
- Do not use marketing language (stunning, beautiful, premium)
- For lifestyle shots: describe the product in its context, not just the context
- For detail shots: name the specific part or feature shown

Reply with ONLY the alt text — no explanation, no quotes, no punctuation beyond what the alt text itself needs.`;

// --- CLI args ---
const args = process.argv.slice(2);

function flag(name) {
	return args.includes(name);
}
function flagValue(name, defaultVal) {
	const i = args.indexOf(name);
	return i !== -1 ? args[i + 1] : defaultVal;
}

const FLAGS_WITH_VALUE = new Set(['--model', '--host', '--progress']);
const positional = args.filter((a, i) => !a.startsWith('--') && !FLAGS_WITH_VALUE.has(args[i - 1]));
const [imagesCsv, importCsv, imagesDir, outputCsv] = positional;
const MODEL = flagValue('--model', 'llava');
const RESUME = flag('--resume');
const LM_STUDIO = flag('--lm-studio');
const OLLAMA_BASE = flagValue(
	'--host',
	LM_STUDIO ? DEFAULT_LM_STUDIO_HOST : DEFAULT_OLLAMA_HOST
).replace(/\/$/, '');

if (!imagesCsv || !importCsv || !imagesDir || !outputCsv) {
	console.error(
		'Usage: node generateAltText.mjs <images.csv> <import.csv> <images-dir/> <output.csv> [--model llava] [--resume]'
	);
	process.exit(1);
}

if (fs.existsSync(outputCsv) && fs.statSync(outputCsv).isDirectory()) {
	console.error(`Error: output path is a directory: ${outputCsv}`);
	console.error('Provide a full file path, e.g.: output/import-with-alt.csv');
	process.exit(1);
}

const progressPath = flagValue('--progress', outputCsv + '.progress.json');

// --- Backend helpers ---
async function checkBackend() {
	const backend = LM_STUDIO ? 'LM Studio' : 'Ollama';
	try {
		const url = LM_STUDIO ? `${OLLAMA_BASE}/v1/models` : `${OLLAMA_BASE}/api/tags`;
		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();

		const available = LM_STUDIO
			? (data.data || []).map((m) => m.id)
			: (data.models || []).map((m) => m.name);

		const match = available.find((n) => n === MODEL || n.startsWith(MODEL + ':'));
		if (!match) {
			console.error(`Model "${MODEL}" not found. Available: ${available.join(', ') || '(none)'}`);
			process.exit(1);
		}
		console.log(`${backend} ready — ${OLLAMA_BASE} — model: ${match}`);
	} catch (err) {
		if (err.code === 'ECONNREFUSED') {
			console.error(`${backend} is not running at ${OLLAMA_BASE}`);
		} else {
			console.error(`Could not reach ${backend}: ${err.message}`);
		}
		process.exit(1);
	}
}

function mimeType(filename) {
	const ext = filename.split('.').pop().toLowerCase();
	return ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
}

function buildUserMessage(base64, filename) {
	if (LM_STUDIO) {
		return {
			role: 'user',
			content: [
				{ type: 'text', text: 'Write alt text for this product image.' },
				{ type: 'image_url', image_url: { url: `data:${mimeType(filename)};base64,${base64}` } }
			]
		};
	}
	return { role: 'user', content: 'Write alt text for this product image.', images: [base64] };
}

async function askModel(messages) {
	const url = LM_STUDIO ? `${OLLAMA_BASE}/v1/chat/completions` : `${OLLAMA_BASE}/api/chat`;
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ model: MODEL, stream: false, messages })
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const data = await res.json();
	return LM_STUDIO
		? (data.choices?.[0]?.message?.content?.trim() ?? '')
		: (data.message?.content?.trim() ?? '');
}

// --- Interactive prompt ---
function prompt(question) {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer);
		});
	});
}

// --- Progress sidecar ---
function loadProgress() {
	if (RESUME && fs.existsSync(progressPath)) {
		try {
			return new Set(JSON.parse(fs.readFileSync(progressPath, 'utf8')).completed ?? []);
		} catch {
			return new Set();
		}
	}
	return new Set();
}

function saveProgress(completed) {
	fs.writeFileSync(progressPath, JSON.stringify({ completed: [...completed] }, null, 2), 'utf8');
}

// --- Main ---
await checkBackend();

// Build ID → export_image_name map from download manifest
const imageRows = parse(fs.readFileSync(imagesCsv, 'utf8'), {
	columns: true,
	skip_empty_lines: true
});
const filenameById = new Map(imageRows.map((r) => [r.ID.trim(), r.export_image_name.trim()]));

// Parse import CSV, preserving column order
const importRows = parse(fs.readFileSync(importCsv, 'utf8'), {
	columns: true,
	skip_empty_lines: true
});
const headers = Object.keys(importRows[0]);

// Identify Image rows that need processing
const imageItems = importRows.filter((r) => r.Item === 'Image');
const total = imageItems.length;
console.log(`Found ${total} Image rows. Model: ${MODEL}${RESUME ? ' (resume mode)' : ''}\n`);

// Pre-flight: check all images exist on disk before starting
const missingFiles = imageItems
	.map((item) => {
		const id = item.ID?.trim();
		const filename = filenameById.get(id);
		if (!filename) return null;
		const filePath = path.join(imagesDir, filename);
		return fs.existsSync(filePath) ? null : { id, filename };
	})
	.filter(Boolean);

if (missingFiles.length > 0) {
	console.warn(`Warning: ${missingFiles.length} image(s) not found in ${imagesDir}:`);
	for (const { id, filename } of missingFiles) {
		console.warn(`  ID=${id}  ${filename}`);
	}
	const answer = await prompt('\nContinue anyway? (y/N) ');
	if (answer.trim().toLowerCase() !== 'y') {
		const save = await prompt('Save a CSV of missing images? (y/N) ');
		if (save.trim().toLowerCase() === 'y') {
			const reportPath = outputCsv.replace(/\.csv$/i, '.missing.csv');
			const reportContent = stringify(missingFiles, { header: true, columns: ['id', 'filename'] });
			fs.writeFileSync(reportPath, reportContent, 'utf8');
			console.log(`Missing images report saved → ${reportPath}`);
		}
		console.log('Aborted.');
		process.exit(0);
	}
	console.log('');
}

const completed = loadProgress();
if (RESUME) {
	console.log(`Resuming — ${completed.size} already done.\n`);
} else {
	// Fresh run: reset sidecar
	saveProgress(new Set());
}

// Build a lookup from ID to the mutable row object so we can write results in place
const rowById = new Map(importRows.map((r) => [r.ID?.trim(), r]));

// Process images one at a time
const systemMessage = { role: 'system', content: SYSTEM_PROMPT };
let messages = [systemMessage];
let sessionCount = 0;
let processed = 0;
const failures = [];

for (let i = 0; i < imageItems.length; i++) {
	const item = imageItems[i];
	const id = item.ID?.trim();
	const displayIndex = `[${i + 1}/${total}]`;

	if (RESUME && completed.has(id)) {
		console.log(`${displayIndex} Skipping ${id} (already done)`);
		continue;
	}

	// Session boundary
	if (sessionCount > 0 && sessionCount % SESSION_SIZE === 0) {
		const batchStart = i + 1;
		const batchEnd = Math.min(i + SESSION_SIZE, total);
		console.log(`\n--- New session (images ${batchStart}–${batchEnd}) ---\n`);
		messages = [systemMessage];
	}

	const filename = filenameById.get(id);
	if (!filename) {
		console.warn(`${displayIndex} ID ${id} not found in images CSV — skipping`);
		continue;
	}

	const filePath = path.join(imagesDir, filename);
	if (!fs.existsSync(filePath)) {
		console.warn(`${displayIndex} File not found: ${filePath} — skipping`);
		continue;
	}

	const base64 = fs.readFileSync(filePath).toString('base64');
	console.log(`${displayIndex} ${filename}`);

	const userMessage = buildUserMessage(base64, filename);

	let altText;
	let failed = false;
	try {
		altText = await askModel([...messages, userMessage]);
	} catch (err) {
		failed = true;
		const name = rowById.get(id)?.Name ?? '';
		failures.push({ ID: id, Name: name, filename, error: err.message });
		console.error(`  Error: ${err.message}\n`);
	}

	if (!failed) {
		console.log(`  → ${altText}\n`);
		const row = rowById.get(id);
		if (row) row['Image Description'] = altText;
		messages.push(userMessage, { role: 'assistant', content: altText });
		sessionCount++;
		processed++;
		completed.add(id);
		saveProgress(completed);
	}
}

// Write updated CSV preserving all rows and original column order
const outputCsvContent = stringify(importRows, { header: true, columns: headers });
fs.writeFileSync(outputCsv, outputCsvContent, 'utf8');

console.log(`\nDone! ${processed} processed → ${outputCsv}`);

if (failures.length > 0) {
	console.log(`\nFailed (${failures.length}):`);
	for (const f of failures) {
		console.log(`  ID=${f.ID}  ${f.filename}  — ${f.error}`);
	}
	const save = await prompt('\nSave a failure report CSV? (y/N) ');
	if (save.trim().toLowerCase() === 'y') {
		const reportPath = outputCsv.replace(/\.csv$/i, '.failures.csv');
		const reportContent = stringify(failures, {
			header: true,
			columns: ['ID', 'Name', 'filename', 'error']
		});
		fs.writeFileSync(reportPath, reportContent, 'utf8');
		console.log(`Failure report saved → ${reportPath}`);
	}
}
