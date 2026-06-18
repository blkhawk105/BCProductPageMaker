import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const TEMPLATE = (brand: string, sku: string, reason: string) => `# Review Needed — ${brand} ${sku}

This product was skipped because the pipeline could not confirm its manufacturer product page.

**Reason:** ${reason}

**To resolve:**
1. Manually find the product page on the manufacturer's website
2. Confirm the URL is the dedicated page for this exact SKU
3. Re-run the pipeline

Running from hallucinated or unverified specs produces incorrect product listings.
`;

/**
 * Write a REVIEW-NEEDED.md flag file when a product is skipped.
 */
export function flagForReview(outputDir: string, brand: string, sku: string, reason: string): void {
	const reviewPath = join(outputDir, 'REVIEW-NEEDED.md');
	mkdirSync(outputDir, { recursive: true });
	writeFileSync(reviewPath, TEMPLATE(brand, sku, reason), 'utf-8');
}
