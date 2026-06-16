---
---

Internal: add the type-aware lint path (`svelte/no-unused-props` and
`svelte/no-navigation-without-resolve`) on a `TypeBackend` seam, backed by a
corsa/`tsgo` checker in the out-of-workspace `rsvelte_lint_types` crate, plus
svelte2tsx forward span→TSX mapping. Also native-gates the source-scan meta
rules so the wasm playground build compiles again. No published package is
affected (`rsvelte_lint` is not released), so this changeset bumps nothing.
