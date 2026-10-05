import assert from 'node:assert/strict';
import { test } from 'node:test';
import { englishProblems, vagueLinks } from './english.mjs';
import { checkLeaks, japaneseLeaks } from './japanese.mjs';
import { extractProse } from './prose.mjs';

test('rejects patterns the style sources name', () => {
	for (const text of [
		'Simply run the command.',
		'It is easy to add a task.',
		'Please run the tests.',
		"Let's look at the table.",
		'The parser is blazing fast.',
		'Run it now!',
		'The CLI reads the file.',
		'Each document is parsed once, and the result is stored and reused by every task that asks for it later, so formatting, linting, compiling and type checking never parse the same file twice in one run of the command line tool on a large project with many files.',
		'構文木'
	]) {
		assert.notDeepEqual(englishProblems(text), [], `must reject: ${text}`);
	}
	assert.notDeepEqual(englishProblems('## Register The Types You Need'), []);
	assert.notDeepEqual(englishProblems('Store The Parse Result', { heading: true }), []);
	assert.notDeepEqual(englishProblems('## Sort order.'), []);
});

test('accepts plain English, code, defined terms and proper nouns', () => {
	for (const text of [
		'The parser reads each file once.',
		'Run `cargo test -p rsvelte_kernel` to check the change.',
		'An AST (abstract syntax tree) keeps every node of the source.',
		'## Run Svelte components on the Vue Vapor runtime',
		'Write positions the way ESLint does',
		'日本語'
	]) {
		assert.deepEqual(englishProblems(text, { heading: text.startsWith('Write') }), [], `must accept: ${text}`);
	}
});

test('finds vague link text in English files', () => {
	const source = '<p>The table</p>\n<a href="/en/learn">here</a>';
	assert.deepEqual(vagueLinks(source), [{ line: 2, text: 'here' }]);
});

test('finds Japanese reader text in shared files and nothing else', () => {
	const leaks = (source, file = 'Widget.svelte') => japaneseLeaks(source, file).map((leak) => leak.text);
	// Positive controls: each of these must be found.
	assert.deepEqual(leaks('<button>リセット</button>'), ['リセット']);
	assert.deepEqual(leaks("<script>const t = bilingual('見出し', '見出し');</script>"), ['見出し']);
	assert.deepEqual(leaks('<p>Compile（client）</p>'), ['Compile（client）']);
	assert.deepEqual(leaks("<script>const comment = ' // 改行した';</script>"), ['// 改行した']);
	assert.deepEqual(leaks('<span title="コピー">x</span>'), ['コピー']);
	assert.deepEqual(leaks("<style>.note::before { content: '注'; }</style><p>x</p>"), ['注']);
	assert.deepEqual(leaks("export const example = { source: '// 型検査用TypeScriptの説明用の抜粋' };", 'data.ts'), ['// 型検査用TypeScriptの説明用の抜粋']);
	// Not reader text in English: the Japanese half of a pair, text marked as Japanese, and developer comments.
	assert.deepEqual(leaks("<script>const t = bilingual('見出し', 'Heading'); const x = s('id', '節', 'Section');</script>"), []);
	assert.deepEqual(leaks('<a lang="ja" hreflang="ja" href="/">日本語</a>'), []);
	assert.deepEqual(leaks('<script>// 開発者向けの説明\n/* 説明 */ const a = 1;</script><!-- 注 --><p>Text</p>'), []);
	assert.deepEqual(japaneseLeaks('<!doctype html><html lang="%lang%"><!-- 注 --><body>%sveltekit.body%</body></html>', 'app.html'), []);
});

test('allows only listed, reachable Japanese', () => {
	const leaks = new Map([['a.svelte', [{ line: 1, text: '日本語' }]], ['b.ts', []]]);
	const entry = { file: 'a.svelte', text: '日本語', reason: 'the language switch names Japanese in Japanese' };
	assert.deepEqual(checkLeaks(leaks, [entry]), []);
	assert.equal(checkLeaks(leaks, []).length, 1);
	assert.equal(checkLeaks(leaks, [entry, { file: 'b.ts', text: '残り', reason: 'x' }])[0].problem, 'allowlist entry that matches nothing');
	assert.equal(checkLeaks(leaks, [entry, { file: 'presets.ts', text: '日本語', reason: 'x' }])[0].problem, 'allowlist entry for a file that is not scanned');
	assert.equal(checkLeaks(leaks, [{ file: 'a.svelte', text: '日本語' }])[0].problem, 'allowlist entry without a reason');
});

test('allows only exact technical abbreviations in English', () => {
	assert.deepEqual(englishProblems('The JSON file and the CSS file are written in UTF-8.'), []);
	assert.notDeepEqual(englishProblems('The API returns the IR.'), []);
});

test('reads English from English files and from the English half of bilingual text only', () => {
	const shared = `<script>
const text = bilingual({ title: '日本語の見出し' }, { title: 'An English Heading Here' });
const sections = [s('id', '節', 'Section title')];
</script>
<p>日本語の本文</p>`;
	const english = extractProse(shared, 'Widget.svelte', 'en');
	assert.deepEqual(english.map((chunk) => [chunk.text, chunk.heading]), [['An English Heading Here', true], ['Section title', true]]);
	const japanese = extractProse(shared, 'Widget.svelte', 'ja').map((chunk) => chunk.text);
	assert.ok(japanese.includes('日本語の見出し') && japanese.includes('日本語の本文') && japanese.includes('節'));
	assert.ok(!japanese.some((text) => /English|Section/.test(text)));
	const page = extractProse("<script>const rows = [{ what: 'Reads the file.' }];</script>\n<h2>Store the result</h2>\n<p>The kernel stores it.</p>", 'page.en.svelte', 'en');
	assert.deepEqual(page.map((chunk) => chunk.text), ['## Store the result', 'The kernel stores it.', 'Reads the file.']);
});
