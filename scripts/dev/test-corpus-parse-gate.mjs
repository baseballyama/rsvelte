#!/usr/bin/env node
/**
 * Guards the output-parseability gate in scripts/compat-corpus/verify.mjs.
 *
 * The gate answers "is what rsvelte emitted even JavaScript?". Every other
 * comparison in verify.mjs is rsvelte's text against official's text, so *wrong
 * text* and *text no parser accepts* produce the same row — which is why this
 * gate needs its own ratchet and its own assertions.
 *
 * Each case below is chosen so that a wrong-but-plausible implementation fails
 * it:
 *
 *   - "catches unparseable output"        the gate is wired at all
 *   - "the OUTPUT ratchet does not suppress it"
 *                                          an implementation that folded this
 *                                          into `known-failures.<target>.json`
 *                                          (where 30 real defects would have
 *                                          landed) passes every other case and
 *                                          fails this one
 *   - "catches it where official REJECTED the input"
 *                                          an implementation that only parses
 *                                          entries with something to diff — the
 *                                          natural place to put it, next to the
 *                                          byte comparison — passes every other
 *                                          case and fails this one
 *   - "an unparseable OFFICIAL output is a harness failure, not a ratchet entry"
 *                                          the oracle's own positive control
 *   - "a listed entry that now parses fails"   the ratchet is two-sided
 *   - "a collapsed population fails"       the gate cannot go green by rsvelte
 *                                          refusing to compile (gate-coverage
 *                                          § 15a)
 *
 * The corpus is synthetic: verify.mjs refuses to rewrite ratchets below
 * MIN_FULL_CORPUS_ENTRIES, so the sandbox clears that floor, but the entries can
 * be trivial because this test is about which text gets parsed and where the
 * verdict lands.
 *
 * Usage: node scripts/dev/test-corpus-parse-gate.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { linkDependencies } from './corpus-sandbox.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS_SCRIPTS = path.join(ROOT, 'scripts/compat-corpus');

const ENTRIES = 12500; // must exceed artifacts.mjs MIN_FULL_CORPUS_ENTRIES
const GOOD = 'export default 1;\n';
// Rejected by acorn for the same reason 24 of the 30 real cases were: an
// argument list that never closes.
const BAD = 'export default foo(bar\n';

const PARSE_RATCHETS = [
	'parse-known-failures.client.json',
	'parse-known-failures.server.json',
	'parse-known-failures.client-dev.json',
];
const ORACLE_EXCLUDED = 'parse-oracle-excluded.json';
const OTHER_RATCHETS = [
	'known-failures.client.json',
	'warning-known-failures.client.json',
	'warning-position-known-failures.client.json',
	'error-message-known-failures.client.json',
	'error-position-known-failures.client.json',
];

let failed = 0;
function check(name, ok, detail) {
	console.log(`${ok ? '  ✓' : '  ✗'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);
	if (!ok) failed++;
}

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'parse-gate-'));
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
	// The byte comparison defers every differing pair to the Rust comparator,
	// which is not what this test is about (and would need a cargo build). Stub
	// it to "different" so the output verdict lands on `js-mismatch`, which the
	// cases below tolerate via the OUTPUT ratchet — leaving the parse gate as the
	// only thing that can change an outcome.
	const bin = path.join(sandbox, 'target/release');
	fs.mkdirSync(bin, { recursive: true });
	const stub = path.join(bin, 'ast_equiv_batch');
	fs.writeFileSync(
		stub,
		'#!/usr/bin/env node\n' +
			"const s=require('fs').readFileSync(0,'utf8');\n" +
			"process.stdout.write(JSON.stringify(JSON.parse(s).map((p)=>({id:p.id,verdict:'different'}))));\n",
	);
	fs.chmodSync(stub, 0o755);
	const manifest = [];
	for (let i = 0; i < ENTRIES; i++) {
		const id = `e${i}`;
		manifest.push({ id, source: `${id}.svelte` });
		for (const tree of ['expected', 'actual']) {
			const dir = path.join(CORPUS, tree, id);
			fs.mkdirSync(dir, { recursive: true });
			fs.writeFileSync(path.join(dir, 'client.js'), GOOD);
		}
	}
	fs.writeFileSync(path.join(CORPUS, 'manifest.json'), JSON.stringify(manifest));
}

/** Overwrite one entry's files, returning a restore closure. */
function stage(id, { expected, actual }) {
	const paths = {
		expected: path.join(CORPUS, 'expected', id, 'client.js'),
		actual: path.join(CORPUS, 'actual', id, 'client.js'),
		error: path.join(CORPUS, 'expected', id, 'error.json'),
	};
	if (expected === null) fs.rmSync(paths.expected, { force: true });
	else if (expected !== undefined) fs.writeFileSync(paths.expected, expected);
	if (actual === null) fs.rmSync(paths.actual, { force: true });
	else if (actual !== undefined) fs.writeFileSync(paths.actual, actual);
	return () => {
		fs.writeFileSync(paths.expected, GOOD);
		fs.writeFileSync(paths.actual, GOOD);
		fs.rmSync(paths.error, { force: true });
	};
}

