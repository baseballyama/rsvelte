//! Template processing for svelte2tsx.
//!
//! Converts Svelte template AST nodes into TSX expressions for type checking
//! by modifying the source in-place using MagicString.
//!
//! Each template node type has a corresponding handler that overwrites the
//! original source range with the appropriate TypeScript/TSX code.

mod attributes;
mod collect;
mod ctx;
mod nodes;
mod segs;
mod utils;
mod walk;

use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, Component, Fragment, LetDirective,
    RegularElement, SlotElement, SvelteComponentElement, SvelteDynamicElement, SvelteElement,
    TemplateNode, TitleElement,
};
use std::fmt::Write as _;

use indexmap::IndexMap;

use super::magic_string::MagicString;
use super::svelte2tsx::{Svelte2TsxOptions, SvelteVersion, slice_src};
use attributes::action::format_use_directive;
use attributes::attribute::format_attribute_node;
use attributes::binding::{
    any_bind_needs_element_var, build_bind_directive_suffix, element_var_base_name,
    format_bind_directive, sanitize_tag_for_var,
};
use attributes::class_style::build_class_style_directive_suffix_segments;
use attributes::directive_suffix::{
    build_component_directive_suffix, build_directive_prefix_suffix,
    build_element_directive_suffix_segments,
};
use attributes::event_handler::{build_on_calls, format_on_directive, get_on_directives};
use attributes::let_::{build_let_destructure_string, get_let_directives};
use attributes::spread::format_spread_attribute;
use attributes::transition::format_transition_directive;
use attributes::{
    build_attribute_segments, build_attributes_string, build_component_props_segments,
    build_component_props_string,
};
use ctx::{Counter, TemplateNodeExt};
use segs::{
    Seg, bake_out_of_order_src, emit_segmented_overwrite, segs_is_empty, segs_to_string,
    segs_trim_start,
};
use utils::expr::{
    extend_expr_end_with_ts_postfix, get_binding_lhs_text, get_expression_end_stripping_ts,
    get_expression_range, get_expression_text, get_set_binding_ranges,
};
use utils::names::{reversed_component_instance_name, reversed_component_name};
use utils::source::{
    closing_tag_name_matches, count_tag_to_attr_spaces, find_closing_tag_start,
    find_opening_tag_end,
};

pub(crate) use ctx::{clear_element_opener_comments, set_element_opener_comments};
use nodes::attach_tag::format_attach_tag_segments;
use nodes::snippet_block::{handle_snippet_block_as_component_prop, hoist_snippet_blocks};
use walk::{process_fragment_inplace, process_node_inplace};

// =============================================================================
// Template context for collecting slot/event information
// =============================================================================

/// Information collected during template processing.
#[derive(Debug, Default)]
pub struct TemplateInfo {
    /// Slots used in the component: slot_name -> list of prop strings.
    /// e.g., "default" -> ["a:b", "c:d"]
    pub slots: IndexMap<String, Vec<String>>,
    /// Events forwarded from elements / components (on:event without handler),
    /// in template-walk order. Each entry carries the kind so the assembly can
    /// mirror the official `EventHandler` bubbled-events `Map` semantics: an
    /// `Element` forward does a plain `set` (overwrite), a `Component` forward
    /// concats into the existing entry (`unionType`).
    /// e.g., "click" -> "__sveltets_2_mapElementEvent('click')"
    pub element_events: Vec<(String, String, ForwardedEventKind)>,
}

/// How a forwarded event (`on:event` with no handler) combines with an existing
/// entry for the same event name, mirroring the official
/// `event-handler.ts` `EventHandler` map.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ForwardedEventKind {
    /// Element / `svelte:window` / `svelte:body` / `svelte:element` etc. —
    /// official `bubbledEvents.set(name, expr)` (plain overwrite).
    Element,
    /// Component / `svelte:component` — official `handleEventHandlerBubble`
    /// concats into the existing entry.
    Component,
}

// =============================================================================
// Main entry point
// =============================================================================

/// Process the template fragment by modifying the MagicString in-place.
///
/// Walks the fragment's nodes and overwrites template node ranges with TSX
/// equivalents. The MagicString is modified directly.
///
/// Returns `TemplateInfo` containing collected slot/event information for
/// use in the return statement.
pub fn process_template_inplace(
    fragment: &Fragment,
    source: &str,
    _options: &Svelte2TsxOptions,
    str: &mut MagicString,
) {
    let mut counter = Counter::new();
    // depth 0 = root fragment; elements and components increment it for their children
    process_fragment_inplace(fragment, source, _options, str, &mut counter, 0);

    // NOTE: trailing whitespace after the last template node is left untouched.
    // Official svelte2tsx keeps it (the source `\n` ends up between the template
    // output and the appended async wrapper `};`); oxfmt normalises it away for
    // valid output, but a top-level-await component is emitted raw, where
    // blanking the trailing newline diverged from official.
}

/// Collect slot and event information from the template AST.
///
/// This is a pre-pass that walks the AST to collect:
/// - Slot elements with their props (for the return statement `slots: {...}`)
/// - Forwarded events (for the return statement `events: {...}`)
pub fn collect_template_info(fragment: &Fragment, source: &str) -> TemplateInfo {
    let mut info = TemplateInfo::default();
    // `scope` maps an in-scope template binding name (e.g. an `{#each}` context
    // variable) to the expression that types it at the top level — for an each
    // block, `__sveltets_2_unwrapArr(<collection>)`. Slot props referencing
    // such a binding emit that expression instead of the bare name, so the
    // `slots: { … }` return reflects the element type. Mirrors official
    // `SlotHandler.getResolveExpressionStr` (EachBlock → unwrapArr).
    let mut scope: Vec<(String, String)> = Vec::new();
    collect::collect_info_from_fragment(fragment, source, &mut info, &mut scope, None);
    info
}

// =============================================================================
// Text and Comments
// =============================================================================

// =============================================================================
// Expression Tags
// =============================================================================

// =============================================================================
// Block Nodes
// =============================================================================

// =============================================================================
// Element Nodes
// =============================================================================

/// Handle a regular HTML element.
///
/// Generates `{ svelteHTML.createElement("tagName", { ...attributes }); children }`.
///
/// The opening tag `<h1 class="foo">` is overwritten with
/// `{ svelteHTML.createElement("h1", {"class":\`foo\`,});`
/// and the closing tag `</h1>` is overwritten with ` }`.
fn handle_regular_element(
    el: &RegularElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
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
    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);

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
        &el.name,
        saved_slot.is_some(),
        Some(opener_content_start),
    );

    // Official always emits exactly ONE inherent space after the `{` of the
    // attribute object, regardless of the source whitespace between the tag name
    // and the first attribute (verified: `<button onclick>`, `<button  onclick>`,
    // `<button\n\tonclick>` all → `{ "onclick":… }`). oxfmt normalises this away
    // for valid output, but a raw top-level-await component keeps it exact.
    let attrs_empty_before_pad = segs_is_empty(&attr_segs);
    if !el.attributes.is_empty() && !attrs_empty_before_pad {
        segs_trim_start(&mut attr_segs);
        let mut padded: Vec<Seg> = Vec::with_capacity(attr_segs.len() + 1);
        padded.push(Seg::Lit(" ".to_string()));
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

    // When all surviving props are empty but a `bind:` / `class:` / `style:`
    // directive was stripped, JS reference still leaves whitespace inside
    // `{ }`. Add a single space so `createElement("div", { })` matches.
    if segs_is_empty(&attr_segs) && !segs_is_empty(&suffix_segs) {
        attr_segs.push(Seg::Lit(" ".into()));
    }

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
    let header_lit = if !directive_prefix.is_empty() {
        format!(
            " {{{}{{ {}svelteHTML.createElement(\"{}\"{}, {{",
            directive_prefix, element_var_decl, el.name, actions_arg,
        )
    } else {
        format!(
            " {{ {}svelteHTML.createElement(\"{}\"{}, {{",
            element_var_decl, el.name, actions_arg,
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
        str.append_left(el.end, &format!("}}{}", extra_close));
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
            str.overwrite(closing_tag_start, el.end, &format!(" }}{}", extra_close));
        } else {
            str.append_left(el.end, &format!("}}{}", extra_close));
        }
    }
    // Restore the slot context for following siblings (this element's own
    // children were processed with it cleared, via the `take()` above).
    counter.slot_inst = saved_slot;
}

