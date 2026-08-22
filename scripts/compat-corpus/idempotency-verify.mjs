#!/usr/bin/env node
/**
 * Assert that rsvelte's client identifier transform is idempotent on every
 * corpus entry.
 *
 * `try_transform_assignment` converts both sides of a member mutation and hands
 * the result back to the outer `apply_transforms_to_expression` walk, so any
 * read whose output the walk can transform *again* is applied twice. That is
 * #3026: `state.a = state.b` in an inline template arrow emitted
 * `state().a = state()().b`. Output equality cannot find the class on its own —
 * the shape occurs 0 times in 12,523 corpus components, and the bad output
 * parses — so the property is asserted directly instead of being sampled.
 *
 * The compiler announces `RSVELTE_IDEMPOTENCY_ARMED` from inside the comparison and this
 * script refuses a verdict without it — a binding that predates the check prints nothing,
 * which would otherwise read as a clean sweep.
 *
 * The check lives in the compiler behind `RSVELTE_ASSERT_TRANSFORM_IDEMPOTENT`:
 * every top-level transform re-applies itself to its own output and prints a
 * `RSVELTE_NON_IDEMPOTENT_TRANSFORM` line when the two differ. This script runs
 * the corpus through it and fails on any line. It is a hard gate with no
 * ratchet — measured at 0 on the tree that introduced it, and a violation is a
 * latent double-application rather than a divergence to be burned down.
 *
 * What it does not see: the server transform (no identifier transforms), the
 * callers of `apply_transforms_to_expression_with_shadowed` that bypass the
 * top-level entry, and any divergence the fallback text printer erases — a
 * print with unbalanced brackets is one the printer truncated, so the pair is
 * skipped rather than reported.
 *
 * Usage: node scripts/compat-corpus/idempotency-verify.mjs [--binding <path>]
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

if (!process.env.RSVELTE_ASSERT_TRANSFORM_IDEMPOTENT) {
	console.error('[idempotency] RSVELTE_ASSERT_TRANSFORM_IDEMPOTENT is unset — the compiler would not emit a single marker,');
	console.error('  and a run that cannot fail is not a gate. Re-run with the variable set.');
	process.exit(2);
}

const BINDING = path.resolve(ROOT, argValue('--binding', '.corpus-cache/rsvelte.node'));
if (!fs.existsSync(BINDING)) {
	console.error(`[idempotency] rsvelte NAPI binding missing at ${path.relative(ROOT, BINDING)}`);
	console.error('  build: cargo build --release -p rsvelte_napi --lib');
	process.exit(2);
}

const manifestPath = path.join(CORPUS, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
	console.error('[idempotency] compatibility/manifest.json missing — run: node scripts/compat-corpus/collect.mjs');
	process.exit(2);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')).filter((e) => e.kind === 'component');

// The same floor collect.mjs enforces: a near-empty manifest would let the gate
// pass vacuously.
const MIN_ENTRIES = 1000;
if (manifest.length < MIN_ENTRIES) {
	console.error(`[idempotency] only ${manifest.length} components in the manifest (expected >= ${MIN_ENTRIES})`);
	process.exit(2);
}

// A native `eprintln!` writes straight to fd 2, so the markers cannot be
// intercepted in-process — the compiles run in a child whose stderr is piped.
// The child prints `UNIT <id> <target>` before each one so a marker can be
// attributed to the entry that produced it.
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
	console.error(`[idempotency] worker exited ${child.status} (signal ${child.signal ?? 'none'}) — the compiler aborted mid-sweep.`);
	console.error((child.stderr || '').split('\n').slice(-20).join('\n'));
	process.exit(2);
}

const violations = [];
let units = 0;
let armed = false;
let current = null;
for (const line of (child.stderr || '').split('\n')) {
	if (line === 'RSVELTE_IDEMPOTENCY_ARMED') {
		armed = true;
	} else if (line.startsWith('UNIT\t')) {
		const [, id, target] = line.split('\t');
		current = { id, target };
		units += 1;
	} else if (line.startsWith('RSVELTE_NON_IDEMPOTENT_TRANSFORM\t')) {
		const [, once, twice] = line.split('\t');
		violations.push({ ...current, once, twice });
	}
}

if (units < MIN_ENTRIES) {
	console.error(`[idempotency] the worker reported ${units} units — it did not run the corpus.`);
	process.exit(2);
}

// A binding with no check compiled in prints nothing at all, which is indistinguishable
// from a clean tree: a `main` binding measured 0 violations for exactly that reason
// before this guard existed. The compiler announces itself from inside the comparison,
// so an absent marker means the check never ran — not that it found nothing.
if (!armed) {
	console.error('[idempotency] the compiler never announced the check (no RSVELTE_IDEMPOTENCY_ARMED line).');
	console.error('  The binding predates the check, or the transform entry point was never reached.');
	console.error(`  binding: ${path.relative(ROOT, BINDING)} — rebuild it from this tree.`);
	process.exit(2);
}

console.log(`[idempotency] ${units} units (${manifest.length} components x ${MODES.length} modes)`);

if (!violations.length) {
	console.log('[idempotency] ✅ every transform is idempotent on its own output');
	process.exit(0);
}

const byUnit = new Set(violations.map((v) => `${v.id} (${v.target})`));
console.log(`\n[idempotency] ❌ ${violations.length} non-idempotent transforms across ${byUnit.size} units:`);
const shown = new Set();
for (const v of violations) {
	const key = `${v.once} -> ${v.twice}`;
	if (shown.has(key)) continue;
	shown.add(key);
	if (shown.size > 20) break;
	console.log(`  - ${v.id} (${v.target})`);
	console.log(`      once : ${v.once}`);
	console.log(`      twice: ${v.twice}`);
}
console.log('\n  A read transform whose output the next pass can transform again is #3026\'s defect class.');
console.log('  Mark the produced callee opaque (`b::getter_call`) so the second pass is a no-op.');
process.exit(1);
