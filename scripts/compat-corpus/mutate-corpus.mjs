#!/usr/bin/env node
/**
 * Mutation fuzzing seeded from the collected corpus (#2281 Gate 3).
 *
 * Gate 2 (`matrix/run.mjs`) generates inputs from declared axes with hand-picked
 * seeds. This applies the same mutation to the 14,027 REAL corpus entries: stop
 * treating them as the test set and start treating them as a seed set.
 *
 * Three properties make the findings attributable and the ratchet stable:
 *
 *   1. Only seeds that CURRENTLY MATCH are mutated. An entry already listed in
 *      `known-failures.<target>.json` diverges before anything is inserted, so a
 *      divergent mutant of it teaches nothing.
 *   2. Sampling is deterministic PER FILE (FNV-1a of `<id>#<n>`), not by global
 *      index, so adding or removing a corpus entry does not reshuffle which
 *      mutants every other entry contributes.
 *   3. Raw bytes are compared before anything touches disk. Identical raw output
 *      stays identical under identical normalization, so only the divergent
 *      minority is written out and formatted — which is what makes a full sweep
 *      affordable.
 *
 * WHAT IS GATED. A divergent mutant is classified by whether the difference
 * survives normalizing comments, whitespace and trailing commas away:
 *
 *   - code-mismatch     it does. The generated CODE changed because a comment
 *                       moved — the #2253 class. Ratcheted per id.
 *   - compiler-crash    rsvelte aborted the process on the mutant.
 *   - error-mismatch    exactly one compiler rejected the mutant.
 *   - comment-mismatch  none of the above: the comment was dropped, duplicated
 *                       or relocated, or a line broke differently. Counted, not
 *                       enumerated.
 *
 * The split is the difference between a gate and a backlog dump. Comment
 * fidelity diverges on roughly a third of all mutants, so ratcheting it per id
 * here would mean ~15,000 entries that churn on every submodule bump and drown
 * the class that matters. That class is already ratcheted per id by Gate 2, on
 * GENERATED seeds that do not move when a submodule bumps — which is where a
 * stable per-id ratchet belongs.
 *
 * Trailing commas are normalized away because oxfmt adds one exactly when it
 * breaks a call across lines, so a comment that changes the line-breaking
 * decision changes the comma too. Ignoring that took the code class from 45
 * apparent findings to 2 real ones in the first 300-seed sample. A comma
 * preceded by another comma is left alone — that is array elision, which is
 * semantically real.
 *
 * Compilation runs in child processes, mirroring compile.mjs: a panic in the
 * NAPI binding aborts the process, and a single-process sweep would lose the
 * whole run to one bad mutant. The worker prints `IDX <i>` before each seed so
 * the parent can name the crashing one, record it as a finding, and resume.
 *
 * Modes:
 *   --full            every eligible seed; ratchet is two-sided (nightly)
 *   (default)         a deterministic sample of `--seeds` entries; regressions
 *                     only — a sample cannot prove a baseline entry is stale
 *
 * Usage:
 *   node scripts/compat-corpus/mutate-corpus.mjs [--full] [--seeds <n>]
 *        [--per-file <n>] [--update-baseline] [--targets <keys>] [--no-fmt]
 *        [--jobs <n>] [--max-print <n>] [--keep-artifacts]
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { flattenTemplateHoles, stripBlankLines, firstDiffLine } from './normalize.mjs';
import { selectTargets, TARGETS as ALL_TARGETS } from './targets.mjs';
import { insertionSlots } from './matrix/mutate.mjs';
import { COMMENT_KINDS } from './matrix/axes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');
const SOURCES = path.join(CORPUS, 'sources');
const TREE = path.join(CORPUS, 'mutant-artifacts');
const SHARDS = path.join(CORPUS, '.mutant-shards');
const BASELINE = path.join(CORPUS, 'mutation-known-failures.json');
const BINDING = path.resolve(ROOT, '.corpus-cache/rsvelte.node');

const args = process.argv.slice(2);
const WORKER = args.includes('--worker');
const FULL = args.includes('--full');
const NO_FMT = args.includes('--no-fmt');
const UPDATE_BASELINE = args.includes('--update-baseline');
const KEEP_ARTIFACTS = args.includes('--keep-artifacts');
const numArg = (name, fallback) => {
	const i = args.indexOf(`--${name}`);
	const n = i !== -1 ? Number(args[i + 1]) : NaN;
	return Number.isFinite(n) ? n : fallback;
};
const SEEDS = numArg('seeds', 600);
const PER_FILE = numArg('per-file', 1);
const MAX_PRINT = numArg('max-print', 20);
const JOBS = numArg('jobs', Math.max(2, Math.min(8, os.cpus().length - 2)));
const TARGETS = selectTargets(args);

// ---- seed selection (identical in parent and worker) ------------------------

const manifestPath = path.join(CORPUS, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
	console.error('[mutate] compatibility/manifest.json missing — run `node scripts/compat-corpus/collect.mjs` first');
	process.exit(2);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// An entry listed in ANY target's output ratchet already diverges unmutated.
const known = new Set();
for (const target of ALL_TARGETS) {
	const p = path.join(CORPUS, target.baseline);
	if (fs.existsSync(p)) for (const id of JSON.parse(fs.readFileSync(p, 'utf8'))) known.add(id);
}

function fnv1a(text) {
	let h = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h >>> 0;
}

const eligible = manifest.filter((e) => !known.has(e.id) && fs.existsSync(path.join(SOURCES, e.id)));
const seeds = FULL
	? eligible
	: eligible
			// Deterministic sample: rank by the seed's own hash, so the chosen set is
			// reproducible and does not depend on the manifest's length.
			.map((e) => [fnv1a(e.id), e])
			.sort((a, b) => a[0] - b[0])
			.slice(0, SEEDS)
			.map(([, e]) => e);

// ---- worker: compile a seed range ------------------------------------------

if (WORKER) {
	const require = createRequire(import.meta.url);
	const svelte = await import(path.join(ROOT, 'submodules/svelte/packages/svelte/src/compiler/index.js'));
	const rsvelte = require(BINDING);
	const esbuild = require('esbuild');
	const start = numArg('start', 0);
	const end = numArg('end', seeds.length);

	// Mirrors compile.mjs: production strips TS before the Svelte compiler sees
	// the module, so mutate what the compiler actually receives.
	const prepareSource = (id, source) => {
		if (!id.endsWith('.svelte.ts')) return source;
		try {
			return esbuild.transformSync(source, { loader: 'ts' }).code;
		} catch {
			return source;
		}
	};

	const KIND_NAMES = Object.keys(COMMENT_KINDS);
	// The mutant tag goes BEFORE the extension. Appending it would hand the
	// compiler a filename that no longer ends in `.svelte`/`.svelte.js`, which
	// dev mode bakes into its output and which selects code paths the real
	// pipeline never takes.
	const SUFFIXES = ['.svelte.ts', '.svelte.js', '.svelte'];
	const tagId = (id, tag) => {
		for (const s of SUFFIXES) if (id.endsWith(s)) return `${id.slice(0, -s.length)}${tag}${s}`;
		return id + tag;
	};
	const findings = [];
	const tally = { match: 0, 'error-parity': 0, 'seed-skipped': 0, 'seed-error': 0, divergent: 0, mutants: 0, comparisons: 0 };

	function compileOne(compiler, mutant, target) {
		const options = { generate: target.generate, dev: target.dev, filename: mutant.id };
		if (mutant.kind === 'component') options.css = 'external';
		try {
			const result =
				mutant.kind === 'component' ? compiler.compile(mutant.source, options) : compiler.compileModule(mutant.source, options);
			// A compiler that returns without code is a broken oracle, not an
			// empty program: defaulting to '' makes both sides '' and scores match.
			const js = result.js?.code;
			if (typeof js !== 'string' || js.length === 0) {
				return { error: 'compiler returned no js.code' };
			}
			return { js };
		} catch (e) {
			return { error: String(e?.message ?? e).split('\n')[0] };
		}
	}

	for (let i = start; i < end; i++) {
		// Printed BEFORE any compile so a crash names this seed, not the previous.
		console.log(`IDX ${i}`);
		const entry = seeds[i];
		let mutants = [];
		try {
			const source = prepareSource(entry.id, fs.readFileSync(path.join(SOURCES, entry.id), 'utf8'));
			const slots = insertionSlots(source, { moduleSource: entry.kind === 'module' });
			for (let n = 0; n < PER_FILE && slots.length; n++) {
				const h = fnv1a(`${entry.id}#${n}`);
				const slot = slots[h % slots.length];
				const kindName = KIND_NAMES[(h >>> 8) % KIND_NAMES.length];
				mutants.push({
					id: tagId(entry.id, `__L${slot.line}__${kindName}`),
					kind: entry.kind,
					source: source.slice(0, slot.offset) + slot.indent + COMMENT_KINDS[kindName] + '\n' + source.slice(slot.offset),
				});
			}
		} catch {
			// Distinguished from "this seed has no insertion slot": an exception
			// here means generation broke, and a silent skip would read as work.
			mutants = [];
			tally['seed-error'] += 1;
		}
		if (mutants.length === 0) {
			tally['seed-skipped'] += 1;
			continue;
		}
		tally.mutants += mutants.length;
		for (const mutant of mutants) {
			for (const target of TARGETS) {
				tally.comparisons += 1;
				const expected = compileOne(svelte, mutant, target);
				const actual = compileOne(rsvelte, mutant, target);
				if (expected.error && actual.error) {
					tally['error-parity'] += 1;
					continue;
				}
				if (expected.error || actual.error) {
					findings.push({
						id: mutant.id,
						target: target.key,
						verdict: 'error-mismatch',
						detail: expected.error
							? `rsvelte accepts, official rejects: ${expected.error}`
							: `rsvelte rejects, official accepts: ${actual.error}`,
					});
					continue;
				}
				// Identical raw output stays identical under identical
				// normalization, so the majority never touches disk.
				if (expected.js === actual.js) {
					tally.match += 1;
					continue;
				}
				const dir = path.join(TREE, mutant.id);
				fs.mkdirSync(path.join(dir, 'expected'), { recursive: true });
				fs.mkdirSync(path.join(dir, 'actual'), { recursive: true });
				fs.writeFileSync(path.join(dir, 'expected', `${target.key}.js`), expected.js);
				fs.writeFileSync(path.join(dir, 'actual', `${target.key}.js`), actual.js);
				tally.divergent += 1;
			}
		}
	}

	fs.mkdirSync(SHARDS, { recursive: true });
	fs.writeFileSync(path.join(SHARDS, `${start}.json`), JSON.stringify({ tally, findings }));
	process.exit(0);
}

// ---- parent -----------------------------------------------------------------

if (!fs.existsSync(BINDING)) {
	console.error(`[mutate] rsvelte NAPI binding missing at ${path.relative(ROOT, BINDING)}`);
	console.error('  build: cargo build --release -p rsvelte_napi --lib');
	console.error('  stage: mkdir -p .corpus-cache && cp target/release/librsvelte_napi.{dylib,so} .corpus-cache/rsvelte.node');
	process.exit(2);
}

fs.rmSync(TREE, { recursive: true, force: true });
fs.rmSync(SHARDS, { recursive: true, force: true });

console.log(`[mutate] manifest ${manifest.length}, already-diverging ${known.size}, eligible ${eligible.length}`);
console.log(`[mutate] mode: ${FULL ? 'full sweep' : `sample of ${seeds.length}`}  per-file ${PER_FILE}  targets ${TARGETS.map((t) => t.key).join(', ')}`);

const crashes = [];
const passThrough = ['--per-file', String(PER_FILE), '--targets', TARGETS.map((t) => t.key).join(','), ...(FULL ? ['--full'] : ['--seeds', String(SEEDS)])];

function runRange(start, end) {
	return new Promise((resolve, reject) => {
		if (start >= end) return resolve();
		const child = spawn(process.execPath, [fileURLToPath(import.meta.url), '--worker', '--start', String(start), '--end', String(end), ...passThrough], {
			stdio: ['ignore', 'pipe', 'inherit'],
		});
		let last = start - 1;
		let buf = '';
		child.stdout.on('data', (d) => {
			buf += d;
			let nl;
			while ((nl = buf.indexOf('\n')) !== -1) {
				const line = buf.slice(0, nl);
				buf = buf.slice(nl + 1);
				if (line.startsWith('IDX ')) last = Number(line.slice(4));
			}
		});
		child.on('exit', (code, signal) => {
			if (code === 0) return resolve();
			const seed = seeds[last];
			console.error(`[mutate] worker aborted (${signal ?? code}) on ${seed?.id}`);
			// The crash IS the finding — a mutant that aborts the compiler is
			// strictly worse than one that diverges.
			if (seed) crashes.push({ id: seed.id, verdict: 'compiler-crash', detail: `rsvelte aborted the process (${signal ?? `exit ${code}`})` });
			runRange(last + 1, end).then(resolve, reject);
		});
		child.on('error', reject);
	});
}

const shardSize = Math.ceil(seeds.length / JOBS);
const ranges = [];
for (let s = 0; s < seeds.length; s += shardSize) ranges.push([s, Math.min(s + shardSize, seeds.length)]);
console.log(`[mutate] ${seeds.length} seeds across ${ranges.length} workers…`);
await Promise.all(ranges.map(([s, e]) => runRange(s, e)));

const counts = { match: 0, 'error-parity': 0, 'code-mismatch': 0, 'comment-mismatch': 0, 'error-mismatch': 0, 'compiler-crash': crashes.length, 'seed-skipped': 0, 'seed-error': 0 };
const failures = [...crashes.map((c) => ({ ...c, target: 'all' }))];
let divergent = 0;
let mutantsGenerated = 0;
let comparisons = 0;
// A worker that dies without writing its shard would otherwise remove its whole
// range from every count below, and the run would still report success.
const shardFiles = fs.existsSync(SHARDS) ? fs.readdirSync(SHARDS) : [];
if (shardFiles.length !== ranges.length) {
	console.error(`\n[mutate] ${shardFiles.length} shard results for ${ranges.length} workers — a worker produced no tally.`);
	process.exit(2);
}
for (const file of shardFiles) {
	const shard = JSON.parse(fs.readFileSync(path.join(SHARDS, file), 'utf8'));
	counts.match += shard.tally.match;
	counts['error-parity'] += shard.tally['error-parity'];
	counts['seed-skipped'] += shard.tally['seed-skipped'];
	counts['seed-error'] += shard.tally['seed-error'];
	divergent += shard.tally.divergent;
	mutantsGenerated += shard.tally.mutants;
	comparisons += shard.tally.comparisons;
	for (const f of shard.findings) {
		counts['error-mismatch'] += 1;
		failures.push(f);
	}
}
fs.rmSync(SHARDS, { recursive: true, force: true });
console.log(`[mutate] mutants ${mutantsGenerated}, comparisons ${comparisons}, raw-divergent ${divergent}`);

// A fuzzer that generates nothing reports "no divergences found", which reads as
// a pass. Require that most seeds actually yielded mutants before believing it.
const MIN_MUTATED_SEED_RATIO = 0.5;
const seedsMutated = seeds.length - counts['seed-skipped'];
if (comparisons === 0 || seedsMutated < seeds.length * MIN_MUTATED_SEED_RATIO) {
	console.error(`\n[mutate] only ${seedsMutated}/${seeds.length} seeds produced a mutant (${comparisons} comparisons).`);
	console.error('  The insertion-slot scanner is finding nothing — this run measured nothing.');
	if (counts['seed-error']) console.error(`  ${counts['seed-error']} seeds threw during generation.`);
	process.exit(2);
}

// ---- normalization (must match verify.mjs exactly) -------------------------

function flattenTreeTemplateHoles(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) flattenTreeTemplateHoles(p);
		else if (entry.name.endsWith('.js')) {
			const src = fs.readFileSync(p, 'utf8');
			const flat = flattenTemplateHoles(src);
			if (flat !== src) fs.writeFileSync(p, flat);
		}
	}
}

if (!NO_FMT && fs.existsSync(TREE)) {
	const emptyIgnore = path.join(CORPUS, '.oxfmt-ignore-nothing');
	fs.writeFileSync(emptyIgnore, '');
	flattenTreeTemplateHoles(TREE);
	console.log('[mutate] oxfmt…');
	try {
		execFileSync('npx', ['oxfmt', '-c', path.join(CORPUS, '.oxfmtrc.json'), '--ignore-path', emptyIgnore, '--no-error-on-unmatched-pattern', '.'], {
			cwd: TREE,
			stdio: ['ignore', 'ignore', 'pipe'],
			maxBuffer: 1024 * 1024 * 64,
		});
	} catch (e) {
		const stderr = e.stderr?.toString() ?? '';
		const unparsable = (stderr.match(/x `|x Expected|x Unexpected/g) ?? []).length;
		console.log(`[mutate]   oxfmt skipped unparsable files (${unparsable} parse diagnostics)`);
	}
}

const COMMENT_RE = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g;

/**
 * What is left of a program once everything a relocated comment can move is
 * gone: the comments, all whitespace, and the trailing comma oxfmt adds when
 * (and only when) it breaks a construct across lines. A comma preceded by
 * another comma is array elision and stays.
 */
