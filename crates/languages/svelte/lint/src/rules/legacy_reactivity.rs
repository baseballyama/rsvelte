//! What the rules on legacy reactivity share: its facts, and how the template uses expressions.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte::semantic::legacy::Legacy;
use rsvelte_svelte::syntax::syntax_tree::{AttributeKind, AttributeValue, Component, Part};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use crate::computation::LegacyReactivity;
use crate::rule::File;

/// The component's legacy reactivity facts.
pub(super) fn legacy<'a>(file: &File<'a>) -> &'a Legacy {
    file.context.get::<LegacyReactivity>()
}

/// The expression of each `bind:` directive, written out or shorthand, with the directive's span.
pub(super) fn bindings(component: &Component) -> FxHashMap<NodeIdentifier, Span> {
    component
        .attributes
        .iter()
        .filter(|attribute| attribute.kind == AttributeKind::Bind)
        .filter_map(|attribute| {
            let AttributeValue::Parts(parts) = attribute.value else {
                return None;
            };
            match component.parts(parts) {
                [Part::Expression { expression, .. }] => Some((*expression, attribute.span)),
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

/// `getPropertyName`: a member's static property name.
pub(super) fn property_name<'t>(
    javascript: &'t SyntaxTree,
    source: &'t str,
    member: NodeIdentifier,
) -> Option<&'t str> {
    let Kind::Member {
        property, computed, ..
    } = javascript.kind(member)
    else {
        return None;
    };
    if !computed {
        return Some(javascript.name(property));
    }
    match javascript.kind(property) {
        Kind::String => Some(javascript.str_value(property, source)),
        Kind::Template {
            quasis: [quasi],
            expressions: [],
        } => Some(javascript.str_value(*quasi, source)),
        _ => None,
    }
}
