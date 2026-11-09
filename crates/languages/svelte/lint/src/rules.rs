use crate::rule::RuleDefinition;

mod button_has_type;
mod first_attribute_linebreak;
mod html_closing_bracket_new_line;
mod html_closing_bracket_spacing;
mod html_quotes;
mod html_self_closing;
mod max_attributes_per_line;
mod mustache_spacing;
mod no_spaces_around_equal_signs_in_attribute;
mod no_trailing_spaces;
mod no_unused_variables;
mod sort_attributes;
mod spaced_html_comment;
mod tags;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &first_attribute_linebreak::RULE,
    &html_closing_bracket_new_line::RULE,
    &html_closing_bracket_spacing::RULE,
    &html_quotes::RULE,
    &html_self_closing::RULE,
    &max_attributes_per_line::RULE,
    &mustache_spacing::RULE,
    &no_spaces_around_equal_signs_in_attribute::RULE,
    &no_trailing_spaces::RULE,
    &sort_attributes::RULE,
    &spaced_html_comment::RULE,
    &valid_each_key::RULE,
];