/// Handle a Svelte component: `<Component ...>`.
///
/// Supports:
/// - `on:` directives → instance variable + `.$on()` calls
/// - `let:` directives → instance variable + `$$slot_def` destructuring
/// - Svelte 5 `children` prop when component has children
/// - Named slots via `slot="name"` on children
/// - Component name in closing tag for non-self-closing components
fn handle_component(
    comp: &Component,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if comp.start >= comp.end {
        return;
    }

    // This component's children get their own slot scope (official sets `parent`
    // to the nearest enclosing component): clear any inherited slot context so a
    // `slot="…"` inside this component's body routes to THIS component (set up
    // again by `process_component_children_with_slots` below), not an outer one.
    // Restored at the end for following siblings.
    let saved_outer_slot = counter.slot_inst.take();

    // Nested named-slot routing: a static `slot="x"` component reached through a
    // parent component's default-slot body (e.g. inside `{#if}` / `{#each}`) is
    // wrapped in the parent's `$$slot_def["x"]` block — same as the direct-child
    // path, mirroring how `handle_regular_element` routes nested slotted elements.
    // The `named_slot_component_close` guard avoids re-entering when we are
    // already the routed inner `handle_component` call.
    if !counter.named_slot_component_close
        && let Some(ref inst) = saved_outer_slot
        && get_slot_attr_value(&comp.attributes, source).is_some()
    {
        let inst = inst.clone();
        handle_named_slot_component(comp, &inst, source, options, str, counter, depth);
        counter.slot_inst = saved_outer_slot;
        return;
    }

    // When processed as a named-slot child, suppress the component-name
    // reference at the close (the caller emits it outside this component's block).
    let named_slot_close = std::mem::take(&mut counter.named_slot_component_close);

    // Use depth (ancestor element/component count) as the variable index, matching
    // the official `computeDepth()` in `htmlxtojsx_v2/nodes/InlineComponent.ts`.
    // Two sibling `<A/>` at the same depth both get `$$_A<depth>C`, which is correct —
    // the official tool reuses the same name for components at the same depth.
    let ctor_var = reversed_component_name(&comp.name, depth);

    // Find the end of the opening tag
    let opening_tag_end = find_opening_tag_end(source, comp.start, comp.end);

    // Collect on: directives and let: directives
    let on_directives = get_on_directives(&comp.attributes);
    let has_events = !on_directives.is_empty();
    // When this component is itself a named-slot child, its `let:` directives are
    // consumed by the parent's `$$slot_def["x"]` destructure, so don't re-emit
    // them here as the component's own default-slot let block.
    let suppress_lets = std::mem::take(&mut counter.suppress_component_lets);
    let let_directives = if suppress_lets {
        Vec::new()
    } else {
        get_let_directives(&comp.attributes)
    };
    let has_lets = !let_directives.is_empty();

    // Check if component has meaningful children
    let has_children = has_component_slot_children(&comp.fragment, source);

    // Check if any children have named slots with let: directives
    let children_have_named_slots = has_named_slot_children(&comp.fragment, source);

    // A default-slot child carrying `let:` directives (e.g.
    // `<svelte:fragment let:a={x}>…`) destructures from
    // `inst.$$slot_def.default`, which references the component instance — so
    // it likewise needs the `const $$_inst = new …` form. Mirrors official's
    // `Element.addSlotLet` → `performTransformation` referencing
    // `this.parent.name`.
    let children_have_default_slot_lets = has_default_slot_let_children(&comp.fragment, source);

    // Named `{#snippet}` blocks that are direct children of a component are
    // passed as *implicit props* (`props: { name: (params) => … }`), not as
    // standalone `const name = …` declarations, so that TypeScript both
    // satisfies required snippet props and contextually types the snippet's
    // parameters from the prop's `Snippet<[T]>` type (#780). This relocation is
    // only wired through the simple-children path; when the component also uses
    // `let:` / named slots the children go through `process_component_children_with_slots`,
    // which owns its own block scoping, so the snippets stay standalone there.
    let use_snippet_props =
        !(has_lets || children_have_named_slots || children_have_default_slot_lets)
            && comp
                .fragment
                .nodes
                .iter()
                .any(|n| matches!(n, TemplateNode::SnippetBlock(_)));

    // An instance variable is needed when:
    // - there are on: directives
    // - there are let: directives on the component
    // - there are children with slot="name" that have let: directives
    // - a named `{#snippet}` child is passed as an implicit prop: official
    //   svelte2tsx assigns the component instance to a const and then
    //   destructures the snippet from `inst.$$prop_def` to anchor the snippet's
    //   parameter types. Without that anchor a snippet on a component whose type
    //   comes from a value (e.g. Storybook's `const { Story } = defineMeta(…)`)
    //   does not pick up its contextual `Snippet<[Args]>` type and the snippet
    //   parameter falls back to implicit `any` (#796).
    // `bind:this` / `bind:foo` on a component reference the instance variable
    // (`expr = $$_inst;` / `$$_inst.$$bindings = 'foo';`), so the instance const
    // must be emitted — mirrors upstream `addNameConstDeclaration` for bound
    // components. Without this a `bind:this`-only component dropped both the
    // `const $$_inst = new …` and the binding assignment.
    let has_bindings = comp
        .attributes
        .iter()
        .any(|a| matches!(a, Attribute::BindDirective(_)));
    let needs_instance = has_events
        || has_lets
        || children_have_named_slots
        || children_have_default_slot_lets
        || use_snippet_props
        || has_bindings;

    // Check if Svelte 5 children prop is needed
    let is_svelte5 = matches!(options.version, SvelteVersion::V5);

    // Build attribute/props segments (excluding on: and let: directives).
    // When this component is named-slot-routed (`named_slot_close`), its static
    // `slot="…"` attribute is consumed by the `$$slot_def[…]` wrapper, so drop it
    // from the props object; otherwise (root, or dynamic `slot={…}`) keep it.
    let mut attr_segs = build_component_props_segments(&comp.attributes, source, named_slot_close);

    // Add extra whitespace to match JS svelte2tsx position-preserving behavior
    let attrs_empty_before_pad = segs_is_empty(&attr_segs);
    if !comp.attributes.is_empty() && !attrs_empty_before_pad {
        let extra_spaces = count_tag_to_attr_spaces(&comp.name, comp.start, source);
        if extra_spaces >= 1 {
            let total_spaces = extra_spaces + 1;
            segs_trim_start(&mut attr_segs);
            let mut padded: Vec<Seg> = Vec::with_capacity(attr_segs.len() + 1);
            padded.push(Seg::Lit(" ".repeat(total_spaces)));
            padded.extend(attr_segs);
            attr_segs = padded;
        }
    }

    // Add children prop for Svelte 5 if component has children. Inserted
    // at the beginning of the props object, AFTER any leading whitespace
    // from the attribute spacing (when applicable).
    if is_svelte5 && has_children {
        let children_text = "children:() => { return __sveltets_2_any(0); },";
        if segs_is_empty(&attr_segs) {
            attr_segs = vec![Seg::Lit(children_text.to_string())];
        } else if has_lets || children_have_named_slots {
            // Slot let-forwarding owns the leading whitespace already.
            segs_trim_start(&mut attr_segs);
            let mut prefixed: Vec<Seg> = Vec::with_capacity(attr_segs.len() + 1);
            prefixed.push(Seg::Lit(children_text.to_string()));
            prefixed.extend(attr_segs);
            attr_segs = prefixed;
        } else {
            // Has other attrs: insert children between the leading whitespace
            // `Lit` and the first attribute.
            let mut leading_ws = String::new();
            if let Some(Seg::Lit(first)) = attr_segs.first_mut() {
                let trimmed = first.trim_start_matches(|c: char| c.is_whitespace());
                leading_ws.push_str(&first[..first.len() - trimmed.len()]);
                *first = trimmed.to_string();
                if first.is_empty() {
                    attr_segs.remove(0);
                }
            }
            let mut prefixed: Vec<Seg> = Vec::with_capacity(attr_segs.len() + 2);
            prefixed.push(Seg::Lit(format!("{}{}", leading_ws, children_text)));
            prefixed.extend(attr_segs);
            attr_segs = prefixed;
        }
    }

    // Build the replacement for the opening tag.
    let inst_var = reversed_component_instance_name(&comp.name, depth);
    // Component-side `bind:` suffix: type-widener + `$$bindings` marker.
    // Mirrors the JS reference's component branch in
    // `htmlxtojsx_v2/nodes/Binding.ts::handleBinding`:
    //   `() => expr = __sveltets_2_any(null); inst.$$bindings = 'name';`
    // is appended (as ignore-wrapped statements) for every non-`bind:this`
    // binding on a component.
    let component_bind_suffix = {
        let mut out = String::new();
        for attr in &comp.attributes {
            if let Attribute::BindDirective(bind) = attr {
                if bind.name == "this" {
                    // `bind:this={getFn, setFn}` (Svelte 5 function binding) calls
                    // the setter with the instance: `(setFn)(inst);` (mirrors
                    // Binding.ts). Plain `bind:this={x}` → `x = inst;`.
                    if let Some((_, (ss, se))) = get_set_binding_ranges(&bind.expression, source) {
                        let _ = write!(
                            out,
                            "({})({});",
                            slice_src(source, ss as usize, se as usize),
                            inst_var
                        );
                    } else {
                        // The assignment LHS strips a trailing TS assertion
                        // (`getEnd`); a `bind:this={consolePane as Pane}` postfix
                        // moves onto the RHS instance var:
                        // `consolePane = $$_inst as Pane;` — same as the element
                        // `bind:this` path (mirrors Binding.ts appending
                        // `[getEnd, expression.end]` after the assignment).
                        let expr_text = get_binding_lhs_text(&bind.expression, source);
                        let postfix = get_expression_range(&bind.expression)
                            .map(|(_, e)| {
                                let ge = get_expression_end_stripping_ts(&bind.expression, source)
                                    .unwrap_or(e);
                                let ee = extend_expr_end_with_ts_postfix(source, e, bind.end);
                                slice_src(source, ge as usize, ee as usize)
                            })
                            .unwrap_or("");
                        let _ = write!(out, "{} = {}{};", expr_text, inst_var, postfix);
                    }
                    continue;
                }
                if get_set_binding_ranges(&bind.expression, source).is_some() {
                    // Function binding `bind:foo={getFn, setFn}`: the get/set
                    // pair is already type-checked via
                    // `__sveltets_2_get_set_binding(...)` in the props literal,
                    // so the `() => expr = __sveltets_2_any(null)` type-widener
                    // is skipped (mirrors the `if (!isGetSetBinding)` guard in
                    // upstream `handleBinding`). Only the `$$bindings` marker
                    // is emitted.
                    let _ = write!(out, "{}.$$bindings = '{}';", inst_var, bind.name);
                    continue;
                }
                // Setter type-widener: LHS strips a trailing TS assertion.
                let expr_text = get_binding_lhs_text(&bind.expression, source);
                let _ = write!(
                    out,
                    "/*\u{03A9}ignore_start\u{03A9}*/() => {} = __sveltets_2_any(null);/*\u{03A9}ignore_end\u{03A9}*/{}.$$bindings = '{}';",
                    expr_text, inst_var, bind.name
                );
            }
        }
        out
    };
    let (header_lit, trailer_lit) = if needs_instance {
        let on_calls = if has_events {
            build_on_calls(&inst_var, &on_directives, source)
        } else {
            String::new()
        };
        (
            format!(
                " {{ const {} = __sveltets_2_ensureComponent({}); const {} = new {}({{ target: __sveltets_2_any(), props: {{",
                ctor_var, comp.name, inst_var, ctor_var,
            ),
            format!("}}}});{}{}", component_bind_suffix, on_calls),
        )
    } else {
        (
            format!(
                " {{ const {} = __sveltets_2_ensureComponent({}); new {}({{ target: __sveltets_2_any(), props: {{",
                ctor_var, comp.name, ctor_var,
            ),
            "}});".to_string(),
        )
    };
    let mut opener_segs: Vec<Seg> = Vec::with_capacity(attr_segs.len() + 2);
    opener_segs.push(Seg::Lit(header_lit));
    opener_segs.extend(attr_segs);
    if !use_snippet_props {
        // The snippet-prop path leaves the `props: { … ` object literal open so
        // the relocated `{#snippet}` props can be appended inside it; the trailer
        // (which closes the object) is emitted after the moves (see below).
        opener_segs.push(Seg::Lit(trailer_lit.clone()));
        // `style:`/`class:` directives on a component aren't props — official
        // still type-checks their values via lowered statements appended after
        // the `new …({...})` call (e.g. `__sveltets_2_ensureType(String, Number, …)`).
        opener_segs.extend(build_class_style_directive_suffix_segments(
            &comp.attributes,
            source,
        ));
        // transition:/in:/out:/animate: on a component lower to
        // `__sveltets_2_ensure{Transition,Animation}(name(undefined.mapElementTag("undefined")…))`.
        opener_segs.extend(build_component_directive_suffix(&comp.attributes, source));
    }
    let opener_segs = bake_out_of_order_src(opener_segs, source);
    emit_segmented_overwrite(str, comp.start, opening_tag_end, &opener_segs);

    // Handle closing tag
    let closing_tag_start = find_closing_tag_start(source, comp.end);
    let is_self_closing = closing_tag_start >= comp.end;

    // Handle children with slot awareness
    if has_lets || children_have_named_slots || children_have_default_slot_lets {
        // Process children with slot scoping
        process_component_children_with_slots(
            comp,
            &inst_var,
            &let_directives,
            source,
            options,
            str,
            counter,
            depth + 1,
        );
    } else if use_snippet_props {
        // Process children, turning each direct `{#snippet}` child into an
        // implicit prop relocated into the still-open `props: { … }` object.
        //
        // `move_range(s.start, s.end, anchor)` detaches the transformed snippet
        // chunk and re-links it immediately before the chunk that *starts* at
        // `anchor`. Moving snippets in source order to a fixed `anchor` preserves
        // their order (each new one lands right before the anchor chunk, i.e.
        // after the previously moved one). A leading run of snippets that sit
        // natively at the anchor (no intervening whitespace) is already in the
        // right place — moving them would be a no-op self-move (which the API
        // forbids) — so we just advance the anchor past them. The trailer that
        // closes the props object is appended after the final snippet.
        let mut anchor = opening_tag_end;
        let mut last_snippet_end: Option<u32> = None;
        let mut snippet_names: Vec<String> = Vec::new();
        for node in &comp.fragment.nodes {
            if let TemplateNode::SnippetBlock(s) = node {
                if s.start >= s.end {
                    continue;
                }
                snippet_names.push(get_expression_text(&s.expression, source).to_string());
                // This snippet is a child of the component, so its body is at depth+1
                // (the component is now an ancestor), consistent with the simple-children path.
                handle_snippet_block_as_component_prop(s, source, options, str, counter, depth + 1);
                if s.start == anchor {
                    anchor = s.end;
                } else {
                    str.move_range(s.start, s.end, anchor);
                }
                last_snippet_end = Some(s.end);
            } else {
                // Children of a component are at depth+1 (this component is the ancestor)
                process_node_inplace(node, source, options, str, counter, depth + 1);
            }
        }
        // After closing the `new Component({ props: { … } })` statement,
        // destructure each relocated snippet from the instance's `$$prop_def`
        // (wrapped in ignore-markers so it never surfaces as a diagnostic). This
        // mirrors official svelte2tsx and anchors the snippet props' types — in
        // particular the snippet's `Snippet<[Args]>` parameter type — so the
        // snippet's parameters are inferred even when the component's type comes
        // from a value rather than an imported `.svelte` module (#796).
        let prop_def_suffix = if snippet_names.is_empty() {
            String::new()
        } else {
            format!(
                "/*\u{03A9}ignore_start\u{03A9}*/const {{{}}} = {}.$$prop_def;/*\u{03A9}ignore_end\u{03A9}*/",
                snippet_names.join(", "),
                inst_var
            )
        };
        let closing = format!("{trailer_lit}{prop_def_suffix}");
        // Close the props object right after the last relocated snippet.
        match last_snippet_end {
            Some(end) => {
                str.append_left(end, &closing);
            }
            None => {
                // No usable snippet after all (e.g. only empty-named blocks);
                // close the props object at the opening-tag boundary.
                str.prepend_right(opening_tag_end, &closing);
            }
        }
    } else {
        // Simple children processing: this component is now an ancestor → depth+1.
        process_fragment_inplace(&comp.fragment, source, options, str, counter, depth + 1);
    }

    // For components with `let:` but NO children (in either bracketed
    // or self-closing form) emit the let-forwarding block as an inline
    // open+close. Mirrors `defaultSlotLetTransformation` for the
    // self-closing branch in the JS reference's `InlineComponent`.
    let has_children_for_block = comp
        .fragment
        .nodes
        .iter()
        .any(|n| !matches!(n, TemplateNode::Text(t) if t.start >= t.end));
    let needs_inline_block = has_lets && !has_children_for_block;
    let inline_block = if needs_inline_block {
        format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;}}",
            build_let_destructure_string(&let_directives, source),
            inst_var
        )
    } else {
        String::new()
    };

    if !is_self_closing {
        if needs_inline_block {
            // No children but bracketed (e.g. `<C let:x></C>`) — append
            // the slot-def block before the closing tag so the `let`
            // bindings have a scope.
            str.append_left(closing_tag_start, &inline_block);
        }
        if named_slot_close {
            // Close just this component's block; the named-slot caller emits
            // the component-name reference + the named-slot-block close after.
            str.overwrite(closing_tag_start, comp.end, " }");
        } else {
            str.overwrite(closing_tag_start, comp.end, &format!(" {}}}", comp.name));
        }
    } else if needs_inline_block {
        str.append_left(comp.end, &format!("{}{}}}", inline_block, comp.name));
    } else {
        str.append_left(comp.end, "}");
    }
    // Restore the slot context for following siblings.
    counter.slot_inst = saved_outer_slot;
}

