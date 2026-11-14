import { Linter } from 'eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import * as tsParser from '@typescript-eslint/parser';
import { CORE_RECOMMENDED, enabledRules, lintArtifacts } from './lint-shared.ts';
import type { Task } from '../types.ts';

// Every plugin rule, so expected output does not depend on which rules rsvelte has ported: the
// recommended core rules, then eslint-plugin-svelte's `all` (its `base` — parser, processor, the
// core rules it turns off — and every plugin rule). Core first, as a user config lists them, so
// `base` can turn core rules off. Like the compile task, the components are in runes mode, here
// through `compilerOptions.runes` of a `svelte.config.js`, as a Svelte 5 project sets it.
const FILES = ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'];
const CONFIG: Linter.Config[] = [
	{ files: FILES, rules: CORE_RECOMMENDED },
	...sveltePlugin.configs.all,
	{
		files: FILES,
		languageOptions: {
			parserOptions: { parser: tsParser, svelteConfig: { compilerOptions: { runes: true } } },
		},
	},
];

const ENABLED = enabledRules(CONFIG);
const linter = new Linter({ configType: 'flat' });

const task: Task = {
	id: 'svelte.lint',
	oracles: ['eslint', 'eslint-plugin-svelte', 'svelte-eslint-parser', '@typescript-eslint/parser'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => ['svelte', 'svelte-module-js', 'svelte-module-ts'].includes(unit.lang),
	lock: { rules: ENABLED },
	run: (unit, src) => lintArtifacts(linter.verify(src, CONFIG, { filename: unit.path })),
};
export default task;
