#!/usr/bin/env node
/**
 * Debug helper: compile ONE corpus entry (or any .svelte / .svelte.(js|ts)
 * file) with both compilers and print a unified diff per target.
 *
 * Usage:
 *   node scripts/compat-corpus/one.mjs <corpus-id-or-file> [--target client|server] [--raw]
 *
 * <corpus-id> is a path under compat/corpus/sources/, e.g.
 *   svelte.dev/apps/svelte.dev/content/docs/svelte/02-runes/04-$effect.md/1.svelte
 *
 * --raw skips oxfmt normalization. Requires a staged NAPI binding at
 * .corpus-cache/rsvelte.node (cargo build --release --features napi --lib,
 * then cp target/release/librsvelte_core.dylib .corpus-cache/rsvelte.node).
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { stripBlankLines } from './normalize.mjs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compat/corpus');

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const targetArg = args.includes('--target') ? args[args.indexOf('--target') + 1] : null;
const RAW = args.includes('--raw');

if (!input) {
	console.error('usage: node scripts/compat-corpus/one.mjs <corpus-id-or-file> [--target client|server] [--raw]');
	process.exit(2);
}

let file = path.join(CORPUS, 'sources', input);
let id = input;
if (!fs.existsSync(file)) {
	file = path.resolve(input);
	id = path.relative(ROOT, file);
}
let source = fs.readFileSync(file, 'utf8');
const kind = /\.svelte\.(js|ts)$/.test(file) ? 'module' : 'component';
if (file.endsWith('.svelte.ts')) {
	// Mirror the production pipeline (see compile.mjs): TS is stripped by
	// esbuild before the Svelte compiler sees the module.
	try {
		source = require('esbuild').transformSync(source, { loader: 'ts' }).code;
	} catch {
		/* raw source for both sides */
	}
}

const svelte = await import(
	path.join(ROOT, 'submodules/svelte/packages/svelte/src/compiler/index.js')
);
const rsvelte = require(path.join(ROOT, '.corpus-cache/rsvelte.node'));

function compileOne(compiler, generate) {
	const options = { generate, dev: false, filename: id };
	if (kind === 'component') options.css = 'external';
	try {
		const r = kind === 'component' ? compiler.compile(source, options) : compiler.compileModule(source, options);
		return { js: r.js?.code ?? '', css: r.css?.code ?? null };
	} catch (e) {
		const message = String(e?.message ?? e);
		let code = e?.code ?? null;
		if (!code || code === 'GenericFailure') {
			const m = message.match(/svelte\.dev\/e\/([a-z0-9_]+)/) ?? message.match(/code: "([a-z0-9_]+)"/);
			if (m) code = m[1];
		}
		return { error: { code, message } };
	}
}

function fmt(code, name) {
	if (RAW) return code;
	const tmp = path.join(os.tmpdir(), `corpus-one-${process.pid}-${name}.js`);
	fs.writeFileSync(tmp, code);
	try {
		execFileSync('npx', ['oxfmt', '-c', path.join(CORPUS, '.oxfmtrc.json'), '--ignore-path', '/dev/null', tmp], { stdio: 'pipe' });
	} catch {
		/* unparsable: compare raw */
	}
	const out = fs.readFileSync(tmp, 'utf8');
	fs.unlinkSync(tmp);
	return stripBlankLines(out);
}

for (const target of targetArg ? [targetArg] : ['client', 'server']) {
	console.log(`\n========== ${target} ==========`);
	const e = compileOne(svelte, target);
	const a = compileOne(rsvelte, target);
	if (e.error || a.error) {
		console.log('expected:', e.error ? `ERROR ${e.error.code}: ${e.error.message.split('\n')[0]}` : 'compiles');
		console.log('actual:  ', a.error ? `ERROR ${a.error.code}: ${a.error.message.split('\n')[0]}` : 'compiles');
		continue;
	}
	const ef = fmt(e.js, 'e');
	const af = fmt(a.js, 'a');
	if (ef === af && (e.css ?? '') === (a.css ?? '')) {
		console.log('MATCH');
		continue;
	}
	if (ef !== af) {
		const tmpE = path.join(os.tmpdir(), `corpus-one-${process.pid}-exp.js`);
		const tmpA = path.join(os.tmpdir(), `corpus-one-${process.pid}-act.js`);
		fs.writeFileSync(tmpE, ef);
		fs.writeFileSync(tmpA, af);
		const d = spawnSync('diff', ['-u', tmpE, tmpA], { encoding: 'utf8' });
		console.log(d.stdout);
		fs.unlinkSync(tmpE);
		fs.unlinkSync(tmpA);
	}
	if ((e.css ?? '') !== (a.css ?? '')) {
		console.log('--- css expected\n' + e.css + '\n--- css actual\n' + a.css);
	}
}
