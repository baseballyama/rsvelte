---
"@rsvelte/compiler": patch
---

wasm: add a compiler-only artifact and export `compileModule`

The published wasm was built from `rsvelte_lint_bindings`, so a caller that
only wants `compile()` also downloaded the lint engine and svelte2tsx. The
compiler surface now lives in its own crate, `rsvelte_compiler_wasm`, which
`pnpm run build:wasm:compiler` builds into `pkg-compiler/` — 10,895,004 bytes
against the playground module's 13,769,701, measured on the two artifacts.

The playground module is unchanged in content: it names the new crate, and
wasm-bindgen collects a linked crate's exports into whatever cdylib links it,
so `compile`, `compile_client`, `compile_server`, `parse_svelte`, `version`
and both result classes are still exported from `pkg/` alongside `lint*` and
`svelte2tsx`.

Both artifacts also gain `compileModule` for `.svelte.js` / `.svelte.ts`,
which was implemented in Rust and exported from N-API but not from wasm. Its
option surface is the one `compile` uses, because upstream declares every
component key on the module validator as a no-op.

Which wasm npm's `@rsvelte/compiler` ships is a separate decision and is not
changed here: dropping `lint` and `svelte2tsx` from a published package would
break every caller that imports them.