function seedRatchets(entries = {}) {
	for (const f of [...PARSE_RATCHETS, ...OTHER_RATCHETS, ORACLE_EXCLUDED]) {
		fs.writeFileSync(path.join(CORPUS, f), JSON.stringify(entries[f] ?? [], null, '\t') + '\n');
	}
}

function run(...extra) {
	return spawnSync(process.execPath, [VERIFY, '--no-fmt', '--keep-artifacts', '--targets', 'client', ...extra], {
		cwd: sandbox,
		encoding: 'utf8',
	});
}

buildSandbox();
console.log(`[parse-gate] sandbox: ${sandbox} (${ENTRIES} synthetic entries)`);

console.log('\nbaseline: an all-parseable corpus is green');
{
	seedRatchets();
	const r = run();
	check('exit 0', r.status === 0, `status ${r.status}\n${r.stdout.slice(-800)}${r.stderr}`);
	check('reports the parsed population', /parsed 12500\/12500 rsvelte\/official module/.test(r.stdout), r.stdout.slice(-400));
}

// Unparseable output is necessarily byte-different from official's, so every
// case below also produces a `js-mismatch`; listing the entry in the OUTPUT
// ratchet takes that off the table so the parse gate is the only thing left that
// can change the outcome.
console.log('\nthe OUTPUT ratchet does not suppress it (the whole reason for a separate ratchet)');
{
	const restore = stage('e7', { actual: BAD });
	seedRatchets({ 'known-failures.client.json': ['e7'] });
	const r = run();
	check('exit 1 despite e7 being a known output failure', r.status === 1, `status ${r.status}\n${r.stdout.slice(-800)}`);
	check('names the entry', /e7/.test(r.stdout), r.stdout.slice(-600));
	check('reported as an output-parseability failure', /NEW output-parseability failures/.test(r.stdout), r.stdout.slice(-600));
	restore();
}

console.log('\nlisting it in the PARSE ratchet is what suppresses it');
{
	const restore = stage('e7', { actual: BAD });
	seedRatchets({ 'known-failures.client.json': ['e7'], 'parse-known-failures.client.json': ['e7'] });
	const r = run();
	check('exit 0', r.status === 0, `status ${r.status}\n${r.stdout.slice(-800)}`);
	restore();
}

console.log('\ncaught where OFFICIAL rejected the input — a population with nothing to diff');
{
	// No expected/client.js: official errored, so the byte comparison and the
	// AST comparator never look at rsvelte's text for this entry.
	const restore = stage('e9', { expected: null, actual: BAD });
	fs.writeFileSync(
		path.join(CORPUS, 'expected', 'e9', 'error.json'),
		JSON.stringify({ client: { code: 'x', message: 'x', line: 1, column: 1 } }),
	);
	seedRatchets({ 'known-failures.client.json': ['e9'] });
	const r = run();
	check('exit 1', r.status === 1, `status ${r.status}\n${r.stdout.slice(-800)}`);
	check('names the entry', /e9/.test(r.stdout), r.stdout.slice(-600));
	restore();
}

