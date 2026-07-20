#!/usr/bin/env node
// E2E test for @rsvelte/oxlint-plugin.
//
// Runs the *real* oxlint CLI over `.svelte` fixtures with the plugin enabled,
// exercising BOTH engine paths:
//   - native (`.node` from @rsvelte/lint-<triple>) — the default, must be used
//     on a supported platform (asserted here on darwin-arm64);
//   - wasm (@rsvelte/compiler) — forced via `RSVELTE_OXLINT_ENGINE=wasm`, must
//     produce byte-identical diagnostics.
// Also cross-checks against a direct engine lint and reports a native-vs-wasm
// micro-benchmark (informational only — no timing assertion).
//
// Prereqs: `pnpm run build:wasm:core` (wasm), `pnpm run build:lint-native`
// (native .node), and `oxlint` installed. Wire-up mirrors `test:vps`.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const pluginDir = resolve(repoRoot, 'apps/npm/oxlint-plugin');
const pluginEntry = join(pluginDir, 'index.js');
const recommended = join(pluginDir, 'recommended.json');

const require = createRequire(import.meta.url);

function findOxlintBin() {
	try {
		const pkgJson = require.resolve('oxlint/package.json', { paths: [pluginDir, repoRoot] });
		return resolve(dirname(pkgJson), 'bin/oxlint');
	} catch {
		return null;
	}
}

const FIXTURES = {
	'ScriptRule.svelte': `<script>\n  let count = 1;\n</script>\n\n<p>{count}</p>\n`,
	'TemplateRule.svelte': `<script>\n  const html = '<b>hi</b>';\n</script>\n\n{@html html}\n`,
	'Scriptless.svelte': `<img src="a.png">\n<div>{@html unsafe}</div>\n`,
};

let failures = 0;
function check(name, cond, detail) {
	if (cond) {
		console.log(`  ok   ${name}`);
	} else {
		failures += 1;
		console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
	}
}

function codeOf(diag) {
	const m = /^svelte\((.+)\)$/.exec(diag.code ?? '');
	return m ? m[1] : null;
}

// Run oxlint over `dir` with an optional forced engine; return { report, stderr }.
function runOxlint(oxlint, configPath, dir, engine) {
	const env = { ...process.env, RSVELTE_OXLINT_DEBUG: '1' };
	if (engine) env.RSVELTE_OXLINT_ENGINE = engine;
	const res = spawnSync(oxlint, ['-c', configPath, '-f', 'json', '.'], {
		cwd: dir,
		encoding: 'utf8',
		env,
	});
	let report = { diagnostics: [] };
	try {
		report = JSON.parse(res.stdout);
	} catch {
		/* leave empty */
	}
	return { report, stderr: res.stderr ?? '' };
}

// A stable, comparable view of the svelte diagnostics for one file.
function svelteDiags(report, file) {
	return (report.diagnostics ?? [])
		.filter((d) => (d.filename ?? '').endsWith(file) && codeOf(d))
		.map((d) => ({
			code: codeOf(d),
			message: d.message,
			line: d.labels?.[0]?.span?.line,
			column: d.labels?.[0]?.span?.column,
		}))
		.sort((a, b) => (a.code + a.message).localeCompare(b.code + b.message));
}

