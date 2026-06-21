#!/usr/bin/env node
/**
 * Formatter parity stage of the corpus pipeline.
 *
 * Builds two output trees over every `.svelte` *component* entry in the corpus
 * manifest (real files + ```svelte markdown blocks, from both sveltejs/svelte
 * and sveltejs/svelte.dev):
 *
 *   compat/corpus/fmt/oracle/<id>   oxfmt with `svelte: true` (prettier-plugin-svelte
 *                                   for the Svelte structure + oxc for embedded JS/CSS)
 *   compat/corpus/fmt/actual/<id>   rsvelte-fmt (rsvelte_formatter for the structure,
 *                                   oxfmt for embedded <style>) — the exact same layering,
 *                                   so a diff isolates rsvelte's Svelte-structure formatting.
 *
 * Both pipelines format embedded JS/CSS with the same oxc engine, so any
 * surviving byte difference is a real Svelte-structure divergence. The
 * comparison + ratchet lives in fmt-verify.mjs.
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
 *   FMT_CORPUS_JOBS    parallel workers (default: cpus-2, clamped 2..8)
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compat/corpus');
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

function exec(bin, argv, stdin) {
	return new Promise((resolve) => {
		const child = execFile(bin, argv, { maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
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

function writeTree(dir, id, content) {
	const dest = path.join(dir, id);
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.writeFileSync(dest, content);
}

/** The .svelte basename oxfmt/rsvelte-fmt see as the stdin filename. */
function stdinName(id) {
	const base = path.basename(id);
	return base.endsWith('.svelte') ? base : 'input.svelte';
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
		await pool(components, async ({ id }) => {
			const source = fs.readFileSync(path.join(SOURCES, id), 'utf8');
			const res = await exec(OXFMT_BIN, ['-c', OXFMT_CONFIG, '--stdin-filepath', stdinName(id)], source);
			if (res.enoent) fail(`oxfmt not found at ${OXFMT_BIN}`);
			if (!res.ok) {
				skipList.push({ id, reason: oneLine(res.err) || 'oxfmt rejected' });
				return;
			}
			// oxfmt leaves an unparseable embedded <script>/<style> verbatim and
			// logs the error to stderr while exiting 0. Such a block is not valid,
			// formattable Svelte — exclude it rather than treat the unformatted
			// output as a parity target (mirrors generate-fmt-corpus.mjs).
			if (/error/i.test(res.stderr)) {
				skipList.push({ id, reason: `oxfmt stderr: ${oneLine(res.stderr)}` });
				return;
			}
			writeTree(ORACLE, id, res.out);
			includedSet.push(id);
		});
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
			console.log(`[fmt] actual: rsvelte-fmt over ${targets.length} components | ${JOBS} jobs`);
		}
		const errors = [];
		await pool(targets, async (id) => {
			const source = fs.readFileSync(path.join(SOURCES, id), 'utf8');
			const res = await exec(
				RSVELTE_FMT_BIN,
				['--stdin', '--stdin-filepath', stdinName(id), '-c', OXFMT_CONFIG, '--oxfmt-bin', OXFMT_BIN],
				source,
			);
			if (res.enoent) fail(`rsvelte-fmt not found at ${RSVELTE_FMT_BIN}`);
			if (!res.ok) {
				// A formatter error (parse failure / panic) is a real divergence:
				// write the raw source so fmt-verify records a mismatch, and note it.
				errors.push({ id, reason: oneLine(res.err) });
				writeTree(ACTUAL, id, source);
				return;
			}
			writeTree(ACTUAL, id, res.out);
		});
		if (errors.length) {
			console.log(`[fmt] actual: ${errors.length} rsvelte-fmt errors (recorded as mismatches):`);
			for (const e of errors.slice(0, 10)) console.log(`  - ${e.id}: ${e.reason}`);
		}
	}
}

main().catch((e) => fail(e.stack || String(e)));
