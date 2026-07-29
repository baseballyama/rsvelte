//! `<slot>` elements. Mirrors `htmlxtojsx_v2/nodes/slot.ts`.

use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, SlotElement};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::Svelte2TsxOptions;

use crate::svelte2tsx::template::attributes::attribute::format_attribute_node;
use crate::svelte2tsx::template::attributes::binding::format_bind_directive;
use crate::svelte2tsx::template::attributes::let_::{
    build_let_destructure_string, get_let_directives,
};
use crate::svelte2tsx::template::attributes::spread::format_spread_attribute;
use crate::svelte2tsx::template::ctx::Counter;
use crate::svelte2tsx::template::utils::expr::get_expression_text;
use crate::svelte2tsx::template::utils::source::{find_closing_tag_start, find_opening_tag_end};
use crate::svelte2tsx::template::walk::process_fragment_inplace;

/// Handle `<slot>` element.
///
/// Generates `{ __sveltets_createSlot("name", { attrs }); fallback_children }`.
///
/// The slot name is determined by the `name` attribute (default: "default").
/// Other attributes become slot props. `bind:this` gets special handling.
pub(crate) fn handle_slot_element(
    el: &SlotElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    // Named-slot forwarding: `<slot slot="x">` inside a component's children
    // distributes into the parent component's named slot `x`. Wrap the whole
    // `__sveltets_createSlot(...)` in a `$$slot_def["x"]` destructure block
    // referencing the enclosing component instance. Take the context so the
    // slot's own fallback children don't inherit it; restore it for siblings.
    let saved_slot = counter.slot_inst.take();
    let named_slot: Option<(String, String)> = saved_slot.as_ref().and_then(|inst| {
        get_slot_attr_value(&el.attributes, source).map(|name| (inst.clone(), name))
    });
    if let Some((ref inst, ref target_slot)) = named_slot {
        let lets = get_let_directives(&el.attributes);
        let let_destructure = build_let_destructure_string(&lets, source);
        let block_open = format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
            let_destructure, inst, target_slot
        );
        str.prepend_left(el.start, &block_open);
    }

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);

    // Extract the slot name from attributes (default: "default")
    let slot_name = get_slot_name(&el.attributes, source);

    // Check for bind:this directive
    let bind_this_expr = get_bind_this_expr(&el.attributes, source);

    // Build slot props string (excluding `name` attribute and `bind:this`).
    // Official emits a leading space inside a non-empty props object
    // (`{ "message":… }`); empty stays `{}`. oxfmt normalises this for valid
    // output, but a top-level-await slot is emitted raw, where the space matters.
    // Note: `build_slot_props_string` already prepends a space to non-empty
    // results, so we must NOT add another space here in the format string.
    let slot_props = build_slot_props_string(&el.attributes, source);
    let slot_props_obj = if slot_props.is_empty() {
        "{}".to_string()
    } else {
        format!("{{{}}}", slot_props)
    };

    // Build the slot call
    let opener = if bind_this_expr.is_some() {
        format!(
            " {{ const $$_slot{} = __sveltets_createSlot(\"{}\", {});",
            counter.next_for("slot"),
            slot_name,
            slot_props_obj
        )
    } else {
        format!(
            " {{ __sveltets_createSlot(\"{}\", {});",
            slot_name, slot_props_obj
        )
    };
    str.overwrite(el.start, opening_tag_end, &opener);

    // Process fallback children: slot is an element → children at depth+1.
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

    // Handle closing tag
    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        if let Some(ref bind_expr) = bind_this_expr {
            // For bind:this, assign the slot variable: `s = $$_slot0;}
            str.overwrite(
                closing_tag_start,
                el.end,
                &format!(
                    "{} = $$_slot{};}}",
                    bind_expr,
                    counter
                        .counters
                        .get("slot")
                        .copied()
                        .unwrap_or(0)
                        .saturating_sub(1)
                ),
            );
        } else {
            str.overwrite(closing_tag_start, el.end, " }");
        }
    } else {
        // Self-closing slot
        if let Some(ref bind_expr) = bind_this_expr {
            let slot_idx = counter
                .counters
                .get("slot")
                .copied()
                .unwrap_or(0)
                .saturating_sub(1);
            str.overwrite(
                el.end - 2, // rewrite the `/>` portion
                el.end,
                &format!("{} = $$_slot{};}}", bind_expr, slot_idx),
            );
        } else {
            // Self-closing without bind:this - just close the block
            // The `/>` is part of the opening tag which was already overwritten
            str.append_left(el.end, "}");
        }
    }

    // Close the named-slot `$$slot_def[...]` wrapper block, then restore the
    // slot context for following siblings.
    if named_slot.is_some() {
        str.append_left(el.end, "}");
    }
    counter.slot_inst = saved_slot;
}

/// Extract the slot name from a `<slot>` element's attributes.
/// Returns "default" if no `name` attribute is present.
/// Slot name used as the **type** key in the component's `slots: { … }` return.
/// A static `name="header"` yields `header`; a missing name yields `default`; a
/// dynamic `name="{foo}"` (or `name={foo}`) yields the literal `undefined`
/// (official emits `slots: { undefined: {} }` for a non-static slot name).
pub(crate) fn slot_name_for_type(attributes: &[Attribute]) -> String {
    for attr in attributes {
        if let Attribute::Attribute(node) = attr
            && node.name == "name"
        {
            match &node.value {
                AttributeValue::Sequence(parts) => {
                    // Dynamic if any part is an expression tag.
                    if parts
                        .iter()
                        .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)))
                    {
                        return "undefined".to_string();
                    }
                    let mut name = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            name.push_str(&text.raw);
                        }
                    }
                    if !name.is_empty() {
                        return name;
                    }
                }
                AttributeValue::Expression(_) => return "undefined".to_string(),
                _ => {}
            }
        }
    }
    "default".to_string()
}

