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
    //
    // CSS scoping: when Phase 2 marked this element `scoped` AND the component
    // has a non-empty CSS hash, the scope class (`analysis.css.hash`, already
    // prefixed `svelte-…`) is injected — either merged into a static
    // `class="..."` value or, when there is no class attribute (and no dynamic
    // class), appended as a fresh `class="svelte-…"`. Mirrors upstream's
    // `build_element_attributes` (`css_hash = node.metadata.scoped ?
    // analysis.css.hash : null`).
    let css_hash: Option<&str> = if node.metadata.scoped && !state.analysis.css.hash.is_empty() {
        Some(state.analysis.css.hash.as_str())
    } else {
        None
    };

    let mut open = format!("<{name}");
    if let Some(attrs) = build_static_attributes(node, css_hash) {
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
/// etc.). Returns `None` only when there are no attributes AND no scope class is
/// injected. Any non-static attribute (expression value, directive, spread) is
/// skipped with a TODO — the simple visitor set only handles fully-static
/// attributes.
///
/// `css_hash` is `Some(hash)` when the element is CSS-scoped (`metadata.scoped`
/// + a non-empty component hash). The hash already carries the `svelte-…`
/// prefix (`generate_css_hash`). When set, the scope class is applied per
/// upstream `build_element_attributes`:
///   - merged into a static `class="..."` value (`(value + ' ' + hash).trim()`),
///     or
///   - appended as a fresh `class="svelte-…"` at the END of the attribute list
///     when there is no class attribute and no class directive (matching the
///     text oracle's trailing no-class injection).
///
/// KNOWN GAP: a *dynamic* class attribute (expression value) or `class:`
/// directive routes through `$.attr_class`/`$.clsx` upstream — not handled
/// here. In that case the fresh-class injection is skipped (the element will
/// diverge from the oracle, but we never emit a wrong static class).
fn build_static_attributes(node: &RegularElement, css_hash: Option<&str>) -> Option<String> {
    // Does the element carry a class signal the static path can't fold the hash
    // into (a dynamic class attr, a `class:` directive, or a spread)? If so we
    // must NOT inject a fresh `class="svelte-<hash>"` (the dynamic path owns it).
    let has_dynamic_class = node.attributes.iter().any(|attr| match attr {
        Attribute::ClassDirective(_) | Attribute::SpreadAttribute(_) => true,
        Attribute::Attribute(a) if a.name.as_str() == "class" => {
            // A class attribute that is NOT pure static text is dynamic.
            match &a.value {
                AttributeValue::True(_) => false,
                AttributeValue::Sequence(parts) => static_text_of(parts).is_none(),
                AttributeValue::Expression(_) => true,
            }
        }
        _ => false,
    });
    let has_static_class = node
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::Attribute(a) if a.name.as_str() == "class"))
        && !has_dynamic_class;

    if node.attributes.is_empty() && css_hash.is_none() {
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
                    if let Some(mut text) = static_text_of(parts) {
                        // Merge the scope class into a static `class="..."` value
                        // (`(value + ' ' + hash).trim()`, upstream element.js
                        // line 237).
                        if a.name.as_str() == "class"
                            && let Some(hash) = css_hash
                        {
                            text = format!("{text} {hash}").trim().to_string();
                        }
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

    // No class attribute and no dynamic class → append the fresh scope class at
    // the end (mirrors the text oracle's trailing `class="svelte-…"`). `hash`
    // is already `svelte-…`.
    if let Some(hash) = css_hash
        && !has_static_class
        && !has_dynamic_class
    {
        out.push_str(&format!(" class=\"{hash}\""));
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
