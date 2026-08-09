#!/usr/bin/env node
/**
 * Compile every corpus entry (see collect.mjs) with BOTH the official Svelte
 * compiler (from submodules/svelte) and rsvelte (NAPI binding), for every
 * target in targets.mjs (client = CSR, server = SSR, client-dev = CSR with
 * `dev: true`), writing the outputs to:
 *
 *   compatibility/expected/<id>/{client.js,server.js,client-dev.js,client.css,client-dev.css,error.json}
 *   compatibility/actual/<id>/{...same...}
 *
 * Files the OFFICIAL compiler rejects are error cases: rsvelte must reject
 * them too (error parity), tracked via error.json on both sides.
 *
 * Runs as a parent process that shards the manifest across worker child
 * processes. If a worker crashes (e.g. a Rust panic aborts the process), the
 * parent records the offending entry as a `panic` error on the rsvelte side
 * and resumes from the next entry, so one panic cannot kill the whole run.
 *
 * Usage: node scripts/compat-corpus/compile.mjs [--binding <path>] [--filter <substr>] [--jobs <n>] [--targets <keys>]
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { selectTargets } from './targets.mjs';
import { BYTES_PER_TARGET, DISK_HEADROOM, requireDiskSpace, readGeneration, requireGenerationUnchanged } from './artifacts.mjs';
import { assertOracleCompiles } from './oracle.mjs';
import { errorCode } from './error-code.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');
const EXPECTED = path.join(CORPUS, 'expected');
const ACTUAL = path.join(CORPUS, 'actual');

const args = process.argv.slice(2);
function argValue(name, fallback) {
	const i = args.indexOf(name);
	return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const FILTER = argValue('--filter', null);
const BINDING = path.resolve(ROOT, argValue('--binding', '.corpus-cache/rsvelte.node'));
const TARGETS = selectTargets(args);

const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS, 'manifest.json'), 'utf8')).filter(
	(e) => !FILTER || e.id.includes(FILTER)
);
// Captured before any work, re-asserted before reporting.
const generation = readGeneration(CORPUS);

// ---------------------------------------------------------------------------
// worker mode: compile manifest[start..end) and print `IDX <i>` before each
// entry so the parent can pinpoint a crash.
// ---------------------------------------------------------------------------

if (args.includes('--worker')) {
	const start = Number(argValue('--start', '0'));
	const end = Number(argValue('--end', String(manifest.length)));

	const require = createRequire(import.meta.url);
	const svelte = await import(
		path.join(ROOT, 'submodules/svelte/packages/svelte/src/compiler/index.js')
	);
	const rsvelte = require(BINDING);
	const esbuild = require('esbuild');

	// In production (Vite / SvelteKit), `.svelte.ts` modules are TS-stripped
	// by the bundler BEFORE the Svelte compiler sees them — `compileModule`
	// itself only parses plain JS and rejects raw TS. Mirror that pipeline so
	// the corpus exercises the real compile output instead of recording
	// js_parse_error parity for every TS module. We strip with esbuild as a
	// representative stripper (Vite ≤7 uses esbuild; Vite 8 strips with oxc /
	// rolldown — see scripts/compat-corpus/README.md). The stripped source
	// feeds BOTH compilers, so the parity verdict stays meaningful regardless
	// of the stripper. Falls back to the raw source when esbuild rejects the
	// file (both compilers then see identical input).
	//
	// What that verdict does NOT cover: esbuild removes all comments, so for
	// `.svelte.ts` entries neither compiler ever sees one. This is the narrower
	// of two reasons comment parity is ungated — verify.mjs's comparator ignores
	// comments for the WHOLE corpus regardless, so a comment-preserving stripper
	// here would buy no observability on its own. See the "AST equivalence" note
	// in verify.mjs.
	function prepareSource(id, source) {
		if (!id.endsWith('.svelte.ts')) return source;
		try {
			return esbuild.transformSync(source, { loader: 'ts' }).code;
		} catch {
			return source;
		}
	}

	// An error is compared as (code, message, start, end, frame) — see
	// verify.mjs. `message` is the first line only: everything after it is the
	// `https://svelte.dev/e/<code>` link, which restates the code.
	const errorInfo = (e) => {
		const message = String(e?.message ?? e);
		return {
			code: errorCode(e),
			message: message.split('\n')[0],
			line: e?.start?.line ?? null,
			column: e?.start?.column ?? null,
			endLine: e?.end?.line ?? null,
			endColumn: e?.end?.column ?? null,
			frame: e?.frame ?? null,
		};
	};

	function compileOne(compiler, kind, source, id, target) {
		const options = { generate: target.generate, dev: target.dev, filename: id };
		if (kind === 'component') options.css = 'external';
		try {
			const result =
				kind === 'component'
					? compiler.compile(source, options)
					: compiler.compileModule(source, options);
			return {
				js: result.js?.code ?? '',
				css: result.css?.code ?? null,
				warnings: normalizeWarnings(result.warnings),
			};
		} catch (e) {
			return { error: errorInfo(e) };
		}
	}

	// A warning is compared as (code, line, column). The message text is not
	// part of the contract — it is prose and upstream rewords it — but the
	// position is: editors and CLIs place a diagnostic from `start`. rsvelte
	// leaves `start` undefined at many emission sites, which is why position is
	// captured (and ratcheted) rather than dropped.
	function normalizeWarnings(warnings) {
		return (warnings ?? [])
			.map((w) => ({
				code: w.code ?? null,
				line: w.start?.line ?? null,
				column: w.start?.column ?? null,
			}))
			.sort(
				(a, b) =>
					String(a.code).localeCompare(String(b.code)) ||
					(a.line ?? -1) - (b.line ?? -1) ||
					(a.column ?? -1) - (b.column ?? -1),
			);
	}

	function compileAll(compiler, kind, source, id) {
		return TARGETS.map((target) => [target, compileOne(compiler, kind, source, id, target)]);
	}

	function writeOutputs(baseDir, id, results) {
		const dir = path.join(baseDir, id);
		fs.mkdirSync(dir, { recursive: true });
		const errors = {};
		const warnings = {};
		for (const [target, r] of results) {
			if (r.error) {
				errors[target.key] = r.error;
				continue;
			}
			fs.writeFileSync(path.join(dir, `${target.key}.js`), r.js);
			if (target.css && r.css != null) {
				fs.writeFileSync(path.join(dir, `${target.key}.css`), r.css);
			}
			// Only entries that actually warn get a file; absence means "compiled
			// with no warnings", which verify.mjs reads as the empty list.
			if (r.warnings.length) warnings[target.key] = r.warnings;
		}
		if (Object.keys(warnings).length) {
			fs.writeFileSync(path.join(dir, 'warnings.json'), JSON.stringify(warnings, null, '\t') + '\n');
		}
		if (Object.keys(errors).length) {
			fs.writeFileSync(path.join(dir, 'error.json'), JSON.stringify(errors, null, '\t') + '\n');
		}
	}

	for (let i = start; i < end; i++) {
		const { id, kind } = manifest[i];
		console.log(`IDX ${i}`);
		const source = prepareSource(id, fs.readFileSync(path.join(CORPUS, 'sources', id), 'utf8'));
		writeOutputs(EXPECTED, id, compileAll(svelte, kind, source, id));
		writeOutputs(ACTUAL, id, compileAll(rsvelte, kind, source, id));
	}
	process.exit(0);
}

// ---------------------------------------------------------------------------
// parent mode
// ---------------------------------------------------------------------------

if (!fs.existsSync(BINDING)) {
	console.error(`[compile] rsvelte NAPI binding missing at ${BINDING}`);
	console.error('  build: cargo build --release -p rsvelte_napi --lib');
	console.error('  stage: mkdir -p .corpus-cache && cp target/release/librsvelte_napi.{dylib,so} .corpus-cache/rsvelte.node.staging && mv .corpus-cache/rsvelte.node.staging .corpus-cache/rsvelte.node');
	process.exit(1);
}

// A full run always starts from a clean tree so removed corpus ids and stale
// error.json files cannot survive. A target-scoped run therefore leaves ONLY
// the selected targets on disk — it is for iterating on one target, not for
// feeding an unscoped verify.
if (!FILTER) {
	fs.rmSync(EXPECTED, { recursive: true, force: true });
	fs.rmSync(ACTUAL, { recursive: true, force: true });
}

// The workers are isolated so an rsvelte panic cannot end the run, which means
// an oracle that cannot even load is recorded as a per-entry rust_panic instead.
try {
	assertOracleCompiles(ROOT, 'compile');
} catch (e) {
	console.error(`\n${e.message}`);
	process.exit(2);
}

// After the wipe above, so the figure reflects the space this run really needs.
// ENOSPC halfway through leaves a half-written tree, and a half-written tree
// scores as `match` for every entry it never reached.
requireDiskSpace(
	(FILTER ? 0 : BYTES_PER_TARGET * TARGETS.length) + DISK_HEADROOM,
	'compile'
);

const JOBS = Number(argValue('--jobs', String(Math.max(2, Math.min(8, os.cpus().length - 2)))));
const startedAt = Date.now();
const panics = [];

function recordPanic(i) {
	const { id } = manifest[i];
	panics.push(id);
	// Official side may not have been written either — compile it in-process.
	const dir = path.join(ACTUAL, id);
	fs.mkdirSync(dir, { recursive: true });
	const err = { code: 'rust_panic', message: 'rsvelte compiler panicked (process aborted)' };
	const errors = Object.fromEntries(TARGETS.map((t) => [t.key, err]));
	fs.writeFileSync(path.join(dir, 'error.json'), JSON.stringify(errors, null, '\t') + '\n');
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
				'--targets',
				TARGETS.map((t) => t.key).join(','),
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
			// crashed while compiling manifest[last] — record + resume after it
			console.error(`[compile] worker crashed (${signal ?? code}) on ${manifest[last]?.id}`);
			recordPanic(last);
			runRange(last + 1, end).then(resolve, reject);
		});
		child.on('error', reject);
	});
}

const shard = Math.ceil(manifest.length / JOBS);
const ranges = [];
for (let s = 0; s < manifest.length; s += shard) ranges.push([s, Math.min(s + shard, manifest.length)]);

console.log(
	`[compile] ${manifest.length} entries × ${TARGETS.length} targets (${TARGETS.map((t) => t.key).join(', ')}) across ${ranges.length} workers…`
);
await Promise.all(ranges.map(([s, e]) => runRange(s, e)));

// The inputs this run compiled must still be the inputs on disk. A parallel
// clean that truncated them would otherwise leave a run that quietly compiled
// fewer entries and reported success.
requireGenerationUnchanged(CORPUS, generation, 'compile');

if (panics.length) {
	console.error(`[compile] ${panics.length} entries PANICKED in rsvelte:`);
	for (const id of panics.slice(0, 20)) console.error(`  - ${id}`);
}
console.log(`[compile] done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
