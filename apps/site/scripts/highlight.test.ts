import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compile } from 'svelte/compiler';
import { highlight } from './highlight.ts';

const markup = highlight().markup!;
const page = async (content: string) =>
	(await markup({ content, filename: '/site/src/routes/+page.svelte' }))?.code;
async function highlighted(content: string) {
	const code = await page(content);
	assert.ok(code !== undefined, 'The page must change');
	return code;
}

test('highlights a code block, and the page still compiles', async () => {
	const code = await highlighted(
		'<p>Run:</p>\n<pre><code class="language-js"\n\t>{`export default { a: 1 };`}</code\n></pre>',
	);
	assert.ok(code.includes('var(--shiki-token-keyword)'), code);
	// Braces in the code would otherwise start Svelte expressions.
	assert.ok(code.includes('&#123;') && !code.includes('{ a'), code);
	assert.doesNotThrow(() => compile(code, { generate: 'server' }));
});

test('a code block without a known language is an error', async () => {
	await assert.rejects(page('<pre><code>npm install</code></pre>'), /language-sh, json, js/);
	await assert.rejects(page('<pre><code class="language-rust">fn main() {}</code></pre>'));
});

test('leaves pages without code blocks and files outside the routes alone', async () => {
	assert.equal(await page('<p>No code.</p>'), undefined);
	const lib = await markup({
		content: '<pre><code>x</code></pre>',
		filename: '/site/src/lib/A.svelte',
	});
	assert.equal(lib, undefined);
});
