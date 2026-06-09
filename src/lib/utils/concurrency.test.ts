import { describe, it, expect } from 'vite-plus/test';
import { processWithConcurrency } from './concurrency';

describe('processWithConcurrency', () => {
	it('processes all items', async () => {
		const results = await processWithConcurrency([1, 2, 3, 4], async (x) => x * 2, 2);

		expect(results.sort((a, b) => a - b)).toEqual([2, 4, 6, 8]);
	});
});
