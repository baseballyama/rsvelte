import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse, type AST } from 'svelte/compiler';
import ts from 'typescript';

import type { englishLinter } from '../../../tools/writing/linter.ts';

type Chunk = { text: string; line: number };
type TemplateNode = AST.Fragment['nodes'][number];

const blocks = new Set([
	'p',
	'li',
	'h1',
	'h2',
	'h3',
	'h4',
	'blockquote',
	'td',
	'th',
	'button',
	'summary',
	'label',
	'figcaption',
	'div',
	'title',
	'header',
	'footer',
	'nav',
	'section',
	'figure',
	'dt',
	'dd',
]);
// `content` is the page description of a meta element.
const proseAttributes = new Set(['title', 'label', 'placeholder', 'aria-label', 'alt', 'content']);

const visibleProperties = new Set(['title', 'label', 'message']);

/** The source range of a script's body. Svelte's types omit the offsets that its parser sets on `content`. */
export function contentRange(script: AST.Script): { start: number; end: number } {
	const content = script.content;
	if (
		!(
			'start' in content &&
			typeof content.start === 'number' &&
			'end' in content &&
			typeof content.end === 'number'
		)
	) {
		throw new Error('The Svelte parser gave a script without offsets');
	}
	return { start: content.start, end: content.end };
}

// Each branch of a block, in the order the reader sees it.
function branches(node: TemplateNode): (AST.Fragment | null | undefined)[] {
	switch (node.type) {
		case 'EachBlock':
			return [node.body, node.fallback];
		case 'IfBlock':
			return [node.consequent, node.alternate];
		case 'AwaitBlock':
			return [node.pending, node.then, node.catch];
		case 'SnippetBlock':
			return [node.body];
		default:
			return [];
	}
}

export function extractProse(source: string, file: string): Chunk[] {
	const chunks: Chunk[] = [];
	const add = (text: string, start: number | undefined) => {
		text = text.replace(/\s+/g, ' ').trim();
		if (text) chunks.push({ text, line: source.slice(0, start).split('\n').length });
	};
	// A string in a script is prose when it is the value of a property the page shows.
	function strings(sourceText: string, offset = 0) {
		const tree = ts.createSourceFile(
			file,
			sourceText,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TS,
		);
		function visit(node: ts.Node) {
			const visible =
				node.parent !== undefined &&
				ts.isPropertyAssignment(node.parent) &&
				visibleProperties.has(node.parent.name.getText(tree));
			if (visible && ts.isTemplateExpression(node)) {
				const text =
					node.head.text + node.templateSpans.map((span) => '`value`' + span.literal.text).join('');
				add(text, offset + node.getStart(tree));
			} else if (
				visible &&
				(ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
			) {
				add(node.text, offset + node.getStart(tree));
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
	function fragment(part: AST.Fragment, prefix = '') {
		let text = '';
		let start = 0;
		const flush = () => {
			if (text.trim()) add(prefix + text, start);
			text = '';
		};
		function visit(node: TemplateNode) {
			if (node.type === 'Text') {
				if (!text) start = node.start;
				text += node.data;
				return;
			}
			if (node.type === 'RegularElement' && ['pre', 'script', 'style'].includes(node.name)) return;
			if (node.type === 'RegularElement' && node.name === 'code') {
				const value = node.fragment.nodes
					.map((n) =>
						n.type === 'Text'
							? n.data
							: n.type === 'ExpressionTag' && n.expression.type === 'Literal'
								? String(n.expression.value)
								: 'value',
					)
					.join('');
				if (value) text += '`' + value.replaceAll('`', '\\`') + '`';
				return;
			}
			const name = 'name' in node ? node.name : undefined;
			const block = (name !== undefined && blocks.has(name)) || node.type === 'SnippetBlock';
			if (block) flush();
			for (const attribute of 'attributes' in node ? node.attributes : []) {
				if (
					!('name' in attribute) ||
					!proseAttributes.has(attribute.name) ||
					!('value' in attribute)
				)
					continue;
				const value = attribute.value;
				if (Array.isArray(value))
					add(value.map((n) => (n.type === 'Text' ? n.data : '`value`')).join(''), attribute.start);
			}
			if ('fragment' in node && node.fragment) {
				if (block) {
					const marker =
						name === 'li'
							? '- '
							: name !== undefined && /^h[1-6]$/.test(name)
								? '#'.repeat(Number(name[1])) + ' '
								: '';
					fragment(node.fragment, marker);
				} else {
					const marker =
						name === 'strong' || name === 'b' ? '**' : name === 'em' || name === 'i' ? '*' : '';
					if (marker && !text) start = node.start;
					text += marker;
					for (const child of node.fragment.nodes) visit(child);
					text += marker;
				}
			}
			for (const branch of branches(node)) {
				if (branch?.nodes) {
					flush();
					fragment(branch);
				}
			}
			if (node.type === 'ExpressionTag') {
				text += node.expression.type === 'Literal' ? String(node.expression.value) : '`value`';
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
	return readdirSync(root, { recursive: true, encoding: 'utf8' })
		.filter(
			(file) =>
				/\.(svelte|ts)$/.test(file) &&
				!/\.test\.ts$|\.d\.ts$/.test(file) &&
				!file.includes(`${path.sep}data${path.sep}`),
		)
		.toSorted()
		.map((file) => path.join(root, file));
}

export function readProse(file: string): Chunk[] {
	return extractProse(readFileSync(file, 'utf8'), file);
}

// One document per page, so a heading reads together with the text below it.
export async function lintPage(linter: Awaited<ReturnType<typeof englishLinter>>, chunks: Chunk[]) {
	const { messages } = await linter.lintText(
		chunks.map((chunk) => chunk.text).join('\n\n'),
		'prose.md',
	);
	return messages.map((message) => {
		// Extraction collapses white space, so chunk i is line 2i + 1 of the document.
		const chunk = chunks[Math.floor((message.line - 1) / 2)];
		if (!chunk) throw new Error(`A finding on line ${message.line} is outside the page`);
		return { chunk, message };
	});
}
