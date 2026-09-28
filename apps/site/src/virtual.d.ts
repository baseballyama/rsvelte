declare module 'virtual:rsvelte-source' {
	export const modules: import('$lib/build/source-plugin').HighlightedModule[];
	/** HEAD of the repository at build time. */
	export const rev: string;
	/** Whether crates/ matched `rev` exactly, so line links to it are valid. */
	export const clean: boolean;
	export const crates: import('$lib/build/source-plugin').CrateSize[];
}
