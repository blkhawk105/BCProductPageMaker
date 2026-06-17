export type ProductOption = { name: string; value: string };

/**
 * Parse pipe-delimited product options from a BC CSV Options column.
 *
 * Format: "Type=Dropdown|Name=Color|Value=Red|Type=Dropdown|Name=Finish|Value=Natural"
 * Returns [] on empty or malformed input — never throws.
 */
export function parseOptions(raw: string): ProductOption[] {
	if (!raw) return [];
	const parts = raw.split('|');
	const options: ProductOption[] = [];
	for (let i = 0; i < parts.length - 1; i++) {
		if (parts[i].startsWith('Name=') && parts[i + 1]?.startsWith('Value=')) {
			options.push({ name: parts[i].slice(5).trim(), value: parts[i + 1].slice(6).trim() });
		}
	}
	return options;
}
