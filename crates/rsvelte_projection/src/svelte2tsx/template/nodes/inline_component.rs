//! Components, `<svelte:component>` and `<svelte:self>`.
//! Mirrors `htmlxtojsx_v2/nodes/InlineComponent.ts`.

use std::fmt::Write as _;

use crate::ast::template::{
    Attribute, Component, SvelteComponentElement, SvelteElement, TemplateNode,
};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, SvelteVersion, slice_src};

use crate::svelte2tsx::template::attributes::attribute::format_attribute_node;
use crate::svelte2tsx::template::attributes::binding::format_component_bind_directive;
use crate::svelte2tsx::template::attributes::class_style::build_class_style_directive_suffix_segments;
use crate::svelte2tsx::template::attributes::directive_suffix::build_component_directive_suffix;
use crate::svelte2tsx::template::attributes::event_handler::{build_on_calls, get_on_directives};
use crate::svelte2tsx::template::attributes::let_::{
    build_let_destructure_string, has_let_directives,
};
use crate::svelte2tsx::template::attributes::spread::format_spread_attribute;
use crate::svelte2tsx::template::attributes::{
    build_component_props_segments, build_component_props_string,
};
use crate::svelte2tsx::template::ctx::Counter;
use crate::svelte2tsx::template::segs::{Seg, bake_out_of_order_src, emit_segmented_overwrite};
use crate::svelte2tsx::template::utils::expr::{
    extend_expr_end_with_ts_postfix, get_binding_lhs_text, get_expression_end_stripping_ts,
    get_expression_range, get_expression_text, get_set_binding_ranges,
};
use crate::svelte2tsx::template::utils::names::reversed_component_name;
use crate::svelte2tsx::template::utils::opener_spacing::{
    OpenerCtx, closing_tag_spacing, opener_spacing,
};
use crate::svelte2tsx::template::utils::source::{find_closing_tag_start, find_opening_tag_end};
use crate::svelte2tsx::template::walk::{process_fragment_inplace, process_node_inplace};

use super::component_slots::{
    handle_named_slot_component, handle_named_slot_svelte_component, handle_named_slot_svelte_self,
    has_component_slot_children, has_default_slot_let_children, has_named_slot_children,
    process_component_children_with_slots,
};
use super::slot_element::slot_attr_static_name;
use super::snippet_block::handle_snippet_block_as_component_prop;

/// Post-create-call statements every inline component emits for its `bind:`
/// directives: the `bind:this` assignment plus, per two-way binding, a setter
/// type-widener and the `$$bindings` marker.
fn build_component_bind_suffix(attributes: &[Attribute], source: &str, inst_var: &str) -> String {
    let mut out = String::new();
    for attr in attributes {
        let Attribute::BindDirective(bind) = attr else {
            continue;
        };
        if bind.name == "this" {
            // `bind:this={getFn, setFn}` (Svelte 5 function binding) calls the
            // setter with the instance instead of assigning to it.
            if let Some((_, (ss, se))) = get_set_binding_ranges(&bind.expression, source) {
                let _ = write!(
                    out,
                    "({})({});",
                    slice_src(source, ss as usize, se as usize),
                    inst_var
                );
            } else {
                // A trailing TS assertion the parser stripped off the LHS moves
                // onto the RHS instance var: `pane = $$_inst as Pane;`.
                let expr_text = get_binding_lhs_text(&bind.expression, source);
                let postfix = get_expression_range(&bind.expression)
                    .map(|(_, e)| {
                        let ge =
                            get_expression_end_stripping_ts(&bind.expression, source).unwrap_or(e);
                        let ee = extend_expr_end_with_ts_postfix(source, e, bind.end);
                        slice_src(source, ge as usize, ee as usize)
                    })
                    .unwrap_or("");
                let _ = write!(out, "{} = {}{};", expr_text, inst_var, postfix);
            }
            continue;
        }
        if get_set_binding_ranges(&bind.expression, source).is_some() {
            // A get/set pair is already type-checked through
            // `__sveltets_2_get_set_binding(...)` in the props literal, so the
            // type-widener is skipped.
            let _ = write!(out, "{}.$$bindings = '{}';", inst_var, bind.name);
            continue;
        }
        let expr_text = get_binding_lhs_text(&bind.expression, source);
        let _ = write!(
            out,
            "/*\u{03A9}ignore_start\u{03A9}*/() => {} = __sveltets_2_any(null);/*\u{03A9}ignore_end\u{03A9}*/{}.$$bindings = '{}';",
            expr_text, inst_var, bind.name
        );
    }
    out
}

