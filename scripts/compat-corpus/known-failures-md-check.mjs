#!/usr/bin/env node
/**
 * Guards every ratchet's justification doc against drifting from the JSON it
 * documents. The JSON files are CI-enforced (shrink-only), but the prose counts
 * are hand-maintained, and a doc that no longer describes its entries is the
 * whole reason the ratchets are allowed to be non-empty.
 *
 * Four properties, in the order they matter:
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
 *   4. CLUSTER COUNTS MUST PARTITION, AND THE TOTAL COMES FROM THE DATA (#2500).
 *      A doc that splits its ratchet into counted clusters can double-cite an
 *      entry and still have every number on the page look right — the clusters
 *      only sum to the file length if each entry is counted once, so asserting
 *      the sum turns "the clusters partition the ratchet" from a convention into
 *      something that fails. The total is read off the JSON, never off the doc:
 *      a sum checked against a total the same author typed would agree with
 *      itself when both were adjusted together, which is the case that already
 *      looks correct from every angle.
 *
 * Two conventions each doc must satisfy. First, once per JSON it documents:
 *
 *     ... `<name>.json` ... <N> entries ...
 *
 * on a single line. Per-target families use the `<target>` placeholder the docs
 * already write (`warning-known-failures.<target>.json`), and every target's
 * JSON must then agree on the count — which also catches the day they diverge.
 * A doc may state that count on more than one line; every occurrence is read and
 * they must agree, because a check bound to one of them passes while the others
 * go stale (#2490 left a second, unbound copy behind).
 *
 * Second, once per declared partition in `PARTITIONS`:
 *
 *     Partition of `<name>.json` [entries under `<prefix>`] by <label>: `a + b + NxM`
 *
 * A partition line is a claim that each entry is counted exactly once. Where a
 * doc cannot honour that literally it states its tie-break — `fmt-known-failures.md`
 * files an id that carries two clusters' divergences under its dominant one —
 * and the sum stays meaningful.
 *
 * Usage: node scripts/compat-corpus/known-failures-md-check.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
// Overridable so the self-test can run the whole checker against a mutated copy
// of the real docs: a guard that is only ever run on inputs it passes has not
// been shown to fail on anything.
const CORPUS = process.env.KNOWN_FAILURES_DIR || path.join(ROOT, 'compatibility');

// The per-ratchet justification docs are consolidated into `KNOWN-FAILURES.md` /
// `GATES.md`, where each former file becomes an `<a id="<stem>"></a>` anchored
// section. Resolving both shapes here keeps a ratchet's `doc:` a machine-facing
// key instead of a path every consolidation has to rewrite, and keeps the scope
// per-ratchet: reading the whole merged file would let a partition declared for
// one ratchet satisfy the check for another.
const MERGED = ['KNOWN-FAILURES.md', 'GATES.md'];
const mergedLines = new Map();
// `existsSync` is case-insensitive on macOS, where `known-failures.md` and
// `KNOWN-FAILURES.md` are one path — so the per-file branch would swallow the
// merged file whole and every ratchet's section would be the entire document.
// Ask the directory listing, which is exact on both platforms.
const corpusNames = new Set(fs.readdirSync(CORPUS));
function docText(doc) {
	if (corpusNames.has(doc)) return fs.readFileSync(path.join(CORPUS, doc), 'utf8');
	const stem = doc.replace(/\.md$/, '');
	for (const merged of MERGED) {
		const mp = path.join(CORPUS, merged);
		if (!fs.existsSync(mp)) continue;
		if (!mergedLines.has(mp)) mergedLines.set(mp, fs.readFileSync(mp, 'utf8').split('\n'));
		const all = mergedLines.get(mp);
		const start = all.findIndex((l) => l.trim() === `<a id="${stem}"></a>`);
		if (start === -1) continue;
		let end = all.length;
		for (let i = start + 1; i < all.length; i++) {
			if (/^<a id="[^"]+"><\/a>$/.test(all[i].trim())) {
				end = i;
				break;
			}
		}
		return all.slice(start, end).join('\n');
	}
	return null;
}

const TARGETS = ['client', 'server', 'client-dev', 'server-dev'];
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
	{
		doc: 'warning-message-known-failures.md',
		key: 'warning-message-known-failures.<target>.json',
		jsons: perTarget('warning-message-known-failures'),
	},
	// Declared per target rather than with the `<target>` placeholder: `server`
	// legitimately holds one entry fewer (an error only the client codegen
	// raises), and a placeholder would report that as a drift to fix.
	...TARGETS.map((t) => ({
		doc: 'error-known-failures.md',
		key: `error-message-known-failures.${t}.json`,
		jsons: [`error-message-known-failures.${t}.json`],
	})),
	{
		doc: 'error-known-failures.md',
		key: 'error-position-known-failures.<target>.json',
		jsons: perTarget('error-position-known-failures'),
	},
	{
		doc: 'error-known-failures.md',
		key: 'error-end-known-failures.<target>.json',
		jsons: perTarget('error-end-known-failures'),
	},
	{
		doc: 'error-known-failures.md',
		key: 'error-frame-known-failures.<target>.json',
		jsons: perTarget('error-frame-known-failures'),
	},
	// Declared per target rather than through the `<target>` placeholder: the two
	// client targets carry entries and the two server ones are still at 0, so one
	// shared count would have to be wrong for two of the four.
	{
		doc: 'parse-known-failures.md',
		key: 'parse-known-failures.client.json',
		jsons: ['parse-known-failures.client.json'],
	},
	{
		doc: 'parse-known-failures.md',
		key: 'parse-known-failures.client-dev.json',
		jsons: ['parse-known-failures.client-dev.json'],
	},
	{
		doc: 'parse-known-failures.md',
		key: 'parse-known-failures.server.json',
		jsons: ['parse-known-failures.server.json'],
	},
	{
		doc: 'parse-known-failures.md',
		key: 'parse-known-failures.server-dev.json',
		jsons: ['parse-known-failures.server-dev.json'],
	},
	{
		doc: 'parse-ast-known-failures.md',
		key: 'parse-ast-known-failures.json',
		jsons: ['parse-ast-known-failures.json'],
	},
	{
		doc: 'parse-oracle-excluded.md',
		key: 'parse-oracle-excluded.json',
		jsons: ['parse-oracle-excluded.json'],
	},
	{ doc: 'matrix-known-failures.md', key: 'matrix-known-failures.json', jsons: ['matrix-known-failures.json'] },
	{ doc: 'dual-run-known-failures.md', key: 'dual-run-known-failures.json', jsons: ['dual-run-known-failures.json'] },
	{ doc: 'validator-known-failures.md', key: 'validator-known-failures.json', jsons: ['validator-known-failures.json'] },
	{
		doc: 'validator-message-known-failures.md',
		key: 'validator-message-known-failures.json',
		jsons: ['validator-message-known-failures.json'],
	},
	{
		doc: 'validator-message-not-comparable.md',
		key: 'validator-message-not-comparable.json',
		jsons: ['validator-message-not-comparable.json'],
	},
	{ doc: 'mutation-known-failures.md', key: 'mutation-known-failures.json', jsons: ['mutation-known-failures.json'] },
	{
		doc: 'mutation-known-failures.md',
		key: 'mutation-known-failures.provenance.json',
		jsons: ['mutation-known-failures.provenance.json'],
	},
	{ doc: 'sourcemap-known-failures.md', key: 'sourcemap-known-failures.json', jsons: ['sourcemap-known-failures.json'] },
	{ doc: 'sourcemap-oracle-excluded.md', key: 'sourcemap-oracle-excluded.json', jsons: ['sourcemap-oracle-excluded.json'] },
	{ doc: 'css-prune-known-failures.md', key: 'css-prune-known-failures.json', jsons: ['css-prune-known-failures.json'] },
	{ doc: 'fmt-known-failures.md', key: 'fmt-known-failures.json', jsons: ['fmt-known-failures.json'] },
	{ doc: 'fmt-oracle-excluded.md', key: 'fmt-oracle-excluded.json', jsons: ['fmt-oracle-excluded.json'] },
	{ doc: 'lint-known-failures.md', key: 'lint-known-failures.json', jsons: ['lint-known-failures.json'] },
	...[
		'lint-adversarial',
		'lint-adversarial-end',
		'lint-adversarial-fix',
		'lint-adversarial-fix-all',
		'lint-adversarial-suggest',
		'lint-conditions',
		'lint-env',
		'lint-preset',
		'lint-severity',
	].map((stem) => ({
		doc: `${stem}-known-failures.md`,
		key: `${stem}-known-failures.json`,
		jsons: [`${stem}-known-failures.json`],
	})),
	{ doc: 'scss-known-failures.md', key: 'scss-known-failures.json', jsons: ['scss-known-failures.json'] },
	{ doc: 'check-known-failures.md', key: 'check-known-failures.json', jsons: ['check-known-failures.json'] },
	{ doc: 'check-e2e-known-failures.md', key: 'check-e2e-known-failures.json', jsons: ['check-e2e-known-failures.json'] },
	{ doc: 'lsp-known-failures.md', key: 'lsp-known-failures.json', jsons: ['lsp-known-failures.json'] },
	{ doc: 'svelte2tsx-known-failures.md', key: 'svelte2tsx-known-failures.json', jsons: ['svelte2tsx-known-failures.json'] },
	{ doc: 'svelte2tsx-map-known-failures.md', key: 'svelte2tsx-map-known-failures.json', jsons: ['svelte2tsx-map-known-failures.json'] },
	{
		doc: 'svelte2tsx-unparseable-known-failures.md',
		key: 'svelte2tsx-unparseable-known-failures.json',
		jsons: ['svelte2tsx-unparseable-known-failures.json'],
	},
	{
		doc: 'svelte2tsx-fixtures-known-failures.md',
		key: 'svelte2tsx-fixtures-known-failures.json',
		jsons: ['svelte2tsx-fixtures-known-failures.json'],
	},
];

/**
 * The declared cluster partitions (#2500). `key` names a ratchet in `RATCHETS`;
 * `prefix` narrows the population to the ids that start with it, for a doc that
 * partitions a sub-population rather than the whole file (`comment-slot`'s 232
 * is not the matrix ratchet's 234). `label` is what the split is by, so one
 * ratchet can carry several independent partitions — three of lint's 80 entries,
 * which is where a double-citation is most likely to be caught.
 *
 * Declared rather than inferred for the same reason `RATCHETS` is: a partition
 * line deleted from a doc has to fail, and a scan of the docs alone cannot tell
 * "this doc states no clusters" from "someone removed the one it stated".
 */
