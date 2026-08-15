#!/usr/bin/env node
/**
 * SCSS/Sass backend parity gate: `grass` (what `rsvelte_preprocess` ships)
 * against dart-sass (what `svelte-preprocess` and `svelte-preprocess-sass`
 * wrap). Until this existed the substitution was an assumption — the crate's
 * own tests port the upstream packages' *wrapper* tests (language filtering,
 * syntax selection, a nesting sample), which exercise dispatch rather than the
 * CSS compiler.
 *
 * Units are collected from the corpus source repositories in
 * `corpus-sources.json`:
 *
 *   - every `<style lang="scss"|"sass">` / `type="text/scss"` block in a
 *     `.svelte` file, and
 *   - every standalone `.scss` / `.sass` file.
 *
 * Each unit is compiled with both backends and the CSS compared byte-for-byte
 * after trailing-whitespace normalisation only. A unit both backends *reject*
 * counts as parity — that is the answer for the many `_partial.scss` files that
 * reference variables their parent defines, and dropping them instead would
 * report coverage this gate does not have.
 *
 * Ratchet: `compatibility/scss-known-failures.json`, shrink-only and two-sided —
 * a new divergence fails, and so does a listed id that now agrees, so the PR
 * that fixes an entry re-baselines in the same PR.
 *
 * Usage:
 *   node scripts/compat-corpus/scss-verify.mjs                  # gate
 *   node scripts/compat-corpus/scss-verify.mjs --update-baseline
 *   node scripts/compat-corpus/scss-verify.mjs --list           # every divergence
 *   node scripts/compat-corpus/scss-verify.mjs --max-print 20
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SOURCES_PATH = path.join(__dirname, 'corpus-sources.json');
const BASELINE_PATH = path.join(ROOT, 'compatibility', 'scss-known-failures.json');
const SHIM_ROOT = path.join(ROOT, 'compatibility', 'scss-node-modules-shim');

const args = process.argv.slice(2);
const UPDATE_BASELINE = args.includes('--update-baseline');
const LIST = args.includes('--list');
const MAX_PRINT = args.includes('--max-print') ? Number(args[args.indexOf('--max-print') + 1]) || 20 : 20;

// The population is small and stable (a Tailwind-era Svelte corpus holds little
// SCSS), so a floor guards the FALSE-SHRINK trap: `--update-baseline` deletes
// every id it did not measure, and a run against un-checked-out submodules
// would silently empty the ratchet.
const MIN_UNITS = 100;

function fail(message) {
	console.error(`[scss-verify] ${message}`);
	process.exit(1);
}

const STYLE_TAG = /<style(\s[^>]*)?>([\s\S]*?)<\/style>/g;
const LANG_ATTR = /\b(?:lang|type)\s*=\s*"([^"]*)"/;

function styleSyntax(attributes) {
	const value = LANG_ATTR.exec(attributes ?? '')?.[1] ?? '';
	const lang = value.replace(/^text\//, '');
	if (lang === 'scss') return 'scss';
	if (lang === 'sass') return 'indented';
	return null;
}

function walk(dir, out) {
	let entries;
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return out;
	}
	// Sorted so the shim's first-name-wins rule, and therefore the ratchet, does
	// not depend on directory order.
	entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === 'node_modules' || entry.name === '.git') continue;
			walk(full, out);
		} else if (entry.isFile()) {
			out.push(full);
		}
	}
	return out;
}

/**
 * A corpus package that imports itself by its published specifier
 * (`@use 'node_modules/attractions/_variables'`) only resolves against an
 * installed workspace. One shim directory of symlinks, handed to BOTH backends
 * as an extra load path, resolves them without installing anything — and keeps
 * the 65 `attractions` stylesheets in the CSS-comparing population instead of
 * the both-reject one, where they carry almost no signal.
 */
function buildNodeModulesShim(sources) {
	fs.rmSync(SHIM_ROOT, { recursive: true, force: true });
	const modules = path.join(SHIM_ROOT, 'node_modules');
	fs.mkdirSync(modules, { recursive: true });
	let linked = 0;
	for (const source of sources) {
		const root = path.join(ROOT, source.path);
		if (!fs.existsSync(root)) continue;
		for (const file of walk(root, [])) {
			if (path.basename(file) !== 'package.json') continue;
			let name;
			try {
				name = JSON.parse(fs.readFileSync(file, 'utf8')).name;
			} catch {
				continue;
			}
			if (typeof name !== 'string' || !name) continue;
			const target = path.join(modules, name);
			if (fs.existsSync(target)) continue;
			fs.mkdirSync(path.dirname(target), { recursive: true });
			fs.symlinkSync(path.dirname(file), target, 'dir');
			linked++;
		}
	}
	return linked;
}

