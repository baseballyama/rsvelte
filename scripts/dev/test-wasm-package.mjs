#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const temp = mkdtempSync(join(tmpdir(), 'rsvelte-wasm-package-'));
function run(command, args, cwd) {
	const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
	assert.equal(result.status, 0, `${command}: ${result.error ?? result.stderr}\n${result.stdout}`);
	return result.stdout;
}
try {
	const [pack] = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', temp], join(root, 'pkg')));
	const packageDir = join(temp, 'node_modules/@rsvelte/compiler');
	mkdirSync(packageDir, { recursive: true });
	run('tar', ['-xzf', join(temp, pack.filename), '--strip-components=1', '-C', packageDir], temp);
	const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json')));
	assert.equal(manifest.name, '@rsvelte/compiler');
	assert.ok(pack.files.some(({ path }) => path === 'playground/rsvelte_lint_bg.wasm'));
	copyFileSync(join(root, 'apps/npm/oxlint-plugin/src/wasm.js'), join(temp, 'oxlint-wasm.mjs'));
	copyFileSync(join(root, 'apps/npm/svelte2tsx/index.js'), join(temp, 'svelte2tsx.mjs'));
	writeFileSync(join(temp, 'probe.mjs'), `
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as compiler from '@rsvelte/compiler';
import * as playground from '@rsvelte/compiler/playground';
import { loadWasmEngine } from './oxlint-wasm.mjs';
import { svelte2tsx } from './svelte2tsx.mjs';
const require = createRequire(import.meta.url);
compiler.initSync({ module: readFileSync(require.resolve('@rsvelte/compiler/wasm')) });
playground.initSync({ module: readFileSync(require.resolve('@rsvelte/compiler/playground/wasm')) });
assert.equal(compiler.lint, undefined);
assert.equal(compiler.svelte2tsx, undefined);
assert.equal(typeof playground.lint, 'function');
assert.equal(typeof playground.svelte2tsx, 'function');
assert.ok(JSON.parse(compiler.compile('<h1>hello</h1>', {})).js.code.includes('hello'));
assert.ok(JSON.parse(compiler.compileModule('export const value = 1;', {})).js.code.includes('value'));
assert.ok(JSON.parse(playground.svelte2tsx('<h1>hello</h1>', '{}')).success);
assert.ok(svelte2tsx('<script>export let value;</script><h1>{value}</h1>', { filename: 'Hello.svelte' }).code.includes('value'));
const engine = await loadWasmEngine();
assert.ok(JSON.parse(engine.lint('<script>let unused = 1;</script><p>hi</p>', 'Unused.svelte')).length > 0);
assert.equal(compiler.version(), ${JSON.stringify(manifest.version)});
console.log('PASS: packed npm default, /wasm, /playground and /playground/wasm resolve and execute.');
`);
	process.stdout.write(run(process.execPath, ['probe.mjs'], temp));
	console.log(JSON.stringify({ package: pack.name, version: pack.version, files: pack.files.length, packedBytes: pack.size }));
} finally {
	rmSync(temp, { recursive: true, force: true });
}
