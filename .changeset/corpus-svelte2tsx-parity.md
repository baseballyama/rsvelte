---
"@rsvelte/svelte2tsx": patch
---

svelte2tsx output-parity (corpus): the compat-corpus now also checks svelte2tsx
TSX output against the official tool over every component source, and several
systematic port divergences are fixed:

- `derive_component_name` matches the official `classNameFromFilename` exactly
  (scule `pascalCase`/`splitByCase` + the JS `substr(-1)` last-char quirk).
- `__sveltets_*` component/instance variable names use the component's nesting
  depth (matching `computeDepth()`), reusing one number per depth instead of a
  per-name counter; names are `sanitizePropName`-cleaned before reversing.
- Runes-mode detection now matches official `isRunesMode()` — `$state` /
  `$derived` / `$effect` globals, `$props()`, explicit `<svelte:options runes>`,
  top-level await, and await in template expressions all select runes output
  (`__sveltets_2_fn_component`, `__sveltets_$$bindings(...)`).
