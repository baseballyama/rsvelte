// Stand-in for SvelteKit's generated `$types.d.ts` (normally produced by
// `svelte-kit sync`, not run by this fixture harness). A plain sibling file
// resolves `import('./$types.js')` directly — no `rootDirs` bridge needed.
export type RequestEvent = { params: Record<string, never>; request: Request };
