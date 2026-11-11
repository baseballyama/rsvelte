//! What the rules on legacy reactivity share: its facts, and how the template uses expressions.

use oxc_ast::AstKind;
use oxc_ast::ast::Expression;
use oxc_semantic::NodeId;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::legacy::Legacy;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Component, Part};
use rustc_hash::FxHashMap;

use crate::computation::LegacyReactivity;
use crate::rule::File;

/// The component's legacy reactivity facts.
pub(super) fn legacy<'a>(file: &File<'a>) -> &'a Legacy {
    file.context.get::<LegacyReactivity>()
}

/// The node by which the analysis knows `expression`.
pub(super) fn expression_node(expression: &Expression<'_>) -> NodeId {
    AstKind::from_expression(expression).node_id()
}

/// The expression of each `bind:` directive, written out or shorthand, with the directive's span.
pub(super) fn bindings(component: &Component) -> FxHashMap<NodeId, Span> {
    let javascript = &component.javascript;
    component
        .attributes
        .iter()
        .filter(|attribute| attribute.kind == AttributeKind::Bind)
        .filter_map(|attribute| {
            let AttributeValue::Parts(parts) = attribute.value else {
                return None;
            };
            match component.parts(parts) {
                [Part::Expression { expression, .. }] => Some((
                    expression_node(javascript.get_expression(*expression)),
                    attribute.span,
                )),
                _ => None,
            }
        })
        .collect()
}

/// Whether an element named `name` is an HTML element, `<svelte:element>` included, rather than a
/// component or another special element.
pub(super) fn is_html_element(name: &str) -> bool {
    name == "svelte:element"
        || !(name.starts_with("svelte:")
            || name.contains('.')
            || name.starts_with(|c: char| c.is_ascii_uppercase()))
}

/// `getPropertyName`: a member's static property name. A private name has none, since `#name`
/// never equals a public name.
pub(super) fn property_name(member: AstKind<'_>) -> Option<&str> {
    match member {
        AstKind::StaticMemberExpression(member) => Some(member.property.name.as_str()),
        AstKind::ComputedMemberExpression(member) => match &member.expression {
            Expression::StringLiteral(string) => string.value.as_str(),
            // The raw text, escapes unprocessed.
            Expression::TemplateLiteral(template) if template.expressions.is_empty() => template
                .quasis
                .first()
                .map(|quasi| quasi.value.raw.as_str()),
            _ => None,
        },
        _ => None,
    }
}
