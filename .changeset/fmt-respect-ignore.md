---
"@rsvelte/fmt": minor
---

Respect `.gitignore`, `.prettierignore`, and `.oxfmtrc` `ignorePatterns` when discovering `.svelte` files, matching `oxfmt` (which already honors them for the non-`.svelte` files it walks).

Previously the in-process Svelte walker only skipped a hardcoded set of directories (`node_modules`, `target`, `dist`, `build`, hidden dirs), so `.svelte` files excluded by these ignore sources — e.g. test fixtures listed in `.oxfmtrc` `ignorePatterns` — were still reformatted. The walker now uses the `ignore` crate with the same gitignore semantics as `oxfmt`, and `OxfmtConfig` parses `ignorePatterns`, so `rsvelte-fmt .` and `oxfmt .` skip exactly the same `.svelte` files.
