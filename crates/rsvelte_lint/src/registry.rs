//! The built-in native rule set.
//!
//! Wave 1 ships a seed of pure-syntactic rules to exercise the engine; the bulk
//! of day-one coverage comes from the validator wrap
//! ([`validator`](crate::validator)), not from these.

use crate::rule::Rule;
use crate::rules::{
    button_has_type::ButtonHasType, no_at_debug_tags::NoAtDebugTags, no_at_html_tags::NoAtHtmlTags,
    no_companion_module::NoCompanionModuleShadow, no_dupe_else_if_blocks::NoDupeElseIfBlocks,
    no_dupe_style_properties::NoDupeStyleProperties,
    no_object_in_text_mustaches::NoObjectInTextMustaches,
    no_restricted_html_elements::NoRestrictedHtmlElements, require_each_key::RequireEachKey,
};

/// Construct the full set of native rules.
pub fn all_rules() -> Vec<Box<dyn Rule>> {
    vec![
        Box::new(NoAtHtmlTags),
        Box::new(RequireEachKey),
        Box::new(NoAtDebugTags),
        Box::new(ButtonHasType),
        Box::new(NoDupeElseIfBlocks),
        Box::new(NoDupeStyleProperties),
        Box::new(NoObjectInTextMustaches),
        Box::new(NoRestrictedHtmlElements),
        Box::new(NoCompanionModuleShadow),
    ]
}
