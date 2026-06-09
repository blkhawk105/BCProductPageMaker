import { describe, it, expect } from 'vite-plus/test';
import { normalizeBcCdnUrl } from './cdn';

describe('normalizeBcCdnUrl', () => {
	it('replaces size tier with 1280x1280', () => {
		const input =
			'https://cdn11.bigcommerce.com/s-abc/products/1/images/1/name.12345.386.513.jpg?c=1';
		const result = normalizeBcCdnUrl(input);

		expect(result).toContain('.1280.1280.jpg');
		expect(result).not.toContain('.386.513');
	});
});
