use crate::rule::RuleDefinition;

mod button_has_type;
mod derived_has_same_inputs_outputs;
mod javascript;
mod no_add_event_listener;
mod no_extra_reactive_curlies;
mod no_ignored_unsubscribe;
mod no_reactive_functions;
mod no_reactive_literals;
mod no_unused_variables;
mod reactive_statements;
mod require_store_callbacks_use_set_param;
mod require_stores_init;
mod svelte_store;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &derived_has_same_inputs_outputs::RULE,
    &no_add_event_listener::RULE,
    &no_extra_reactive_curlies::RULE,
    &no_ignored_unsubscribe::RULE,
    &no_reactive_functions::RULE,
    &no_reactive_literals::RULE,
    &require_store_callbacks_use_set_param::RULE,
    &require_stores_init::RULE,
    &valid_each_key::RULE,
];
