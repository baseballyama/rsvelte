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

// The warning ratchets (verify.mjs, #2281) get the same header-count guard.
// Their doc groups entries by cause rather than listing them, so only the
// per-file header count is asserted — the same invariant, minus the client-dev
// reconciliation sentence which has no counterpart there.
const WARNING_MD_PATH = path.join(CORPUS, 'warning-known-failures.md');
if (fs.existsSync(WARNING_MD_PATH)) {
	const warningMd = fs.readFileSync(WARNING_MD_PATH, 'utf8');
	// The doc heads each section with the `<target>` placeholder and one count,
	// because every target file holds the same entries (warnings are computed in
	// Phase 1/2, before the target is chosen). So the count is asserted against
	// EVERY target's file — which also catches the day that stops being true.
	for (const prefix of ['warning-known-failures', 'warning-position-known-failures']) {
		const re = new RegExp('`' + prefix.replace(/-/g, '\\-') + '\\.<target>\\.json`,\\s*([\\d,]+)\\s+entr(?:y|ies)');
		const m = warningMd.match(re);
		if (!m) {
			console.error(`[known-failures-md-check] could not find the entry count for \`${prefix}.<target>.json\` in warning-known-failures.md`);
			failed = true;
			continue;
		}
		const headerCount = Number(m[1].replace(/,/g, ''));
		for (const target of TARGETS) {
			const file = `${prefix}.${target}.json`;
			const p = path.join(CORPUS, file);
			if (!fs.existsSync(p)) {
				console.error(`[known-failures-md-check] missing ratchet ${file}`);
				failed = true;
				continue;
			}
			const actual = JSON.parse(fs.readFileSync(p, 'utf8')).length;
			if (headerCount !== actual) {
				console.error(
					`[known-failures-md-check] warning-known-failures.md says ${headerCount} entries for \`${prefix}.<target>.json\`, but ${file} has ${actual}`,
				);
				failed = true;
			}
		}
	}
}

// The generated shape matrix (matrix/run.mjs, #2281 Gate 2) gets the same
// header-count guard, plus a per-family reconciliation: its doc splits the
// total between the two axis families, and that split is exactly the number a
// burn-down PR forgets to update.
const MATRIX_MD_PATH = path.join(CORPUS, 'matrix-known-failures.md');
const MATRIX_JSON_PATH = path.join(CORPUS, 'matrix-known-failures.json');
if (fs.existsSync(MATRIX_MD_PATH)) {
	const matrixMd = fs.readFileSync(MATRIX_MD_PATH, 'utf8');
	if (!fs.existsSync(MATRIX_JSON_PATH)) {
		console.error('[known-failures-md-check] missing ratchet matrix-known-failures.json');
		failed = true;
	} else {
		const entries = JSON.parse(fs.readFileSync(MATRIX_JSON_PATH, 'utf8'));
		const m = matrixMd.match(/`matrix-known-failures\.json`,\s*([\d,]+)\s+entr(?:y|ies)/);
		if (!m) {
			console.error('[known-failures-md-check] could not find the entry count for `matrix-known-failures.json` in matrix-known-failures.md');
			failed = true;
		} else if (Number(m[1].replace(/,/g, '')) !== entries.length) {
			console.error(
				`[known-failures-md-check] matrix-known-failures.md says ${m[1]} entries, but matrix-known-failures.json has ${entries.length}`,
			);
			failed = true;
		}
		// Per-family headers, e.g. "### `comment-slot` — 354 entries". A family the
		// doc does not claim is not checked, so an axis can be added before it is
		// written up; a family it does claim must reconcile exactly.
		for (const family of ['binding-position', 'comment-slot']) {
			const fm = matrixMd.match(new RegExp('### `' + family + '` — ([\\d,]+) entr(?:y|ies)'));
			if (!fm) continue;
			const claimed = Number(fm[1].replace(/,/g, ''));
			const actual = entries.filter((id) => id.startsWith(`${family}/`)).length;
			if (claimed !== actual) {
				console.error(
					`[known-failures-md-check] matrix-known-failures.md says ${claimed} entries for family "${family}", but the ratchet has ${actual}`,
				);
				failed = true;
			}
		}
	}
}

// The corpus-seeded mutation fuzz (mutate-corpus.mjs, #2281 Gate 3): header
// count plus the per-verdict table, which is what a burn-down PR forgets.
const MUTATION_MD_PATH = path.join(CORPUS, 'mutation-known-failures.md');
const MUTATION_JSON_PATH = path.join(CORPUS, 'mutation-known-failures.json');
if (fs.existsSync(MUTATION_MD_PATH)) {
	const mutationMd = fs.readFileSync(MUTATION_MD_PATH, 'utf8');
	if (!fs.existsSync(MUTATION_JSON_PATH)) {
		console.error('[known-failures-md-check] missing ratchet mutation-known-failures.json');
		failed = true;
	} else {
		const entries = JSON.parse(fs.readFileSync(MUTATION_JSON_PATH, 'utf8'));
		const m = mutationMd.match(/`mutation-known-failures\.json`,\s*([\d,]+)\s+entr(?:y|ies)/);
		if (!m) {
			console.error('[known-failures-md-check] could not find the entry count for `mutation-known-failures.json` in mutation-known-failures.md');
			failed = true;
		} else if (Number(m[1].replace(/,/g, '')) !== entries.length) {
			console.error(
				`[known-failures-md-check] mutation-known-failures.md says ${m[1]} entries, but mutation-known-failures.json has ${entries.length}`,
			);
			failed = true;
		}
		// Per-verdict table rows, e.g. "| `code-mismatch` | 213 |".
		for (const verdict of ['code-mismatch', 'compiler-crash', 'error-mismatch']) {
			const vm = mutationMd.match(new RegExp('\\| `' + verdict + '` \\| (\\d+) \\|'));
			if (!vm) continue;
			const claimed = Number(vm[1]);
			const actual = entries.filter((id) => id.includes(`[${verdict}]`)).length;
			if (claimed !== actual) {
				console.error(
					`[known-failures-md-check] mutation-known-failures.md says ${claimed} "${verdict}" entries, but the ratchet has ${actual}`,
				);
				failed = true;
			}
		}
	}
}

if (failed) {
	console.error('\n[known-failures-md-check] update the known-failures docs to match the JSON ratchets above.');
	process.exit(1);
}
console.log('[known-failures-md-check] known-failures docs match the JSON ratchets.');
