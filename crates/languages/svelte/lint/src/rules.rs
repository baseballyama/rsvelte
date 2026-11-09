use crate::rule::RuleDefinition;

mod button_has_type;
mod no_at_debug_tags;
mod no_at_html_tags;
mod no_unused_variables;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &no_at_debug_tags::RULE,
    &no_at_html_tags::RULE,
    &valid_each_key::RULE,
];
