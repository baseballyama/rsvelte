#!/usr/bin/env node
/**
 * Cluster svelte2tsx corpus failures (compat/corpus/report-s2t.json) by diff
 * signature so fixes can be attacked by root cause, biggest first.
 *
 * Usage: node scripts/compat-corpus/svelte2tsx-cluster.mjs [--show <signature-prefix>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripBlankLines } from './normalize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compat/corpus');

const args = process.argv.slice(2);
const SHOW = args.includes('--show') ? args[args.indexOf('--show') + 1] : null;

const report = JSON.parse(fs.readFileSync(path.join(CORPUS, 'report-s2t.json'), 'utf8'));

function readIf(p) {
	return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

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

function add(sig, id) {
	if (!clusters.has(sig)) clusters.set(sig, { count: 0, ids: [] });
	const c = clusters.get(sig);
	c.count++;
	if (c.ids.length < 8) c.ids.push(id);
}

for (const f of report.failures) {
	if (f.verdict === 'error-mismatch') {
		for (const d of f.details) {
			add(`ERROR: E:${d.expected} | A:${d.actual}`, f.id);
		}
		continue;
	}
	const exp = readIf(path.join(CORPUS, 'expected-s2t', f.id, 'index.tsx'));
	const act = readIf(path.join(CORPUS, 'actual-s2t', f.id, 'index.tsx'));
	if (exp == null || act == null) {
		add('MISSING output', f.id);
		continue;
	}
	const sig = diffSignature(exp, act);
	if (sig) add(`TS: ${sig.sig}`, f.id);
}

const sorted = [...clusters.entries()].sort((a, b) => b[1].count - a[1].count);

if (SHOW) {
	for (const [sig, c] of sorted) {
		if (!sig.startsWith(SHOW)) continue;
		console.log(`\n### ${sig}  (${c.count})`);
		for (const id of c.ids) console.log(`  - ${id}`);
	}
} else {
	console.log(`${report.failures.length} failures in ${sorted.length} clusters:\n`);
	for (const [sig, c] of sorted.slice(0, 60)) {
		console.log(`${String(c.count).padStart(5)}  ${sig.slice(0, 150)}`);
		console.log(`         e.g. ${c.ids[0]}`);
	}
}
