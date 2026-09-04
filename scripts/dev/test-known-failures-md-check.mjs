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
// The docs consolidate into two files (P2), so a per-ratchet `.md` is not a
// path this harness may hold: resolve a doc by the text it contains instead.
const docText = (dir, file) => {
	const direct = path.join(dir, file);
	if (fs.existsSync(direct)) return { p: direct, text: fs.readFileSync(direct, 'utf8') };
	return null;
};
const findDoc = (dir, file, needle) => {
	const direct = docText(dir, file);
	if (direct && direct.text.includes(needle)) return direct;
	for (const f of fs.readdirSync(dir)) {
		if (!f.endsWith('.md')) continue;
		const q = path.join(dir, f);
		const text = fs.readFileSync(q, 'utf8');
		if (text.includes(needle)) return { p: q, text };
	}
	return null;
};

const MATRIX_FAMILY_PARTITION_RE = /^Partition of `matrix-known-failures\.json` by family: `[^`]+`$/m;
const MATRIX_FAMILY_PARTITION = (() => {
	for (const f of fs.readdirSync(CORPUS)) {
		if (!f.endsWith('.md')) continue;
		const m = fs.readFileSync(path.join(CORPUS, f), 'utf8').match(MATRIX_FAMILY_PARTITION_RE);
		if (m) return m[0];
	}
	return undefined;
})();

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
	const found = findDoc(dir, file, from);
	if (!found) throw new Error(`self-test is stale: no doc holds ${JSON.stringify(from)} (looked for ${file} first)`);
	fs.writeFileSync(found.p, found.text.replace(from, to));
};

// Every literal in a case below is a count that the tree moves under it, and a
// self-test whose input has drifted throws instead of failing the thing it
// checks. `bump` locates the number by its surrounding words and derives the
// wrong value from the right one, so the case keeps meaning what it meant.
// `findDoc` matches a literal needle; these callers search by PATTERN, because
// the number in the sentence is exactly what moves. The directory scan is not a
// fallback but the load-bearing half: the names passed in are lowercase and the
// files on disk are not, so `docText` finds them on a case-insensitive
// filesystem and returns null on Linux.
const findDocByPattern = (dir, file, re) => {
	const direct = docText(dir, file);
	if (direct && re.test(direct.text)) return direct;
	for (const f of fs.readdirSync(dir)) {
		if (!f.endsWith('.md')) continue;
		const q = path.join(dir, f);
		const text = fs.readFileSync(q, 'utf8');
		if (re.test(text)) return { p: q, text };
	}
	return null;
};

const bump = (dir, file, re, wrong, replace) => {
	const found = findDocByPattern(dir, file, re);
	if (!found) throw new Error(`self-test is stale: no doc holds ${re} (looked for ${file} first)`);
	const m = found.text.match(re);
	const real = Number(m[1].replace(/,/g, ''));
	fs.writeFileSync(found.p, found.text.replace(m[0], replace(m[0], m[1], wrong)));
	return { real, wrong };
};

// Put a line-anchored sentence into a doc immediately before `at`. For a
// spelling the tree no longer carries, the case has to supply its own carrier —
// a rule with no live input is shown to fire or it is not shown at all.
const inject = (dir, file, at, line) => {
	const found = findDocByPattern(dir, file, at);
	if (!found) throw new Error(`self-test is stale: no doc holds ${at} (looked for ${file} first)`);
	const m = found.text.match(at);
	fs.writeFileSync(found.p, found.text.replace(m[0], `${line}\n\n${m[0]}`));
	return { line };
};

// The control. Without it, every mutation below "passing" would also be
// explained by the harness failing on any input at all.
withCorpus(
	() => {},
	(r) => check('unmutated corpus copy passes', r.code, 0),
);

// The upstream_issues link check. An attribution that names a file nobody wrote
// reads exactly like one that does, and two such links were live when the check
// was added — so the check is only worth having if it is shown to fire.
withCorpus(
	(d) => edit(
		d,
		'known-failures.md',
		'upstream_issues/svelte-server-treats-a-dollar-parameter-as-a-store.md',
		'upstream_issues/this-file-was-never-written.md',
	),
	(r) => check(
		'an attribution to a nonexistent upstream_issues file fails',
		[r.code, /this-file-was-never-written\.md, which does not exist/.test(r.out)],
		[1, true],
	),
);

// Derived, not a literal: the expected sum is the ratchet's own size less the
// one this mutation removes, so the assertion survives the ratchet moving.
{
	const fmtEntries = JSON.parse(fs.readFileSync(path.join(CORPUS, 'fmt-known-failures.json'), 'utf8')).length;
	// The needle is read out of the doc rather than written here: a literal one
	// encodes today's partition, so the next re-baseline breaks this self-test
	// instead of the thing it tests.
	const fmtFirst = Number(
		/by cluster: `(\d+) \+/.exec(findDoc(CORPUS, 'fmt-known-failures.md', 'by cluster: `')?.text ?? '')?.[1],
	);
	if (!Number.isFinite(fmtFirst)) throw new Error('self-test is stale: no fmt `by cluster:` partition found');
	withCorpus(
		(d) => edit(d, 'fmt-known-failures.md', `by cluster: \`${fmtFirst} +`, `by cluster: \`${fmtFirst - 1} +`),
		(r) => check(
			'a stale cluster count fails',
			[r.code, new RegExp(`sums to ${fmtEntries - 1} \\(`).test(r.out)],
			[1, true],
		),
	);
}

