import { describe, it, expect } from 'vite-plus/test';
import { parseOptions } from './parse-options';

describe('parseOptions', () => {
	it('returns [] for an empty string', () => {
		expect(parseOptions('')).toEqual([]);
	});

	it('parses a single option', () => {
		const result = parseOptions('Type=Dropdown|Name=Color|Value=Red');
		expect(result).toEqual([{ name: 'Color', value: 'Red' }]);
	});

	it('parses two options from a pipe-delimited string', () => {
		const result = parseOptions(
			'Type=Dropdown|Name=Color|Value=Red|Type=Dropdown|Name=Neck|Value=Maple'
		);
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({ name: 'Color', value: 'Red' });
		expect(result[1]).toEqual({ name: 'Neck', value: 'Maple' });
	});

	it('returns [] when Value= key is missing (malformed)', () => {
		const result = parseOptions('Type=Dropdown|Name=Color');
		expect(result).toEqual([]);
	});

	it('skips malformed segments and parses valid ones with extra pipes', () => {
		const result = parseOptions('Type=Dropdown||Name=Color|Value=Red');
		expect(result).toEqual([{ name: 'Color', value: 'Red' }]);
	});
});
