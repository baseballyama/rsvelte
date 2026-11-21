import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { englishLinter } from '../../../tools/writing/linter.ts';
import { extractProse, lintPage, proseFiles } from './prose.ts';

const linter = await englishLinter();
const lintSvelte = async (source: string) =>
	(await lintPage(linter, extractProse(source, 'control.svelte'))).map(({ chunk, message }) => ({
		line: chunk.line,
		rule: message.ruleId,
	}));

test('the English check reports a finding at the line of its passage', async () => {
	const findings = await lintSvelte(
		'<h2>Install</h2>\n<p>Run it.</p>\n<p>It reads zorbled files.</p>',
	);
	assert.deepEqual(findings, [{ line: 3, rule: 'spelling' }]);
});

test('a heading followed by text is not an empty section', async () => {
	assert.deepEqual(
		await lintSvelte('<h1>Guide</h1><h2>Install</h2><p>rsvelte reads each file once.</p>'),
		[],
	);
});

test('the English check reads the meta description and visible script strings', async () => {
	const findings = await lintSvelte(
		`<script>const result = { message: 'It reads zorbled files.' };</script>
<svelte:head><meta name="description" content="It reads zorbled files." /></svelte:head>`,
	);
	assert.deepEqual(
		findings.map((finding) => finding.rule),
		['spelling', 'spelling'],
	);
});

test('reads prose from templates, attributes, branches and visible script strings', () => {
	const source = `<script>const operations = [{ label: 'Visible label', id: 'hidden-id' }];</script>
<Header title="An attribute" />
<p>Before <strong>strong</strong> after.</p>
{#if true}<p>One branch</p>{:else}<p>Other branch</p>{/if}
{#snippet caption()}A caption{/snippet}
<pre>code that stays out</pre>`;
	const text = extractProse(source, 'example.svelte')
		.map((chunk) => chunk.text)
		.join('\n');
	for (const expected of [
		'Visible label',
		'An attribute',
		'Before **strong** after.',
		'One branch',
		'Other branch',
		'A caption',
	]) {
		assert.ok(text.includes(expected), `Must check ${expected}`);
	}
	assert.ok(!text.includes('hidden-id'));
	assert.ok(!text.includes('code that stays out'));
	assert.deepEqual(extractProse('throw new Error(`Internal: ${code}`)', 'internal.ts'), []);
});

test('every page and script of the site is parsed', () => {
	const files = proseFiles('src');
	assert.ok(files.includes('src/routes/+page.svelte'));
	assert.ok(files.includes('src/lib/rules.ts'));
	for (const file of files) extractProse(readFileSync(file, 'utf8'), file);
});

test('a dynamic value reads as inline code, also inside a code element', () => {
	const chunks = extractProse('<p>It found <code>{count}</code> files. {label}</p>', 'page.svelte');
	assert.deepEqual(
		chunks.map((chunk) => chunk.text),
		['It found `value` files. `value`'],
	);
});

test('a title and the next element are separate passages', () => {
	const chunks = extractProse(
		'<svelte:head><title>Guide · rsvelte</title></svelte:head><header><span>Appendix</span></header>',
		'page.svelte',
	);
	assert.deepEqual(
		chunks.map((chunk) => chunk.text),
		['Guide · rsvelte', 'Appendix'],
	);
});
