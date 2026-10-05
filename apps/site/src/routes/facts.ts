// Facts a reader can compare between the two page files: numbers, commit ids, `{...}` expressions and excerpt
// references, read from the markup only (scripts and styles are code, not page text).
import { parse } from 'svelte/compiler';

export type Fact = `${'number' | 'commit' | 'expression' | 'excerpt'}:${string}`;

const commit = /\b(?=[0-9a-f]*[a-f])(?=[0-9a-f]*\d)[0-9a-f]{7,40}\b/g;
// A thousands comma or a decimal point is part of the number: `4,000` and `4000` are the same fact.
const number = /\d+(?:[.,]\d+)*/g;

// Encoding names are names, not numbers. Japanese spells them out (no abbreviations); English writes `UTF-16`.
const names = /\bUTF-(?:8|16)\b|\b(?:8|16)-bit\b|ユニコードの(?:8|16)ビット符号化方式/g;

function textFacts(text: string, add: (fact: Fact) => void) {
	for (const m of text.matchAll(commit)) add(`commit:${m[0]}`);
	for (const m of text.replace(commit, ' ').replace(names, ' ').matchAll(number)) add(`number:${m[0].replace(/,(?=\d{3}\b)/g, '')}`);
}

// An expression is compared by its code: string literals are display text, so they are replaced by `''` and only
// the facts inside them are kept. The language argument (`'ja'`, `'en'`) is display text too.
const literal = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\$]|\\.|\$(?!\{))*`/g;

// Attributes that only style or name the element; their numbers are not facts the reader reads.
const styling = new Set(['class', 'style', 'id', 'width', 'height', 'viewBox', 'd', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry', 'points', 'transform']);

export function facts(source: string): Fact[] {
	const out: Fact[] = [];
	const add = (fact: Fact) => out.push(fact);
	const expression = (node: { start: number; end: number }) => {
		const text = source.slice(node.start, node.end);
		for (const m of text.matchAll(literal)) if (!/^.(?:ja|en).$/.test(m[0])) textFacts(m[0].slice(1, -1), add);
		add(`expression:${text.replace(literal, "''").replace(/\s+/g, '')}`);
		for (const m of text.matchAll(/data\.code\.(\w+)/g)) add(`excerpt:${m[1]}`);
	};
	function walk(node: unknown) {
		if (!node || typeof node !== 'object') return;
		if (Array.isArray(node)) return node.forEach(walk);
		const n = node as Record<string, unknown> & { type?: string };
		if (n.type === 'Text') return textFacts(n.data as string, add);
		if (n.type === 'Comment') return;
		if (n.type === 'Attribute' && styling.has(n.name as string)) return;
		if (n.type === 'ExpressionTag' || n.type === 'HtmlTag' || n.type === 'RenderTag') return expression(n.expression as { start: number; end: number });
		for (const key of ['expression', 'test', 'key', 'value', 'index', 'context'] as const) {
			const child = n[key] as { start?: number; end?: number; type?: string } | undefined;
			if (child && typeof child === 'object' && !Array.isArray(child) && typeof child.start === 'number' && child.type !== 'Text' && n.type !== 'Attribute')
				expression(child as { start: number; end: number });
		}
		for (const [key, value] of Object.entries(n)) {
			if (['expression', 'test', 'key', 'index', 'context', 'metadata', 'parent'].includes(key)) continue;
			if (value && typeof value === 'object') walk(value);
		}
	}
	walk(parse(source, { modern: true }).fragment);
	return out;
}
