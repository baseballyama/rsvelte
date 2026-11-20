//! Upstream's check that a component uses one syntax for its elements' event handlers.

use rsvelte_svelte_semantic::compiler_syntax_tree::{ElementKind, MetadataTag};

use super::{AttributeValue, CompileInput, Diagnostic, is_directive};
use crate::lower::error;

/// Upstream's `mixed_event_handler_syntaxes`, which it raises once its walk is done: the first
/// `on:` directive of an element, when an element also has an `on…={…}` attribute.
pub(in crate::lower) fn mixed_syntaxes(input: &CompileInput<'_>) -> Option<Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let attributes = (tree.elements())
        .filter(|(_, el)| {
            matches!(
                el.kind,
                ElementKind::Regular | ElementKind::Metadata(Some(MetadataTag::Element))
            )
        })
        .flat_map(|(_, el)| tree.attributes(el.attributes));
    let mut directive = None;
    let mut attribute = false;
    for a in attributes {
        match a.value {
            AttributeValue::On { .. } => {
                if directive.is_none_or(|first: &super::Attribute| {
                    a.span.start_offset < first.span.start_offset
                }) {
                    directive = Some(a);
                }
            }
            AttributeValue::Expression { .. } | AttributeValue::Shorthand(_)
                if !is_directive(&a.value) && a.name.text(source).starts_with("on") =>
            {
                attribute = true;
            }
            _ => {}
        }
    }
    let directive = directive.filter(|_| attribute)?;
    let name = directive.name.text(source);
    Some(error(
        "mixed_event_handler_syntaxes",
        &format!(
            "Mixing old (on:{name}) and new syntaxes for event handling is not allowed. Use only \
                the on{name} syntax"
        ),
        directive.span,
    ))
}
