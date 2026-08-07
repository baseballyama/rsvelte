#!/usr/bin/env node
/**
 * Pins the count parser in `known-failures-md-check.mjs`.
 *
 * The case that matters is not "does it find a count" — it is that a doc citing
 * a four-digit **issue number** and stating a **correct** count must come back
 * clean. The first version of this parser scanned for any `N entries`-ish digit
 * run and matched `### First catch: #1772` in `sourcemap-known-failures.md`,
 * which would have reported drift on every doc that cites a PR. No positive
 * control catches that: the parser was answering a slightly different question
 * correctly.
 *
 * Usage: node scripts/dev/test-known-failures-md-check.mjs
 */

import { statedCount } from '../compat-corpus/known-failures-md-check.mjs';

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
	const r = statedCount(doc, KEY);
	check('issue numbers do not become counts', { ok: r.ok, count: r.count }, { ok: true, count: 74 });
}

// 2. A doc that cites issue numbers and states NO count must fail, not silently
//    pick up an issue number. This is the same input minus the baseline line.
{
	const doc = ['# x', '', '### First catch: #1772', '', '| ratchet entries | 75 | **73** |'].join('\n');
	const r = statedCount(doc, KEY);
	check('no baseline line is a failure, not a 1772', r.ok, false);
}

// 3. The count must follow the filename, not merely share a line with it.
//    `1772 entries fixed by \`x.json\`` states nothing about x.json's size.
{
	const doc = 'Fixing 1772 entries touched `sourcemap-known-failures.json` along the way.';
	const r = statedCount(doc, KEY);
	check('a count before the filename does not count', r.ok, false);
}

// 4. Thousands separators, which the real docs use.
{
	const doc = 'Baseline: `sourcemap-known-failures.json`, 13,464 entries.';
	const r = statedCount(doc, KEY);
	check('thousands separators parse', { ok: r.ok, count: r.count }, { ok: true, count: 13464 });
}

// 5. Singular, so a one-entry ratchet is not unparseable.
{
	const doc = 'Baseline: `sourcemap-known-failures.json`, 1 entry.';
	const r = statedCount(doc, KEY);
	check('singular "entry" parses', { ok: r.ok, count: r.count }, { ok: true, count: 1 });
}

// 6. A different ratchet's line must not satisfy this one — otherwise two docs
//    could share a count and neither be checked.
{
	const doc = 'Baseline: `validator-known-failures.json`, 207 entries.';
	const r = statedCount(doc, KEY);
	check('another ratchet’s count is not borrowed', r.ok, false);
}

if (failed) {
	console.error(`\n${failed} failure(s)`);
	process.exit(1);
}
console.log('\nall count-parser cases pass');