function codeIdentity(source) {
	return (
		source
			.replace(COMMENT_RE, '')
			.replace(/\s+/g, '')
			.replace(/([^,]),(?=[)\]}])/g, '$1')
			// Quote style is oxfmt's to choose, and it only survives here on pairs
			// oxfmt could not parse. Verified to reclassify 0 of 213 entries — it is
			// in for honest reporting (the first difference shown must be the reason
			// for the verdict), not to change any verdict.
			.replace(/'((?:[^'\\\n]|\\.)*)'/g, (m, inner) => (inner.includes('"') ? m : `"${inner}"`))
	);
}

/**
 * Where the two programs first differ IN THE STRING THE VERDICT WAS COMPUTED
 * FROM. A line-based diff cannot do this job: the leading textual difference is
 * routinely a quote style (oxfmt could not format the pair) or a line break,
 * both of which `codeIdentity` ignores — so a reviewer sees something cosmetic
 * and dismisses a real finding further down.
 */
function codeDiffWindow(expected, actual) {
	const a = codeIdentity(expected);
	const b = codeIdentity(actual);
	let i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) i++;
	const from = Math.max(0, i - 40);
	return { expected: a.slice(from, i + 60), actual: b.slice(from, i + 60) };
}

function walkPairs(dir, out = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) walkPairs(p, out);
		else if (entry.name.endsWith('.js') && path.basename(path.dirname(p)) === 'expected') out.push(p);
	}
	return out;
}

