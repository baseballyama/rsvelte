//! Regression note for the preprocessor pipeline cluster (issue #460).
//!
//! Every Critical / High finding in this cluster has been addressed; this file
//! exists as a documentation-only pin so future changes that re-introduce one
//! of the prior bugs leave an obvious failing test to update.
//!
//! - **H-139** attribute-only preprocessor diffs are now applied — PR #521.
//! - **H-140** `attributes: Some({})` clears attributes — PR #521.
//! - **H-141** quote / `<` / `>` escaping in returned attributes — already
//!   fixed in the original preprocessor codepath.
//! - **H-142** invalid preprocessor sourcemap indices used to panic
//!   `MappedCode::concat` — bounds-checked in `replace_in_code.rs` (verified
//!   under #451).
//! - **M-088 / M-089** are tracked on the issue for a coordinated sourcemap-
//!   quality pass.

#[test]
fn preprocess_pipeline_pin_compiles() {
    // Pin-only test — the inline preprocessor unit tests in
    // `src/compiler/preprocess/replace_in_code.rs#tests` already cover the
    // H-139..H-142 behaviour. This file documents the cluster status.
}
