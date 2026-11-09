//! The surface tree as `svelte-eslint-parser` sorts it: HTML elements, `SvelteAttribute`s, where
//! an attribute's value starts, and the mustache tags (`SvelteMustacheTag`) of a component.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte::syntax::names::is_component_name;
use rsvelte_svelte::syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, TemplateNode, TokenType,
};
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

/// `kind: "html"`: neither a component nor a `svelte:` element.
pub(super) fn is_html(name: &str) -> bool {
    !name.starts_with("svelte:") && !is_component_name(name)
}

/// A `SvelteAttribute`: `a`, `a="…"` or `a={…}`. Not `{a}`, and not the `this={…}` of
/// `<svelte:element>` or `<svelte:component>`, which is a special directive.
pub(super) fn is_attribute(
    component: &Component,
    source: &str,
    element: &str,
    attribute: &Attribute,
) -> bool {
    if attribute.kind != AttributeKind::Attribute || attribute.shorthand {
        return false;
    }
    !(matches!(element, "svelte:element" | "svelte:component")
        && attribute.name.text(source) == "this"
        && parts(component, attribute)
            .iter()
            .any(|part| matches!(part, Part::Expression { .. })))
}

/// The value's parts; none for a value-less attribute.
pub(super) fn parts<'a>(component: &'a Component, attribute: &Attribute) -> &'a [Part] {
    match attribute.value {
        AttributeValue::Parts(parts) => component.parts(parts),
        AttributeValue::True => &[],
    }
}

/// A part's span.
pub(super) const fn part_span(part: &Part) -> Span {
    match *part {
        Part::Text(span) | Part::Expression { span, .. } => span,
    }
}

/// The quote around a written value: `"` or `'`.
pub(super) fn quote<'s>(
    component: &Component,
    source: &'s str,
    attribute: &Attribute,
) -> Option<&'s str> {
    if !attribute.quoted {
        return None;
    }
    let first = parts(component, attribute).first()?;
    let token = component
        .tokens
        .get(component.tokens.before(part_span(first).start_offset)?);
    matches!(token.kind, TokenType::DoubleQuote | TokenType::SingleQuote)
        .then(|| token.span.text(source))
}

/// From the opening quote, or the first part of an unquoted value, to the end of the attribute;
/// `None` without `= value`.
pub(super) fn value_span(component: &Component, attribute: &Attribute) -> Option<Span> {
    if attribute.shorthand {
        return None;
    }
    let first = parts(component, attribute).first()?;
    let mut start = part_span(first).start_offset;
    if attribute.quoted {
        start = component
            .tokens
            .get(component.tokens.before(start)?)
            .span
            .start_offset;
    }
    Some(Span::new(start, attribute.span.end_offset))
}

/// Whether a comment starts inside `span`.
pub(super) fn has_comment(javascript: &SyntaxTree, span: Span) -> bool {
    let comments = &javascript.comments;
    let at = comments.partition_point(|comment| comment.start_offset < span.start_offset);
    comments
        .get(at)
        .is_some_and(|comment| comment.start_offset < span.end_offset)
}

/// What holds a mustache tag.
#[derive(Clone, Copy)]
pub(super) enum Holder<'a> {
    /// `{expression}` in the template.
    Text,
    /// `{@html expression}`.
    Raw,
    /// A part of a [`SvelteAttribute`](is_attribute)'s value.
    Attribute(&'a Attribute),
    /// A part of a `style:` directive's value.
    Style(&'a Attribute),
}

/// A `SvelteMustacheTag`: its expression, its span (braces included) and what holds it.
#[derive(Clone, Copy)]
pub(super) struct Mustache<'a> {
    pub expression: NodeIdentifier,
    pub span: Span,
    pub holder: Holder<'a>,
}

/// Calls `f` on each mustache tag of the component.
pub(super) fn for_each_mustache<'a>(
    component: &'a Component,
    source: &str,
    mut f: impl FnMut(Mustache<'a>),
) {
    for node in &component.nodes {
        match *node {
            TemplateNode::Expression { expression, span } => f(Mustache {
                expression,
                span,
                holder: Holder::Text,
            }),
            TemplateNode::Html { expression, span } => f(Mustache {
                expression,
                span,
                holder: Holder::Raw,
            }),
            TemplateNode::Element {
                name, attributes, ..
            } => {
                let element = name.text(source);
                for attribute in component.attributes(attributes) {
                    let holder = if is_attribute(component, source, element, attribute) {
                        Holder::Attribute(attribute)
                    } else if attribute.kind == AttributeKind::Style && !attribute.shorthand {
                        Holder::Style(attribute)
                    } else {
                        continue;
                    };
                    for part in parts(component, attribute) {
                        if let Part::Expression { expression, span } = *part {
                            f(Mustache {
                                expression,
                                span,
                                holder,
                            });
                        }
                    }
                }
            }
            _ => {}
        }
    }
}
