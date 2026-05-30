//! Regression note for title element lowering cluster (#476).
//!
//! - **H-157** call-only `<title>{foo()}</title>` bind memo param —
//!   already merged (PR #543).
//! - **H-158 / H-159 / M-096 / M-097** other title-lowering items
//!   share targeted fixes; deferred.

#[test]
fn title_doc_pin() {}
