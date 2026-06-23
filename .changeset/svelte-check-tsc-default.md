---
"@rsvelte/svelte-check": minor
---

svelte-check: type-check with `tsc` by default (previously only with `--tsgo`)

Running `rsvelte-check` without `--tsgo` used to skip TypeScript type-checking entirely, reporting only Svelte-side compile diagnostics — a silent no-op for type errors. Type-checking is now on by default and runs the stock `tsc` against the `.svelte` overlay. `--tsgo` switches the preferred backend to Microsoft's native `tsgo` (each falls back to the other; `$TSGO_BIN` still wins as an explicit override), and a new `--no-type-check` flag restores Svelte-only mode.