/// True if `attributes` contains a `slot` attribute whose value is anything
/// other than the static string `"default"` — i.e. a *non-default* slot target.
///
/// Mirrors official `handleImplicitChildren`'s skip condition:
/// `a.name === 'slot' && a.value[0]?.data !== 'default'`. A dynamic
/// `slot={foo}` (no static `.data`) counts as non-default, as does any static
/// `slot="name"` except `slot="default"`.
fn has_non_default_slot_attr(attributes: &[Attribute], _source: &str) -> bool {
    for attr in attributes {
        if let Attribute::Attribute(node) = attr
            && node.name == "slot"
        {
            // Read the static text data of the first value part, if any.
            let value0_data: Option<String> = match &node.value {
                AttributeValue::Sequence(parts) => match parts.first() {
                    Some(AttributeValuePart::Text(text)) => Some(text.raw.to_string()),
                    _ => None,
                },
                _ => None,
            };
            return value0_data.as_deref() != Some("default");
        }
    }
    false
}

/// Check if a component's fragment has meaningful children for slot purposes.
///
/// Returns true if the component has any non-text children, or text children
/// with non-whitespace content.
fn has_component_slot_children(fragment: &Fragment, source: &str) -> bool {
    for node in &fragment.nodes {
        match node {
            TemplateNode::Text(text) => {
                // Use the DECODED `text.data` (HTML entities resolved), not the
                // raw source: `&nbsp;` decodes to U+00A0 which IS whitespace, so
                // `<Component>&nbsp;</Component>` has no meaningful default-slot
                // content and must not get a synthetic `children` prop. Mirrors
                // upstream `handleImplicitChildren`'s `node.data` check.
                if text.data.chars().any(|c| !c.is_whitespace()) {
                    return true;
                }
            }
            // `{#snippet}` blocks are passed as implicit *props*, not as
            // default-slot content, so they must not trigger the synthetic
            // `children` prop (which would otherwise produce a false
            // `'children' does not exist in type '$$ComponentProps'`).
            // Comments are likewise ignorable. Mirrors upstream
            // `handleImplicitChildren`, which skips `SnippetBlock` / `Comment`
            // and only fakes a `children` prop for a real default-slot child.
            TemplateNode::SnippetBlock(_) | TemplateNode::Comment(_) => {}
            // A `<slot>` child never contributes default-slot content — official
            // `handleImplicitChildren` skips every `child.type === 'Slot'`
            // unconditionally (it forwards a slot, it isn't slotted content).
            TemplateNode::SlotElement(_) => {}
            // Non-default-slot children (`<el slot="name">`, `slot={dynamic}`,
            // `<svelte:fragment slot="name">`, etc.) populate their slot, NOT
            // the default `children` prop, so they must not trigger the
            // synthetic `children`. Only default-slot content (no `slot=`, or
            // `slot="default"`) counts. Mirrors upstream `handleImplicitChildren`
            // which skips any child whose `slot` value isn't `"default"`.
            TemplateNode::RegularElement(el)
                if has_non_default_slot_attr(&el.attributes, source) => {}
            TemplateNode::Component(c) if has_non_default_slot_attr(&c.attributes, source) => {}
            TemplateNode::SvelteFragment(f) if has_non_default_slot_attr(&f.attributes, source) => {
            }
            TemplateNode::SvelteElement(e) if has_non_default_slot_attr(&e.attributes, source) => {}
            TemplateNode::SvelteSelf(s) if has_non_default_slot_attr(&s.attributes, source) => {}
            TemplateNode::SvelteComponent(sc)
                if has_non_default_slot_attr(&sc.attributes, source) => {}
            _ => return true,
        }
    }
    false
}

