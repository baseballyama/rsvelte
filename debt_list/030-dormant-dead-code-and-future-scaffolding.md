# P3 — dormant helpers and future migration scaffolding remain in production modules

Category: unnecessary code / readability

Evidence: whole utility modules suppress dead-code warnings (`1_parse/utils/fuzzymatch.rs`, `entities_data.rs`), client scope functions are retained for “upcoming” migrations (`3_transform/client/scope_analysis.rs:45,93`), and additional production helpers use local dead-code allowances (`class_body_ast.rs:39`, `bind_directive.rs:2247`, `expression_utils.rs:2005-2008`).

Impact: unused APIs obscure the live implementation, rot without coverage, lengthen builds/reviews, and make warnings less useful as a deletion signal.

Remediation: delete unreferenced scaffolding; if a near-term migration needs it, move it behind a feature/test module with an owner, issue, and executable test.

Acceptance: production compiler modules contain no unexplained dead-code allowances and `cargo clippy --all-targets --all-features -- -D warnings` remains clean.
