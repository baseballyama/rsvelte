/**
 * Expand the declarative axes into concrete cases.
 *
 * Every case is `{ id, source }`; `id` is stable across runs (it is the ratchet
 * key), so adding a row to one axis never renumbers the others.
 */

import { BINDINGS, POSITIONS, COMMENT_KINDS, COMMENT_SEEDS } from './axes.mjs';
import { commentMutants } from './mutate.mjs';

function bindingPositionCases() {
	const cases = [];
	for (const [bindingName, binding] of Object.entries(BINDINGS)) {
		for (const [positionName, template] of Object.entries(POSITIONS)) {
			cases.push({
				id: `binding-position/${bindingName}__${positionName}.svelte`,
				source: binding.wrap(template.replaceAll('%s', binding.read)),
			});
		}
	}
	return cases;
}

function commentSlotCases() {
	const cases = [];
	for (const [seedName, seed] of Object.entries(COMMENT_SEEDS)) {
		for (const mutant of commentMutants(seed, COMMENT_KINDS)) {
			cases.push({
				id: `comment-slot/${seedName}__L${String(mutant.line).padStart(2, '0')}__${mutant.kind}.svelte`,
				source: mutant.source,
			});
		}
	}
	return cases;
}

export const FAMILIES = {
	'binding-position': bindingPositionCases,
	'comment-slot': commentSlotCases,
};

export function generate(families = Object.keys(FAMILIES)) {
	const cases = [];
	for (const name of families) {
		const build = FAMILIES[name];
		if (!build) throw new Error(`unknown matrix family "${name}" (known: ${Object.keys(FAMILIES).join(', ')})`);
		cases.push(...build());
	}
	const seen = new Set();
	for (const c of cases) {
		if (seen.has(c.id)) throw new Error(`duplicate matrix case id "${c.id}" — ids are ratchet keys and must be unique`);
		seen.add(c.id);
	}
	return cases;
}
