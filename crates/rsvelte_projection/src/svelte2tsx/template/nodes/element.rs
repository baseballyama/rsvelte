//! Regular HTML elements and `<title>`. Mirrors `htmlxtojsx_v2/nodes/Element.ts`.

use crate::ast::template::{RegularElement, SlotElement, TitleElement};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, slice_src};

use crate::svelte2tsx::template::attributes::attribute::{AttrHost, element_is_custom};
use crate::svelte2tsx::template::attributes::binding::{
    any_bind_needs_element_var, sanitize_tag_for_var,
};
use crate::svelte2tsx::template::attributes::directive_suffix::{
    action_arguments, build_directive_prefix_suffix, build_element_directive_suffix_segments,
};
use crate::svelte2tsx::template::attributes::{build_attribute_segments, build_attributes_string};
use crate::svelte2tsx::template::ctx::Counter;
use crate::svelte2tsx::template::segs::{Seg, bake_out_of_order_src, emit_segmented_overwrite};
use crate::svelte2tsx::template::utils::opener_spacing::{OpenerCtx, opener_spacing};
use crate::svelte2tsx::template::utils::source::{
    closing_tag_name_matches, find_closing_tag_start, find_opening_tag_end,
};
use crate::svelte2tsx::template::walk::process_fragment_inplace;

use super::component_slots::{default_slot_let_block, handle_named_slot_element};
use super::slot_element::{handle_slot_element, slot_attr_static_name};
use super::snippet_block::hoist_snippet_blocks;

