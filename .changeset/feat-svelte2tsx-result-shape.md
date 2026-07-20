---
"@rsvelte/svelte2tsx": minor
"@rsvelte/compiler": patch
---

feat(svelte2tsx): result object matches upstream (`map` SourceMap, `exportedNames.has`, `events.getAll`)

The `svelte2tsx()` result now mirrors the official
[`svelte2tsx`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx)
`SvelteCompiledToTsx` shape:

- **`map`** is now a magic-string-style `SourceMap` **object** (`version`,
  `sources`, `sourcesContent`, `names`, `mappings`, plus `toString()` /
  `toUrl()`) instead of a JSON string. In `dts` mode it stays `null`.
- **`exportedNames`** now exposes `has(name): boolean` (upstream
  `IExportedNames`). The existing `props` / `all` arrays are kept as a
  backward-compatible rsvelte extension.
- **`events`** now exposes `getAll(): { name, type, doc? }[]` (upstream
  `ComponentEvents`, which is `@deprecated`) instead of a plain record. Types
  are approximated as `CustomEvent<detail>` / `CustomEvent<any>`; the optional
  `doc` (JSDoc) field is not populated.

The `map` string → object change folds into the same unreleased `0.2.0` as the
synchronous-API change, so it stays a single minor bump.