function collect() {
	const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
	const linked = buildNodeModulesShim(sources);
	const units = [];
	for (const source of sources) {
		const root = path.join(ROOT, source.path);
		if (!fs.existsSync(root)) continue;
		for (const file of walk(root, [])) {
			const rel = path.relative(ROOT, file);
			const ext = path.extname(file);
			if (ext === '.scss' || ext === '.sass') {
				units.push({
					id: rel,
					source: fs.readFileSync(file, 'utf8'),
					indented: ext === '.sass',
					filename: file,
				});
				continue;
			}
			if (ext !== '.svelte') continue;
			const text = fs.readFileSync(file, 'utf8');
			if (!text.includes('<style')) continue;
			let match;
			let index = 0;
			STYLE_TAG.lastIndex = 0;
			while ((match = STYLE_TAG.exec(text)) !== null) {
				const syntax = styleSyntax(match[1]);
				if (!syntax) continue;
				units.push({
					id: `${rel}#style${index++}`,
					source: match[2],
					indented: syntax === 'indented',
					filename: file,
				});
			}
		}
	}
	units.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
	return { units, linked };
}

async function compileWithDartSass(units) {
	let sass;
	try {
		sass = await import('sass');
	} catch {
		fail('the `sass` package (dart-sass) is not installed — run `pnpm install`');
	}
	return units.map((unit) => {
		try {
			const result = sass.compileString(unit.source, {
				syntax: unit.indented ? 'indented' : 'scss',
				style: 'expanded',
				loadPaths: [path.dirname(unit.filename), SHIM_ROOT],
				logger: sass.Logger.silent,
			});
			return { ok: true, css: result.css };
		} catch (error) {
			return { ok: false, error: String(error?.message ?? error) };
		}
	});
}

function compileWithGrass(units) {
	const binary = path.join(ROOT, 'target', 'release', 'scss_parity');
	const debug = path.join(ROOT, 'target', 'debug', 'scss_parity');
	const exe = fs.existsSync(binary) ? binary : debug;
	if (!fs.existsSync(exe)) {
		fail('scss_parity binary missing — run `cargo build --release -p rsvelte_preprocess --bin scss_parity`');
	}
	const payload = JSON.stringify(
		units.map(({ id, source, indented, filename }) => ({
			id,
			source,
			indented,
			filename,
			loadPaths: [SHIM_ROOT],
		})),
	);

	// `grass` panics on real corpus input and the release profile aborts rather
	// than unwinds, so isolation cannot live inside the process: the helper
	// announces each index on stderr, and a crash is attributed to the index it
	// last announced before resuming after it.
	const results = [];
	let panics = 0;
	while (results.length < units.length) {
		const run = spawnSync(exe, ['--from', String(results.length)], {
			input: payload,
			maxBuffer: 512 * 1024 * 1024,
			encoding: 'utf8',
		});
		for (const line of run.stdout.split('\n')) {
			if (line.trim()) results.push(JSON.parse(line));
		}
		if (results.length >= units.length) break;
		if (run.status === 0) {
			fail(`grass exited cleanly after ${results.length} of ${units.length} units`);
		}
		// The crash belongs to the unit whose index was announced but produced no
		// result line; anything else means the helper died before starting one.
		const announced = [...run.stderr.matchAll(/^IDX (\d+)$/gm)].map((m) => Number(m[1]));
		const crashed = announced.at(-1);
		if (crashed !== results.length) {
			fail(
				`grass died at unit ${crashed ?? '<none announced>'} but ${results.length} results were collected:\n` +
					run.stderr.split('\n').filter(Boolean).slice(-5).join('\n'),
			);
		}
		results.push({ ok: false, error: `panic: ${firstPanicLine(run.stderr)}` });
		panics++;
	}
	if (panics) console.log(`[scss-verify] grass aborted on ${panics} unit(s); resumed past each`);
	return results;
}

