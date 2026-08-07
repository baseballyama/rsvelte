#!/usr/bin/env node
/**
 * Guards every ratchet's justification doc against drifting from the JSON it
 * documents. The JSON files are CI-enforced (shrink-only), but the prose counts
 * are hand-maintained, and a doc that no longer describes its entries is the
 * whole reason the ratchets are allowed to be non-empty.
 *
 * Three properties, in the order they matter:
 *
 *   1. COVERAGE IS DECLARED, NOT INFERRED. `RATCHETS` below is the single list
 *      that both the pairing and the coverage assertion read. Every ratchet
 *      JSON on disk must appear in it, so adding a ratchet without a doc is a
 *      missing line in a list rather than a case nobody thought to write. The
 *      pairing cannot be derived from filenames: the three
 *      `warning-position-known-failures.*.json` files are documented inside
 *      `warning-known-failures.md`, so a basename rule reports three false gaps.
 *
 *   2. AN UNPARSEABLE DOC FAILS, IT DOES NOT SKIP. A checker that skips what it
 *      cannot parse reports full coverage of what it can — the same defect this
 *      script exists to catch, one level up (#2450). "No convention" and "my
 *      parser could not read it" are the same outcome here on purpose: both
 *      mean the count is unverified.
 *
 *   3. THE COUNT MUST SIT ON THE SAME LINE AS THE FILENAME. A scanner keyed on
 *      digits alone matches issue numbers — `### First catch: #1772` in
 *      `sourcemap-known-failures.md` reads as a count of 1772. Requiring the
 *      file's own name beside the number removes that class entirely, and
 *      `docs_may_cite_issue_numbers` pins it.
 *
 * Convention each doc must satisfy, once per JSON it documents:
 *
 *     ... `<name>.json` ... <N> entries ...
 *
 * on a single line. Per-target families use the `<target>` placeholder the docs
 * already write (`warning-known-failures.<target>.json`), and every target's
 * JSON must then agree on the count — which also catches the day they diverge.
 *
 * Usage: node scripts/compat-corpus/known-failures-md-check.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');

const TARGETS = ['client', 'server', 'client-dev'];
const perTarget = (stem) => TARGETS.map((t) => `${stem}.${t}.json`);

/**
 * The declared pairing. `key` is how the doc names the ratchet; `jsons` are the
 * files that key stands for. Adding a ratchet JSON without adding it here fails
 * the run.
 */
const RATCHETS = [
	...TARGETS.map((t) => ({
		doc: 'known-failures.md',
		key: `known-failures.${t}.json`,
		jsons: [`known-failures.${t}.json`],
	})),
	{
		doc: 'warning-known-failures.md',
		key: 'warning-known-failures.<target>.json',
		jsons: perTarget('warning-known-failures'),
	},
	{
		doc: 'warning-known-failures.md',
		key: 'warning-position-known-failures.<target>.json',
		jsons: perTarget('warning-position-known-failures'),
	},
	{ doc: 'matrix-known-failures.md', key: 'matrix-known-failures.json', jsons: ['matrix-known-failures.json'] },
	{ doc: 'validator-known-failures.md', key: 'validator-known-failures.json', jsons: ['validator-known-failures.json'] },
	{
		doc: 'validator-message-known-failures.md',
		key: 'validator-message-known-failures.json',
		jsons: ['validator-message-known-failures.json'],
	},
	{ doc: 'mutation-known-failures.md', key: 'mutation-known-failures.json', jsons: ['mutation-known-failures.json'] },
	{ doc: 'sourcemap-known-failures.md', key: 'sourcemap-known-failures.json', jsons: ['sourcemap-known-failures.json'] },
	{ doc: 'sourcemap-oracle-excluded.md', key: 'sourcemap-oracle-excluded.json', jsons: ['sourcemap-oracle-excluded.json'] },
	{ doc: 'css-prune-known-failures.md', key: 'css-prune-known-failures.json', jsons: ['css-prune-known-failures.json'] },
	{ doc: 'fmt-known-failures.md', key: 'fmt-known-failures.json', jsons: ['fmt-known-failures.json'] },
	{ doc: 'fmt-oracle-excluded.md', key: 'fmt-oracle-excluded.json', jsons: ['fmt-oracle-excluded.json'] },
	{ doc: 'lint-known-failures.md', key: 'lint-known-failures.json', jsons: ['lint-known-failures.json'] },
	{ doc: 'check-known-failures.md', key: 'check-known-failures.json', jsons: ['check-known-failures.json'] },
	{ doc: 'check-e2e-known-failures.md', key: 'check-e2e-known-failures.json', jsons: ['check-e2e-known-failures.json'] },
	{ doc: 'svelte2tsx-known-failures.md', key: 'svelte2tsx-known-failures.json', jsons: ['svelte2tsx-known-failures.json'] },
	{ doc: 'svelte2tsx-map-known-failures.md', key: 'svelte2tsx-map-known-failures.json', jsons: ['svelte2tsx-map-known-failures.json'] },
	{
		doc: 'svelte2tsx-fixtures-known-failures.md',
		key: 'svelte2tsx-fixtures-known-failures.json',
		jsons: ['svelte2tsx-fixtures-known-failures.json'],
	},
];

