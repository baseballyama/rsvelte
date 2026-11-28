// Whether rsvelte offers TypeScript's features in components, which the Svelte extension offers too.

/** What `rsvelte.typescript` says. */
export type Setting = 'auto' | 'on' | 'off';

/** The arguments after `lsp`: with the Svelte extension, `auto` leaves the features to it. */
export function typescriptArguments(setting: Setting, svelteExtension: boolean): string[] {
	const offered = setting === 'on' || (setting === 'auto' && !svelteExtension);
	return offered ? [] : ['--no-typescript'];
}