const pairs = fs.existsSync(TREE) ? walkPairs(TREE) : [];
// Every divergent comparison wrote both halves, so a `divergent` count that the
// walk cannot account for means outputs went missing between the two stages.
if (pairs.length !== divergent) {
	console.error(`\n[mutate] ${pairs.length} output pairs on disk for ${divergent} divergent comparisons — outputs went missing.`);
	process.exit(2);
}
for (const expectedPath of pairs) {
	const actualPath = expectedPath.replace(`${path.sep}expected${path.sep}`, `${path.sep}actual${path.sep}`);
	if (!fs.existsSync(actualPath)) {
		console.error(`\n[mutate] missing rsvelte output for ${path.relative(TREE, expectedPath)} — a skipped pair would score as no divergence.`);
		process.exit(2);
	}
	const expected = stripBlankLines(fs.readFileSync(expectedPath, 'utf8'));
	const actual = stripBlankLines(fs.readFileSync(actualPath, 'utf8'));
	const target = path.basename(expectedPath, '.js');
	const id = path.relative(TREE, path.dirname(path.dirname(expectedPath)));
	if (expected === actual) {
		counts.match += 1;
		continue;
	}
	if (codeIdentity(expected) === codeIdentity(actual)) {
		counts['comment-mismatch'] += 1;
		continue;
	}
	counts['code-mismatch'] += 1;
	// Report the first line that differs in CODE, not the first line that
	// differs at all: an unformatted pair (oxfmt could not parse it) leads with
	// a quote-style difference, and a reviewer who sees that dismisses a real
	// finding sitting further down. Blanking comments in place keeps the line
	// numbers honest.
	failures.push({ id, target, verdict: 'code-mismatch', ...codeDiffWindow(expected, actual) });
}

