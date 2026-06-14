#!/usr/bin/env node
/**
 * Convert every component corpus entry (see collect.mjs) to TSX with BOTH the
 * official `svelte2tsx` (from submodules/language-tools) and rsvelte's port
 * (NAPI binding), writing the outputs to:
 *
 *   compat/corpus/expected-s2t/<id>/index.tsx   (official svelte2tsx)
 *   compat/corpus/actual-s2t/<id>/index.tsx     (rsvelte svelte2tsx)
 *
 * svelte2tsx only processes Svelte *components*, so `.svelte.(js|ts)` module
 * entries (kind === 'module') are skipped. Files the official tool rejects are
 * error cases: rsvelte must reject them too (error parity), tracked via
 * error.json on both sides.
 *
 * Like compile.mjs this runs as a parent process that shards the manifest
 * across worker child processes, so a Rust panic in rsvelte's port records the
 * offending entry as a `rust_panic` error on the actual side and resumes from
 * the next entry instead of killing the whole run.
 *
 * Usage: node scripts/compat-corpus/svelte2tsx-compile.mjs [--binding <path>] [--filter <substr>] [--jobs <n>]
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compat/corpus');
const EXPECTED = path.join(CORPUS, 'expected-s2t');
const ACTUAL = path.join(CORPUS, 'actual-s2t');
const OFFICIAL = path.join(ROOT, 'submodules/language-tools/packages/svelte2tsx/index.js');
const SVELTE_PKG = path.join(ROOT, 'submodules/svelte/packages/svelte/package.json');

// svelte2tsx `require('svelte/compiler')` at runtime, and its parse behaviour
// (and therefore which syntax it accepts) depends entirely on that svelte's
// VERSION. The corpus is only a fair oracle when the official tool parses with
// the SAME svelte major rsvelte mirrors (submodules/svelte) — otherwise an
// older svelte (e.g. the v4 dev-dep) rejects `{@render}`, `{#each ...}`
// without `as`, etc., and every Svelte-5 component is spuriously flagged as an
// error-mismatch. Resolve svelte from svelte2tsx's own location and assert the
// majors agree, failing loudly rather than silently producing a bogus oracle.
function assertSvelteMajorMatches() {
	const submoduleVersion = JSON.parse(fs.readFileSync(SVELTE_PKG, 'utf8')).version;
	const required = createRequire(OFFICIAL);
	const resolvedVersion = required('svelte/compiler').VERSION;
	const major = (v) => String(v).split('.')[0];
	if (major(resolvedVersion) !== major(submoduleVersion)) {
		console.error(
			`[s2t-compile] svelte version mismatch: official svelte2tsx resolves svelte@${resolvedVersion}, ` +
				`but rsvelte mirrors svelte@${submoduleVersion}. The oracle would parse with the wrong svelte ` +
				`major. Pin svelte2tsx's svelte to the submodule version, e.g.:\n` +
				`  (cd submodules/language-tools && pnpm --filter svelte2tsx add -D svelte@${submoduleVersion})`
		);
		process.exit(1);
	}
	return { resolvedVersion, submoduleVersion };
}

const args = process.argv.slice(2);
function argValue(name, fallback) {
	const i = args.indexOf(name);
	return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const FILTER = argValue('--filter', null);
const BINDING = path.resolve(ROOT, argValue('--binding', '.corpus-cache/rsvelte.node'));

// svelte2tsx only converts components; module entries are out of scope.
const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS, 'manifest.json'), 'utf8')).filter(
	(e) => e.kind === 'component' && (!FILTER || e.id.includes(FILTER))
);

// Detect a TypeScript <script> so both tools receive the identical `isTsFile`
// hint. svelte2tsx also infers this from the lang attribute, but passing it
// explicitly keeps the two sides aligned even for preprocessed-looking input.
function isTsFile(source) {
	return /<script\b[^>]*\blang\s*=\s*(["'])(ts|typescript)\1/i.test(source);
}

// ---------------------------------------------------------------------------
// worker mode: convert manifest[start..end) and print `IDX <i>` before each
// entry so the parent can pinpoint a crash.
// ---------------------------------------------------------------------------

if (args.includes('--worker')) {
	const start = Number(argValue('--start', '0'));
	const end = Number(argValue('--end', String(manifest.length)));

	const require = createRequire(import.meta.url);
	const { svelte2tsx } = require(OFFICIAL);
	const rsvelte = require(BINDING);

	const errorInfo = (e) => {
		const message = String(e?.message ?? e);
		return { message: message.split('\n')[0] };
	};

	function convertOne(impl, source, id, ts) {
		const options = { filename: id, isTsFile: ts, mode: 'ts', namespace: 'html', version: '5' };
		try {
			return { code: impl(source, options).code ?? '' };
		} catch (e) {
			return { error: errorInfo(e) };
		}
	}

	function writeOutputs(baseDir, id, result) {
		const dir = path.join(baseDir, id);
		fs.mkdirSync(dir, { recursive: true });
		if (result.error) {
			fs.writeFileSync(path.join(dir, 'error.json'), JSON.stringify(result.error, null, '\t') + '\n');
		} else {
			fs.writeFileSync(path.join(dir, 'index.tsx'), result.code);
		}
	}

	for (let i = start; i < end; i++) {
		const { id } = manifest[i];
		console.log(`IDX ${i}`);
		const source = fs.readFileSync(path.join(CORPUS, 'sources', id), 'utf8');
		const ts = isTsFile(source);
		writeOutputs(EXPECTED, id, convertOne((s, o) => svelte2tsx(s, o), source, id, ts));
		writeOutputs(ACTUAL, id, convertOne((s, o) => rsvelte.svelte2tsx(s, o), source, id, ts));
	}
	process.exit(0);
}

// ---------------------------------------------------------------------------
// parent mode
// ---------------------------------------------------------------------------

if (!fs.existsSync(BINDING)) {
	console.error(`[s2t-compile] rsvelte NAPI binding missing at ${BINDING}`);
	console.error('  build: cargo build --release --features napi --lib');
	console.error('  stage: cp target/release/librsvelte_core.{dylib,so} .corpus-cache/rsvelte.node');
	process.exit(1);
}
if (!fs.existsSync(OFFICIAL)) {
	console.error(`[s2t-compile] official svelte2tsx missing at ${OFFICIAL}`);
	console.error('  build: (cd submodules/language-tools && pnpm install --frozen-lockfile && pnpm --filter svelte2tsx build)');
	process.exit(1);
}
const { resolvedVersion, submoduleVersion } = assertSvelteMajorMatches();
console.log(`[s2t-compile] official svelte2tsx parses with svelte@${resolvedVersion} (rsvelte mirrors svelte@${submoduleVersion})`);

if (!FILTER) {
	fs.rmSync(EXPECTED, { recursive: true, force: true });
	fs.rmSync(ACTUAL, { recursive: true, force: true });
}

const JOBS = Number(argValue('--jobs', String(Math.max(2, Math.min(8, os.cpus().length - 2)))));
const startedAt = Date.now();
const panics = [];

function recordPanic(i) {
	const { id } = manifest[i];
	panics.push(id);
	const dir = path.join(ACTUAL, id);
	fs.mkdirSync(dir, { recursive: true });
	const err = { message: 'rsvelte svelte2tsx panicked (process aborted)' };
	fs.writeFileSync(path.join(dir, 'error.json'), JSON.stringify(err, null, '\t') + '\n');
}

function runRange(start, end) {
	return new Promise((resolve, reject) => {
		if (start >= end) return resolve();
		const child = spawn(
			process.execPath,
			[
				fileURLToPath(import.meta.url),
				'--worker',
				'--start',
				String(start),
				'--end',
				String(end),
				'--binding',
				BINDING,
				...(FILTER ? ['--filter', FILTER] : []),
			],
			{ stdio: ['ignore', 'pipe', 'inherit'] }
		);
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
			console.error(`[s2t-compile] worker crashed (${signal ?? code}) on ${manifest[last]?.id}`);
			recordPanic(last);
			runRange(last + 1, end).then(resolve, reject);
		});
		child.on('error', reject);
	});
}

const shard = Math.ceil(manifest.length / JOBS);
const ranges = [];
for (let s = 0; s < manifest.length; s += shard) ranges.push([s, Math.min(s + shard, manifest.length)]);

console.log(`[s2t-compile] ${manifest.length} component entries across ${ranges.length} workers…`);
await Promise.all(ranges.map(([s, e]) => runRange(s, e)));

if (panics.length) {
	console.error(`[s2t-compile] ${panics.length} entries PANICKED in rsvelte:`);
	for (const id of panics.slice(0, 20)) console.error(`  - ${id}`);
}
console.log(`[s2t-compile] done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
