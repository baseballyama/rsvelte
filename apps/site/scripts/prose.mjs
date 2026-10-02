import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'svelte/compiler';
import ts from 'typescript';
import { term } from '../src/lib/terms.ts';

const japanese = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const blocks = new Set(['p', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'td', 'th', 'button', 'summary', 'label', 'figcaption', 'div']);
const proseAttributes = new Set(['lead', 'title', 'label', 'abstract', 'placeholder', 'aria-label', 'alt']);

export function extractProse(source, file) {
	const chunks = [];
	const add = (text, start) => {
		text = text.replace(/\s+/g, ' ').trim();
		if (text) chunks.push({ text, line: source.slice(0, start).split('\n').length });
	};
	function strings(sourceText, offset = 0) {
		const tree = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
		function visit(node) {
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
	function expression(node) {
		if (!node || typeof node !== 'object') return;
		if (node.type === 'Literal' && typeof node.value === 'string' && japanese.test(node.value)) add(node.value, node.start);
		if (node.type === 'TemplateElement' && japanese.test(node.value.cooked)) add(node.value.cooked, node.start);
		for (const [key, value] of Object.entries(node)) {
			if (key === 'metadata' || key === 'loc') continue;
			if (Array.isArray(value)) value.forEach(expression);
			else if (value && typeof value === 'object') expression(value);
		}
	}
	function fragment(part, prefix = '') {
		let text = '';
		let start = 0;
		const flush = () => { if (text.trim()) add(prefix + text, start); text = ''; };
		function visit(node) {
			if (node.expression && node.type !== 'ExpressionTag') expression(node.expression);
			if (node.type === 'Component' && node.name === 'Term') {
				const name = node.attributes.find(attribute => attribute.name === 'name');
				if (!name || name.value.length !== 1 || name.value[0].type !== 'Text') throw new Error(`Term needs a static name in ${file}`);
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
			const block = blocks.has(node.name) || node.type === 'SnippetBlock';
			if (block) flush();
			for (const attribute of node.attributes ?? []) {
				if (proseAttributes.has(attribute.name) && attribute.value?.expression) expression(attribute.value.expression);
				if (proseAttributes.has(attribute.name) && Array.isArray(attribute.value)) {
					add(attribute.value.map(n => n.type === 'Text' ? n.data : '`動的な値`').join(''), attribute.start);
					for (const value of attribute.value) if (value.expression) expression(value.expression);
				}
			}
			if (node.fragment) {
				if (block) {
					const marker = node.name === 'li' ? '- ' : /^h[1-6]$/.test(node.name ?? '') ? '#'.repeat(Number(node.name[1])) + ' ' : '';
					fragment(node.fragment, marker);
				} else {
					const marker = ['strong', 'b'].includes(node.name) ? '**' : ['em', 'i'].includes(node.name) ? '*' : '';
					if (marker && !text) start = node.start;
					text += marker;
					for (const child of node.fragment.nodes) visit(child);
					text += marker;
				}
			}
			for (const key of ['body', 'fallback', 'consequent', 'alternate', 'pending', 'then', 'catch']) {
				if (node[key]?.nodes) { flush(); fragment(node[key]); }
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
		if (script) strings(source.slice(script.content.start, script.content.end), script.content.start);
	}
	return chunks;
}

export function proseFiles(root) {
	return readdirSync(root, { recursive: true }).filter(file =>
		/\.(svelte|ts)$/.test(file) && !/\.test\.ts$|\.d\.ts$/.test(file) && !file.includes(`${path.sep}data${path.sep}`)
	).sort().map(file => path.join(root, file));
}

export function readProse(file) {
	return extractProse(readFileSync(file, 'utf8'), file);
}
