#!/usr/bin/env node
// Pins OFFICIAL's behaviour, not rsvelte's: `@sveltejs/acorn-typescript@1.0.10` reports a
// comment twice at every TypeScript speculation point, because its `tsLookAhead` restores
// lexer state without ever setting `isLookahead`. Reported in
// `upstream_issues/4251-svelte-acorn-typescript-comment-duplication.md` (#4251); upstream
// fixed it in 1.0.13, so the terminal is a dependency bump in Svelte.
//
// HOW THIS FAILS, AND WHY THAT IS THE POINT: when Svelte bumps the dependency, the seven
// `dup` cells drop from 2 to 1 and the version cell stops reading 1.0.10 — this file goes
// red, and that red is the expiry signal. Delete the entry and the report when it does;
// do not "fix" the expectations.
//
// The three tables are compared WHOLE (one deepStrictEqual each) rather than cell by cell,
// so no single cell can be satisfied by its neighbours passing.
//
// Controlled by rebinding the acorn-layer require to 1.0.13: the seven `dup` cells go 2 -> 1
// while all nine `near`/`ctrl` cells hold at 1, which is what says the table discriminates
// THIS defect and not "comments are reported at all". That control reaches table A only --
// B and C go through Svelte's own resolution, so they move on a real bump and were not
// exercised by the simulation.
import { deepStrictEqual } from 'node:assert';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SUB = join(ROOT, 'submodules', 'svelte');