console.log('\na listed entry that now parses fails — the ratchet is two-sided');
{
	seedRatchets({ 'parse-known-failures.client.json': ['e7'] });
	const r = run();
	check('exit 1', r.status === 1, `status ${r.status}`);
	check('reports the stale ratchet', /output-parseability baseline entries already PASS/.test(r.stdout), r.stdout.slice(-600));
}

console.log('\nan unlisted unparseable OFFICIAL output is a harness failure, never a ratchet entry');
{
	const restore = stage('e11', { expected: BAD });
	seedRatchets({ 'parse-known-failures.client.json': ['e11'] });
	const r = run();
	check('exit 2', r.status === 2, `status ${r.status}`);
	check(
		'reports it as an oracle rejection, not an rsvelte failure',
		/parse oracle rejected 1 OFFICIAL output/.test(r.stderr),
		r.stderr.slice(-800),
	);
	restore();
}

console.log('\nlisting the pair skips it on BOTH sides — the exclusion is not a way to ratchet rsvelte');
{
	// Official unparseable AND rsvelte unparseable, with only the oracle
	// exclusion seeded: the run is green because there is no reference, not
	// because rsvelte's output was checked and passed.
	const restore = stage('e11', { expected: BAD, actual: BAD });
	seedRatchets({ [ORACLE_EXCLUDED]: ['e11 [client]'] });
	const r = run();
	check('exit 0', r.status === 0, `status ${r.status}\n${r.stderr.slice(-800)}`);
	check('the pair is not counted as parsed', /parsed 12499\/12499/.test(r.stdout), r.stdout.slice(-400));
	restore();
}

console.log('\nan exclusion whose official output now parses fails the run');
{
	seedRatchets({ [ORACLE_EXCLUDED]: ['e11 [client]'] });
	const r = run();
	check('exit 2', r.status === 2, `status ${r.status}`);
	check('says the exclusion is no longer needed', /no longer needed/.test(r.stderr), r.stderr.slice(-600));
}

console.log('\na collapsed population fails instead of going green');
{
	// rsvelte "stopped compiling" most of the corpus: without the floor, the
	// gate would report a perfect score over the survivors.
	const removed = [];
	for (let i = 0; i < 2000; i++) {
		const p = path.join(CORPUS, 'actual', `e${i}`, 'client.js');
		fs.rmSync(p, { force: true });
		removed.push(p);
	}
	seedRatchets();
	const r = run();
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stdout.slice(-400)}`);
	check('says the population collapsed', /population collapsed/.test(r.stderr), r.stderr.slice(-600));
	for (const p of removed) fs.writeFileSync(p, GOOD);
}

console.log('\n--update-parse-baseline rewrites only its own family');
{
	const restore = stage('e7', { actual: BAD });
	seedRatchets();
	const r = run('--update-parse-baseline');
	check('exit 0', r.status === 0, `status ${r.status}\n${r.stdout.slice(-800)}${r.stderr}`);
	const written = JSON.parse(fs.readFileSync(path.join(CORPUS, 'parse-known-failures.client.json'), 'utf8'));
	check('the failing entry is now baselined', written.length === 1 && written[0] === 'e7', JSON.stringify(written));
	const touched = OTHER_RATCHETS.filter(
		(f) => JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8')).length !== 0,
	);
	check('other families untouched', touched.length === 0, touched.join(', '));
	restore();
}

fs.rmSync(sandbox, { recursive: true, force: true });

if (failed) {
	console.error(`\n[parse-gate] ❌ ${failed} assertion(s) failed`);
	process.exit(1);
}
console.log('\n[parse-gate] ✅ all assertions passed');
