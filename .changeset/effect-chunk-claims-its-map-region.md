---
'@rsvelte/compiler': patch
---

Give a `$effect` chunk's source-map positions their source offsets back. `to_oxc.rs` claimed a chunk's comment-buffer region — the only thing that resolves a comment-space offset into the source — everywhere except the effect path, so any statement whose text contains `$effect` had its positions written into the map untranslated and landing past the end of the line they name. The guard is a substring scan, so those seven bytes inside a comment or a string literal did it to a component that uses no rune at all. Generated code is unchanged.
