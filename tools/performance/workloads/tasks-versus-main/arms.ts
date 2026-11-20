// `arms.ts <main checkout> <output directory>`: writes the two arm packages, `tasks-main` and
// `tasks-experimental`, which differ only in the libraries.
import { crate, writeArmPackages } from '../arm-packages.ts';

writeArmPackages(
	{
		here: import.meta.dirname,
		workload: 'tasks',
		shared: ['libc = "=0.2.191"'],
		arms: (main, root) => [
			{
				name: 'main',
				tree: main,
				source: 'main.rs',
				dependencies: [
					`rsvelte_core = { path = ${crate(main, 'crates/rsvelte_core')}, default-features = false, features = ["parallel"] }`,
					`rsvelte_formatter = { path = ${crate(main, 'crates/rsvelte_formatter')} }`,
				],
			},
			{
				name: 'experimental',
				tree: root,
				source: 'experimental.rs',
				dependencies: [
					`rsvelte_kernel = { path = ${crate(root, 'crates/language_independent/kernel')} }`,
					`rsvelte_svelte_syntax = { path = ${crate(root, 'crates/languages/svelte/syntax')} }`,
					`rsvelte_svelte_compile = { path = ${crate(root, 'crates/languages/svelte/compile')} }`,
					`rsvelte_svelte_format = { path = ${crate(root, 'crates/languages/svelte/format')} }`,
				],
			},
		],
	},
	process.argv.slice(2),
);