async function main() {
	const oxlint = findOxlintBin();
	if (!oxlint) {
		console.error(
			'oxlint is not installed. Add it as a devDependency of @rsvelte/oxlint-plugin and run `pnpm install`.',
		);
		process.exit(1);
	}

	const dir = mkdtempSync(join(tmpdir(), 'rsvelte-oxlint-'));
	try {
		for (const [name, src] of Object.entries(FIXTURES)) writeFileSync(join(dir, name), src);
		const configPath = join(dir, '.oxlintrc.json');
		writeFileSync(configPath, JSON.stringify({ jsPlugins: [pluginEntry], extends: [recommended] }, null, 2));

		// ── Native path (default engine) ──────────────────────────────────────
		console.log('\nNative engine (default):');
		const native = runOxlint(oxlint, configPath, dir);
		check(
			'oxlint used the native engine',
			/\[@rsvelte\/oxlint-plugin\] engine=native/.test(native.stderr),
			native.stderr.trim().split('\n').slice(-1)[0],
		);
		{
			const s = svelteDiags(native.report, 'ScriptRule.svelte');
			const preferConst = s.find((d) => d.code === 'prefer-const');
			check('surfaces svelte/prefer-const', !!preferConst);
			check(
				'in-script diagnostic mapped to 2:7',
				preferConst?.line === 2 && preferConst?.column === 7,
				`got ${preferConst?.line}:${preferConst?.column}`,
			);
			const t = svelteDiags(native.report, 'TemplateRule.svelte');
			check('surfaces svelte/no-at-html-tags (markup)', t.some((d) => d.code === 'no-at-html-tags'));
			const sl = svelteDiags(native.report, 'Scriptless.svelte');
			check('scriptless file surfaces nothing (documented limitation)', sl.length === 0, `got ${sl.length}`);
		}

		// ── wasm path (forced) ────────────────────────────────────────────────
		console.log('\nWasm engine (RSVELTE_OXLINT_ENGINE=wasm):');
		const wasm = runOxlint(oxlint, configPath, dir, 'wasm');
		check(
			'oxlint used the wasm engine',
			/\[@rsvelte\/oxlint-plugin\] engine=wasm/.test(wasm.stderr),
			wasm.stderr.trim().split('\n').slice(-1)[0],
		);
		for (const file of Object.keys(FIXTURES)) {
			const a = JSON.stringify(svelteDiags(native.report, file));
			const b = JSON.stringify(svelteDiags(wasm.report, file));
			check(`native and wasm produce identical diagnostics for ${file}`, a === b, `\n    native=${a}\n    wasm=${b}`);
		}

		// ── Cross-check against a direct engine lint ──────────────────────────
		const { lintSource } = await import(pathToFileURL(join(pluginDir, 'src/engine.js')).href);
		check(
			'direct engine agrees on prefer-const location',
			lintSource(FIXTURES['ScriptRule.svelte'], join(dir, 'ScriptRule.svelte')).some(
				(d) => d.code === 'svelte/prefer-const' && d.line === 2 && d.column === 6,
			),
		);

		// ── Micro-benchmark: native vs wasm over a batch (informational) ──────
		await bench();
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}

	console.log('');
	if (failures > 0) {
		console.error(`${failures} check(s) failed.`);
		process.exit(1);
	}
	console.log('All oxlint-plugin E2E checks passed.');
}

async function bench() {
	console.log('\nMicro-benchmark (native vs wasm, informational):');
	const { loadNativeEngine } = await import(pathToFileURL(join(pluginDir, 'src/native.js')).href);
	const { loadWasmEngine } = await import(pathToFileURL(join(pluginDir, 'src/wasm.js')).href);
	const native = loadNativeEngine();
	const wasm = await loadWasmEngine();
	if (!native) {
		console.log('  (native engine unavailable on this platform — skipping bench)');
		return;
	}

	const N = 60;
	const files = [];
	for (let i = 0; i < N; i += 1) {
		files.push([
			`Bench${i}.svelte`,
			`<script>\n  let a = ${i};\n  const b = a * 2;\n  function f(x) { return x + b; }\n</script>\n\n{#each [1,2,3] as n}\n  <div class="row" role="button">{@html f(n)}</div>\n{/each}\n<img src="x.png">\n<style>\n  .row { color: red; }\n  .unused { color: blue; }\n</style>\n`,
		]);
	}

	const time = (fn) => {
		const t0 = performance.now();
		for (let iter = 0; iter < 5; iter += 1) for (const [name, src] of files) fn(src, name);
		return (performance.now() - t0) / (5 * N);
	};
	// Warm up (JIT + wasm).
	time((s, f) => native.binding.lint(s, f));
	time((s, f) => wasm.lint(s, f));

	const nativeMs = time((s, f) => native.binding.lint(s, f));
	const wasmMs = time((s, f) => wasm.lint(s, f));
	console.log(`  native: ${nativeMs.toFixed(3)} ms/file`);
	console.log(`  wasm:   ${wasmMs.toFixed(3)} ms/file`);
	console.log(`  speedup: ${(wasmMs / nativeMs).toFixed(2)}x (native over wasm)`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
