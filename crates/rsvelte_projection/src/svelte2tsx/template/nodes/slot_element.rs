//! `<slot>` elements. Mirrors `htmlxtojsx_v2/nodes/slot.ts`.

use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, SlotElement};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::Svelte2TsxOptions;

use crate::svelte2tsx::template::attributes::attribute::format_attribute_node;
use crate::svelte2tsx::template::attributes::binding::format_bind_directive;
use crate::svelte2tsx::template::attributes::let_::build_let_destructure_string;
use crate::svelte2tsx::template::attributes::spread::format_spread_attribute;
use crate::svelte2tsx::template::ctx::Counter;
use crate::svelte2tsx::template::utils::expr::get_expression_text;
use crate::svelte2tsx::template::utils::opener_spacing::{OpenerCtx, opener_spacing};
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
    str: &mut MagicString<'_>,
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
    let named_slot_block = named_slot.as_ref().map(|(inst, target_slot)| {
        let let_destructure = build_let_destructure_string(&el.attributes, source);
        format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
            let_destructure, inst, target_slot
        )
    });

    let opening_tag_end =
        find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes);

    // Extract the slot name from attributes (default: "default")
    let slot_name = get_slot_name(&el.attributes, source);

    // Check for bind:this directive
    let bind_this_expr = get_bind_this_expr(&el.attributes, source);

    // Build slot props string (excluding the `name` attribute and `bind:this`).
    let slot_props = build_slot_props_string(&el.attributes, source);
    // `__sveltets_createSlot("name"` keeps the source range of a static slot
    // name; a defaulted (absent) name is a literal and keeps none.
    let name_range = get_slot_name_range(&el.attributes);
    let spacing = opener_spacing(
        source,
        el.start,
        &el.name,
        opening_tag_end,
        name_range,
        &el.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: true,
            in_component_slot: saved_slot.is_some(),
            tag_name: &el.name,
            is_slot_tag: true,
        },
    );
    let slot_props_obj = if slot_props.is_empty() && spacing.in_attr_object == 0 {
        "{}".to_string()
    } else {
        format!("{{{}{}}}", " ".repeat(spacing.in_attr_object), slot_props)
    };

    // The slot-def block sits inside the opening tag's leading whitespace, so it
    // is emitted after the indent rather than before it.
    let indent = " ".repeat(spacing.before_block);
    let indent = match named_slot_block {
        Some(block) => {
            str.prepend_left(el.start, &format!("{}{}", indent, block));
            String::new()
        }
        None => indent,
    };
    let opener = if bind_this_expr.is_some() {
        format!(
            "{}{{ const $$_slot{} = __sveltets_createSlot(\"{}\", {});",
            indent,
            counter.next_slot(),
            slot_name,
            slot_props_obj
        )
    } else {
        format!(
            "{}{{ __sveltets_createSlot(\"{}\", {});",
            indent, slot_name, slot_props_obj
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
            str.overwrite_fmt(
                closing_tag_start,
                el.end,
                format_args!("{} = $$_slot{};}}", bind_expr, counter.last_slot()),
            );
        } else {
            str.overwrite(closing_tag_start, el.end, " }");
        }
    } else {
        // Self-closing slot
        if let Some(ref bind_expr) = bind_this_expr {
            let slot_idx = counter.last_slot();
            str.overwrite_fmt(
                el.end - 2, // rewrite the `/>` portion
                el.end,
                format_args!("{} = $$_slot{};}}", bind_expr, slot_idx),
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

/// Source range of the `<slot name=…>` value's first value part (official's
/// `value[0]`), verbatim-sliced by both `get_slot_name` (the emitted
/// `__sveltets_createSlot` key) and `opener_spacing` (whitespace accounting);
/// `None` when the name defaults, which official emits as a literal.
fn get_slot_name_range(attributes: &[Attribute]) -> Option<(u32, u32)> {
    attributes.iter().find_map(|attr| match attr {
        Attribute::Attribute(node) if node.name == "name" => match &node.value {
            AttributeValue::Sequence(parts) => parts.first().map(|part| match part {
                AttributeValuePart::Text(text) => (text.start, text.end),
                AttributeValuePart::ExpressionTag(tag) => (tag.start, tag.end),
            }),
            AttributeValue::Expression(tag) => Some((tag.start, tag.end)),
            AttributeValue::True(_) => None,
        },
        _ => None,
    })
}

pub(crate) fn get_slot_name(attributes: &[Attribute], source: &str) -> String {
    // Official only ever looks at `value[0]` (`nodes/Element.ts`'s `slotName`),
    // then slices its verbatim source range — including the braces of an
    // ExpressionTag and any inner whitespace — rather than re-serializing an
    // expression or concatenating multiple value parts.
    get_slot_name_range(attributes)
        .and_then(|(start, end)| {
            let (start, end) = (start as usize, end as usize);
            (start < end && end <= source.len()).then(|| source[start..end].to_string())
        })
        .unwrap_or_else(|| "default".to_string())
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

    parts.join("")
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
