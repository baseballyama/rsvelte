#!/usr/bin/env node
/**
 * Group formatter-parity failures by a normalized first-diff signature so the
 * burn-down can attack whole classes at once. Reads compatibility/fmt-report.json
 * (written by fmt-verify.mjs) and the oracle/actual trees.
 *
 * Usage:
 *   node scripts/compat-corpus/fmt-cluster.mjs                 # ranked signatures
 *   node scripts/compat-corpus/fmt-cluster.mjs --show <sig>    # list ids in a cluster
 *   node scripts/compat-corpus/fmt-cluster.mjs --top <n>       # show N clusters (default 30)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');

const args = process.argv.slice(2);
const SHOW = args.includes('--show') ? args[args.indexOf('--show') + 1] : undefined;
const TOP = args.includes('--top') ? Number(args[args.indexOf('--top') + 1]) || 30 : 30;

const report = JSON.parse(fs.readFileSync(path.join(CORPUS, 'fmt-report.json'), 'utf8'));

/** Collapse identifiers/numbers/whitespace so structurally-similar diffs cluster. */
function normalize(line) {
	return (line ?? '<none>')
		.replace(/\s+/g, ' ')
		.replace(/"[^"]*"|'[^']*'/g, 'S')
		.replace(/\b[A-Za-z_$][\w$]*\b/g, 'N')
		.replace(/\b\d+\b/g, '0')
		.trim()
		.slice(0, 80);
}

const clusters = new Map();
for (const f of report.failures) {
	const d = f.detail ?? {};
	const sig = `${f.kind}: «${normalize(d.expected)}» → «${normalize(d.actual)}»`;
	if (!clusters.has(sig)) clusters.set(sig, []);
	clusters.get(sig).push(f.id);
}

const ranked = [...clusters.entries()].sort((a, b) => b[1].length - a[1].length);

if (SHOW) {
	const hit = ranked.find(([sig]) => sig.includes(SHOW));
	if (!hit) {
		console.error(`no cluster matching: ${SHOW}`);
		process.exit(1);
	}
	const [sig, ids] = hit;
	console.log(`${sig}  (${ids.length})\n`);
	for (const id of ids) console.log(id);
	process.exit(0);
}

console.log(`${report.failed} failures in ${ranked.length} clusters (top ${Math.min(TOP, ranked.length)}):\n`);
for (const [sig, ids] of ranked.slice(0, TOP)) {
	console.log(`${String(ids.length).padStart(4)}  ${sig}`);
	console.log(`        e.g. ${ids[0]}`);
}
