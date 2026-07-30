#!/usr/bin/env node
/**
 * Formatter parity stage of the corpus pipeline.
 *
 * Builds two output trees over every `.svelte` *component* entry in the corpus
 * manifest (real files + ```svelte markdown blocks, from both sveltejs/svelte
 * and sveltejs/svelte.dev):
 *
 *   compatibility/fmt/oracle/<id>   oxfmt with `svelte: true` (prettier-plugin-svelte
 *                                   for the Svelte structure + oxc for embedded JS/CSS)
 *   compatibility/fmt/actual/<id>   rsvelte-fmt (rsvelte_formatter for the structure,
 *                                   oxc for embedded JS/CSS)
 *
 * Both pipelines format embedded JS/CSS with the same oxc engine, so any
 * surviving byte difference is a real Svelte-structure divergence. The
 * comparison + ratchet lives in fmt-verify.mjs.
 *
 * The actual tree is formatted in one directory invocation. Native CSS parity
 * with oxfmt is covered separately, and keeping styles in-process avoids a
 * subprocess per component.
 *
 * The oracle depends only on (svelte sha, svelte.dev sha, oxfmt version, config
 * hash); it is cached and skipped on re-runs unless those change or `--force` is
 * passed. Only the `actual` tree is rebuilt every burn-down iteration (after a
 * formatter change). Restrict the (slower) `actual` rebuild to a subset with
 * `--only <file>` (newline-separated ids; e.g. the current known-failures) for
 * tight iteration.
 *
 * Usage:
 *   node scripts/compat-corpus/fmt.mjs                 # oracle (cached) + actual (all)
 *   node scripts/compat-corpus/fmt.mjs --oracle        # oracle only
 *   node scripts/compat-corpus/fmt.mjs --actual        # actual only (oracle must exist)
 *   node scripts/compat-corpus/fmt.mjs --actual --only ids.txt
 *   node scripts/compat-corpus/fmt.mjs --force         # force oracle regeneration
 *
 * Env:
 *   OXFMT_BIN          oxfmt launcher (default: node_modules/.bin/oxfmt)
 *   RSVELTE_FMT_BIN    rsvelte-fmt binary (default: target/release/rsvelte-fmt)
 *   FMT_CORPUS_JOBS    parallel oracle workers (default: cpus-2, clamped 2..8)
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');
const SOURCES = path.join(CORPUS, 'sources');
const FMT = path.join(CORPUS, 'fmt');
const ORACLE = path.join(FMT, 'oracle');
const ACTUAL = path.join(FMT, 'actual');
const META_PATH = path.join(FMT, 'meta.json');

const OXFMT_BIN = process.env.OXFMT_BIN || path.join(ROOT, 'node_modules/.bin/oxfmt');
const OXFMT_CONFIG = path.join(ROOT, 'scripts/fixtures/fmt-corpus.oxfmtrc.json');
const RSVELTE_FMT_BIN =
	process.env.RSVELTE_FMT_BIN || path.join(ROOT, 'target/release/rsvelte-fmt');

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY_ORACLE = args.includes('--oracle');
const ONLY_ACTUAL = args.includes('--actual');
const ONLY_FILE = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined;
const JOBS = Math.max(2, Math.min(8, Number(process.env.FMT_CORPUS_JOBS) || os.cpus().length - 2));
const ORACLE_BATCH_SIZE = 256;

function fail(msg) {
	console.error(`[fmt] ${msg}`);
	process.exit(1);
}

function gitSha(dir) {
	return new Promise((resolve) => {
		execFile('git', ['-C', dir, 'rev-parse', 'HEAD'], (err, stdout) =>
			resolve(err ? null : stdout.trim()),
		);
	});
}

function exec(bin, argv, stdin, options = {}) {
	return new Promise((resolve) => {
		const child = execFile(bin, argv, { maxBuffer: 64 * 1024 * 1024, ...options }, (err, stdout, stderr) => {
			if (err && err.code === 'ENOENT') resolve({ ok: false, enoent: true, err: err.message });
			else if (err) resolve({ ok: false, out: stdout, err: (stderr || err.message || '').trim() });
			else resolve({ ok: true, out: stdout, stderr: (stderr || '').trim() });
		});
		child.stdin.end(stdin ?? '');
	});
}

/** Run a worker over `items` with `JOBS`-way concurrency. */
async function pool(items, worker) {
	let next = 0;
	let done = 0;
	const total = items.length;
	const tick = () => {
		if (total >= 200 && done % 250 === 0) process.stderr.write(`\r[fmt]   ${done}/${total}`);
	};
	async function run() {
		while (next < items.length) {
			const i = next++;
			await worker(items[i], i);
			done++;
			tick();
		}
	}
	await Promise.all(Array.from({ length: Math.min(JOBS, total || 1) }, run));
	if (total >= 200) process.stderr.write(`\r[fmt]   ${total}/${total}\n`);
}

