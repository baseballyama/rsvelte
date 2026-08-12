//! `<slot>` elements. Mirrors `htmlxtojsx_v2/nodes/slot.ts`.

use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, SlotElement};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::Svelte2TsxOptions;

use crate::svelte2tsx::template::attributes::attribute::format_attribute_node;
use crate::svelte2tsx::template::attributes::binding::format_bind_directive;
use crate::svelte2tsx::template::attributes::spread::format_spread_attribute;
use crate::svelte2tsx::template::ctx::Counter;
use crate::svelte2tsx::template::utils::expr::get_expression_text;
use crate::svelte2tsx::template::utils::opener_spacing::{OpenerCtx, opener_spacing};
use crate::svelte2tsx::template::utils::source::{find_closing_tag_start, find_opening_tag_end};
use crate::svelte2tsx::template::walk::process_fragment_inplace;

use super::component_slots::{default_slot_let_block, named_slot_let_block};

/// Handle `<slot>` element.
///
/// Generates `{ __sveltets_createSlot("name", { attrs }); fallback_children }`.
///
/// The slot name is determined by the `name` attribute (default: "default").
/// Other attributes become slot props. `bind:this` gets special handling.
pub fn handle_slot_element(
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
    let named_slot: Option<(&str, &str)> = saved_slot
        .as_ref()
        .zip(slot_attr_static_name(&el.attributes))
        .map(|(inst, name)| (inst.as_str(), name));
    let named_slot_block = named_slot
        .as_ref()
        .map(|(inst, target_slot)| named_slot_let_block(&el.attributes, inst, target_slot, source));
    // `<slot let:x>` is an `Element` in official svelte2tsx, so its own `let:`
    // forwards through the enclosing component's `$$slot_def.default`.
    let default_slot_let = default_slot_let_block(&el.attributes, saved_slot.as_ref(), source);

    let opening_tag_end =
        find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes);

    // Extract the slot name from attributes (default: "default")
    let slot_name = get_slot_name(&el.attributes, source);

    // Check for bind:this directive
    let bind_this_expr = get_bind_this_expr(&el.attributes, source);

    // Build slot props string (excluding the `name` attribute and `bind:this`).
    let slot_props = build_slot_props_string(&el.attributes, source, named_slot.is_some());
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
            str.prepend_left(el.start, &format!("{indent}{block}"));
            String::new()
        }
        None => match &default_slot_let {
            Some(block) => {
                str.append_left_fmt(el.start, format_args!("{indent}{block}"));
                String::new()
            }
            None => indent,
        },
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
        format!("{indent}{{ __sveltets_createSlot(\"{slot_name}\", {slot_props_obj});")
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
                format_args!("{bind_expr} = $$_slot{slot_idx};}}"),
            );
        } else {
            // Self-closing without bind:this - just close the block
            // The `/>` is part of the opening tag which was already overwritten
            str.append_left(el.end, "}");
        }
    }

    // Close the `$$slot_def[...]` / `$$slot_def.default` wrapper block, then
    // restore the slot context for following siblings.
    if named_slot.is_some() || default_slot_let.is_some() {
        str.append_left(el.end, "}");
    }
    counter.slot_inst = saved_slot;
}

/// Official's `value[0]`: the FIRST part of an attribute value. Every official
/// slot-name path reads only this part and ignores the rest — `slot.ts`'s
/// `nameAttr.value[0].raw`, `Element.ts`'s `slotName`, `svelteAst.ts`'s
/// `getSlotName` and `Attribute.ts`'s `attributeValueIsOfType(value, 'Text')` —
/// so `name="a{b}c"` is the slot `a`, never the concatenation `ac`.
enum FirstValuePart<'a> {
    /// `value[0].type === 'Text'`; carries `value[0].raw`.
    Text(&'a str),
    /// `value[0]` is an expression, whose `.raw` is `undefined` in official.
    Expression,
}

/// `value[0]` of the attribute named `name`, or `None` when the attribute is
/// absent or boolean (`<slot name>` — official reads `undefined` there and
/// throws while dereferencing `.raw`; rsvelte degrades to the default instead).
fn first_value_part<'a>(attributes: &'a [Attribute], name: &str) -> Option<FirstValuePart<'a>> {
    attributes.iter().find_map(|attr| match attr {
        Attribute::Attribute(node) if node.name == name => match &node.value {
            AttributeValue::Sequence(parts) => parts.first().map(|part| match part {
                AttributeValuePart::Text(text) => FirstValuePart::Text(&text.raw),
                AttributeValuePart::ExpressionTag(_) => FirstValuePart::Expression,
            }),
            AttributeValue::Expression(_) => Some(FirstValuePart::Expression),
            AttributeValue::True(_) => None,
        },
        _ => None,
    })
}

