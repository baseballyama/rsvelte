/**
 * An oxlint JS plugin that surfaces rsvelte's Svelte diagnostics (the native
 * eslint-plugin-svelte rule ports plus the compiler / validator / a11y warning
 * wrap) as oxlint rules under the `svelte/` namespace.
 *
 * Reference it from `.oxlintrc.json`:
 *
 * ```json
 * {
 *   "jsPlugins": ["@rsvelte/oxlint-plugin"],
 *   "extends": ["./node_modules/@rsvelte/oxlint-plugin/recommended.json"]
 * }
 * ```
 */
declare const plugin: {
	readonly meta: { readonly name: 'svelte' };
	/** One rule per rsvelte diagnostic id (the `svelte/` prefix is added by oxlint). */
	readonly rules: Record<string, unknown>;
};

export default plugin;
