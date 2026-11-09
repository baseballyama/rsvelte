use crate::rule::RuleDefinition;

mod button_has_type;
mod kit_route;
mod no_conflicting_module_names;
mod no_export_load_in_svelte_module_in_kit_pages;
mod no_unused_variables;
mod valid_each_key;
mod valid_prop_names_in_kit_pages;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &no_conflicting_module_names::RULE,
    &no_export_load_in_svelte_module_in_kit_pages::RULE,
    &valid_each_key::RULE,
    &valid_prop_names_in_kit_pages::RULE,
];
