---
"@rsvelte/compiler": patch
---

Phase-3 output codegen is now AST-based on both sides (output byte-identical).
Server SSR switched to the pure-AST `server/ast` pipeline and the legacy text
generator (`build.rs`/`bridge.rs`/text `server/visitors/`/`ServerCodeGenerator`,
~32k lines) was deleted. Client CSR now defaults to `js_ast::to_oxc` →
`rsvelte_esrap`, with the handwritten string printer kept only as a fallback for
comment-bearing / unsupported-node programs. `to_oxc` learned to parse
`Raw`/`RawMapped` and unwrap `Spanned`, sourcemaps route through esrap
`print_with_map`, and a new `PrintOptions.keep_empty_statements` flag preserves
empty-statement parity for the client path. Validated byte-exact across runtime,
compiler_fixtures, ssr, sourcemaps, real_world, and the compatibility report;
corpus baseline shrank 120 → 67 with no regressions.
