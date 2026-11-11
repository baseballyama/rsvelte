//! Upstream `validate_slot_attribute` on the slot a component's child fills.

use rsvelte_svelte_semantic::compiler_syntax_tree::{ElementKind, MetadataTag};
use rustc_hash::FxHashSet;

use super::super::super::special::invalid;
use super::super::super::{
    Attribute, AttributeValue, CompileInput, CompilerNodeIdentifier, Diagnostic, NodeKind,
    is_directive,
};
use crate::render_plan::is_template_whitespace;

/// `slot_attribute_invalid`, then for a child of `component`, `slot_attribute_duplicate` against
/// the `names` its earlier children took and `slot_default_duplicate`.
pub(super) fn check<'a>(
    input: &CompileInput<'a>,
    slot: &'a Attribute,
    component: Option<CompilerNodeIdentifier>,
    names: &mut FxHashSet<&'a str>,
) -> Result<(), Diagnostic> {
    let AttributeValue::Static(name) = &slot.value else {
        return invalid(
            "slot_attribute_invalid",
            "slot attribute must be a static value",
            slot.span,
        );
    };
    let Some(component) = component else {
        return Ok(());
    };
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let NodeKind::Element(owner) = &tree.node(component).kind else {
        unreachable!("a component element")
    };
    if !names.insert(name) {
        return invalid(
            "slot_attribute_duplicate",
            &format!(
                "Duplicate slot name '{name}' in <{}>",
                owner.name.text(source)
            ),
            slot.span,
        );
    }
    if &**name != "default" {
        return Ok(());
    }
    for &child in tree.children(owner.children) {
        let node = tree.node(child);
        let fills_a_slot = match &node.kind {
            NodeKind::Text { .. } => node
                .kind
                .text(source)
                .is_some_and(|text| text.chars().all(is_template_whitespace)),
            NodeKind::Element(el)
                if matches!(
                    el.kind,
                    ElementKind::Regular | ElementKind::Metadata(Some(MetadataTag::Fragment))
                ) =>
            {
                tree.attributes(el.attributes)
                    .iter()
                    .any(|a| !is_directive(&a.value) && a.name.text(source) == "slot")
            }
            _ => false,
        };
        if !fills_a_slot {
            return invalid(
                "slot_default_duplicate",
                "Found default slot content alongside an explicit slot=\"default\"",
                node.span,
            );
        }
    }
    Ok(())
}
