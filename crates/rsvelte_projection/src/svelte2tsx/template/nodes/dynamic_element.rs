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
use crate::svelte2tsx::template::attributes::let_::build_let_destructure_string;
use crate::svelte2tsx::template::ctx::Counter;
use crate::svelte2tsx::template::segs::segs_to_string;
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};
use crate::svelte2tsx::template::utils::source::{find_closing_tag_start, find_opening_tag_end};
use crate::svelte2tsx::template::walk::process_fragment_inplace;

use super::component_slots::build_named_slot_element_attrs;
use super::slot_element::get_slot_attr_value;

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
    let named_slot: Option<(String, String)> = saved_slot.as_ref().and_then(|inst| {
        get_slot_attr_value(&el.attributes, source).map(|name| (inst.clone(), name))
    });
    if let Some((ref inst, ref target_slot)) = named_slot {
        let let_destructure = build_let_destructure_string(&el.attributes, source);
        let block_open = format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
            let_destructure, inst, target_slot
        );
        str.prepend_left(el.start, &block_open);
    }

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
    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
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
        )
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

    let attrs_self = if attrs_str.is_empty() {
        "  "
    } else {
        &attrs_str
    };
    let attrs_open = if attrs_str.is_empty() {
        " "
    } else {
        &attrs_str
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
            " {{{}{}{}{}}}",
            directive_prefix,
            inner_open,
            create(attrs_self),
            inner_close
        );
        str.overwrite(el.start, el.end, &opener);
    } else {
        let opener = format!(
            " {{{}{}{}",
            directive_prefix,
            inner_open,
            create(attrs_open)
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

    // Close the named-slot `$$slot_def[...]` wrapper block; restore context.
    if named_slot.is_some() {
        str.append_left(el.end, "}");
    }
    counter.slot_inst = saved_slot;
}