const PARTITIONS = [
	{ doc: 'known-failures.md', key: 'known-failures.client.json', label: 'verdict' },
	{ doc: 'known-failures.md', key: 'known-failures.server.json', label: 'verdict' },
	{ doc: 'known-failures.md', key: 'known-failures.server-dev.json', label: 'verdict' },
	{ doc: 'known-failures.md', key: 'known-failures.client-dev.json', label: 'verdict' },
	{
		doc: 'svelte2tsx-known-failures.md',
		key: 'svelte2tsx-known-failures.json',
		label: 'verdict',
	},
	{
		doc: 'svelte2tsx-known-failures.md',
		key: 'svelte2tsx-known-failures.json',
		label: 'mechanism',
	},
	{
		doc: 'svelte2tsx-unparseable-known-failures.md',
		key: 'svelte2tsx-unparseable-known-failures.json',
		label: 'mechanism',
	},
	{ doc: 'fmt-known-failures.md', key: 'fmt-known-failures.json', label: 'cluster' },
	{ doc: 'fmt-known-failures.md', key: 'fmt-known-failures.json', label: 'mechanism' },
	{ doc: 'lint-known-failures.md', key: 'lint-known-failures.json', label: 'rule' },
	{ doc: 'lint-known-failures.md', key: 'lint-known-failures.json', label: 'direction' },
	{ doc: 'lint-known-failures.md', key: 'lint-known-failures.json', label: 'repo' },
	{
		doc: 'lint-adversarial-fix-known-failures.md',
		key: 'lint-adversarial-fix-known-failures.json',
		label: 'cause',
	},
	{
		doc: 'lint-adversarial-fix-all-known-failures.md',
		key: 'lint-adversarial-fix-all-known-failures.json',
		label: 'cause',
	},
	{
		doc: 'lint-severity-known-failures.md',
		key: 'lint-severity-known-failures.json',
		label: 'cause',
	},
	{ doc: 'scss-known-failures.md', key: 'scss-known-failures.json', label: 'verdict' },
	{ doc: 'lsp-known-failures.md', key: 'lsp-known-failures.json', label: 'key kind' },
	{ doc: 'lsp-known-failures.md', key: 'lsp-known-failures.json', label: 'request phase' },
	{
		doc: 'lsp-known-failures.md',
		key: 'lsp-known-failures.json',
		prefix: 'aggregate:corpus/',
		label: 'repository',
	},
	{ doc: 'matrix-known-failures.md', key: 'matrix-known-failures.json', label: 'family' },
	{
		doc: 'matrix-known-failures.md',
		key: 'matrix-known-failures.json',
		prefix: 'comment-slot/',
		label: 'what diverges',
	},
	{ doc: 'matrix-known-failures.md', key: 'matrix-known-failures.json', prefix: 'comment-slot/', label: 'seed' },
	{
		doc: 'matrix-known-failures.md',
		key: 'matrix-known-failures.json',
		prefix: 'each-collection/',
		label: 'collection',
	},
	{ doc: 'matrix-known-failures.md', key: 'matrix-known-failures.json', prefix: 'param-pattern/', label: 'shape' },
	{ doc: 'matrix-known-failures.md', key: 'matrix-known-failures.json', prefix: 'keyword-regex/', label: 'target' },
	{
		doc: 'matrix-known-failures.md',
		key: 'matrix-known-failures.json',
		prefix: 'directive-element/',
		label: 'verdict and host',
	},
	{
		doc: 'matrix-known-failures.md',
		key: 'matrix-known-failures.json',
		prefix: 'async-derived/',
		label: 'cause',
	},
	{
		doc: 'matrix-known-failures.md',
		key: 'matrix-known-failures.json',
		prefix: 'async-attribute-slot/',
		label: 'cause',
	},
	{
		doc: 'matrix-known-failures.md',
		key: 'matrix-known-failures.json',
		prefix: 'opaque-keyword/',
		label: 'cause',
	},
	{
		doc: 'matrix-known-failures.md',
		key: 'matrix-known-failures.json',
		prefix: 'fold-value-type/',
		label: 'operator class',
	},
	{ doc: 'validator-known-failures.md', key: 'validator-known-failures.json', label: 'cluster' },
	{ doc: 'warning-known-failures.md', key: 'warning-known-failures.<target>.json', label: 'direction' },
	{ doc: 'parse-ast-known-failures.md', key: 'parse-ast-known-failures.json', label: 'cluster' },
];