// The lint ratchet is currently empty, so use an impossible extra count to keep
// proving that a stated partition sum is checked against the JSON population.
withCorpus(
	(d) => edit(d, 'lint-known-failures.md', 'by direction: `0`', 'by direction: `1`'),
	(r) => check('an extra partition count fails', [r.code, /sums to 1 \(/.test(r.out)], [1, true]),
);

withCorpus(
	(d) => edit(d, 'lint-known-failures.md', 'Partition of `lint-known-failures.json` by repo: `0`\n', ''),
	(r) => check('a deleted partition line fails', [r.code, /found 0/.test(r.out)], [1, true]),
);

// A sub-population partition must be checked against that sub-population, not
// against the whole ratchet. The family is currently empty, so an invented
// count must be compared with its zero-entry prefix population.
withCorpus(
	(d) =>
		edit(
			d,
			'matrix-known-failures.md',
			'by seed: `0`',
			'by seed: `2`',
		),
	(r) => check('a sub-population partition is bound to its prefix', [r.code, /has 0 entries/.test(r.out)], [1, true]),
);

withCorpus(
	(d) =>
		edit(
			d,
			'matrix-known-failures.md',
			MATRIX_FAMILY_PARTITION,
			MATRIX_FAMILY_PARTITION?.replace('by family', 'by nothing in particular'),
		),
	(r) => check('an undeclared partition fails', [r.code, /not declared in PARTITIONS/.test(r.out)], [1, true]),
);

// The restatement half: a second, stale copy of a count the header states correctly.
withCorpus(
	(d) =>
		edit(
			d,
			'warning-known-failures.md',
			'`warning-position-known-failures.<target>.json` 0 entries on all four',
			'`warning-position-known-failures.<target>.json` 5 entries on all four',
		),
	(r) => check('a stale restatement fails', [r.code, /states 5 entries/.test(r.out)], [1, true]),
);

// The two spellings (c) added. Both were unchecked while (a) and (b) were green,
// and both had gone stale by an order of magnitude — `The other 21` and `All 13`
// against a 4-entry ratchet. The negative control is the scoping: an `All N` line
// counting something other than ratchet entries sits under a partition of 0 in
// `matrix-known-failures.md`, and 22 of the 24 reports the unscoped rule produced
// were that one doc.
// This one INJECTS its carrier instead of mutating a live sentence, because the
// spelling has no live carrier left: #4165 retired the entries the two `The
// other N` lines described and the prose that replaced them states no residue.
// The two survivors in the tree are mid-line, which the rule's `^` does not
// match, so mutating either would have measured nothing.
// Rule (c) opens with `if (partition.sum === 0) continue`, so both cases need a
// section whose partition is non-zero — a property of the SECTION, not of the
// sentence, which is why no wording survives its section reaching 0. The anchor
// is therefore the end of `Server`, whose entries are a pinned deliberate
// divergence the burndown cannot retire, rather than a burndown target. The
// injected sentence exists only in the throwaway corpus copy, so it asserts
// nothing about the tree.
const ANCHOR = /^### Server dev \(.*$/m;

withCorpus(
	(d) => {
		inject(d, 'known-failures.md', ANCHOR, 'The other 999 arrived with the wave-2 enrolment.');
	},
	(r) =>
		check(
			'a stale `The other N` fails',
			[r.code, /"The other 999".*leaving (\d+)/s.test(r.out), /"The other 999".*leaving 999/s.test(r.out)],
			[1, true, false],
		),
);

// The `All N` case injects too, for the same reason. It used to bump the live
// `All remaining N arrived` sentence, which also confirmed the tree carried one;
// that observation ends here. The loss is forced rather than chosen — the
// sentence is deleted when client-dev reaches 0 either way, so the choice was
// between an injected carrier and no coverage of the rule at all.
withCorpus(
	(d) => {
		inject(d, 'known-failures.md', ANCHOR, 'All 999 arrived with the wave-2 enrolment.');
	},
	(r) =>
		check(
			'a stale `All N` fails',
			[r.code, /"All 999".*partition sums to (\d+)/s.test(r.out), /"All 999".*partition sums to 999/s.test(r.out)],
			[1, true, false],
		),
);

withCorpus(
	(d) => {
		bump(d, 'matrix-known-failures.md', /All ([\d,]+) generated comparisons/, 999, () => 'All 999 generated comparisons');
	},
	(r) => check('`All N` under an empty partition is not an entry count', [r.code], [0]),
);

if (failed) {
	console.error(`\n${failed} failure(s)`);
	process.exit(1);
}
console.log('\nall known-failures-md-check cases pass');
