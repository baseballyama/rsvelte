# eslint-plugin-svelte issues

Cases whose expected output is a bug in eslint-plugin-svelte. Each is listed in
`upstream_deviations.json`; rsvelte reports what is correct.

## `svelte/valid-compile`: a block holding only a `svelte-ignore` comment reports `block_empty`

- Case: `valid-compile/invalid/invalid-svelte-ignore03-input.svelte`
- Upstream reports `Empty block` (`block_empty`) at 2:30 and 14:30, on `{#await …}` blocks whose
  pending branch holds only `<!-- svelte-ignore … -->`.
- Correct: no `block_empty`. `svelte compile` on the file does not warn, because the branch holds a
  comment besides whitespace. Upstream replaces every `svelte-ignore` comment with spaces before it
  compiles (`buildStrippedText` in `shared/svelte-compile-warns/index.ts`), so the compiler sees a
  branch of whitespace alone. Blanking the comments to apply them itself changes what the compiler
  warns about.