/// Handle a regular HTML element.
///
/// Generates `{ svelteHTML.createElement("tagName", { ...attributes }); children }`.
///
/// The opening tag `<h1 class="foo">` is overwritten with
/// `{ svelteHTML.createElement("h1", {"class": "foo",});`
/// and the closing tag `</h1>` is overwritten with ` }`.
pub fn handle_regular_element(
    el: &RegularElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    if handle_special_regular_element(el, source, options, str, counter, depth) {
        return;
    }

    // Named-slot routing: when processing a component's children (possibly deep
    // inside `{#each}`/`{#if}`/etc. control-flow blocks), an element targeting a
    // named slot is lowered to the `$$slot_def[...]` form referencing the
    // enclosing component instance. Take the context first so this element's OWN
    // children do NOT inherit it (a nested element owns its own slot scope);
    // restore it afterwards for the following siblings.
    let saved_slot = counter.slot_inst.take();
    if try_handle_named_slot(
        el,
        saved_slot.as_ref(),
        source,
        options,
        str,
        counter,
        depth,
    ) {
        counter.slot_inst = saved_slot;
        return;
    }
    // Default-slot `let:` receiver (`<div let:x>`): the bindings destructure from
    // the enclosing component's `$$slot_def.default`, and the block scopes the
    // element's body. Mirrors `Element.performTransformation`'s
    // `slotLetsTransformation`. Note this is reached only after the `style`
    // early-return above, matching official — the `<style>` node's whole range
    // (block included) is wiped by `handleStyleTag`.
    let default_slot_let = default_slot_let_block(&el.attributes, saved_slot.as_ref(), source);

    let (opening_tag_end, attr_segs, before_block) =
        regular_opener_attributes(el, source, options, counter, saved_slot.is_some());

    // Actions precede the element; other directive suffixes retain source order.
    let (directive_prefix, _directive_suffix, action_count) =
        build_directive_prefix_suffix(&el.attributes, source, &el.name, &options.typings_namespace);
    let actions_arg = action_arguments(action_count);

    // `bind:` directives generate a suffix appended right after the
    // createElement call. Mirrors `htmlxtojsx_v2/nodes/Binding.ts::handleBinding`.
    // For `bind:this` and one-way bindings on the element (`offsetHeight`,
    // …) we also need a `const $$_xxx = …` declaration so the assignment
    // can reference the element value.
    let needs_element_var = any_bind_needs_element_var(&el.attributes, source);
    let element_var = if needs_element_var {
        // The `$$_<tag><N>` index is the element's nesting DEPTH (matching
        // upstream Element.ts `computeDepth()`), not a per-tag counter — same
        // rule as component instance names.
        let sanitized = sanitize_tag_for_var(&el.name);
        Some(format!("$$_{sanitized}{depth}"))
    } else {
        None
    };
    // All post-`createElement` directive statements — `class:` / `style:`
    // (segmented), `transition:` / `in:` / `out:` / `animate:`, and `bind:` —
    // are built in a SINGLE source-order pass so they interleave exactly like
    // official's `appendToStartEnd` walk (e.g. a `style:` after a `bind:this`
    // stays after it instead of grouping with earlier `class:` directives).
    let suffix_segs = build_element_directive_suffix_segments(
        &el.attributes,
        source,
        element_var.as_deref(),
        &el.name,
        options.is_ts_file || !options.emit_jsdoc,
        &el.name,
        &options.typings_namespace,
    );

    // Build the opener as a `Vec<Seg>` (header lit + attr segs + trailer
    // lit) and apply via `emit_segmented_overwrite`. Action declarations
    // (if any) are emitted *before* the inner `{ … createElement(…); … }`
    // block so they're in scope for `__sveltets_2_union(...)`. The inner
    // `{` opens a separate block scope.
    let element_var_decl = element_var
        .as_ref()
        .map_or_else(String::new, |element_var| format!("const {element_var} = "));
    // The slot-let destructure sits *after* the opening tag's leading gap (the
    // gap is part of the same official `transform()` call), so emit the gap with
    // it and leave the createElement block unindented.
    let indent = " ".repeat(before_block);
    let indent = match &default_slot_let {
        Some(block) => {
            str.append_left_fmt(el.start, format_args!("{indent}{block}"));
            String::new()
        }
        None => indent,
    };
    let header_lit = if directive_prefix.is_empty() {
        format!(
            "{}{{ {}{}.createElement(\"{}\"{}, {{",
            indent, element_var_decl, options.typings_namespace, el.name, actions_arg,
        )
    } else {
        format!(
            "{}{{{}{{ {}{}.createElement(\"{}\"{}, {{",
            indent,
            directive_prefix,
            element_var_decl,
            options.typings_namespace,
            el.name,
            actions_arg,
        )
    };
    // The trailer closes the props object + createElement call (`}});`), then
    // appends the `class:` / `style:` directive statements (segmented, so their
    // expression chunks keep their source mapping), then the transition/animate
    // (`directive_suffix`) and `bind:` (`bind_suffix`) suffixes.
    let mut opener_segs: Vec<Seg> = Vec::with_capacity(attr_segs.len() + suffix_segs.len() + 3);
    opener_segs.push(Seg::Lit(header_lit));
    opener_segs.extend(attr_segs);
    // Close the props object + createElement call: `});` (one `}` for the
    // props brace, then `)` + `;`). The outer block `{` is closed after the
    // children by the closing-tag overwrite.
    opener_segs.push(Seg::Lit("});".to_string()));
    // The post-`createElement` suffix statements are already assembled in
    // source-attribute order by `build_element_directive_suffix_segments`.
    opener_segs.extend(suffix_segs);
    let opener_segs = bake_out_of_order_src(opener_segs, source);
    emit_segmented_overwrite(str, el.start, opening_tag_end, &opener_segs);

    finish_regular_element(
        el,
        source,
        options,
        str,
        counter,
        depth,
        !directive_prefix.is_empty(),
        default_slot_let.is_some(),
        saved_slot,
    );
}

fn regular_opener_attributes(
    el: &RegularElement,
    source: &str,
    options: &Svelte2TsxOptions,
    counter: &Counter,
    in_component_slot: bool,
) -> (u32, Vec<Seg>, usize) {
    let opening_end =
        find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes);
    let content_start =
        el.start + 1 + u32::try_from(el.name.len()).expect("tag name length fits in u32");
    let mut segments = build_attribute_segments(
        &el.attributes,
        source,
        &counter.element_opener_comments,
        in_component_slot,
        Some(content_start),
        AttrHost::Element {
            tag: &el.name,
            preserve_case: options.namespace.preserves_attribute_case(),
            is_custom_element: element_is_custom(&el.name, &el.attributes),
        },
        options.preserves_bind_prefix(),
    );
    let spacing = opener_spacing(
        source,
        el.start,
        &el.name,
        opening_end,
        Some((el.start + 1, content_start)),
        &el.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: true,
            in_component_slot,
            tag_name: &el.name,
            is_slot_tag: false,
            preserve_bind: options.preserves_bind_prefix(),
        },
    );
    if spacing.in_attr_object > 0 {
        let mut padded = Vec::with_capacity(segments.len() + 1);
        padded.push(Seg::Lit(" ".repeat(spacing.in_attr_object)));
        padded.extend(segments);
        segments = padded;
    }
    (opening_end, segments, spacing.before_block)
}