// Sidecars carrying a one-to-one id -> mechanism assignment, and the doc whose
// `Entries by mechanism` table is derived from each. Declared, not discovered,
// for the same reason RATCHETS is: adding a sidecar nothing checks is the shape
// this section exists to close.
const MECHANISMS = [
	{ sidecar: 'fmt-mechanisms.json', doc: 'fmt-known-failures.md', jsons: ['fmt-known-failures.json'] },
	{
		sidecar: 'svelte2tsx-mechanisms.json',
		doc: 'svelte2tsx-known-failures.md',
		jsons: ['svelte2tsx-known-failures.json', 'svelte2tsx-unparseable-known-failures.json'],
	},
];

let failed = false;
const fail = (msg) => {
	console.error(`[known-failures-md-check] ${msg}`);
	failed = true;
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const num = (s) => Number(s.replace(/,/g, ''));
const jsonEntryCount = (value) => (Array.isArray(value) ? value.length : Object.keys(value).length);

/**
 * The rows of a doc's `Entries by mechanism` table, or null if it has none.
 * Anchored on the heading rather than on the row shape: an attribution table a
 * few lines up has the same three columns, and a reader keyed on shape alone
 * would compare the sidecar against whichever table came first.
 */
function mechanismTable(body) {
	const lines = body.split('\n');
	const start = lines.findIndex((l) => /^#{2,4} Entries by mechanism\b/.test(l));
	if (start === -1) return null;
	const rows = [];
	let seen = false;
	for (let i = start + 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line.startsWith('|')) {
			if (seen) break;
			continue;
		}
		seen = true;
		const cells = line.split('|').slice(1, -1).map((c) => c.trim());
		if (cells.length < 3) continue;
		if (!/^\d+$/.test(cells[0])) continue; // header and separator rows
		rows.push({ n: Number(cells[0]), mechanism: cells[1], pinned: cells[2] });
	}
	return rows;
}

/**
 * Every count a doc states for `key`, or a reason none could be read. All of
 * them are returned: a doc restating the same quantity elsewhere is normal
 * (#2490 left `529` in prose while the header moved to `528`), and a checker
 * that stops at the first one reports the doc as verified while the rest rot.
 */
export function statedCounts(docText, key) {
	const counts = [];
	for (const line of docText.split('\n')) {
		if (!line.includes(`\`${key}\``) || !/\b[\d,]+\s+entr(?:y|ies)\b/.test(line)) continue;
		// Anchored to the right of the filename so a number elsewhere on the line
		// (an issue reference, a percentage) cannot be picked up instead.
		const after = line.slice(line.indexOf(`\`${key}\``) + key.length + 2);
		const m = after.match(/\b([\d,]+)\s+entr(?:y|ies)\b/);
		if (m) counts.push({ count: num(m[1]), line: line.trim() });
	}
	if (!counts.length) return { ok: false, reason: 'no line names the ratchet beside an "N entries" count' };
	return { ok: true, counts };
}

/** Sums an addend expression in the docs' own notation: `a + b + NxM`. */
export function sumExpression(expression) {
	return expression
		.split('+')
		.map((term) => {
			const [a, b] = term.trim().split('x');
			return b === undefined ? num(a) : num(a) * num(b);
		})
		.reduce((a, b) => a + b, 0);
}

const PARTITION_RE = /^Partition of `([^`]+)`(?: entries under `([^`]+)`)? by ([^:]+): `([\d\s,x+]+)`/;

/** The `Partition of …` claims a doc makes, in declaration order. */
export function partitionLines(docText) {
	const out = [];
	for (const raw of docText.split('\n')) {
		const m = raw.trim().match(PARTITION_RE);
		if (m) out.push({ key: m[1], prefix: m[2], label: m[3].trim(), expression: m[4], sum: sumExpression(m[4]) });
	}
	return out;
}

// Importing this module must not run the checks: a failing checker would
// `process.exit(1)` during import and take its own test suite down with it,
// which reads as "tests did not fail".
// `import.meta.url` is the realpath and `path.resolve` is not, so comparing the two
// makes an invocation through any symlinked path exit 0 having checked nothing.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();

function main() {
// ---- 1. every ratchet JSON on disk is declared --------------------------------
const onDisk = fs
	.readdirSync(CORPUS)
	// `not-comparable` is a ratchet whose entries are neither failures nor
	// exclusions, so it would not be discovered by the other two names.
	.filter((f) => f.endsWith('.json') && /known-failures|excluded|not-comparable/.test(f))
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
	const docBody = docText(doc);
	if (docBody === null) {
		fail(`missing justification doc ${doc} (declared for ${key})`);
		continue;
	}
	const lengths = jsons.map((j) => {
		const p = path.join(CORPUS, j);
		return fs.existsSync(p) ? jsonEntryCount(JSON.parse(fs.readFileSync(p, 'utf8'))) : null;
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
	const stated = statedCounts(docBody, key);
	if (!stated.ok) {
		fail(
			`${doc}: cannot verify the count for \`${key}\` — ${stated.reason}.\n` +
				`    Write it as: \`${key}\` … ${actual} entries`,
		);
		continue;
	}
	for (const { count, line } of stated.counts) {
		if (count !== actual) fail(`${doc} states ${count} entries for \`${key}\`, but the JSON has ${actual}\n    ${line}`);
	}
}

// ---- 2b. declared cluster partitions sum to the population they claim --------
const ratchetByKey = new Map(RATCHETS.map((r) => [r.key, r]));
const idsFor = (key) => {
	const jsons = ratchetByKey.get(key)?.jsons ?? [];
	const p = path.join(CORPUS, jsons[0] ?? '');
	return jsons.length && fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
};
const declaredPartitions = new Set(PARTITIONS.map((p) => `${p.doc}\0${p.key}\0${p.prefix ?? ''}\0${p.label}`));

for (const doc of new Set(RATCHETS.map((r) => r.doc))) {
	const docBody = docText(doc);
	if (docBody === null) continue; // already reported above
	for (const found of partitionLines(docBody)) {
		const id = `${doc}\0${found.key}\0${found.prefix ?? ''}\0${found.label}`;
		if (!declaredPartitions.has(id)) {
			fail(
				`${doc}: partition by "${found.label}" of \`${found.key}\`${found.prefix ? ` under \`${found.prefix}\`` : ''} is not declared in PARTITIONS — add it, so deleting the line fails too`,
			);
		}
	}
}

for (const { doc, key, prefix, label } of PARTITIONS) {
	const docBody = docText(doc);
	if (docBody === null) continue; // already reported above
	const ids = idsFor(key);
	if (ids === null) {
		fail(`PARTITIONS declares \`${key}\` for ${doc}, which is not a ratchet in RATCHETS`);
		continue;
	}
	// A ratchet is an array of ids or an object keyed by them; `Object.keys` on an
	// array is its indices, so normalise rather than branching at every use.
	const idList = Array.isArray(ids) ? ids : Object.keys(ids);
	const population = prefix ? idList.filter((id) => String(id).startsWith(prefix)) : idList;
	const matches = partitionLines(docBody).filter(
		(p) => p.key === key && (p.prefix ?? undefined) === prefix && p.label === label,
	);
	const where = `\`${key}\`${prefix ? ` entries under \`${prefix}\`` : ''} by ${label}`;
	if (matches.length !== 1) {
		fail(
			`${doc}: expected exactly one partition line for ${where}, found ${matches.length}.\n` +
				`    Write it as: Partition of ${where}: \`` +
				`${population.length}\` (as many addends as clusters, each entry counted once)`,
		);
		continue;
	}
	const [{ expression, sum }] = matches;
	if (sum !== population.length) {
		fail(
			`${doc}: partition of ${where} sums to ${sum} (\`${expression}\`), but that population has ${population.length} entries.\n` +
				`    Either a cluster count is stale, or an entry is cited under two clusters and another under none.`,
		);
	}
}

