//! Regression note for svelte2tsx parsing/inference cluster (#470).
//!
//! - **M-062** strip `?query` / `#hash` before path resolution — already
//!   merged (PR #538).
//! - **H-094** bare `<script module>` HMR recognition — already merged
//!   (PR #538).
//! - **H-090 / H-093 / M-013 / M-014 / M-063 / M-064** other parsing /
//!   inference items share the AST-driven svelte2tsx refactor; deferred.

#[test]
fn svelte2tsx_doc_pin() {}
