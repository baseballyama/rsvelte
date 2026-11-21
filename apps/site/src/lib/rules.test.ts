import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ruleUrl, rules } from './rules.ts';

test('lists the Svelte, ESLint and TypeScript rules, not the Vue ones', () => {
	const names = rules.map((rule) => rule.name);
	assert.ok(names.includes('svelte/button-has-type'));
	assert.ok(names.includes('no-unused-vars'));
	assert.ok(names.includes('@typescript-eslint/no-unused-vars'));
	assert.ok(!names.some((name) => name.startsWith('vue/')));
});

test('links each rule to the documentation of its original', () => {
	assert.equal(
		ruleUrl('svelte/@typescript-eslint/no-unnecessary-condition'),
		'https://sveltejs.github.io/eslint-plugin-svelte/rules/@typescript-eslint/no-unnecessary-condition/',
	);
	assert.equal(ruleUrl('no-undef'), 'https://eslint.org/docs/latest/rules/no-undef');
	assert.throws(() => ruleUrl('vue/no-unused-vars'), /No documentation/);
});
