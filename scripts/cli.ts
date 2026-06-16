/**
 * CLI entry point for ProductPageMaker.
 *
 * Usage:
 *   tsx scripts/cli.ts <path-to-bc-export.csv> [--provider ollama|lm-studio] [--model <name>] [--host <hostname>]
 */

import { checkbox } from '@inquirer/prompts';
import { parseExportCSV } from '../src/lib/csv/parser.ts';
import { writeDiffCSV } from '../src/lib/csv/writer.ts';
import { runPipeline } from '../src/lib/pipeline/orchestrator.ts';
import { closeBrowser } from '../src/lib/api/browser.ts';
import { BC_COLUMNS } from '../src/lib/csv/schema.ts';
import { createProvider } from '../src/lib/api/llm.ts';
import type { ProviderConfig } from '../src/lib/api/llm.ts';

// TypeScript TS2591: process is not visible in scripts/ because node globals
// aren't loaded there (the project extends SvelteKit's tsconfig which doesn't
// reference @types/node).  Pull them in via triple-slash so the checker
// accepts `process` without needing an ambient re-declaration.
/// <reference types="node" />

// ---------------------------------------------------------------------------
// CLI arg parsing
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): { csvPath: string; providerConfig: ProviderConfig } {
	const args = argv.slice(2);

	// First non-flag argument is the CSV path
	const csvPath = args.find((a) => !a.startsWith('--'));
	if (!csvPath) {
		console.error(
			'Usage: tsx scripts/cli.ts <path-to-bc-export.csv> [--provider ollama|lm-studio] [--model <name>] [--host <hostname>]'
		);
		process.exit(1);
	}

	const get = (flag: string): string | undefined => {
		const i = args.indexOf(`--${flag}`);
		return i !== -1 ? args[i + 1] : undefined;
	};

	const providerConfig: ProviderConfig = {
		provider: ((get('provider') ?? process.env.LLM_PROVIDER) ||
			'ollama') as ProviderConfig['provider'],
		model: get('model'),
		host: get('host')
	};

	return { csvPath, providerConfig };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { csvPath, providerConfig } = parseArgs(process.argv);
const provider = createProvider(providerConfig);

const products = parseExportCSV(csvPath);
console.log(`\nLoaded ${products.length} products from ${csvPath}`);
console.log(
	`Provider: ${providerConfig.provider}${providerConfig.model ? ` (${providerConfig.model})` : ''}\n`
);

const selected = await checkbox({
	message: 'Select products to process:',
	choices: products.map((p) => ({
		name: `${p[BC_COLUMNS.name]} (${p[BC_COLUMNS.sku]}) — Description: ${p[BC_COLUMNS.description] ? 'present' : 'empty'}`,
		value: p
	}))
});

if (selected.length === 0) {
	console.log('No products selected. Exiting.');
	process.exit(0);
}

const results = [];
for (const product of selected) {
	const productName = product[BC_COLUMNS.name];
	console.log(`\nRunning pipeline for: ${productName}`);
	results.push(await runPipeline(product, provider));
}

await closeBrowser();

const timestamp = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '');
const outputPath = `output/bc-import-${timestamp}.csv`;
writeDiffCSV(results, outputPath);

console.log(`\nOutput written to: ${outputPath} (${results.length} product(s))`);
