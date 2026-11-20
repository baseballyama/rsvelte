// `arms.ts <main checkout> <output directory>`: writes the two arm packages, `lint-main`
// and `lint-experimental`, which differ only in the lint library.
import { crate, writeArmPackages } from '../arm-packages.ts';

writeArmPackages(
	{
		here: import.meta.dirname,
		workload: 'lint',
		shared: ['libc = "=0.2.191"', 'mimalloc = "=0.1.52"'],
		arms: (main, root) => [
			{
				name: 'main',
				tree: main,
				source: 'main.rs',
				dependencies: [
					`rsvelte_lint = { path = ${crate(main, 'crates/rsvelte_lint')}, default-features = false, features = ["native"] }`,
					`rsvelte_core = { path = ${crate(main, 'crates/rsvelte_core')}, default-features = false }`,
				],
			},
			{
				name: 'experimental',
				tree: root,
				source: 'experimental.rs',
				dependencies: [
					`rsvelte_svelte_lint = { path = ${crate(root, 'crates/languages/svelte/lint')} }`,
					`rsvelte_kernel = { path = ${crate(root, 'crates/language_independent/kernel')} }`,
				],
			},
		],
	},
	process.argv.slice(2),
);
