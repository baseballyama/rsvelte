---
"@rsvelte/svelte-check": patch
---

Fix `rsvelte-check --output machine-verbose` (and the terser `machine`
format) diverging from upstream `svelte-check`: they were line-oriented text
with no diagnostic `code`, instead of upstream's one-`<epoch-ms> <JSON>`-
line-per-diagnostic shape (`type`/`filename`/`start`/`end`/`message`/`code`/
`source`, 0-indexed `start`/`end`), and were missing the bracketing `START`
/ `COMPLETED` lines. Drop-in consumers (editor integrations, CI annotators,
scripts keyed on `code`) can now parse rsvelte's machine output the same way
they parse upstream's. Fixes #1901.

Fix the overlay tsconfig synthesized for a `--tsconfig`-less run specifying
no `target`, which let tsgo/tsc fall back to the ES5 default lib — the
vendored shims themselves then failed to compile (`Cannot find name
'Iterable'`) before any user code was considered. The overlay now mirrors
official svelte-check's own default-compiler-options forcing: an unset
target becomes the latest (`ESNext`), and a target below ES2015 is bumped
up to ES2015; an already-modern target is left untouched. Fixes #1898.
