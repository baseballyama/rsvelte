// Japanese text that an English reader would see. Shared files render in both languages, so their reader
// text must come from the Japanese half of `bilingual(ja, en)`; everything else is a leak.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'svelte/compiler';
import ts from 'typescript';

// Japanese letters, plus Japanese punctuation and full-width forms, which have the Common script.
export const japanese = /[\p{scx=Han}\p{scx=Hiragana}\p{scx=Katakana}　-〿＀-￯]/u;

const clean = (text) => text.replace(/\s+/g, ' ').trim();

// The Japanese half of a pair: the first argument of `bilingual`, or the second of the section helper `s(id, ja, en)`.
function japaneseHalf(node, tree) {
	for (let child = node, parent = node.parent; parent; child = parent, parent = parent.parent) {
		if (ts.isCallExpression(parent) && parent.arguments.includes(child)) {
			const callee = parent.expression.getText(tree);
			if (callee === 'bilingual') return parent.arguments[0] === child;
			if (callee === 's') return parent.arguments[1] === child;
		}
	}
	return false;
}

function scriptLeaks(source, file, offset, add) {
	const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	function visit(node) {
		let text;
		if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) text = node.text;
		else if (ts.isTemplateExpression(node)) text = [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join(' ');
		if (text !== undefined && japanese.test(text) && !japaneseHalf(node, tree)) add(text, offset + node.getStart(tree));
		if (!ts.isTemplateExpression(node)) ts.forEachChild(node, visit);
		else for (const span of node.templateSpans) visit(span.expression);
	}
	visit(tree);
}

// An ESTree expression inside the template: a literal is reader text unless it is the Japanese half of a pair.
function expressionLeaks(node, add, japaneseSide = false) {
	if (!node || typeof node !== 'object') return;
	if (node.type === 'CallExpression' && node.callee?.type === 'Identifier' && node.callee.name === 'bilingual') {
		node.arguments.forEach((argument, index) => expressionLeaks(argument, add, index === 0));
		return;
	}
	if (!japaneseSide && node.type === 'Literal' && typeof node.value === 'string' && japanese.test(node.value)) add(node.value, node.start);
	if (!japaneseSide && node.type === 'TemplateElement' && japanese.test(node.value.cooked)) add(node.value.cooked, node.start);
	for (const [key, value] of Object.entries(node)) {
		if (key === 'metadata' || key === 'loc' || key === 'parent') continue;
		if (Array.isArray(value)) value.forEach((item) => expressionLeaks(item, add, japaneseSide));
		else if (value && typeof value === 'object' && typeof value.type === 'string') expressionLeaks(value, add, japaneseSide);
	}
}

function templateLeaks(fragment, add) {
	for (const node of fragment?.nodes ?? []) {
		if (node.type === 'Text') {
			if (japanese.test(node.data)) add(node.data, node.start);
			continue;
		}
		if (node.type === 'Comment') continue;
		const lang = node.attributes?.find((attribute) => attribute.type === 'Attribute' && attribute.name === 'lang');
		// Japanese marked as Japanese is allowed: a screen reader reads it in Japanese.
		if (lang && Array.isArray(lang.value) && lang.value.length === 1 && lang.value[0].data === 'ja') continue;
		for (const attribute of node.attributes ?? []) {
			if (Array.isArray(attribute.value)) {
				for (const value of attribute.value) {
					if (value.type === 'Text' && japanese.test(value.data)) add(value.data, value.start);
					if (value.expression) expressionLeaks(value.expression, add);
				}
			} else if (attribute.value?.expression) expressionLeaks(attribute.value.expression, add);
			else if (attribute.expression) expressionLeaks(attribute.expression, add);
		}
		if (node.expression) expressionLeaks(node.expression, add);
		for (const key of ['test', 'key']) if (node[key]) expressionLeaks(node[key], add);
		for (const key of ['fragment', 'body', 'consequent', 'alternate', 'pending', 'then', 'catch', 'fallback']) {
			if (node[key]?.nodes) templateLeaks(node[key], add);
		}
	}
}

/** Japanese reader text in one shared file, with its line. Comments are not read: readers never see them. */
export function japaneseLeaks(source, file) {
	const leaks = [];
	const add = (text, start) => leaks.push({ line: source.slice(0, start).split('\n').length, text: clean(text) });
	if (file.endsWith('.html')) {
		const markup = source.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, ' '));
		for (const match of markup.matchAll(/[^<>]+/g)) if (japanese.test(match[0])) add(match[0], match.index);
		return leaks;
	}
	if (!file.endsWith('.svelte')) {
		scriptLeaks(source, file, 0, add);
		return leaks;
	}
	const tree = parse(source, { modern: true });
	for (const script of [tree.instance, tree.module]) {
		if (script) scriptLeaks(source.slice(script.content.start, script.content.end), file, script.content.start, add);
	}
	templateLeaks(tree.fragment, add);
	if (tree.css) {
		const css = source.slice(tree.css.content.start, tree.css.content.end).replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
		for (const match of css.matchAll(/(["'])((?:(?!\1).)*)\1/g)) if (japanese.test(match[2])) add(match[2], tree.css.content.start + match.index);
	}
	return leaks.sort((a, b) => a.line - b.line);
}

/** Files that render in both languages: everything a page uses, except the Japanese page files and tests. */
export function sharedFiles(root) {
	const files = ['lib', 'routes'].flatMap((dir) =>
		readdirSync(path.join(root, dir), { recursive: true, encoding: 'utf8' }).map((file) => path.join(root, dir, file))
	);
	return [
		path.join(root, 'app.html'),
		...files.filter((file) => /\.(svelte|ts)$/.test(file) && !/\.test\.ts$|\.d\.ts$/.test(file) && !file.endsWith('page.ja.svelte'))
	].sort();
}

/**
 * Leaks not covered by the allowlist, and allowlist entries that cannot be reached. An entry must name a scanned
 * file and the exact text found there, so the list cannot hide anything else.
 */
export function checkLeaks(leaksByFile, allowlist) {
	const problems = [];
	const used = new Set();
	for (const [file, leaks] of leaksByFile) {
		for (const leak of leaks) {
			const index = allowlist.findIndex((entry) => entry.file === file && entry.text === leak.text);
			if (index < 0) problems.push({ file, line: leak.line, problem: 'Japanese text in a shared or English file', text: leak.text });
			else used.add(index);
		}
	}
	allowlist.forEach((entry, index) => {
		if (!entry.reason) problems.push({ file: entry.file, line: 0, problem: 'allowlist entry without a reason', text: entry.text });
		if (!leaksByFile.has(entry.file)) problems.push({ file: entry.file, line: 0, problem: 'allowlist entry for a file that is not scanned', text: entry.text });
		else if (!used.has(index)) problems.push({ file: entry.file, line: 0, problem: 'allowlist entry that matches nothing', text: entry.text });
	});
	return problems;
}
