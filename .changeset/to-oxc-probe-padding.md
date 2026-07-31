---
"@rsvelte/compiler": patch
---

Stop re-lexing the whole comment buffer for every comment-bearing chunk during client codegen. The buffer cursor grows with each chunk, so re-parsing `base`-long padding plus the chunk's own text made this step quadratic in generated code size. Parse behind a fixed one-byte pad instead and shift the resulting spans into place afterwards. Synthetic components with heavy comment usage see 2.6-7.9% less compile time; the real-world corpus (comments are comparatively rare there) is neutral.
