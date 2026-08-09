# P2 — ESTree fallback printer silently replaces unknown nodes with a comment

Category: correctness / forward compatibility

Evidence: `EstreeGenerator::generate_node` handles a finite set of string node types and emits `/* unknown */` for everything else without returning an error (`crates/rsvelte_core/src/compiler/print/helpers.rs:116-180`). `expression_to_string` still routes typed expressions through JSON and this generator (`:759-797`).

Impact: a newly encountered OXC/ESTree node can disappear from generated code while compilation appears successful; the replacement is often parseable, so a syntax gate may not catch the semantic loss.

Remediation: use an exhaustive typed printer in production paths and make unsupported nodes a source-located hard error or explicitly counted fallback.

Acceptance: round-trip tests cover every supported expression kind and an injected unknown type cannot produce a successful compile result.
