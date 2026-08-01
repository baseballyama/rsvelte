#!/usr/bin/env node
/**
 * Guards against `compatibility/known-failures.md` drifting from the JSON
 * ratchets it documents. The JSON files are CI-enforced (shrink-only,
 * `verify.mjs`), but the prose header counts and the client-dev
 * "attributed to a cluster" / "remaining" reconciliation are hand-maintained
 * and were not checked anywhere — a burn-down PR that updates one of the
 * three `known-failures.*.json` files without updating the matching header
 * (or the residue arithmetic) silently drifts out of sync (#2062, drift from
 * #2048: the client-dev cluster table + residue summed to 3 less than the
 * JSON's actual entry count).
 *
 * Checks, per `known-failures.{client,server,client-dev}.json`:
 *   1. The `## <Name> (\`known-failures.X.json\`, N entries)` header count
 *      matches the JSON array length exactly.
 *   2. (client-dev only, best-effort) If the "NNN entries are attributed to
 *      a cluster; the remaining MMM" reconciliation sentence is present,
 *      NNN + MMM must equal the JSON array length. The table itself is not
 *      parsed — its columns are allowed to overlap by design (an entry can
 *      diverge in more than one dev helper) — so the sentence is the only
 *      place the *distinct* entry count is asserted, and only that is
 *      checked. Not finding the sentence is not an error: the doc's format
 *      has already been rewritten wholesale once (#2115) and is free to
 *      change again, as long as whatever replaces it stays close enough to
 *      re-derive a check.
 *
 * Usage: node scripts/compat-corpus/known-failures-md-check.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');
const MD_PATH = path.join(CORPUS, 'known-failures.md');

const md = fs.readFileSync(MD_PATH, 'utf8');
let failed = false;

const TARGETS = ['client', 'server', 'client-dev'];

const jsonLengths = new Map();
for (const target of TARGETS) {
	const p = path.join(CORPUS, `known-failures.${target}.json`);
	jsonLengths.set(target, JSON.parse(fs.readFileSync(p, 'utf8')).length);
}

// Header count check, e.g.:
//   ## Client dev (`known-failures.client-dev.json`, 896 entries)
for (const target of TARGETS) {
	const re = new RegExp('`known-failures\\.' + target.replace('-', '\\-') + '\\.json`,\\s*([\\d,]+)\\s+entr(?:y|ies)');
	const m = md.match(re);
	if (!m) {
		console.error(`[known-failures-md-check] could not find the header count for "${target}" in known-failures.md`);
		failed = true;
		continue;
	}
	const headerCount = Number(m[1].replace(/,/g, ''));
	const actual = jsonLengths.get(target);
	if (headerCount !== actual) {
		console.error(
			`[known-failures-md-check] known-failures.md header says ${headerCount} entries for "${target}", but known-failures.${target}.json has ${actual}`,
		);
		failed = true;
	}
}

// Best-effort client-dev reconciliation: "NNN entries are attributed to a
// cluster; the remaining MMM ...". Only enforced when the sentence is found.
const reconcile = md.match(/([\d,]+)\s+entries are attributed to a cluster;\s*the remaining\s*\*{0,2}([\d,]+)\*{0,2}/);
if (reconcile) {
	const attributed = Number(reconcile[1].replace(/,/g, ''));
	const residue = Number(reconcile[2].replace(/,/g, ''));
	const actual = jsonLengths.get('client-dev');
	if (attributed + residue !== actual) {
		console.error(
			`[known-failures-md-check] client-dev reconciliation sentence says ${attributed} + ${residue} = ${attributed + residue}, but known-failures.client-dev.json has ${actual} entries`,
		);
		failed = true;
	}
}

if (failed) {
	console.error('\n[known-failures-md-check] update compatibility/known-failures.md to match the JSON ratchets above.');
	process.exit(1);
}
console.log('[known-failures-md-check] known-failures.md counts match the JSON ratchets.');
