// Stand-in for SvelteKit's generated `$types.d.ts` (normally produced by
// `svelte-kit sync`, not run by this fixture harness). A plain sibling file
// resolves `import('./$types.js')` directly — no `rootDirs` bridge needed.
export type PageLoadEvent = { params: Record<string, never> };
export type PageLoad = (event: PageLoadEvent) => unknown;
export type EntryGenerator = () =>
	| Array<Record<string, string>>
	| Promise<Array<Record<string, string>>>;
