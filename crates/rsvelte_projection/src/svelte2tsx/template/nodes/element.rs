//! Regular HTML elements and `<title>`. Mirrors `htmlxtojsx_v2/nodes/Element.ts`.

use std::fmt::Write as _;

use crate::ast::template::{RegularElement, SlotElement, TitleElement};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, slice_src};

use crate::svelte2tsx::template::attributes::binding::{
    any_bind_needs_element_var, sanitize_tag_for_var,
};
use crate::svelte2tsx::template::attributes::directive_suffix::{
    build_directive_prefix_suffix, build_element_directive_suffix_segments,
};
use crate::svelte2tsx::template::attributes::{build_attribute_segments, build_attributes_string};
use crate::svelte2tsx::template::ctx::Counter;
use crate::svelte2tsx::template::segs::{Seg, bake_out_of_order_src, emit_segmented_overwrite};
use crate::svelte2tsx::template::utils::opener_spacing::{OpenerCtx, opener_spacing};
use crate::svelte2tsx::template::utils::source::{
    closing_tag_name_matches, find_closing_tag_start, find_opening_tag_end,
};
use crate::svelte2tsx::template::walk::process_fragment_inplace;

use super::component_slots::handle_named_slot_element;
use super::slot_element::{get_slot_attr_value, handle_slot_element};
use super::snippet_block::hoist_snippet_blocks;

