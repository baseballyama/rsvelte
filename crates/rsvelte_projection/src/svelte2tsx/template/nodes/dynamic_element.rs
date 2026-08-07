//! `<svelte:element this={…}>`. Mirrors the dynamic-element branch of
//! `htmlxtojsx_v2/nodes/Element.ts`.

use std::fmt::Write as _;

use crate::ast::template::{Attribute, SvelteDynamicElement};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, slice_src};

use crate::svelte2tsx::template::attributes::binding::{
    any_bind_needs_element_var, build_bind_directive_suffix, element_var_base_name,
};
use crate::svelte2tsx::template::attributes::build_attributes_string;
use crate::svelte2tsx::template::attributes::class_style::build_class_style_directive_suffix_segments;
use crate::svelte2tsx::template::attributes::directive_suffix::build_directive_prefix_suffix;
use crate::svelte2tsx::template::ctx::Counter;
use crate::svelte2tsx::template::segs::segs_to_string;
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};
use crate::svelte2tsx::template::utils::opener_spacing::{OpenerCtx, opener_spacing};
use crate::svelte2tsx::template::utils::source::{find_closing_tag_start, find_opening_tag_end};
use crate::svelte2tsx::template::walk::process_fragment_inplace;

use super::component_slots::{
    build_named_slot_element_attrs, default_slot_let_block, named_slot_let_block,
};
use super::slot_element::slot_attr_static_name;

