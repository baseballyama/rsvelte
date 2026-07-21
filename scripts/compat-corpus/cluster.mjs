#!/usr/bin/env node
/**
 * Cluster corpus verification failures (compatibility/report.json) by diff
 * signature so fixes can be attacked by root cause, biggest first.
 *
 * Usage: node scripts/compat-corpus/cluster.mjs [--show <signature-prefix>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripBlankLines, readIf } from './normalize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');

const args = process.argv.slice(2);
const SHOW = args.includes('--show') ? args[args.indexOf('--show') + 1] : null;

const report = JSON.parse(fs.readFileSync(path.join(CORPUS, 'report.json'), 'utf8'));

// First differing hunk after blank-line normalization; normalized to a signature.
function diffSignature(exp, act) {
	const el = stripBlankLines(exp).split('\n');
	const al = stripBlankLines(act).split('\n');
	for (let i = 0; i < Math.max(el.length, al.length); i++) {
		if (el[i] !== al[i]) {
			const norm = (s) =>
				(s ?? '<EOF>')
					.trim()
					.replace(/"[^"]*"/g, '"…"')
					.replace(/`[^`]*`/g, '"…"')
					.replace(/'[^']*'/g, '"…"')
					.replace(/\b[a-zA-Z_$][\w$]*_(\d+)\b/g, 'x_N')
					.replace(/\d+/g, 'N');
			return { sig: `E:${norm(el[i])} | A:${norm(al[i])}`, line: i, e: el[i], a: al[i] };
		}
	}
	return null;
}

const clusters = new Map();

function add(sig, id, sample) {
	if (!clusters.has(sig)) clusters.set(sig, { count: 0, ids: [], sample });
	const c = clusters.get(sig);
	c.count++;
	if (c.ids.length < 5) c.ids.push(id);
}

let blankOnly = 0;
const blankIds = [];

for (const f of report.failures) {
	if (f.verdict === 'error-mismatch') {
		for (const d of f.details) {
			if (d.kind === 'error-presence') {
				add(`ERROR ${d.target}: E:${d.expected} | A:${d.actual}`, f.id, d);
			}
		}
		continue;
	}
	let foundReal = false;
	for (const target of ['client', 'server']) {
		const exp = readIf(path.join(CORPUS, 'expected', f.id, `${target}.js`));
		const act = readIf(path.join(CORPUS, 'actual', f.id, `${target}.js`));
		if (exp == null || act == null || exp === act) continue;
		const sig = diffSignature(exp, act);
		if (sig) {
			foundReal = true;
			add(`JS ${target}: ${sig.sig}`, f.id, sig);
		}
	}
	for (const d of f.details.filter((d) => d.kind === 'css')) {
		foundReal = true;
		add(`CSS: E:${(d.expected ?? '').trim()} | A:${(d.actual ?? '').trim()}`, f.id, d);
	}
	if (!foundReal && (f.verdict === 'js-mismatch' || f.verdict === 'css-mismatch')) {
		blankOnly++;
		if (blankIds.length < 5) blankIds.push(f.id);
	}
}

const sorted = [...clusters.entries()].sort((a, b) => b[1].count - a[1].count);

if (SHOW) {
	for (const [sig, c] of sorted) {
		if (!sig.startsWith(SHOW)) continue;
		console.log(`\n### ${sig}  (${c.count})`);
		for (const id of c.ids) console.log(`  - ${id}`);
	}
} else {
	console.log(`blank-line-only mismatches: ${blankOnly}`);
	for (const id of blankIds) console.log(`  - ${id}`);
	console.log(`\n${sorted.length} clusters:\n`);
	for (const [sig, c] of sorted.slice(0, 60)) {
		console.log(`${String(c.count).padStart(5)}  ${sig.slice(0, 150)}`);
		console.log(`         e.g. ${c.ids[0]}`);
	}
}
