// Smoke test for the npm entry point (bin/svelte-check.cjs), not for
// rsvelte-check's diagnostics themselves — those are covered by
// crates/rsvelte_check's own tests and by the corpus-compat.yml parity gate.
// This only proves the JS launcher correctly resolves and execs the native
// binary and passes its output/exit code straight through: #1897 Layer 4
// noted apps/npm/svelte-check/bin/svelte-check.cjs had zero tests.
//
// The launcher normally resolves a platform-specific `@rsvelte/svelte-check-*`
// optional dependency; here it's redirected at a locally `cargo build`-ed
// binary via RSVELTE_CHECK_BIN (see bin/svelte-check.cjs).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../../../..');
const CLI = path.join(here, '../bin/svelte-check.cjs');
const TSC = path.join(here, 'ts-toolchain/node_modules/.bin/tsc');

/** Mirrors scripts/compat-corpus/check-verify.mjs's findBinary(). */
function findNativeBinary() {
	for (const profile of ['release', 'debug']) {
		const p = path.join(ROOT, 'target', profile, 'svelte_check');
		if (existsSync(p)) return p;
	}
	throw new Error(
		'svelte_check binary not found; run `cargo build -p rsvelte_check --bin svelte_check` (or --release) first'
	);
}

function findTsc() {
	if (!existsSync(TSC)) {
		throw new Error(`isolated tsc not found at ${TSC}; run \`node test/setup-ts-toolchain.mjs\` first`);
	}
	return TSC;
}

function run(cwd, args, env = {}) {
	const bin = findNativeBinary();
	try {
		const stdout = execFileSync(process.execPath, [CLI, ...args], {
			cwd,
			encoding: 'utf8',
			env: { ...process.env, RSVELTE_CHECK_BIN: bin, ...env }
		});
		return { status: 0, stdout };
	} catch (err) {
		// A diagnostic-bearing run exits non-zero; stdout still carries the report.
		if (err.stdout === undefined) throw err;
		return { status: err.status ?? 1, stdout: err.stdout };
	}
}

function makeCleanProject() {
	const dir = mkdtempSync(path.join(os.tmpdir(), 'rsvelte-check-smoke-clean-'));
	mkdirSync(path.join(dir, 'src'), { recursive: true });
	writeFileSync(path.join(dir, 'src/App.svelte'), '<script>\n\tlet count = 0;\n</script>\n\n<p>{count}</p>\n');
	return dir;
}

function makeTypeErrorProject() {
	const dir = mkdtempSync(path.join(os.tmpdir(), 'rsvelte-check-smoke-terr-'));
	mkdirSync(path.join(dir, 'src'), { recursive: true });
	writeFileSync(
		path.join(dir, 'src/Bad.svelte'),
		'<script lang="ts">\n\tconst count: number = \'not a number\';\n</script>\n\n<p>{count}</p>\n'
	);
	writeFileSync(
		path.join(dir, 'tsconfig.json'),
		JSON.stringify(
			{
				compilerOptions: {
					target: 'esnext',
					module: 'esnext',
					moduleResolution: 'bundler',
					strict: true,
					skipLibCheck: true,
					noEmit: true
				},
				include: ['src/**/*.ts', 'src/**/*.svelte']
			},
			null,
			'\t'
		)
	);
	return dir;
}

test('(a) exits 0 and prints the human-verbose summary for a clean project', () => {
	const dir = makeCleanProject();
	try {
		const { status, stdout } = run(dir, ['--workspace', '.', '--no-type-check']);
		assert.equal(status, 0, stdout);
		assert.match(stdout, /svelte-check found 0 errors and 0 warnings in 1 file/);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('(b) --output machine-verbose emits epoch-prefixed START/COMPLETED lines', () => {
	const dir = makeCleanProject();
	try {
		const { status, stdout } = run(dir, [
			'--workspace',
			'.',
			'--no-type-check',
			'--output',
			'machine-verbose'
		]);
		assert.equal(status, 0, stdout);
		const lines = stdout.trim().split('\n');
		assert.ok(lines.length >= 2, `expected at least a START and a COMPLETED line:\n${stdout}`);
		for (const line of lines) {
			assert.match(line, /^\d+ /, `line missing epoch-ms prefix: ${line}`);
		}
		assert.match(lines[0], /^\d+ START "/);
		assert.match(lines.at(-1), /^\d+ COMPLETED \d+ FILES \d+ ERRORS \d+ WARNINGS \d+ FILES_WITH_PROBLEMS$/);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test('(c) an intentional TypeScript type error causes a non-zero exit', () => {
	const dir = makeTypeErrorProject();
	try {
		const { status, stdout } = run(dir, ['--workspace', '.', '--tsconfig', 'tsconfig.json'], {
			TSGO_BIN: findTsc()
		});
		assert.notEqual(status, 0, stdout);
		assert.match(stdout, /svelte-check found [1-9]\d* errors?/, stdout);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
