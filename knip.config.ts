import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	workspaces: {
		'.': {
			entry: ['crates/hosts/config/src/node_server.ts', '.claude/skills/*/*.ts'],
			project: ['crates/hosts/config/src/*.ts', '.claude/skills/**/*.ts'],
			// The root has no Svelte app; the site workspace does.
			svelte: false,
			sveltekit: false,
		},
		'apps/site': {
			entry: ['scripts/*.ts'],
			project: ['src/**/*.{ts,svelte,css}', 'scripts/**/*.ts'],
			svelte: { config: ['svelte.config.ts'] },
		},
		'tools/fixtures': {
			entry: [
				'svelte-entities.ts',
				'import-svelte-lint.ts',
				// Loaded by URL into a browser, a worker or a child process, not imported.
				'behaviour/browser-runner.ts',
				'behaviour/client.ts',
				'behaviour/server.ts',
				'behaviour/worker.ts',
				'**/*.test.ts',
			],
			project: ['**/*.{ts,svelte,vue}', '!behaviour/tests/**'],
			// Oracles run from their installed path or named in reports, not imported.
			ignoreDependencies: ['svelte-check', 'svelte-eslint-parser', 'vue-tsc'],
		},
		'tools/hashing': { entry: ['benchmark.ts', 'integration.ts'] },
		'tools/performance': {
			entry: ['macos-cycles.ts', 'linux.ts', 'workloads/*/*.ts', '*.test.ts'],
			// The svelte-lint workload's oracle requires the packages tools/fixtures installs.
			ignoreDependencies: ['eslint', 'eslint-plugin-svelte', '@typescript-eslint/parser'],
		},
		'tools/structure': { entry: ['*.test.ts'] },
	},
	// System programs the measurement tools run.
	ignoreBinaries: ['valgrind', 'cg_annotate', 'cc', 'clang', 'perf'],
};

export default config;
