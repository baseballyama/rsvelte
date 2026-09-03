/**
 * Shared refusal for baseline rewrites taken from an unrepresentative run.
 *
 * `--update-baseline` replaces a ratchet wholesale, so it is only sound when the
 * run measured the whole population the ratchet covers. Narrow the run along any
 * axis — a target subset, a family subset, a sampled slice — and the rewrite
 * silently deletes every entry that was not measured (FALSE-SHRINK), which reads
 * as a large clean improvement rather than as data loss. `--no-fmt` is the
 * mirror image: it counts formatting-only differences as failures and writes
 * entries the normal gate would never produce.
 *
 * Every corpus script re-derived this refusal set by hand, and the copies
 * drifted: the axes each script forgot were the axes it happened not to be
 * thinking about. Keeping the check in one place makes adding an axis one array
 * element at the call site instead of a fifth hand-written copy.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');

/**
 * The declared corpus sources that contributed no manifest entry.
 *
 * Every floor in this pipeline counts ENTRIES -- 1000 in `collect.mjs`, 10000
 * in `parse-ast-verify.mjs`, 30000 in `verify.mjs` -- and an entry count cannot
 * see which repositories produced them. Measured 2026-09-03: a checkout with 7
 * of 104 submodules populated collects 11,673 entries, which passes two of
 * those three floors, and `collect.mjs` announces the shortfall only as 97
 * warning lines above a plausible five-digit total. The rewrite would then
 * delete every entry from the 97 it never opened.
 *
 * Throws when either input is absent: "I could not measure the coverage" and
 * "the coverage is complete" are the same empty array, and only one of them is
 * a result.
 *
 * @param {string} [root]
 * @returns {{id: string, path: string}[]}
 */
export function unpopulatedCorpusSources(root = ROOT) {
	const sourcesPath = path.join(root, 'scripts', 'compat-corpus', 'corpus-sources.json');
	const manifestPath = path.join(root, 'compatibility', 'manifest.json');
	for (const file of [sourcesPath, manifestPath])
		if (!fs.existsSync(file))
			throw new Error(`cannot measure corpus source coverage: ${file} is missing`);
	const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
	// A manifest id is `<source id>/<path within the repo>`; a `-1` from a
	// separator-less id must not silently become `slice(0, -1)`.
	const populated = new Set(
		manifest.map((e) => (e.id.includes('/') ? e.id.slice(0, e.id.indexOf('/')) : e.id))
	);
	return sources.filter((s) => !populated.has(s.id));
}

/**
 * One `reasons` element for the source-coverage axis: falsy when every declared
 * source contributed, a message naming the count and the paths otherwise.
 *
 * @param {string} [root]
 * @returns {string | false}
 */
export function unpopulatedSourcesReason(root = ROOT) {
	let missing;
	try {
		missing = unpopulatedCorpusSources(root);
	} catch (error) {
		return `${/** @type {Error} */ (error).message}; a baseline is a durable claim about a population, so an unmeasurable one refuses`;
	}
	if (missing.length === 0) return false;
	const shown = missing.slice(0, 5).map((s) => s.path).join(', ');
	return (
		`${missing.length} declared corpus source(s) produced no manifest entry ` +
		`(${shown}${missing.length > 5 ? `, +${missing.length - 5} more` : ''}); ` +
		'the rewrite would delete every baseline entry from repositories this run never opened'
	);
}

/**
 * @param {string} tool  short name used in the message prefix
 * @param {(string|false|null|undefined)[]} reasons  one entry per axis; falsy
 *   means the axis was not narrowed. Each truthy entry states the flag and why
 *   the resulting baseline would be wrong.
 * @param {string} [flag]  the caller's rewrite flag, named in the fix hint.
 */
export function refuseUnrepresentativeBaseline(tool, reasons, flag = '--update-baseline') {
	const active = reasons.filter(Boolean);
	if (active.length === 0) return;
	console.error(`\n[${tool}] refusing to rewrite the baseline from this run:`);
	for (const reason of active) console.error(`  - ${reason}`);
	console.error(`  re-run over the full population, then ${flag}.`);
	process.exit(2);
}
