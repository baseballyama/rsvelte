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
			// Oracles run or load from their installed path or are named in reports, and the CLI's
			// tests link a project's Tailwind CSS sorter from here, not imported.
			ignoreDependencies: [
				'svelte-check',
				'svelte-language-server',
				'vue-tsc',
				'prettier-plugin-tailwindcss',
				'tailwindcss',
			],
		},
		'apps/cli': {
			// The command of the npm package and the lookup the VS Code extension imports from a
			// project, which a release copies there.
			entry: ['launcher.js', 'program.js'],
		},
		'apps/rsvelte': {
			// crates/hosts/node's test runs them with the addon it builds, not a package script.
			entry: ['bin.js', 'compiler.test.ts', 'command.test.ts'],
		},
		'apps/vscode': {
			// The extension host loads the bundle of the first, and VS Code the bundle of the last.
			entry: ['src/extension.ts', 'test/editor/suite.ts'],
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
	// SvelteKit writes the tsconfig the site extends into node_modules/$app, which no package
	// provides, and knip cannot ignore it as a dependency because `$app` is no package name.
	ignoreIssues: { 'apps/site/tsconfig.json': ['unlisted'] },
	// System programs the measurement tools run.
	ignoreBinaries: ['valgrind', 'cg_annotate', 'cc', 'clang', 'perf'],
} satisfies KnipConfig;
