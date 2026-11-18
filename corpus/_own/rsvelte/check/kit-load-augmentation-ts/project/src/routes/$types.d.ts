// Stand-in for SvelteKit's generated `$types.d.ts` (normally produced by
// `svelte-kit sync`, not run by this fixture harness). A plain sibling file
// resolves `import('./$types.js')` directly — no `rootDirs` bridge needed.
export type PageLoadEvent = { params: { slug: string } };
export type PageLoad = (event: PageLoadEvent) => unknown;
export type PageServerLoadEvent = { params: { slug: string } };
export type PageServerLoad = (event: PageServerLoadEvent) => unknown;
// `+page.svelte`'s `data` prop is typed against this by svelte2tsx/rsvelte's
// own (separate) page-component augmentation, independent of `kit_file.rs`'s
// route-*file* augmentation this fixture targets — needed so official
// `svelte-check` doesn't also flag a missing `PageData` member.
export type PageData = Record<string, unknown>;
