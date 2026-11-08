import assert from 'node:assert/strict';
import { test } from 'node:test';
import { rules } from './rules.ts';
import { englishLinter, markdownFiles } from './writing.ts';

test('every rule loads and reports a known mistake', async () => {
	const linter = await englishLinter();
	const result = await linter.lintText(
		'# Title\n\nThis is is a very simple teh sentence that was written by Javascript devs.\n',
		'sample.md',
	);
	const fired = new Set(result.messages.map((message) => message.ruleId));
	for (const ruleId of ['write-good', 'alex', 'spelling', 'terminology', 'common-misspellings'])
		assert.ok(fired.has(ruleId), `${ruleId} did not report`);
	assert.equal(rules.length, new Set(rules.map((rule) => rule.ruleId)).size);
});

test('the listed technical words pass', async () => {
	const linter = await englishLinter();
	const result = await linter.lintText(
		'The rsvelte toolchain reads JSON and writes WebAssembly.\n',
		'sample.md',
	);
	assert.deepEqual(result.messages, []);
});

test('the files are first-party Markdown, the root ones included', () => {
	const files = markdownFiles();
	assert.ok(files.includes('AGENTS.md'));
	assert.ok(files.includes('README.md'));
	assert.ok(files.includes('.claude/skills/docs/SKILL.md'));
	assert.ok(!files.some((file) => file.startsWith('.claude/skills/humanizer/')));
	assert.ok(!files.some((file) => file.startsWith('corpus/') || file.includes('/vendor/')));
});
