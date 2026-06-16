import { checkbox } from '@inquirer/prompts';

/**
 * Prompt the user to select which unavailable category IDs should be removed for a single product.
 * Default behavior (unchecked): keep everything — only check boxes for categories you know are dead.
 * Returns the subset of `missingIds` the user wants to keep.
 */
export async function askCategoriesToRemove(missingIds: number[], sku: string): Promise<number[]> {
	console.log(`\n  [${sku}] Category ID(s) [${missingIds.join(', ')}] not found in BigCommerce.`);
	console.log(`  These may have been retired from the store, or the lookup missed them.\n`);

	const choices = missingIds.map((id) => ({ name: `ID ${id}`, value: id }));

	// All unchecked by default = keep all (safe). User checks only ones to remove.
	const toRemove = await checkbox({
		message: 'Check the IDs to REMOVE:',
		choices
	});

	if (toRemove.length === 0) {
		console.log(`  → Keeping all [${missingIds.join(', ')}]\n`);
		return [...missingIds];
	}

	const kept = missingIds.filter((id) => !toRemove.includes(id));
	console.log(`  → Removing [${toRemove.join(', ')}] — keeping [${kept.join(', ')} || (empty)]\n`);
	return kept;
}
