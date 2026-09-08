//! `<svelte:element this={…}>`. Mirrors the dynamic-element branch of
//! `htmlxtojsx_v2/nodes/Element.ts`.

use std::fmt::Write as _;

use crate::ast::template::{Attribute, SvelteDynamicElement};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, slice_src};

use crate::svelte2tsx::template::attributes::attribute::{AttrHost, element_is_custom};
use crate::svelte2tsx::template::attributes::binding::{
    any_bind_needs_element_var, build_bind_directive_suffix_segs, element_var_base_name,
};
use crate::svelte2tsx::template::attributes::build_attribute_segments;
use crate::svelte2tsx::template::attributes::class_style::build_class_style_directive_suffix_segments;
use crate::svelte2tsx::template::attributes::directive_suffix::build_directive_prefix_suffix;
use crate::svelte2tsx::template::ctx::Counter;
use crate::svelte2tsx::template::nodes::snippet_block::hoist_snippet_blocks;
use crate::svelte2tsx::template::segs::{Seg, bake_out_of_order_src, emit_segmented_overwrite};
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
    let raw_tag_range = get_expression_range(&el.tag);
    let tag_is_quoted_attribute = raw_tag_range.is_some_and(|(start, _)| {
        start > 0 && matches!(source.as_bytes()[(start - 1) as usize], b'"' | b'\'')
    });
    // If the `this` attribute value is a plain string literal (this="tag"),
    // the parser stores just the text without quotes. We need to wrap it
    // in quotes to produce valid JavaScript: createElement("tag", ...).
    // `this="div"` has no expression range (the parser stores the bare text), so
    // it is generated; `this={tag}` is upstream's `[tag.start, tag.end]` range and
    // must reach the shadow as a source chunk or hover inside it answers nothing.
    let tag_segs: Vec<Seg> = if tag_is_quoted_attribute {
        vec![Seg::Lit(format!("\"{raw_tag_text}\""))]
    } else {
        match raw_tag_range {
            Some((start, end)) if start < end => vec![Seg::Src(start, end)],
            _ => vec![Seg::Lit(raw_tag_text.to_string())],
        }
    };
    let opening_tag_end =
        find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes);
    // In a named-slot context the `slot` attribute is consumed by the wrapper
    // block, so build the attributes without it.
    // The named-slot form rewrites the attribute list wholesale (the `slot`
    // attribute is consumed by the wrapper), so it has no per-expression ranges
    // to preserve and stays a single literal.
    let attr_segs: Vec<Seg> = if named_slot.is_some() {
        vec![Seg::Lit(build_named_slot_element_attrs(
            &el.attributes,
            source,
            &options.typings_namespace,
            &el.name,
            true,
            options.namespace.preserves_attribute_case(),
        ))]
    } else {
        build_attribute_segments(
            &el.attributes,
            source,
            &counter.element_opener_comments,
            saved_slot.is_some(),
            None,
            AttrHost::Element {
                tag: &el.name,
                preserve_case: options.namespace.preserves_attribute_case(),
                is_custom_element: element_is_custom(&el.name, &el.attributes),
            },
            options.preserves_bind_prefix(),
        )
    };

    // `<svelte:element this={tag}>` names itself with the tag expression. Only
    // the attribute-text form `this="div"` keeps no source range; an expression
    // literal such as `this={"div"}` still contributes its range to upstream's
    // opening-tag transform even though its generated text also starts with a
    // quote.
    let tag_range = if tag_is_quoted_attribute {
        None
    } else {
        raw_tag_range
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
            tag_segs: &tag_segs,
            attr_segs: &attr_segs,
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
    tag_segs: &'a [Seg],
    attr_segs: &'a [Seg],
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
    let element_var = any_bind_needs_element_var(&el.attributes, input.source)
        .then(|| format!("$$_{}{}", element_var_base_name(&el.name), input.depth));
    let bind_suffix = build_bind_directive_suffix_segs(
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
    let class_style_suffix =
        build_class_style_directive_suffix_segments(&el.attributes, input.source);
    let suffix = ordered_dynamic_suffix(
        &el.attributes,
        vec![Seg::Lit(directive_suffix)],
        class_style_suffix,
        bind_suffix,
    );
    let inner_open = if directive_prefix.is_empty() { "" } else { "{" };
    // The opener is applied through `emit_segmented_overwrite` so the `this={…}`
    // expression and every attribute value reach the shadow as unedited chunks.
    let mut opener: Vec<Seg> = Vec::with_capacity(input.attr_segs.len() + suffix.len() + 6);
    opener.push(Seg::Lit(format!(
        "{}{{{directive_prefix}{inner_open} {element_var_decl}{}.createElement(",
        input.indent, input.options.typings_namespace,
    )));
    opener.extend(input.tag_segs.iter().cloned());
    opener.push(Seg::Lit(format!(
        "{actions_arg}, {{{}",
        " ".repeat(input.attribute_padding)
    )));
    opener.extend(input.attr_segs.iter().cloned());
    opener.push(Seg::Lit("});".to_string()));
    opener.extend(suffix);
    if dynamic_element_is_self_closing(el, input.source) {
        opener.push(Seg::Lit(format!("{inner_close}}}")));
        let opener = bake_out_of_order_src(opener, input.source);
        emit_segmented_overwrite(str, el.start, el.end, &opener);
        return;
    }

    let opener = bake_out_of_order_src(opener, input.source);
    emit_segmented_overwrite(str, el.start, input.opening_tag_end, &opener);
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
    directive_suffix: Vec<Seg>,
    class_style_suffix: Vec<Seg>,
    bind_suffix: Vec<Seg>,
) -> Vec<Seg> {
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
    for (position, segs) in [
        (first_directive, directive_suffix),
        (first_class_style, class_style_suffix),
        (first_binding, bind_suffix),
    ] {
        if segs
            .iter()
            .any(|seg| !matches!(seg, Seg::Lit(text) if text.is_empty()))
        {
            pieces.push((position.unwrap_or(u32::MAX), segs));
        }
    }
    pieces.sort_by_key(|(position, _)| *position);
    pieces.into_iter().flat_map(|(_, segs)| segs).collect()
}
