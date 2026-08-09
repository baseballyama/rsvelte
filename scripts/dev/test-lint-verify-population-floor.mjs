#!/usr/bin/env node
/**
 * Guards two contracts of scripts/compat-corpus/lint-verify.mjs.
 *
 * 1. `--update` rewrites `compatibility/lint-known-failures.json` wholesale, so
 *    a run over a narrowed corpus DELETES every entry it did not reproduce and
 *    still reports success. verify.mjs and svelte2tsx-verify.mjs refuse that;
 *    lint-verify.mjs did not.
 * 2. `.svelte.(js|ts)` entries are part of the compared population. That is not
 *    observable from a passing run — a filter that drops them again scores every
 *    module as a match — so the run reports the per-kind denominator and refuses
 *    to grade a population with no module in it.
 *
 * Both linters are stubbed: this test is about which populations the gate agrees
 * to grade and to rewrite from, not about rule parity (that is the corpus job's
 * own gate, which needs a real binary and the real eslint-plugin-svelte).
 *
 * Usage: node scripts/dev/test-lint-verify-population-floor.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CI_REPOS } from '../compat-corpus/lint-universe.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS_SCRIPTS = path.join(ROOT, 'scripts/compat-corpus');

// Must exceed lint-verify.mjs's MIN_FULL_LINT_CORPUS_ENTRIES; the narrowed run
// must sit below it but above MIN_MANIFEST_ENTRIES, so the two floors are
// distinguishable by which message comes back.
const FULL_ENTRIES = 6500;
const NARROW_ENTRIES = 3000;
const MODULE_EVERY = 40; // ~2.5% modules, close to the real corpus's 160/6761
const SENTINEL = ['sentinel|+svelte/no-at-html-tags\t1:1\tsentinel'];

let failed = 0;
function check(name, ok, detail) {
	console.log(`${ok ? '  ✓' : '  ✗'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);
	if (!ok) failed++;
}

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'lint-verify-floor-'));
const CORPUS = path.join(sandbox, 'compatibility');
const SOURCES = path.join(CORPUS, 'lint-sources');
const KNOWN = path.join(CORPUS, 'lint-known-failures.json');
const VERIFY = path.join(sandbox, 'scripts/compat-corpus/lint-verify.mjs');

// `STUB_STRAY` makes the stub report a finding for a path outside the corpus,
// standing in for the real CLI walking a tree wider than the oracle's file list.
const STUB_BIN = `#!/usr/bin/env node
const args = process.argv.slice(2);
if (args.includes('--list-rules')) {
	process.stdout.write('svelte/no-at-html-tags\\n');
	process.exit(0);
}
const results = process.env.STUB_STRAY
	? [
			{
				ruleId: 'svelte/no-at-html-tags',
				message: { text: 'stray' },
				locations: [
					{
						physicalLocation: {
							artifactLocation: { uri: process.env.STUB_STRAY },
							region: { startLine: 1, startColumn: 1 }
						}
					}
				]
			}
		]
	: [];
process.stdout.write(JSON.stringify({ runs: [{ results }] }));
`;

// Answers the same two questions lint-oracle/run.mjs answers — the NUL-separated
// stdin file list, and one entry per file — with no findings. `STUB_DROP` makes
// it answer for fewer files than it was given, standing in for a source that
// vanished under the oracle after the population floors were checked.
const STUB_ORACLE = `import fs from 'node:fs';
const files = fs.readFileSync(0, 'utf8').split('\\0').filter(Boolean);
const drop = Number(process.env.STUB_DROP || 0);
process.stdout.write(JSON.stringify(files.slice(drop).map((file) => ({ file, messages: [] }))));
`;

// lint-universe.mjs asks the real plugin for its rule list from ORACLE_DIR; the
// sandbox answers with a stub package so this test needs no npm install.
const STUB_PLUGIN = 'export default { rules: { "no-at-html-tags": {} } };\n';

function buildSandbox() {
	fs.mkdirSync(path.join(sandbox, 'scripts/compat-corpus'), { recursive: true });
	// Every sibling module rather than lint-verify.mjs's current imports: a
	// hand-listed set makes a new import fail here as a missing file, not as the
	// contract this guards.
	for (const f of fs.readdirSync(CORPUS_SCRIPTS).filter((f) => f.endsWith('.mjs'))) {
		fs.copyFileSync(path.join(CORPUS_SCRIPTS, f), path.join(sandbox, 'scripts/compat-corpus', f));
	}
	const oracleDir = path.join(sandbox, 'scripts/compat-corpus/lint-oracle');
	const pluginDir = path.join(oracleDir, 'node_modules/eslint-plugin-svelte');
	fs.mkdirSync(pluginDir, { recursive: true });
	fs.writeFileSync(path.join(oracleDir, 'run.mjs'), STUB_ORACLE);
	fs.writeFileSync(
		path.join(pluginDir, 'package.json'),
		JSON.stringify({ name: 'eslint-plugin-svelte', version: '0.0.0', type: 'module', main: 'index.mjs' })
	);
	fs.writeFileSync(path.join(pluginDir, 'index.mjs'), STUB_PLUGIN);
	const binDir = path.join(sandbox, 'target/dist-lint');
	fs.mkdirSync(binDir, { recursive: true });
	fs.writeFileSync(path.join(binDir, 'rsvelte-lint'), STUB_BIN, { mode: 0o755 });
}

/**
 * Write a manifest of `n` entries and the matching sources, spread over the CI
 * repo list. `modules` off ⇒ components only; `repos` overrides the repo set.
 */