// ---- 2b. a partition's own restatements must not go stale ---------------------
// The header count and the partition line are both checked against the JSON, and
// the numbers restating them a few lines down are not — so a section can read
// `45 entries` / `Partition …: \`45\`` above `- **48 — the generated JS differs.**`
// and pass. Both restatements are derivable from the partition line, so both are
// checked here; nothing else in the prose is, because nothing else is derivable.
for (const doc of new Set(PARTITIONS.map((p) => p.doc))) {
	const body = docText(doc);
	if (body === null) continue;
	const lines = body.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const partition = partitionLines(lines[i].trim())[0];
		if (!partition) continue;
		const terms = partition.expression
			.split('+')
			.map((t) => t.trim())
			.filter(Boolean);

		// (a) A bullet list immediately below restates the addends, one per bullet.
		// Triggered by shape, so a doc that puts its clusters in a table or in prose
		// is not required to grow one — but a doc that has the list has it checked.
		// A `NxM` addend covers M clusters at once and has no one-bullet form, so
		// those partitions are left to the sum check above.
		if (!terms.some((t) => t.includes('x'))) {
			let j = i + 1;
			while (j < lines.length && lines[j].trim() === '') j++;
			if (j < lines.length && /^\s*-\s/.test(lines[j])) {
				const bullets = [];
				for (; j < lines.length; j++) {
					const line = lines[j];
					if (/^\s*-\s/.test(line)) {
						const m = line.match(/\d[\d,]*/);
						bullets.push(m ? m[0].replace(/,/g, '') : 'no-number');
					} else if (line.trim() === '') {
						let k = j;
						while (k < lines.length && lines[k].trim() === '') k++;
						if (k < lines.length && /^\s*-\s/.test(lines[k])) {
							j = k - 1;
							continue;
						}
						break;
					} else if (/^\s+\S/.test(line)) {
						continue; // a continuation line of the bullet above
					} else break;
				}
				const want = terms.map((t) => t.replace(/,/g, '')).sort();
				const got = [...bullets].sort();
				if (want.join(' ') !== got.join(' ')) {
					fail(
						`${doc}:${i + 1}: the bullets under \`${partition.key}\`'s partition read ` +
							`[${got.join(', ')}] but the partition is \`${partition.expression}\`.\n` +
							`    The addends and the bullets restating them are the same claim; one of them is stale.`,
					);
				}
			}
		}

		// (b) `All remaining N arrived …` states the whole population, which is the
		// partition's sum. Only this phrasing: `remaining 20` a few sections down
		// means the residue after an attributed cluster, which is a different number.
		const end = lines.findIndex((l, at) => at > i && /^### /.test(l));
		const section = lines.slice(i + 1, end === -1 ? lines.length : end).join('\n');
		const next = lines.findIndex((l, at) => at > i && partitionLines(l.trim())[0]);
		const stop = [end, next].filter((x) => x !== -1);
		const scoped = lines.slice(i + 1, stop.length ? Math.min(...stop) : lines.length).join('\n');
		for (const m of section.matchAll(/(?:All|Every one of the) remaining \*{0,2}([\d,]+)/g)) {
			const stated = Number(m[1].replace(/,/g, ''));
			if (stated !== partition.sum) {
				fail(
					`${doc}:${i + 1}: the section says "remaining ${m[1]}" but its partition sums to ${partition.sum}.`,
				);
			}
		}

		// (c) The same claim in two more spellings. `All N …` at the start of a
		// sentence states the whole population; `The other N …` states the residue
		// after the section's attribution table. Both were unchecked, and both had
		// gone stale by an order of magnitude while (a) and (b) were green — which
		// reads, to the next author, as "counts in this file are checked".
		//
		// Scoped to a non-empty partition, and to the region before the NEXT
		// partition line rather than the next heading. Without the first, six
		// `All N generated comparisons now match` lines in `matrix-known-failures.md`
		// are read as entry counts against a partition of 0; without the second, one
		// such line is reported once per partition sharing its heading — the measured
		// shape was 3 distinct sentences reported 22 times.
		if (partition.sum === 0) continue;
		const attributed = [...scoped.matchAll(/^\|\s*([\d,]+)\s*\|/gm)].reduce(
			(a, m) => a + Number(m[1].replace(/,/g, '')),
			0,
		);
		for (const m of scoped.matchAll(/^All \*{0,2}([\d,]+)\*{0,2} /gm)) {
			const stated = Number(m[1].replace(/,/g, ''));
			if (stated !== partition.sum) {
				fail(
					`${doc}:${i + 1}: the section says "All ${m[1]}" but its partition sums to ${partition.sum}.`,
				);
			}
		}
		for (const m of scoped.matchAll(/^The other \*{0,2}([\d,]+)\*{0,2} /gm)) {
			const stated = Number(m[1].replace(/,/g, ''));
			const want = partition.sum - attributed;
			if (stated !== want) {
				fail(
					`${doc}:${i + 1}: the section says "The other ${m[1]}" but its partition sums to ` +
						`${partition.sum} with ${attributed} attributed, leaving ${want}.`,
				);
			}
		}
	}
}