function firstPanicLine(stderr) {
	return stderr.split('\n').find((line) => line.includes('panicked at')) ?? 'aborted';
}

/** Trailing whitespace only — anything more would hide a real divergence. */
function normalise(css) {
	return css
		.split('\n')
		.map((line) => line.replace(/[ \t]+$/, ''))
		.join('\n')
		.replace(/\n+$/, '');
}

function verdictOf(oracle, actual) {
	if (!oracle.ok && !actual.ok) return 'both-error';
	if (!oracle.ok) return 'grass-accepts-rejected';
	if (!actual.ok) return 'grass-rejects-accepted';
	return normalise(oracle.css) === normalise(actual.css) ? 'match' : 'css-mismatch';
}

const { units, linked } = collect();
if (units.length < MIN_UNITS) {
	fail(
		`only ${units.length} SCSS units found (floor ${MIN_UNITS}) — the corpus submodules look absent; ` +
			'run `git submodule update --init` before gating',
	);
}

const oracles = await compileWithDartSass(units);
const actuals = compileWithGrass(units);

const counts = {};
const divergences = [];
for (const [index, unit] of units.entries()) {
	const verdict = verdictOf(oracles[index], actuals[index]);
	counts[verdict] = (counts[verdict] ?? 0) + 1;
	if (verdict !== 'match' && verdict !== 'both-error') {
		divergences.push({ id: unit.id, verdict, oracle: oracles[index], actual: actuals[index] });
	}
}

console.log(
	`[scss-verify] ${units.length} units, ${linked} package shims: ` +
		Object.entries(counts)
			.sort()
			.map(([verdict, n]) => `${verdict}=${n}`)
			.join(' '),
);

const diverged = new Map(divergences.map((d) => [d.id, d.verdict]));

function describe(id, verdict) {
	const detail = divergences.find((d) => d.id === id);
	console.error(`\n[scss-verify] ${verdict}: ${id}`);
	if (verdict === 'css-mismatch') {
		const oracle = normalise(detail.oracle.css).split('\n');
		const actual = normalise(detail.actual.css).split('\n');
		const at = oracle.findIndex((line, i) => line !== actual[i]);
		console.error(`  line ${at + 1}\n  dart-sass: ${oracle[at]}\n  grass:     ${actual[at] ?? '<eof>'}`);
	} else {
		console.error(`  dart-sass: ${detail.oracle.ok ? 'ok' : detail.oracle.error.split('\n')[0]}`);
		console.error(`  grass:     ${detail.actual.ok ? 'ok' : detail.actual.error.split('\n')[0]}`);
	}
}

if (LIST) {
	for (const [id, verdict] of [...diverged].sort()) describe(id, verdict);
	process.exit(0);
}

if (UPDATE_BASELINE) {
	const baseline = [...diverged.entries()].sort().map(([id, verdict]) => ({ id, verdict }));
	fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, '\t')}\n`);
	console.log(`[scss-verify] wrote ${baseline.length} entries to ${path.relative(ROOT, BASELINE_PATH)}`);
	process.exit(0);
}

if (!fs.existsSync(BASELINE_PATH)) {
	fail(`${path.relative(ROOT, BASELINE_PATH)} missing — run with --update-baseline`);
}
const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
const known = new Map(baseline.map((entry) => [entry.id, entry.verdict]));

// The verdict is part of the key: a ratchet entry suppresses everything it
// cannot tell apart, and a unit that stops mismatching on CSS and starts being
// rejected outright is a different defect.
const regressions = [...diverged].filter(([id, verdict]) => known.get(id) !== verdict);
const fixed = [...known].filter(([id, verdict]) => diverged.get(id) !== verdict);

for (const [id, verdict] of regressions.slice(0, MAX_PRINT)) describe(id, verdict);

if (regressions.length) {
	fail(`${regressions.length} new SCSS parity divergence(s) — see above`);
}
if (fixed.length) {
	console.error(`[scss-verify] ${fixed.length} baseline entr(ies) no longer diverge:`);
	for (const [id, verdict] of fixed.slice(0, MAX_PRINT)) console.error(`  ${verdict}: ${id}`);
	fail('re-baseline in this PR: node scripts/compat-corpus/scss-verify.mjs --update-baseline');
}

console.log(`[scss-verify] OK — ${known.size} known divergence(s), no regressions`);
