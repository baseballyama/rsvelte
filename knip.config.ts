import type { KnipConfig } from 'knip';

export default {
	workspaces: {
		'.': {
			entry: ['crates/hosts/configuration_loading/src/node_server.ts', '.claude/skills/*/*.ts'],
			project: ['crates/hosts/configuration_loading/src/*.ts', '.claude/skills/**/*.ts'],
			// The root has no Svelte app; the site workspace does.
			svelte: false,
		},
		'apps/site': {
			entry: ['scripts/*.ts'],
			// The Rust tool that builds the playground's WebAssembly, and its output, which only the
			// site jobs build.
			ignoreBinaries: ['wasm-pack'],
			ignoreUnresolved: [/^#generated\/wasm\//],
		},
		'tools/oracle': {
			// Loaded by URL into a browser, a worker or a child process, not imported.
			entry: ['behaviour/{browser-runner,client,server,worker}.ts'],
			project: ['**/*.{ts,svelte,vue}', '!behaviour/tests/**'],
			// Oracles run from their installed path or named in reports, and the CLI's tests link
			// a project's Tailwind CSS sorter from here, not imported.
			ignoreDependencies: ['svelte-check', 'vue-tsc', 'prettier-plugin-tailwindcss', 'tailwindcss'],
		},
		'apps/cli': {
			// The command of the npm package, which a release copies there, not an import.
			entry: ['launcher.js'],
		},
		'apps/rsvelte': {
			// crates/hosts/node's test runs it with the addon it builds, not a package script.
			entry: ['compiler.test.ts'],
		},
		'tools/writing': {
			// The spelling rule loads the dictionary by its language name.
			ignoreDependencies: ['dictionary-en'],
		},
		'tools/performance': {
			entry: ['workloads/*/*.ts'],
			// The arms of the official tools require the packages tools/oracle installs.
			ignoreDependencies: [
				'eslint',
				'eslint-plugin-svelte',
				'svelte-eslint-parser',
				'@typescript-eslint/parser',
				'globals',
				'prettier',
				'prettier-plugin-svelte',
			],
		},
	},
	// System programs the measurement tools run.
	ignoreBinaries: ['valgrind', 'cg_annotate', 'cc', 'clang', 'perf'],
} satisfies KnipConfig;
