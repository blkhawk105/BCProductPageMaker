import { describe, it, expect } from 'vite-plus/test';
import { mergeCustomFields } from './writer';

describe('mergeCustomFields', () => {
	it('patches an existing field by name', () => {
		const existing = JSON.stringify([{ id: 1, name: 'brand', value: 'old' }]);
		const result = JSON.parse(mergeCustomFields(existing, [{ name: 'brand', value: 'new' }]));

		expect(result[0].id).toBe(1);
		expect(result[0].value).toBe('new');
	});

	it('appends a new field without id', () => {
		const existing = JSON.stringify([{ id: 1, name: 'brand', value: 'Fender' }]);
		const result = JSON.parse(mergeCustomFields(existing, [{ name: 'color', value: 'Sunburst' }]));

		expect(result).toHaveLength(2);
		expect(result[1].id).toBeUndefined();
		expect(result[1].name).toBe('color');
	});

	it('handles empty existing gracefully', () => {
		const result = JSON.parse(mergeCustomFields('', [{ name: 'brand', value: 'Gibson' }]));

		expect(result).toHaveLength(1);
	});
});
