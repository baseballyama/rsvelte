//! Regression note for attribute shorthand / expression fast-path cluster
//! (#475).
//!
//! - **H-153** attribute shorthand `{…}` must be a bare identifier — already
//!   merged (PR #542).
//! - **H-154 / H-155 / H-156 / M-095** other items share targeted fast-path
//!   robustness fixes; deferred.

#[test]
fn attr_shorthand_doc_pin() {}
