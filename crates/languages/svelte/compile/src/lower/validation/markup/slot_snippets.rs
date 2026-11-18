//! Upstream's check that a component does not mix `<slot>` syntax with `{@render}` tags.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::compiler_syntax_tree::ElementKind;

use super::super::super::special::error;
use super::super::{Resolution, uses_slots};
use super::{AttributeValue, CompileInput, Diagnostic, NodeKind};

/// Upstream's `slot_snippet_conflict`, which it raises once its walk is done, when the component
/// has a `{@render}` tag and reads `$$slots` or, unless it is a custom element, has a `<slot>`.
pub(in crate::lower) fn slot_snippet_conflict(
    input: &CompileInput<'_>,
    res: &Resolution,
    custom_element: bool,
) -> Option<Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    if !(tree.nodes.iter()).any(|node| matches!(node.kind, NodeKind::Render { .. })) {
        return None;
    }
    // Upstream keeps the slots by name and reports the last `<slot>` of the first name it met.
    let mut first: Option<(&str, Span)> = None;
    for (id, element) in tree.elements() {
        if element.kind != ElementKind::Slot {
            continue;
        }
        let name = (tree.attributes(element.attributes).iter())
            .find_map(|a| match &a.value {
                AttributeValue::Static(name) if a.name.text(source) == "name" => Some(&**name),
                _ => None,
            })
            .unwrap_or("default");
        if first.is_none_or(|(first, _)| first == name) {
            first = Some((name, tree.node(id).span));
        }
    }
    if !(uses_slots(res) || !custom_element && first.is_some()) {
        return None;
    }
    let span = if let Some((_, span)) = first {
        span
    } else {
        let at = source.find("$$slot")?;
        let at = u32::try_from(at).expect("source positions use u32 bytes");
        Span::new(at, at)
    };
    Some(error(
        "slot_snippet_conflict",
        "Cannot use `<slot>` syntax and `{@render ...}` tags in the same component. Migrate \
         towards `{@render ...}` tags completely",
        span,
    ))
}
