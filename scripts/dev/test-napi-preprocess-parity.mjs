#!/usr/bin/env node
// Differential gate for the `preprocess()` N-API boundary: what happens when a
// preprocessor FAILS (#3292), and what its returned `attributes` do (#3293).
// Two properties, and only the first one is about parity:
//
//  1. SURVIVAL. A JS callback that throws must reject the returned promise, not
//     terminate the host process. napi-rs routes a thrown callback through
//     `napi_fatal_exception` unless the call site opts out, which took the whole
//     Node process down — in a Vite dev server, one SCSS syntax error killed the
//     server instead of drawing an error overlay. A test that only compared
//     messages could not see this: the process dies before it compares anything,
//     so this file asserts it reaches its own last line.
//
//  2. PARITY. Every cell is run against the official compiler in the same
//     process and the two outcomes must agree, message included. The messages
//     are V8's, because upstream reaches each one by operating on the value the
//     preprocessor handed back; hard-coding expectations here would pin rsvelte
//     to whatever this file's author believed rather than to the oracle.
//
// The error CONSTRUCTOR is deliberately not compared: upstream raises a
// `TypeError` for the three value-shape cells and the N-API boundary can only
// carry an `Error`. That is a real, unfixed divergence — see the PR for #3292.
//
// The attribute grid crosses (code changed?, map returned?, attributes shape).
// The map row is what makes it discriminating: attributes returned *with* a map
// apply even though the code is unchanged, so a grid without it is satisfied by
// "attributes never apply", which is not the rule either.
//
// Prereq: `pnpm run build:vps-native`.

import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { preprocess as officialPreprocess } from '../../submodules/svelte/packages/svelte/src/compiler/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const triple = `${process.platform === 'win32' ? 'win32' : process.platform}-${
  process.arch === 'x64' ? 'x64' : process.arch
}${process.platform === 'linux' ? '-gnu' : process.platform === 'win32' ? '-msvc' : ''}`;
const addonPath = resolve(
  repoRoot,
  `apps/npm/vite-plugin-svelte-native-${triple}/rsvelte.node`,
);
const require_ = createRequire(import.meta.url);
let addon;
try {
  addon = require_(addonPath);
} catch (error) {
  console.error(`Could not load ${addonPath}\nRun: pnpm run build:vps-native\n${error.message}`);
  process.exit(1);
}

const SRC = '<script>let a = 1;</script>\n<p>hi</p>\n<style>p{color:red}</style>\n';

// Every failure shape the issue enumerated, crossed with the three hooks. The
// `markup` / tag split is load-bearing: upstream reads `code` differently either
// side of it, so the same returned value is a no-change on one and a throw on
// the other.
const RESULTS = {
  'empty object': () => ({}),
  'code undefined': () => ({ code: undefined }),
  'code null': () => ({ code: null }),
  'code number': () => ({ code: 42 }),
  'code object': () => ({ code: { toString: () => 'x' } }),
  'sync throw': () => {
    throw new Error('boom');
  },
  'async reject': () => Promise.reject(new Error('boom-async')),
  'async throw': async () => {
    throw new Error('boom-async-throw');
  },
  returns_null: () => null,
  returns_undefined: () => undefined,
};

const cases = [];
for (const hook of ['markup', 'script', 'style']) {
  for (const [label, fn] of Object.entries(RESULTS)) {
    cases.push([`${hook}: ${label}`, { [hook]: fn }]);
  }
}
// A failure in the SECOND preprocessor of a chain runs through a different path
// than the first: the first one's result is already installed when it throws.
cases.push([
  'chain: second markup throws',
  [{ markup: (o) => ({ code: o.content }) }, { markup: () => { throw new Error('mid'); } }],
]);
cases.push([
  'chain: second script throws',
  [{ script: (o) => ({ code: o.content }) }, { script: () => { throw new Error('mid-script'); } }],
]);

// (label, source, preprocessor) — every cell's expectation comes from running the
// official compiler below, never from a literal written here.
const ATTR_SRC = '<script lang="ts">let x = 1;</script>';
const MODULE_SRC = '<script module>\nexport const q = 1;\n</script>\n<p>x</p>\n';
const MAP = { version: 3, sources: ['T.svelte'], names: [], mappings: '' };

for (const [label, src, script] of [
  ['attrs: same code', ATTR_SRC, ({ content }) => ({ code: content, attributes: { foo: 'bar' } })],
  ['attrs: same code, empty', ATTR_SRC, ({ content }) => ({ code: content, attributes: {} })],
  ['attrs: changed code', ATTR_SRC, ({ content }) => ({ code: `${content} `, attributes: { foo: 'bar' } })],
  ['attrs: changed code, empty', ATTR_SRC, ({ content }) => ({ code: `${content} `, attributes: {} })],
  ['attrs: same code + map', ATTR_SRC, ({ content }) => ({ code: content, map: MAP, attributes: { foo: 'bar' } })],
  ['attrs: module kept', MODULE_SRC, ({ content }) => ({ code: content, attributes: { 'data-x': 'y' } })],
]) {
  cases.push([label, { script }, src]);
}

async function outcome(run) {
  try {
    const result = await run();
    return { ok: true, code: result.code };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

const describe = (o) => (o.ok ? `resolved: ${JSON.stringify(o.code)}` : `threw: ${o.message}`);

let failures = 0;
for (const [name, group, source = SRC] of cases) {
  const expected = await outcome(() => officialPreprocess(source, group, { filename: 'P.svelte' }));
  const actual = await outcome(() => addon.preprocess(source, group, { filename: 'P.svelte' }));
  if (describe(expected) === describe(actual)) {
    console.log(`  ok   ${name.padEnd(28)} ${describe(actual)}`);
  } else {
    failures++;
    console.error(
      `  FAIL ${name.padEnd(28)}\n       official: ${describe(expected)}\n       rsvelte : ${describe(actual)}`,
    );
  }
}

// Reaching this line at all is the survival half: an uncaught exception from the
// N-API boundary exits before it.
console.log(`\nreached the end of the script (${cases.length} cells)`);
if (failures > 0) {
  console.error(`${failures} cell(s) diverged`);
  process.exit(1);
}
console.log('all cells match');
