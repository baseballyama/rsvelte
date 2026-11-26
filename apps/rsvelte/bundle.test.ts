// rsvelte/compiler bundled for a browser runs the WebAssembly module, and a server build leaves it
// to Node.js. generated/wasm/ holds the module (`node scripts/generate.ts --dev`); CI's package job
// builds it and runs this file.
// oxlint-disable-next-line import/no-unassigned-import -- it lets `fetch` read the bundles' files
import './browser.ts';

import assert from 'node:assert/strict';
import {
	copyFileSync,
	cpSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { pathToFileURL } from 'node:url';

import { build as esbuild } from 'esbuild';
import { build as vite } from 'vite';

import * as rsvelte from '@rsvelte-experimental/rsvelte/compiler';

const SOURCE = '<p>{1 + 1}</p>';

/**
 * An app that imports the package as a user's app does: the files the package publishes, in its
 * node_modules. A linked package would be bundled into a server build as the app's own code.
 */
const app = mkdtempSync(join(tmpdir(), 'rsvelte-bundle-'));
after(() => rmSync(app, { recursive: true, force: true }));
const installed = join(app, 'node_modules/@rsvelte-experimental/rsvelte');
const { files } = JSON.parse(readFileSync(join(import.meta.dirname, 'package.json'), 'utf8'));
for (const file of [...files, 'package.json']) {
	cpSync(join(import.meta.dirname, file), join(installed, file), { recursive: true });
}
// Its dependencies, as a package manager installs them beside it.
symlinkSync(join(import.meta.dirname, 'node_modules'), join(installed, 'node_modules'), 'dir');
writeFileSync(join(app, 'package.json'), '{ "type": "module" }');
writeFileSync(join(app, 'index.html'), '<script type="module" src="./main.js"></script>');
writeFileSync(
	join(app, 'main.js'),
	`import { compile } from '@rsvelte-experimental/rsvelte/compiler';
globalThis.compiled = compile(${JSON.stringify(SOURCE)}, { filename: 'App.svelte' }).js.code;`,
);

/** What the bundle at `file` compiled. */
async function compiled(file: string) {
	const global = globalThis as { compiled?: string };
	delete global.compiled;
	await import(pathToFileURL(file).href);
	return global.compiled;
}

const expected = rsvelte.compile(SOURCE, { filename: 'App.svelte' }).js.code;

test('Vite bundles the WebAssembly module for a browser and emits the module beside the code', async () => {
	const out = join(app, 'vite');
	await vite({
		root: app,
		logLevel: 'silent',
		configFile: false,
		// Node.js imports the bundle from its file, not from a server's root.
		base: './',
		// The polyfill preloads through `document`, which Node.js has not.
		build: { outDir: out, modulePreload: { polyfill: false } },
	});
	const assets = readdirSync(join(out, 'assets'));
	assert.ok(
		assets.some((name) => name.endsWith('.wasm')),
		`Vite emits the module: ${assets}`,
	);
	const code = assets.find((name) => name.endsWith('.js'));
	assert.ok(code);
	assert.equal(await compiled(join(out, 'assets', code)), expected);
});

test('esbuild bundles the WebAssembly module for a browser', async () => {
	const out = join(app, 'esbuild');
	await esbuild({
		entryPoints: [join(app, 'main.js')],
		bundle: true,
		format: 'esm',
		platform: 'browser',
		outdir: out,
		logLevel: 'silent',
	});
	// esbuild leaves `new URL('…', import.meta.url)` as it is, so the app copies the module.
	copyFileSync(join(installed, 'generated/wasm/rsvelte_bg.wasm'), join(out, 'rsvelte_bg.wasm'));
	assert.equal(await compiled(join(out, 'main.js')), expected);
});

test("Vite's server build leaves the package to Node.js", async () => {
	const out = join(app, 'server');
	await vite({
		root: app,
		logLevel: 'silent',
		configFile: false,
		build: { outDir: out, ssr: 'main.js' },
	});
	assert.equal(await compiled(join(out, 'main.js')), expected);
});