// ---- report + ratchet ------------------------------------------------------

console.log('\n[mutate] results:');
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(17)} ${v}`);

const ids = new Set(failures.map((f) => `${f.id} [${f.verdict}] (${f.target})`));

if (UPDATE_BASELINE) {
	if (!FULL) {
		console.error('\n[mutate] refusing to baseline from a sampled run: the rewrite would delete');
		console.error('  every baseline entry the sample did not measure (FALSE-SHRINK). Use --full.');
		process.exit(2);
	}
	if (NO_FMT) {
		console.error('\n[mutate] refusing to baseline from a --no-fmt run: it counts formatting-only');
		console.error('  differences as failures, which the corpus gate tolerates by contract.');
		process.exit(2);
	}
	if (TARGETS.length !== ALL_TARGETS.length) {
		console.error('\n[mutate] refusing to baseline from a --targets subset (FALSE-SHRINK).');
		process.exit(2);
	}
	fs.writeFileSync(BASELINE, JSON.stringify([...ids].sort(), null, '\t') + '\n');
	console.log(`\n[mutate] baseline: ${ids.size} known -> ${path.relative(ROOT, BASELINE)}`);
	finish(0);
}

const baseline = new Set(fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : []);
const regressions = [...ids].filter((id) => !baseline.has(id));
// Staleness is only decidable when the run saw everything. A sample that did
// not measure an entry says nothing about whether it still fails.
const stale = FULL ? [...baseline].filter((id) => !ids.has(id)) : [];
const failById = new Map(failures.map((f) => [`${f.id} [${f.verdict}] (${f.target})`, f]));

if (regressions.length) {
	console.log(`\n[mutate] ❌ ${regressions.length} NEW divergences (not in the baseline):`);
	for (const id of regressions.slice(0, MAX_PRINT)) {
		const f = failById.get(id);
		console.log(`  - ${id}`);
		if (f.detail) console.log(`      ${f.detail}`);
		else {
			console.log('      first code difference (comments, whitespace and trailing commas removed):');
			console.log(`        official: …${f.expected}`);
			console.log(`        rsvelte : …${f.actual}`);
		}
	}
	if (regressions.length > MAX_PRINT) console.log(`  … and ${regressions.length - MAX_PRINT} more`);
}

if (stale.length) {
	console.log(`\n[mutate] ❌ ${stale.length} baseline entries already PASS — the ratchet is stale.`);
	for (const id of stale.slice(0, MAX_PRINT)) console.log(`  - ${id}`);
	if (stale.length > MAX_PRINT) console.log(`  … and ${stale.length - MAX_PRINT} more`);
	console.log('  fix: node scripts/compat-corpus/mutate-corpus.mjs --full --update-baseline');
}

if (regressions.length || stale.length) finish(1);

if (ids.size) {
	console.log(`\n[mutate] ✅ no code regressions (${ids.size} known remain — see compatibility/mutation-known-failures.md)`);
} else {
	console.log('\n[mutate] ✅ no mutant changes generated code');
}
// Not gated here by design: comment fidelity is ratcheted per id by Gate 2 on
// generated seeds, which do not churn when a submodule bumps.
if (counts['comment-mismatch']) {
	console.log(`[mutate]    ${counts['comment-mismatch']} comment-only divergences (not gated here — see matrix-known-failures.md)`);
}
if (!FULL) console.log(`[mutate]    sampled run — staleness not checked (needs --full)`);
finish(0);

function finish(code) {
	if (!KEEP_ARTIFACTS && code === 0) fs.rmSync(TREE, { recursive: true, force: true });
	else if (fs.existsSync(TREE)) console.log(`[mutate] artifacts kept: ${path.relative(ROOT, TREE)}`);
	process.exit(code);
}
