use crate::rule::RuleDefinition;

mod button_has_type;
mod javascript;
mod no_extra_reactive_curlies;
mod no_ignored_unsubscribe;
mod no_reactive_functions;
mod no_reactive_literals;
mod no_unused_variables;
mod reactive_statements;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &no_extra_reactive_curlies::RULE,
    &no_ignored_unsubscribe::RULE,
    &no_reactive_functions::RULE,
    &no_reactive_literals::RULE,
    &valid_each_key::RULE,
];
