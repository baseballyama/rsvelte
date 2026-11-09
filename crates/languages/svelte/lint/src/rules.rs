use crate::rule::RuleDefinition;

mod button_has_type;
mod no_at_debug_tags;
mod no_at_html_tags;
mod no_nested_style_tag;
mod no_raw_special_elements;
mod no_unused_variables;
mod no_useless_children_snippet;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &no_at_debug_tags::RULE,
    &no_at_html_tags::RULE,
    &no_nested_style_tag::RULE,
    &no_raw_special_elements::RULE,
    &no_useless_children_snippet::RULE,
    &valid_each_key::RULE,
];
