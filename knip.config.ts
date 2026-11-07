import type { KnipConfig } from 'knip';

export default {
	workspaces: {
		'.': {
			entry: ['crates/hosts/config/src/node_server.ts', '.claude/skills/*/*.ts'],
			project: ['crates/hosts/config/src/*.ts', '.claude/skills/**/*.ts'],
			// The root has no Svelte app; the site workspace does.
			svelte: false,
		},
		'apps/site': {
			entry: ['scripts/*.ts'],
			// wasm-pack's output, which only the site job builds.
			ignoreUnresolved: [/^#generated\/wasm\//],
		},
		'tools/oracle': {
			// Loaded by URL into a browser, a worker or a child process, not imported.
			entry: ['behaviour/{browser-runner,client,server,worker}.ts'],
			project: ['**/*.{ts,svelte,vue}', '!behaviour/tests/**'],
			// Oracles run from their installed path or named in reports, not imported.
			ignoreDependencies: ['svelte-check', 'vue-tsc'],
		},
		'tools/performance': {
			entry: ['workloads/*/*.ts'],
			// The svelte-lint workload's oracle requires the packages tools/oracle installs.
			ignoreDependencies: ['eslint', 'eslint-plugin-svelte', '@typescript-eslint/parser'],
		},
	},
	// System programs the measurement tools run.
	ignoreBinaries: ['valgrind', 'cg_annotate', 'cc', 'clang', 'perf'],
} satisfies KnipConfig;
