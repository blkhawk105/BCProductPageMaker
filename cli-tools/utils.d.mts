export function normalizeBcCdnUrl(url: string): string;

export function processWithConcurrency<T, R>(
	items: T[],
	fn: (item: T) => Promise<R>,
	concurrency: number,
	reportEvery?: number
): Promise<R[]>;