let failed = false;
const fail = (msg) => {
	console.error(`[known-failures-md-check] ${msg}`);
	failed = true;
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The count a doc states for `key`, or a reason it could not be read. */
export function statedCount(docText, key) {
	const line = docText
		.split('\n')
		.find((l) => l.includes(`\`${key}\``) && /\b[\d,]+\s+entr(?:y|ies)\b/.test(l));
	if (!line) return { ok: false, reason: 'no line names the ratchet beside an "N entries" count' };
	// Anchored to the right of the filename so a number elsewhere on the line
	// (an issue reference, a percentage) cannot be picked up instead.
	const after = line.slice(line.indexOf(`\`${key}\``) + key.length + 2);
	const m = after.match(/\b([\d,]+)\s+entr(?:y|ies)\b/);
	if (!m) return { ok: false, reason: 'the count does not follow the ratchet name on that line' };
	return { ok: true, count: Number(m[1].replace(/,/g, '')), line: line.trim() };
}

// Importing this module must not run the checks: a failing checker would
// `process.exit(1)` during import and take its own test suite down with it,
// which reads as "tests did not fail".
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();

function main() {
// ---- 1. every ratchet JSON on disk is declared --------------------------------
const onDisk = fs
	.readdirSync(CORPUS)
	.filter((f) => f.endsWith('.json') && /known-failures|excluded/.test(f))
	.sort();
const declared = new Set(RATCHETS.flatMap((r) => r.jsons));
for (const f of onDisk) {
	if (!declared.has(f)) {
		fail(`${f} is a ratchet on disk but is not declared in RATCHETS — add it with the doc that justifies it`);
	}
}
for (const f of declared) {
	if (!onDisk.includes(f)) fail(`RATCHETS declares ${f}, which does not exist`);
}

// ---- 2. every declared ratchet's doc states its count -------------------------
for (const { doc, key, jsons } of RATCHETS) {
	const docPath = path.join(CORPUS, doc);
	if (!fs.existsSync(docPath)) {
		fail(`missing justification doc ${doc} (declared for ${key})`);
		continue;
	}
	const lengths = jsons.map((j) => {
		const p = path.join(CORPUS, j);
		return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).length : null;
	});
	if (lengths.some((n) => n === null)) continue; // already reported above
	const unique = [...new Set(lengths)];
	if (unique.length !== 1) {
		fail(
			`${doc}: \`${key}\` stands for files whose counts differ (${jsons
				.map((j, i) => `${j}=${lengths[i]}`)
				.join(', ')}) — they need separate entries now`,
		);
		continue;
	}
	const actual = unique[0];
	const stated = statedCount(fs.readFileSync(docPath, 'utf8'), key);
	if (!stated.ok) {
		fail(
			`${doc}: cannot verify the count for \`${key}\` — ${stated.reason}.\n` +
				`    Write it as: \`${key}\` … ${actual} entries`,
		);
		continue;
	}
	if (stated.count !== actual) {
		fail(`${doc} states ${stated.count} entries for \`${key}\`, but the JSON has ${actual}\n    ${stated.line}`);
	}
}

// ---- 3. doc-specific reconciliations that no generic rule can derive ----------
const knownFailuresMd = fs.readFileSync(path.join(CORPUS, 'known-failures.md'), 'utf8');
const clientDevLen = JSON.parse(
	fs.readFileSync(path.join(CORPUS, 'known-failures.client-dev.json'), 'utf8'),
).length;
const reconcile = knownFailuresMd.match(
	/([\d,]+)\s+entries are attributed to a cluster;\s*the remaining\s*\*{0,2}([\d,]+)\*{0,2}/,
);
if (reconcile) {
	const attributed = Number(reconcile[1].replace(/,/g, ''));
	const residue = Number(reconcile[2].replace(/,/g, ''));
	if (attributed + residue !== clientDevLen) {
		fail(
			`known-failures.md reconciliation says ${attributed} + ${residue} = ${attributed + residue}, but known-failures.client-dev.json has ${clientDevLen}`,
		);
	}
}

// A stated total must equal the addends printed beside it: an itemised list that
// reads as exhaustive and is not sums to less than the total it claims.
// Convention: `summing to <total> (\`a + b + NxM\`)`.
const warningMd = fs.readFileSync(path.join(CORPUS, 'warning-known-failures.md'), 'utf8');
for (const [, statedRaw, expression] of warningMd.matchAll(/summing to (?:all )?([\d,]+)\s*\(`([\d\sx+]+)`\)/g)) {
	const total = expression
		.split('+')
		.map((term) => {
			const [a, b] = term.trim().split('x');
			return b === undefined ? Number(a) : Number(a) * Number(b);
		})
		.reduce((a, b) => a + b, 0);
	if (total !== Number(statedRaw.replace(/,/g, ''))) {
		fail(`warning-known-failures.md claims ${statedRaw} but \`${expression}\` sums to ${total}`);
	}
}

// Matrix per-family split: the number a burn-down PR forgets to update.
const matrixMd = fs.readFileSync(path.join(CORPUS, 'matrix-known-failures.md'), 'utf8');
const matrixEntries = JSON.parse(fs.readFileSync(path.join(CORPUS, 'matrix-known-failures.json'), 'utf8'));
for (const family of ['binding-position', 'comment-slot']) {
	const fm = matrixMd.match(new RegExp('### `' + escape(family) + '` — ([\\d,]+) entr(?:y|ies)'));
	if (!fm) continue;
	const claimed = Number(fm[1].replace(/,/g, ''));
	const actual = matrixEntries.filter((id) => id.startsWith(`${family}/`)).length;
	if (claimed !== actual) {
		fail(`matrix-known-failures.md says ${claimed} entries for family "${family}", but the ratchet has ${actual}`);
	}
}

// Mutation per-verdict split (mutate-corpus.mjs, #2281 Gate 3): the same
// forget-to-update surface the matrix families have.
const mutationMdPath = path.join(CORPUS, 'mutation-known-failures.md');
if (fs.existsSync(mutationMdPath)) {
	const mutationMd = fs.readFileSync(mutationMdPath, 'utf8');
	const mutationEntries = JSON.parse(fs.readFileSync(path.join(CORPUS, 'mutation-known-failures.json'), 'utf8'));
	for (const verdict of ['code-mismatch', 'unparseable', 'compiler-crash', 'error-mismatch']) {
		const vm = mutationMd.match(new RegExp('\\| `' + escape(verdict) + '` \\| (\\d+) \\|'));
		if (!vm) continue;
		const claimed = Number(vm[1]);
		const actual = mutationEntries.filter((id) => id.includes(`[${verdict}]`)).length;
		if (claimed !== actual) {
			fail(`mutation-known-failures.md says ${claimed} "${verdict}" entries, but the ratchet has ${actual}`);
		}
	}
}

	if (failed) {
		console.error('\n[known-failures-md-check] update the known-failures docs to match the JSON ratchets above.');
		process.exit(1);
	}
	console.log(
		`[known-failures-md-check] ${RATCHETS.length} declared ratchets across ${new Set(RATCHETS.map((r) => r.doc)).size} docs match their JSON.`,
	);
}
