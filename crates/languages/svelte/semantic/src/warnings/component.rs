//! The errors of the whole component rather than of one node.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, Component, TemplateNode};

use super::{Phase, Raised, Section, error};
use crate::resolve::Resolution;

/// The checks upstream makes once the walks end: `mixed_event_handler_syntaxes`, an element's
/// `on:` directive beside an element's event attribute, then `slot_snippet_conflict`, a
/// `{@render}` beside a `<slot>` or beside `$$slots`.
pub(super) fn component_errors(
    component: &Component,
    resolution: &Resolution,
    source: &str,
    event_directive: Option<(Span, Span)>,
    first_slot: Option<Span>,
    custom_element: bool,
    out: &mut Vec<(Raised, Diagnostic)>,
) {
    let raised = |at| Raised {
        phase: Phase::Component,
        section: Section::Template,
        at,
    };
    if let Some((at, name)) = event_directive {
        let name = name.text(source);
        let message = format!(
            "Mixing old (on:{name}) and new syntaxes for event handling is not allowed. Use only \
                the on{name} syntax"
        );
        let found = error("mixed_event_handler_syntaxes", &message, at);
        // Upstream checks it first, so it sorts before the slot conflict wherever that is.
        out.push((raised(0), found));
    }
    let renders = component
        .nodes
        .iter()
        .any(|node| matches!(node, TemplateNode::Render { .. }));
    let uses_slots = resolution.unresolved_names().any(|name| name == "$$slots");
    if !renders || !(uses_slots || (!custom_element && first_slot.is_some())) {
        return;
    }
    let at = first_slot.unwrap_or_else(|| {
        // Upstream points at the text `$$slot`, which a `$$slots` read holds.
        let at = source.find("$$slot").map_or(0, |at| at as u32);
        Span::new(at, at)
    });
    let message = "Cannot use `<slot>` syntax and `{@render ...}` tags in the same component. \
        Migrate towards `{@render ...}` tags completely";
    out.push((
        raised(at.start_offset),
        error("slot_snippet_conflict", message, at),
    ));
}

/// `<svelte:options tag>`, which Svelte 5's parser rejects; it reaches here only when a style
/// sheet error kept the parser from reading the options.
pub(super) fn deprecated_tag(
    component: &Component,
    source: &str,
    out: &mut Vec<(Raised, Diagnostic)>,
) {
    let Some((attributes, _)) = component.svelte_options(source) else {
        return;
    };
    for attribute in attributes {
        if attribute.kind == AttributeKind::Attribute && attribute.name.text(source) == "tag" {
            let raised = Raised {
                phase: Phase::Parse,
                section: Section::Template,
                at: attribute.span.start_offset,
            };
            let found = error(
                "svelte_options_deprecated_tag",
                "\"tag\" option is deprecated — use \"customElement\" instead",
                attribute.span,
            );
            out.push((raised, found));
        }
    }
}
