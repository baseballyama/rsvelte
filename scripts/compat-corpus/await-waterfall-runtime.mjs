#!/usr/bin/env node
/**
 * Runtime gate for `await_waterfall` (#2540).
 *
 * Every other gate in this directory compares compiler OUTPUT. None of them can
 * see this defect's consequence: `$.async_derived(thunk)` without its dev
 * `location` argument is valid JavaScript that parses, formats and — for a
 * corpus that never sets `experimental.async` — never appears at all, while the
 * runtime warning it disarms is gated on `location !== undefined`
 * (`internal/client/reactivity/deriveds.js`). A warning that can never fire is
 * invisible to a warning ratchet by construction, so this script executes the
 * compiled component instead of reading it.
 *
 * It is differential AND absolute. Differential: rsvelte's warnings must equal
 * the official compiler's for the same input. Absolute: the `waterfall` case
 * MUST warn and the `ignored` case MUST NOT — without that pair, "both
 * compilers were silent" would pass, which is exactly the state #2540 shipped
 * in.
 *
 * Usage: node scripts/compat-corpus/await-waterfall-runtime.mjs
 */

// esm-env's `DEV` is read at module load from NODE_ENV; the compiled component
// only takes its dev branches when the runtime agrees it is a dev build.
process.env.NODE_ENV = 'development';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SVELTE_PKG = path.join(ROOT, 'submodules/svelte/packages/svelte');
const BINDING = path.join(ROOT, '.corpus-cache/rsvelte.node');

function bail(message, ...hints) {
	console.error(`[waterfall] ${message}`);
	for (const hint of hints) console.error(`  ${hint}`);
	process.exit(2);
}

if (!fs.existsSync(path.join(SVELTE_PKG, 'src/compiler/index.js'))) {
	bail('official compiler missing', 'fix: git submodule update --init --depth 1 submodules/svelte');
}
if (!fs.existsSync(BINDING)) {
	bail(
		`rsvelte NAPI binding missing at ${path.relative(ROOT, BINDING)}`,
		'build: cargo build --release -p rsvelte_napi --lib'
	);
}

const svelteRequire = createRequire(path.join(SVELTE_PKG, 'package.json'));
let jsdomPath;
try {
	jsdomPath = svelteRequire.resolve('jsdom');
} catch {
	bail(
		'jsdom missing',
		'fix: (cd submodules/svelte && pnpm install --frozen-lockfile)'
	);
}

const { JSDOM } = await import(jsdomPath);
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
for (const key of [
	'window',
	'document',
	'HTMLElement',
	'Element',
	'Node',
	'Text',
	'Comment',
	'DocumentFragment',
	'CustomEvent',
	'Event',
	'MutationObserver',
]) {
	globalThis[key] = key === 'window' ? dom.window : dom.window[key];
}
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame?.bind(dom.window);

const official = await import(path.join(SVELTE_PKG, 'src/compiler/index.js'));
const rsvelte = require(BINDING);
const { mount, unmount, tick } = await import(path.join(SVELTE_PKG, 'src/index-client.js'));

const TMP = path.join(SVELTE_PKG, '.rsvelte-waterfall-tmp');

/**
 * Two independent async deriveds resolving at different times: the template
 * effect only runs once BOTH have settled, so `a` sits unread while `b` is
 * still pending — the waterfall the warning exists for.
 */
const component = (annotation) => `<script>
	let { fast, slow } = $props();
	${annotation}const a = $derived(await fast());
	const b = $derived(await slow());
</script>

<p>{a}{b}</p>
`;

const CASES = [
	{ name: 'waterfall', source: component(''), expect: ['a'] },
	{
		name: 'ignored',
		source: component('// svelte-ignore await_waterfall\n\t'),
		expect: [],
	},
	{
		// A `svelte-ignore` for a DIFFERENT code must not suppress this one.
		name: 'unrelated-ignore',
		source: component('// svelte-ignore state_referenced_locally\n\t'),
		expect: ['a'],
	},
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let counter = 0;

async function warningsFor(compiler, source) {
	const code = compiler.compile(source, {
		generate: 'client',
		dev: true,
		filename: 'src/Waterfall.svelte',
		experimental: { async: true },
	}).js.code;

	fs.mkdirSync(TMP, { recursive: true });
	const file = path.join(TMP, `case-${counter++}.js`);
	fs.writeFileSync(file, code);
	const module = await import(file);

	const seen = [];
	const realWarn = console.warn;
	console.warn = (...args) => {
		const text = args.join(' ');
		const match = /await_waterfall\n[\s\S]*?async derived, `([^`]+)`/.exec(text);
		if (match) seen.push(match[1]);
	};
	try {
		const instance = mount(module.default, {
			target: document.body,
			props: {
				fast: async () => 1,
				slow: async () => {
					await sleep(40);
					return 2;
				},
			},
		});
		await sleep(200);
		await tick();
		unmount(instance);
		await tick();
	} finally {
		console.warn = realWarn;
		document.body.innerHTML = '';
	}
	return seen.sort();
}

let failures = 0;
for (const testCase of CASES) {
	const expected = await warningsFor(official, testCase.source);
	const actual = await warningsFor(rsvelte, testCase.source);
	const want = [...testCase.expect].sort();

	// The oracle first: if official does not produce the declared warnings, the
	// harness is broken and a matching rsvelte result means nothing.
	if (JSON.stringify(expected) !== JSON.stringify(want)) {
		console.error(
			`[waterfall] ❌ ${testCase.name}: HARNESS — official warned ${JSON.stringify(expected)}, expected ${JSON.stringify(want)}`
		);
		failures += 1;
		continue;
	}
	if (JSON.stringify(actual) !== JSON.stringify(expected)) {
		console.error(
			`[waterfall] ❌ ${testCase.name}: rsvelte warned ${JSON.stringify(actual)}, official ${JSON.stringify(expected)}`
		);
		failures += 1;
		continue;
	}
	console.log(`[waterfall] ✅ ${testCase.name}: ${JSON.stringify(actual)}`);
}

fs.rmSync(TMP, { recursive: true, force: true });

if (failures) {
	console.error(`\n[waterfall] ${failures} of ${CASES.length} cases diverge`);
	process.exit(1);
}
console.log(`\n[waterfall] ✅ ${CASES.length} cases: rsvelte-compiled output warns exactly as official's does`);
process.exit(0);
