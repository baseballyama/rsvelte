use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

use crate::rule::RuleDefinition;

mod button_has_type;
mod no_at_debug_tags;
mod no_at_html_tags;
mod no_inspect;
mod no_nested_style_tag;
mod no_raw_special_elements;
mod no_unused_variables;
mod no_useless_children_snippet;
mod require_each_key;
mod runes_mode;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &no_at_debug_tags::RULE,
    &no_at_html_tags::RULE,
    &no_inspect::RULE,
    &no_nested_style_tag::RULE,
    &no_raw_special_elements::RULE,
    &no_useless_children_snippet::RULE,
    &require_each_key::RULE,
    &valid_each_key::RULE,
];

/// A JavaScript node's span: every node a rule reads was parsed from the document.
fn node_span(javascript: &SyntaxTree, node: NodeIdentifier) -> Span {
    javascript
        .source_location(node)
        .span()
        .expect("a parsed node has a span")
}