/// The `</Component>` → `Component}` mapping upstream keeps for the closing tag.
/// The `svelte:` tags keep nothing there, and neither does a component whose
/// closing tag is missing.
fn component_closing_name_range(
    name: &str,
    closing_tag_start: u32,
    node_end: u32,
) -> Option<(u32, u32)> {
    (!name.starts_with("svelte:") && closing_tag_start != node_end).then(|| {
        (
            closing_tag_start + 2,
            closing_tag_start + 2 + name.len() as u32,
        )
    })
}

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
    str: &mut MagicString<'_>,
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
        && slot_attr_static_name(&comp.attributes).is_some()
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
    let inst_var = reversed_component_name(&comp.name, depth);

    // Find the end of the opening tag
    let opening_tag_end = find_opening_tag_end(
        source,
        comp.start,
        comp.end,
        comp.name.as_str(),
        &comp.attributes,
    );

    // Collect on: directives and let: directives
    let on_directives = get_on_directives(&comp.attributes);
    let has_events = !on_directives.is_empty();
    // When this component is itself a named-slot child, its `let:` directives are
    // consumed by the parent's `$$slot_def["x"]` destructure, so don't re-emit
    // them here as the component's own default-slot let block.
    let suppress_lets = std::mem::take(&mut counter.suppress_component_lets);
    let has_lets = !suppress_lets && has_let_directives(&comp.attributes);

    // Check if component has meaningful children
    let has_children = has_component_slot_children(&comp.fragment, source);

    // Check if any children have named slots with let: directives
    let children_have_named_slots = has_named_slot_children(&comp.fragment);

    // A default-slot child carrying `let:` directives (e.g.
    // `<svelte:fragment let:a={x}>…`) destructures from
    // `inst.$$slot_def.default`, which references the component instance — so
    // it likewise needs the `const $$_inst = new …` form. Mirrors official's
    // `Element.addSlotLet` → `performTransformation` referencing
    // `this.parent.name`.
    let children_have_default_slot_lets = has_default_slot_let_children(&comp.fragment);

    // Named `{#snippet}` blocks that are direct children of a component are
    // passed as *implicit props* (`props: { name: (params) => … }`), not as
    // standalone `const name = …` declarations, so that TypeScript both
    // satisfies required snippet props and contextually types the snippet's
    // parameters from the prop's `Snippet<[T]>` type (#780). Official demotes a
    // snippet child unconditionally (`parentComponent` in `htmlxtojsx_v2/index.ts`
    // checks only "is this a direct child of an InlineComponent", never `let:` /
    // named-slot presence), so this relocation always applies alongside — not
    // instead of — the `let:` / named-slot children processing below (#2171).
    let use_snippet_props = comp
        .fragment
        .nodes
        .iter()
        .any(|n| matches!(n, TemplateNode::SnippetBlock(s) if s.start < s.end));

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
    let mut attr_segs = build_component_props_segments(
        &comp.attributes,
        source,
        &counter.element_opener_comments,
        named_slot_close,
    );

    // Add extra whitespace to match JS svelte2tsx position-preserving behavior
    let name_start = source[comp.start as usize..]
        .find(comp.name.as_str())
        .map_or(comp.start + 1, |o| comp.start + o as u32);
    let spacing = opener_spacing(
        source,
        comp.start,
        &comp.name,
        opening_tag_end,
        Some((name_start, name_start + comp.name.len() as u32)),
        &comp.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: false,
            in_component_slot: named_slot_close,
            tag_name: &comp.name,
            is_slot_tag: false,
        },
    );
    if spacing.in_attr_object > 0 {
        let mut padded: Vec<Seg> = Vec::with_capacity(attr_segs.len() + 1);
        padded.push(Seg::Lit(" ".repeat(spacing.in_attr_object)));
        padded.extend(attr_segs);
        attr_segs = padded;
    }
    // A named-slot child's `$$slot_def[…]` prologue is emitted by the caller
    // ahead of this block, and takes the leading gaps with it.
    let block_indent = if named_slot_close {
        String::new()
    } else {
        " ".repeat(spacing.before_block)
    };

    // Add children prop for Svelte 5 if component has children. Inserted
    // at the beginning of the props object, AFTER any leading whitespace
    // from the attribute spacing (when applicable).
    if is_svelte5 && has_children {
        let children_text = "children:() => { return __sveltets_2_any(0); },";
        // Insert between the leading whitespace `Lit` and the first attribute.
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

    // Build the replacement for the opening tag.
    // Component-side `bind:` suffix: type-widener + `$$bindings` marker.
    // Mirrors the JS reference's component branch in
    // `htmlxtojsx_v2/nodes/Binding.ts::handleBinding`:
    //   `() => expr = __sveltets_2_any(null); inst.$$bindings = 'name';`
    // is appended (as ignore-wrapped statements) for every non-`bind:this`
    // binding on a component.
    let component_bind_suffix = build_component_bind_suffix(&comp.attributes, source, &inst_var);
    let (header_lit, trailer_lit) = if needs_instance {
        let on_calls = if has_events {
            build_on_calls(&inst_var, &on_directives, source)
        } else {
            String::new()
        };
        (
            format!(
                "{}{{ const {}C = __sveltets_2_ensureComponent({}); const {} = new {}C({{ target: __sveltets_2_any(), props: {{",
                block_indent, inst_var, comp.name, inst_var, inst_var,
            ),
            format!("}}}});{}{}", component_bind_suffix, on_calls),
        )
    } else {
        (
            format!(
                "{}{{ const {}C = __sveltets_2_ensureComponent({}); new {}C({{ target: __sveltets_2_any(), props: {{",
                block_indent, inst_var, comp.name, inst_var,
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
    let mut deferred_slot_close = false;
    if use_snippet_props {
        // Every direct `{#snippet}` child is demoted to an implicit prop
        // relocated into the still-open `props: { … }` object, unconditionally —
        // mirrors official, which never gates this on `let:` / named-slot
        // presence (#2171). Any remaining (non-snippet) children still need the
        // `let:` / named-slot slot-scoping below, so they're left untouched here
        // when that's needed and handed to `process_component_children_with_slots`
        // afterward instead of being processed inline.
        let needs_slot_pass =
            has_lets || children_have_named_slots || children_have_default_slot_lets;
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
            } else if !needs_slot_pass {
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
        // When the component also has its own `let:` directives, the
        // `$$slot_def.default` destructure is appended right here (mirrors
        // official's `snippetPropVariablesDeclaration` immediately followed by
        // `defaultSlotLetTransformation`), rather than left to
        // `process_component_children_with_slots` — which would otherwise try to
        // insert it at the fragment's first child, landing inside the (now moved)
        // snippet chunk if that snippet was the first child.
        let own_default_let_open = if has_lets {
            format!(
                "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
                build_let_destructure_string(&comp.attributes, source),
                inst_var
            )
        } else {
            String::new()
        };
        let closing = format!("{trailer_lit}{prop_def_suffix}{own_default_let_open}");
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
        if needs_slot_pass {
            // Process the remaining (non-snippet) children with slot scoping;
            // the default-slot-let block was already opened above, so tell it
            // not to open another one.
            deferred_slot_close = process_component_children_with_slots(
                &comp.attributes,
                &comp.fragment,
                comp.end,
                &inst_var,
                has_lets,
                false,
                source,
                options,
                str,
                counter,
                depth + 1,
            );
        }
    } else if has_lets || children_have_named_slots || children_have_default_slot_lets {
        // Process children with slot scoping
        deferred_slot_close = process_component_children_with_slots(
            &comp.attributes,
            &comp.fragment,
            comp.end,
            &inst_var,
            has_lets,
            true,
            source,
            options,
            str,
            counter,
            depth + 1,
        );
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
    // Body of the `let:` scope block, without the `}` that closes it — upstream
    // closes it from the closing-tag transform, i.e. after that tag's gaps.
    let inline_block = if needs_inline_block {
        format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
            build_let_destructure_string(&comp.attributes, source),
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
        let spaces = " ".repeat(closing_tag_spacing(
            closing_tag_start,
            comp.end,
            component_closing_name_range(&comp.name, closing_tag_start, comp.end),
        ));
        let slot_close = if needs_inline_block || deferred_slot_close {
            "}"
        } else {
            ""
        };
        if named_slot_close {
            // Close just this component's block; the named-slot caller emits
            // the component-name reference + the named-slot-block close after.
            str.overwrite_fmt(
                closing_tag_start,
                comp.end,
                format_args!("{}{}}}", spaces, slot_close),
            );
        } else {
            str.overwrite_fmt(
                closing_tag_start,
                comp.end,
                format_args!("{}{}{}}}", spaces, slot_close, comp.name),
            );
        }
    } else if needs_inline_block {
        // A self-closing tag has no `</Component>` for upstream to map, so the
        // name is never referenced here — only the `let:` scope and block close.
        str.append_left_fmt(comp.end, format_args!("{}}}}}", inline_block));
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
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    if comp.start >= comp.end {
        return;
    }

    // This component's children own their own slot scope: clear any inherited
    // slot context (restored at the end for following siblings).
    let saved_outer_slot = counter.slot_inst.take();

    // Nested named-slot routing: a static `slot="x"` svelte:component reached
    // through a parent component's default-slot body (e.g. inside `{#if}` /
    // `{#each}`) is wrapped in the parent's `$$slot_def["x"]` block — same as
    // the direct-child path (`handle_named_slot_svelte_component`), mirroring
    // `handle_component`'s equivalent check. `named_slot_component_close`
    // guards against re-entering when we are already the routed inner call.
    if !counter.named_slot_component_close
        && let Some(ref inst) = saved_outer_slot
        && slot_attr_static_name(&comp.attributes).is_some()
    {
        let inst = inst.clone();
        handle_named_slot_svelte_component(comp, &inst, source, options, str, counter, depth);
        counter.slot_inst = saved_outer_slot;
        return;
    }

    // When processed as a named-slot child, suppress the `slot=` prop and the
    // component's own default-slot `let:` block (the caller already consumed
    // both into the `$$slot_def[...]` destructure ahead of this opener).
    let named_slot_close = std::mem::take(&mut counter.named_slot_component_close);
    let suppress_lets = std::mem::take(&mut counter.suppress_component_lets);

    let expr_text = get_expression_text(&comp.expression, source);
    let opening_tag_end = find_opening_tag_end(
        source,
        comp.start,
        comp.end,
        comp.name.as_str(),
        &comp.attributes,
    );

    // Collect on: directives
    let on_directives = get_on_directives(&comp.attributes);
    let has_events = !on_directives.is_empty();

    // Build attribute/props string (excluding on: directives)
    let mut attrs_str = build_component_props_string(
        &comp.attributes,
        source,
        &counter.element_opener_comments,
        named_slot_close,
    );

    // Add extra whitespace to match JS svelte2tsx position-preserving behavior
    let scomp_spacing = opener_spacing(
        source,
        comp.start,
        &comp.name,
        opening_tag_end,
        get_expression_range(&comp.expression),
        &comp.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: false,
            in_component_slot: named_slot_close,
            tag_name: &comp.name,
            is_slot_tag: false,
        },
    );
    if scomp_spacing.in_attr_object > 0 {
        let mut padded = " ".repeat(scomp_spacing.in_attr_object);
        padded.push_str(&attrs_str);
        attrs_str = padded;
    }

    // Check if component has meaningful children for Svelte 5 children prop
    let has_children = has_component_slot_children(&comp.fragment, source);
    let is_svelte5 = matches!(options.version, SvelteVersion::V5);
    let has_lets_scomp = !suppress_lets && has_let_directives(&comp.attributes);
    // Emit the synthetic `children` prop whenever there is default-slot content,
    // even alongside `let:` directives — matching handle_component (which has no
    // such guard). The `let:` destructure is emitted independently below.
    if is_svelte5 && has_children {
        let children_text = "children:() => { return __sveltets_2_any(0); },";
        let trimmed = attrs_str.trim_start();
        let leading_ws = &attrs_str[..attrs_str.len() - trimmed.len()];
        attrs_str = format!("{}{}{}", leading_ws, children_text, trimmed);
    }

    let inst_var = reversed_component_name("svelte_component", depth);
    // A `bind:` directive on the component needs the instance variable too: it
    // emits a `inst.$$bindings = 'name'` marker (and a type-widener) after the
    // `new` statement, mirroring `handle_component`.
    let has_binds = comp
        .attributes
        .iter()
        .any(|a| matches!(a, Attribute::BindDirective(_)));
    let component_bind_suffix = build_component_bind_suffix(&comp.attributes, source, &inst_var);
    // Need an instance variable when there are `on:` events, `let:` directives,
    // `bind:` directives, or children that reference the instance's slot defs
    // (named-slot children anywhere in blocks, or default-slot `let:` receivers).
    let children_have_named_slots = has_named_slot_children(&comp.fragment);
    let children_have_default_slot_lets = has_default_slot_let_children(&comp.fragment);
    // Direct `{#snippet}` children become implicit props unconditionally
    // (mirroring `handle_component` — official never gates this on `let:` /
    // named-slot presence, #2171), applying alongside whichever children-path
    // (slot-scoped or simple) the rest of the children take.
    let use_snippet_props = comp
        .fragment
        .nodes
        .iter()
        .any(|n| matches!(n, TemplateNode::SnippetBlock(s) if s.start < s.end));
    let needs_inst = has_events
        || has_lets_scomp
        || has_binds
        || use_snippet_props
        || children_have_named_slots
        || children_have_default_slot_lets;
    // A named-slot child's `$$slot_def[…]` prologue is emitted by the caller
    // ahead of this block, and takes the leading gaps with it (mirrors
    // `handle_component`'s `block_indent`).
    let block_indent = if named_slot_close {
        String::new()
    } else {
        " ".repeat(scomp_spacing.before_block)
    };
    let (mut opener, trailer_lit) = if needs_inst {
        let on_calls = if has_events {
            build_on_calls(&inst_var, &on_directives, source)
        } else {
            String::new()
        };
        (
            format!(
                "{}{{ const {}C = __sveltets_2_ensureComponent({}); const {} = new {}C({{ target: __sveltets_2_any(), props: {{{}",
                block_indent, inst_var, expr_text, inst_var, inst_var, attrs_str
            ),
            format!("}}}});{}{}", component_bind_suffix, on_calls),
        )
    } else {
        (
            format!(
                "{}{{ const {}C = __sveltets_2_ensureComponent({}); new {}C({{ target: __sveltets_2_any(), props: {{{}",
                block_indent, inst_var, expr_text, inst_var, attrs_str
            ),
            "}});".to_string(),
        )
    };
    // The snippet-props path keeps the props object open so the demoted
    // `{#snippet}` children can be moved inside it.
    if !use_snippet_props {
        opener.push_str(&trailer_lit);
    }

    // Slot let-forwarding: `{const { $$_$$, prop, } = inst.$$slot_def.default; $$_$$;`
    // Mirrors `defaultSlotLetTransformation` in the JS reference's
    // `htmlxtojsx_v2/nodes/InlineComponent.ts`. When the snippet-props path also
    // applies, this text is appended after the relocated props close instead (see
    // below) so it lands after — not inside — the still-open props object.
    let own_default_let_open = if has_lets_scomp {
        format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
            build_let_destructure_string(&comp.attributes, source),
            inst_var
        )
    } else {
        String::new()
    };
    if !use_snippet_props {
        opener.push_str(&own_default_let_open);
    }

    str.overwrite(comp.start, opening_tag_end, &opener);

    // Children of svelte:component are at depth+1 (this component is now an
    // ancestor). Slot-bearing children take the same lowering as a named
    // component's (`$$slot_def.default` / `$$slot_def["x"]` blocks); the
    // component's OWN `let:` block is already in `opener` above, so the helper
    // is told not to emit it again.
    let deferred_slot_close = if use_snippet_props {
        // A direct `{#snippet}` child is always demoted to a prop, regardless of
        // `let:` / named-slot children (#2171); any remaining children still need
        // slot-scoping, handled below instead of inline when that applies.
        let needs_slot_pass = children_have_named_slots || children_have_default_slot_lets;
        let prev_slot = if needs_slot_pass {
            None
        } else {
            Some(counter.slot_inst.replace(inst_var.clone()))
        };
        let mut anchor = opening_tag_end;
        let mut last_snippet_end: Option<u32> = None;
        let mut snippet_names: Vec<String> = Vec::new();
        for node in &comp.fragment.nodes {
            if let TemplateNode::SnippetBlock(s) = node {
                if s.start >= s.end {
                    continue;
                }
                snippet_names.push(get_expression_text(&s.expression, source).to_string());
                handle_snippet_block_as_component_prop(s, source, options, str, counter, depth + 1);
                // A self-move is rejected by MagicString, so a snippet already at
                // the anchor only advances it.
                if s.start == anchor {
                    anchor = s.end;
                } else {
                    str.move_range(s.start, s.end, anchor);
                }
                last_snippet_end = Some(s.end);
            } else if !needs_slot_pass {
                process_node_inplace(node, source, options, str, counter, depth + 1);
            }
        }
        if let Some(prev) = prev_slot {
            counter.slot_inst = prev;
        }
        let prop_def_suffix = if snippet_names.is_empty() {
            String::new()
        } else {
            format!(
                "/*\u{03A9}ignore_start\u{03A9}*/const {{{}}} = {}.$$prop_def;/*\u{03A9}ignore_end\u{03A9}*/",
                snippet_names.join(", "),
                inst_var
            )
        };
        let closing = format!("{trailer_lit}{prop_def_suffix}{own_default_let_open}");
        match last_snippet_end {
            Some(end) => {
                str.append_left(end, &closing);
            }
            None => {
                str.prepend_right(opening_tag_end, &closing);
            }
        }
        if needs_slot_pass {
            process_component_children_with_slots(
                &comp.attributes,
                &comp.fragment,
                comp.end,
                &inst_var,
                false,
                true,
                source,
                options,
                str,
                counter,
                depth + 1,
            )
        } else {
            false
        }
    } else if children_have_named_slots || children_have_default_slot_lets {
        process_component_children_with_slots(
            &comp.attributes,
            &comp.fragment,
            comp.end,
            &inst_var,
            false,
            true,
            source,
            options,
            str,
            counter,
            depth + 1,
        )
    } else {
        // Mark the slot context so `slot="x"` children nested in control-flow
        // blocks still lower to `inst.$$slot_def["x"]`.
        let prev_slot = counter.slot_inst.replace(inst_var.clone());
        process_fragment_inplace(&comp.fragment, source, options, str, counter, depth + 1);
        counter.slot_inst = prev_slot;
        false
    };

    let closing_tag_start = find_closing_tag_start(source, comp.end);
    let closing_text = if has_lets_scomp || deferred_slot_close {
        "}}"
    } else {
        "}"
    };
    if closing_tag_start < comp.end {
        // `svelte:component` keeps no name mapping on its closing tag, so its
        // collapsed gaps are all that precede the closers.
        let spaces = " ".repeat(closing_tag_spacing(closing_tag_start, comp.end, None));
        str.overwrite_fmt(
            closing_tag_start,
            comp.end,
            format_args!("{}{}", spaces, closing_text),
        );
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
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    // This node's children own their own slot scope: clear any inherited slot
    // context (restored at the end for following siblings).
    let saved_outer_slot = counter.slot_inst.take();

    // Nested named-slot routing: a static `slot="x"` svelte:self reached
    // through a parent component's default-slot body (e.g. inside `{#if}` /
    // `{#each}`) is wrapped in the parent's `$$slot_def["x"]` block — same as
    // the direct-child path (`handle_named_slot_svelte_self`), mirroring
    // `handle_component`'s equivalent check.
    if !counter.named_slot_component_close
        && let Some(ref inst) = saved_outer_slot
        && slot_attr_static_name(&el.attributes).is_some()
    {
        let inst = inst.clone();
        handle_named_slot_svelte_self(el, &inst, source, options, str, counter, depth);
        counter.slot_inst = saved_outer_slot;
        return;
    }

    // When processed as a named-slot child, suppress the `slot=` prop and the
    // node's own default-slot `let:` block (the caller already consumed both
    // into the `$$slot_def[...]` destructure ahead of this opener).
    let named_slot_close = std::mem::take(&mut counter.named_slot_component_close);
    let suppress_lets = std::mem::take(&mut counter.suppress_component_lets);

    let opening_tag_end =
        find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes);
    let closing_tag_start = find_closing_tag_start(source, el.end);
    let has_closing_tag = closing_tag_start < el.end;

    // Separate on: + let: directives from regular attributes
    let mut has_on_directives = false;
    let mut on_directives = Vec::new();
    let has_lets = !suppress_lets && has_let_directives(&el.attributes);
    let mut prop_parts = Vec::new();

    for attr in &el.attributes {
        match attr {
            Attribute::OnDirective(on) => {
                has_on_directives = true;
                on_directives.push(on);
            }
            Attribute::LetDirective(_) => {
                // Handled below — not emitted as a prop.
            }
            _ => match attr {
                Attribute::Attribute(node) => {
                    // `slot="foo"` stays a normal prop EXCEPT when this node
                    // is being named-slot-routed by its parent component,
                    // where the attribute is consumed by the
                    // `$$slot_def[...]` wrapper instead.
                    if node.name == "slot" && named_slot_close {
                        continue;
                    }
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
                    // `<svelte:self>` is an inline component upstream, so a
                    // binding is a plain prop (`value:x,`), never the element
                    // form (`"bind:value":x,`).
                    if let Some(s) = format_component_bind_directive(bind, source) {
                        prop_parts.push(s);
                    }
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

    // `svelte:self` emits its opener as a pure string, so it contributes no
    // source range before the attribute list.
    let self_spacing = opener_spacing(
        source,
        el.start,
        &el.name,
        opening_tag_end,
        None,
        &el.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: false,
            in_component_slot: named_slot_close,
            tag_name: &el.name,
            is_slot_tag: false,
        },
    );
    let props_inner = if prop_parts.is_empty() {
        " ".repeat(self_spacing.in_attr_object)
    } else {
        // `svelte:self` emits its opener as a pure string, so it contributes no
        // source range before the attribute list.
        format!(
            "{}{}",
            " ".repeat(self_spacing.in_attr_object),
            prop_parts.join("")
        )
    };

    // `<svelte:self>` is an `InlineComponent` upstream, so its children are slot
    // consumers of THIS node: named-slot children (anywhere inside control-flow
    // blocks) and default-slot `let:` receivers destructure from its
    // `$$slot_def`, which forces the `const $$_svelteselfN = …` form.
    let children_have_named_slots = has_named_slot_children(&el.fragment);
    let children_have_default_slot_lets = has_default_slot_let_children(&el.fragment);
    // Direct `{#snippet}` children become implicit props unconditionally
    // (mirroring `handle_component` — official never gates this on `let:` /
    // named-slot presence, #2171), applying alongside whichever children-path
    // (slot-scoped or simple) the rest of the children take.
    let use_snippet_props = el
        .fragment
        .nodes
        .iter()
        .any(|n| matches!(n, TemplateNode::SnippetBlock(s) if s.start < s.end));
    let has_bindings = el
        .attributes
        .iter()
        .any(|a| matches!(a, Attribute::BindDirective(_)));
    let needs_inst_var = has_on_directives
        || has_lets
        || children_have_named_slots
        || children_have_default_slot_lets
        || use_snippet_props
        || has_bindings;
    // Use depth as the instance variable index, mirroring official InlineComponent.ts
    // `this._name = '$$_svelteself' + this.computeDepth()`.
    let var_name = if needs_inst_var {
        Some(format!("$$_svelteself{}", depth))
    } else {
        None
    };

    // A named-slot child's `$$slot_def[…]` prologue is emitted by the caller
    // ahead of this block, and takes the leading gaps with it (mirrors
    // `handle_svelte_component`'s `block_indent`).
    let block_indent = if named_slot_close {
        String::new()
    } else {
        " ".repeat(self_spacing.before_block)
    };
    let create_call = if let Some(ref name) = var_name {
        format!(
            "{}{{ const {} = __sveltets_2_createComponentAny({{{}",
            block_indent, name, props_inner
        )
    } else {
        format!(
            "{}{{ __sveltets_2_createComponentAny({{{}",
            block_indent, props_inner
        )
    };

    // Closes the props object, then the `bind:` statements and the `$on()`
    // registrations — the same order official's transformation array emits.
    let trailer_lit = match var_name {
        Some(ref name) => format!(
            "}});{}{}",
            build_component_bind_suffix(&el.attributes, source, name),
            build_on_calls(name, &on_directives, source)
        ),
        None => "});".to_string(),
    };

    let mut opener = create_call;
    // The snippet-prop path leaves the props object open so the relocated
    // `{#snippet}` props can be appended inside it.
    if !use_snippet_props {
        opener.push_str(&trailer_lit);
    }

    // `let:` directives become a `{const { $$_$$, name, ... } = inst.$$slot_def.default; $$_$$;`
    // block right after the create call, with a matching `}` at the end.
    // Mirrors the JS reference's `defaultSlotLetTransformation` in
    // `htmlxtojsx_v2/nodes/InlineComponent.ts`. When the snippet-props path also
    // applies, this text is appended after the relocated props close instead (see
    // below) so it lands after — not inside — the still-open props object.
    let own_default_let_open = if has_lets {
        let destructure = build_let_destructure_string(&el.attributes, source);
        let inst_name = var_name
            .as_ref()
            .expect("let: directive requires an instance variable name");
        format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
            destructure, inst_name
        )
    } else {
        String::new()
    };
    if !use_snippet_props {
        opener.push_str(&own_default_let_open);
    }

    if !has_closing_tag {
        // Self-closing `<svelte:self ... />` — no body to process; the
        // opener's `{` needs a closing `}` immediately, plus another `}` if
        // there's a let-forward block to close.
        let trailing = if has_lets { "}}" } else { "}" };
        let combined = format!("{}{}", opener, trailing);
        str.overwrite(el.start, el.end, &combined);
        counter.slot_inst = saved_outer_slot;
        return;
    }

    str.overwrite(el.start, opening_tag_end, &opener);
    // svelte:self is a component → children at depth+1. Slot-bearing children
    // take the same lowering as a named component's (`$$slot_def.default` /
    // `$$slot_def["x"]` blocks); this node's OWN `let:` block is already in
    // `opener` above, so the helper is told not to emit it again.
    let deferred_slot_close = if use_snippet_props {
        // A direct `{#snippet}` child is always demoted to a prop, regardless of
        // `let:` / named-slot children (#2171); any remaining children still need
        // slot-scoping, handled below instead of inline when that applies.
        let inst_var = var_name
            .as_deref()
            .expect("snippet props require an instance variable name");
        let needs_slot_pass = children_have_named_slots || children_have_default_slot_lets;
        if needs_slot_pass {
            counter.slot_inst = None;
        } else {
            counter.slot_inst = var_name.clone();
        }
        // A snippet already sitting at the anchor is in place — moving it would
        // be a forbidden self-move — so the anchor just advances past it.
        let mut anchor = opening_tag_end;
        let mut last_snippet_end: Option<u32> = None;
        let mut snippet_names: Vec<String> = Vec::new();
        for node in &el.fragment.nodes {
            if let TemplateNode::SnippetBlock(s) = node {
                if s.start >= s.end {
                    continue;
                }
                snippet_names.push(get_expression_text(&s.expression, source).to_string());
                handle_snippet_block_as_component_prop(s, source, options, str, counter, depth + 1);
                if s.start == anchor {
                    anchor = s.end;
                } else {
                    str.move_range(s.start, s.end, anchor);
                }
                last_snippet_end = Some(s.end);
            } else if !needs_slot_pass {
                process_node_inplace(node, source, options, str, counter, depth + 1);
            }
        }
        counter.slot_inst = None;
        // Destructuring from `$$prop_def` anchors each snippet's contextual
        // `Snippet<[Args]>` parameter types.
        let prop_def_suffix = if snippet_names.is_empty() {
            String::new()
        } else {
            format!(
                "/*\u{03A9}ignore_start\u{03A9}*/const {{{}}} = {}.$$prop_def;/*\u{03A9}ignore_end\u{03A9}*/",
                snippet_names.join(", "),
                inst_var
            )
        };
        let closing = format!("{trailer_lit}{prop_def_suffix}{own_default_let_open}");
        match last_snippet_end {
            Some(end) => {
                str.append_left(end, &closing);
            }
            None => {
                str.prepend_right(opening_tag_end, &closing);
            }
        }
        if needs_slot_pass {
            process_component_children_with_slots(
                &el.attributes,
                &el.fragment,
                el.end,
                inst_var,
                false,
                true,
                source,
                options,
                str,
                counter,
                depth + 1,
            )
        } else {
            false
        }
    } else if children_have_named_slots || children_have_default_slot_lets {
        let inst_var = var_name
            .as_deref()
            .expect("slot-consuming children require an instance variable name");
        process_component_children_with_slots(
            &el.attributes,
            &el.fragment,
            el.end,
            inst_var,
            false,
            true,
            source,
            options,
            str,
            counter,
            depth + 1,
        )
    } else {
        // Still publish the slot context (as `handle_svelte_component` does) so
        // a descendant that reaches for `$$slot_def` without being detected
        // above cannot fall back to the *enclosing* component's instance.
        counter.slot_inst = var_name.clone();
        process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);
        counter.slot_inst = None;
        false
    };
    let trailing = if has_lets || deferred_slot_close {
        "}}"
    } else {
        "}"
    };
    // `svelte:self` keeps no name mapping on its closing tag, so its collapsed
    // gaps are all that precede the closers.
    let spaces = " ".repeat(closing_tag_spacing(closing_tag_start, el.end, None));
    str.overwrite_fmt(
        closing_tag_start,
        el.end,
        format_args!("{}{}", spaces, trailing),
    );

    // Restore the slot context for following siblings.
    counter.slot_inst = saved_outer_slot;
}
