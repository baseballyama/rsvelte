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
use crate::svelte2tsx::template::nodes::snippet_block::hoist_snippet_blocks;
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
pub fn handle_svelte_dynamic_element(
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
            format!("\"{raw_tag_text}\"")
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
        build_named_slot_element_attrs(&el.attributes, source, &options.typings_namespace)
    } else {
        build_attributes_string(
            &el.attributes,
            source,
            &counter.element_opener_comments,
            saved_slot.is_some(),
            options.namespace.preserves_attribute_case(),
            options.preserves_bind_prefix(),
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
            preserve_bind: options.preserves_bind_prefix(),
        },
    );
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

    render_dynamic_element(
        el,
        DynamicElementRenderInput {
            source,
            options,
            depth,
            opening_tag_end,
            indent: &indent,
            tag_text: &tag_text,
            attrs: &attrs_str,
            attribute_padding: spacing.in_attr_object,
        },
        str,
        counter,
    );

    // Close the `$$slot_def[...]` / `$$slot_def.default` wrapper block; restore
    // context.
    if named_slot.is_some() || default_slot_let.is_some() {
        str.append_left(el.end, "}");
    }
    counter.slot_inst = saved_slot;
}

#[derive(Clone, Copy)]
struct DynamicElementRenderInput<'a> {
    source: &'a str,
    options: &'a Svelte2TsxOptions,
    depth: u32,
    opening_tag_end: u32,
    indent: &'a str,
    tag_text: &'a str,
    attrs: &'a str,
    attribute_padding: usize,
}

fn render_dynamic_element(
    el: &SvelteDynamicElement,
    input: DynamicElementRenderInput<'_>,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
) {
    let (directive_prefix, directive_suffix, action_count) = build_directive_prefix_suffix(
        &el.attributes,
        input.source,
        &el.name,
        &input.options.typings_namespace,
    );
    let actions_arg = dynamic_action_arguments(action_count);
    let inner_close = if directive_prefix.is_empty() { "" } else { "}" };
    let attrs = format!("{}{}", " ".repeat(input.attribute_padding), input.attrs);
    let element_var = any_bind_needs_element_var(&el.attributes, input.source)
        .then(|| format!("$$_{}{}", element_var_base_name(&el.name), input.depth));
    let bind_suffix = build_bind_directive_suffix(
        &el.attributes,
        input.source,
        element_var.as_deref(),
        &el.name,
        input.options.is_ts_file || !input.options.emit_jsdoc,
    );
    let element_var_decl = element_var
        .as_ref()
        .map(|value| format!("const {value} = "))
        .unwrap_or_default();
    let class_style_suffix = segs_to_string(
        &build_class_style_directive_suffix_segments(&el.attributes, input.source),
        input.source,
    );
    let suffix = ordered_dynamic_suffix(
        &el.attributes,
        &directive_suffix,
        &class_style_suffix,
        &bind_suffix,
    );
    let create = format!(
        " {element_var_decl}{}.createElement({}{actions_arg}, {{{attrs}}});{suffix}",
        input.options.typings_namespace, input.tag_text,
    );
    let inner_open = if directive_prefix.is_empty() { "" } else { "{" };
    if dynamic_element_is_self_closing(el, input.source) {
        str.overwrite(
            el.start,
            el.end,
            &format!(
                "{}{{{directive_prefix}{inner_open}{create}{inner_close}}}",
                input.indent
            ),
        );
        return;
    }

    str.overwrite(
        el.start,
        input.opening_tag_end,
        &format!("{}{{{directive_prefix}{inner_open}{create}", input.indent),
    );
    hoist_snippet_blocks(&el.fragment, input.source, str);
    process_fragment_inplace(
        &el.fragment,
        input.source,
        input.options,
        str,
        counter,
        input.depth + 1,
    );
    let close = format!(" }}{inner_close}");
    let closing_tag_start = find_closing_tag_start(input.source, el.end);
    if closing_tag_start < el.end {
        str.overwrite(closing_tag_start, el.end, &close);
    } else {
        str.append_left(el.end, &close);
    }
}

fn dynamic_action_arguments(action_count: usize) -> String {
    if action_count == 0 {
        return String::new();
    }

    let mut args = String::from(", __sveltets_2_union(");
    for index in 0..action_count {
        if index > 0 {
            args.push(',');
        }
        let _ = write!(args, "$$action_{index}");
    }
    args.push(')');
    args
}

fn dynamic_element_is_self_closing(el: &SvelteDynamicElement, source: &str) -> bool {
    el.fragment.nodes.is_empty()
        && (slice_src(source, el.start as usize, el.end as usize)
            .trim_end()
            .ends_with("/>")
            || crate::compiler::utils::is_void_element(&el.name))
}

fn ordered_dynamic_suffix(
    attributes: &[Attribute],
    directive_suffix: &str,
    class_style_suffix: &str,
    bind_suffix: &str,
) -> String {
    let first_binding = attributes.iter().find_map(|attribute| match attribute {
        Attribute::BindDirective(binding) => Some(binding.start),
        _ => None,
    });
    let first_directive = attributes.iter().find_map(|attribute| match attribute {
        Attribute::TransitionDirective(directive) => Some(directive.start),
        Attribute::AnimateDirective(directive) => Some(directive.start),
        _ => None,
    });
    let first_class_style = attributes.iter().find_map(|attribute| match attribute {
        Attribute::ClassDirective(directive) => Some(directive.start),
        Attribute::StyleDirective(directive) => Some(directive.start),
        _ => None,
    });
    let mut pieces = Vec::new();
    if !directive_suffix.is_empty() {
        pieces.push((first_directive.unwrap_or(u32::MAX), directive_suffix));
    }
    if !class_style_suffix.is_empty() {
        pieces.push((first_class_style.unwrap_or(u32::MAX), class_style_suffix));
    }
    if !bind_suffix.is_empty() {
        pieces.push((first_binding.unwrap_or(u32::MAX), bind_suffix));
    }
    pieces.sort_by_key(|(position, _)| *position);
    pieces.into_iter().map(|(_, suffix)| suffix).collect()
}
