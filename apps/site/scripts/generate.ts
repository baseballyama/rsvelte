// Builds everything the site reads but does not commit into generated/ (ignored by Git):
// the kernel's WebAssembly bindings, the emitter samples and the layer figure's data.
// Run from apps/site: `node scripts/generate.ts`. dev, test, check and build run it first.

import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const site = path.resolve(import.meta.dirname, '..');
const root = path.resolve(site, '../..');
const out = path.join(site, 'generated');
rmSync(out, { recursive: true, force: true });

const run = (command: string, args: string[]) =>
	execFileSync(command, args, {
		cwd: root,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'inherit'],
	});

run('wasm-pack', [
	'build',
	'crates/hosts/browser',
	'--out-dir',
	path.join(out, 'wasm/kernel'),
	'--out-name',
	'rsvelte_kernel_browser',
	'--target',
	'web',
	'--release',
]);

const rev = run('git', ['rev-parse', 'HEAD']).trim();
// Untracked files (test outputs) cannot change what cargo builds; tracked edits can.
const dirty =
	run('git', ['status', '--porcelain', '--untracked-files=no', '--', 'crates']).trim() !== '';
const examples = ['export_site_source_maps', 'export_site_layers'];
run('cargo', [
	'build',
	'-q',
	'--release',
	'-p',
	'rsvelte_command_line',
	...examples.flatMap((e) => ['--example', e]),
]);
const example = (name: string, args: string[]) =>
	run(path.join(root, 'target/release/examples', name), args);

const samples = [
	{
		name: 'counter',
		fixture: 'crates/languages/svelte/compile/tests/fixtures/rsvelte/counter/input.svelte',
		file: 'Counter.svelte',
	},
];
mkdirSync(path.join(out, 'emit'), { recursive: true });
const tmp = mkdtempSync(path.join(tmpdir(), 'rsvelte-site-'));
for (const s of samples) {
	const input = path.join(tmp, s.file);
	copyFileSync(path.join(root, s.fixture), input);
	for (const target of ['client', 'server']) {
		const data = {
			...JSON.parse(example('export_site_source_maps', [input, target])),
			fixture: s.fixture,
			file: s.file,
			target,
			rev,
			dirty,
		};
		writeFileSync(
			path.join(out, 'emit', `${s.name}-${target}.json`),
			JSON.stringify(data, null, '\t') + '\n',
		);
	}
}
rmSync(tmp, { recursive: true });

mkdirSync(path.join(out, 'layers'), { recursive: true });
writeFileSync(
	path.join(out, 'layers/Toolbar.json'),
	example('export_site_layers', [path.join(site, 'src/lib/data/layers/Toolbar.svelte.txt')]),
);
console.log(
	`generated/ from ${rev.slice(0, 10)}${dirty ? ' with uncommitted changes in crates/' : ''}`,
);
