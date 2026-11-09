use crate::rule::RuleDefinition;

mod button_has_type;
pub(crate) mod comment_directive;
mod no_unused_variables;
pub(crate) mod system;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &comment_directive::RULE,
    &system::RULE,
    &valid_each_key::RULE,
];
