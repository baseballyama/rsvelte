#!/usr/bin/env node
/**
 * Pins the parsers in `known-failures-md-check.mjs`, and — for the partition
 * check (#2500) — runs the whole checker against a mutated copy of the real
 * `compatibility/` docs.
 *
 * The case that matters for the count parser is not "does it find a count" — it
 * is that a doc citing a four-digit **issue number** and stating a **correct**
 * count must come back clean. The first version of this parser scanned for any
 * `N entries`-ish digit run and matched `### First catch: #1772` in
 * `sourcemap-known-failures.md`, which would have reported drift on every doc
 * that cites a PR. No positive control catches that: the parser was answering a
 * slightly different question correctly.
 *
 * The case that matters for the partition check is the opposite one: the real
 * docs all pass today, so running the checker only on them shows nothing about
 * whether it can fail. Each mutation below breaks exactly one property, and the
 * unmutated copy is the control that says the harness itself is not just always
 * reporting failure.
 *
 * Usage: node scripts/dev/test-known-failures-md-check.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { partitionLines, statedCounts, sumExpression } from '../compat-corpus/known-failures-md-check.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CHECKER = path.join(ROOT, 'scripts/compat-corpus/known-failures-md-check.mjs');
const CORPUS = path.join(ROOT, 'compatibility');

let failed = 0;
const check = (name, got, want) => {
	const ok = JSON.stringify(got) === JSON.stringify(want);
	if (!ok) {
		console.error(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`);
		failed++;
	} else {
		console.log(`ok   ${name}`);
	}
};

const KEY = 'sourcemap-known-failures.json';
const one = (r) => (r.ok ? { ok: true, count: r.counts[0].count } : { ok: false });

// ---- count parser -------------------------------------------------------------

// 1. The discriminating case: issue numbers present, count correct.
{
	const doc = [
		'# sourcemap-known-failures.json — why each entry is accepted',
		'',
		'**Current baseline: `sourcemap-known-failures.json`, 74 entries.**',
		'',
		'### First catch: #1772',
		'',
		'| ratchet entries | 75 | **73** |',
		'',
		'Fixing #1784 (a trailing comment) moved 1840 of them.',
	].join('\n');
	check('issue numbers do not become counts', one(statedCounts(doc, KEY)), { ok: true, count: 74 });
}

// 2. A doc that cites issue numbers and states NO count must fail, not silently
//    pick up an issue number. This is the same input minus the baseline line.
{
	const doc = ['# x', '', '### First catch: #1772', '', '| ratchet entries | 75 | **73** |'].join('\n');
	check('no baseline line is a failure, not a 1772', statedCounts(doc, KEY).ok, false);
}

// 3. The count must follow the filename, not merely share a line with it.
//    `1772 entries fixed by \`x.json\`` states nothing about x.json's size.
{
	const doc = 'Fixing 1772 entries touched `sourcemap-known-failures.json` along the way.';
	check('a count before the filename does not count', statedCounts(doc, KEY).ok, false);
}

// 4. Thousands separators, which the real docs use.
{
	const doc = 'Baseline: `sourcemap-known-failures.json`, 13,464 entries.';
	check('thousands separators parse', one(statedCounts(doc, KEY)), { ok: true, count: 13464 });
}

// 5. Singular, so a one-entry ratchet is not unparseable.
{
	const doc = 'Baseline: `sourcemap-known-failures.json`, 1 entry.';
	check('singular "entry" parses', one(statedCounts(doc, KEY)), { ok: true, count: 1 });
}

// 6. A different ratchet's line must not satisfy this one — otherwise two docs
//    could share a count and neither be checked.
{
	const doc = 'Baseline: `validator-known-failures.json`, 207 entries.';
	check('another ratchet’s count is not borrowed', statedCounts(doc, KEY).ok, false);
}

// 7. Every restatement is returned, not just the first. #2490 re-baselined a
//    ratchet 529 → 528, the header moved and a second sentence 45 lines away did
//    not; a parser that stops at the first hit reports that doc as verified.
{
	const doc = [
		'**Current baseline: `sourcemap-known-failures.json`, 528 entries.**',
		'',
		'Prose restating it: `sourcemap-known-failures.json` holds the same 529 entries on all three.',
	].join('\n');
	const r = statedCounts(doc, KEY);
	check('all restatements are returned', r.ok && r.counts.map((c) => c.count), [528, 529]);
}

// ---- addend expressions -------------------------------------------------------

check('sum of plain addends', sumExpression('141 + 53 + 13'), 207);
check('NxM multiplies', sumExpression('120 + 7x1 + 3'), 130);
check('thousands separators in addends', sumExpression('1,000 + 24'), 1024);

// ---- partition lines ----------------------------------------------------------

{
	const doc = [
		'Partition of `lint-known-failures.json` by rule: `36 + 16 + 6 + 9 + 7 + 2 + 2 + 2`',
		'Partition of `matrix-known-failures.json` entries under `comment-slot/` by seed: `56 + 56 + 24 + 8 + 8 + 8`',
		'',
		'Prose about a partition of something, mentioning `lint-known-failures.json`, is not a claim.',
	].join('\n');
	const got = partitionLines(doc).map((p) => [p.key, p.prefix, p.label, p.sum]);
	check('partition lines parse, prose does not', got, [
		['lint-known-failures.json', undefined, 'rule', 80],
		['matrix-known-failures.json', 'comment-slot/', 'seed', 160],
	]);
}

// A partition line whose addends are not addends must not silently become one.
{
	const doc = 'Partition of `x.json` by rule: `see the table above`';
	check('a non-numeric expression is not a partition', partitionLines(doc).length, 0);
}

// ---- end-to-end: the checker must fail on a mutated corpus ---------------------

const run = (dir) => {
	try {
		execFileSync(process.execPath, [CHECKER], { env: { ...process.env, KNOWN_FAILURES_DIR: dir }, encoding: 'utf8' });
		return { code: 0, out: '' };
	} catch (e) {
		return { code: e.status, out: `${e.stdout ?? ''}${e.stderr ?? ''}` };
	}
};

const withCorpus = (mutate, fn) => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kf-md-check-'));
	try {
		for (const f of fs.readdirSync(CORPUS)) {
			if (f.endsWith('.md') || f.endsWith('.json')) fs.copyFileSync(path.join(CORPUS, f), path.join(dir, f));
		}
		mutate(dir);
		return fn(run(dir));
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
};

const edit = (dir, file, from, to) => {
	const p = path.join(dir, file);
	const before = fs.readFileSync(p, 'utf8');
	if (!before.includes(from)) throw new Error(`self-test is stale: ${file} no longer contains ${JSON.stringify(from)}`);
	fs.writeFileSync(p, before.replace(from, to));
};

// The control. Without it, every mutation below "passing" would also be
// explained by the harness failing on any input at all.
withCorpus(
	() => {},
	(r) => check('unmutated corpus copy passes', r.code, 0),
);

withCorpus(
	(d) => edit(d, 'lint-known-failures.md', 'by rule: `36 +', 'by rule: `35 +'),
	(r) => check('a stale cluster count fails', [r.code, /sums to 103/.test(r.out)], [1, true]),
);

// The shape #2500 is about: an entry cited under two clusters, with the cluster
// totals adjusted so the doc still reads as if it summed. One addend moves up,
// another moves down, the sum is unchanged — and only a check that compares the
// sum against the JSON rather than against a stated total can see it.
withCorpus(
	(d) => edit(d, 'lint-known-failures.md', 'by direction: `32 + 72`', 'by direction: `33 + 72`'),
	(r) => check('a double-cited entry fails', [r.code, /sums to 105/.test(r.out)], [1, true]),
);

withCorpus(
	(d) => edit(d, 'lint-known-failures.md', 'Partition of `lint-known-failures.json` by repo: `45 + 28 + 18 + 10 + 3`\n', ''),
	(r) => check('a deleted partition line fails', [r.code, /found 0/.test(r.out)], [1, true]),
);

// A sub-population partition must be checked against that sub-population, not
// against the whole ratchet — `comment-slot`'s 212 is not the matrix ratchet's 807.
withCorpus(
	(d) =>
		edit(
			d,
			'matrix-known-failures.md',
			'by seed: `56 + 28 + 24 + 24 + 24 + 24 + 8 + 8 + 8 + 8`',
			'by seed: `56 + 30 + 24 + 24 + 24 + 24 + 8 + 8 + 8 + 8`',
		),
	(r) => check('a sub-population partition is bound to its prefix', [r.code, /has 212 entries/.test(r.out)], [1, true]),
);

withCorpus(
	(d) =>
		edit(
			d,
			'matrix-known-failures.md',
			'Partition of `matrix-known-failures.json` by family: `2 + 212 + 90 + 18 + 60 + 422 + 3`',
			'Partition of `matrix-known-failures.json` by nothing in particular: `2 + 232 + 90 + 18 + 60 + 422 + 3`',
		),
	(r) => check('an undeclared partition fails', [r.code, /not declared in PARTITIONS/.test(r.out)], [1, true]),
);

// The restatement half: a second, stale copy of a count the header states correctly.
withCorpus(
	(d) =>
		edit(
			d,
			'warning-known-failures.md',
			'`warning-position-known-failures.<target>.json` the same 4 entries',
			'`warning-position-known-failures.<target>.json` the same 5 entries',
		),
	(r) => check('a stale restatement fails', [r.code, /states 5 entries/.test(r.out)], [1, true]),
);

if (failed) {
	console.error(`\n${failed} failure(s)`);
	process.exit(1);
}
console.log('\nall known-failures-md-check cases pass');
