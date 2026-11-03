import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse, type AST } from 'svelte/compiler';
import ts from 'typescript';
import { createLinter, loadTextlintrc } from 'textlint';
import { term } from '../src/lib/terms.ts';
import noAbbreviations from './no-abbreviations.ts';

type Chunk = { text: string; line: number };
// Expressions are walked without knowing their node types, so their fields are read as unknown.
type Node = { type?: unknown; [key: string]: unknown };
type TemplateNode = AST.Fragment['nodes'][number];

const japanese = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const blocks = new Set(['p', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'td', 'th', 'button', 'summary', 'label', 'figcaption', 'div']);
const proseAttributes = new Set(['lead', 'title', 'label', 'abstract', 'placeholder', 'aria-label', 'alt']);

const isNode = (value: unknown): value is Node => typeof value === 'object' && value !== null;

/** The source range of a script's body. Svelte's types omit the offsets that its parser sets on `content`. */
export function contentRange(script: AST.Script): { start: number; end: number } {
	const content = script.content;
	if (!('start' in content && typeof content.start === 'number' && 'end' in content && typeof content.end === 'number')) {
		throw new Error('The Svelte parser gave a script without offsets');
	}
	return { start: content.start, end: content.end };
}

// The rule is added here because textlint resolves a configured rule path from its own package, not from the config file.
export async function writingLinter() {
	const loaded = await loadTextlintrc({ configFilePath: path.join(import.meta.dirname, '../.textlintrc.json') });
	if (!loaded.configBaseDir) throw new Error('The writing rules failed to load');
	const descriptor = loaded.shallowMerge({
		rules: [...loaded.rule.toKernelRulesFormat(), { ruleId: 'no-abbreviations', rule: noAbbreviations, options: true }]
	});
	return createLinter({ descriptor });
}

// Each branch of a block, in the order the reader sees it.
function branches(node: TemplateNode): (AST.Fragment | null | undefined)[] {
	switch (node.type) {
		case 'EachBlock': return [node.body, node.fallback];
		case 'IfBlock': return [node.consequent, node.alternate];
		case 'AwaitBlock': return [node.pending, node.then, node.catch];
		case 'SnippetBlock': return [node.body];
		default: return [];
	}
}

