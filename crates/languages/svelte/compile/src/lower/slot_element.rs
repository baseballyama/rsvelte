//! Upstream `SlotElement`: `$.slot(anchor, $$props, name, props, fallback)`. The targets differ
//! only in how they build each value and spell the anchor and the fallback.

use oxc_ast::ast::{Expression, ObjectPropertyKind};
use rsvelte_typescript_tree::ExpressionIdentifier;
use rustc_hash::FxHashSet;

use super::{
    Attribute, AttributeValue, Builder, CompilerSyntaxTree, ElementKind, NodeKind, Target,
};
use crate::lower::builder::Runtime;

pub(super) enum SlotAttribute<'t> {
    Name(&'t Attribute),
    Prop(&'t Attribute),
    Spread(ExpressionIdentifier),
}

/// The attributes `$.slot` passes; `slot` names the slot this one fills, and a `let:` directive
/// was refused before lowering.
pub(super) fn slot_attributes<'t>(
    attributes: &'t [Attribute],
    source_text: &'t str,
) -> impl Iterator<Item = SlotAttribute<'t>> {
    attributes.iter().filter_map(move |a| match &a.value {
        &AttributeValue::Spread(e) => Some(SlotAttribute::Spread(e)),
        // A `let:` is the client's to declare, and upstream allows no other directive here.
        value if super::template::is_directive(value) => None,
        _ => match a.name.text(source_text) {
            "name" => Some(SlotAttribute::Name(a)),
            "slot" => None,
            _ => Some(SlotAttribute::Prop(a)),
        },
    })
}

/// The props object first, then each spread.
pub(super) fn slot_call<'o>(
    b: &Builder<'o>,
    anchor: Expression<'o>,
    name: Option<Expression<'o>>,
    properties: Vec<ObjectPropertyKind<'o>>,
    spreads: Vec<Expression<'o>>,
    fallback: Option<Expression<'o>>,
    target: Target,
) -> Expression<'o> {
    let object = b.object(properties);
    let props = if spreads.is_empty() {
        object
    } else {
        match target {
            Target::Client => b.runtime("spread_props", std::iter::once(object).chain(spreads)),
            Target::Server => b.runtime(
                "spread_props",
                [b.array(std::iter::once(object).chain(spreads))],
            ),
        }
    };
    let name = name.unwrap_or_else(|| b.string("default"));
    let fallback = fallback.unwrap_or_else(|| b.null());
    b.runtime("slot", [anchor, b.id("$$props"), name, props, fallback])
}

/// Upstream `analysis.slot_names`' keys: each name once, where it first appears. A name is
/// static text, which validation checked.
pub(super) fn slot_names<'t>(tree: &'t CompilerSyntaxTree, source_text: &str) -> Vec<&'t str> {
    let mut names: Vec<&str> = Vec::new();
    let mut seen = FxHashSet::default();
    for node in &tree.nodes {
        let NodeKind::Element(el) = &node.kind else {
            continue;
        };
        if el.kind != ElementKind::Slot {
            continue;
        }
        let name = tree
            .attributes(el.attributes)
            .iter()
            .find_map(|a| match &a.value {
                AttributeValue::Static(v) if a.name.text(source_text) == "name" => Some(&**v),
                _ => None,
            })
            .unwrap_or("default");
        if seen.insert(name) {
            names.push(name);
        }
    }
    names
}

/// Upstream `analysis.slot_names` is not empty, so the component takes `$$props`.
pub(super) fn has_slot_element(tree: &CompilerSyntaxTree) -> bool {
    tree.nodes
        .iter()
        .any(|node| matches!(&node.kind, NodeKind::Element(el) if el.kind == ElementKind::Slot))
}
