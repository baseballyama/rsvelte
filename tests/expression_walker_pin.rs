//! Regression note for expression walker cluster (#469).
//!
//! - **H-069** `js_expr_has_await` recursion through `Chain` / `Spanned` —
//!   already merged (PR #537).
//! - **H-070 / M-038 / M-090** other walker variant coverage — share the
//!   walker audit the issue itself recommends; deferred.

#[test]
fn walker_doc_pin() {}