function oneLine(s) {
	return (s || '').replace(/\s+/g, ' ').trim().slice(0, 200);
}

function copyTreeFile(from, to, id) {
	const dest = path.join(to, id);
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.copyFileSync(path.join(from, id), dest);
}

function stdinName(id) {
	const base = path.basename(id);
	return base.endsWith('.svelte') ? base : 'input.svelte';
}

function chunks(items, size) {
	const result = [];
	for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
	return result;
}

function rejectedIds(diagnostic, stage, batch) {
	const batchSet = new Set(batch);
	const ids = new Set();
	for (const match of diagnostic.matchAll(/\[([^\]\r\n]+)\]/g)) {
		const id = path.relative(stage, match[1]);
		if (batchSet.has(id)) ids.add(id);
	}
	return ids;
}

async function main() {
	if (!fs.existsSync(path.join(CORPUS, 'manifest.json'))) {
		fail('manifest.json missing — run `node scripts/compat-corpus/collect.mjs` first');
	}
	const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS, 'manifest.json'), 'utf8'));
	const components = manifest.filter((e) => e.kind === 'component');

	const oxfmtVersion = (await exec(OXFMT_BIN, ['--version'])).out?.trim();
	if (!oxfmtVersion) fail(`cannot run oxfmt at ${OXFMT_BIN} — set OXFMT_BIN`);
	const configSrc = fs.readFileSync(OXFMT_CONFIG, 'utf8');
	const configHash = createHash('sha256').update(configSrc).digest('hex').slice(0, 16);
	const svelteSha = await gitSha(path.join(ROOT, 'submodules/svelte'));
	const svelteDevSha = await gitSha(path.join(ROOT, 'submodules/svelte.dev'));

	const wantMeta = { svelteSha, svelteDevSha, oxfmtVersion, configHash };
	const haveMeta = fs.existsSync(META_PATH)
		? JSON.parse(fs.readFileSync(META_PATH, 'utf8'))
		: null;
	const oracleFresh =
		haveMeta &&
		haveMeta.svelteSha === svelteSha &&
		haveMeta.svelteDevSha === svelteDevSha &&
		haveMeta.oxfmtVersion === oxfmtVersion &&
		haveMeta.configHash === configHash &&
		fs.existsSync(ORACLE);

	let included = haveMeta?.included ?? [];
	let skips = haveMeta?.skips ?? [];

	// ── Oracle (cached) ──────────────────────────────────────────────────
	if (!ONLY_ACTUAL && (FORCE || !oracleFresh)) {
		console.log(
			`[fmt] oracle: oxfmt ${oxfmtVersion} | config ${configHash} | ${components.length} components | ${JOBS} jobs`,
		);
		fs.rmSync(ORACLE, { recursive: true, force: true });
		const includedSet = [];
		const skipList = [];
		const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'oxfmt-corpus-'));
		try {
			const ids = components.map(({ id }) => id);
			for (const id of ids) copyTreeFile(SOURCES, stage, id);

			// Most files are valid, so format them in large batches. oxfmt reports
			// rejected paths; bisect only when a diagnostic lacks path metadata.
			async function formatBatch(batch, retry = false) {
				// oxfmt formats in place and is not idempotent for every input (prose
				// fill can move on a second pass), so a retried file must start from
				// its pristine source — otherwise its oracle silently depends on
				// which batch it landed in.
				if (retry) for (const id of batch) copyTreeFile(SOURCES, stage, id);
				const paths = batch.map((id) => path.join(stage, id));
				const res = await exec(OXFMT_BIN, ['-c', OXFMT_CONFIG, ...paths]);
				if (res.enoent) fail(`oxfmt not found at ${OXFMT_BIN}`);
				const error = !res.ok || /error/i.test(res.stderr);
				if (!error) {
					includedSet.push(...batch);
					return;
				}
				const diagnostic = res.err || res.stderr || '';
				const rejected = rejectedIds(diagnostic, stage, batch);
				if (rejected.size) {
					for (const id of rejected) {
						skipList.push({
							id,
							reason: oneLine(diagnostic).replaceAll(`${stage}${path.sep}`, ''),
						});
					}
					const remaining = batch.filter((id) => !rejected.has(id));
					if (remaining.length) await formatBatch(remaining, true);
					return;
				}
				if (batch.length === 1) {
					const reason = oneLine(diagnostic) || 'oxfmt rejected';
					skipList.push({ id: batch[0], reason });
					return;
				}
				const middle = Math.ceil(batch.length / 2);
				await formatBatch(batch.slice(0, middle), true);
				await formatBatch(batch.slice(middle), true);
			}

			await pool(chunks(ids, ORACLE_BATCH_SIZE), (batch) => formatBatch(batch));
			const stdinFallbacks = includedSet.filter((id) =>
				fs.readFileSync(path.join(SOURCES, id), 'utf8').includes('/** ('),
			);
			await pool(stdinFallbacks, async (id) => {
				// oxfmt attaches this parser-directed comment differently for
				// file arguments; preserve the established stdin oracle.
				const source = fs.readFileSync(path.join(SOURCES, id), 'utf8');
				const res = await exec(OXFMT_BIN, ['-c', OXFMT_CONFIG, '--stdin-filepath', stdinName(id)], source);
				if (res.ok) fs.writeFileSync(path.join(stage, id), res.out);
			});
			for (const id of includedSet) copyTreeFile(stage, ORACLE, id);
		} finally {
			fs.rmSync(stage, { recursive: true, force: true });
		}
		included = includedSet.sort();
		skips = skipList.sort((a, b) => a.id.localeCompare(b.id));
		fs.mkdirSync(FMT, { recursive: true });
		fs.writeFileSync(
			META_PATH,
			JSON.stringify({ ...wantMeta, generatedAt: new Date().toISOString(), total: components.length, included, skips }, null, '\t') + '\n',
		);
		console.log(`[fmt] oracle: ${included.length} included, ${skips.length} skipped (not valid/formattable svelte)`);
	} else if (!ONLY_ACTUAL) {
		console.log(`[fmt] oracle: up to date (${included.length} included) — use --force to regenerate`);
	}

	// ── Actual (rebuilt every iteration) ─────────────────────────────────
	if (!ONLY_ORACLE) {
		if (!fs.existsSync(RSVELTE_FMT_BIN)) {
			fail(`rsvelte-fmt not found at ${RSVELTE_FMT_BIN} — run \`cargo build --release -p rsvelte_fmt\` or set RSVELTE_FMT_BIN`);
		}
		let targets = included;
		if (ONLY_FILE) {
			const subset = new Set(
				fs.readFileSync(ONLY_FILE, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean),
			);
			targets = included.filter((id) => subset.has(id));
			console.log(`[fmt] actual: --only ${path.relative(ROOT, ONLY_FILE)} → ${targets.length} of ${included.length}`);
		} else {
			fs.rmSync(ACTUAL, { recursive: true, force: true });
			console.log(`[fmt] actual: rsvelte-fmt over ${targets.length} components`);
		}
		if (targets.length) {
			// Stage outside the repository because compatibility/fmt is gitignored,
			// and rsvelte-fmt intentionally honors gitignore during directory walks.
			const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-fmt-corpus-'));
			try {
				for (const id of targets) copyTreeFile(SOURCES, stage, id);
				const res = await exec(
					RSVELTE_FMT_BIN,
					// One directory invocation keeps markup, scripts, and styles in
					// process instead of starting rsvelte-fmt and oxfmt per file.
					['.', '-c', OXFMT_CONFIG, '--oxfmt-bin', OXFMT_BIN],
					undefined,
					{ cwd: stage },
				);
				if (res.enoent) fail(`rsvelte-fmt not found at ${RSVELTE_FMT_BIN}`);
				if (!res.ok) {
					// Per-file formatter errors leave those staged sources unchanged,
					// so copying the tree still records them as parity mismatches.
					console.log(`[fmt] actual: rsvelte-fmt reported errors (recorded as mismatches):`);
					const diagnostics = (res.err || '')
						.split('\n')
						.filter((line) => line.startsWith('rsvelte-fmt: ') && !line.includes(' formatted '));
					for (const line of diagnostics.slice(0, 10)) {
						console.log(`  ${oneLine(line.replaceAll(`${stage}${path.sep}`, ''))}`);
					}
					if (!diagnostics.length) console.log(`  ${oneLine(res.err) || 'unknown formatter error'}`);
				}
				for (const id of targets) copyTreeFile(stage, ACTUAL, id);
			} finally {
				fs.rmSync(stage, { recursive: true, force: true });
			}
		}
	}
}

main().catch((e) => fail(e.stack || String(e)));
