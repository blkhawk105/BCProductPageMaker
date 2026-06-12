import { describe, it, expect } from 'vite-plus/test';
import { getBrandUrl, getBrandEntry } from './brands.ts';

describe('getBrandUrl', () => {
	it('returns URL for a known brand', () => {
		expect(getBrandUrl('Yamaha')).toBe('https://usa.yamaha.com');
	});

	it('returns undefined for an unknown brand', () => {
		expect(getBrandUrl('Unknown Brand')).toBeUndefined();
	});
});

describe('getBrandEntry', () => {
	it('returns the full entry for a known brand', () => {
		const entry = getBrandEntry('Zildjian');

		expect(entry?.url).toBe('https://zildjian.com');
		expect(entry?.cdn).toBe('shopify');
	});
});
