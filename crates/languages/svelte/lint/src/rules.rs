use crate::rule::RuleDefinition;

mod button_has_type;
mod no_unnecessary_condition;
mod no_unused_variables;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &no_unnecessary_condition::RULE,
    &button_has_type::RULE,
    &valid_each_key::RULE,
];
