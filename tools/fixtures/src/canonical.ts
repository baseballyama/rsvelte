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
import { sortKeys } from './fsutil.ts';

export type Node = { [key: string]: unknown };
type Tree = unknown;

const DROP = new Set(['start', 'end', 'loc', 'range']);
const PURE = /^[\s*]*[@#]__PURE__[\s*]*$/;

export function parseJs(code: string): Node {
	const comments: acorn.Comment[] = [];
	const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', onComment: comments });
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
	if ((n.type === 'CallExpression' || n.type === 'NewExpression') && pureStarts.has(n.start as number)) out.pure = true;
	return sortKeys(out);
}

export const same = (a: Tree, b: Tree): boolean => JSON.stringify(a) === JSON.stringify(b);

const step = (cur: Tree, seg: string): Tree =>
	cur == null ? undefined : (cur as Record<string | number, unknown>)[/^\d+$/.test(seg) ? Number(seg) : seg];

/** Path syntax: dot-separated keys and array indices from the Program, e.g. `body.3.declarations.0.init`. */
export function getAt(tree: Tree, at: string): Tree {
	return (at === '' ? [] : at.split('.')).reduce(step, tree);
}

export function setAt(tree: Tree, at: string, value: Tree): void {
	const segs = at.split('.');
	const parent = getAt(tree, segs.slice(0, -1).join('.')) as Record<string | number, unknown>;
	const last = segs.at(-1)!;
	parent[/^\d+$/.test(last) ? Number(last) : last] = value;
}

/** Every path whose subtree equals `target`. */
export function findAll(tree: Tree, target: Tree, at = '', out: string[] = []): string[] {
	if (same(tree, target)) out.push(at);
	if (tree && typeof tree === 'object') {
		for (const [k, v] of Object.entries(tree)) {
			if (v && typeof v === 'object') findAll(v, target, at === '' ? k : `${at}.${k}`, out);
		}
	}
	return out;
}

/** First path at which two trees differ, or null. */
export function firstDiff(a: Tree, b: Tree, at = ''): string | null {
	if (same(a, b)) return null;
	if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return at;
	const na = a as Node;
	const nb = b as Node;
	if (na.type !== nb.type) return at;
	for (const k of new Set([...Object.keys(na), ...Object.keys(nb)])) {
		const d = firstDiff(na[k], nb[k], at === '' ? k : `${at}.${k}`);
		if (d !== null) return d;
	}
	return at;
}

/**
 * A snippet written in an adjustment (`void 0`, `x = 1;`) as a canonical node. Parsed as a program;
 * a lone expression statement yields its expression unless the target is itself a statement.
 */
export function parseSnippet(snippet: string, targetType: unknown): Node {
	const body = parseJs(snippet).body as Node[];
	if (body.length !== 1) throw new Error(`snippet must be one statement or expression: ${snippet}`);
	const stmt = body[0]!;
	if (stmt.type === 'ExpressionStatement' && targetType !== 'ExpressionStatement' && !stmt.directive) return stmt.expression as Node;
	return stmt;
}
