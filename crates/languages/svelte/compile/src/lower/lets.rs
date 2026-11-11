//! `let:` directives: the names a slot's content takes from the props its `<slot>` passes.

use oxc_ast::ast::{
    ArrayExpressionElement, BindingPattern, BindingProperty, BindingRestElement, Expression,
    ObjectPropertyKind, PropertyKey, PropertyKind,
};
use oxc_span::SPAN;
use rsvelte_svelte_semantic::compiler_syntax_tree::MetadataTag;
use rsvelte_typescript_tree::Tree;

use super::{
    Attribute, AttributeValue, Builder, CompilerSyntaxTree, Element, ElementKind, NodeKind, Target,
    unsupported,
};
use crate::render_plan::slot_name;

/// A `let:` directive: the slot prop it reads, and the name or pattern it binds, if any.
#[derive(Clone, Copy)]
pub(super) struct Let<'t> {
    pub(super) attribute: &'t Attribute,
    pub(super) prop: &'t str,
    pub(super) value: Option<&'t Expression<'t>>,
}

pub(super) fn directives<'t>(
    tree: &'t CompilerSyntaxTree,
    javascript: &'t Tree,
    source: &'t str,
    element: &'t Element,
) -> impl Iterator<Item = Let<'t>> {
    tree.attributes(element.attributes)
        .iter()
        .filter_map(move |attribute| match attribute.value {
            AttributeValue::Let(value) => {
                let name = attribute.name.text(source);
                Some(Let {
                    attribute,
                    prop: name.strip_prefix("let:").unwrap_or(name),
                    value: value.map(|value| javascript.get_expression(value)),
                })
            }
            _ => None,
        })
}

/// The `let:` directives whose props a slot's callback takes, upstream server's `lets[slot]`: a
/// named slot's from its element, the default slot's from the component itself, unless it fills
/// a slot, and from each `<svelte:fragment>` in it.
pub(super) fn slot_lets<'t>(
    tree: &'t CompilerSyntaxTree,
    javascript: &'t Tree,
    source: &'t str,
    component: &'t Element,
    slot: &str,
) -> Vec<Let<'t>> {
    let mut lets = Vec::new();
    if slot == "default" && slot_name(tree, source, component.attributes).is_none() {
        lets.extend(directives(tree, javascript, source, component));
    }
    for &child in tree.children(component.children) {
        let NodeKind::Element(element) = &tree.node(child).kind else {
            continue;
        };
        match slot_name(tree, source, element.attributes) {
            Some(name) if name == slot => {
                lets = directives(tree, javascript, source, element).collect();
            }
            None if slot == "default" && is_fragment(element) => {
                lets.extend(directives(tree, javascript, source, element));
            }
            _ => {}
        }
    }
    lets
}

/// Whether the default slot takes slot props, so that it goes in `$$slots` and the `children`
/// prop throws. The client counts the component's own directives even when it fills a slot.
pub(super) fn default_slot_takes_props(
    tree: &CompilerSyntaxTree,
    javascript: &Tree,
    source: &str,
    component: &Element,
    target: Target,
) -> bool {
    let own = match target {
        Target::Client => directives(tree, javascript, source, component)
            .next()
            .is_some(),
        Target::Server => !slot_lets(tree, javascript, source, component, "default").is_empty(),
    };
    own || tree.children(component.children).iter().any(|&child| {
        matches!(&tree.node(child).kind, NodeKind::Element(element)
            if is_fragment(element)
                && slot_name(tree, source, element.attributes).is_none_or(|name| name == "default")
                && directives(tree, javascript, source, element).next().is_some())
    })
}

fn is_fragment(element: &Element) -> bool {
    element.kind == ElementKind::Metadata(Some(MetadataTag::Fragment))
}

/// The pattern a directive's `{…}` or `[…]` value stands for.
///
/// # Errors
///
/// When the value holds what this port does not lower: a default, a computed key, an array's rest
/// or another expression.
pub(super) fn pattern<'o>(
    b: &Builder<'o>,
    directive: &Let<'_>,
    value: &Expression<'_>,
) -> Result<BindingPattern<'o>, rsvelte_kernel::diagnostics::Diagnostic> {
    convert(b, value).map_or_else(
        || unsupported("this `let:` pattern", directive.attribute.span),
        Ok,
    )
}

fn convert<'o>(b: &Builder<'o>, value: &Expression<'_>) -> Option<BindingPattern<'o>> {
    match value {
        Expression::Identifier(name) => Some(b.binding(&name.name)),
        Expression::ObjectExpression(object) => {
            let mut properties = Vec::new();
            let mut rest = None;
            for (i, property) in object.properties.iter().enumerate() {
                match property {
                    ObjectPropertyKind::ObjectProperty(p)
                        if p.kind == PropertyKind::Init && !p.method && !p.computed =>
                    {
                        let PropertyKey::StaticIdentifier(key) = &p.key else {
                            return None;
                        };
                        let value = convert(b, &p.value)?;
                        properties.push(BindingProperty::new(
                            SPAN,
                            b.key(&key.name),
                            value,
                            p.shorthand,
                            false,
                            b,
                        ));
                    }
                    ObjectPropertyKind::SpreadProperty(spread)
                        if i + 1 == object.properties.len() =>
                    {
                        let argument = convert(b, &spread.argument)?;
                        rest = Some(BindingRestElement::boxed(SPAN, argument, b));
                    }
                    _ => return None,
                }
            }
            Some(BindingPattern::new_object_pattern(
                SPAN,
                b.vec(properties),
                rest,
                b,
            ))
        }
        // Upstream declares no name for an array's rest element, so reading it throws.
        Expression::ArrayExpression(array) => {
            let mut elements = Vec::new();
            for element in &array.elements {
                match element {
                    ArrayExpressionElement::Elision(_) => elements.push(None),
                    ArrayExpressionElement::SpreadElement(_) => return None,
                    element => elements.push(Some(convert(b, element.as_expression()?)?)),
                }
            }
            Some(BindingPattern::new_array_pattern(
                SPAN,
                b.vec(elements),
                None,
                b,
            ))
        }
        _ => None,
    }
}