// The declared range is `^1.0.10`, which PERMITS 1.0.13 -- reading it would not establish
// which version is in play. The lock's resolution is the only thing that does.
function resolvedVersion() {
  const lock = readFileSync(join(SUB, 'pnpm-lock.yaml'), 'utf8');
  const m = lock.match(/@sveltejs\/acorn-typescript['"]?:\s*\n\s*specifier:[^\n]*\n\s*version:\s*([0-9.]+)/);
  return m ? m[1] : 'UNRESOLVED';
}

// Resolved through Svelte's own package rather than a hard-coded `.pnpm/...@1.0.10...`
// path: a hard-coded path stops existing the moment upstream bumps, and the test would
// then die with a module-not-found instead of the "counts moved" expiry it exists to
// report -- failing for the wrong reason at exactly the moment it matters.
const fromSvelte = createRequire(join(SUB, 'packages', 'svelte', 'package.json'));
const acorn = fromSvelte('acorn');
const { tsPlugin } = fromSvelte('@sveltejs/acorn-typescript');
const TS = acorn.Parser.extend(tsPlugin());

// Reaching a `tsLookAhead` call site is sufficient; the DECISION's outcome is irrelevant,
// which is why `(/*c*/ number)` -- deciding it is not a function type -- duplicates too.
// The three sites are `tsIsUnambiguouslyStartOfFunctionType`, `tsIsStartOfMappedType` and
// `tsIsUnambiguouslyIndexSignature`; that is the whole domain.
const CELLS = [
  ['dup',        'fn-type after `(`',              'ts', 'let f: (/*c*/ a: number) => void;'],
  ['dup',        'paren-type, decides NOT fn',     'ts', 'let g: (/*c*/ number);'],
  ['dup',        'mapped type after `{`',          'ts', 'type M = { /*c*/ [K in "a"]: 1 };'],
  ['dup',        'type literal, decides NOT mapped','ts', 'type L = { /*c*/ a: 1 };'],
  ['dup',        'index signature after `[`',      'ts', 'interface I { [/*c*/ k: string]: 1 }'],
  ['dup',        'line comment at fn-type site',   'ts', 'let f: ( // c\n a: number) => void;'],
  ['dup',        'nested paren inside paren',      'ts', 'let f: (/*c*/ (a: number) => void);'],
  ['near',       'plain type annotation',          'ts', 'let a: /*c*/ number;'],
  ['near',       'type alias RHS',                 'ts', 'type A = /*c*/ 1;'],
  ['near',       'param type annotation',          'ts', 'function f(a: /*c*/ number) {}'],
  ['near',       'type argument list',             'ts', 'let a: Array</*c*/ number>;'],
  ['ctrl-value', 'value position',                 'ts', 'let a = /*c*/ 1;'],
  ['ctrl-value', 'before a statement',             'ts', '/*c*/ let a = 1;'],
  ['ctrl-value', 'after all statements',           'ts', 'let a = 1; /*c*/'],
  ['ctrl-nots',  'plain JS arrow param',           'js', 'let f = (/*c*/ a) => a;'],
  ['ctrl-nots',  'plain JS value position',        'js', 'let a = /*c*/ 1;'],
];

const fired = (mode, src) => {
  let n = 0;
  (mode === 'ts' ? TS : acorn.Parser).parse(src, {
    ecmaVersion: 'latest', sourceType: 'module', onComment: () => { n++; },
  });
  return n;
};

// TABLE A -- the acorn layer, 16 cells plus the version cell that makes 17.
const actualA = CELLS.map(([g, label, mode, src]) => [g, label, fired(mode, src)]);
actualA.push(['pin', 'resolved acorn-typescript version', resolvedVersion()]);

const expectedA = [
  ['dup',        'fn-type after `(`',               2],
  ['dup',        'paren-type, decides NOT fn',      2],
  ['dup',        'mapped type after `{`',           2],
  ['dup',        'type literal, decides NOT mapped',2],
  ['dup',        'index signature after `[`',       2],
  ['dup',        'line comment at fn-type site',    2],
  ['dup',        'nested paren inside paren',       2],
  ['near',       'plain type annotation',           1],
  ['near',       'type alias RHS',                  1],
  ['near',       'param type annotation',           1],
  ['near',       'type argument list',              1],
  ['ctrl-value', 'value position',                  1],
  ['ctrl-value', 'before a statement',              1],
  ['ctrl-value', 'after all statements',            1],
  ['ctrl-nots',  'plain JS arrow param',            1],
  ['ctrl-nots',  'plain JS value position',         1],
  ['pin',        'resolved acorn-typescript version', '1.0.10'],
];

// The `near` and `ctrl` rows are what make the `dup` rows mean something: if a future
// version simply stopped reporting comments, every row would read 1 and this table would
// still be wrong, which the 2-vs-1 contrast catches and a bare "dup fires twice" would not.
const official = await import(join(SUB, 'packages/svelte/src/compiler/index.js'));

function commentLists(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) { for (const n of node) commentLists(n, out); return out; }
  for (const k of ['comments', 'leadingComments', 'trailingComments']) {
    if (Array.isArray(node[k]) && node[k].length) {
      out.push(`${k}=${node[k].map((c) => `${c.start}..${c.end}`).join(',')}`);
    }
  }
  for (const [k, v] of Object.entries(node)) {
    if (['comments', 'leadingComments', 'trailingComments'].includes(k)) continue;
    if (v && typeof v === 'object') commentLists(v, out);
  }
  return out;
}

// TABLE B -- the `parse()` face. Spans, not counts: a doubled span is the observable, and
// a count alone would be satisfied by two DIFFERENT comments.
const B = [
  ['fn-type after `(`',  '<script lang="ts">let f: (/*c*/ a: number) => void;</script>'],
  ['mapped type',        '<script lang="ts">type M = { /*c*/ [K in "a"]: 1 };</script>'],
  ['NEG value position', '<script lang="ts">let a = /*c*/ 1;</script>'],
];
const actualB = B.map(([l, src]) => [l, commentLists(official.parse(src, { modern: true }))]);
const expectedB = [
  ['fn-type after `(`',  ['comments=26..31,26..31', 'leadingComments=26..31,26..31']],
  ['mapped type',        ['comments=29..34,29..34', 'leadingComments=29..34,29..34']],
  ['NEG value position', ['comments=26..31', 'leadingComments=26..31']],
];

// TABLE C -- the `compile()` face, kept SEPARATE because rsvelte's own count there is 0,
// not 1: that cell superimposes this defect with rsvelte's erasure of a comment inside a
// stripped type annotation (#4244). Only official's side is pinned here.
const C = [
  ['fn-type after `(`',  'let f: (/*c*/ a: number) => void;'],
  ['mapped type',        'type M = { /*c*/ [K in "a"]: 1 };'],
  ['NEG value position', 'let a = /*c*/ 1;'],
];
const actualC = C.map(([l, body]) => {
  const src = `<script lang="ts">\n\t${body}\n\tlet k = 1;\n</script>\n{k}\n`;
  return [l, (official.compile(src, { generate: 'client' }).js.code.match(/\/\*c\*\//g) || []).length];
});
const expectedC = [
  ['fn-type after `(`',  2],
  ['mapped type',        2],
  ['NEG value position', 1],
];

let failed = false;
for (const [name, actual, expected] of [
  ['A (acorn layer, 17 cells)', actualA, expectedA],
  ['B (parse() face)', actualB, expectedB],
  ['C (compile() face)', actualC, expectedC],
]) {
  try {
    deepStrictEqual(actual, expected);
    console.log(`[acorn-comment-duplication] table ${name}: ${actual.length} cells as pinned`);
  } catch {
    failed = true;
    console.error(`[acorn-comment-duplication] table ${name} MOVED.`);
    console.error('  actual:   ' + JSON.stringify(actual));
    console.error('  expected: ' + JSON.stringify(expected));
  }
}
if (failed) {
  console.error(
    '\nIf Svelte has bumped @sveltejs/acorn-typescript to >= 1.0.13, this is the EXPIRY of\n' +
    'upstream_issues/4251-svelte-acorn-typescript-comment-duplication.md (#4251):\n' +
    'delete that report, its README row, and this file. Do not edit the expectations.',
  );
  process.exit(1);
}