// ---- 3. doc-specific reconciliations that no generic rule can derive ----------
const knownFailuresMd = docText('known-failures.md') ?? '';
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
// Convention: `summing to <total> (\`a + b + NxM\`)`. Scanned in every ratchet
// doc, not just the one that introduced it — a convention checked in a single
// file is a convention the next doc to adopt it gets for free and unverified.
for (const doc of new Set(RATCHETS.map((r) => r.doc))) {
	const text = docText(doc);
	if (text === null) continue;
	for (const [, statedRaw, expression] of text.matchAll(/summing to (?:all )?([\d,]+)\s*\(`([\d\s,x+]+)`\)/g)) {
		const total = sumExpression(expression);
		if (total !== num(statedRaw)) fail(`${doc} claims ${statedRaw} but \`${expression}\` sums to ${total}`);
	}
}

// Matrix per-family split: the number a burn-down PR forgets to update.
const matrixMd = docText('matrix-known-failures.md') ?? '';
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
const mutationMd = docText('mutation-known-failures.md');
if (mutationMd !== null) {
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

// ---- 2d. mechanism sidecars, and the table derived from them -----------------
// A sidecar assigns exactly one mechanism to every entry of the ratchets it
// covers, and the doc's `Entries by mechanism` table is DERIVED from it. Nothing
// read `svelte2tsx-mechanisms.json` before this check existed, and the cost of
// that shape is measured: `fmt-known-failures.md` stated `5 + 783` for a
// 547-entry ratchet while the partition line beside it was correct — one half was
// gated and the other rotted alone, which is why the sidecar is worth nothing
// until something compares the table to it.
let mechanismEntries = 0;
for (const { sidecar, doc, jsons } of MECHANISMS) {
	const sidecarPath = path.join(CORPUS, sidecar);
	if (!fs.existsSync(sidecarPath)) {
		fail(`MECHANISMS declares ${sidecar}, which does not exist`);
		continue;
	}
	const map = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
	const mechanisms = map.mechanisms ?? {};
	const assigned = map.entries ?? {};

	const population = [];
	for (const j of jsons) {
		const p = path.join(CORPUS, j);
		if (!fs.existsSync(p)) continue;
		const value = JSON.parse(fs.readFileSync(p, 'utf8'));
		population.push(...(Array.isArray(value) ? value : Object.keys(value)));
	}
	// Both directions: an unassigned entry is an unattributed one wearing a full
	// table, and a leftover assignment keeps a fixed entry's mechanism alive.
	for (const id of population) {
		if (!(id in assigned)) fail(`${sidecar} assigns no mechanism to \`${id}\``);
	}
	const inPopulation = new Set(population);
	for (const id of Object.keys(assigned)) {
		if (!inPopulation.has(id)) fail(`${sidecar} assigns a mechanism to \`${id}\`, which no ratchet it covers lists`);
	}

	mechanismEntries += Object.keys(assigned).length;
	const counts = new Map();
	for (const [id, slug] of Object.entries(assigned)) {
		if (!(slug in mechanisms)) {
			fail(`${sidecar}: \`${id}\` names mechanism "${slug}", which the file does not declare`);
			continue;
		}
		counts.set(slug, (counts.get(slug) ?? 0) + 1);
	}
	for (const slug of Object.keys(mechanisms)) {
		if (!counts.has(slug)) fail(`${sidecar} declares mechanism "${slug}", which no entry names`);
	}

	const body = docText(doc);
	if (body === null) continue; // already reported above
	const rows = mechanismTable(body);
	if (rows === null) {
		fail(`${doc}: no \`Entries by mechanism\` table to compare ${sidecar} against`);
		continue;
	}
	if (rows.length !== counts.size) {
		fail(`${doc}: the \`Entries by mechanism\` table has ${rows.length} row(s), but ${sidecar} uses ${counts.size} mechanism(s)`);
	}
	for (const [slug, n] of counts) {
		const { description, pinned } = mechanisms[slug];
		const row = rows.find((r) => r.mechanism === description);
		if (!row) {
			fail(`${doc}: the \`Entries by mechanism\` table has no row for "${slug}" — its cell must be the sidecar's \`description\` verbatim`);
			continue;
		}
		if (row.n !== n) fail(`${doc}: the table says ${row.n} for "${slug}", but ${sidecar} assigns it ${n}`);
		if (row.pinned !== pinned) fail(`${doc}: the table's \`pinned\` for "${slug}" is "${row.pinned}", but ${sidecar} says "${pinned}"`);
	}
}

// An attribution that names a file nobody wrote reads exactly like one that does.
// Two of these were already live, both citing a renamed upstream_issues item.
// Resolved from the repo, not from CORPUS: the self-test points CORPUS at a
// temp copy, and an `upstream_issues/` that is merely absent would make every
// link look broken — a failure mode indistinguishable from a real dangling one.
const issuesDir = path.join(ROOT, 'upstream_issues');
let issueLinks = 0;
for (const doc of fs.readdirSync(CORPUS).filter((f) => f.endsWith('.md'))) {
	const docPath = path.join(CORPUS, doc);
	for (const [, name] of fs.readFileSync(docPath, 'utf8').matchAll(/upstream_issues\/([A-Za-z0-9._-]+\.md)/g)) {
		issueLinks++;
		if (!fs.existsSync(path.join(issuesDir, name))) {
			fail(`${doc} attributes entries to upstream_issues/${name}, which does not exist`);
		}
	}
}

	if (failed) {
		console.error('\n[known-failures-md-check] update the known-failures docs to match the JSON ratchets above.');
		process.exit(1);
	}
	console.log(
		`[known-failures-md-check] ${RATCHETS.length} declared ratchets across ${new Set(RATCHETS.map((r) => r.doc)).size} docs match their JSON; ${PARTITIONS.length} cluster partitions add up; ${MECHANISMS.length} mechanism sidecars cover ${mechanismEntries} entries.`,
	);
}
