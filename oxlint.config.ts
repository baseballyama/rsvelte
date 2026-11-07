import { defineConfig } from 'oxlint';

export default defineConfig({
	plugins: ['typescript', 'unicorn', 'oxc', 'import', 'node', 'promise'],
	categories: { correctness: 'error', suspicious: 'error', perf: 'error' },
	env: { node: true, browser: true, es2026: true },
	rules: {
		// Stylesheets are imported for their side effect.
		'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
	},
	ignorePatterns: [
		'corpus/**',
		'crates/**/tests/**',
		'tools/oracle/behaviour/tests/**',
		'**/vendor/**',
		'**/generated/**',
		// Text that a compiler embeds in its output byte for byte (include_str!).
		'crates/languages/svelte/compile_vapor/src/compilation/**/*.js',
		'crates/languages/svelte/typescript_projection/projection.d.ts',
	],
});
