import { describe, it, expect } from 'vite-plus/test';
import { downloadRow } from './downloadImages.mjs';

describe('downloadRow', () => {
	it('returns an error when URL is missing', async () => {
		const result = await downloadRow({ ID: '1', URL: '', export_image_name: 'photo.jpg' }, '/tmp');
		expect(result.status).toBe('error: no URL');
		expect(result.dest).toBe('');
	});

	it('returns an error when ID is missing', async () => {
		const result = await downloadRow(
			{ ID: '', URL: 'https://example.com/photo.jpg', export_image_name: 'photo.jpg' },
			'/tmp'
		);
		expect(result.status).toBe('error: no ID');
		expect(result.id).toBe('(no ID)');
	});

	it('returns an error when export_image_name is missing', async () => {
		const result = await downloadRow(
			{ ID: '1', URL: 'https://example.com/photo.jpg', export_image_name: '' },
			'/tmp'
		);
		expect(result.status).toBe('error: no export_image_name');
		expect(result.dest).toBe('');
	});

	it('echoes the ID in the result', async () => {
		const result = await downloadRow({ ID: '99', URL: '', export_image_name: 'photo.jpg' }, '/tmp');
		expect(result.id).toBe('99');
	});
});
