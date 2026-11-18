// `arms.ts <main checkout> <output directory>`: writes the two arm packages, `main` and
// `experimental`, each outside every workspace. Both get the same harness, allocator crates and
// release profile, so they differ only in the lint library. Each takes its tree's lockfile, and
// the `main` arm also takes main's crates.io patches, so the libraries build as in their own
// workspace.
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

// The same in both arms: one exact version of each crate the harness uses, and one profile.
const shared = `libc = "=0.2.191"
mimalloc = "=0.1.52"`;
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
			`rsvelte_lint = { path = ${JSON.stringify(path.join(main, 'crates/rsvelte_lint'))}, default-features = false, features = ["native"] }`,
			`rsvelte_core = { path = ${JSON.stringify(path.join(main, 'crates/rsvelte_core'))}, default-features = false }`,
		],
		patches: patches(path.join(main, 'Cargo.toml')),
	},
	{
		name: 'experimental',
		tree: root,
		source: 'experimental.rs',
		dependencies: [
			`rsvelte_svelte_lint = { path = ${JSON.stringify(path.join(root, 'crates/languages/svelte/lint'))} }`,
			`rsvelte_kernel = { path = ${JSON.stringify(path.join(root, 'crates/language_independent/kernel'))} }`,
		],
		patches: patches(path.join(root, 'Cargo.toml')),
	},
];

for (const arm of arms) {
	const directory = path.join(output, arm.name);
	fs.mkdirSync(path.join(directory, 'src'), { recursive: true });
	const manifest = [
		'[package]',
		`name = "lint-arm-${arm.name}"`,
		'version = "0.0.0"',
		'edition = "2024"',
		'publish = false',
		'',
		'[[bin]]',
		`name = "${arm.name}-arm"`,
		'path = "src/main.rs"',
		'',
		'[workspace]',
		'',
		'[dependencies]',
		shared,
		...arm.dependencies,
		'',
		profile,
		'',
		arm.patches,
	].join('\n');
	fs.writeFileSync(path.join(directory, 'Cargo.toml'), manifest.trimEnd() + '\n');
	fs.copyFileSync(path.join(arm.tree, 'Cargo.lock'), path.join(directory, 'Cargo.lock'));
	fs.copyFileSync(path.join(here, arm.source), path.join(directory, 'src/main.rs'));
	fs.copyFileSync(path.join(here, 'harness.rs'), path.join(directory, 'src/harness.rs'));
}
process.stdout.write(arms.map((arm) => path.join(output, arm.name)).join('\n') + '\n');
