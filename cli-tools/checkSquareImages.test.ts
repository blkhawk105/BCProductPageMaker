import { describe, it, expect } from 'vite-plus/test';
import { checkSquare } from './checkSquareImages.mjs';

describe('checkSquare', () => {
	it('returns an error result when URL is missing', async () => {
		const result = await checkSquare({ ID: '1', URL: '' });
		expect(result.isSquare).toBe('error: no URL');
		expect(result.imageType).toBe('');
		expect(result.width).toBe('');
		expect(result.height).toBe('');
	});

	it('returns an error result when URL is whitespace only', async () => {
		const result = await checkSquare({ ID: '1', URL: '   ' });
		expect(result.isSquare).toBe('error: no URL');
	});

	it('spreads the original row fields into the result', async () => {
		const row = { ID: '42', URL: '', extra: 'data' };
		const result = await checkSquare(row);
		expect(result.ID).toBe('42');
		expect(result.extra).toBe('data');
	});
});
