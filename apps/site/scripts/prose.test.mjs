import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createLinter, loadTextlintrc } from 'textlint';
import { extractProse, proseFiles } from './prose.mjs';
import { moduleDescription } from '../src/lib/module-descriptions.ts';
import { sources } from '../src/lib/build/sources.ts';

const descriptor = await loadTextlintrc({ configFilePath: '.textlintrc.cjs' });
assert.ok(descriptor.configBaseDir, 'Writing configuration must load');
const linter = createLinter({ descriptor });

test('rejects abbreviations, jargon, hype, redundancy and long sentences', async () => {
	for (const [text, rule] of [
		['AST を使います。', 'no-abbreviations'],
		['32 MB を使います。', 'no-abbreviations'],
		['`db.rs` と `Ctx` を使います。', 'no-abbreviations'],
		['アーティファクトを使います。', 'prh'],
		['革命的な技術です。', 'no-ai-hype-expressions'],
		['検査を実行します。', 'ja-no-redundant-expression'],
		['これは' + '長い説明を続けます'.repeat(15) + '。', 'sentence-length']
	]) {
		const result = await linter.lintText(text, 'control.md');
		assert.ok(result.messages.some(message => message.ruleId.includes(rule)), `${rule} must reject ${text}`);
	}
	assert.deepEqual((await linter.lintText('構文解析の結果を保存して再利用します。', 'control.md')).messages, []);
});

test('reads prose from templates, attributes, expressions, branches and scripts', () => {
	const source = `<script>const steps = [{ what: '本文の説明' }];</script>
<Header lead="導入の説明" />
<span title={true ? '条件付きの補足' : ''}>本文</span>
<p>前半<strong>強調</strong>後半<Term name="DocumentContext" />。</p>
{#if true}<p>条件付きの説明</p>{:else}<p>別の説明</p>{/if}
{#each ['動的な説明'] as label}<button>{label}</button>{/each}
{#snippet caption()}図の説明{/snippet}
{@render heading('見出しの説明')}
<pre>AST と db.rs は元のコード</pre><Code item={data.code} />`;
	const text = extractProse(source, 'example.svelte').map(chunk => chunk.text).join('\n');
	for (const expected of ['本文の説明', '導入の説明', '条件付きの補足', '前半**強調**後半文書ごとの保存領域', '条件付きの説明', '別の説明', '動的な説明', '図の説明', '見出しの説明']) {
		assert.ok(text.includes(expected), `Must check ${expected}`);
	}
	assert.ok(!text.includes('元のコード'));
	assert.throws(() => extractProse('<Term name="Unknown" />', 'example.svelte'), /Missing reader label/);
	assert.ok(extractProse("s('hir', 'HIR')", 'site.ts').some(chunk => chunk.text === 'HIR'));
	assert.ok(extractProse('const label = `容量 ${size} MB`; const metric = { unit: "MB" };', 'site.ts').some(chunk => chunk.text === 'MB'));
	assert.deepEqual(extractProse('throw new Error(`ASCII only: ${code}`)', 'internal.ts'), []);
	assert.ok(extractProse('const label = `説明 ${flag ? "条件の補足" : "別の補足"}`', 'site.ts').some(chunk => chunk.text === '条件の補足'));
});

test('AI pattern rules reject rendered emphasis and lists from Svelte', async () => {
	for (const [source, rule] of [
		['<p><strong>重要</strong>：解析結果を共有します。</p>', 'no-ai-emphasis-patterns'],
		['<ul><li><strong>速度</strong>：解析結果を共有します。</li></ul>', 'no-ai-list-formatting'],
		['<h2><strong>解析結果を共有する</strong></h2>', 'no-ai-emphasis-patterns'],
		['<p>それでは詳しく見ていきましょう。</p>', 'prh']
	]) {
		const chunks = extractProse(source, 'control.svelte');
		const results = await Promise.all(chunks.map(chunk => linter.lintText(chunk.text, 'control.md')));
		assert.ok(results.some(result => result.messages.some(message => message.ruleId.includes(rule))), `${rule} must reject rendered prose`);
	}
	for (const source of ['<p>構文解析は<strong>一度だけ</strong>です。</p>', '<ul><li>結果を保存します。</li></ul>', '<h2>解析結果を共有する</h2>']) {
		for (const chunk of extractProse(source, 'control.svelte')) {
			assert.deepEqual((await linter.lintText(chunk.text, 'control.md')).messages, []);
		}
	}
});

test('new kernel modules need a reader description', () => {
	const modules = sources('../../crates').filter(module => module.key.startsWith('kernel/') && module.key !== 'kernel/lib');
	assert.ok(modules.length > 0);
	for (const module of modules) assert.ok(moduleDescription(module.key).summary);
	assert.throws(() => moduleDescription('kernel/unknown'), /Missing reader description/);
});

test('every visible source surface is parsed, including the reported modules page', () => {
	const files = proseFiles('src');
	assert.ok(files.includes('src/routes/learn/kernel/+page.svelte'));
	assert.ok(files.includes('src/lib/site.ts'));
	assert.ok(files.includes('src/lib/widgets/ArtifactCacheSim.svelte'));
	for (const file of files) extractProse(readFileSync(file, 'utf8'), file);
});
