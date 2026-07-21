---
"@rsvelte/compiler": patch
"@rsvelte/lint": patch
---

fix(wasm): enable reference-types in wasm-opt

Newer rustc/LLVM can emit a second wasm table (a reference-types externref table
alongside the funcref indirect-call table) for `wasm32-unknown-unknown`, which
`wasm-opt`'s default MVP feature set rejects with "Only 1 table definition allowed
in MVP". Whether the extra table appears depends on the rustc version CI resolves
that day, not on anything in this repo, so the wasm build could break without any
change here.

Passing `--enable-reference-types` lets wasm-opt parse and optimize it. The
`rsvelte_fmt_wasm` artifact shrinks ~1% as a result; `rsvelte_lint`'s is byte-identical.