pub(crate) fn dollar_slot_name(attributes: &[Attribute]) -> String {
    // The legacy declaration uses the last static text part, unlike the slot type key.
    let mut slot_name = "default".to_string();
    for attr in attributes {
        if let Attribute::Attribute(node) = attr
            && node.name == "name"
            && let AttributeValue::Sequence(parts) = &node.value
        {
            for part in parts {
                if let AttributeValuePart::Text(text) = part {
                    slot_name = text.raw.to_string();
                }
            }
        }
    }
    slot_name
}

pub(crate) fn get_slot_name(attributes: &[Attribute], source: &str) -> String {
    for attr in attributes {
        if let Attribute::Attribute(node) = attr
            && node.name == "name"
        {
            match &node.value {
                AttributeValue::Sequence(parts) => {
                    // name="header" → parts is a single Text
                    let mut name = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            name.push_str(&text.raw);
                        }
                    }
                    if !name.is_empty() {
                        return name;
                    }
                    // Quoted mustache value, e.g. `name='{foo}'`: official uses
                    // the raw source text of the value verbatim as the slot-name
                    // string (`__sveltets_createSlot("{foo}", …)`). Slice from the
                    // first to the last value part.
                    if let (Some(first), Some(last)) = (parts.first(), parts.last()) {
                        let start = match first {
                            AttributeValuePart::Text(t) => t.start,
                            AttributeValuePart::ExpressionTag(e) => e.start,
                        } as usize;
                        let end = match last {
                            AttributeValuePart::Text(t) => t.end,
                            AttributeValuePart::ExpressionTag(e) => e.end,
                        } as usize;
                        if start < end && end <= source.len() {
                            return source[start..end].to_string();
                        }
                    }
                }
                AttributeValue::Expression(expr) => {
                    // name={expr} - use the expression text
                    return get_expression_text(&expr.expression, source).to_string();
                }
                _ => {}
            }
        }
    }
    "default".to_string()
}

/// Get the `bind:this` expression text from a slot element's attributes.
pub(crate) fn get_bind_this_expr<'a>(
    attributes: &'a [Attribute],
    source: &'a str,
) -> Option<String> {
    for attr in attributes {
        if let Attribute::BindDirective(bind) = attr
            && bind.name == "this"
        {
            return Some(get_expression_text(&bind.expression, source).to_string());
        }
    }
    None
}

/// Build the props string for a `<slot>` element.
///
/// Excludes the `name` attribute and `bind:this` directive.
/// Format matches `__sveltets_createSlot("name", { props })`.
pub(crate) fn build_slot_props_string(attributes: &[Attribute], source: &str) -> String {
    let mut parts: Vec<String> = Vec::new();

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                // Skip the `name` attribute - it determines the slot name, not a prop.
                // Skip `slot` too — on a `<slot slot="x">` forward it targets the
                // enclosing component's named slot (consumed by the
                // `$$slot_def["x"]` wrapper), it is not a slot prop.
                if node.name == "name" || node.name == "slot" {
                    continue;
                }
                // Slot props are neither DOM-element props nor component props;
                // use is_element=false (no data-* wrapping; --* wrapping if present).
                if let Some(s) = format_attribute_node(node, source, false) {
                    parts.push(s);
                }
            }
            Attribute::SpreadAttribute(spread) => {
                if let Some(s) = format_spread_attribute(spread, source) {
                    parts.push(s);
                }
            }
            Attribute::BindDirective(bind) => {
                // Skip bind:this on slot elements
                if bind.name == "this" {
                    continue;
                }
                parts.push(format_bind_directive(bind, source));
            }
            _ => {
                // Other directives are not typical on slot elements
            }
        }
    }

    let result = parts.join("");
    if result.is_empty() {
        // Empty props: `{}` (no space)
        String::new()
    } else {
        // Slot props go inside `{<props>}`. Official preserves the source
        // whitespace between `<slot` and the first attribute (always at least
        // one space) as a leading space after `{`, e.g. `{ "message":… }`.
        format!(" {result}")
    }
}

/// Get the static `slot="name"` attribute value from an element's attributes.
/// Returns None if no `slot` attribute is present, or if its value is a dynamic
/// expression (`slot={foo}`).
///
/// Official svelte2tsx only treats a `slot` attribute as a named-slot marker
/// when its value is static `Text` (`attributeValueIsOfType(attr.value, 'Text')`
/// in `htmlxtojsx_v2/nodes/Attribute.ts`). A dynamic `slot={foo}` is emitted as
/// an ordinary attribute (`{ slot: foo }`) and does NOT trigger the
/// `$$slot_def[...]` lowering or the component-instance const.
pub(crate) fn get_slot_attr_value(attributes: &[Attribute], _source: &str) -> Option<String> {
    for attr in attributes {
        if let Attribute::Attribute(node) = attr
            && node.name == "slot"
        {
            match &node.value {
                AttributeValue::Sequence(parts) => {
                    let mut name = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            name.push_str(&text.raw);
                        }
                    }
                    if !name.is_empty() {
                        return Some(name);
                    }
                }
                // Dynamic `slot={foo}` is a regular attribute, not a named slot.
                AttributeValue::Expression(_) => {}
                _ => {}
            }
        }
    }
    None
}
