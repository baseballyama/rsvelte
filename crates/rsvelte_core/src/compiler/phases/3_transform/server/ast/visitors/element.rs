//! Server `RegularElement` visitor — the Rust port of
//! `3-transform/server/visitors/RegularElement.js` (STATIC attribute path only).
//!
//! Mirrors the non-special branch of upstream `RegularElement`:
//!   - push `<name` literal,
//!   - emit static attributes (`build_element_attributes` — static path),
//!   - push `>` (or `/>` for void elements),
//!   - recurse into children via [`process_children`],
//!   - push `</name>` (unless void).
//!
//! 写経 gaps (TODO): dynamic / spread / directive attributes, `<select>` /
//! `<option>` / `<textarea>` / `<script>` / `<style>` special branches, dev
//! `push_element` markers, `clean_nodes` hoisting + whitespace trimming, and the
//! async `PromiseOptimiser` wrapping. Any non-static attribute is currently
//! skipped (emitting nothing) so the build stays correct for the static cases.

use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, RegularElement};
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use crate::compiler::phases::phase3_transform::shared::template::{escape_attr, is_void_element};

use super::shared::{TemplateEntry, process_children};

/// Visit a `<name ...>children</name>` regular element (static path).
pub fn visit_regular_element<'a>(node: &RegularElement, state: &mut ServerTransformState<'a>) {
    let name = node.name.as_str();
    let is_void = is_void_element(name);

    // -- open tag + static attributes --------------------------------------
    let mut open = format!("<{name}");
    if let Some(attrs) = build_static_attributes(node) {
        open.push_str(&attrs);
    }
    open.push_str(if is_void { "/>" } else { ">" });
    state.template.push(TemplateEntry::Literal(open));

    // -- children -----------------------------------------------------------
    if !is_void {
        // Determine the child namespace from analysis metadata (svg / mathml /
        // html), mirroring upstream's `determine_namespace_for_children`. The
        // RegularElement parent drives the `<pre>` / `<select>` / table /
        // svg whitespace special-cases inside `process_children`.
        let namespace = if node.metadata.svg {
            "svg"
        } else if node.metadata.mathml {
            "mathml"
        } else {
            "html"
        };
        process_children(&node.fragment.nodes, Some(node), namespace, state);
        state
            .template
            .push(TemplateEntry::Literal(format!("</{name}>")));
    }
}

/// Build the static portion of an element's attribute string (`r#" class="foo""#`
/// etc.). Returns `None` only when there are no attributes. Any non-static
/// attribute (expression value, directive, spread) is skipped with a TODO —
/// the simple visitor set only handles fully-static attributes.
fn build_static_attributes(node: &RegularElement) -> Option<String> {
    if node.attributes.is_empty() {
        return None;
    }
    let mut out = String::new();
    for attr in &node.attributes {
        match attr {
            Attribute::Attribute(a) => match &a.value {
                // Boolean attribute: ` name=""` (upstream element.js renders the
                // `value === true` case as `name=""`, not a bare `name`).
                AttributeValue::True(_) => {
                    out.push(' ');
                    out.push_str(a.name.as_str());
                    out.push_str("=\"\"");
                }
                // Pure-text value: ` name="value"`.
                AttributeValue::Sequence(parts) => {
                    if let Some(text) = static_text_of(parts) {
                        out.push(' ');
                        out.push_str(a.name.as_str());
                        out.push_str("=\"");
                        out.push_str(&escape_attr(&text));
                        out.push('"');
                    }
                    // TODO: mixed text+expression sequence (dynamic).
                }
                // Expression value: dynamic — TODO.
                AttributeValue::Expression(_) => {}
            },
            // TODO: SpreadAttribute / directives.
            _ => {}
        }
    }
    if out.is_empty() { None } else { Some(out) }
}

/// If every part of an attribute value sequence is static `Text`, return the
/// concatenated text; otherwise `None` (a dynamic value the static path can't
/// handle yet).
fn static_text_of(parts: &[AttributeValuePart]) -> Option<String> {
    let mut s = String::new();
    for part in parts {
        match part {
            AttributeValuePart::Text(t) => s.push_str(t.data.as_str()),
            AttributeValuePart::ExpressionTag(_) => return None,
        }
    }
    Some(s)
}
