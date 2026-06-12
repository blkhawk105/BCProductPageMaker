import membersData from '../../../registry/aimm-members.json' with { type: 'json' };

export type AimmMember = {
	name: string;
	url: string;
	state: string;
	notes?: string;
	excluded: boolean;
	priority?: number;
};

const members = membersData as AimmMember[];

// Array order in the JSON is alphabetical (human-readable).
// The sort puts any store with a `priority` number first (lower = higher priority); stores without it stay in alphabetical order at the back.
// To promote a store, add `"priority": 1` (or any number) to its entry in `aimm-members.json`.
export function getAimmMembers(): AimmMember[] {
	return members
		.filter((m) => !m.excluded)
		.sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity));
}
