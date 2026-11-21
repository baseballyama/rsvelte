//! `let:` directives: the names a slot's content takes from the props its `<slot>` passes.

use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{
    ArrayExpressionElement, AssignmentOperator, AssignmentTarget, AssignmentTargetMaybeDefault,
    AssignmentTargetProperty, BindingPattern, BindingProperty, BindingRestElement, Expression,
    ObjectPropertyKind, PropertyKey, PropertyKind,
};
use oxc_span::SPAN;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerSyntaxTree, Element, ElementKind, MetadataTag, NodeKind,
};
use rsvelte_typescript_tree::Tree;

use super::{Builder, unsupported};
use crate::input::Target;
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
/// When the value holds what this port does not lower: a default where `defaults` is false, a
/// computed key, an array's rest or another expression.
pub(super) fn pattern<'o>(
    b: &Builder<'o>,
    directive: &Let<'_>,
    value: &Expression<'_>,
    defaults: bool,
) -> Result<BindingPattern<'o>, rsvelte_kernel::diagnostics::Diagnostic> {
    convert(b, value, defaults).map_or_else(
        || unsupported("this `let:` pattern", directive.attribute.span),
        Ok,
    )
}

fn convert<'o>(
    b: &Builder<'o>,
    value: &Expression<'_>,
    defaults: bool,
) -> Option<BindingPattern<'o>> {
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
                        let value = convert(b, &p.value, defaults)?;
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
                        let argument = convert(b, &spread.argument, defaults)?;
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
                    element => {
                        elements.push(Some(convert(b, element.as_expression()?, defaults)?));
                    }
                }
            }
            Some(BindingPattern::new_array_pattern(
                SPAN,
                b.vec(elements),
                None,
                b,
            ))
        }
        // Upstream prints a default as written, without reading it through the component's state.
        Expression::AssignmentExpression(assignment)
            if defaults && assignment.operator == AssignmentOperator::Assign =>
        {
            let left = target(b, &assignment.left)?;
            Some(with_default(b, left, &assignment.right))
        }
        _ => None,
    }
}

/// The pattern a default's left side stands for, which the parser reads as an assignment target.
fn target<'o>(b: &Builder<'o>, value: &AssignmentTarget<'_>) -> Option<BindingPattern<'o>> {
    match value {
        AssignmentTarget::AssignmentTargetIdentifier(name) => Some(b.binding(&name.name)),
        AssignmentTarget::ObjectAssignmentTarget(object) => {
            let mut properties = Vec::with_capacity(object.properties.len());
            for property in &object.properties {
                let (key, value, shorthand) = match property {
                    AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p) => {
                        let name = b.binding(&p.binding.name);
                        let value = match &p.init {
                            Some(init) => with_default(b, name, init),
                            None => name,
                        };
                        (p.binding.name.as_str(), value, true)
                    }
                    AssignmentTargetProperty::AssignmentTargetPropertyProperty(p)
                        if !p.computed =>
                    {
                        let PropertyKey::StaticIdentifier(key) = &p.name else {
                            return None;
                        };
                        (key.name.as_str(), maybe_default(b, &p.binding)?, false)
                    }
                    AssignmentTargetProperty::AssignmentTargetPropertyProperty(_) => return None,
                };
                properties.push(BindingProperty::new(
                    SPAN,
                    b.key(key),
                    value,
                    shorthand,
                    false,
                    b,
                ));
            }
            let rest = match &object.rest {
                Some(rest) => Some(BindingRestElement::boxed(SPAN, target(b, &rest.target)?, b)),
                None => None,
            };
            Some(BindingPattern::new_object_pattern(
                SPAN,
                b.vec(properties),
                rest,
                b,
            ))
        }
        AssignmentTarget::ArrayAssignmentTarget(array) if array.rest.is_none() => {
            let mut elements = Vec::with_capacity(array.elements.len());
            for element in &array.elements {
                elements.push(match element {
                    Some(element) => Some(maybe_default(b, element)?),
                    None => None,
                });
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

fn maybe_default<'o>(
    b: &Builder<'o>,
    value: &AssignmentTargetMaybeDefault<'_>,
) -> Option<BindingPattern<'o>> {
    match value {
        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(default) => {
            let left = target(b, &default.binding)?;
            Some(with_default(b, left, &default.init))
        }
        value => target(b, value.as_assignment_target()?),
    }
}

fn with_default<'o>(
    b: &Builder<'o>,
    left: BindingPattern<'o>,
    right: &Expression<'_>,
) -> BindingPattern<'o> {
    BindingPattern::new_assignment_pattern(SPAN, left, right.clone_in(b.allocator()), b)
}
