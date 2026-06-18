import { describe, it, expect } from 'vite-plus/test';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { flagForReview } from './review-queue';

const TEST_DIR = join('/tmp', 'bc-ppt-review-test-' + Date.now());

function cleanup() {
	if (existsSync(TEST_DIR)) {
		rmSync(TEST_DIR, { recursive: true, force: true });
	}
}

describe('flagForReview', () => {
	cleanup();

	it('creates the directory and writes REVIEW-NEEDED.md with correct content', () => {
		const outputDir = join(TEST_DIR, 'Yamaha', 'YTR-8310ZII');
		flagForReview(outputDir, 'Yamaha', 'YTR-8310ZII', 'No search input found on brand homepage');

		const reviewPath = join(outputDir, 'REVIEW-NEEDED.md');
		expect(existsSync(reviewPath)).toBe(true);

		const content = readFileSync(reviewPath, 'utf-8');
		expect(content).toContain('# Review Needed — Yamaha YTR-8310ZII');
		expect(content).toContain('No search input found on brand homepage');
		expect(content).toContain(
			'Running from hallucinated or unverified specs produces incorrect product listings.'
		);
	});

	it('writes to a different path for a different brand and SKU', () => {
		const outputDir = join(TEST_DIR, 'Zildjian', 'KCP2');
		flagForReview(
			outputDir,
			'Zildjian',
			'KCP2',
			'Page at https://zildjian.com/other-product does not contain SKU "KCP2" — may be wrong product or variant'
		);

		const reviewPath = join(outputDir, 'REVIEW-NEEDED.md');
		expect(existsSync(reviewPath)).toBe(true);

		const content = readFileSync(reviewPath, 'utf-8');
		expect(content).toContain('# Review Needed — Zildjian KCP2');
	});
});
