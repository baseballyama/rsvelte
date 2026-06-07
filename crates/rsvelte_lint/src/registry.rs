//! The built-in native rule set.
//!
//! Wave 1 ships a small seed of pure-syntactic rules to exercise the engine;
//! the bulk of day-one coverage comes from the validator wrap
//! ([`validator`](crate::validator)), not from these.

use crate::rule::Rule;
use crate::rules::{no_at_html_tags::NoAtHtmlTags, require_each_key::RequireEachKey};

/// Construct the full set of native rules.
pub fn all_rules() -> Vec<Box<dyn Rule>> {
    vec![Box::new(NoAtHtmlTags), Box::new(RequireEachKey)]
}
