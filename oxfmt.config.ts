import { defineConfig } from 'oxfmt';

export default defineConfig({
	useTabs: true,
	singleQuote: true,
	printWidth: 100,
	// Quoted keys keep protocol field names out of the site's code-name check.
	quoteProps: 'preserve',
	svelte: true,
	overrides: [{ files: ['*.md', '*.yml', '*.yaml', '*.toml'], options: { useTabs: false } }],
	ignorePatterns: [
		// Inputs and expected outputs; their bytes are the test.
		'corpus/**',
		'crates/**/tests/**',
		'tools/oracle/behaviour/tests/**',
		'apps/site/src/lib/data/**',
		// Text that a compiler embeds in its output byte for byte (include_str!).
		'crates/bridges/svelte_to_vue_vapor/src/compilation/**/*.js',
		'crates/languages/svelte/typescript_projection/projection.d.ts',
		'**/vendor/**',
		// A skill copied from another project, kept as published.
		'.claude/skills/humanizer/**',
	],
});
