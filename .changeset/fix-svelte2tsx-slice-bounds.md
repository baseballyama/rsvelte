---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): bounds-check AST-offset source slices

The svelte2tsx transform sliced the original source by AST byte offsets in
dozens of places with `&source[start as usize..end as usize]` (often with a
defensive `.unwrap_or(0)` on an absent offset). When an offset pair is inverted
(`start > end`) or reaches past the source length — possible for lazily-parsed
or unresolved expressions whose `.start()`/`.end()` are unreliable — the raw
slice panics, aborting the whole compile instead of degrading gracefully.

Consolidate every such AST-offset slice through one helper,
`slice_src(source, start, end)`, which returns `source.get(start..end)` and
falls back to `""` on an inverted, out-of-bounds, or non-char-boundary range.
For any valid range this is exactly `&source[start..end]`, so the transform
output is byte-identical (verified against the full 253-fixture svelte2tsx
suite); only the panic paths change to an empty slice.
