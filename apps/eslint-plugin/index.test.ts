import assert from 'node:assert/strict';
import { test } from 'node:test';
import typescript from '@typescript-eslint/eslint-plugin';
import { ESLint, type Linter } from 'eslint';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import svelte from 'eslint-plugin-svelte';
import vue from 'eslint-plugin-vue';
import plugin from './index.js';

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

test('every rule it turns off is a rule of ESLint or of the plugin its prefix names', () => {
	for (const block of plugin.configs.all)
		for (const name of Object.keys(block.rules ?? {}))
			assert.ok(isUpstreamRule(name), `${block.name}: ${name} is not an upstream rule`);
});

async function lint(config: Linter.Config[], filePath: string, code: string) {
	const eslint = new ESLint({
		cwd: import.meta.dirname,
		overrideConfigFile: true,
		overrideConfig: config,
	});
	const [result] = await eslint.lintText(code, { filePath });
	return result!.messages.map((message) => message.ruleId ?? message.message);
}

const project: Linter.Config[] = [
	...svelte.configs.base,
	{
		rules: { eqeqeq: 'error', 'no-undef': 'error', 'svelte/button-has-type': 'error' },
	},
];

test('turns off the rules rsvelte runs on a component and keeps the others', async () => {
	const code = '<script>\n\tlet a = 1;\n\tif (a == 2) b();\n</script>\n<button>x</button>\n';
	assert.deepEqual(
		(await lint(project, 'App.svelte', code)).toSorted(),
		['eqeqeq', 'no-undef', 'svelte/button-has-type'],
		'the positive control',
	);
	assert.deepEqual(await lint([...project, ...plugin.configs.all], 'App.svelte', code), ['eqeqeq']);
});

test('keeps a rule on in the files where rsvelte does not run it', async () => {
	const code = 'b();\n';
	const config = [...project, ...plugin.configs.all];
	assert.deepEqual(await lint(config, 'module.js', code), ['no-undef']);
});

test('loads in a configuration that registers none of the plugins it names', async () => {
	assert.deepEqual(
		await lint([{ rules: { eqeqeq: 'error' } }, ...plugin.configs.all], 'module.js', '1 == 2;\n'),
		['eqeqeq'],
	);
});
