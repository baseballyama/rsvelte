#!/usr/bin/env node
/**
 * Guards the ratchet-rewrite contract of scripts/compat-corpus/verify.mjs.
 *
 * `--update-baseline`, `--update-warning-baseline` and `--update-error-baseline`
 * rewrite three disjoint ratchet families. The first two used to disable each
 * other: passing both wrote NOTHING and exited 0, so an operator re-baselining
 * an enrolment PR saw a green run and committed the pre-run ratchets. That is
 * the same failure class the corpus pipeline exists to prevent — a gate
 * reporting success without doing the work.
 *
 * The contract asserted here:
 *   - the flags compose; all three together rewrite all three families
 *   - each alone still rewrites only its own family
 *   - a deselected target's ratchets are never touched
 *   - --from-report cannot rewrite the warning/error families (output only)
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
const ERROR_RATCHETS = [
	'error-message-known-failures.client.json',
	'error-message-known-failures.server.json',
	'error-message-known-failures.client-dev.json',
	'error-position-known-failures.client.json',
	'error-position-known-failures.server.json',
	'error-position-known-failures.client-dev.json',
];
const DIAGNOSTIC_RATCHETS = [...WARNING_RATCHETS, ...ERROR_RATCHETS];

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
	for (const f of ['verify.mjs', 'normalize.mjs', 'targets.mjs', 'artifacts.mjs']) {
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
	for (const f of [...OUTPUT_RATCHETS, ...DIAGNOSTIC_RATCHETS]) {
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

console.log('\nall three flags together rewrite all three families');
{
	const r = run('--update-baseline', '--update-warning-baseline', '--update-error-baseline');
	check('exit 0', r.status === 0, `status ${r.status}\n${r.stderr}`);
	check('client output ratchet rewritten', !isSentinel('known-failures.client.json'));
	check('client warning ratchet rewritten', !isSentinel('warning-known-failures.client.json'));
	check('client warning-position ratchet rewritten', !isSentinel('warning-position-known-failures.client.json'));
	check('client error-message ratchet rewritten', !isSentinel('error-message-known-failures.client.json'));
	check('client error-position ratchet rewritten', !isSentinel('error-position-known-failures.client.json'));
	check('announces all three families', /rewriting output \+ warning \+ error ratchets/.test(r.stdout), r.stdout.slice(0, 400));
}

console.log('\n--update-baseline alone leaves the diagnostic families alone');
{
	const r = run('--update-baseline');
	check('exit 0', r.status === 0, `status ${r.status}\n${r.stderr}`);
	check('client output ratchet rewritten', !isSentinel('known-failures.client.json'));
	check('all warning ratchets untouched', untouched(WARNING_RATCHETS).length === WARNING_RATCHETS.length, rewritten(WARNING_RATCHETS).join(', '));
	check('all error ratchets untouched', untouched(ERROR_RATCHETS).length === ERROR_RATCHETS.length, rewritten(ERROR_RATCHETS).join(', '));
}

console.log('\n--update-warning-baseline alone leaves the other families alone');
{
	const r = run('--update-warning-baseline');
	check('exit 0', r.status === 0, `status ${r.status}\n${r.stderr}`);
	check('client warning ratchet rewritten', !isSentinel('warning-known-failures.client.json'));
	check('all output ratchets untouched', untouched(OUTPUT_RATCHETS).length === OUTPUT_RATCHETS.length, rewritten(OUTPUT_RATCHETS).join(', '));
	check('all error ratchets untouched', untouched(ERROR_RATCHETS).length === ERROR_RATCHETS.length, rewritten(ERROR_RATCHETS).join(', '));
}

console.log('\n--update-error-baseline alone leaves the other families alone');
{
	const r = run('--update-error-baseline');
	check('exit 0', r.status === 0, `status ${r.status}\n${r.stderr}`);
	check('client error-message ratchet rewritten', !isSentinel('error-message-known-failures.client.json'));
	check('client error-position ratchet rewritten', !isSentinel('error-position-known-failures.client.json'));
	check('all output ratchets untouched', untouched(OUTPUT_RATCHETS).length === OUTPUT_RATCHETS.length, rewritten(OUTPUT_RATCHETS).join(', '));
	check('all warning ratchets untouched', untouched(WARNING_RATCHETS).length === WARNING_RATCHETS.length, rewritten(WARNING_RATCHETS).join(', '));
}

console.log('\ndeselected targets are never rewritten');
{
	const r = run('--update-baseline', '--update-warning-baseline', '--update-error-baseline');
	check('exit 0', r.status === 0, `status ${r.status}`);
	const others = [...OUTPUT_RATCHETS, ...DIAGNOSTIC_RATCHETS].filter((f) => !f.includes('.client.'));
	check('server / client-dev ratchets untouched', untouched(others).length === others.length, rewritten(others).join(', '));
}

console.log('\n--from-report refuses the diagnostic flags instead of ignoring them');
for (const flag of ['--update-warning-baseline', '--update-error-baseline']) {
	const report = path.join(sandbox, 'report.json');
	fs.writeFileSync(report, JSON.stringify({ total: ENTRIES, failures: [] }));
	const r = run('--from-report', report, flag);
	check(`exit 2 for ${flag}`, r.status === 2, `status ${r.status}`);
	check(`diagnostic ratchets untouched for ${flag}`, untouched(DIAGNOSTIC_RATCHETS).length === DIAGNOSTIC_RATCHETS.length);
}

fs.rmSync(sandbox, { recursive: true, force: true });

if (failed) {
	console.error(`\n[verify-flags] ❌ ${failed} assertion(s) failed`);
	process.exit(1);
}
console.log('\n[verify-flags] ✅ all assertions passed');
