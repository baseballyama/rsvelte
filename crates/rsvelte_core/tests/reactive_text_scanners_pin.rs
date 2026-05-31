//! Regression note for reactive / props / bindable text scanners (#477).
//!
//! - **H-060** `let id=$props.id()` whitespace tolerance — already merged
//!   (PR #544).
//! - **H-061** `$bindable (x)` whitespace tolerance — already merged
//!   (PR #544).
//! - **H-062..H-065** other text-scanner items share the AST refactor;
//!   deferred.

#[test]
fn reactive_text_doc_pin() {}
