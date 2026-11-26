import { type ESLint, Linter } from 'eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import * as tsParser from '@typescript-eslint/parser';
import { CORE_RECOMMENDED, declaredGlobals, enabledRules, lintArtifacts } from './eslint.ts';
import type { Task } from '../types.ts';

// Every plugin rule, so expected output does not depend on which rules rsvelte has ported: the
// recommended core rules, then eslint-plugin-svelte's `all` (its `base` — parser, processor, the
// core rules it turns off — and every plugin rule). Core first, as a user config lists them, so
// `base` can turn core rules off. Like the compile task, the components are in runes mode, here
// through `compilerOptions.runes` of a `svelte.config.js`, as a Svelte 5 project sets it. The
// scripts parse as TypeScript, so typescript-eslint's `no-unused-vars` replaces the core rule, as
// typescript-eslint's recommended configuration does.
const FILES = ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'];
const UNUSED_VARS = '@typescript-eslint/no-unused-vars';
const { 'no-unused-vars': _replaced, ...CORE } = CORE_RECOMMENDED;
const CONFIG: Linter.Config[] = [
	{
		files: FILES,
		// typescript-eslint types its plugin with its own copy of ESLint's types.
		plugins: { '@typescript-eslint': tsPlugin as unknown as ESLint.Plugin },
		rules: { ...CORE, [UNUSED_VARS]: 'error' },
	},
	...sveltePlugin.configs.all,
	{
		files: FILES,
		languageOptions: {
			parserOptions: { parser: tsParser, svelteConfig: { compilerOptions: { runes: true } } },
		},
	},
];

// rsvelte names the rule `no-unused-vars`, as oxlint does, whose rule of that name is the same.
const rsvelteName = (rule: string): string => (rule === UNUSED_VARS ? 'no-unused-vars' : rule);
const ENABLED = enabledRules(CONFIG).map(rsvelteName);
const linter = new Linter({ configType: 'flat' });

const task: Task = {
	id: 'svelte.lint',
	oracles: [
		'eslint',
		'eslint-plugin-svelte',
		'svelte-eslint-parser',
		'@typescript-eslint/parser',
		'@typescript-eslint/eslint-plugin',
	],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => ['svelte', 'svelte-module-js', 'svelte-module-ts'].includes(unit.lang),
	// rsvelte's corpus test declares these globals, so the two sides read one list.
	lock: { rules: ENABLED, globals: declaredGlobals(CONFIG) },
	run: (unit, src) => {
		const messages = linter.verify(src, CONFIG, { filename: unit.path });
		for (const m of messages) if (m.ruleId) m.ruleId = rsvelteName(m.ruleId);
		return lintArtifacts(messages);
	},
};
export default task;
