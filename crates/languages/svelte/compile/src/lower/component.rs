//! What a component call passes, in upstream `build_component`'s order. The targets differ only
//! in how they spell each prop, the children callback and the call.

use oxc_ast::ast::{Expression, ObjectPropertyKind, PropertyKind, Statement};
use rsvelte_svelte_semantic::compiler_syntax_tree::ElementKind;
use rsvelte_typescript_tree::{ExpressionIdentifier, Tree};

use super::javascript::member_root;
use super::{
    Attribute, AttributeValue, BindingKind, Builder, CompilerNodeIdentifier, CompilerSyntaxTree,
    Item, NodeKind, Resolution, Target,
};

#[derive(Clone, Copy)]
pub(super) enum Prop<'t> {
    /// `name`, `name="text"`, `name={value}` or `name="a {b}"`.
    Value(&'t Attribute),
    Spread(ExpressionIdentifier),
    /// `bind:name={target}`: a getter and a setter.
    Bind(&'t Attribute, ExpressionIdentifier),
}

/// Values and spreads as written, then bindings, so that a spread cannot overwrite a binding.
pub(super) fn props(attributes: &[Attribute]) -> impl Iterator<Item = Prop<'_>> {
    let values = attributes.iter().filter_map(|a| match a.value {
        AttributeValue::Bind(_) => None,
        AttributeValue::Spread(e) => Some(Prop::Spread(e)),
        _ => Some(Prop::Value(a)),
    });
    let bindings = attributes.iter().filter_map(|a| match a.value {
        AttributeValue::Bind(e) => Some(Prop::Bind(a, e)),
        _ => None,
    });
    values.chain(bindings)
}

/// Upstream `metadata.dynamic`: the component may change, so it is read through `$.component` on
/// the client and tested on the server.
pub(super) fn is_dynamic(res: &Resolution, reference: &Expression<'_>) -> bool {
    member_root(reference)
        .and_then(|root| res.symbol(root))
        .is_some_and(|symbol| {
            !matches!(reference, Expression::Identifier(_))
                || res.binding(symbol).kind != BindingKind::Normal
        })
}

/// The component node's reference: its name as an identifier or a member chain.
pub(super) fn reference(
    compiler_syntax_tree: &CompilerSyntaxTree,
    identifier: CompilerNodeIdentifier,
) -> ExpressionIdentifier {
    compiler_syntax_tree
        .component_reference(identifier)
        .expect("a component name parses to a reference")
}

/// Upstream `is_standalone`: the static component that is a fragment's only item needs no
/// template; it renders at the block's anchor.
pub(super) fn standalone_component(
    compiler_syntax_tree: &CompilerSyntaxTree,
    javascript: &Tree,
    res: &Resolution,
    items: &[Item<'_>],
) -> Option<CompilerNodeIdentifier> {
    let &[Item::Node(identifier)] = items else {
        return None;
    };
    (matches!(&compiler_syntax_tree.node(identifier).kind, NodeKind::Element(element) if element.kind == ElementKind::Component)
        && !is_dynamic(
            res,
            javascript.get_expression(reference(compiler_syntax_tree, identifier)),
        ))
    .then_some(identifier)
}

pub(super) enum Entry<'o> {
    Property(ObjectPropertyKind<'o>),
    Spread(Expression<'o>),
}

/// A binding's `get name()` and `set name($$value)` props; the targets differ only in the
/// setter's body, which writes `$$value`.
pub(super) fn push_binding<'o>(
    b: &Builder<'o>,
    parts: &mut Vec<Entry<'o>>,
    name: &str,
    value: Expression<'o>,
    setter: Vec<Statement<'o>>,
) {
    parts.push(Entry::Property(b.getter(name, value)));
    parts.push(Entry::Property(b.accessor(
        PropertyKind::Set,
        name,
        b.params(["$$value"]),
        setter,
    )));
}

/// The children as a callback in the `children` prop, and `$$slots.default` so that a `<slot>` in
/// the child renders it; the targets differ only in the callback's parameters.
pub(super) fn push_children<'o>(
    b: &Builder<'o>,
    parts: &mut Vec<Entry<'o>>,
    children: Vec<Statement<'o>>,
    parameters: &[&str],
) {
    if children.is_empty() {
        return;
    }
    let callback = b.arrow_block(b.params(parameters.iter().copied()), children, false);
    parts.push(Entry::Property(b.init("children", callback)));
    let slots = b.object([b.init("default", b.boolean(true))]);
    parts.push(Entry::Property(b.init("$$slots", slots)));
}

/// One object, or `$.spread_props` over the runs of properties and the spreads between them.
pub(super) fn props_expression<'o>(
    b: &Builder<'o>,
    parts: Vec<Entry<'o>>,
    target: Target,
) -> Expression<'o> {
    let mut groups = Vec::new();
    let mut properties = Vec::new();
    for part in parts {
        match part {
            Entry::Property(property) => properties.push(property),
            Entry::Spread(expression) => {
                if !properties.is_empty() {
                    groups.push(b.object(std::mem::take(&mut properties)));
                }
                groups.push(expression);
            }
        }
    }
    if groups.is_empty() {
        return b.object(properties);
    }
    if !properties.is_empty() {
        groups.push(b.object(properties));
    }
    match target {
        Target::Client => b.runtime("spread_props", groups),
        Target::Server => b.runtime("spread_props", [b.array(groups)]),
    }
}
