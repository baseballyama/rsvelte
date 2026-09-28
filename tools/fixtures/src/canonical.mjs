// The canonical JS AST: what "compare compiled output as AST" means, specified once.
//
// ESTree as acorn produces it, with
//   - positions (`start`, `end`, `loc`, `range`) removed,
//   - `Literal.raw` removed (quote style and numeric spelling are formatting); regex literals keep
//     `regex`, bigint literals keep `bigint`, and their unserializable `value` becomes null,
//   - comments removed, except `@__PURE__` / `#__PURE__` annotations, which change what a bundler
//     may drop: a call or `new` immediately preceded by one carries `pure: true`,
//   - keys sorted, `type` first (fsutil.sortKeys).
// Any implementation (the Rust harness included) must produce the same tree for the same text.
import * as acorn from 'acorn';
import { sortKeys } from './fsutil.mjs';

const DROP = new Set(['start', 'end', 'loc', 'range']);
const PURE = /^[\s*]*[@#]__PURE__[\s*]*$/;

export function parseJs(code) {
	const comments = [];
	const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', onComment: comments });
	const pureStarts = new Set();
	for (const c of comments) {
		if (!PURE.test(c.value)) continue;
		let i = c.end;
		while (i < code.length && /\s/.test(code[i])) i++;
		pureStarts.add(i);
	}
	return canonicalize(ast, pureStarts);
}

function canonicalize(node, pureStarts) {
	if (Array.isArray(node)) return node.map((n) => canonicalize(n, pureStarts));
	if (!node || typeof node !== 'object') return node;
	const out = {};
	for (const [k, v] of Object.entries(node)) {
		if (DROP.has(k)) continue;
		if (node.type === 'Literal' && k === 'raw') continue;
		out[k] = canonicalize(v, pureStarts);
	}
	if (node.type === 'Literal' && (node.regex || node.bigint !== undefined)) out.value = null;
	if ((node.type === 'CallExpression' || node.type === 'NewExpression') && pureStarts.has(node.start)) out.pure = true;
	return sortKeys(out);
}

export const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Path syntax: dot-separated keys and array indices from the Program, e.g. `body.3.declarations.0.init`. */
export function getAt(tree, at) {
	let cur = tree;
	for (const seg of at === '' ? [] : at.split('.')) {
		if (cur == null) return undefined;
		cur = cur[/^\d+$/.test(seg) ? Number(seg) : seg];
	}
	return cur;
}

export function setAt(tree, at, value) {
	const segs = at.split('.');
	const parent = getAt(tree, segs.slice(0, -1).join('.'));
	const last = segs.at(-1);
	parent[/^\d+$/.test(last) ? Number(last) : last] = value;
}

/** Every path whose subtree equals `target`. */
export function findAll(tree, target, at = '', out = []) {
	if (same(tree, target)) out.push(at);
	if (tree && typeof tree === 'object') {
		for (const [k, v] of Object.entries(tree)) {
			if (v && typeof v === 'object') findAll(v, target, at === '' ? k : `${at}.${k}`, out);
		}
	}
	return out;
}

/** First path at which two trees differ, or null. */
export function firstDiff(a, b, at = '') {
	if (same(a, b)) return null;
	if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return at;
	if (a.type !== b.type) return at;
	const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
	for (const k of keys) {
		const d = firstDiff(a[k], b[k], at === '' ? k : `${at}.${k}`);
		if (d !== null) return d;
	}
	return at;
}

/**
 * A snippet written in an adjustment (`void 0`, `x = 1;`) as a canonical node. Parsed as a program;
 * a lone expression statement yields its expression unless the target is itself a statement.
 */
export function parseSnippet(snippet, targetType) {
	const program = parseJs(snippet);
	if (program.body.length !== 1) throw new Error(`snippet must be one statement or expression: ${snippet}`);
	const stmt = program.body[0];
	if (stmt.type === 'ExpressionStatement' && targetType !== 'ExpressionStatement' && !stmt.directive) return stmt.expression;
	return stmt;
}
