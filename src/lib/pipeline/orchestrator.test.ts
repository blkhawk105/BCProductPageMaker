import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';

// Module-level mocks — these apply before any code that imports the step modules.
const mockRunSpecs = vi.fn();
const mockRunCustomFields = vi.fn();
const mockRunCopy = vi.fn();
const mockRunSeo = vi.fn();

vi.mock('./steps/specs', async () => ({ runSpecs: mockRunSpecs }));
vi.mock('./steps/customFields', async () => ({ runCustomFields: mockRunCustomFields }));
vi.mock('./steps/copy', async () => ({ runCopy: mockRunCopy }));
vi.mock('./steps/seo', async () => ({ runSeo: mockRunSeo }));

function createMockProduct() {
	return {
		Item: '12345',
		'Product ID': '42',
		Name: 'Test Product',
		SKU: 'TP-001',
		Category: 'Brass'
	};
}

function setupDefaults() {
	mockRunSpecs.mockResolvedValue({ mpn: 'G6550A' });
	mockRunCustomFields.mockResolvedValue({
		customFields: [{ name: 'Type', value: 'Tenor Sax' }],
		fields: [],
		category: 'Brass',
		unresolved: [],
		skipped: false
	});
	mockRunCopy.mockResolvedValue({ description: 'A beautiful tenor saxophone.', sourceUrl: null });
	mockRunSeo.mockResolvedValue({
		h1Name: 'Test Product',
		pageTitle: 'Test Product — Tenor Saxophone',
		metaDescription: 'Buy Test Product at Ted Brown Music.',
		searchKeywords: 'tenor saxophone, brass, pro music',
		copyChanges: null
	});
}

describe('runPipeline', () => {
	beforeEach(() => vi.clearAllMocks());

	it('assembles a DiffRecord from all step results', async () => {
		setupDefaults();
		const { runPipeline } = await import('./orchestrator');
		const result = await runPipeline(createMockProduct() as never, {} as never);

		expect(result.item).toBe('12345');
		expect(result.id).toBe('42');
		expect(result.name).toBe('Test Product');
		expect(result.sku).toBe('TP-001');
		expect(result.mpn).toBe('G6550A');
		expect(result.customFields).toEqual([{ name: 'Type', value: 'Tenor Sax' }]);
		expect(result.description).toBe('A beautiful tenor saxophone.');
		expect(result.pageTitle).toBe('Test Product — Tenor Saxophone');
		expect(result.metaDescription).toBe('Buy Test Product at Ted Brown Music.');
		expect(result.searchKeywords).toBe('tenor saxophone, brass, pro music');
	});

	it('runs steps in order and calls each exactly once', async () => {
		setupDefaults();
		const { runPipeline } = await import('./orchestrator');
		await runPipeline(createMockProduct() as never, {} as never);

		expect(mockRunSpecs).toHaveBeenCalledTimes(1);
		expect(mockRunCustomFields).toHaveBeenCalledTimes(1);
		expect(mockRunCopy).toHaveBeenCalledTimes(1);
		expect(mockRunSeo).toHaveBeenCalledTimes(1);

		const callOrder = [
			mockRunSpecs.mock.invocationCallOrder[0],
			mockRunCustomFields.mock.invocationCallOrder[0],
			mockRunCopy.mock.invocationCallOrder[0],
			mockRunSeo.mock.invocationCallOrder[0]
		];

		expect(callOrder[0]).toBeLessThan(callOrder[1]);
		expect(callOrder[1]).toBeLessThan(callOrder[2]);
		expect(callOrder[2]).toBeLessThan(callOrder[3]);
	});

	it('handles skipped custom fields gracefully', async () => {
		mockRunCustomFields.mockResolvedValue({
			customFields: [],
			fields: [],
			category: null,
			unresolved: [],
			skipped: true
		});

		const { runPipeline } = await import('./orchestrator');
		const result = await runPipeline(createMockProduct() as never, {} as never);

		expect(result.item).toBe('12345');
		expect(result.customFields).toBeUndefined();
	});
});
