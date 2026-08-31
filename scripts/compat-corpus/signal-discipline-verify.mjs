#!/usr/bin/env node
/**
 * Assert that rsvelte's generated client program never hands a signal helper
 * something the same program declared as an ordinary value.
 *
 * `two-ports-inventory.md` row 21: upstream resolves a write target once through
 * `scope.get`, while 32 of rsvelte's 44 `*_ast.rs` passes compare identifier text
 * against a `Vec<String>` — so each answers the shadow question separately and a
 * disagreement only reaches output equality where a collected file carries the
 * shape AND diverges on nothing else. The live instance this gate found,
 * `sparrow-app/…/TeamSidePanel.svelte`, is a listed entry on all three output
 * ratchets for two unrelated divergences, so the ratchet suppressed it.
 *
 * The check lives in the compiler behind `RSVELTE_ASSERT_SIGNAL_DISCIPLINE` and
 * prints a `RSVELTE_SIGNAL_DISCIPLINE` line per violation. Hard gate, no ratchet:
 * it measured 0 on the tree that introduced it.
 *
 * The compiler announces `RSVELTE_SIGNAL_DISCIPLINE_ARMED` from inside the walk and
 * this script refuses a verdict without it — a binding that predates the check prints
 * nothing, which would otherwise read as a clean sweep.
 *
 * What it does not see is in `gate-coverage.md` §41; the load-bearing one is that a
 * READ has no sink, so the same shadow on the right-hand side of a mutation is
 * outside this property.
 *
 * Usage: node scripts/compat-corpus/signal-discipline-verify.mjs [--binding <path>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
	const i = args.indexOf(name);
	return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

if (!process.env.RSVELTE_ASSERT_SIGNAL_DISCIPLINE) {
	console.error('[signal-discipline] RSVELTE_ASSERT_SIGNAL_DISCIPLINE is unset — the compiler would not emit a single');
	console.error('  marker, and a run that cannot fail is not a gate. Re-run with the variable set.');
	process.exit(2);
}

const BINDING = path.resolve(ROOT, argValue('--binding', '.corpus-cache/rsvelte.node'));
if (!fs.existsSync(BINDING)) {
	console.error(`[signal-discipline] rsvelte NAPI binding missing at ${path.relative(ROOT, BINDING)}`);
	console.error('  build: cargo build --release -p rsvelte_napi --lib');
	process.exit(2);
}

const manifestPath = path.join(CORPUS, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
	console.error('[signal-discipline] compatibility/manifest.json missing — run: node scripts/compat-corpus/collect.mjs');
	process.exit(2);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')).filter((e) => e.kind === 'component');

// The same floor collect.mjs enforces: a near-empty manifest would let the gate
// pass vacuously.
const MIN_ENTRIES = 1000;
if (manifest.length < MIN_ENTRIES) {
	console.error(`[signal-discipline] only ${manifest.length} components in the manifest (expected >= ${MIN_ENTRIES})`);
	process.exit(2);
}

// A native `eprintln!` writes straight to fd 2, so the markers cannot be
// intercepted in-process — the compiles run in a child whose stderr is piped.
const MODES = [
	{ key: 'client', dev: false },
	{ key: 'client-dev', dev: true },
];

if (args.includes('--worker')) {
	const require = createRequire(import.meta.url);
	const rsvelte = require(BINDING);
	for (const entry of manifest) {
		let source;
		try {
			source = fs.readFileSync(path.join(CORPUS, 'sources', entry.id), 'utf8');
		} catch {
			continue;
		}
		for (const mode of MODES) {
			process.stderr.write(`UNIT\t${entry.id}\t${mode.key}\n`);
			try {
				rsvelte.compile(source, { generate: 'client', dev: mode.dev, filename: entry.id });
			} catch {
				// A source the compiler rejects is the output gate's business, not this one.
			}
		}
	}
	process.exit(0);
}

const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--worker', '--binding', BINDING], {
	cwd: ROOT,
	encoding: 'utf8',
	maxBuffer: 512 * 1024 * 1024,
	env: process.env,
});
if (child.status !== 0) {
	console.error(`[signal-discipline] worker exited ${child.status} (signal ${child.signal ?? 'none'}) — the compiler aborted mid-sweep.`);
	console.error((child.stderr || '').split('\n').slice(-20).join('\n'));
	process.exit(2);
}

const violations = [];
let units = 0;
let armed = false;
let current = null;
for (const line of (child.stderr || '').split('\n')) {
	if (line === 'RSVELTE_SIGNAL_DISCIPLINE_ARMED') {
		armed = true;
	} else if (line.startsWith('UNIT\t')) {
		const [, id, target] = line.split('\t');
		current = { id, target };
		units += 1;
	} else if (line.startsWith('RSVELTE_SIGNAL_DISCIPLINE ')) {
		violations.push({ ...current, detail: line.slice('RSVELTE_SIGNAL_DISCIPLINE '.length) });
	}
}

if (units < MIN_ENTRIES) {
	console.error(`[signal-discipline] the worker reported ${units} units — it did not run the corpus.`);
	process.exit(2);
}

// A binding with no check compiled in prints nothing at all, which is
// indistinguishable from a clean tree.
if (!armed) {
	console.error('[signal-discipline] the compiler never announced the check (no RSVELTE_SIGNAL_DISCIPLINE_ARMED line).');
	console.error('  The binding predates the check, or client codegen was never reached.');
	console.error(`  binding: ${path.relative(ROOT, BINDING)} — rebuild it from this tree.`);
	process.exit(2);
}

console.log(`[signal-discipline] ${units} units (${manifest.length} components x ${MODES.length} modes)`);

if (!violations.length) {
	console.log('[signal-discipline] ✅ every signal write targets something the program declares as a signal');
	process.exit(0);
}

const byUnit = new Set(violations.map((v) => `${v.id} (${v.target})`));
console.log(`\n[signal-discipline] ❌ ${violations.length} violations across ${byUnit.size} units:`);
const shown = new Set();
for (const v of violations) {
	if (shown.has(v.detail)) continue;
	shown.add(v.detail);
	if (shown.size > 20) break;
	console.log(`  - ${v.id} (${v.target})`);
	console.log(`      ${v.detail}`);
}
console.log('\n  A write lowering claimed an identifier that resolves to a shadow in its own input.');
console.log('  Resolve the root through the binding (`reference_is_plain_local` / `is_locally_shadowed`),');
console.log('  never by comparing the identifier text against a list of names.');
process.exit(1);
