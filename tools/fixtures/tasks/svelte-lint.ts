import { Linter } from 'eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import * as tsParser from '@typescript-eslint/parser';
import { CORE_ALL, enabledRules, lintArtifacts } from './lint-shared.ts';
import type { Task } from '../types.ts';

// Every rule the oracle can run, so expected output does not depend on which rules rsvelte has
// ported: every core rule, then eslint-plugin-svelte's `all` (its `base` — parser, processor, the
// core rules it turns off — and every plugin rule). Core first, as a user config lists them, so
// `base` can turn core rules off.
const CONFIG: Linter.Config[] = [
	{ files: ['**/*.svelte'], rules: CORE_ALL },
	...sveltePlugin.configs.all,
	{ files: ['**/*.svelte'], languageOptions: { parserOptions: { parser: tsParser, svelteFeatures: { runes: true } } } }
];

const ENABLED = enabledRules(CONFIG);
const linter = new Linter({ configType: 'flat' });

// Hand-written units only, like svelte.format.
const task: Task = {
	id: 'svelte.lint',
	storage: 'committed',
	oracles: ['eslint', 'eslint-plugin-svelte', 'svelte-eslint-parser', '@typescript-eslint/parser'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => unit.lang === 'svelte' && unit.source === 'rsvelte',
	run: (unit, src) => lintArtifacts(linter.verify(src, CONFIG, { filename: unit.path }), ENABLED)
};
export default task;
