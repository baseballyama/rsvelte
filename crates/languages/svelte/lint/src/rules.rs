use crate::rule::RuleDefinition;

mod button_has_type;
mod max_attributes_per_line;
mod no_unused_variables;
mod tags;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &max_attributes_per_line::RULE,
    &valid_each_key::RULE,
];
