#!/usr/bin/env node
/**
 * Scope the `warning-position-mismatch` backlog: how many DISTINCT causes are
 * behind it, and where is the mass?
 *
 * The answer decides whether the backlog is one fix or many, and those are
 * different questions from "how many causes" — a single systemic cause can
 * still need one edit per emission site. Both numbers come out of this run.
 *
 * The clustering is derived rather than imposed. Every divergence is reduced
 * first by *which side has a span at all* — a fact — and only where both sides
 * have one is a `(dline, dcol)` delta computed, which is a judgement about what
 * counts as "close". Reporting the layers separately shows which one carries
 * the mass instead of asserting it.
 *
 * Needs a compiled corpus:
 *   node scripts/compat-corpus/collect.mjs
 *   node scripts/compat-corpus/compile.mjs
 *   node scripts/dev/cluster-warning-positions.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TARGET_KEYS } from '../compat-corpus/targets.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CORPUS = path.join(ROOT, 'compatibility');

const manifestPath = path.join(CORPUS, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
	console.error('[cluster] compatibility/manifest.json missing — run collect.mjs then compile.mjs first');
	process.exit(2);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const readIf = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
const readW = (d) => JSON.parse(readIf(path.join(d, 'warnings.json')) ?? '{}');
const codeBag = (l) => l.map((w) => w.code).sort();
const key = (w) => `${w.code}@${w.line ?? '?'}:${w.column ?? '?'}`;
const hasSpan = (w) => w.line !== null && w.line !== undefined;

const entries = new Set();
const byCode = new Map();
const byShape = new Map();
const byCodeShape = new Map();
const deltas = new Map();
const examples = new Map();
let pairs = 0;
// Entries that were actually compiled. Counting *comparisons* does not work: a
// missing file reads as `{}`, both sides come back as empty warning lists, and
// every entry scores as agreement — a clean sheet over an absent tree. Counting
// `warnings.json` does not work either: compile.mjs writes it only for entries
// that have warnings, which is 8% of the corpus. Same predicate as
// verify.mjs's coverage assertion, for the same reason.
let withArtifacts = 0;
const hasOutputs = (tree, id) =>
	fs.existsSync(path.join(tree, id, 'error.json')) ||
	TARGET_KEYS.some((k) => fs.existsSync(path.join(tree, id, `${k}.js`)));

const bump = (m, k) => m.set(k, (m.get(k) ?? 0) + 1);
const groupByCode = (list) => {
	const m = new Map();
	for (const w of list) {
		if (!m.has(w.code)) m.set(w.code, []);
		m.get(w.code).push(w);
	}
	return m;
};

for (const { id } of manifest) {
	const exp = readW(path.join(CORPUS, 'expected', id));
	const act = readW(path.join(CORPUS, 'actual', id));
	const expErr = JSON.parse(readIf(path.join(CORPUS, 'expected', id, 'error.json')) ?? '{}');
	const actErr = JSON.parse(readIf(path.join(CORPUS, 'actual', id, 'error.json')) ?? '{}');

	if (hasOutputs(path.join(CORPUS, 'expected'), id) || hasOutputs(path.join(CORPUS, 'actual'), id)) {
		withArtifacts++;
	}

	for (const t of TARGET_KEYS) {
		if (expErr[t] || actErr[t]) continue;
		const el = exp[t] ?? [];
		const al = act[t] ?? [];
		// A differing set of codes is the code ratchet's business, not this one.
		if (String(codeBag(el)) !== String(codeBag(al))) continue;
		if (String(el.map(key).sort()) === String(al.map(key).sort())) continue;
		entries.add(id);

		const ea = groupByCode(el);
		const aa = groupByCode(al);
		for (const [code, ews] of ea) {
			const aws = aa.get(code) ?? [];
			for (let i = 0; i < Math.min(ews.length, aws.length); i++) {
				const ew = ews[i];
				const aw = aws[i];
				if (ew.line === aw.line && ew.column === aw.column) continue;
				pairs++;

				let shape;
				if (hasSpan(ew) && !hasSpan(aw)) shape = 'rsvelte has NO span (official does)';
				else if (!hasSpan(ew) && hasSpan(aw)) shape = 'official has NO span (rsvelte does)';
				else if (!hasSpan(ew) && !hasSpan(aw)) shape = 'neither has a span';
				else {
					const dl = aw.line - ew.line;
					const dc = aw.column - ew.column;
					shape = dl === 0 ? `same line, column off by ${dc > 0 ? '+' : ''}${dc}` : `line off by ${dl > 0 ? '+' : ''}${dl}`;
					bump(deltas, `dline=${dl} dcol=${dc}`);
				}

				bump(byCode, code);
				bump(byShape, shape);
				const cell = `${shape}  ||  ${code}`;
				bump(byCodeShape, cell);
				if (!examples.has(cell)) examples.set(cell, `${id} [${t}]  official ${key(ew)}  rsvelte ${key(aw)}`);
			}
		}
	}
}

// A run against an absent or truncated tree reports "0 divergences", which
// reads as agreement. Coverage is asserted against the manifest rather than
// against comparisons attempted, so a partially deleted tree fails too — the
// hazard in #2455, where a sibling checkout's clean removes inputs mid-run.
if (withArtifacts < manifest.length * 0.99) {
	console.error(
		`[cluster] only ${withArtifacts}/${manifest.length} manifest entries have compiled output — this run measured nothing`
	);
	console.error('  run: node scripts/compat-corpus/compile.mjs');
	process.exit(2);
}

const top = (m, n) => [...m].sort((x, y) => y[1] - x[1]).slice(0, n);
console.log(`position-divergent entries        ${entries.size}`);
console.log(`diverging (entry,target,warning)  ${pairs}`);
console.log(`manifest entries with output      ${withArtifacts}/${manifest.length}\n`);

console.log('=== layer 1: by SHAPE — does each side have a span at all, else the delta ===');
for (const [k, v] of top(byShape, 20)) {
	console.log(`  ${String(v).padStart(6)}  ${((v / pairs) * 100).toFixed(2).padStart(6)}%  ${k}`);
}

console.log(`\n=== layer 2: by WARNING CODE (${byCode.size} distinct) ===`);
for (const [k, v] of top(byCode, 40)) console.log(`  ${String(v).padStart(6)}  ${k}`);

console.log(`\n=== layer 3: SHAPE x CODE — the candidate repair sites (${byCodeShape.size} cells) ===`);
for (const [k, v] of top(byCodeShape, 40)) {
	console.log(`  ${String(v).padStart(6)}  ${k}`);
	console.log(`          e.g. ${examples.get(k)}`);
}

console.log(`\n=== layer 4: exact (dline,dcol) where both sides have spans (${deltas.size} distinct) ===`);
for (const [k, v] of top(deltas, 20)) console.log(`  ${String(v).padStart(6)}  ${k}`);