/// Handle a regular HTML element.
///
/// Generates `{ svelteHTML.createElement("tagName", { ...attributes }); children }`.
///
/// The opening tag `<h1 class="foo">` is overwritten with
/// `{ svelteHTML.createElement("h1", {"class":\`foo\`,});`
/// and the closing tag `</h1>` is overwritten with ` }`.
pub(crate) fn handle_regular_element(
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

    // A nested `<style>` element is removed entirely from the output,
    // mirroring official svelte2tsx's `handleStyleTag` (the `case 'Style'`
    // arm), which does `str.remove(node.start, node.end)` for every verbatim
    // style node at any nesting depth. (A top-level `<style>` becomes
    // `root.css` and never reaches this fragment walk, so any `style`
    // RegularElement here is necessarily nested.) Note: nested `<script>`
    // elements are NOT removed — official emits `createElement("script", {})`
    // for them (only the JS content is blanked, which `handle_text` already
    // does), so they fall through to the normal element path.
    if el.name == "style" {
        str.remove(el.start, el.end);
        return;
    }

    // Official svelte2tsx switches the opener on the *tag name*, not the AST node
    // type: any element named `slot` emits `__sveltets_createSlot(...)`. The parser
    // only produces a `SlotElement` for `<slot>` outside a `<template
    // shadowrootmode>`; inside one it is a `RegularElement` (mirroring upstream's
    // `parent_is_shadowroot_template` check), yet svelte2tsx still lowers it to a
    // slot. Route those through the same slot handler.
    if el.name == "slot" {
        let slot = SlotElement {
            start: el.start,
            end: el.end,
            name: el.name.clone(),
            name_loc: el.name_loc,
            attributes: el.attributes.clone(),
            fragment: el.fragment.clone(),
        };
        handle_slot_element(&slot, source, options, str, counter, depth);
        return;
    }

    // Named-slot routing: when processing a component's children (possibly deep
    // inside `{#each}`/`{#if}`/etc. control-flow blocks), an element targeting a
    // named slot is lowered to the `$$slot_def[...]` form referencing the
    // enclosing component instance. Take the context first so this element's OWN
    // children do NOT inherit it (a nested element owns its own slot scope);
    // restore it afterwards for the following siblings.
    let saved_slot = counter.slot_inst.take();
    if let Some(ref inst) = saved_slot
        && get_slot_attr_value(&el.attributes, source).is_some()
    {
        handle_named_slot_element(el, inst, source, options, str, counter, depth);
        counter.slot_inst = saved_slot;
        return;
    }

    // Find the end of the opening tag (after the `>`)
    let opening_tag_end =
        find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes);

    // Build attribute segments. Source-bearing expressions become
    // `Seg::Src` so the resulting overwrite leaves them as unedited
    // MagicString chunks — which `generate_mappings` then maps
    // per-character back to the original `.svelte` columns. Element-
    // opener attribute expressions previously baked into a single
    // edited chunk and collapsed to a single source-map segment.
    // `saved_slot` (taken from `counter.slot_inst` above) is Some when this
    // element is a slot-context child of a component — then `let:` is a slot-let,
    // not a regular attribute.
    // The opener content (where attributes + comments live) starts right after
    // `<tagname`, so leading comments before the first attribute are recovered.
    let opener_content_start = el.start + 1 + el.name.len() as u32;
    let mut attr_segs = build_attribute_segments(
        &el.attributes,
        source,
        &counter.element_opener_comments,
        &el.name,
        saved_slot.is_some(),
        Some(opener_content_start),
    );

    let mut spacing = opener_spacing(
        source,
        el.start,
        &el.name,
        opening_tag_end,
        Some((el.start + 1, opener_content_start)),
        &el.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: true,
            in_component_slot: saved_slot.is_some(),
            tag_name: &el.name,
            is_slot_tag: false,
        },
    );
    // A default-slot-let element (`<div let:x>`) has its leading gap folded
    // into the `$$slot_def.default` destructure emitted by
    // `process_component_children_with_slots` instead — see
    // `suppress_default_slot_let_indent`'s doc comment.
    if std::mem::take(&mut counter.suppress_default_slot_let_indent) {
        spacing.before_block = 0;
    }
    if spacing.in_attr_object > 0 {
        let mut padded: Vec<Seg> = Vec::with_capacity(attr_segs.len() + 1);
        padded.push(Seg::Lit(" ".repeat(spacing.in_attr_object)));
        padded.extend(attr_segs);
        attr_segs = padded;
    }

    // V4-style action / transition / animate directive emission. Action
    // becomes `const $$action_N = __sveltets_2_ensureAction(…);` BEFORE
    // the createElement; transition / animate become
    // `__sveltets_2_ensureTransition(…);` appended AFTER it. The
    // createElement's second argument also needs to wrap any actions
    // with `__sveltets_2_union(...)`. Mirrors
    // `htmlxtojsx_v2/nodes/{Action,Transition,Animation}.ts`.
    // Only the action PREFIX (`const $$action_N = …`) and the action count are
    // taken here; the transition/animate suffix is emitted in source order by
    // `build_element_directive_suffix_segments` below.
    let (directive_prefix, _directive_suffix, action_count) =
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
        Some(format!("$$_{}{}", sanitized, depth))
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
        options.is_ts_file,
        &el.name,
    );

    // Build the opener as a `Vec<Seg>` (header lit + attr segs + trailer
    // lit) and apply via `emit_segmented_overwrite`. Action declarations
    // (if any) are emitted *before* the inner `{ … createElement(…); … }`
    // block so they're in scope for `__sveltets_2_union(...)`. The inner
    // `{` opens a separate block scope.
    let element_var_decl = if let Some(ref var) = element_var {
        format!("const {} = ", var)
    } else {
        String::new()
    };
    let indent = " ".repeat(spacing.before_block);
    let header_lit = if !directive_prefix.is_empty() {
        format!(
            "{}{{{}{{ {}svelteHTML.createElement(\"{}\"{}, {{",
            indent, directive_prefix, element_var_decl, el.name, actions_arg,
        )
    } else {
        format!(
            "{}{{ {}svelteHTML.createElement(\"{}\"{}, {{",
            indent, element_var_decl, el.name, actions_arg,
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

    // Process children at depth+1: this element is now an ancestor.
    // Mirrors official computeDepth which counts all ancestor element/component nodes.
    // Hoist snippet blocks to the top of the element's children first, mirroring
    // hoistSnippetBlock in the JS reference (pendingSnippetHoistCheck walk).
    hoist_snippet_blocks(&el.fragment, source, str);
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

    // Find and overwrite the closing tag.
    // HTML void elements (`<input>`, `<br>`, …) and source-level self-closing
    // tags (`<x />`) have no `</tag>` in the source, so we must NOT call
    // `find_closing_tag_start` on them — it scans backwards for `</` and would
    // wrongly match a preceding sibling's closing tag, blanking it (and the
    // void element itself) on overwrite. Mirrors the JS reference's
    // `prependLeft(node.end, '}')` for void/self-closing tags.
    //
    // When `directive_prefix` opened an extra outer block for the action
    // declarations, emit a matching extra `}` to close it.
    let extra_close = if directive_prefix.is_empty() { "" } else { "}" };
    let is_self_closing_source = slice_src(source, el.start as usize, el.end as usize)
        .trim_end()
        .ends_with("/>");
    let is_void = crate::compiler::utils::is_void_element(&el.name);
    if is_void || is_self_closing_source {
        str.append_left_fmt(el.end, format_args!("}}{}", extra_close));
    } else {
        let closing_tag_start = find_closing_tag_start(source, el.end);
        // An auto-closed element (`<p><p>`, `<li><li>`, …) has NO `</name>` at
        // `el.end`; `find_closing_tag_start` then wrongly matches the last
        // child's `</…>`. Only overwrite when the found tag actually closes
        // THIS element; otherwise append `}` at `el.end` like a void element
        // (matching official's `prependLeft(node.end, '}')` for such cases).
        if closing_tag_start < el.end
            && closing_tag_name_matches(source, closing_tag_start, &el.name)
        {
            // Non-self-closing: preserve space before closing brace
            str.overwrite_fmt(
                closing_tag_start,
                el.end,
                format_args!(" }}{}", extra_close),
            );
        } else {
            str.append_left_fmt(el.end, format_args!("}}{}", extra_close));
        }
    }
    // Restore the slot context for following siblings (this element's own
    // children were processed with it cleared, via the `take()` above).
    counter.slot_inst = saved_slot;
}

/// Handle `<title>` element.
pub(crate) fn handle_title_element(
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

    let opening_tag_end =
        find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes);
    let attrs_str = build_attributes_string(
        &el.attributes,
        source,
        &counter.element_opener_comments,
        counter.slot_inst.is_some(),
    );

    let spacing = opener_spacing(
        source,
        el.start,
        &el.name,
        opening_tag_end,
        Some((el.start + 1, el.start + 1 + el.name.len() as u32)),
        &el.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: true,
            in_component_slot: counter.slot_inst.is_some(),
            tag_name: &el.name,
            is_slot_tag: false,
        },
    );
    let opener = format!(
        "{}{{ svelteHTML.createElement(\"title\", {{{}{}}});",
        " ".repeat(spacing.before_block),
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
}
