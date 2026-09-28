import * as prettier from 'prettier';
import * as sveltePlugin from 'prettier-plugin-svelte';
import type { Task } from '../types.ts';

// Written out so the snapshot does not depend on a prettier default changing.
export const FORMAT_OPTIONS = {
	parser: 'svelte',
	printWidth: 80,
	tabWidth: 2,
	useTabs: false,
	semi: true,
	singleQuote: false,
	trailingComma: 'all',
	bracketSpacing: true,
	svelteSortOrder: 'options-scripts-markup-styles',
	svelteIndentScriptAndStyle: true
} as const;

// Only the hand-written units for now: whether corpus snapshots are committed or cached waits for a
// size measurement (docs/fixtures.md).
const task: Task = {
	id: 'svelte.format',
	storage: 'committed',
	oracles: ['prettier', 'prettier-plugin-svelte'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => unit.lang === 'svelte' && unit.source === 'rsvelte',
	async run(unit, src) {
		const text = await prettier.format(src, { ...FORMAT_OPTIONS, filepath: unit.path, plugins: [sveltePlugin as prettier.Plugin] });
		return { svelte: { text, ext: 'svelte', compare: 'text' } };
	}
};
export default task;
