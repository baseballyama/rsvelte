#!/usr/bin/env node
// Positive and negative controls for `attribution-check.mjs`. A gate whose only
// observed outcome is the one it was written to produce has not been shown to
// discriminate: each case here differs from the passing tree by one edit.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHECK = path.join(HERE, 'attribution-check.mjs');

function run(files, upstream = ['upstream_issues/x.md'], args = []) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'attr-'));
	const dir = path.join(root, 'compatibility');
	fs.mkdirSync(dir);
	fs.mkdirSync(path.join(root, 'upstream_issues'));
	for (const u of upstream) fs.writeFileSync(path.join(root, u), '# report\n');
	for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), body);
	try {
		const out = execFileSync(process.execPath, [CHECK, ...args], {
			env: { ...process.env, ATTRIBUTION_DIR: dir, ATTRIBUTION_ROOT: root },
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		return { code: 0, out };
	} catch (e) {
		return { code: e.status, out: (e.stdout || '') + (e.stderr || '') };
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}

const PASSING = {
	'a-known-failures.json': JSON.stringify(['one', 'two', 'three']),
	'b-known-failures.json': JSON.stringify([]),
	'a-known-failures.md': [
		'# a',
		'',
		'Attribution of `a-known-failures.json`:',
		'',
		'| n | target | cluster |',
		'|---|---|---|',
		'| 2 | `upstream_issues/x.md` | upstream rejects it |',
		'| 1 | `deliberate-divergences` | we chose this |',
		'',
	].join('\n'),
};

let failures = 0;
const check = (name, cond, detail) => {
	if (cond) return;
	failures++;
	console.error(`FAIL ${name}\n${detail}`);
};

// Positive control: the gate can pass.
{
	const r = run(PASSING);
	check('a fully attributed tree passes', r.code === 0, r.out);
	check('an empty ratchet needs no block', !/b-known-failures/.test(r.out), r.out);
}
// One edit at a time, each of which must be caught.
{
	const f = { ...PASSING, 'a-known-failures.json': JSON.stringify(['one', 'two', 'three', 'four']) };
	const r = run(f);
	check('a partial table names the uncovered entries', r.code === 1 && /3 of 4 entries attributed, 1 carry no target/.test(r.out), r.out);
}
{
	const f = { ...PASSING };
	delete f['a-known-failures.md'];
	const r = run(f);
	check('a missing block fails', r.code === 1 && /no `Attribution of/.test(r.out), r.out);
}
{
	const f = { ...PASSING, 'a-known-failures.md': PASSING['a-known-failures.md'].replace('`upstream_issues/x.md`', 'because upstream is wrong') };
	const r = run(f);
	check('prose with no target fails', r.code === 1 && /names no target/.test(r.out), r.out);
}
{
	const f = { ...PASSING, 'a-known-failures.md': PASSING['a-known-failures.md'].replace('upstream_issues/x.md', 'upstream_issues/absent.md') };
	const r = run(f);
	check('a cited report that does not exist fails', r.code === 1 && /does not exist/.test(r.out), r.out);
}
{
	const f = { ...PASSING, 'b-known-failures.md': 'Attribution of `b-known-failures.json`:\n\n| n | target |\n|---|---|\n| 1 | `deliberate-divergences` |\n' };
	const r = run(f);
	check('an emptied ratchet must lose its block', r.code === 1 && /still carries an attribution block/.test(r.out), r.out);
}
{
	const f = { ...PASSING, 'c-known-failures.md': 'Attribution of `nope-known-failures.json`:\n\n| n | target |\n|---|---|\n| 1 | `deliberate-divergences` |\n' };
	const r = run(f);
	check('a block for a non-ratchet fails', r.code === 1 && /is not a ratchet/.test(r.out), r.out);
}

// `--gate-known` drops exactly one question. Each case below differs from its neighbour by
// one thing — the flag, or the pending list — so "it passed" cannot be satisfied by the
// flag disabling more than it claims.
const PENDING_TREE = (() => {
	const f = { ...PASSING, 'c-known-failures.json': JSON.stringify(['x', 'y']) };
	return f;
})();
{
	const r = run(PENDING_TREE);
	check('default mode fails on a ratchet with no block', r.code === 1 && /c-known-failures\.json has 2 listed/.test(r.out), r.out);
}
{
	const r = run(PENDING_TREE, undefined, ['--gate-known']);
	check('--gate-known without a pending list still fails', r.code === 1 && /c-known-failures\.json has 2 listed/.test(r.out), r.out);
}
{
	const f = { ...PENDING_TREE, 'attribution-pending.json': JSON.stringify(['c-known-failures.json']) };
	const r = run(f, undefined, ['--gate-known']);
	check('--gate-known exempts a pending ratchet from the missing-block question', r.code === 0, r.out);
	check('--gate-known says which ratchets it did not gate', /c-known-failures\.json/.test(r.out), r.out);
}
{
	const f = { ...PENDING_TREE, 'attribution-pending.json': JSON.stringify(['c-known-failures.json']) };
	const r = run(f);
	check('the pending list does not exempt anything in default mode', r.code === 1 && /c-known-failures\.json has 2 listed/.test(r.out), r.out);
}
{
	// The shape that shipped: a table whose `n` no longer sums to its JSON. `--gate-known`
	// must still catch it, or wiring the flag into CI buys nothing.
	const f = {
		...PASSING,
		'attribution-pending.json': JSON.stringify(['a-known-failures.json']),
		'a-known-failures.json': JSON.stringify(['one', 'two']),
	};
	const r = run(f, undefined, ['--gate-known']);
	check('--gate-known still catches a table that oversums its ratchet', r.code === 1 && /sums to 3, the ratchet holds only 2/.test(r.out), r.out);
}
{
	const f = { ...PASSING, 'attribution-pending.json': JSON.stringify(['a-known-failures.json']) };
	const r = run(f, undefined, ['--gate-known']);
	check('a COMPLETE table must leave the pending list', r.code === 1 && /still listed in attribution-pending\.json/.test(r.out), r.out);
}
{
	// The middle state: the first cluster of a large ratchet is filed while the rest is not.
	// Requiring completeness before any row could be written would make a partial table
	// worse than none, which is the opposite of what the pending list is for.
	const f = {
		...PASSING,
		'a-known-failures.json': JSON.stringify(['one', 'two', 'three', 'four', 'five']),
		'attribution-pending.json': JSON.stringify(['a-known-failures.json']),
	};
	const r = run(f, undefined, ['--gate-known']);
	check('--gate-known accepts a PARTIAL table on a pending ratchet', r.code === 0, r.out);
	const d = run(f);
	check('the default mode still names the uncovered entries', d.code === 1 && /3 of 5 entries attributed, 2 carry no target/.test(d.out), d.out);
}
{
	const f = { ...PASSING, 'attribution-pending.json': JSON.stringify(['b-known-failures.json']) };
	const r = run(f, undefined, ['--gate-known']);
	check('an emptied ratchet must leave the pending list', r.code === 1 && /which is empty — remove it/.test(r.out), r.out);
}
{
	const f = { ...PASSING, 'attribution-pending.json': JSON.stringify(['nope-known-failures.json']) };
	const r = run(f, undefined, ['--gate-known']);
	check('a pending entry that is not a ratchet fails', r.code === 1 && /is not a ratchet/.test(r.out), r.out);
}

if (failures) {
	console.error(`\n[test-attribution-check] ${failures} control(s) did not behave as specified.`);
	process.exit(1);
}
console.log('[test-attribution-check] 19 controls pass (3 positive, 15 negative, 1 empty-ratchet).');