/// Check if any *direct* child carries `let:` directives that destructure from
/// THIS component's `$$slot_def` — i.e. a default-slot let receiver that is an
/// *element* such as `<svelte:fragment let:a={x}>`, `<div let:foo>` or
/// `<svelte:element let:foo>`. Such an element child references the parent
/// component (`Element.addSlotLet` → `this.parent.name`), so the parent needs
/// the `const $$_inst = new …` form.
///
/// Component-kind children (`<Child let:foo>`, `<svelte:component let:foo>`,
/// `<svelte:self let:foo>`) are excluded: their `let:` belongs to their OWN
/// slot (`InlineComponent.addSlotLet` → `this.name`), so they do NOT force the
/// parent's instance const. `let:` directives are only meaningful on direct
/// children of a component, so this does not recurse.
fn has_default_slot_let_children(fragment: &Fragment, _source: &str) -> bool {
    fragment.nodes.iter().any(|node| {
        // Only NON-component default-slot children forward their `let:` bindings
        // to the enclosing component's `$$slot_def.default`. A component child
        // (`<Child let:x>` / `<svelte:component let:x>` / `<svelte:self let:x>`)
        // binds `let:x` from its OWN `$$slot_def.default` — its own
        // `handle_component` emits that destructure — so it must not mark the
        // parent as needing an instance var. Mirrors official svelte2tsx, where
        // only `Element`/`SlotElement`/`InlineComponent` *slot content* (not the
        // inline component's own lets) routes through the parent slot.
        let attrs = match node {
            TemplateNode::RegularElement(el) => &el.attributes,
            TemplateNode::SvelteFragment(f) => &f.attributes,
            TemplateNode::SvelteElement(e) => &e.attributes,
            _ => return false,
        };
        !get_let_directives(attrs).is_empty()
    })
}

/// Check if any children have `slot="name"` attributes (named slots).
fn has_named_slot_children(fragment: &Fragment, source: &str) -> bool {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(el)
                if get_slot_attr_value(&el.attributes, source).is_some() =>
            {
                return true;
            }
            TemplateNode::Component(comp)
                if get_slot_attr_value(&comp.attributes, source).is_some() =>
            {
                return true;
            }
            // `<svelte:fragment slot="name" let:foo>` is the Svelte 4 idiom
            // for distributing children into a named slot — it shows up here
            // as `SvelteFragment`. Treat it like the others.
            TemplateNode::SvelteFragment(el)
                if get_slot_attr_value(&el.attributes, source).is_some() =>
            {
                return true;
            }
            // `<slot slot="name">` forwards a `<slot>` into the parent
            // component's named slot.
            TemplateNode::SlotElement(el)
                if get_slot_attr_value(&el.attributes, source).is_some() =>
            {
                return true;
            }
            // `<svelte:element this={tag} slot="name">` targets a named slot.
            TemplateNode::SvelteElement(el)
                if get_slot_attr_value(&el.attributes, source).is_some() =>
            {
                return true;
            }
            // Control-flow blocks are transparent to slot distribution: a
            // `<div slot="foo">` nested inside `{#if}` / `{#each}` / `{#await}`
            // / `{#key}` still targets the component's named slot (official
            // svelte2tsx keeps `parent` pointing at the enclosing component
            // across blocks). Recurse into their fragments — but NOT into
            // nested elements/components (which own their own slot scope) or
            // `{#snippet}` bodies (snippet props, not slots).
            TemplateNode::IfBlock(block)
                if has_named_slot_children(&block.consequent, source)
                    || block
                        .alternate
                        .as_ref()
                        .is_some_and(|alt| has_named_slot_children(alt, source)) =>
            {
                return true;
            }
            TemplateNode::EachBlock(block)
                if has_named_slot_children(&block.body, source)
                    || block
                        .fallback
                        .as_ref()
                        .is_some_and(|fb| has_named_slot_children(fb, source)) =>
            {
                return true;
            }
            TemplateNode::AwaitBlock(block)
                if block
                    .pending
                    .as_ref()
                    .is_some_and(|p| has_named_slot_children(p, source))
                    || block
                        .then
                        .as_ref()
                        .is_some_and(|t| has_named_slot_children(t, source))
                    || block
                        .catch
                        .as_ref()
                        .is_some_and(|c| has_named_slot_children(c, source)) =>
            {
                return true;
            }
            TemplateNode::KeyBlock(block) if has_named_slot_children(&block.fragment, source) => {
                return true;
            }
            _ => {}
        }
    }
    false
}

