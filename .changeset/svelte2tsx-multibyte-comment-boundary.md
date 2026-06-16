---
"@rsvelte/svelte2tsx": patch
---

Fix a panic in svelte2tsx when a declaration is immediately preceded by a
multi-byte character (e.g. a `─` box-drawing char in a `// ── … ──` comment
banner). `leading_jsdoc_comment` probed the block-comment terminator by slicing
`&source[p - 2..p]`, which lands mid-char and panics on a non-char-boundary
index; in the wasm playground this surfaced as a bare `unreachable` trap. The
terminator is now tested with `source[..p].ends_with("*/")`.