/// Slot name used as the **type** key in the component's `slots: { … }` return
/// and in the legacy `$$slots` declaration — official `SlotHandler.handleSlot`'s
/// `nameAttr ? nameAttr.value[0].raw : 'default'`.
///
/// A static `name="header"` yields `header`, `name="a{b}c"` yields `a` (only
/// `value[0]` counts), a missing name yields `default`, and a `value[0]` that is
/// an expression yields the literal `undefined` (official stringifies its
/// `undefined` `.raw` into the key). An empty name keeps rsvelte's `default`
/// fallback: official's `''` key pairs with a syntactically broken
/// `__sveltets_createSlot(, …)` call, and `get_slot_name` already declines to
/// reproduce that.
pub fn slot_name_for_type(attributes: &[Attribute]) -> String {
    match first_value_part(attributes, "name") {
        Some(FirstValuePart::Text(raw)) if !raw.is_empty() => raw.to_string(),
        Some(FirstValuePart::Expression) => "undefined".to_string(),
        _ => "default".to_string(),
    }
}

/// Target slot of a component child's `slot=` attribute for the **scope**
/// resolution that types `let:` bindings (official `utils/svelteAst.ts`'s
/// `getSlotName`, read by `SlotHandler.getSlotConsumerOfComponent`).
///
/// This is `value[0].raw`, so `slot="a{b}c"` resolves `let:` against slot `a`
/// even though the JSX lowering keeps the same child in the *default* slot —
/// official really does apply two different rules here, see
/// [`slot_attr_static_name`].
pub fn slot_consumer_name<'a>(attributes: &'a [Attribute]) -> Option<&'a str> {
    match first_value_part(attributes, "slot") {
        Some(FirstValuePart::Text(raw)) => Some(raw),
        _ => None,
    }
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

pub fn get_slot_name(attributes: &[Attribute], source: &str) -> String {
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
pub fn get_bind_this_expr<'a>(attributes: &'a [Attribute], source: &'a str) -> Option<String> {
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
/// Excludes the `name` attribute and `bind:this` directive. `drop_slot_attr`
/// additionally drops `slot=`, which happens only when the attribute was
/// consumed by an enclosing `$$slot_def["x"]` wrapper — official's
/// `handleAttribute` returns early for `slot=` under exactly that condition, so
/// an unforwarded `slot=` (dynamic, interpolated, or outside a component) stays
/// an ordinary slot prop.
/// Format matches `__sveltets_createSlot("name", { props })`.
pub fn build_slot_props_string(
    attributes: &[Attribute],
    source: &str,
    drop_slot_attr: bool,
) -> String {
    let mut parts: Vec<String> = Vec::new();

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                // Skip the `name` attribute - it determines the slot name, not a prop.
                if node.name == "name" || (node.name == "slot" && drop_slot_attr) {
                    continue;
                }
                // Slot props are neither DOM-element props nor component props;
                // use is_element=false (no data-* wrapping; --* wrapping if present).
                parts.push(format_attribute_node(node, source, false));
            }
            Attribute::SpreadAttribute(spread) => {
                parts.push(format_spread_attribute(spread, source));
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

/// Target slot of an element's `slot=` attribute for the **JSX** lowering, or
/// `None` when the attribute is absent or not a named-slot marker.
///
/// Official svelte2tsx only treats `slot=` as a marker when the whole value is a
/// single `Text` part (`attributeValueIsOfType(attr.value, 'Text')` in
/// `htmlxtojsx_v2/nodes/Attribute.ts`). A dynamic `slot={foo}` *and* an
/// interpolated `slot="a{b}c"` are both emitted as ordinary attributes and do
/// NOT trigger the `$$slot_def[...]` lowering or the component-instance const —
/// unlike [`slot_consumer_name`], which reads `value[0]` for the same attribute.
pub fn slot_attr_static_name<'a>(attributes: &'a [Attribute]) -> Option<&'a str> {
    attributes.iter().find_map(|attr| match attr {
        Attribute::Attribute(node) if node.name == "slot" => match &node.value {
            AttributeValue::Sequence(parts) => match parts.as_slice() {
                [AttributeValuePart::Text(text)] => Some(text.raw.as_ref()),
                _ => None,
            },
            _ => None,
        },
        _ => None,
    })
}
