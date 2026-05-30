//! Regression note for actions/transitions/animations cluster (#473).
//!
//! - **H-146 / M-040** empty `transition:`/`in:`/`out:` names emit
//!   `directive_missing_name` — already merged (PR #541).
//! - **H-143..H-145 / H-147 / M-039 / M-041 / M-091** other directive
//!   parse/validation items deferred.

#[test]
fn directives_doc_pin() {}
