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
    no_target_blank::NoTargetBlank, no_useless_children_snippet::NoUselessChildrenSnippet,
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
        Box::new(NoTargetBlank),
    ]
}

/// Construct the full set of script-AST rules (rules that walk the `<script>`
/// ESTree program rather than the template tree).
pub fn all_script_rules() -> Vec<Box<dyn crate::script::ScriptRule>> {
    use crate::rules::no_add_event_listener::NoAddEventListener;
    use crate::rules::no_ignored_unsubscribe::NoIgnoredUnsubscribe;
    use crate::rules::no_inner_declarations::NoInnerDeclarations;
    use crate::rules::no_store_async::NoStoreAsync;
    use crate::rules::prefer_derived_over_derived_by::PreferDerivedOverDerivedBy;
    use crate::rules::prefer_svelte_reactivity::PreferSvelteReactivity;
    use crate::rules::require_store_callbacks_use_set_param::RequireStoreCallbacksUseSetParam;
    use crate::rules::require_stores_init::RequireStoresInit;
    vec![
        Box::new(NoInnerDeclarations),
        Box::new(PreferSvelteReactivity),
        Box::new(NoStoreAsync),
        Box::new(NoAddEventListener),
        Box::new(PreferDerivedOverDerivedBy),
        Box::new(NoIgnoredUnsubscribe),
        Box::new(RequireStoresInit),
        Box::new(RequireStoreCallbacksUseSetParam),
    ]
}
