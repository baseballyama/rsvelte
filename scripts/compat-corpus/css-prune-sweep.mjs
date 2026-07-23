#!/usr/bin/env node
/**
 * Combinatorial differential test harness for unused-CSS pruning.
 *
 * The corpus pipeline (compile.mjs / verify.mjs) compares real-world code
 * byte-for-byte, but real components almost never hit the odd combinations that
 * break the prune algorithm's per-sibling traversal (issue #1700:
 * `.a + .a` × `{#each}`-generated siblings × a `<svelte:head>` void element).
 *
 * This script *generates* many tiny synthetic components from a grid of
 * ingredients — selector shape × sibling-producing markup context × an
 * unrelated "corruptor" node elsewhere in the template — compiles each with
 * BOTH the official `svelte/compiler` and rsvelte (NAPI binding), and diffs the
 * emitted `css.code`. The prune decision is visible in the CSS as
 * "(unused)" comments plus scoping-class (`.svelte-<hash>`) placement,
 * so a css.code divergence is a prune divergence.
 *
 * CSS pruning is a phase-2 analysis and target-independent, so one compile
 * (generate: 'client', css: 'external') per component suffices; --both verifies
 * client and server prune identically.
 *
 * Usage:
 *   node scripts/compat-corpus/css-prune-sweep.mjs              # full sweep + report
 *   node scripts/compat-corpus/css-prune-sweep.mjs --filter .a+.a
 *   node scripts/compat-corpus/css-prune-sweep.mjs --id <component-id>   # print source + both CSS
 *   node scripts/compat-corpus/css-prune-sweep.mjs --list      # list every generated id
 *   node scripts/compat-corpus/css-prune-sweep.mjs --both      # also assert client==server prune
 *   node scripts/compat-corpus/css-prune-sweep.mjs --check     # CI gate against the ratchet
 *   node scripts/compat-corpus/css-prune-sweep.mjs --update-baseline
 *
 * Requires a staged NAPI binding at .corpus-cache/rsvelte.node
 * (cargo build --release -p rsvelte_napi --lib,
 *  then cp target/release/librsvelte_napi.dylib .corpus-cache/rsvelte.node).
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');
const RATCHET = path.join(CORPUS, 'css-prune-known-failures.json');

const args = process.argv.slice(2);
const argValue = (name, fallback = null) => {
	const i = args.indexOf(name);
	return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const FILTER = argValue('--filter');
const ONE_ID = argValue('--id');
const LIST = args.includes('--list');
const BOTH = args.includes('--both');
const CHECK = args.includes('--check');
const UPDATE_BASELINE = args.includes('--update-baseline');

// ---------------------------------------------------------------------------
// grid ingredients
// ---------------------------------------------------------------------------

// A "role" is the element a selector wants at a given position. Class roles
// carry the class the selector references; tag roles are bare tags.
const ROLE = {
	a: '<div class="a"></div>',
	b: '<div class="b"></div>',
	c: '<div class="c"></div>',
	p: '<p></p>',
	span: '<span class="x"></span>', // stands in for `*`
	section: '<section></section>',
	z: '<div class="z"></div>',
};

// Family A — flat sibling lists. `sibs` is the ordered list of adjacent
// siblings a positive match needs; `css` is the rule body's selector.
const SELECTORS_A = [
	{ id: '.a+.a', css: '.a + .a', sibs: ['a', 'a'] },
	{ id: '.a~.a', css: '.a ~ .a', sibs: ['a', 'a'] },
	{ id: 'p+p', css: 'p + p', sibs: ['p', 'p'] },
	{ id: '.a+.b', css: '.a + .b', sibs: ['a', 'b'] },
	{ id: '.a~.b', css: '.a ~ .b', sibs: ['a', 'b'] },
	{ id: '.a+.b+.c', css: '.a + .b + .c', sibs: ['a', 'b', 'c'] },
	{ id: '*+.a', css: '* + .a', sibs: ['span', 'a'] },
	{ id: '.a:first-child', css: '.a:first-child', sibs: ['a'] },
	{ id: '.a:last-child', css: '.a:last-child', sibs: ['a'] },
	{ id: '.a:has(+.b)', css: '.a:has(+ .b)', sibs: ['a', 'b'] },
	{ id: ':global(.a)+.b', css: ':global(.a) + .b', sibs: ['a', 'b'] },
	{ id: '.a+:global(.b)', css: '.a + :global(.b)', sibs: ['a', 'b'] },
	// nested rule with parent-selector sibling combinator
	{ id: '&+&', css: '.a {\n\t\t& + & { color: red; }\n\t}', sibs: ['a', 'a'], rawCss: true },
];

// Family B — nested (descendant / child) selectors. `nest` is outer→inner.
const SELECTORS_B = [
	{ id: '.a .b', css: '.a .b', nest: ['a', 'b'] },
	{ id: '.a>.b', css: '.a > .b', nest: ['a', 'b'] },
	{ id: 'section>.a', css: 'section > .a', nest: ['section', 'a'] },
];

// Family C — multi-relative sibling selectors whose match hinges on an ancestor
// constraint (issue #1719): a sibling combinator sits after a descendant/child
// chain, reached either through `:global(...)`'s inner selector or through a
// nested rule's `&` resolving to a multi-relative parent prelude. `ancestor` is
// the class wrapping the `sibs`; `sep` (optional) separates the two siblings for
// a `~` combinator.
const SELECTORS_C = [
	{ id: 'global(.a_.z)+.b', css: ':global(.a .z) + .b', ancestor: 'a', sibs: ['z', 'b'] },
	{ id: 'global(.a>.z)+.b', css: ':global(.a > .z) + .b', ancestor: 'a', sibs: ['z', 'b'] },
	{
		id: '.foo>.a{&+&}',
		css: '.foo > .a {\n\t\t& + & { color: red; }\n\t}',
		rawCss: true,
		ancestor: 'foo',
		sibs: ['a', 'a'],
	},
	{
		id: '.foo>.a{&~&}',
		css: '.foo > .a {\n\t\t& ~ & { color: red; }\n\t}',
		rawCss: true,
		ancestor: 'foo',
		sibs: ['a', 'a'],
		sep: '<span></span>',
	},
];

// Family C arrangements: whether the ancestor constraint is satisfiable.
// `ancestor` wraps the sibling pair in the required ancestor (positive);
// `root` puts them at the top level and `wrong` under a mismatching ancestor
// (both negatives). Official and rsvelte must agree in every arrangement.
const ARRANGE_C = {
	ancestor: (sel, inner) => `<div class="${sel.ancestor}">${inner}</div>`,
	ancestor_each: (sel, inner) => `<div class="${sel.ancestor}">{#each list as _}${inner}{/each}</div>`,
	root: (_sel, inner) => inner,
	wrong: (_sel, inner) => `<section>${inner}</section>`,
};

// Family C3 — three-level nesting whose innermost `& +/~ &` must resolve every
// ancestor level (`.grand` AND `.foo`), not just the immediate parent (issue
// #1719 review regression). `sep` separates the two `.a` for `~`.
const SELECTORS_C3 = [
	{
		id: '.grand{.foo>.a{&+&}}',
		css: '.grand {\n\t\t.foo > .a { & + & { color: red; } }\n\t}',
		rawCss: true,
		sibs: ['a', 'a'],
	},
	{
		id: '.grand{.foo>.a{&~&}}',
		css: '.grand {\n\t\t.foo > .a { & ~ & { color: red; } }\n\t}',
		rawCss: true,
		sibs: ['a', 'a'],
		sep: '<span></span>',
	},
];

// Family C3 arrangements: `full` satisfies both ancestors; `no_grand` breaks the
// outer link (`.foo` not under `.grand`); `no_foo` breaks the inner link (`.a`
// directly under `.grand`); `flat` puts the pair at the root. Only `full` is a
// keep — the rest prune — and official and rsvelte must agree in each.
const ARRANGE_C3 = {
	full: (inner) => `<div class="grand"><div class="foo">${inner}</div></div>`,
	full_each: (inner) => `<div class="grand"><div class="foo">{#each list as _}${inner}{/each}</div></div>`,
	no_grand: (inner) => `<div class="grand"></div><div class="foo">${inner}</div>`,
	no_foo: (inner) => `<div class="grand">${inner}</div>`,
	flat: (inner) => inner,
};

const wrapNest = (roles) => {
	// build <outer>…<inner></inner>…</outer>, keeping the class on the div.
	let inner = '';
	for (let i = roles.length - 1; i >= 0; i--) {
		const open = ROLE[roles[i]].replace(/><\/\w+>$/, '>');
		const close = ROLE[roles[i]].match(/<\/(\w+)>$/)[0];
		inner = `${open}${inner}${close}`;
	}
	return inner;
};

// Contexts (family A): given the array of sibling element strings, produce
// markup that arranges them so the prune walker must reason about them.
const CONTEXTS = {
	literal: (els) => els.join(''),
	each_all: (els) => `{#each list as _}${els.join('')}{/each}`,
	each_each: (els) => els.map((e) => `{#each list as _}${e}{/each}`).join(''),
	each_repeat_single: (els) => `{#each list as _}${els[0]}{/each}`, // the #1700 shape
	if_all: (els) => `{#if cond}${els.join('')}{/if}`,
	if_else_split: (els) =>
		`{#if cond}${els[0]}{:else}${(els.slice(1).join('') || els[0])}{/if}`,
	nested_each: (els) => `{#each list as _}{#each list as _}${els.join('')}{/each}{/each}`,
	await_then: (els) => `{#await promise}{:then _}${els.join('')}{/await}`,
	key_block: (els) => `{#key k}${els.join('')}{/key}`,
	snippet_render: (els) => `{#snippet snip()}${els.join('')}{/snippet}{@render snip()}`,
};
const CONTEXT_B = {
	literal: (m) => m,
	each_all: (m) => `{#each list as _}${m}{/each}`,
	if_all: (m) => `{#if cond}${m}{/if}`,
};

// Structural corruptors — nodes elsewhere in the template that must not affect
// the prune decision but historically have (svelte:head void element = #1700).
const CORRUPTORS_STRUCTURAL = {
	none: '',
	head_void: '<svelte:head><meta name="x" content="y" /></svelte:head>',
	head_title: '<svelte:head><title>t</title></svelte:head>',
	head_link_void: '<svelte:head><link rel="x" href="y" /></svelte:head>',
	window: '<svelte:window />',
	body: '<svelte:body />',
	void_before: '<br />',
	html_before: '{@html html}',
};

// Inline corruptors — inserted BETWEEN the first two siblings. Elements/@html
// break direct adjacency (`.a + .b`); comments/text/whitespace do not. Crossed
// with the two contexts whose siblings are directly juxtaposed.
const CORRUPTORS_INLINE = {
	void_between: '<br />',
	comment_between: '<!-- c -->',
	text_between: ' text ',
	expr_between: '{val}',
	html_between: '{@html html}',
};
const INLINE_CONTEXTS = ['literal', 'each_all'];

const SCRIPT = `<script>
	let list = [1, 2, 3];
	let cond = true;
	let promise = Promise.resolve(1);
	let k = 1;
	let html = '<i>x</i>';
	let val = 'v';
</script>
`;

function styleBlock(sel) {
	const body = sel.rawCss ? sel.css : `${sel.css} { color: red; }`;
	return `<style>\n\t${body}\n</style>\n`;
}

function assemble({ script = SCRIPT, prefix = '', markup, sel }) {
	return `${script}${prefix}\n${markup}\n${styleBlock(sel)}`;
}

// ---------------------------------------------------------------------------
// component generation (deterministic — id encodes the full recipe)
// ---------------------------------------------------------------------------

function* generate() {
	// Family A: selector × context × structural corruptor
	for (const sel of SELECTORS_A) {
		const els = sel.sibs.map((r) => ROLE[r]);
		for (const [ctxName, ctxFn] of Object.entries(CONTEXTS)) {
			// each_repeat_single only meaningful for homogeneous / first-role sibs
			const markup = ctxFn(els);
			for (const [corrName, corr] of Object.entries(CORRUPTORS_STRUCTURAL)) {
				yield {
					id: `A/${sel.id}/${ctxName}/${corrName}`,
					source: assemble({ prefix: corr, markup, sel }),
				};
			}
		}
		// inline corruptors (need ≥2 siblings), only in directly-juxtaposed contexts
		if (els.length >= 2) {
			for (const ctxName of INLINE_CONTEXTS) {
				for (const [corrName, corr] of Object.entries(CORRUPTORS_INLINE)) {
					const injected = [els[0] + corr, ...els.slice(1)];
					const markup = CONTEXTS[ctxName](injected);
					yield {
						id: `A/${sel.id}/${ctxName}/inline_${corrName}`,
						source: assemble({ prefix: '', markup, sel }),
					};
				}
			}
		}
	}
	// Family C: multi-relative sibling selector × ancestor arrangement ×
	// structural corruptor.
	for (const sel of SELECTORS_C) {
		const inner = sel.sibs.map((r) => ROLE[r]).join(sel.sep ?? '');
		for (const [arrName, arrFn] of Object.entries(ARRANGE_C)) {
			const markup = arrFn(sel, inner);
			for (const [corrName, corr] of Object.entries(CORRUPTORS_STRUCTURAL)) {
				yield {
					id: `C/${sel.id}/${arrName}/${corrName}`,
					source: assemble({ prefix: corr, markup, sel }),
				};
			}
		}
	}
	// Family C3: three-level nested sibling selector × ancestor arrangement ×
	// structural corruptor.
	for (const sel of SELECTORS_C3) {
		const inner = sel.sibs.map((r) => ROLE[r]).join(sel.sep ?? '');
		for (const [arrName, arrFn] of Object.entries(ARRANGE_C3)) {
			const markup = arrFn(inner);
			for (const [corrName, corr] of Object.entries(CORRUPTORS_STRUCTURAL)) {
				yield {
					id: `C3/${sel.id}/${arrName}/${corrName}`,
					source: assemble({ prefix: corr, markup, sel }),
				};
			}
		}
	}
	// Family B: nested selector × nested context × structural corruptor
	for (const sel of SELECTORS_B) {
		const nested = wrapNest(sel.nest);
		for (const [ctxName, ctxFn] of Object.entries(CONTEXT_B)) {
			const markup = ctxFn(nested);
			for (const [corrName, corr] of Object.entries(CORRUPTORS_STRUCTURAL)) {
				yield {
					id: `B/${sel.id}/${ctxName}/${corrName}`,
					source: assemble({ prefix: corr, markup, sel }),
				};
			}
		}
	}
}

// ---------------------------------------------------------------------------
// compile + compare
// ---------------------------------------------------------------------------

const all0 = [...generate()].filter((c) => !FILTER || c.id.includes(FILTER));
if (LIST) {
	for (const c of all0) console.log(c.id);
	console.log(`\n${all0.length} components`);
	process.exit(0);
}

const svelte = await import(
	path.join(ROOT, 'submodules/svelte/packages/svelte/src/compiler/index.js')
);
let rsvelte;
try {
	rsvelte = require(path.join(ROOT, '.corpus-cache/rsvelte.node'));
} catch (e) {
	console.error('[css-prune-sweep] rsvelte NAPI binding missing at .corpus-cache/rsvelte.node');
	console.error('  build: cargo build --release -p rsvelte_napi --lib');
	console.error('  stage: cp target/release/librsvelte_napi.dylib .corpus-cache/rsvelte.node');
	process.exit(1);
}

// Collapse the scope-hash value (not its placement) so a diff isolates the
// prune decision, not any hash-algorithm drift.
const normHash = (css) => (css ?? '').replace(/svelte-[0-9a-z]+/g, 'svelte-X');

function compileCss(compiler, source) {
	try {
		const r = compiler.compile(source, {
			generate: 'client',
			dev: false,
			css: 'external',
			filename: 'Comp.svelte',
		});
		return { css: normHash(r.css?.code ?? '') };
	} catch (e) {
		const message = String(e?.message ?? e);
		let code = e?.code ?? null;
		if (!code || code === 'GenericFailure') {
			const m =
				message.match(/svelte\.dev\/e\/([a-z0-9_]+)/) ?? message.match(/code: "([a-z0-9_]+)"/);
			if (m) code = m[1];
		}
		return { error: { code, message: message.split('\n')[0] } };
	}
}

function compileCssTarget(compiler, source, generate) {
	try {
		const r = compiler.compile(source, { generate, dev: false, css: 'external', filename: 'Comp.svelte' });
		return normHash(r.css?.code ?? '');
	} catch {
		return null;
	}
}

// ---------------------------------------------------------------------------
// modes
// ---------------------------------------------------------------------------

const all = all0;

if (ONE_ID) {
	const c = all.find((c) => c.id === ONE_ID) ?? [...generate()].find((c) => c.id === ONE_ID);
	if (!c) {
		console.error(`no component with id ${ONE_ID}`);
		process.exit(2);
	}
	console.log(`===== ${c.id} =====\n${c.source}`);
	const e = compileCss(svelte, c.source);
	const a = compileCss(rsvelte, c.source);
	console.log('----- official css -----\n' + (e.error ? `ERROR ${e.error.code}: ${e.error.message}` : e.css));
	console.log('----- rsvelte css  -----\n' + (a.error ? `ERROR ${a.error.code}: ${a.error.message}` : a.css));
	console.log('----- verdict -----\n' + verdictOf(e, a));
	process.exit(0);
}

function verdictOf(e, a) {
	if (e.error && a.error) return e.error.code === a.error.code ? 'match (error parity)' : `error-mismatch (official ${e.error.code} / rsvelte ${a.error.code})`;
	if (e.error && !a.error) return `error-mismatch (official errors ${e.error.code}, rsvelte compiles)`;
	if (!e.error && a.error) return `error-mismatch (rsvelte errors ${a.error.code}, official compiles)`;
	return e.css === a.css ? 'match' : 'css-mismatch';
}

// full sweep
const diverged = [];
let matched = 0;
let clientServerDiffs = 0;
const t0 = Date.now();

for (const c of all) {
	const e = compileCss(svelte, c.source);
	const a = compileCss(rsvelte, c.source);
	const verdict = verdictOf(e, a);
	if (verdict.startsWith('match')) {
		matched++;
	} else {
		diverged.push({ ...c, verdict, exp: e, act: a });
	}
	if (BOTH && !e.error && !a.error) {
		const eServer = compileCssTarget(svelte, c.source, 'server');
		const aServer = compileCssTarget(rsvelte, c.source, 'server');
		if (eServer !== e.css || aServer !== a.css) clientServerDiffs++;
	}
}

const divergedIds = diverged.map((d) => d.id).sort();

// ---------------------------------------------------------------------------
// clustering (root-cause signature, biggest first)
// ---------------------------------------------------------------------------

function firstCssDiff(exp, act) {
	const el = (exp ?? '').split('\n');
	const al = (act ?? '').split('\n');
	for (let i = 0; i < Math.max(el.length, al.length); i++) {
		if (el[i] !== al[i]) return { e: el[i] ?? '<EOF>', a: al[i] ?? '<EOF>' };
	}
	return { e: '', a: '' };
}

function clusterSig(d) {
	if (d.verdict.startsWith('error-mismatch')) return `ERROR: ${d.verdict}`;
	const { e, a } = firstCssDiff(d.exp.css, d.act.css);
	const dir =
		e.includes('(unused)') && !a.includes('(unused)')
			? 'official-prunes/rsvelte-keeps'
			: !e.includes('(unused)') && a.includes('(unused)')
				? 'official-keeps/rsvelte-prunes'
				: 'other';
	const corr = d.id.split('/').pop();
	const ctx = d.id.split('/')[2];
	// A void element in <svelte:head> is the #1700 perturbation — collapse its
	// two variants (meta/link) into one root cause regardless of selector/ctx.
	if (corr === 'head_void' || corr === 'head_link_void') {
		return `[head-void perturbation #1700] ${dir}`;
	}
	// Everything else is a genuine context/selector prune bug independent of the
	// head corruptor — key it by the structural cause.
	return `[${dir}] ctx=${ctx} corr=${corr}`;
}

const clusters = new Map();
for (const d of diverged) {
	const sig = clusterSig(d);
	if (!clusters.has(sig)) clusters.set(sig, []);
	clusters.get(sig).push(d);
}
const sortedClusters = [...clusters.entries()].sort((x, y) => y[1].length - x[1].length);

// ---------------------------------------------------------------------------
// output / gate
// ---------------------------------------------------------------------------

if (UPDATE_BASELINE) {
	fs.writeFileSync(RATCHET, JSON.stringify(divergedIds, null, '\t') + '\n');
	console.log(`[css-prune-sweep] baseline updated: ${divergedIds.length} known divergences -> ${path.relative(ROOT, RATCHET)}`);
	process.exit(0);
}

console.log(`[css-prune-sweep] ${all.length} components in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log(`  matched:  ${matched}`);
console.log(`  diverged: ${diverged.length}`);
if (BOTH) console.log(`  client!=server prune divergences: ${clientServerDiffs}`);

if (diverged.length) {
	console.log(`\n${sortedClusters.length} divergence clusters:\n`);
	for (const [sig, ds] of sortedClusters) {
		console.log(`${String(ds.length).padStart(4)}  ${sig}`);
		for (const d of ds.slice(0, 3)) console.log(`        - ${d.id}`);
	}
}

if (CHECK) {
	const baseline = new Set(fs.existsSync(RATCHET) ? JSON.parse(fs.readFileSync(RATCHET, 'utf8')) : []);
	const regressions = divergedIds.filter((id) => !baseline.has(id));
	const fixed = [...baseline].filter((id) => !divergedIds.includes(id));
	if (fixed.length) {
		console.log(`\n[css-prune-sweep] ${fixed.length} baseline divergences now fixed — shrink the ratchet:`);
		for (const id of fixed.slice(0, 20)) console.log(`  - ${id}`);
		console.log('  run: node scripts/compat-corpus/css-prune-sweep.mjs --update-baseline');
	}
	if (regressions.length) {
		console.error(`\n[css-prune-sweep] ${regressions.length} NEW prune divergence(s) (regressions):`);
		for (const id of regressions.slice(0, 40)) {
			const d = diverged.find((x) => x.id === id);
			console.error(`  - ${id}  [${d.verdict}]`);
		}
		process.exit(1);
	}
	console.log(`\n[css-prune-sweep] no regressions (${divergedIds.length} known divergences)`);
	process.exit(0);
}

process.exit(0);
