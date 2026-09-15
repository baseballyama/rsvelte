---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): drop diagnostics from the overlay epilogue instead of pinning them past the end of the file

A component calling `$props()` with neither destructuring nor an annotation
leaves `$$ComponentProps` undeclared in the generated overlay — upstream emits
the same thing — so `tsgo` reports `TS2304` on it. Upstream drops that
diagnostic; rsvelte's insertion test needed a mapped segment on both sides of
the gap and the epilogue has none after it, so the lower-bound lookup attributed
it to `<lines + 1>:1` of the author's file.
