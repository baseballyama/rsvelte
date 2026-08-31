#!/usr/bin/env node
// Pins the `exit 0->1` bucket of `lint-severity-known-failures.json` as a
// DELIBERATE divergence: rsvelte-lint exits non-zero on a source the Svelte
// compiler rejects, ESLint exits 0 because `svelte-eslint-parser` accepts it.
// The claim that makes it deliberate rather than a defect is "the official
// compiler rejects every one of these too" — a one-time measurement until it is
// a test, and the thing that would rot silently if a future fix turned one of
// them into an rsvelte-only over-rejection.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { compile, compileModule } = await import(
	path.join(ROOT, 'submodules/svelte/packages/svelte/src/compiler/index.js')
);

const entries = JSON.parse(
	fs.readFileSync(path.join(ROOT, 'compatibility/lint-severity-known-failures.json'), 'utf8'),
).filter((e) => e.startsWith('exit|') && e.includes('|0->1|'));

function rejects(file) {
	const src = fs.readFileSync(file, 'utf8');
	const isModule = /\.svelte\.(js|ts)$/.test(file);
	try {
		(isModule ? compileModule : compile)(src, { generate: 'client', filename: path.relative(ROOT, file) });
		return null;
	} catch (e) {
		return e?.code ?? 'unknown';
	}
}

let bad = 0;
for (const entry of entries) {
	const rel = entry.split('|')[1];
	const file = path.join(ROOT, 'compatibility/lint-adversarial', rel);
	if (!fs.existsSync(file)) {
		console.error(`MISSING ${rel} — a listed entry names no pattern on disk`);
		bad++;
		continue;
	}
	const code = rejects(file);
	if (code === null) {
		console.error(`ACCEPTED ${rel} — the official compiler compiles this, so the exit-code`);
		console.error('          divergence is an rsvelte over-rejection, not a product decision');
		bad++;
	}
}

// A harness that rejected everything would pass the loop above without measuring
// anything. Two patterns the official compiler must ACCEPT keep it honest.
const controls = ['block-lang/02-default-ok.svelte', 'block-lang/01-default-flags-ts.svelte'];
let controlsRan = 0;
for (const rel of controls) {
	const file = path.join(ROOT, 'compatibility/lint-adversarial', rel);
	if (!fs.existsSync(file)) continue;
	controlsRan++;
	const code = rejects(file);
	if (code !== null) {
		console.error(`CONTROL ${rel} was rejected (${code}); the oracle rejects valid input too`);
		bad++;
	}
}
if (controlsRan === 0) {
	console.error('no control pattern was found; a green run here proves nothing');
	bad++;
}

console.log(
	`lint-severity exit attribution: ${entries.length} listed entries, ${entries.length - bad} rejected by the official compiler, ${controlsRan} control(s) accepted`,
);
process.exit(bad ? 1 : 0);