/// Process component children with slot awareness.
///
/// This handles:
/// - Default slot wrapping with `let:` destructuring
/// - Named slot wrapping with `slot="name"` children
fn process_component_children_with_slots(
    comp: &Component,
    inst_var: &str,
    let_directives: &[&LetDirective],
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    let has_lets = !let_directives.is_empty();

    // Build the default slot destructuring if needed
    let let_destructure = build_let_destructure_string(let_directives, source);

    // Group children into default slot and named slots
    // For each child, determine if it belongs to a named slot or the default slot
    // Named slot children get their own $$slot_def blocks
    // Default slot children are wrapped in a single block with the component's let: destructuring

    // We need to track which children are named slots and process them specially.
    // The approach: iterate over children, and for each named-slot child, emit
    // a separate $$slot_def block. Non-named-slot children are part of the default slot.
    //
    // The default slot block is opened before the first default slot child and closed
    // after the last one (or before the first named slot child).

    let mut default_slot_opened = false;
    let mut prev_end: Option<u32> = None;

    // If there are let: directives, we need to open the default slot block
    // before any children (including text nodes).
    if has_lets {
        // We'll open the default slot block at the position of the first child
        // or immediately after the opening tag
        let block_open = format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
            let_destructure, inst_var
        );

        // Find where to insert the block open
        if let Some(first_node) = comp.fragment.nodes.first() {
            let first_start = first_node.start();
            // Insert the block opening before the first child
            str.append_left(first_start, &block_open);
        }
        default_slot_opened = true;
    }

    for (i, node) in comp.fragment.nodes.iter().enumerate() {
        let is_named_slot = match node {
            TemplateNode::RegularElement(el) => {
                get_slot_attr_value(&el.attributes, source).is_some()
            }
            TemplateNode::Component(child_comp) => {
                get_slot_attr_value(&child_comp.attributes, source).is_some()
            }
            TemplateNode::SvelteFragment(el) => {
                get_slot_attr_value(&el.attributes, source).is_some()
            }
            _ => false,
        };

        if is_named_slot {
            // The default slot's `$$slot_def.default` block stays open
            // through all children. Each named slot child carries its
            // own inner `$$slot_def["..."]` block (handled by the
            // dedicated handlers below); they're nested inside the
            // outer default block.

            // Process the named slot child (children of the parent component are at depth+1)
            match node {
                TemplateNode::RegularElement(el) => {
                    handle_named_slot_element(el, inst_var, source, options, str, counter, depth);
                }
                TemplateNode::Component(child_comp) => {
                    handle_named_slot_component(
                        child_comp, inst_var, source, options, str, counter, depth,
                    );
                }
                TemplateNode::SvelteFragment(el) => {
                    handle_named_slot_svelte_fragment(
                        el, inst_var, source, options, str, counter, depth,
                    );
                }
                _ => {
                    process_node_inplace(node, source, options, str, counter, depth);
                }
            }

            // Re-open default slot block after this named slot child if needed
            if has_lets {
                // Check if there are more non-named-slot children after this
                let _has_more_default = comp.fragment.nodes[i + 1..].iter().any(|n| match n {
                    TemplateNode::RegularElement(el) => {
                        get_slot_attr_value(&el.attributes, source).is_none()
                    }
                    TemplateNode::Component(c) => {
                        get_slot_attr_value(&c.attributes, source).is_none()
                    }
                    TemplateNode::SvelteFragment(el) => {
                        get_slot_attr_value(&el.attributes, source).is_none()
                    }
                    TemplateNode::Text(_) => true,
                    _ => true,
                });

                // Don't re-open if there are no more default slot children
                // Actually, we should re-open for any remaining children
                // We'll handle this below
            }
        } else {
            // Default slot child - process normally
            // If the default slot block was closed for a named slot, re-open it
            if has_lets && !default_slot_opened {
                let block_open = format!(
                    "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
                    let_destructure, inst_var
                );
                str.append_left(node.start(), &block_open);
                default_slot_opened = true;
            }
            // A default-slot child (`<svelte:fragment let:foo>`, `<div let:foo>`)
            // with no `slot=` but its OWN `let:` directives needs a
            // `$$slot_def.default` destructure block referencing the ENCLOSING
            // component — JS reference's Element.performTransformation emits one
            // whenever the default-slot child has `let:` directives. Wrap the
            // child so the `let:` bindings are scoped to its body.
            //
            // A COMPONENT child (`<Child let:foo>`) is excluded: its `let:foo`
            // binds from `Child`'s OWN `$$slot_def.default`, which its own
            // `handle_component` already emits. Routing it through the parent
            // here would wrongly duplicate the destructure onto the parent
            // instance (#1232).
            let fragment_lets: Option<Vec<&LetDirective>> = match node {
                TemplateNode::SvelteFragment(el) => {
                    let lets = get_let_directives(&el.attributes);
                    if lets.is_empty() { None } else { Some(lets) }
                }
                TemplateNode::RegularElement(el) => {
                    let lets = get_let_directives(&el.attributes);
                    if lets.is_empty() { None } else { Some(lets) }
                }
                _ => None,
            };
            let fragment_block_open = if let Some(ref lets) = fragment_lets {
                let destructure = build_let_destructure_string(lets, source);
                let block = format!(
                    "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
                    destructure, inst_var
                );
                str.append_left(node.start(), &block);
                true
            } else {
                false
            };
            // Mark the component slot context so a `slot="…"` element nested
            // inside this default-slot child's control-flow blocks (`{#if}` /
            // `{#each}` / …) is lowered to the named-slot form referencing this
            // component instance. A nested element/component clears it (each
            // owns its own slot scope) via `handle_regular_element`'s `take()`.
            let prev_slot = counter.slot_inst.replace(inst_var.to_string());
            process_node_inplace(node, source, options, str, counter, depth);
            counter.slot_inst = prev_slot;
            if fragment_block_open {
                str.append_left(node.end(), "}");
            }
        }

        prev_end = Some(node.end());
    }

    // Close the default slot block if still open
    if default_slot_opened && has_lets {
        // Find the position to close: after the last node, before the closing tag
        if let Some(end) = prev_end {
            let closing_tag_start = find_closing_tag_start(source, comp.end);
            if closing_tag_start < comp.end {
                str.append_left(closing_tag_start, "}");
            } else {
                str.append_left(end, "}");
            }
        }
    }
}

/// Handle a regular element child with `slot="name"` attribute inside a component.
///
/// Wraps the element in a `$$slot_def["name"]` destructuring block.
fn handle_named_slot_element(
    el: &RegularElement,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    let slot_name = get_slot_attr_value(&el.attributes, source).unwrap_or_default();
    let let_directives = get_let_directives(&el.attributes);
    let let_destructure = build_let_destructure_string(&let_directives.to_vec(), source);

    // Build the slot def block opener
    let block_open = format!(
        "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    // Build attributes string excluding `slot` and `let:` directives
    let attrs_str = build_named_slot_element_attrs(&el.attributes, source);

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);

    // class:/style: directives lower to statements after createElement
    // (`class:bar` → ` bar;`), same as a regular element. The `let:` binding
    // itself is consumed by the `$$slot_def[…]` destructure above (and any use
    // in the body emits its own reference), so it is NOT re-emitted here.
    let class_style_suffix = segs_to_string(
        &build_class_style_directive_suffix_segments(&el.attributes, source),
        source,
    );

    // NOTE: the `let:foo={bar}` binding is reflected purely via the slot-def
    // destructure (`{ …, foo: bar } = …$$slot_def["…"]`); official emits NO
    // separate `bar;` reflection statement (that would duplicate the `{bar}`
    // content expression).
    let opener = format!(
        "{}{{ svelteHTML.createElement(\"{}\", {{{}}});{}",
        block_open, el.name, attrs_str, class_style_suffix
    );
    str.overwrite(el.start, opening_tag_end, &opener);

    // This named-slot element is a RegularElement — its children are at depth+1.
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

    // Void elements (`<input slot="x">`) and source-self-closing tags have no
    // `</tag>`; calling `find_closing_tag_start` would scan backward and match
    // an unrelated earlier `</…>` (e.g. `</script>`), overwriting everything in
    // between. Append the closing braces at `el.end` instead. Mirrors
    // `handle_regular_element`.
    let is_self_closing_source = slice_src(source, el.start as usize, el.end as usize)
        .trim_end()
        .ends_with("/>");
    let is_void = crate::compiler::utils::is_void_element(&el.name);
    if is_void || is_self_closing_source {
        str.append_left(el.end, " }}");
    } else {
        let closing_tag_start = find_closing_tag_start(source, el.end);
        if closing_tag_start < el.end {
            str.overwrite(closing_tag_start, el.end, " }}");
        } else {
            str.append_left(el.end, " }}");
        }
    }
}

/// Handle a `<svelte:fragment slot="name" let:foo>` child inside a parent
/// component. `<svelte:fragment>` itself doesn't render to HTML — it's a
/// virtual element used to distribute children into a named slot. The JS
/// reference still emits a `svelteHTML.createElement("svelte:fragment", { })`
/// (with `slot` and `let:` attributes stripped), wrapped in the slot let
/// destructure block.
fn handle_named_slot_svelte_fragment(
    el: &SvelteElement,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    let slot_name = get_slot_attr_value(&el.attributes, source).unwrap_or_default();
    let let_directives = get_let_directives(&el.attributes);
    let let_destructure = build_let_destructure_string(&let_directives.to_vec(), source);

    // Leading ` ` matches the JS reference, which produces
    // `\t {const ... ;{ svelteHTML.createElement(...)` after the tab indent
    // is preserved.
    let block_open = format!(
        " {{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
    let closing_tag_start = find_closing_tag_start(source, el.end);
    let has_closing_tag = closing_tag_start < el.end;

    // Emit the slot-def block + a `svelteHTML.createElement("svelte:fragment", {  })`
    // with the `slot` / `let:` attributes stripped. The JS reference's
    // position-preserving emission leaves one space per stripped attribute
    // visible inside the empty `{}` (so `slot="x" let:y` → 2 spaces,
    // `slot="x" let:y let:z` → 3 spaces, etc.).
    let attrs_str = build_named_slot_element_attrs(&el.attributes, source);
    let inner = if attrs_str.is_empty() {
        let stripped_count = el
            .attributes
            .iter()
            .filter(|a| {
                matches!(
                    a,
                    Attribute::Attribute(node)
                        if node.name == "slot"
                ) || matches!(a, Attribute::LetDirective(_))
            })
            .count();
        " ".repeat(stripped_count.max(1))
    } else {
        attrs_str
    };
    let opener = format!(
        "{}{{ svelteHTML.createElement(\"svelte:fragment\", {{{}}});",
        block_open, inner
    );

    if !has_closing_tag {
        // Self-closing `<svelte:fragment slot="x" />` — body has no nodes.
        let combined = format!("{} }}}}", opener);
        str.overwrite(el.start, el.end, &combined);
        return;
    }

    str.overwrite(el.start, opening_tag_end, &opener);
    // `<svelte:fragment slot=…>` emits its own `createElement("svelte:fragment")`,
    // so it is an element nesting level — children (their `$$_<name><depth>`
    // instance vars) are at depth + 1.
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);
    str.overwrite(closing_tag_start, el.end, " }}");
}

