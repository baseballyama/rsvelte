import assert from 'node:assert/strict';
import { test } from 'node:test';
import typescript from '@typescript-eslint/eslint-plugin';
import { ESLint, type Linter } from 'eslint';
import oxlint from 'eslint-plugin-oxlint';
import * as oxlintCategories from 'eslint-plugin-oxlint/rules-by-category';
import * as oxlintScopes from 'eslint-plugin-oxlint/rules-by-scope';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import svelte from 'eslint-plugin-svelte';
import vue from 'eslint-plugin-vue';
import plugin from './index.cjs';
import * as categories from './rules-by-category.cjs';
import * as scopes from './rules-by-scope.cjs';

const plugins: Record<string, { rules: object }> = {
	'@typescript-eslint': typescript,
	svelte,
	vue,
};

/** Whether `name` is a core rule, or a rule of the plugin its prefix names. */
function isUpstreamRule(name: string): boolean {
	const first = name.indexOf('/');
	if (first === -1) return builtinRules.has(name);
	// `@scope/rule` names the plugin `@scope`; `@scope/plugin/rule` names `@scope/plugin`.
	const second = name.startsWith('@') ? name.indexOf('/', first + 1) : -1;
	const slash = second === -1 ? first : second;
	const rules = plugins[name.slice(0, slash)]?.rules;
	return rules !== undefined && Object.hasOwn(rules, name.slice(slash + 1));
}

/** The rules of each export, without the `default` and `module.exports` Node adds for CommonJS. */
const named = (module: object) =>
	Object.entries(module).filter(([key]) => key.endsWith('Rules')) as [string, object][];

const everyRule = named(scopes).flatMap(([, rules]) => Object.keys(rules));

test('every rule it turns off is a rule of ESLint or of the plugin its prefix names', () => {
	assert.ok(everyRule.length > 0);
	for (const name of everyRule) assert.ok(isUpstreamRule(name), `${name} is not an upstream rule`);
});

test('it has each configuration and export of eslint-plugin-oxlint for what both cover', () => {
	const ours = Object.keys(plugin.configs);
	for (const key of Object.keys(oxlint.configs)) {
		const name = /^flat\/(.*)$/.exec(key)?.[1];
		const shared =
			name === undefined ||
			name === 'all' ||
			name === 'recommended' ||
			`${name}Rules` in oxlintCategories ||
			`${name}Rules` in scopes;
		if (shared) assert.ok(ours.includes(key), `configs['${key}'] is missing`);
	}
	const plain = Object.keys(oxlintCategories).filter((key) => !key.includes('TypeAware'));
	assert.deepEqual(
		named(categories)
			.map(([key]) => key)
			.toSorted(),
		plain.toSorted(),
	);
	for (const [key] of named(scopes))
		assert.ok(key === 'svelteRules' || key in oxlintScopes, `${key} is not one of oxlint's scopes`);
});

test("a rule oxlint also has keeps oxlint's category", () => {
	const oxlintCategory = new Map(
		Object.entries(oxlintCategories).flatMap(([key, rules]) =>
			Object.keys(rules as object).map((rule) => [rule, key.replace('TypeAware', '')]),
		),
	);
	let shared = 0;
	for (const [key, rules] of named(categories))
		for (const rule of Object.keys(rules)) {
			const theirs = oxlintCategory.get(rule);
			if (theirs === undefined) continue;
			shared += 1;
			assert.equal(key, theirs, rule);
		}
	assert.ok(shared > 0, 'the comparison saw no rule');
});

test('flat/all leaves out the nursery, as eslint-plugin-oxlint does', () => {
	const off = new Set(
		plugin.configs['flat/all'].flatMap((config) => Object.keys(config.rules ?? {})),
	);
	for (const rule of Object.keys(categories.nurseryRules)) assert.ok(!off.has(rule), rule);
	assert.equal(off.size, everyRule.length - Object.keys(categories.nurseryRules).length);
});

async function lint(config: Linter.Config[], filePath: string, code: string) {
	const eslint = new ESLint({
		cwd: import.meta.dirname,
		overrideConfigFile: true,
		overrideConfig: config,
	});
	const [result] = await eslint.lintText(code, { filePath });
	return result!.messages.map((message) => message.ruleId ?? message.message).toSorted();
}

const project: Linter.Config[] = [
	...svelte.configs.base,
	{
		rules: {
			eqeqeq: 'error',
			'no-undef': 'error',
			'svelte/button-has-type': 'error',
			'svelte/no-at-html-tags': 'error',
		},
	},
];

const component =
	'<script>\n\tlet a = 1;\n\tif (a == 2) b();\n</script>\n<button>x</button>\n{@html a}\n';

test('turns off the rules rsvelte runs on a component and keeps the others', async () => {
	assert.deepEqual(
		await lint(project, 'App.svelte', component),
		['eqeqeq', 'no-undef', 'svelte/button-has-type', 'svelte/no-at-html-tags'],
		'the positive control',
	);
	// `no-undef` is in the nursery, and `button-has-type` is pedantic.
	assert.deepEqual(
		await lint([...project, ...plugin.configs['flat/all']], 'App.svelte', component),
		['eqeqeq', 'no-undef'],
	);
	assert.deepEqual(
		await lint([...project, ...plugin.configs['flat/recommended']], 'App.svelte', component),
		['eqeqeq', 'no-undef', 'svelte/button-has-type'],
	);
});

test('keeps a rule on in the files where rsvelte does not run it', async () => {
	const config = [...project, ...plugin.configs['flat/nursery']];
	assert.deepEqual(await lint(config, 'App.svelte', '<script>b();</script>\n'), []);
	assert.deepEqual(await lint(config, 'module.js', 'b();\n'), ['no-undef']);
});

test('loads in a configuration that registers none of the plugins it names', async () => {
	const config = [{ rules: { eqeqeq: 'error' } } as const, ...plugin.configs['flat/all']];
	assert.deepEqual(await lint(config, 'module.js', '1 == 2;\n'), ['eqeqeq']);
});

test('the legacy configurations turn off the same rules in the same files', () => {
	for (const [legacy, flat] of [
		['all', 'flat/all'],
		['recommended', 'flat/recommended'],
	] as const) {
		const config = plugin.configs[legacy];
		assert.deepEqual(config.plugins, ['rsvelte']);
		assert.deepEqual(
			config.overrides?.map(({ files, rules }) => ({ files, rules })),
			plugin.configs[flat].map(({ files, rules }) => ({ files, rules })),
		);
	}
});
