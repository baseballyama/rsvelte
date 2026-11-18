// The canonical JS AST: what "compare compiled output as AST" means, specified once.
//
// ESTree as acorn produces it, with
//   - positions (`start`, `end`, `loc`, `range`) removed,
//   - `Literal.raw` removed (quote style and numeric spelling are formatting); regex literals keep
//     `regex`, bigint literals keep `bigint`, and their unserializable `value` becomes null,
//   - comments removed, except `@__PURE__` / `#__PURE__` annotations, which change what a bundler
//     may drop: a call or `new` immediately preceded by one carries `pure: true`,
//   - keys sorted, `type` first (files.sortKeys).
// Any implementation (the Rust harness included) must produce the same tree for the same text.
import * as acorn from 'acorn';
import { sortKeys } from './files.ts';

export type Node = { [key: string]: unknown };
type Tree = unknown;

const DROP = new Set(['start', 'end', 'loc', 'range']);
const PURE = /^[\s*]*[@#]__PURE__[\s*]*$/;

export function parseJs(code: string): Node {
	const comments: acorn.Comment[] = [];
	const ast = acorn.parse(code, {
		ecmaVersion: 'latest',
		sourceType: 'module',
		onComment: comments,
	});
	const pureStarts = new Set<number>();
	for (const c of comments) {
		if (!PURE.test(c.value)) continue;
		let i = c.end;
		while (i < code.length && /\s/.test(code[i]!)) i++;
		pureStarts.add(i);
	}
	return canonicalize(ast, pureStarts) as Node;
}

function canonicalize(node: Tree, pureStarts: Set<number>): Tree {
	if (Array.isArray(node)) return node.map((n) => canonicalize(n, pureStarts));
	if (!node || typeof node !== 'object') return node;
	const n = node as Node;
	const out: Node = {};
	for (const [k, v] of Object.entries(n)) {
		if (DROP.has(k)) continue;
		if (n.type === 'Literal' && k === 'raw') continue;
		out[k] = canonicalize(v, pureStarts);
	}
	if (n.type === 'Literal' && (n.regex || n.bigint !== undefined)) out.value = null;
	if (
		(n.type === 'CallExpression' || n.type === 'NewExpression') &&
		pureStarts.has(n.start as number)
	)
		out.pure = true;
	return sortKeys(out);
}

const same = (a: Tree, b: Tree): boolean => JSON.stringify(a) === JSON.stringify(b);

/** First path at which two trees differ, or null. */
export function firstDiff(a: Tree, b: Tree, at = ''): string | null {
	if (same(a, b)) return null;
	if (
		!a ||
		!b ||
		typeof a !== 'object' ||
		typeof b !== 'object' ||
		Array.isArray(a) !== Array.isArray(b)
	)
		return at;
	const na = a as Node;
	const nb = b as Node;
	if (na.type !== nb.type) return at;
	for (const k of new Set([...Object.keys(na), ...Object.keys(nb)])) {
		const d = firstDiff(na[k], nb[k], at === '' ? k : `${at}.${k}`);
		if (d !== null) return d;
	}
	return at;
}
