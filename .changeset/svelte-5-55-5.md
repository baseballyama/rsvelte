---
"@rsvelte/compiler": patch
---

Bump target Svelte to **5.55.5**. No compiler-side commits in the range. The new `runtime-runes/derived-dep-set-while-rendering` fixture exposes a pre-existing SSR rsvelte gap (we wrap a bare-identifier `$derived(IDENT)` arg in a `() => IDENT()` thunk when upstream emits the bare `IDENT`); skipped pending a `wrap_derived_reads` carve-out for `$derived(IDENT)` arguments.