/// Handle a component child with `slot="name"` attribute inside a parent component.
fn handle_named_slot_component(
    comp: &Component,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    let slot_name = get_slot_attr_value(&comp.attributes, source).unwrap_or_default();
    let let_directives = get_let_directives(&comp.attributes);
    let let_destructure = build_let_destructure_string(&let_directives.to_vec(), source);

    // Build the slot def block opener
    let block_open = format!(
        "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    // Insert the block opener before the component
    str.append_left(comp.start, &block_open);

    // Process the component normally. Suppress its component-name reference at
    // the close so we can emit it *outside* the component's own block (matching
    // official `endTransformation` order: component-block `}`, then `Name`, then
    // the named-slot-block `}`).
    counter.named_slot_component_close = true;
    counter.suppress_component_lets = true;
    handle_component(comp, source, options, str, counter, depth);

    // Emit the component-name reference (non-self-closing only — official maps
    // `</Name>` to `Name`; self-closing components have no name reference) and
    // close the named-slot block.
    let closing_tag_start = find_closing_tag_start(source, comp.end);
    if closing_tag_start < comp.end {
        str.append_left(comp.end, &format!(" {}}}", comp.name));
    } else {
        str.append_left(comp.end, "}");
    }
}

/// Build attribute string for a named slot element, excluding `slot` and `let:` directives.
fn build_named_slot_element_attrs(attributes: &[Attribute], source: &str) -> String {
    let mut parts: Vec<String> = Vec::new();

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                if node.name == "slot" {
                    continue;
                }
                // Named-slot elements become `svelteHTML.createElement(…)` calls,
                // so they are real DOM elements — apply data-* wrapping.
                if let Some(s) = format_attribute_node(node, source, true) {
                    parts.push(s);
                }
            }
            Attribute::SpreadAttribute(spread) => {
                if let Some(s) = format_spread_attribute(spread, source) {
                    parts.push(s);
                }
            }
            Attribute::BindDirective(bind) => {
                parts.push(format_bind_directive(bind, source));
            }
            Attribute::OnDirective(on) => {
                parts.push(format_on_directive(on, source));
            }
            Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => {
                // class:/style: are not props — they lower to statements after
                // createElement (see the suffix in handle_named_slot_element).
            }
            Attribute::TransitionDirective(transition) => {
                if let Some(s) = format_transition_directive(transition, source) {
                    parts.push(s);
                }
            }
            Attribute::UseDirective(use_dir) => {
                if let Some(s) = format_use_directive(use_dir, source) {
                    parts.push(s);
                }
            }
            // Skip let: directives and animate
            Attribute::AnimateDirective(_) | Attribute::LetDirective(_) => {}
            Attribute::AttachTag(_) => {}
        }
    }

    let result = parts.join("");
    if result.is_empty() {
        result
    } else {
        format!(" {}", result)
    }
}

/// Handle `<svelte:component this={expr}>`.
fn handle_svelte_component(
    comp: &SvelteComponentElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if comp.start >= comp.end {
        return;
    }

    // This component's children own their own slot scope: clear any inherited
    // slot context (restored at the end for following siblings).
    let saved_outer_slot = counter.slot_inst.take();

    let expr_text = get_expression_text(&comp.expression, source);
    // Use "svelte:component" as the name for variable naming, with ':' replaced by '_'
    let scomp_name = "svelte:component".replace(':', "_");

    let opening_tag_end = find_opening_tag_end(source, comp.start, comp.end);

    // Collect on: directives
    let on_directives = get_on_directives(&comp.attributes);
    let has_events = !on_directives.is_empty();

    // Build attribute/props string (excluding on: directives)
    let mut attrs_str = build_component_props_string(&comp.attributes, source);

    // Add extra whitespace to match JS svelte2tsx position-preserving behavior
    if !comp.attributes.is_empty() && !attrs_str.is_empty() {
        let extra_spaces = count_tag_to_attr_spaces("svelte:component", comp.start, source);
        if extra_spaces >= 1 {
            let total_spaces = extra_spaces + 1;
            let mut padded = " ".repeat(total_spaces);
            padded.push_str(attrs_str.trim_start());
            attrs_str = padded;
        }
    }

    // Check if component has meaningful children for Svelte 5 children prop
    let has_children = has_component_slot_children(&comp.fragment, source);
    let is_svelte5 = matches!(options.version, SvelteVersion::V5);
    let let_directives_scomp = get_let_directives(&comp.attributes);
    let has_lets_scomp = !let_directives_scomp.is_empty();
    // Emit the synthetic `children` prop whenever there is default-slot content,
    // even alongside `let:` directives — matching handle_component (which has no
    // such guard). The `let:` destructure is emitted independently below.
    if is_svelte5 && has_children {
        let children_text = "children:() => { return __sveltets_2_any(0); },";
        let trimmed = attrs_str.trim_start();
        if trimmed.is_empty() {
            attrs_str = children_text.to_string();
        } else {
            let leading_ws: String = attrs_str
                .chars()
                .take_while(|c| c.is_whitespace())
                .collect();
            attrs_str = format!("{}{}{}", leading_ws, children_text, trimmed);
        }
    }

    let ctor_var = reversed_component_name(&scomp_name, depth);
    let inst_var = reversed_component_instance_name(&scomp_name, depth);
    // A `bind:` directive on the component needs the instance variable too: it
    // emits a `inst.$$bindings = 'name'` marker (and a type-widener) after the
    // `new` statement, mirroring `handle_component`.
    let has_binds = comp
        .attributes
        .iter()
        .any(|a| matches!(a, Attribute::BindDirective(_)));
    // Build the bind suffix (same shape as `handle_component`'s
    // `component_bind_suffix`).
    let component_bind_suffix = {
        let mut out = String::new();
        for attr in &comp.attributes {
            if let Attribute::BindDirective(bind) = attr {
                if bind.name == "this" {
                    // LHS strips a trailing TS assertion; a postfix moves onto the
                    // RHS instance var (mirrors Binding.ts / the element path).
                    let bexpr = get_binding_lhs_text(&bind.expression, source);
                    let postfix = get_expression_range(&bind.expression)
                        .map(|(_, e)| {
                            let ge = get_expression_end_stripping_ts(&bind.expression, source)
                                .unwrap_or(e);
                            let ee = extend_expr_end_with_ts_postfix(source, e, bind.end);
                            slice_src(source, ge as usize, ee as usize)
                        })
                        .unwrap_or("");
                    let _ = write!(out, "{} = {}{};", bexpr, inst_var, postfix);
                    continue;
                }
                if get_set_binding_ranges(&bind.expression, source).is_some() {
                    let _ = write!(out, "{}.$$bindings = '{}';", inst_var, bind.name);
                    continue;
                }
                // Setter type-widener: LHS strips a trailing TS assertion.
                let bexpr = get_binding_lhs_text(&bind.expression, source);
                let _ = write!(
                    out,
                    "/*\u{03A9}ignore_start\u{03A9}*/() => {} = __sveltets_2_any(null);/*\u{03A9}ignore_end\u{03A9}*/{}.$$bindings = '{}';",
                    bexpr, inst_var, bind.name
                );
            }
        }
        out
    };
    // Need an instance variable when there are `on:` events, `let:` directives,
    // `bind:` directives, or children that reference the instance's slot defs
    // (named-slot children anywhere in blocks, or default-slot `let:` receivers).
    let children_have_named_slots = has_named_slot_children(&comp.fragment, source);
    let children_have_default_slot_lets = has_default_slot_let_children(&comp.fragment, source);
    let needs_inst = has_events
        || has_lets_scomp
        || has_binds
        || children_have_named_slots
        || children_have_default_slot_lets;
    let mut opener = if needs_inst {
        let on_calls = if has_events {
            build_on_calls(&inst_var, &on_directives, source)
        } else {
            String::new()
        };
        format!(
            " {{ const {} = __sveltets_2_ensureComponent({}); const {} = new {}({{ target: __sveltets_2_any(), props: {{{}}}}});{}{}",
            ctor_var, expr_text, inst_var, ctor_var, attrs_str, component_bind_suffix, on_calls
        )
    } else {
        format!(
            " {{ const {} = __sveltets_2_ensureComponent({}); new {}({{ target: __sveltets_2_any(), props: {{{}}}}});",
            ctor_var, expr_text, ctor_var, attrs_str
        )
    };

    // Slot let-forwarding: `{const { $$_$$, prop, } = inst.$$slot_def.default; $$_$$;`
    // Mirrors `defaultSlotLetTransformation` in the JS reference's
    // `htmlxtojsx_v2/nodes/InlineComponent.ts`.
    if has_lets_scomp {
        let destructure = build_let_destructure_string(&let_directives_scomp, source);
        let _ = write!(
            opener,
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
            destructure, inst_var
        );
    }

    str.overwrite(comp.start, opening_tag_end, &opener);

    // Children of svelte:component are at depth+1 (this component is now an
    // ancestor). Mark the slot context so `slot="x"` children (incl. those
    // nested in control-flow blocks) lower to `inst.$$slot_def["x"]`.
    let prev_slot = counter.slot_inst.replace(inst_var.clone());
    process_fragment_inplace(&comp.fragment, source, options, str, counter, depth + 1);
    counter.slot_inst = prev_slot;

    let closing_tag_start = find_closing_tag_start(source, comp.end);
    let closing_text = if has_lets_scomp { "}}" } else { "}" };
    if closing_tag_start < comp.end {
        str.overwrite(closing_tag_start, comp.end, closing_text);
    } else {
        str.append_left(comp.end, closing_text);
    }

    // Restore the slot context for following siblings.
    counter.slot_inst = saved_outer_slot;
}

