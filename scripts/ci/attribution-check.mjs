#!/usr/bin/env node
/**
 * DoD gate for the ratchets: a listed entry is a defect we are shipping, so
 * every one of them must name where it is answered. Three end states are
 * allowed and no fourth — the entry is gone (the ratchet is 0), it is
 * attributed to a filed `upstream_issues/` report, or it is attributed to
 * `deliberate-divergences`, where a test pins the behaviour.
 *
 * Prose alone is not an attribution. The docs already carry per-cluster
 * justification and have carried it while every one of these entries sat
 * unowned; what this gate adds is a TARGET per entry, summed against the JSON
 * so an entry cannot be described twice and counted once.
 *
 * The block, anywhere in any `compatibility/*.md` (so it survives the doc
 * consolidation without a path to patch):
 *
 *     Attribution of `known-failures.client.json`:
 *
 *     | n | target | cluster |
 *     |---|---|---|
 *     | 120 | `upstream_issues/4046-….md` | … |
 *     | 104 | `deliberate-divergences` | … |
 *
 * `n` must sum to the ratchet's length. A target is either a path under
 * `upstream_issues/` that exists on disk, or the literal
 * `deliberate-divergences`, which `scripts/dev/deliberate-divergences-check.mjs`
 * separately holds to naming a test.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// Overridable so the self-test can drive the whole checker against a synthetic
// tree: a guard only ever run on inputs it fails has not been shown to pass.
const DIR = process.env.ATTRIBUTION_DIR || path.join(ROOT, 'compatibility');
const ANCHOR = 'deliberate-divergences';

const problems = [];
const fail = (m) => problems.push(m);

// The same discovery rule the doc checker uses, minus the two files that are not
// a population of divergences: `provenance` annotates another ratchet's entries.
const ratchets = fs
	.readdirSync(DIR)
	.filter((f) => f.endsWith('.json') && /known-failures|excluded|not-comparable/.test(f))
	.filter((f) => !f.includes('.provenance.'))
	.sort();

const count = (x) =>
	Array.isArray(x) ? x.length : x && typeof x === 'object' ? Object.values(x).reduce((a, b) => a + count(b), 0) : 1;

const docs = fs
	.readdirSync(DIR)
	.filter((f) => f.endsWith('.md'))
	.map((f) => [f, fs.readFileSync(path.join(DIR, f), 'utf8')]);

const HEAD = /^Attribution of `([^`]+)`:\s*$/;
const ROW = /^\|\s*([\d,]+)\s*\|\s*(.+?)\s*\|(.*)\|\s*$/;

/** Every attribution block in the tree, keyed by the ratchet it names. */
const blocks = new Map();
for (const [file, text] of docs) {
	const lines = text.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const m = lines[i].trim().match(HEAD);
		if (!m) continue;
		const rows = [];
		for (let j = i + 1; j < lines.length; j++) {
			const raw = lines[j].trim();
			if (raw === '') continue;
			if (!raw.startsWith('|')) break;
			if (/^\|[\s|:-]+\|$/.test(raw)) continue; // separator
			// A header or a malformed row is skipped rather than ending the table:
			// breaking there reads the header, finds no rows and reports a sum of 0,
			// which is a different failure from the one the table actually has.
			const r = raw.match(ROW);
			if (r) rows.push({ n: Number(r[1].replace(/,/g, '')), target: r[2], line: j + 1 });
		}
		if (blocks.has(m[1])) fail(`${file}: a second attribution block for \`${m[1]}\` — one ratchet, one block`);
		blocks.set(m[1], { file, line: i + 1, rows });
	}
}

let attributed = 0;
let empty = 0;
for (const f of ratchets) {
	const n = count(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
	if (n === 0) {
		empty++;
		if (blocks.has(f)) fail(`${f} is empty but still carries an attribution block — delete the block`);
		continue;
	}
	const b = blocks.get(f);
	if (!b) {
		fail(`${f} has ${n} listed entr${n === 1 ? 'y' : 'ies'} and no \`Attribution of \\\`${f}\\\`:\` block`);
		continue;
	}
	const sum = b.rows.reduce((a, r) => a + r.n, 0);
	if (sum < n) {
		// A partial table is the honest shape while some clusters are still being
		// filed, so say which entries are uncovered rather than reporting a
		// bookkeeping mismatch — the two read very differently to whoever is next.
		fail(`${b.file}:${b.line}  ${f}: ${sum} of ${n} entries attributed, ${n - sum} carry no target`);
	} else if (sum > n) {
		fail(`${b.file}:${b.line}  attribution of ${f} sums to ${sum}, the ratchet holds only ${n}`);
	}
	for (const r of b.rows) {
		const cited = [...r.target.matchAll(/`([^`]+)`/g)].map((x) => x[1]);
		const ups = cited.filter((c) => c.startsWith('upstream_issues/'));
		const del = cited.includes(ANCHOR) || r.target.includes(`#${ANCHOR}`);
		if (!ups.length && !del) {
			fail(
				`${b.file}:${r.line}  attribution row for ${f} names no target — cite a ` +
					'`upstream_issues/<report>.md` path or `deliberate-divergences`',
			);
			continue;
		}
		for (const u of ups) {
			if (!fs.existsSync(path.join(process.env.ATTRIBUTION_ROOT || ROOT, u))) fail(`${b.file}:${r.line}  ${f} cites ${u}, which does not exist`);
		}
	}
	attributed += n;
}

for (const k of blocks.keys()) {
	if (!ratchets.includes(k)) fail(`${blocks.get(k).file}: attribution block names \`${k}\`, which is not a ratchet`);
}

if (problems.length) {
	console.error(problems.join('\n'));
	console.error(
		`\n[attribution-check] ${problems.length} problem(s). Every listed ratchet entry must be eliminated,\n` +
			'attributed to a filed `upstream_issues/` report, or attributed to `deliberate-divergences`\n' +
			'(which must in turn be pinned by a test). Prose without a target is not an attribution.',
	);
	process.exit(1);
}

console.log(
	`[attribution-check] ${ratchets.length} ratchets: ${empty} empty, ` +
		`${ratchets.length - empty} carrying ${attributed} attributed entries.`,
);
