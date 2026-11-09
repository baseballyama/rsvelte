use crate::rule::RuleDefinition;

mod button_has_type;
mod max_attributes_per_line;
mod no_spaces_around_equal_signs_in_attribute;
mod no_unused_variables;
mod tags;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &max_attributes_per_line::RULE,
    &no_spaces_around_equal_signs_in_attribute::RULE,
    &valid_each_key::RULE,
];
