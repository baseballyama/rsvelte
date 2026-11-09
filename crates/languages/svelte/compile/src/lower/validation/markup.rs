//! The template errors upstream's parser and analysis raise, one walk for elements and
//! components.

use rsvelte_svelte_semantic::compiler_syntax_tree::{ElementKind, MetadataTag};
use rustc_hash::FxHashSet;

use super::super::special::invalid;
use super::super::{
    Attribute, AttributeValue, Children, CompileInput, CompilerNodeIdentifier, Diagnostic, Element,
    NodeKind, is_custom_element_node, is_directive,
};

/// Which names an attribute shares: upstream's parser keeps one set per directive kind.
#[derive(Clone, Copy, PartialEq, Eq, Hash)]
enum Namespace {
    /// An attribute or a binding.
    Attribute,
    Class,
    Style,
}

/// The nearest component, `<svelte:element>` or custom element above a node, which decides where a
/// `slot` attribute may go.
#[derive(Clone, Copy)]
enum Owner {
    Component(CompilerNodeIdentifier),
    Element,
}

/// # Errors
///
/// `attribute_duplicate`, `svelte_fragment_invalid_placement` or
/// `slot_attribute_invalid_placement`, at the first node in document order that has one.
pub(in crate::lower) fn check(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    walk(
        input,
        input.component.compiler_syntax_tree.root,
        None,
        &mut FxHashSet::default(),
    )
}

fn walk<'a>(
    input: &CompileInput<'a>,
    children: Children,
    owner: Option<Owner>,
    names: &mut FxHashSet<(Namespace, &'a str)>,
) -> Result<(), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    for &identifier in tree.children(children) {
        let inner = match &tree.node(identifier).kind {
            NodeKind::Element(el) => element(input, identifier, el, owner, names)?,
            _ => owner,
        };
        for children in tree.child_lists(identifier) {
            walk(input, children, inner, names)?;
        }
    }
    Ok(())
}

/// The owner is returned because a child's `slot` attribute is checked against it.
fn element<'a>(
    input: &CompileInput<'a>,
    identifier: CompilerNodeIdentifier,
    el: &'a Element,
    owner: Option<Owner>,
    names: &mut FxHashSet<(Namespace, &'a str)>,
) -> Result<Option<Owner>, Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let node = tree.node(identifier);
    let attributes = tree.attributes(el.attributes);
    check_unique(source, attributes, names)?;
    let parent = node.parent.map(|parent| &tree.node(parent).kind);
    // Upstream's `SvelteFragment` takes a component or `<svelte:component>`, not `<svelte:self>`.
    if el.kind == ElementKind::Metadata(Some(MetadataTag::Fragment))
        && !matches!(parent, Some(NodeKind::Element(p)) if matches!(p.kind, ElementKind::Component | ElementKind::Metadata(Some(MetadataTag::Component))))
    {
        return invalid(
            "svelte_fragment_invalid_placement",
            "`<svelte:fragment>` must be the direct child of a component",
            node.span,
        );
    }
    let slot = attributes
        .iter()
        .find(|a| !is_directive(&a.value) && a.name.text(source) == "slot");
    if let Some(slot) = slot
        && matches!(
            el.kind,
            ElementKind::Regular
                | ElementKind::Metadata(Some(MetadataTag::Element | MetadataTag::Fragment))
        )
        && !matches!(parent, Some(NodeKind::Snippet(_)))
        && !match owner {
            Some(Owner::Component(component)) => node.parent == Some(component),
            Some(Owner::Element) => true,
            None => false,
        }
    {
        return invalid(
            "slot_attribute_invalid_placement",
            "Element with a slot='...' attribute must be a child of a component or a descendant of a custom element",
            slot.span,
        );
    }
    Ok(match el.kind {
        kind if kind.renders_component() => Some(Owner::Component(identifier)),
        ElementKind::Metadata(Some(MetadataTag::Element)) => Some(Owner::Element),
        ElementKind::Regular if is_custom_element_node(tree, source, el) => Some(Owner::Element),
        _ => owner,
    })
}

/// Upstream's parser: an attribute or binding, a `class:` or a `style:` directive named twice
/// (a `this` is not recorded, so `<svelte:element bind:this this=…>` passes).
fn check_unique<'a>(
    source: &'a str,
    attributes: &'a [Attribute],
    names: &mut FxHashSet<(Namespace, &'a str)>,
) -> Result<(), Diagnostic> {
    names.clear();
    for a in attributes {
        let kind = match a.value {
            AttributeValue::Class(_) => Namespace::Class,
            AttributeValue::Style { .. } => Namespace::Style,
            AttributeValue::Bind(_) => Namespace::Attribute,
            _ if !is_directive(&a.value) => Namespace::Attribute,
            _ => continue,
        };
        let name = a.name.text(source);
        if names.contains(&(kind, name)) {
            return invalid(
                "attribute_duplicate",
                "Attributes need to be unique",
                a.span,
            );
        }
        if name != "this" {
            names.insert((kind, name));
        }
    }
    Ok(())
}