/// Handle `<svelte:element this={tag}>`.
fn handle_svelte_dynamic_element(
    el: &SvelteDynamicElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
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
        let lets = get_let_directives(&el.attributes);
        let let_destructure = build_let_destructure_string(&lets, source);
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
        build_attributes_string(&el.attributes, source, saved_slot.is_some())
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

/// Handle `<title>` element.
fn handle_title_element(
    el: &TitleElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
    let attrs_str = build_attributes_string(&el.attributes, source, counter.slot_inst.is_some());

    let opener = format!(
        " {{ svelteHTML.createElement(\"title\", {{{}}});",
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

/// Handle `<slot>` element.
///
/// Generates `{ __sveltets_createSlot("name", { attrs }); fallback_children }`.
///
/// The slot name is determined by the `name` attribute (default: "default").
/// Other attributes become slot props. `bind:this` gets special handling.
fn handle_slot_element(
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

/// Handle `<svelte:self>` element.
///
/// `<svelte:self>` becomes `__sveltets_2_createComponentAny({props})`.
/// When there are event directives, a variable is created for `$on()` calls.
fn handle_svelte_self(
    el: &SvelteElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
    let closing_tag_start = find_closing_tag_start(source, el.end);
    let has_closing_tag = closing_tag_start < el.end;

    // Separate on: + let: directives from regular attributes
    let mut has_on_directives = false;
    let mut on_directives = Vec::new();
    let let_directives = get_let_directives(&el.attributes);
    let mut prop_parts = Vec::new();

    for attr in &el.attributes {
        match attr {
            Attribute::OnDirective(on) => {
                has_on_directives = true;
                on_directives.push(on);
            }
            Attribute::LetDirective(_) => {
                // Handled below via `let_directives` — not emitted as a prop.
            }
            _ => match attr {
                Attribute::Attribute(node) => {
                    // `<svelte:self>` is component-like (`__sveltets_2_createComponentAny`),
                    // so apply --* CSS-prop wrapping, not data-* element wrapping.
                    if let Some(s) = format_attribute_node(node, source, false) {
                        prop_parts.push(s);
                    }
                }
                Attribute::SpreadAttribute(spread) => {
                    if let Some(s) = format_spread_attribute(spread, source) {
                        prop_parts.push(s);
                    }
                }
                Attribute::BindDirective(bind) => {
                    prop_parts.push(format_bind_directive(bind, source));
                }
                _ => {}
            },
        }
    }

    // `<svelte:self>` is an InlineComponent in official svelte2tsx, so the
    // implicit-children rule applies: in Svelte 5, default-slot content
    // (non-named-slot children) adds a synthetic `children` prop. Mirrors
    // `handleImplicitChildren` (gated on `options.svelte5Plus`). Inserted at the
    // front of the props, before any real attributes.
    if matches!(options.version, SvelteVersion::V5)
        && has_component_slot_children(&el.fragment, source)
    {
        prop_parts.insert(
            0,
            "children:() => { return __sveltets_2_any(0); },".to_string(),
        );
    }

    let props_inner = if prop_parts.is_empty() {
        " ".to_string()
    } else {
        let extra_spaces = count_tag_to_attr_spaces(&el.name, el.start, source);
        if extra_spaces >= 1 {
            format!("{}{}", " ".repeat(extra_spaces + 1), prop_parts.join(""))
        } else {
            format!(" {}", prop_parts.join(""))
        }
    };

    let needs_inst_var = has_on_directives || !let_directives.is_empty();
    // Use depth as the instance variable index, mirroring official InlineComponent.ts
    // `this._name = '$$_svelteself' + this.computeDepth()`.
    let var_name = if needs_inst_var {
        Some(format!("$$_svelteself{}", depth))
    } else {
        None
    };

    let create_call = if let Some(ref name) = var_name {
        format!(
            " {{ const {} = __sveltets_2_createComponentAny({{{}}});",
            name, props_inner
        )
    } else {
        format!(" {{ __sveltets_2_createComponentAny({{{}}});", props_inner)
    };

    let mut opener = create_call;

    // Inline `$on()` registration immediately after the const declaration.
    if let Some(ref name) = var_name {
        for on in &on_directives {
            if let Some(ref expr) = on.expression {
                let expr_text = get_expression_text(expr, source);
                let _ = write!(opener, "{}.$on(\"{}\", {}); ", name, on.name, expr_text);
            } else {
                let _ = write!(opener, "{}.$on(\"{}\", () => {{}}); ", name, on.name);
            }
        }
    }

    // `let:` directives become a `{const { $$_$$, name, ... } = inst.$$slot_def.default; $$_$$;`
    // block right after the create call, with a matching `}` at the end.
    // Mirrors the JS reference's `defaultSlotLetTransformation` in
    // `htmlxtojsx_v2/nodes/InlineComponent.ts`.
    let has_lets = !let_directives.is_empty();
    if has_lets {
        let destructure = build_let_destructure_string(&let_directives, source);
        let inst_name = var_name
            .as_ref()
            .expect("let: directive requires an instance variable name");
        let _ = write!(
            opener,
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
            destructure, inst_name
        );
    }

    if !has_closing_tag {
        // Self-closing `<svelte:self ... />` — no body to process; the
        // opener's `{` needs a closing `}` immediately, plus another `}` if
        // there's a let-forward block to close.
        let trailing = if has_lets { "}}" } else { "}" };
        let combined = format!("{}{}", opener, trailing);
        str.overwrite(el.start, el.end, &combined);
        return;
    }

    str.overwrite(el.start, opening_tag_end, &opener);
    // svelte:self is a component → children at depth+1.
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);
    let trailing = if has_lets { "}}" } else { "}" };
    str.overwrite(closing_tag_start, el.end, trailing);
}

/// Handle Svelte special elements (svelte:body, svelte:window, etc.).
///
/// `svelte:boundary` is special: like `InlineComponent` in the upstream
/// svelte2tsx, any `{#snippet}` blocks that are **direct children** of
/// `<svelte:boundary>` become **implicit properties** of the element's
/// `createElement` attributes object instead of standalone `const` declarations.
/// This mirrors upstream `SnippetBlock.ts::hoistSnippetBlock` which returns
/// early for `SvelteBoundary` (treating it exactly like `InlineComponent`),
/// and `Element.ts::addAttribute` which the upstream `handleSnippet` calls to
/// insert the snippet body as an attr-value transform.
///
/// For all other special elements the snippet children remain standalone
/// declarations (the default behaviour for elements/blocks).
fn handle_svelte_special_element(
    el: &SvelteElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
    let mut attrs_str =
        build_attributes_string(&el.attributes, source, counter.slot_inst.is_some());

    // Add extra whitespace to match JS svelte2tsx position-preserving behavior
    if !el.attributes.is_empty() && !attrs_str.is_empty() {
        let extra_spaces = count_tag_to_attr_spaces(&el.name, el.start, source);
        if extra_spaces >= 1 {
            let total_spaces = extra_spaces + 1;
            let mut padded = " ".repeat(total_spaces);
            padded.push_str(attrs_str.trim_start());
            attrs_str = padded;
        }
    }

    // `svelte:boundary` treats direct {#snippet} children as implicit props on
    // the `createElement` attrs object — exactly like InlineComponent in the
    // upstream. Check whether any direct children are snippet blocks.
    let has_snippet_children = el.name == "svelte:boundary"
        && el
            .fragment
            .nodes
            .iter()
            .any(|n| matches!(n, TemplateNode::SnippetBlock(s) if s.start < s.end));

    if has_snippet_children {
        // Emit the opener with the attrs object left OPEN so we can append the
        // implicit snippet props into it before closing. Any regular element
        // attributes (e.g. `onerror`) come first as normal.
        //
        // Result shape:
        //   { svelteHTML.createElement("svelte:boundary", { <regular-attrs>
        //     <snippet-name>: (params) => { … return __sveltets_2_any(0) },
        //   });
        //   <non-snippet children>
        // }
        let opener = format!(
            " {{ svelteHTML.createElement(\"{}\", {{{}",
            el.name, attrs_str
        );
        str.overwrite(el.start, opening_tag_end, &opener);

        // Process each direct child: transform snippet blocks as implicit props
        // and move them to anchor (just after the opening tag), then process
        // non-snippet children in-place (they will appear after the `});`).
        // Mirrors the `use_snippet_props` branch in `handle_component`.
        let mut anchor = opening_tag_end;
        let mut last_snippet_end: Option<u32> = None;

        for node in &el.fragment.nodes {
            if let TemplateNode::SnippetBlock(s) = node {
                if s.start >= s.end {
                    continue;
                }
                // Transform the snippet as an implicit attr prop of this
                // element (same form as a component implicit snippet prop):
                //   name: (params) => { … return __sveltets_2_any(0) },
                handle_snippet_block_as_component_prop(s, source, options, str, counter, depth + 1);
                if s.start == anchor {
                    anchor = s.end;
                } else {
                    str.move_range(s.start, s.end, anchor);
                }
                last_snippet_end = Some(s.end);
            } else {
                // Non-snippet children live AFTER the createElement call;
                // svelte:boundary is an ancestor element → depth+1.
                process_node_inplace(node, source, options, str, counter, depth + 1);
            }
        }

        // Close the attrs object and the `createElement(...)` call right
        // after the last relocated snippet prop.
        let close_create_element = "});";
        match last_snippet_end {
            Some(end) => {
                str.append_left(end, close_create_element);
            }
            None => {
                // No usable snippet found (shouldn't happen given the guard
                // above, but guard defensively): close immediately.
                str.prepend_right(opening_tag_end, close_create_element);
            }
        }

        // Close the outer `{ … }` block.
        let closing_tag_start = find_closing_tag_start(source, el.end);
        if closing_tag_start < el.end {
            str.overwrite(closing_tag_start, el.end, " }");
        } else {
            str.append_left(el.end, "}");
        }
    } else {
        // `bind:` directives on a special element use the same lowering as a
        // regular element: `bind:this` and one-way bindings (`clientWidth`, …)
        // need a `const $$_<name><depth> = createElement(...)` so the binding
        // assignment (`foo = $$_<name><depth>.clientWidth;` / `target =
        // $$_<name><depth>;`) can reference it; other two-way bindings get the
        // generic `() => expr = __sveltets_2_any(null)` widener. Mirrors
        // upstream Element.ts + Binding.ts.
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
        // `use:` / `transition:` / `animate:` directives on a special element
        // (e.g. `<svelte:body use:tooltip={…}>`) become the same V4-style
        // action/transition emission as on a regular element: an
        // `const $$action_N = __sveltets_2_ensureAction(…);` prefix, a
        // `__sveltets_2_union($$action_N)` second argument to `createElement`,
        // and transition/animate suffixes. The action's `mapElementTag` uses the
        // mapped tag name (`svelte:body` → `body`, per official Element.ts).
        let action_tag = if el.name == "svelte:body" {
            "body"
        } else {
            el.name.as_str()
        };
        let (directive_prefix, directive_suffix, action_count) =
            build_directive_prefix_suffix(&el.attributes, source, action_tag);
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

        // Default path: all children (including any snippets) are processed
        // as standalone declarations inside the block. When `directive_prefix`
        // is present it opens an extra outer block scope (for the action
        // declarations), closed by a matching extra `}` after the children.
        let opener = if directive_prefix.is_empty() {
            format!(
                " {{ {}svelteHTML.createElement(\"{}\", {{{}}});{}{}",
                element_var_decl, el.name, attrs_str, bind_suffix, directive_suffix
            )
        } else {
            format!(
                " {{{}{{ {}svelteHTML.createElement(\"{}\"{}, {{{}}});{}{}",
                directive_prefix,
                element_var_decl,
                el.name,
                actions_arg,
                attrs_str,
                bind_suffix,
                directive_suffix
            )
        };
        str.overwrite(el.start, opening_tag_end, &opener);

        // Special svelte elements (svelte:head, svelte:body, etc.) are element
        // nodes → children at depth+1, consistent with RegularElement treatment.
        process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

        let extra_close = if directive_prefix.is_empty() { "" } else { "}" };
        let closing_tag_start = find_closing_tag_start(source, el.end);
        if closing_tag_start < el.end {
            str.overwrite(closing_tag_start, el.end, &format!(" }}{}", extra_close));
        } else {
            str.append_left(el.end, &format!("}}{}", extra_close));
        }
    }
}

// =============================================================================
// Slot Helpers
// =============================================================================

/// Extract the slot name from a `<slot>` element's attributes.
/// Returns "default" if no `name` attribute is present.
/// Slot name used as the **type** key in the component's `slots: { … }` return.
/// A static `name="header"` yields `header`; a missing name yields `default`; a
/// dynamic `name="{foo}"` (or `name={foo}`) yields the literal `undefined`
/// (official emits `slots: { undefined: {} }` for a non-static slot name).
fn slot_name_for_type(attributes: &[Attribute]) -> String {
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

fn get_slot_name(attributes: &[Attribute], source: &str) -> String {
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
fn get_bind_this_expr<'a>(attributes: &'a [Attribute], source: &'a str) -> Option<String> {
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
fn build_slot_props_string(attributes: &[Attribute], source: &str) -> String {
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
fn get_slot_attr_value(attributes: &[Attribute], _source: &str) -> Option<String> {
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

// =============================================================================
// Legacy string-based API (kept for backward compatibility during migration)
// =============================================================================

/// Process a template fragment and generate TSX output (string-based, legacy).
///
/// This is kept temporarily for backward compatibility. New code should use
/// `process_template_inplace`.
pub fn process_template(fragment: &Fragment, source: &str, options: &Svelte2TsxOptions) -> String {
    let mut str = MagicString::new(source);
    process_template_inplace(fragment, source, options, &mut str);
    str.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ast::template::Fragment;

    #[test]
    fn test_process_empty_template() {
        let fragment = Fragment::default();
        let options = Svelte2TsxOptions::default();
        let mut str = MagicString::new("");
        process_template_inplace(&fragment, "", &options, &mut str);
        assert_eq!(str.to_string(), "");
    }

    // Tests for data-* and --* attribute wrapping rules.
    // Mirrors `htmlxtojsx_v2/nodes/Attribute.ts` `addAttribute` / `addProp`.

    use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

    fn compile_template(src: &str) -> String {
        svelte2tsx(src, Svelte2TsxOptions::default()).unwrap().code
    }

    #[test]
    fn test_data_attr_on_element_is_wrapped_with_empty() {
        // `data-foo="foobarbaz"` on a DOM element must become
        // `...__sveltets_2_empty({"data-foo":\`foobarbaz\`})`.
        let src = "<p data-foo=\"foobarbaz\">hello</p>";
        let out = compile_template(src);
        assert!(
            out.contains("...__sveltets_2_empty({\"data-foo\":`foobarbaz`})"),
            "expected __sveltets_2_empty wrap, got:\n{out}"
        );
    }

    #[test]
    fn test_data_sveltekit_attr_not_wrapped() {
        // `data-sveltekit-*` must NOT be wrapped — it is valid in `svelte/elements`.
        let src = "<a data-sveltekit-preload-data=\"hover\">link</a>";
        let out = compile_template(src);
        assert!(
            !out.contains("__sveltets_2_empty"),
            "data-sveltekit-* should not be wrapped, got:\n{out}"
        );
        assert!(
            out.contains("\"data-sveltekit-preload-data\""),
            "data-sveltekit-preload-data should be a plain prop, got:\n{out}"
        );
    }

    #[test]
    fn test_data_attr_boolean_on_element_uses_true() {
        // Boolean `data-foo` (no value) on a DOM element → `true` (official wraps
        // it as `...__sveltets_2_empty({ "data-foo": true })`).
        let src = "<p data-foo>hello</p>";
        let out = compile_template(src);
        assert!(
            out.contains("...__sveltets_2_empty({\"data-foo\":true})"),
            "boolean data-* should use true, got:\n{out}"
        );
    }

    #[test]
    fn test_css_prop_on_component_is_wrapped_with_cssprop() {
        // `--my-var={x}` on a component must become
        // `...__sveltets_2_cssProp({"--my-var":x})`.
        let src = "<script>import Comp from \"./Comp.svelte\"; let x = 5;</script>\
                   <Comp --my-var={x} />";
        let out = compile_template(src);
        assert!(
            out.contains("...__sveltets_2_cssProp({\"--my-var\":x})"),
            "expected __sveltets_2_cssProp wrap, got:\n{out}"
        );
    }

    #[test]
    fn test_normal_attr_not_wrapped() {
        // Regular attributes (no data-* or --*) must remain unwrapped.
        let src = "<p class=\"foo\" id=\"bar\">hello</p>";
        let out = compile_template(src);
        assert!(
            !out.contains("__sveltets_2_empty"),
            "regular attrs should not be wrapped, got:\n{out}"
        );
        assert!(
            out.contains("\"class\":`foo`"),
            "class attr should be plain prop, got:\n{out}"
        );
    }
}
