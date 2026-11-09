use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

use crate::rule::RuleDefinition;

mod button_has_type;
pub(crate) mod comment_directive;
mod compile_warnings;
mod constant_string;
mod duplicate_directives;
mod expressions;
mod first_attribute_linebreak;
mod html_closing_bracket_new_line;
mod html_closing_bracket_spacing;
mod html_quotes;
mod html_self_closing;
mod markup;
mod max_attributes_per_line;
mod mustache_spacing;
mod no_at_const_tags;
mod no_at_debug_tags;
mod no_at_html_tags;
mod no_bind_value_on_checkable_inputs;
mod no_dupe_else_if_blocks;
mod no_dupe_on_directives;
mod no_dupe_use_directives;
mod no_dynamic_slot_name;
mod no_inspect;
mod no_nested_style_tag;
mod no_not_function_handler;
mod no_object_in_text_mustaches;
mod no_raw_special_elements;
mod no_restricted_html_elements;
mod no_spaces_around_equal_signs_in_attribute;
mod no_target_blank;
mod no_trailing_spaces;
mod no_unnecessary_condition;
mod no_unused_svelte_ignore;
mod no_unused_variables;
mod no_useless_children_snippet;
mod no_useless_mustaches;
mod prefer_attribute_interpolation;
mod require_each_key;
mod runes_mode;
mod shorthand_attribute;
mod shorthand_directive;
mod sort_attributes;
mod spaced_html_comment;
mod string_escape;
pub(crate) mod system;
mod tags;
#[cfg(test)]
mod testing;
mod valid_compile;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &no_unnecessary_condition::RULE,
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
    &no_at_const_tags::RULE,
    &no_at_debug_tags::RULE,
    &no_at_html_tags::RULE,
    &no_bind_value_on_checkable_inputs::RULE,
    &no_dupe_else_if_blocks::RULE,
    &no_dupe_on_directives::RULE,
    &no_dupe_use_directives::RULE,
    &no_dynamic_slot_name::RULE,
    &no_inspect::RULE,
    &no_nested_style_tag::RULE,
    &no_not_function_handler::RULE,
    &no_object_in_text_mustaches::RULE,
    &no_raw_special_elements::RULE,
    &no_restricted_html_elements::RULE,
    &no_target_blank::RULE,
    &no_useless_children_snippet::RULE,
    &no_useless_mustaches::RULE,
    &prefer_attribute_interpolation::RULE,
    &require_each_key::RULE,
    &shorthand_attribute::RULE,
    &shorthand_directive::RULE,
    &comment_directive::RULE,
    &no_unused_svelte_ignore::RULE,
    &system::RULE,
    &valid_compile::RULE,
    &valid_each_key::RULE,
];

/// A JavaScript node's span: every node a rule reads was parsed from the document.
fn node_span(javascript: &SyntaxTree, node: NodeIdentifier) -> Span {
    javascript
        .source_location(node)
        .span()
        .expect("a parsed node has a span")
}
