# P2 — prop-read rewriting repeatedly scans and reallocates whole expressions

Category: compiler performance

Evidence: `transform_prop_reads_in_expr` loops over every prop and, on each matching name, rebuilds `Vec<char>`, byte offsets, a scan index, and a new `String` for the entire evolving expression (`crates/rsvelte_core/src/compiler/phases/3_transform/client/props_transforms.rs:183-221`).

Impact: compile time and peak allocation scale with expression length × number of props; large components with many exported props amplify repeated UTF-8 decoding and copying.

Remediation: collect identifier spans once with OXC/typed AST and rewrite all relevant props in one ordered pass.

Acceptance: benchmarks spanning 1/10/100 props and 1 KiB–1 MiB expressions show near-linear traversal in expression size, with output equality retained.
