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

## `svelte/no-unused-svelte-ignore` and `svelte/valid-compile`: the last of several codes is dropped

- Case: none upstream; rsvelte's own
  `tests/cases/no-unused-svelte-ignore/invalid/last-code-without-separator`.
- Upstream reads a code only before a separator (`extractSvelteIgnore` in
  `shared/svelte-compile-warns/ignore-comment.ts` slices up to each match of `/\s*[\s,]\s*/`). With
  several codes and nothing after the last one, as in `<!-- svelte-ignore a b-->` or
  `// svelte-ignore a b` at the end of a line, the last code is never read. It neither ignores its
  warning nor is reported unused.
- Correct: every code is read. The compiler's own `extract_svelte_ignore` matches each word, the
  last one included. rsvelte reads the last code too, so in the case above it reports
  `export_let_unused` and `a11y_accesskey` as unused.