function seedCorpus(n, { modules = true, repos = CI_REPOS } = {}) {
	fs.rmSync(SOURCES, { recursive: true, force: true });
	fs.mkdirSync(SOURCES, { recursive: true });
	const manifest = [];
	for (let i = 0; i < n; i++) {
		const isModule = modules && i % MODULE_EVERY === 0;
		// Corpus ids are `<repo>/<path>`, and the rewrite guard compares that repo
		// set against CI_REPOS, so the sandbox has to carry real repo names.
		const id = `${repos[i % repos.length]}/e${i}${isModule ? '.svelte.js' : '.svelte'}`;
		manifest.push({ id, kind: isModule ? 'module' : 'component' });
		fs.mkdirSync(path.dirname(path.join(SOURCES, id)), { recursive: true });
		fs.writeFileSync(path.join(SOURCES, id), isModule ? 'export const a = 1;\n' : '<div></div>\n');
	}
	fs.writeFileSync(path.join(CORPUS, 'lint-manifest.json'), JSON.stringify(manifest));
	return manifest;
}

function seedRatchet() {
	fs.writeFileSync(KNOWN, JSON.stringify(SENTINEL, null, '\t') + '\n');
}

const ratchetIntact = () => JSON.parse(fs.readFileSync(KNOWN, 'utf8')).length === SENTINEL.length;

function run(...extra) {
	seedRatchet();
	return spawnSync(process.execPath, [VERIFY, ...extra], { cwd: sandbox, encoding: 'utf8' });
}

function runWithEnv(env, ...extra) {
	seedRatchet();
	return spawnSync(process.execPath, [VERIFY, ...extra], {
		cwd: sandbox,
		encoding: 'utf8',
		env: { ...process.env, ...env }
	});
}

buildSandbox();
console.log(`[lint-verify-floor] sandbox: ${sandbox}`);

console.log(`\na narrowed --update run refuses (${NARROW_ENTRIES} entries)`);
{
	seedCorpus(NARROW_ENTRIES);
	const r = run('--update');
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check('names the measured population', new RegExp(`only ${NARROW_ENTRIES} `).test(r.stderr), r.stderr.slice(0, 600));
	check('ratchet untouched', ratchetIntact());
}

console.log(`\na full --update run still rewrites (${FULL_ENTRIES} entries)`);
{
	seedCorpus(FULL_ENTRIES);
	const r = run('--update');
	check('exit 0', r.status === 0, `status ${r.status}\n${r.stderr}`);
	check('ratchet rewritten', !ratchetIntact(), fs.readFileSync(KNOWN, 'utf8').slice(0, 200));
}

// The entry-count floor is a lower bound, so it cannot see the loss of one small
// repo — dropping `melt-ui` from the real corpus leaves 6677 of 6761, over the
// floor. The repo set is what makes that axis exact, in both directions.
console.log('\na --update run missing one CI repo refuses, even over the entry floor');
{
	seedCorpus(FULL_ENTRIES, { repos: CI_REPOS.filter((r) => r !== 'melt-ui') });
	const r = run('--update');
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check('names the missing repo', /no source from melt-ui/.test(r.stderr), r.stderr.slice(0, 600));
	check('ratchet untouched', ratchetIntact());
}

