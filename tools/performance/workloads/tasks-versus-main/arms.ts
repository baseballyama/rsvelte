// `arms.ts <main checkout> <output directory>`: writes the two arm packages, `tasks-main` and
// `tasks-experimental`, each outside every workspace. Both get the same harness and release
// profile, so they differ only in the libraries. Each takes its tree's lockfile, and the `main`
// arm also takes main's crates.io patches, so the libraries build as in their own workspace.
import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;
const root = path.resolve(here, '../../../..');
const [mainCheckout, outputDirectory] = process.argv.slice(2);
if (!mainCheckout || !outputDirectory)
	throw new Error('expected <main checkout> <output directory>');
const main = path.resolve(mainCheckout);
const output = path.resolve(outputDirectory);

const patches = (manifest: string): string => {
	const text = fs.readFileSync(manifest, 'utf8');
	const start = text.indexOf('[patch.crates-io]');
	if (start === -1) return '';
	const next = text.slice(start + 1).search(/^\[/m);
	return next === -1 ? text.slice(start) : text.slice(start, start + 1 + next);
};
const at = (tree: string, crate: string) => JSON.stringify(path.join(tree, crate));

// The same in both arms, and as `lint-versus-main` builds its arms.
const profile = `[profile.release]
opt-level = 3
lto = "fat"
codegen-units = 1
panic = "unwind"
debug = "line-tables-only"`;

const arms = [
	{
		name: 'main',
		tree: main,
		source: 'main.rs',
		dependencies: [
			`rsvelte_core = { path = ${at(main, 'crates/rsvelte_core')}, default-features = false, features = ["parallel"] }`,
			`rsvelte_formatter = { path = ${at(main, 'crates/rsvelte_formatter')} }`,
		],
	},
	{
		name: 'experimental',
		tree: root,
		source: 'experimental.rs',
		dependencies: [
			`rsvelte_kernel = { path = ${at(root, 'crates/language_independent/kernel')} }`,
			`rsvelte_svelte_syntax = { path = ${at(root, 'crates/languages/svelte/syntax')} }`,
			`rsvelte_svelte_compile = { path = ${at(root, 'crates/languages/svelte/compile')} }`,
			`rsvelte_svelte_format = { path = ${at(root, 'crates/languages/svelte/format')} }`,
		],
	},
];

for (const arm of arms) {
	const directory = path.join(output, `tasks-${arm.name}`);
	fs.mkdirSync(path.join(directory, 'src'), { recursive: true });
	const manifest = [
		'[package]',
		`name = "tasks-arm-${arm.name}"`,
		'version = "0.0.0"',
		'edition = "2024"',
		'publish = false',
		'',
		'[[bin]]',
		`name = "tasks-${arm.name}-arm"`,
		'path = "src/main.rs"',
		'',
		'[workspace]',
		'',
		'[dependencies]',
		'libc = "=0.2.191"',
		...arm.dependencies,
		'',
		profile,
		'',
		patches(path.join(arm.tree, 'Cargo.toml')),
	].join('\n');
	fs.writeFileSync(path.join(directory, 'Cargo.toml'), manifest.trimEnd() + '\n');
	fs.copyFileSync(path.join(arm.tree, 'Cargo.lock'), path.join(directory, 'Cargo.lock'));
	fs.copyFileSync(path.join(here, arm.source), path.join(directory, 'src/main.rs'));
	fs.copyFileSync(path.join(here, 'harness.rs'), path.join(directory, 'src/harness.rs'));
}
process.stdout.write(arms.map((arm) => path.join(output, `tasks-${arm.name}`)).join('\n') + '\n');
