//! The built-in native rule set.
//!
//! Wave 1 ships a seed of pure-syntactic rules to exercise the engine; the bulk
//! of day-one coverage comes from the validator wrap
//! ([`validator`](crate::validator)), not from these.

use crate::rule::Rule;
use crate::rules::{
    button_has_type::ButtonHasType, no_at_debug_tags::NoAtDebugTags, no_at_html_tags::NoAtHtmlTags,
    no_dupe_else_if_blocks::NoDupeElseIfBlocks, no_dupe_on_directives::NoDupeOnDirectives,
    no_dupe_style_properties::NoDupeStyleProperties, no_dupe_use_directives::NoDupeUseDirectives,
    no_inspect::NoInspect, no_not_function_handler::NoNotFunctionHandler,
    no_object_in_text_mustaches::NoObjectInTextMustaches,
    no_raw_special_elements::NoRawSpecialElements,
    no_restricted_html_elements::NoRestrictedHtmlElements, no_svelte_internal::NoSvelteInternal,
    no_useless_children_snippet::NoUselessChildrenSnippet,
    no_useless_mustaches::NoUselessMustaches, require_each_key::RequireEachKey,
    valid_each_key::ValidEachKey,
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
        Box::new(NoDupeOnDirectives),
        Box::new(NoDupeUseDirectives),
        Box::new(NoRawSpecialElements),
        Box::new(NoUselessChildrenSnippet),
        Box::new(ValidEachKey),
        Box::new(NoNotFunctionHandler),
        Box::new(NoSvelteInternal),
        Box::new(NoInspect),
        Box::new(NoUselessMustaches),
    ]
}
