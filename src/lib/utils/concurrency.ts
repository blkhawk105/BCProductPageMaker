// Bounded parallel execution. Used by the CLI to process multiple products concurrently.
export async function processWithConcurrency<T, R>(
	items: T[],
	fn: (item: T) => Promise<R>,
	concurrency: number
): Promise<R[]> {
	const results: R[] = [];
	let index = 0;

	async function worker() {
		while (index < items.length) {
			const i = index++;

			results[i] = await fn(items[i]);
		}
	}

	await Promise.all(Array.from({ length: concurrency }, worker));

	return results;
}
