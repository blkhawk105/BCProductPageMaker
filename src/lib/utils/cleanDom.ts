/**
 * Strip site-wide boilerplate (nav menus, footer, copyright) from innerText.
 * Targets the most common noise patterns on manufacturer brand homepages so the
 * LLM gets product-relevant text rather than navigation chrome.
 */
export function cleanDom(text: string): string {
	let result = text;

	// 1. Remove footer / copyright blocks (the last major content chunk)
	const footerBlock =
		/[\s\S]*(?:copyright|@?©.*yamaha|legal notice|terms of use|privacy policy)\b[\s\S]*$/i;
	result = result.replace(footerBlock, '');

	// 2. Remove known site-wide nav/footer phrase lines (case-insensitive)
	const boilerplateLines = [
		// General footer / legal
		'privacy policy',
		'terms of use',
		'legal notice',
		'do not sell or share my personal information',
		'preferences',
		'cookie policy',
		// Yamaha site-wide items
		'yamaha worldwide',
		'contact us',
		'dealer locator',
		'designware'
	];

	for (const phrase of boilerplateLines) {
		const re = new RegExp('\\n?' + phrase + '[\\s]*$', 'igm');
		result = result.replace(re, '');
	}

	// 3. Remove very short repeated lines that are clearly navigation items
	//    (e.g. "Home", "Products", "Support" appearing many times)
	const lines = result.split('\n').filter((line) => line.trim().length > 0);
	const lineCounts = new Map<string, number>();

	for (const line of lines) {
		const key = line.trim().toLowerCase();
		if (key.length < 25 && line.split(' ').length <= 5) {
			lineCounts.set(key, (lineCounts.get(key) ?? 0) + 1);
		}
	}

	const repeated = new Set(
		Array.from(lineCounts.entries())
			.filter(([, count]) => count >= 15)
			.map(([phrase]) => phrase)
	);

	if (repeated.size > 0) {
		result = lines.filter((line) => !repeated.has(line.trim().toLowerCase())).join('\n');
	} else {
		result = lines.join('\n');
	}

	return result;
}
