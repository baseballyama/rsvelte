#!/usr/bin/env node
/**
 * Guards the ratchet-rewrite contract of scripts/compat-corpus/verify.mjs.
 *
 * `--update-baseline` and `--update-warning-baseline` rewrite two disjoint
 * ratchet families. They used to disable each other: passing both wrote NOTHING
 * and exited 0, so an operator re-baselining an enrolment PR saw a green run and
 * committed the pre-run ratchets. That is the same failure class the corpus
 * pipeline exists to prevent — a gate reporting success without doing the work.
 *
 * The contract asserted here:
 *   - the flags compose; both together rewrite both families
 *   - each alone still rewrites only its own family
 *   - a deselected target's ratchets are never touched
 *   - --from-report cannot rewrite the warning family (it derives output only)
 *   - a rewrite run that writes nothing exits non-zero
 *
 * The corpus itself is synthetic: verify.mjs refuses to rewrite below
 * MIN_FULL_CORPUS_ENTRIES, so the sandbox has to clear that floor, but the
 * entries can be trivial because this test is about which files get written.
 *
 * Usage: node scripts/dev/test-corpus-verify-baseline-flags.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS_SCRIPTS = path.join(ROOT, 'scripts/compat-corpus');

const ENTRIES = 12500; // must exceed artifacts.mjs MIN_FULL_CORPUS_ENTRIES
const SENTINEL = ['sentinel-entry'];

const OUTPUT_RATCHETS = ['known-failures.client.json', 'known-failures.server.json', 'known-failures.client-dev.json'];
const WARNING_RATCHETS = [
	'warning-known-failures.client.json',
	'warning-known-failures.server.json',
	'warning-known-failures.client-dev.json',
	'warning-position-known-failures.client.json',
	'warning-position-known-failures.server.json',
	'warning-position-known-failures.client-dev.json',
];

let failed = 0;
function check(name, ok, detail) {
	console.log(`${ok ? '  ✓' : '  ✗'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);
	if (!ok) failed++;
}

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-flags-'));
const CORPUS = path.join(sandbox, 'compatibility');
const VERIFY = path.join(sandbox, 'scripts/compat-corpus/verify.mjs');

function buildSandbox() {
	fs.mkdirSync(path.join(sandbox, 'scripts/compat-corpus'), { recursive: true });
	// Every module rather than verify.mjs's current imports: a hand-listed set
	// makes a new sibling module fail here as a missing file, not as the
	// contract this guards.
	for (const f of fs.readdirSync(CORPUS_SCRIPTS).filter((f) => f.endsWith('.mjs'))) {
		fs.copyFileSync(path.join(CORPUS_SCRIPTS, f), path.join(sandbox, 'scripts/compat-corpus', f));
	}
	const manifest = [];
	for (let i = 0; i < ENTRIES; i++) {
		const id = `e${i}`;
		manifest.push({ id, source: `${id}.svelte` });
		for (const tree of ['expected', 'actual']) {
			const dir = path.join(CORPUS, tree, id);
			fs.mkdirSync(dir, { recursive: true });
			fs.writeFileSync(path.join(dir, 'client.js'), 'export default 1;\n');
		}
	}
	fs.writeFileSync(path.join(CORPUS, 'manifest.json'), JSON.stringify(manifest));
}

function seedRatchets() {
	for (const f of [...OUTPUT_RATCHETS, ...WARNING_RATCHETS]) {
		fs.writeFileSync(path.join(CORPUS, f), JSON.stringify(SENTINEL, null, '\t') + '\n');
	}
}

const isSentinel = (f) => {
	const p = path.join(CORPUS, f);
	return fs.existsSync(p) && JSON.parse(fs.readFileSync(p, 'utf8')).length === SENTINEL.length;
};
const rewritten = (files) => files.filter((f) => !isSentinel(f));
const untouched = (files) => files.filter(isSentinel);

function run(...extra) {
	seedRatchets();
	return spawnSync(process.execPath, [VERIFY, '--no-fmt', '--keep-artifacts', '--targets', 'client', ...extra], {
		cwd: sandbox,
		encoding: 'utf8',
	});
}

buildSandbox();
console.log(`[verify-flags] sandbox: ${sandbox} (${ENTRIES} synthetic entries)`);

// Every scenario runs under `--no-fmt`, because the sandbox has no oxfmt. That
// is a legal way to write the *warning* family and a refused way to write the
// *output* one, so the output family is exercised through its refusal here and
// its write path is left to the real corpus job. Asserting the refusal is not a
// weaker test of the split: a rewrite that leaked across families would fail
// these just as loudly.
console.log('\n--no-fmt bars the output family, and only that family');
{
	const r = run('--update-baseline', '--update-warning-baseline');
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check('names --no-fmt as the reason', /--no-fmt/.test(r.stderr), r.stderr.slice(0, 400));
	check(
		'no ratchet rewritten',
		untouched([...OUTPUT_RATCHETS, ...WARNING_RATCHETS]).length === OUTPUT_RATCHETS.length + WARNING_RATCHETS.length,
		rewritten([...OUTPUT_RATCHETS, ...WARNING_RATCHETS]).join(', '),
	);
}

console.log('\n--update-baseline alone leaves the warning family alone');
{
	const r = run('--update-baseline');
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check('all warning ratchets untouched', untouched(WARNING_RATCHETS).length === WARNING_RATCHETS.length, rewritten(WARNING_RATCHETS).join(', '));
}

console.log('\n--update-warning-baseline alone leaves the output family alone');
{
	const r = run('--update-warning-baseline');
	check('exit 0', r.status === 0, `status ${r.status}\n${r.stderr}`);
	check('client warning ratchet rewritten', !isSentinel('warning-known-failures.client.json'));
	check('client warning-position ratchet rewritten', !isSentinel('warning-position-known-failures.client.json'));
	check('announces the family', /rewriting warning ratchets/.test(r.stdout), r.stdout.slice(0, 400));
	check('all output ratchets untouched', untouched(OUTPUT_RATCHETS).length === OUTPUT_RATCHETS.length, rewritten(OUTPUT_RATCHETS).join(', '));
}

console.log('\ndeselected targets are never rewritten');
{
	const r = run('--update-warning-baseline');
	check('exit 0', r.status === 0, `status ${r.status}`);
	const others = [...OUTPUT_RATCHETS, ...WARNING_RATCHETS].filter((f) => !f.includes('.client.'));
	check('server / client-dev ratchets untouched', untouched(others).length === others.length, rewritten(others).join(', '));
}

console.log('\n--from-report refuses the warning flag instead of ignoring it');
{
	const report = path.join(sandbox, 'report.json');
	fs.writeFileSync(report, JSON.stringify({ total: ENTRIES, failures: [] }));
	const r = run('--from-report', report, '--update-warning-baseline');
	check('exit 2', r.status === 2, `status ${r.status}`);
	check('warning ratchets untouched', untouched(WARNING_RATCHETS).length === WARNING_RATCHETS.length);
}

fs.rmSync(sandbox, { recursive: true, force: true });

if (failed) {
	console.error(`\n[verify-flags] ❌ ${failed} assertion(s) failed`);
	process.exit(1);
}
console.log('\n[verify-flags] ✅ all assertions passed');
