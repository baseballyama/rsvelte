#!/usr/bin/env node
/**
 * Guards the ratchet-rewrite contract of scripts/compat-corpus/verify.mjs.
 *
 * `--update-baseline`, `--update-warning-baseline`, `--update-error-baseline` and
 * `--update-parse-baseline` rewrite four disjoint ratchet families. The first
 * two used to disable each other: passing both wrote NOTHING and exited 0, so an
 * operator re-baselining an enrolment PR saw a green run and committed the
 * pre-run ratchets. That is the same failure class the corpus pipeline exists to
 * prevent — a gate reporting success without doing the work.
 *
 * The contract asserted here:
 *   - --no-fmt bars the output family and only the output family
 *   - the diagnostic flags compose; all three together rewrite all three
 *     diagnostic families
 *   - each alone still rewrites only its own family
 *   - a deselected target's ratchets are never touched
 *   - --from-report cannot rewrite the diagnostic families (output only)
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
import { linkDependencies } from './corpus-sandbox.mjs';
import { MIN_FULL_CORPUS_ENTRIES } from '../compat-corpus/artifacts.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS_SCRIPTS = path.join(ROOT, 'scripts/compat-corpus');

// Derived, never a literal: the floor is a measurement of the corpus and moves
// when it grows, and a hardcoded size silently drops below it.
const ENTRIES = MIN_FULL_CORPUS_ENTRIES + 500;
const SENTINEL = ['sentinel-entry'];

const OUTPUT_RATCHETS = ['known-failures.client.json', 'known-failures.server.json', 'known-failures.client-dev.json', 'known-failures.server-dev.json'];
const WARNING_RATCHETS = [
	'warning-known-failures.client.json',
	'warning-known-failures.server.json',
	'warning-known-failures.client-dev.json',
	'warning-known-failures.server-dev.json',
	'warning-position-known-failures.client.json',
	'warning-position-known-failures.server.json',
	'warning-position-known-failures.client-dev.json',
	'warning-position-known-failures.server-dev.json',
];
const ERROR_RATCHETS = [
	'error-message-known-failures.client.json',
	'error-message-known-failures.server.json',
	'error-message-known-failures.client-dev.json',
	'error-message-known-failures.server-dev.json',
	'error-position-known-failures.client.json',
	'error-position-known-failures.server.json',
	'error-position-known-failures.client-dev.json',
	'error-position-known-failures.server-dev.json',
	'error-end-known-failures.client.json',
	'error-end-known-failures.server.json',
	'error-end-known-failures.client-dev.json',
	'error-end-known-failures.server-dev.json',
	'error-frame-known-failures.client.json',
	'error-frame-known-failures.server.json',
	'error-frame-known-failures.client-dev.json',
	'error-frame-known-failures.server-dev.json',
];
const PARSE_RATCHETS = [
	'parse-known-failures.client.json',
	'parse-known-failures.server.json',
	'parse-known-failures.client-dev.json',
	'parse-known-failures.server-dev.json',
];
const DIAGNOSTIC_RATCHETS = [...WARNING_RATCHETS, ...ERROR_RATCHETS, ...PARSE_RATCHETS];

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
	linkDependencies(sandbox);
	// `--update-baseline` now also refuses when a declared corpus source
	// contributed no manifest entry, so the sandbox has to declare the sources
	// its manifest covers. One is enough; the coverage case gets its own arm.
	fs.writeFileSync(
		path.join(sandbox, 'scripts/compat-corpus/corpus-sources.json'),
		JSON.stringify([{ path: 'submodules/sandbox', id: 'sandbox' }])
	);
	const manifest = [];
	for (let i = 0; i < ENTRIES; i++) {
		const id = `sandbox/e${i}`;
		manifest.push({ id, source: `${id}.svelte` });
		for (const tree of ['expected', 'actual']) {
			const dir = path.join(CORPUS, tree, id);
			fs.mkdirSync(dir, { recursive: true });
			fs.writeFileSync(path.join(dir, 'warnings.json'), '{}\n');
			// One entry both sides reject with the same code and different detail,
			// so the error family has a non-empty population to rewrite from. With
			// none, verify refuses the rewrite and this file would be testing the
			// refusal instead of the composition it exists to test.
			if (i === 0) {
				const side = tree === 'expected' ? 1 : 2;
				fs.writeFileSync(
					path.join(dir, 'error.json'),
					JSON.stringify({
						client: {
							code: 'attribute_duplicate',
							message: `Attributes need to be unique (${side})`,
							line: side,
							column: side,
							endLine: side,
							endColumn: side,
							frame: `${side}: <div>`,
						},
					}) + '\n',
				);
				continue;
			}
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

// Compared by content, not by length: a rewrite that happens to produce as many
// entries as the sentinel would otherwise read as "untouched".
const isSentinel = (f) => {
	const p = path.join(CORPUS, f);
	return (
		fs.existsSync(p) &&
		JSON.stringify(JSON.parse(fs.readFileSync(p, 'utf8'))) === JSON.stringify(SENTINEL)
	);
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
// is a legal way to write the *diagnostic* families and a refused way to write
// the *output* one, so the output family is exercised through its refusal here
// and its write path is left to the real corpus job. Asserting the refusal is
// not a weaker test of the split: a rewrite that leaked across families would
// fail these just as loudly.
console.log('\n--no-fmt bars the output family, and only that family');
{
	const r = run('--update-baseline', '--update-warning-baseline', '--update-error-baseline', '--update-parse-baseline');
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check('names --no-fmt as the reason', /--no-fmt/.test(r.stderr), r.stderr.slice(0, 400));
	check(
		'no ratchet rewritten',
		untouched([...OUTPUT_RATCHETS, ...DIAGNOSTIC_RATCHETS]).length ===
			OUTPUT_RATCHETS.length + DIAGNOSTIC_RATCHETS.length,
		rewritten([...OUTPUT_RATCHETS, ...DIAGNOSTIC_RATCHETS]).join(', '),
	);
}

console.log('\nthe diagnostic flags compose; all three together rewrite all three families');
{
	const r = run('--update-warning-baseline', '--update-error-baseline', '--update-parse-baseline');
	check('exit 0', r.status === 0, `status ${r.status}\n${r.stderr}`);
	check('client warning ratchet rewritten', !isSentinel('warning-known-failures.client.json'));
	check('client warning-position ratchet rewritten', !isSentinel('warning-position-known-failures.client.json'));
	check('client error-message ratchet rewritten', !isSentinel('error-message-known-failures.client.json'));
	check('client error-position ratchet rewritten', !isSentinel('error-position-known-failures.client.json'));
	check('client parse ratchet rewritten', !isSentinel('parse-known-failures.client.json'));
	check('announces all three families', /rewriting warning \+ error \+ parse ratchets/.test(r.stdout), r.stdout.slice(0, 400));
	check('all output ratchets untouched', untouched(OUTPUT_RATCHETS).length === OUTPUT_RATCHETS.length, rewritten(OUTPUT_RATCHETS).join(', '));
}

console.log('\n--update-baseline alone leaves the diagnostic families alone');
{
	const r = run('--update-baseline');
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check('all warning ratchets untouched', untouched(WARNING_RATCHETS).length === WARNING_RATCHETS.length, rewritten(WARNING_RATCHETS).join(', '));
	check('all error ratchets untouched', untouched(ERROR_RATCHETS).length === ERROR_RATCHETS.length, rewritten(ERROR_RATCHETS).join(', '));
	check('all parse ratchets untouched', untouched(PARSE_RATCHETS).length === PARSE_RATCHETS.length, rewritten(PARSE_RATCHETS).join(', '));
}

console.log('\n--update-warning-baseline alone leaves the other families alone');
{
	const r = run('--update-warning-baseline');
	check('exit 0', r.status === 0, `status ${r.status}\n${r.stderr}`);
	check('client warning ratchet rewritten', !isSentinel('warning-known-failures.client.json'));
	check('client warning-position ratchet rewritten', !isSentinel('warning-position-known-failures.client.json'));
	check('announces the family', /rewriting warning ratchets/.test(r.stdout), r.stdout.slice(0, 400));
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
	const r = run('--update-warning-baseline', '--update-error-baseline');
	check('exit 0', r.status === 0, `status ${r.status}`);
	const others = [...OUTPUT_RATCHETS, ...DIAGNOSTIC_RATCHETS].filter((f) => !f.includes('.client.'));
	check('server / client-dev ratchets untouched', untouched(others).length === others.length, rewritten(others).join(', '));
}

console.log('\n--from-report refuses the diagnostic flags instead of ignoring them');
for (const flag of ['--update-warning-baseline', '--update-error-baseline', '--update-parse-baseline']) {
	const report = path.join(sandbox, 'report.json');
	fs.writeFileSync(report, JSON.stringify({ total: ENTRIES, failures: [] }));
	const r = run('--from-report', report, flag);
	check(`exit 2 for ${flag}`, r.status === 2, `status ${r.status}`);
	check(`diagnostic ratchets untouched for ${flag}`, untouched(DIAGNOSTIC_RATCHETS).length === DIAGNOSTIC_RATCHETS.length);
}

// A floor on the number of entries cannot see WHICH repositories produced them,
// so a checkout missing 97 of 104 submodules clears it at five figures and the
// rewrite deletes every entry from the 97. The declared set is exact.
console.log('\na declared source that contributed no entry refuses the rewrite');
{
	const sourcesPath = path.join(sandbox, 'scripts/compat-corpus/corpus-sources.json');
	const declared = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
	fs.writeFileSync(
		sourcesPath,
		JSON.stringify([...declared, { path: 'submodules/never-collected', id: 'never-collected' }])
	);
	const r = run('--update-warning-baseline', '--update-error-baseline', '--update-parse-baseline');
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check(
		'names the absent source by path',
		/submodules\/never-collected/.test(r.stderr),
		r.stderr.slice(0, 400)
	);
	check(
		'no ratchet rewritten',
		untouched(DIAGNOSTIC_RATCHETS).length === DIAGNOSTIC_RATCHETS.length,
		rewritten(DIAGNOSTIC_RATCHETS).join(', ')
	);
	// ... and the same run passes once the declared set matches again, so the
	// refusal is the coverage axis and not some other state this arm left behind.
	fs.writeFileSync(sourcesPath, JSON.stringify(declared));
	const after = run('--update-warning-baseline', '--update-error-baseline', '--update-parse-baseline');
	check('exit 0 once the set matches again', after.status === 0, `status ${after.status}\n${after.stderr}`);
}

fs.rmSync(sandbox, { recursive: true, force: true });

if (failed) {
	console.error(`\n[verify-flags] ❌ ${failed} assertion(s) failed`);
	process.exit(1);
}
console.log('\n[verify-flags] ✅ all assertions passed');
