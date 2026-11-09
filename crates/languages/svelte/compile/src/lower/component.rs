//! What a component call passes, in upstream `build_component`'s order. The targets differ only
//! in how they spell each prop, the children callback and the call.

use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_svelte_semantic::compiler_syntax_tree::ElementKind;
use rsvelte_typescript_syntax::syntax_tree::flag;

use super::javascript::{accessor, getter, init_property};
use super::{
    Attribute, AttributeValue, BindingKind, CompilerNodeIdentifier, CompilerSyntaxTree, Item,
    NodeIdentifier, NodeKind, Resolution, SyntaxTree, Target,
};

#[derive(Clone, Copy)]
pub(super) enum Prop<'t> {
    /// `name`, `name="text"`, `name={value}` or `name="a {b}"`.
    Value(&'t Attribute),
    Spread(NodeIdentifier),
    /// `bind:name={target}`: a getter and a setter.
    Bind(&'t Attribute, NodeIdentifier),
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
pub(super) fn is_dynamic(
    javascript: &SyntaxTree,
    res: &Resolution,
    reference: NodeIdentifier,
) -> bool {
    let root = javascript.member_root(reference);
    res.binding(root)
        .is_some_and(|(_, info)| root != reference || info.kind != BindingKind::Normal)
}

/// The component node's reference: its name as an identifier or a member chain.
pub(super) fn reference(
    compiler_syntax_tree: &CompilerSyntaxTree,
    identifier: CompilerNodeIdentifier,
) -> NodeIdentifier {
    compiler_syntax_tree
        .component_reference(identifier)
        .expect("a component name parses to a reference")
}

/// Upstream `is_standalone`: the static component that is a fragment's only item needs no
/// template; it renders at the block's anchor.
pub(super) fn standalone_component(
    compiler_syntax_tree: &CompilerSyntaxTree,
    javascript: &SyntaxTree,
    res: &Resolution,
    items: &[Item<'_>],
) -> Option<CompilerNodeIdentifier> {
    let &[Item::Node(identifier)] = items else {
        return None;
    };
    (matches!(&compiler_syntax_tree.node(identifier).kind, NodeKind::Element(element) if element.kind == ElementKind::Component)
        && !is_dynamic(javascript, res, reference(compiler_syntax_tree, identifier)))
    .then_some(identifier)
}

pub(super) enum Entry {
    Property(NodeIdentifier),
    Spread(NodeIdentifier),
}

/// A binding's `get name()` and `set name($$value)` props; the targets differ only in the
/// setter's body, which writes `$$value`.
pub(super) fn push_binding(
    out: &mut SyntaxTree,
    parts: &mut Vec<Entry>,
    name: &str,
    value: NodeIdentifier,
    setter: &[NodeIdentifier],
) {
    parts.push(Entry::Property(getter(out, name, value)));
    let parameter = out.identifier("$$value");
    parts.push(Entry::Property(accessor(
        out,
        name,
        &[parameter],
        setter,
        flag::SETTER,
    )));
}

/// The children as a callback in the `children` prop, and `$$slots.default` so that a `<slot>` in
/// the child renders it; the targets differ only in the callback's parameters.
pub(super) fn push_children(
    out: &mut SyntaxTree,
    parts: &mut Vec<Entry>,
    children: &[NodeIdentifier],
    parameters: &[&str],
) {
    if children.is_empty() {
        return;
    }
    let block = out.block(children, SourceLocation::SYNTHETIC);
    let parameters: Vec<NodeIdentifier> = parameters.iter().map(|p| out.identifier(p)).collect();
    let callback = out.arrow(&parameters, block, false, false, SourceLocation::SYNTHETIC);
    parts.push(Entry::Property(init_property(out, "children", callback)));
    let yes = out.write_boolean(true, SourceLocation::SYNTHETIC);
    let default = init_property(out, "default", yes);
    let slots = out.object(&[default], SourceLocation::SYNTHETIC);
    parts.push(Entry::Property(init_property(out, "$$slots", slots)));
}

/// One object, or `$.spread_props` over the runs of properties and the spreads between them.
pub(super) fn props_expression(
    out: &mut SyntaxTree,
    parts: Vec<Entry>,
    target: Target,
) -> NodeIdentifier {
    let mut groups = Vec::new();
    let mut properties = Vec::new();
    for part in parts {
        match part {
            Entry::Property(property) => properties.push(property),
            Entry::Spread(expression) => {
                if !properties.is_empty() {
                    let object = out.object(&properties, SourceLocation::SYNTHETIC);
                    properties.clear();
                    groups.push(object);
                }
                groups.push(expression);
            }
        }
    }
    if groups.is_empty() {
        return out.object(&properties, SourceLocation::SYNTHETIC);
    }
    if !properties.is_empty() {
        groups.push(out.object(&properties, SourceLocation::SYNTHETIC));
    }
    match target {
        Target::Client => out.runtime("$", "spread_props", &groups),
        Target::Server => {
            let array = out.array(&groups, SourceLocation::SYNTHETIC);
            out.runtime("$", "spread_props", &[array])
        }
    }
}
