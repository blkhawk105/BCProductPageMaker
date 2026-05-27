import { describe, it, expect } from 'vite-plus/test';
import { toKebab, parseVariantValues, extFromUrl, buildImageRows } from './prepareImageExport.mjs';

describe('toKebab', () => {
	it('lowercases the string', () => {
		expect(toKebab('Hello World')).toBe('hello-world');
	});

	it('replaces spaces with hyphens', () => {
		expect(toKebab('foo bar baz')).toBe('foo-bar-baz');
	});

	it('replaces special characters with hyphens', () => {
		expect(toKebab('Fender CB-60SCE Acoustic/Electric & Bass')).toBe(
			'fender-cb-60sce-acoustic-electric-bass'
		);
	});

	it('collapses consecutive non-alphanumeric chars into a single hyphen', () => {
		expect(toKebab('foo  --  bar')).toBe('foo-bar');
	});

	it('strips leading and trailing hyphens', () => {
		expect(toKebab('  leading and trailing  ')).toBe('leading-and-trailing');
	});

	it('preserves numbers', () => {
		expect(toKebab('Gibson Les Paul 50s Standard')).toBe('gibson-les-paul-50s-standard');
	});

	it('handles an already-kebab string', () => {
		expect(toKebab('already-kebab')).toBe('already-kebab');
	});
});

describe('parseVariantValues', () => {
	it('extracts a single Value', () => {
		expect(parseVariantValues('Type=Dropdown|Name=Color|Value=Natural')).toEqual(['natural']);
	});

	it('extracts multiple Values in order', () => {
		expect(
			parseVariantValues('Type=Dropdown|Name=Color|Value=Black|Type=Dropdown|Name=Neck|Value=Maple')
		).toEqual(['black', 'maple']);
	});

	it('lowercases the values', () => {
		expect(parseVariantValues('Type=Dropdown|Name=Color|Value=Sunburst')).toEqual(['sunburst']);
	});

	it('returns an empty array for an empty string', () => {
		expect(parseVariantValues('')).toEqual([]);
	});

	it('returns an empty array when options has no Value entries', () => {
		expect(parseVariantValues('Type=Dropdown|Name=Color')).toEqual([]);
	});
});

describe('extFromUrl', () => {
	it('returns .jpg for a .jpg URL', () => {
		expect(extFromUrl('https://example.com/photo.1280.1280.jpg?c=1')).toBe('.jpg');
	});

	it('normalises .jpeg to .jpg', () => {
		expect(extFromUrl('https://example.com/photo.jpeg')).toBe('.jpg');
	});

	it('is case-insensitive', () => {
		expect(extFromUrl('https://example.com/photo.JPG')).toBe('.jpg');
	});

	it('returns .png for a .png URL', () => {
		expect(extFromUrl('https://example.com/photo.png')).toBe('.png');
	});

	it('returns .webp for a .webp URL', () => {
		expect(extFromUrl('https://example.com/photo.webp')).toBe('.webp');
	});

	it('returns .gif for a .gif URL', () => {
		expect(extFromUrl('https://example.com/photo.gif')).toBe('.gif');
	});

	it('defaults to .jpg when no recognized extension is found', () => {
		expect(extFromUrl('https://example.com/photo')).toBe('.jpg');
	});

	it('ignores query string when detecting extension', () => {
		expect(extFromUrl('https://example.com/photo.png?foo=bar')).toBe('.png');
	});
});

describe('buildImageRows', () => {
	const productRow = {
		Item: 'Product',
		ID: '912',
		Name: 'Fender CB-60SCE Acoustic Electric Bass',
		SKU: 'CB-60SCE',
		Options: '',
		'Variant Image URL': '',
		'Internal Image URL (Export)': ''
	};

	const variantNatural = {
		Item: 'Variant',
		ID: '1116',
		Name: '',
		SKU: '970183021',
		Options: 'Type=Dropdown|Name=Color|Value=Natural',
		'Variant Image URL': 'https://cdn11.bigcommerce.com/s-abc/attribute_rule_images/237_source.jpg',
		'Internal Image URL (Export)': ''
	};

	const variantBlack = {
		Item: 'Variant',
		ID: '1117',
		Name: '',
		SKU: '970183006',
		Options: 'Type=Dropdown|Name=Color|Value=Black',
		'Variant Image URL': 'https://cdn11.bigcommerce.com/s-abc/attribute_rule_images/238_source.jpg',
		'Internal Image URL (Export)': ''
	};

	const internalImage = {
		Item: 'Image',
		ID: '14272',
		Name: '',
		SKU: '',
		Options: '',
		'Variant Image URL': '',
		'Internal Image URL (Export)':
			'https://cdn11.bigcommerce.com/s-abc/products/912/images/14272/CB-60SCE.1744044437.386.513.jpg?c=1'
	};

	it('excludes Product rows from output', () => {
		const result = buildImageRows([productRow]);
		expect(result).toHaveLength(0);
	});

	it('generates correct export_image_name for a variant image', () => {
		const result = buildImageRows([productRow, variantNatural]);
		expect(result).toHaveLength(1);
		expect(result[0].export_image_name).toBe('fender-cb-60sce-acoustic-electric-bass_natural.jpg');
	});

	it('includes ID and URL on variant rows', () => {
		const result = buildImageRows([productRow, variantNatural]);
		expect(result[0].ID).toBe('1116');
		expect(result[0].URL).toBe(variantNatural['Variant Image URL']);
	});

	it('skips variant rows with no Variant Image URL', () => {
		const noUrl = { ...variantNatural, 'Variant Image URL': '' };
		const result = buildImageRows([productRow, noUrl]);
		expect(result).toHaveLength(0);
	});

	it('generates correct export_image_name for an internal image', () => {
		const result = buildImageRows([productRow, internalImage]);
		expect(result).toHaveLength(1);
		expect(result[0].export_image_name).toBe('fender-cb-60sce-acoustic-electric-bass_14272.jpg');
	});

	it('skips image rows with no Internal Image URL', () => {
		const noUrl = { ...internalImage, 'Internal Image URL (Export)': '' };
		const result = buildImageRows([productRow, noUrl]);
		expect(result).toHaveLength(0);
	});

	it('joins multiple variant option values with underscores', () => {
		const multiOption = {
			...variantBlack,
			Options: 'Type=Dropdown|Name=Color|Value=Black|Type=Dropdown|Name=Neck|Value=Maple'
		};
		const result = buildImageRows([productRow, multiOption]);
		expect(result[0].export_image_name).toBe(
			'fender-cb-60sce-acoustic-electric-bass_black_maple.jpg'
		);
	});

	it('tracks product context across multiple rows', () => {
		const result = buildImageRows([productRow, variantNatural, variantBlack, internalImage]);
		expect(result).toHaveLength(3);
		expect(result.every((r) => r.export_image_name.startsWith('fender-cb-60sce'))).toBe(true);
	});

	it('resets product context when a new Product row is encountered', () => {
		const product2 = { ...productRow, Name: 'Yamaha FG800' };
		const image2 = { ...internalImage, ID: '99999' };
		const result = buildImageRows([productRow, internalImage, product2, image2]);
		expect(result[0].export_image_name).toContain('fender');
		expect(result[1].export_image_name).toContain('yamaha');
	});
});
