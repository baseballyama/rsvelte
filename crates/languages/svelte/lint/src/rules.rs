use crate::rule::RuleDefinition;

mod button_has_type;
mod experimental_require_slot_types;
mod no_svelte_internal;
mod no_top_level_browser_globals;
mod no_unnecessary_state_wrap;
mod no_unused_variables;
mod nodes;
mod prefer_derived_over_derived_by;
mod prefer_svelte_reactivity;
mod reference_tracker;
mod runes;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &experimental_require_slot_types::RULE,
    &no_svelte_internal::RULE,
    &no_top_level_browser_globals::RULE,
    &no_unnecessary_state_wrap::RULE,
    &prefer_derived_over_derived_by::RULE,
    &prefer_svelte_reactivity::RULE,
    &valid_each_key::RULE,
];