export function extractProse(source: string, file: string): Chunk[] {
	const chunks: Chunk[] = [];
	const add = (text: string, start: number | undefined) => {
		text = text.replace(/\s+/g, ' ').trim();
		if (text) chunks.push({ text, line: source.slice(0, start).split('\n').length });
	};
	function strings(sourceText: string, offset = 0) {
		const tree = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
		function visit(node: ts.Node) {
			const visible = node.parent && (ts.isPropertyAssignment(node.parent) && ['title', 'abstract', 'label', 'summary', 'what', 'unit'].includes(node.parent.name.getText(tree))
				|| ts.isCallExpression(node.parent) && node.parent.expression.getText(tree) === 's' && node.parent.arguments[1] === node);
			if (ts.isTemplateExpression(node)) {
				const text = node.head.text + node.templateSpans.map(span => '`動的な値`' + span.literal.text).join('');
				const code = ts.isPropertyAssignment(node.parent) && ['expr', 'code', 'source', 'src'].includes(node.parent.name.getText(tree));
				const literal = node.head.text + node.templateSpans.map(span => span.literal.text).join('');
				if (!code && (japanese.test(literal) || visible)) add(text, offset + node.getStart(tree));
				if (!code) for (const span of node.templateSpans) visit(span.expression);
				return;
			}
			if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && (japanese.test(node.text) || visible)) {
				const code = ts.isPropertyAssignment(node.parent) && ['expr', 'code', 'source', 'src'].includes(node.parent.name.getText(tree));
				if (!code) add(node.text, offset + node.getStart(tree));
			}
			ts.forEachChild(node, visit);
		}
		visit(tree);
	}
	if (!file.endsWith('.svelte')) {
		strings(source);
		return chunks;
	}
	const syntax_tree = parse(source, { modern: true });
	function expression(node: unknown) {
		if (!isNode(node)) return;
		const start = typeof node.start === 'number' ? node.start : undefined;
		if (node.type === 'Literal' && typeof node.value === 'string' && japanese.test(node.value)) add(node.value, start);
		if (node.type === 'TemplateElement' && isNode(node.value) && typeof node.value.cooked === 'string' && japanese.test(node.value.cooked)) add(node.value.cooked, start);
		for (const [key, value] of Object.entries(node)) {
			if (key === 'metadata' || key === 'loc') continue;
			if (Array.isArray(value)) value.forEach(expression);
			else if (value && typeof value === 'object') expression(value);
		}
	}
	function fragment(part: AST.Fragment, prefix = '') {
		let text = '';
		let start = 0;
		const flush = () => { if (text.trim()) add(prefix + text, start); text = ''; };
		function visit(node: TemplateNode) {
			if ('expression' in node && node.expression && node.type !== 'ExpressionTag') expression(node.expression);
			if (node.type === 'Component' && node.name === 'Term') {
				const name = node.attributes.find(attribute => 'name' in attribute && attribute.name === 'name');
				if (!name || name.type !== 'Attribute' || !Array.isArray(name.value) || name.value.length !== 1 || name.value[0].type !== 'Text') throw new Error(`Term needs a static name in ${file}`);
				text += term(name.value[0].data);
				return;
			}
			if (node.type === 'Text') {
				if (!text) start = node.start;
				text += node.data;
				return;
			}
			if (node.type === 'RegularElement' && ['pre', 'script', 'style'].includes(node.name)) return;
			if (node.type === 'Component' && node.name === 'Code') return;
			if (node.type === 'Component' && node.name === 'Note') { fragment(node.fragment); return; }
			if (node.type === 'RegularElement' && node.name === 'code') {
				const value = node.fragment.nodes.map(n => n.type === 'Text' ? n.data : n.type === 'ExpressionTag' && n.expression.type === 'Literal' ? String(n.expression.value) : '').join('');
				if (value) text += '`' + value.replaceAll('`', '\\`') + '`';
				return;
			}
			const name = 'name' in node ? node.name : undefined;
			const block = (name !== undefined && blocks.has(name)) || node.type === 'SnippetBlock';
			if (block) flush();
			for (const attribute of 'attributes' in node ? node.attributes : []) {
				if (!('name' in attribute) || !proseAttributes.has(attribute.name) || !('value' in attribute)) continue;
				const value = attribute.value;
				if (value && typeof value === 'object' && !Array.isArray(value) && value.expression) expression(value.expression);
				if (Array.isArray(value)) {
					add(value.map(n => n.type === 'Text' ? n.data : '`動的な値`').join(''), attribute.start);
					for (const part of value) if (part.type === 'ExpressionTag') expression(part.expression);
				}
			}
			if ('fragment' in node && node.fragment) {
				if (block) {
					const marker = name === 'li' ? '- ' : name !== undefined && /^h[1-6]$/.test(name) ? '#'.repeat(Number(name[1])) + ' ' : '';
					fragment(node.fragment, marker);
				} else {
					const marker = name === 'strong' || name === 'b' ? '**' : name === 'em' || name === 'i' ? '*' : '';
					if (marker && !text) start = node.start;
					text += marker;
					for (const child of node.fragment.nodes) visit(child);
					text += marker;
				}
			}
			for (const branch of branches(node)) {
				if (branch?.nodes) { flush(); fragment(branch); }
			}
			if (node.type === 'ExpressionTag') {
				text += node.expression.type === 'Literal' ? String(node.expression.value) : '`動的な値`';
				if (node.expression.type !== 'Literal') expression(node.expression);
			}
			if (block) flush();
		}
		for (const node of part.nodes) visit(node);
		flush();
	}
	fragment(syntax_tree.fragment);
	for (const script of [syntax_tree.instance, syntax_tree.module]) {
		if (script) {
			const { start, end } = contentRange(script);
			strings(source.slice(start, end), start);
		}
	}
	return chunks;
}

export function proseFiles(root: string): string[] {
	return readdirSync(root, { recursive: true, encoding: 'utf8' }).filter(file =>
		/\.(svelte|ts)$/.test(file) && !/\.test\.ts$|\.d\.ts$/.test(file) && !file.includes(`${path.sep}data${path.sep}`)
	).sort().map(file => path.join(root, file));
}

export function readProse(file: string): Chunk[] {
	return extractProse(readFileSync(file, 'utf8'), file);
}
