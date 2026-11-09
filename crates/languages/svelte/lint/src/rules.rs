use crate::rule::RuleDefinition;

mod button_has_type;
mod no_reactive_functions;
mod no_unused_variables;
mod reactive_statements;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &no_reactive_functions::RULE,
    &valid_each_key::RULE,
];
