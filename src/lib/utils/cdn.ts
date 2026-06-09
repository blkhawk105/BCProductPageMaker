// Swaps BC CDN URLs to the 1280×1280 full-size tier. Used in pipeline steps that fetch product images.
export function normalizeBcCdnUrl(url: string): string {
	return url.replace(/\.\d+\.\d+(\.[a-z]+(?:\?|$))/, '.1280.1280$1');
}
