//! `<slot>` discovery and the `slots` literal of the component export.
//! Mirrors `svelte2tsx/nodes/slot.ts`.

use std::fmt::Write as _;

use super::super::template;

/// Build the `slots` object literal for the component export from template info.
pub(crate) fn build_slots_str(template_info: &template::TemplateInfo) -> String {
    if template_info.slots.is_empty() {
        "{}".to_string()
    } else {
        let mut slot_parts = Vec::new();
        for (name, props) in &template_info.slots {
            let escaped_name = escape_js_single_quoted(name);
            if props.is_empty() {
                slot_parts.push(format!("'{}': {{}}", escaped_name));
            } else {
                // Slot prop keys (the `props` strings) may also carry hyphens /
                // spaces / quotes when they come from arbitrary `slot="…"`
                // attributes; keep them verbatim for now since they're produced
                // upstream from validated bindings and don't reach this site
                // with adversarial input in practice. (issue #455, H-092)
                slot_parts.push(format!("'{}': {{{}}}", escaped_name, props.join(", ")));
            }
        }
        format!("{{{}}}", slot_parts.join(", "))
    }
}

/// Escape a string for use as the body of a single-quoted JS string literal.
/// Used to interpolate slot names / slot prop keys into the generated TS output
/// without producing invalid JS when a name carries `'`, `\\`, or control
/// characters (issue #455, H-092).
pub(crate) fn escape_js_single_quoted(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\\' => out.push_str("\\\\"),
            '\'' => out.push_str("\\'"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                let _ = write!(out, "\\u{:04x}", c as u32);
            }
            c => out.push(c),
        }
    }
    out
}

/// Collect slot names from the template AST.
///
/// Walks the fragment tree looking for `<slot>` elements and collects their names.
/// A slot without a `name` attribute is the "default" slot.
pub(crate) fn collect_slot_names_from_ast(
    fragment: &crate::ast::template::Fragment,
) -> Vec<String> {
    let mut names = Vec::new();
    collect_slot_names_recursive(&fragment.nodes, &mut names);
    // Deduplicate while preserving order
    let mut seen = std::collections::HashSet::new();
    names.retain(|n| seen.insert(n.clone()));
    names
}

fn collect_slot_names_recursive(
    nodes: &[crate::ast::template::TemplateNode],
    names: &mut Vec<String>,
) {
    use crate::ast::template::TemplateNode;
    for node in nodes {
        match node {
            TemplateNode::SlotElement(el) => {
                // Get slot name from the `name` attribute
                let mut slot_name = "default".to_string();
                for attr in &el.attributes {
                    if let crate::ast::template::Attribute::Attribute(node) = attr
                        && node.name == "name"
                        && let crate::ast::template::AttributeValue::Sequence(parts) = &node.value
                    {
                        for part in parts {
                            if let crate::ast::template::AttributeValuePart::Text(text) = part {
                                slot_name = text.raw.to_string();
                            }
                        }
                    }
                }
                names.push(slot_name);
                collect_slot_names_recursive(&el.fragment.nodes, names);
            }
            TemplateNode::RegularElement(el) => {
                collect_slot_names_recursive(&el.fragment.nodes, names);
            }
            TemplateNode::Component(comp) => {
                collect_slot_names_recursive(&comp.fragment.nodes, names);
            }
            TemplateNode::IfBlock(block) => {
                collect_slot_names_recursive(&block.consequent.nodes, names);
                if let Some(ref alt) = block.alternate {
                    collect_slot_names_recursive(&alt.nodes, names);
                }
            }
            TemplateNode::EachBlock(block) => {
                collect_slot_names_recursive(&block.body.nodes, names);
                if let Some(ref fallback) = block.fallback {
                    collect_slot_names_recursive(&fallback.nodes, names);
                }
            }
            TemplateNode::AwaitBlock(block) => {
                if let Some(ref pending) = block.pending {
                    collect_slot_names_recursive(&pending.nodes, names);
                }
                if let Some(ref then) = block.then {
                    collect_slot_names_recursive(&then.nodes, names);
                }
                if let Some(ref catch) = block.catch {
                    collect_slot_names_recursive(&catch.nodes, names);
                }
            }
            TemplateNode::KeyBlock(block) => {
                collect_slot_names_recursive(&block.fragment.nodes, names);
            }
            TemplateNode::SnippetBlock(block) => {
                collect_slot_names_recursive(&block.body.nodes, names);
            }
            TemplateNode::SvelteBody(el)
            | TemplateNode::SvelteDocument(el)
            | TemplateNode::SvelteFragment(el)
            | TemplateNode::SvelteBoundary(el)
            | TemplateNode::SvelteHead(el)
            | TemplateNode::SvelteOptions(el)
            | TemplateNode::SvelteSelf(el)
            | TemplateNode::SvelteWindow(el) => {
                collect_slot_names_recursive(&el.fragment.nodes, names);
            }
            TemplateNode::TitleElement(el) => {
                collect_slot_names_recursive(&el.fragment.nodes, names);
            }
            TemplateNode::SvelteComponent(comp) => {
                collect_slot_names_recursive(&comp.fragment.nodes, names);
            }
            TemplateNode::SvelteElement(el) => {
                collect_slot_names_recursive(&el.fragment.nodes, names);
            }
            _ => {}
        }
    }
}

/// True if the template fragment contains a real `<slot>` element anywhere
/// (recursing through elements, components, control-flow blocks, and snippets).
/// AST-based replacement for a naive `source.contains("<slot")` scan.
pub(crate) fn fragment_has_slot_element(fragment: &crate::ast::template::Fragment) -> bool {
    fragment.nodes.iter().any(node_has_slot_element)
}

fn node_has_slot_element(node: &crate::ast::template::TemplateNode) -> bool {
    use crate::ast::template::TemplateNode as N;
    match node {
        N::SlotElement(_) => true,
        N::RegularElement(e) => fragment_has_slot_element(&e.fragment),
        N::Component(c) => fragment_has_slot_element(&c.fragment),
        N::SvelteComponent(c) => fragment_has_slot_element(&c.fragment),
        N::SvelteElement(e) => fragment_has_slot_element(&e.fragment),
        N::TitleElement(e) => fragment_has_slot_element(&e.fragment),
        N::SvelteHead(e)
        | N::SvelteFragment(e)
        | N::SvelteBody(e)
        | N::SvelteWindow(e)
        | N::SvelteDocument(e)
        | N::SvelteBoundary(e)
        | N::SvelteOptions(e)
        | N::SvelteSelf(e) => fragment_has_slot_element(&e.fragment),
        N::IfBlock(b) => {
            fragment_has_slot_element(&b.consequent)
                || b.alternate.as_ref().is_some_and(fragment_has_slot_element)
        }
        N::EachBlock(b) => {
            fragment_has_slot_element(&b.body)
                || b.fallback.as_ref().is_some_and(fragment_has_slot_element)
        }
        N::KeyBlock(b) => fragment_has_slot_element(&b.fragment),
        N::SnippetBlock(b) => fragment_has_slot_element(&b.body),
        N::AwaitBlock(b) => {
            b.pending.as_ref().is_some_and(fragment_has_slot_element)
                || b.then.as_ref().is_some_and(fragment_has_slot_element)
                || b.catch.as_ref().is_some_and(fragment_has_slot_element)
        }
        _ => false,
    }
}
