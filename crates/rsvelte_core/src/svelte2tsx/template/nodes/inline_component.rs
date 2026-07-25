//! Components, `<svelte:component>` and `<svelte:self>`.
//! Mirrors `htmlxtojsx_v2/nodes/InlineComponent.ts`.

use std::fmt::Write as _;

use crate::ast::template::{
    Attribute, Component, SvelteComponentElement, SvelteElement, TemplateNode,
};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, SvelteVersion, slice_src};

use crate::svelte2tsx::template::attributes::attribute::format_attribute_node;
use crate::svelte2tsx::template::attributes::binding::format_bind_directive;
use crate::svelte2tsx::template::attributes::class_style::build_class_style_directive_suffix_segments;
use crate::svelte2tsx::template::attributes::directive_suffix::build_component_directive_suffix;
use crate::svelte2tsx::template::attributes::event_handler::{build_on_calls, get_on_directives};
use crate::svelte2tsx::template::attributes::let_::{
    build_let_destructure_string, get_let_directives,
};
use crate::svelte2tsx::template::attributes::spread::format_spread_attribute;
use crate::svelte2tsx::template::attributes::{
    build_component_props_segments, build_component_props_string,
};
use crate::svelte2tsx::template::ctx::Counter;
use crate::svelte2tsx::template::segs::{
    Seg, bake_out_of_order_src, emit_segmented_overwrite, segs_is_empty, segs_trim_start,
};
use crate::svelte2tsx::template::utils::expr::{
    extend_expr_end_with_ts_postfix, get_binding_lhs_text, get_expression_end_stripping_ts,
    get_expression_range, get_expression_text, get_set_binding_ranges,
};
use crate::svelte2tsx::template::utils::names::{
    reversed_component_instance_name, reversed_component_name,
};
use crate::svelte2tsx::template::utils::source::{
    count_tag_to_attr_spaces, find_closing_tag_start, find_opening_tag_end,
};
use crate::svelte2tsx::template::walk::{process_fragment_inplace, process_node_inplace};

use super::component_slots::{
    handle_named_slot_component, has_component_slot_children, has_default_slot_let_children,
    has_named_slot_children, process_component_children_with_slots,
};
use super::slot_element::get_slot_attr_value;
use super::snippet_block::handle_snippet_block_as_component_prop;

/// Handle a Svelte component: `<Component ...>`.
///
/// Supports:
/// - `on:` directives → instance variable + `.$on()` calls
/// - `let:` directives → instance variable + `$$slot_def` destructuring
/// - Svelte 5 `children` prop when component has children
/// - Named slots via `slot="name"` on children
/// - Component name in closing tag for non-self-closing components
pub(crate) fn handle_component(
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

/// Handle `<svelte:component this={expr}>`.
pub(crate) fn handle_svelte_component(
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

/// Handle `<svelte:self>` element.
///
/// `<svelte:self>` becomes `__sveltets_2_createComponentAny({props})`.
/// When there are event directives, a variable is created for `$on()` calls.
pub(crate) fn handle_svelte_self(
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
