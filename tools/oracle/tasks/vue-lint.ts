import { Linter } from 'eslint';
import vuePlugin from 'eslint-plugin-vue';
import * as tsParser from '@typescript-eslint/parser';
import { CORE_RECOMMENDED, enabledRules, lintArtifacts } from './lint-shared.ts';
import type { Task } from '../types.ts';

// eslint-plugin-vue has no `all` configuration, so this is the one its `recommended` would be if it
// listed every rule: `flat/base` (parser, processor, the two rules it always turns on) and then every
// non-deprecated plugin rule. The recommended core rules come first, as in svelte.lint.
const VUE_ALL: Record<string, Linter.RuleEntry> = Object.fromEntries(
	Object.entries(vuePlugin.rules)
		.filter(([, rule]) => !rule.meta?.deprecated)
		.map(([id]) => [`vue/${id}`, 'error'] as const)
		.toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
);

const CONFIG: Linter.Config[] = [
	{ files: ['**/*.vue'], rules: CORE_RECOMMENDED },
	...(vuePlugin.configs['flat/base'] as Linter.Config[]),
	{ files: ['**/*.vue'], rules: VUE_ALL, languageOptions: { parserOptions: { parser: tsParser } } },
];

const ENABLED = enabledRules(CONFIG);
const linter = new Linter({ configType: 'flat' });

const task: Task = {
	id: 'vue.lint',
	oracles: ['eslint', 'eslint-plugin-vue', 'vue-eslint-parser', '@typescript-eslint/parser'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => unit.lang === 'vue',
	lock: { rules: ENABLED },
	run: (unit, src) => lintArtifacts(linter.verify(src, CONFIG, { filename: unit.path })),
};
export default task;