console.log('\na --update run over a SUPERSET of the CI repos refuses');
{
	seedCorpus(FULL_ENTRIES, { repos: [...CI_REPOS, 'svelte.dev'] });
	const r = run('--update');
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check('names the extra repo', /measured svelte\.dev/.test(r.stderr), r.stderr.slice(0, 600));
	check('ratchet untouched', ratchetIntact());
}

// The floor guards the rewrite path only: a narrowed VERIFY run must still run
// and fail on staleness, or the floor would be a way to skip the gate.
console.log('\nthe floor is scoped to --update');
{
	seedCorpus(NARROW_ENTRIES);
	const r = run();
	check('exit 1 (stale ratchet), not 2 (refused)', r.status === 1, `status ${r.status}\n${r.stderr}`);
	check('ratchet untouched', ratchetIntact());
}

console.log('\nan empty manifest is refused before any linting');
{
	seedCorpus(10);
	const r = run();
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check('names lint-collect.mjs', /lint-collect\.mjs/.test(r.stderr), r.stderr.slice(0, 400));
}

console.log('\nmissing sources under a full manifest are refused');
{
	const manifest = seedCorpus(FULL_ENTRIES);
	for (const e of manifest.slice(0, Math.ceil(FULL_ENTRIES * 0.02))) fs.rmSync(path.join(SOURCES, e.id));
	const r = run('--update');
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check('names the coverage shortfall', /have a source on disk/.test(r.stderr), r.stderr.slice(0, 400));
	check('ratchet untouched', ratchetIntact());
}

// The negative control for the hit counter: with the `kind === 'component'`
// filter restored (or any future filter with the same effect) this is the state
// the gate would be in, and it must not read as a clean run.
console.log('\na population with no .svelte.(js|ts) entry is refused');
{
	seedCorpus(FULL_ENTRIES, { modules: false });
	const r = run();
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check('names the ungated module surface', /module surface is ungated/.test(r.stderr), r.stderr.slice(0, 400));
}

// The two sides are handed different things — the oracle a file list, the CLI
// the whole tree — so a finding outside the list is a population mismatch, not a
// divergence to grade.
console.log('\na finding outside the compared population is refused');
{
	seedCorpus(FULL_ENTRIES);
	const r = runWithEnv({ STUB_STRAY: path.join(sandbox, 'not-in-the-corpus.svelte') });
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check('names the population mismatch', /linted different populations/.test(r.stderr), r.stderr.slice(0, 400));
}

// The population floors run before the oracle does, so they cannot see a source
// that disappears under it. An oracle with no answer for a file must not read as
// an oracle that found nothing there.
console.log('\nan entry the oracle never answered for is refused, not scored as silent');
{
	seedCorpus(FULL_ENTRIES);
	const r = runWithEnv({ STUB_DROP: '7' });
	check('exit 2', r.status === 2, `status ${r.status}\n${r.stderr}`);
	check('names the unmeasured count', /no result for 7\//.test(r.stderr), r.stderr.slice(0, 400));
}

console.log('\nthe per-kind denominators are reported');
{
	seedCorpus(FULL_ENTRIES);
	const r = run();
	const expectModules = Math.ceil(FULL_ENTRIES / MODULE_EVERY);
	check(
		`compares ${expectModules} module entries`,
		new RegExp(`${expectModules} module \\(oracle 0 / rsvelte 0 findings\\)`).test(r.stdout),
		r.stdout.slice(-600)
	);
	check(
		`compares ${FULL_ENTRIES - expectModules} component entries`,
		new RegExp(`compared: ${FULL_ENTRIES - expectModules} component`).test(r.stdout),
		r.stdout.slice(-600)
	);
	check(
		'names the repos the population came from',
		r.stdout.includes(`from ${CI_REPOS.length} repos [${[...CI_REPOS].sort().join(', ')}]`),
		r.stdout.slice(0, 400)
	);
}

fs.rmSync(sandbox, { recursive: true, force: true });
console.log(failed === 0 ? '\n[lint-verify-floor] ✅ all checks passed' : `\n[lint-verify-floor] ❌ ${failed} check(s) failed`);
process.exit(failed === 0 ? 0 : 1);
