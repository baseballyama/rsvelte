// The arm packages of a workload that times this tree against the old port. Each arm is a package
// outside every workspace. All arms get the workload's harness, the same pinned crates and one
// release profile, so they differ only in the libraries. Each takes its tree's lockfile and
// crates.io patches, so the libraries build as in their own workspace.
import fs from 'node:fs';
import path from 'node:path';

type Arm = {
	name: 'main' | 'experimental';
	/** The checkout whose lockfile and patches the arm takes. */
	tree: string;
	/** The arm's `main.rs`, next to the workload's `harness.rs`. */
	source: string;
	dependencies: string[];
};

type Workload = {
	/** The directory of `harness.rs` and the arms' sources. */
	here: string;
	/** Names each arm's package `<workload>-arm-<arm>`, directory `<workload>-<arm>` and binary `<workload>-<arm>-arm`. */
	workload: string;
	/** The crates every arm pins, one dependency line each. */
	shared: string[];
	arms(main: string, root: string): Arm[];
};

const profile = `[profile.release]
opt-level = 3
lto = "fat"
codegen-units = 1
panic = "unwind"
debug = "line-tables-only"`;

/** `relative` inside `tree`, as a TOML string. */
export const crate = (tree: string, relative: string) => JSON.stringify(path.join(tree, relative));

function patches(manifest: string): string {
	const text = fs.readFileSync(manifest, 'utf8');
	const start = text.indexOf('[patch.crates-io]');
	if (start === -1) return '';
	const next = text.slice(start + 1).search(/^\[/m);
	return next === -1 ? text.slice(start) : text.slice(start, start + 1 + next);
}

/** Writes the arms for `arms.ts <main checkout> <output directory>` and prints their directories. */
export function writeArmPackages(workload: Workload, args: string[]): void {
	const [mainCheckout, outputDirectory] = args;
	if (!mainCheckout || !outputDirectory)
		throw new Error('expected <main checkout> <output directory>');
	const root = path.resolve(import.meta.dirname, '../../..');
	const output = path.resolve(outputDirectory);
	const directories: string[] = [];
	for (const arm of workload.arms(path.resolve(mainCheckout), root)) {
		const name = `${workload.workload}-${arm.name}`;
		const directory = path.join(output, name);
		fs.mkdirSync(path.join(directory, 'src'), { recursive: true });
		const manifest = [
			'[package]',
			`name = "${workload.workload}-arm-${arm.name}"`,
			'version = "0.0.0"',
			'edition = "2024"',
			'publish = false',
			'',
			'[[bin]]',
			`name = "${name}-arm"`,
			'path = "src/main.rs"',
			'',
			'[workspace]',
			'',
			'[dependencies]',
			...workload.shared,
			...arm.dependencies,
			'',
			profile,
			'',
			patches(path.join(arm.tree, 'Cargo.toml')),
		].join('\n');
		fs.writeFileSync(path.join(directory, 'Cargo.toml'), manifest.trimEnd() + '\n');
		fs.copyFileSync(path.join(arm.tree, 'Cargo.lock'), path.join(directory, 'Cargo.lock'));
		fs.copyFileSync(path.join(workload.here, arm.source), path.join(directory, 'src/main.rs'));
		fs.copyFileSync(path.join(workload.here, 'harness.rs'), path.join(directory, 'src/harness.rs'));
		directories.push(directory);
	}
	process.stdout.write(directories.join('\n') + '\n');
}
