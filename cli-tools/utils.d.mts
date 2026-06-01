export function normalizeBcCdnUrl(url: string): string;

export function processWithConcurrency<T, R>(
	items: T[],
	fn: (item: T) => Promise<R>,
	concurrency: number,
	reportEvery?: number
): Promise<R[]>;

export function toKebab(str: string): string;

export function parseVariantValues(options: string): string[];

export function extFromUrl(url: string): string;

export interface BcCheckRow {
	productName: string;
	imageId: string;
	sourceColumn: string;
	options: string;
	URL: string;
	[key: string]: unknown;
}

export function buildExportImageName(row: BcCheckRow): string;
