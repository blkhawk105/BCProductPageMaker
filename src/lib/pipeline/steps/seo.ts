import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { callLlm } from '$lib/api/llm';
import type { LlmProvider } from '$lib/api/llm';
import type { ProductRecord } from '$lib/csv/schema';

const SKILL_FILE = 'seo.md';

interface SeoResult {
	h1Name: string | null;
	pageTitle: string | null; // BC "Page Title" column value (mapped from title tag)
	metaDescription: string | null;
	searchKeywords: string | null;
	copyChanges: string | null;
}

export async function runSeo(product: ProductRecord, provider: LlmProvider): Promise<SeoResult> {
	const brand = product['Brand'] ?? '';
	const model = product['Model'] ?? '';
	const sku = product['SKU'] ?? '';

	if (!brand || !model) {
		throw new Error(`Missing Brand or Model for SEO step: ${JSON.stringify(product)}`);
	}

	const outputDir = join('output', brand, model, sku);
	const descriptionPath = join(outputDir, 'product-description.md');

	// Check that product-description.md exists (required by skill)
	if (!existsSync(descriptionPath)) {
		throw new Error(
			`product-description.md not found at ${descriptionPath} — run product-copy first`
		);
	}

	const descriptionText = readFileSync(descriptionPath, 'utf-8');

	// Also read specs for keyword context
	const featuresPath = join(outputDir, 'product-features.md');
	let featuresText = '';
	if (existsSync(featuresPath)) {
		featuresText = readFileSync(featuresPath, 'utf-8');
	}

	const userMessage = [
		`Brand: ${brand}`,
		`Model: ${model}`,
		`SKU: ${sku}`,
		'',
		'Product copy:',
		descriptionText,
		featuresText ? `\nSpec table:\n${featuresText}` : ''
	].join('\n');

	const result = await callLlm(SKILL_FILE, userMessage, provider);

	// Parse the SEO block from the output to extract structured data
	const seoData = parseSeoBlock(result);

	// Build the SEO block text for appending/appending
	const seoBlock = buildSeoBlock(seoData);

	// Append (or replace existing) the SEO block in product-description.md
	const updatedContent = appendOrReplaceSeoBlock(descriptionText, seoBlock);
	writeFileSync(descriptionPath, updatedContent, 'utf-8');

	return seoData;
}

interface ParsedSeo {
	h1Name: string | null;
	pageTitle: string | null; // BC "Page Title" column value (mapped from title tag)
	metaDescription: string | null;
	searchKeywords: string | null;
	copyChanges: string | null;
	keywordAudit: string | null;
}

function parseSeoBlock(text: string): ParsedSeo {
	const seoData: ParsedSeo = {
		h1Name: null,
		pageTitle: null,
		metaDescription: null,
		searchKeywords: null,
		copyChanges: null,
		keywordAudit: null
	};

	const lines = text.split('\n');
	let section: string | null = null;

	for (const line of lines) {
		const trimmed = line.trim();

		if (/^## Copy Changes$/i.test(trimmed)) {
			section = 'copyChanges';
			continue;
		}
		if (/^## Product Name \(H1\)$/i.test(trimmed)) {
			section = 'h1Name';
			continue;
		}
		if (/^## Title Tag$/i.test(trimmed)) {
			section = 'pageTitle';
			continue;
		}
		if (/^## Meta Description$/i.test(trimmed)) {
			section = 'metaDescription';
			continue;
		}
		if (/^## On-Site Search Keywords$/i.test(trimmed)) {
			section = 'searchKeywords';
			continue;
		}
		if (/^## Keyword Audit$/i.test(trimmed)) {
			section = 'keywordAudit';
			continue;
		}

		// Skip the heading line itself, collect content
		if (section && !trimmed.startsWith('###') && trimmed.length > 0 && !trimmed.startsWith('---')) {
			const current = seoData[section as keyof ParsedSeo] ?? '';
			seoData[section as keyof ParsedSeo] = current ? `${current}\n${trimmed}` : trimmed;
		}

		// New section heading starts — stop collecting previous section
		if (
			/^##\s/.test(trimmed) &&
			!/^(Copy Changes|Product Name \(H1\)|Title Tag|Meta Description|On-Site Search Keywords|Keyword Audit)$/i.test(
				trimmed
			)
		) {
			section = null;
		}
	}

	return seoData;
}

function buildSeoBlock(seoData: ParsedSeo): string {
	let block = '\n---\n\n## SEO — ' + new Date().toISOString().slice(0, 10) + '\n\n';

	if (seoData.copyChanges) {
		block += '### Copy Changes\n\n' + seoData.copyChanges + '\n\n';
	}

	if (seoData.h1Name) {
		block += '### Product Name (H1)\n\n' + seoData.h1Name + '\n\n';
	}

	if (seoData.pageTitle) {
		block += '### Title Tag\n\n' + seoData.pageTitle + '\n\n';
	}

	if (seoData.metaDescription) {
		block += '### Meta Description\n\n' + seoData.metaDescription + '\n\n';
	}

	if (seoData.searchKeywords) {
		block += '### On-Site Search Keywords\n\n' + seoData.searchKeywords + '\n\n';
	}

	if (seoData.keywordAudit) {
		block += '### Keyword Audit\n\n' + seoData.keywordAudit + '\n\n';
	}

	return block;
}

function appendOrReplaceSeoBlock(existingContent: string, seoBlock: string): string {
	const existingSloHeader = /## SEO — \d{4}-\d{2}-\d{2}/;
	if (existingSloHeader.test(existingContent)) {
		// Replace the existing SEO block (idempotency)
		const match = existingContent.match(/(.*?)(## SEO — \d{4}-\d{2}-\d{2}.*)/s);
		if (match) {
			return match[1].replace(/\n+$/, '') + '\n\n' + seoBlock;
		}
	}

	// No existing SEO block — append
	if (existingContent.endsWith('\n')) {
		return existingContent + seoBlock;
	}
	return existingContent + '\n\n' + seoBlock;
}