/// Handle `<svelte:element this={tag}>`.
pub(crate) fn handle_svelte_dynamic_element(
    el: &SvelteDynamicElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    // Named-slot routing: `<svelte:element … slot="x">` inside a component's
    // children targets the parent component's named slot. Wrap the whole
    // `createElement(...)` in a `$$slot_def["x"]` block and drop the `slot`
    // attribute. Take the context so the element's own children don't inherit
    // it; restore it for following siblings.
    let saved_slot = counter.slot_inst.take();
    let named_slot: Option<(&str, &str)> = saved_slot
        .as_ref()
        .zip(slot_attr_static_name(&el.attributes))
        .map(|(inst, name)| (inst.as_str(), name));
    let named_slot_block = named_slot
        .as_ref()
        .map(|(inst, target_slot)| named_slot_let_block(&el.attributes, inst, target_slot, source));
    // `<svelte:element let:x>` is an `Element` in official svelte2tsx, so its
    // own `let:` forwards through the enclosing component's `$$slot_def.default`.
    let default_slot_let = default_slot_let_block(&el.attributes, saved_slot.as_ref(), source);

    let raw_tag_text = get_expression_text(&el.tag, source);
    // If the `this` attribute value is a plain string literal (this="tag"),
    // the parser stores just the text without quotes. We need to wrap it
    // in quotes to produce valid JavaScript: createElement("tag", ...).
    let tag_text = if let Some((start, _end)) = get_expression_range(&el.tag) {
        let before = if start > 0 {
            source.as_bytes()[(start - 1) as usize]
        } else {
            b'{'
        };
        if before == b'"' || before == b'\'' {
            // String literal: wrap in quotes
            format!("\"{}\"", raw_tag_text)
        } else {
            raw_tag_text.to_string()
        }
    } else {
        raw_tag_text.to_string()
    };
    let opening_tag_end =
        find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes);
    // In a named-slot context the `slot` attribute is consumed by the wrapper
    // block, so build the attributes without it.
    let attrs_str = if named_slot.is_some() {
        build_named_slot_element_attrs(&el.attributes, source)
    } else {
        build_attributes_string(
            &el.attributes,
            source,
            &counter.element_opener_comments,
            saved_slot.is_some(),
            options.namespace.preserves_attribute_case(),
        )
    };

    // `<svelte:element this={tag}>` names itself with the tag expression; a
    // literal `this="div"` is emitted as a string and keeps no source range.
    let tag_range = if tag_text.starts_with('"') {
        None
    } else {
        get_expression_range(&el.tag)
    };
    let spacing = opener_spacing(
        source,
        el.start,
        &el.name,
        opening_tag_end,
        tag_range,
        &el.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: true,
            in_component_slot: saved_slot.is_some(),
            tag_name: &el.name,
            is_slot_tag: false,
        },
    );
    // The slot-def block sits inside the opening tag's leading whitespace, so it
    // is emitted after the indent rather than before it.
    let indent = " ".repeat(spacing.before_block);
    let indent = match named_slot_block {
        Some(block) => {
            str.prepend_left(el.start, &format!("{}{}", indent, block));
            String::new()
        }
        None => match &default_slot_let {
            Some(block) => {
                str.append_left_fmt(el.start, format_args!("{}{}", indent, block));
                String::new()
            }
            None => indent,
        },
    };

    // `use:` / `transition:` / `animate:` directives, same V4 emission as on a
    // regular element. The action's `mapElementTag` uses the literal element
    // name (`svelte:element`); the `createElement` first arg stays the dynamic
    // tag expression.
    let (directive_prefix, directive_suffix, action_count) =
        build_directive_prefix_suffix(&el.attributes, source, &el.name);
    let actions_arg = if action_count > 0 {
        let mut args = String::from(", __sveltets_2_union(");
        for i in 0..action_count {
            if i > 0 {
                args.push(',');
            }
            let _ = write!(args, "$$action_{}", i);
        }
        args.push(')');
        args
    } else {
        String::new()
    };
    // Only the action `directive_prefix` (the `const $$action_N = …;`
    // declarations) needs an extra inner block scope; a transition/animate-only
    // suffix is just appended after the createElement, no extra braces.
    let needs_inner_block = !directive_prefix.is_empty();

    // Check if this is a self-closing element (no separate closing tag).
    // Also covers HTML void elements like `<input>`, `<br>`, `<img>` which have
    // no closing tag in the source — `is_void_element` keeps the opener and
    // closing brace on a single line, mirroring the JS reference's behaviour
    // for void tags.
    let is_self_closing = el.fragment.nodes.is_empty()
        && (slice_src(source, el.start as usize, el.end as usize)
            .trim_end()
            .ends_with("/>")
            || crate::compiler::utils::is_void_element(&el.name));

    let attrs_inner = if spacing.in_attr_object > 0 {
        let mut padded = " ".repeat(spacing.in_attr_object);
        padded.push_str(&attrs_str);
        padded
    } else {
        attrs_str
    };
    // With directives an extra inner block scope wraps the createElement so the
    // action declarations (in `directive_prefix`) are in scope: ` {<prefix>{ … }}`.
    let inner_open = if needs_inner_block { "{" } else { "" };
    let inner_close = if needs_inner_block { "}" } else { "" };
    // `bind:this` / one-way bindings on `<svelte:element>` need the
    // `const $$_svelteelement<depth> = createElement(...)` form so the binding
    // assignment can reference it. Mirrors regular-element / Element.ts lowering.
    let needs_element_var = any_bind_needs_element_var(&el.attributes, source);
    let element_var = if needs_element_var {
        Some(format!("$$_{}{}", element_var_base_name(&el.name), depth))
    } else {
        None
    };
    let bind_suffix = build_bind_directive_suffix(
        &el.attributes,
        source,
        element_var.as_deref(),
        &el.name,
        options.is_ts_file,
    );
    let element_var_decl = element_var
        .as_ref()
        .map(|v| format!("const {} = ", v))
        .unwrap_or_default();
    // `class:`/`style:` directives lower to statements after the createElement
    // (`class:active={x}` → ` x;`), same as a regular element.
    let class_style_suffix = segs_to_string(
        &build_class_style_directive_suffix_segments(&el.attributes, source),
        source,
    );
    // ` <var=>svelteHTML.createElement(tag<actions_arg>, {attrs});<suffix>` — no
    // leading `{`; the block brace comes from the outer ` {` (and `inner_open`
    // when directives add an extra scope).
    // The post-`createElement` suffix statements — `class:`/`style:`, transition/animate
    // (`directive_suffix`), and `bind:` (`bind_suffix`) — are emitted in SOURCE-ATTRIBUTE
    // ORDER, mirroring the regular-element handler's sort logic.
    let first_bind_pos_se = el
        .attributes
        .iter()
        .filter_map(|a| match a {
            Attribute::BindDirective(b) => Some(b.start),
            _ => None,
        })
        .min();
    let first_directive_pos_se = el
        .attributes
        .iter()
        .filter_map(|a| match a {
            Attribute::TransitionDirective(t) => Some(t.start),
            Attribute::AnimateDirective(an) => Some(an.start),
            _ => None,
        })
        .min();
    let first_class_style_pos_se = el
        .attributes
        .iter()
        .filter_map(|a| match a {
            Attribute::ClassDirective(c) => Some(c.start),
            Attribute::StyleDirective(s) => Some(s.start),
            _ => None,
        })
        .min();
    let sorted_suffix = {
        let mut pieces: Vec<(u32, &str)> = Vec::new();
        if !directive_suffix.is_empty() {
            pieces.push((
                first_directive_pos_se.unwrap_or(u32::MAX),
                &directive_suffix,
            ));
        }
        if !class_style_suffix.is_empty() {
            pieces.push((
                first_class_style_pos_se.unwrap_or(u32::MAX),
                &class_style_suffix,
            ));
        }
        if !bind_suffix.is_empty() {
            pieces.push((first_bind_pos_se.unwrap_or(u32::MAX), &bind_suffix));
        }
        pieces.sort_by_key(|(pos, _)| *pos);
        pieces.into_iter().map(|(_, s)| s).collect::<String>()
    };
    let create = |attrs: &str| {
        format!(
            " {}svelteHTML.createElement({}{}, {{{}}});{}",
            element_var_decl, tag_text, actions_arg, attrs, sorted_suffix
        )
    };
    if is_self_closing {
        // Self-closing: outer block, optional inner directive block, close both.
        let opener = format!(
            "{}{{{}{}{}{}}}",
            indent,
            directive_prefix,
            inner_open,
            create(&attrs_inner),
            inner_close
        );
        str.overwrite(el.start, el.end, &opener);
    } else {
        let opener = format!(
            "{}{{{}{}{}",
            indent,
            directive_prefix,
            inner_open,
            create(&attrs_inner)
        );
        str.overwrite(el.start, opening_tag_end, &opener);

        // svelte:element is an element node → children at depth+1.
        process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

        let closing_tag_start = find_closing_tag_start(source, el.end);
        let close = format!(" }}{}", inner_close);
        if closing_tag_start < el.end {
            str.overwrite(closing_tag_start, el.end, &close);
        } else {
            str.append_left(el.end, &close);
        }
    }

    // Close the `$$slot_def[...]` / `$$slot_def.default` wrapper block; restore
    // context.
    if named_slot.is_some() || default_slot_let.is_some() {
        str.append_left(el.end, "}");
    }
    counter.slot_inst = saved_slot;
}