fn try_handle_named_slot(
    el: &RegularElement,
    slot_instance: Option<&String>,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) -> bool {
    let Some(instance) = slot_instance else {
        return false;
    };
    if slot_attr_static_name(&el.attributes).is_none() {
        return false;
    }
    handle_named_slot_element(el, instance, source, options, str, counter, depth);
    true
}

fn handle_special_regular_element(
    el: &RegularElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) -> bool {
    if el.name == "style" {
        str.remove(el.start, el.end);
        return true;
    }
    if el.name != "slot" {
        return false;
    }
    let slot = SlotElement {
        start: el.start,
        end: el.end,
        name: el.name.clone(),
        name_loc: el.name_loc,
        attributes: el.attributes.clone(),
        fragment: el.fragment.clone(),
    };
    handle_slot_element(&slot, source, options, str, counter, depth);
    true
}

fn finish_regular_element(
    el: &RegularElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
    has_directive_prefix: bool,
    has_default_slot_let: bool,
    saved_slot: Option<String>,
) {
    hoist_snippet_blocks(&el.fragment, source, str);
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);
    close_regular_element(el, source, has_directive_prefix, str);
    if has_default_slot_let {
        str.append_left(el.end, "}");
    }
    counter.slot_inst = saved_slot;
}

fn close_regular_element(
    el: &RegularElement,
    source: &str,
    has_directive_prefix: bool,
    str: &mut MagicString<'_>,
) {
    let extra_close = if has_directive_prefix { "}" } else { "" };
    let self_closing = slice_src(source, el.start as usize, el.end as usize)
        .trim_end()
        .ends_with("/>");
    let closing_start = find_closing_tag_start(source, el.end);
    if crate::compiler::utils::is_void_element(&el.name)
        || self_closing
        || closing_start >= el.end
        || !closing_tag_name_matches(source, closing_start, &el.name)
    {
        str.append_left_fmt(el.end, format_args!("}}{extra_close}"));
    } else {
        str.overwrite_fmt(closing_start, el.end, format_args!(" }}{extra_close}"));
    }
}

/// Handle `<title>` element.
pub fn handle_title_element(
    el: &TitleElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    // `<title>` is an `Element` in official svelte2tsx, so it owns its own slot
    // scope (children must not inherit the component context) and forwards its
    // own `let:` through the enclosing component's `$$slot_def.default`.
    let saved_slot = counter.slot_inst.take();
    let default_slot_let = default_slot_let_block(&el.attributes, saved_slot.as_ref(), source);

    let opening_tag_end =
        find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes);
    let attrs_str = build_attributes_string(
        &el.attributes,
        source,
        &counter.element_opener_comments,
        saved_slot.is_some(),
        AttrHost::Element {
            tag: &el.name,
            preserve_case: options.namespace.preserves_attribute_case(),
            is_custom_element: element_is_custom(&el.name, &el.attributes),
        },
        options.preserves_bind_prefix(),
    );

    let spacing = opener_spacing(
        source,
        el.start,
        &el.name,
        opening_tag_end,
        Some((
            el.start + 1,
            el.start + 1 + u32::try_from(el.name.len()).expect("tag name length fits in u32"),
        )),
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
    let indent = " ".repeat(spacing.before_block);
    let indent = match &default_slot_let {
        Some(block) => {
            str.append_left_fmt(el.start, format_args!("{indent}{block}"));
            String::new()
        }
        None => indent,
    };
    let opener = format!(
        "{}{{ {}.createElement(\"title\", {{{}{}}});",
        indent,
        options.typings_namespace,
        " ".repeat(spacing.in_attr_object),
        attrs_str
    );
    str.overwrite(el.start, opening_tag_end, &opener);

    // title is an element → children at depth+1.
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        str.overwrite(closing_tag_start, el.end, " }");
    } else {
        str.append_left(el.end, " }");
    }
    if default_slot_let.is_some() {
        str.append_left(el.end, "}");
    }
    counter.slot_inst = saved_slot;
}
