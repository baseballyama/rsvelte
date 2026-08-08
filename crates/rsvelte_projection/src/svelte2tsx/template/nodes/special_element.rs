//! `<svelte:window>` / `<svelte:body>` / `<svelte:head>` and the other
//! `svelte:` meta elements.

use std::fmt::Write as _;

use crate::ast::template::{SvelteElement, TemplateNode};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::Svelte2TsxOptions;

use crate::svelte2tsx::template::attributes::binding::{
    any_bind_needs_element_var, build_bind_directive_suffix, element_var_base_name,
};
use crate::svelte2tsx::template::attributes::build_attributes_string;
use crate::svelte2tsx::template::attributes::directive_suffix::build_directive_prefix_suffix;
use crate::svelte2tsx::template::ctx::Counter;
use crate::svelte2tsx::template::utils::opener_spacing::{OpenerCtx, opener_spacing};
use crate::svelte2tsx::template::utils::source::{find_closing_tag_start, find_opening_tag_end};
use crate::svelte2tsx::template::walk::process_node_inplace;

use super::text::handle_text_trimmed;

use super::component_slots::{
    build_named_slot_element_attrs, default_slot_let_block, named_slot_let_block,
};
use super::slot_element::slot_attr_static_name;
use super::snippet_block::handle_snippet_block_as_component_prop;

/// The `svelte:` tags upstream `Element.ts` names with a plain string literal in
/// `getStartTransformation` / the `_name` switch. Everything else — including
/// `svelte:boundary` and `svelte:document` — falls through to the `default`
/// branch, which keeps the tag name as a *source range*; that extra kept range
/// changes the gap arithmetic in `transform`.
const LITERAL_NAME_TAGS: [&str; 5] = [
    "svelte:options",
    "svelte:head",
    "svelte:window",
    "svelte:body",
    "svelte:fragment",
];

/// `legacy.js::remove_surrounding_whitespace_nodes`, which the Svelte-4 AST
/// conversion applies to `<svelte:boundary>` children (and `{#snippet}` bodies)
/// but to no other element: a whitespace-only first/last `Text` child is dropped
/// from the array svelte2tsx walks, and a content-bearing one has its `data`
/// trimmed while keeping its source range.
#[derive(Clone, Copy, Default)]
struct SurroundingWhitespace {
    drop_first: bool,
    trim_first: bool,
    drop_last: bool,
    trim_last: bool,
}

impl SurroundingWhitespace {
    fn of(nodes: &[TemplateNode], source: &str) -> Self {
        let classify = |node: Option<&TemplateNode>| match node {
            Some(TemplateNode::Text(text)) => {
                if text.data.chars().all(char::is_whitespace) {
                    // Dropping leaves the source range verbatim, which is only
                    // safe when the source is whitespace too: `&nbsp;` decodes
                    // to whitespace but its six raw characters are not valid TS.
                    let raw = source
                        .get(text.start as usize..text.end as usize)
                        .unwrap_or_default();
                    if raw.chars().all(char::is_whitespace) {
                        (true, false)
                    } else {
                        (false, false)
                    }
                } else {
                    (false, true)
                }
            }
            _ => (false, false),
        };
        let (drop_first, trim_first) = classify(nodes.first());
        let (drop_last, trim_last) = classify(nodes.last());
        Self {
            drop_first,
            trim_first,
            drop_last,
            trim_last,
        }
    }

    /// Start of the first child that survives, i.e. upstream
    /// `computeStartTagEnd`'s `children[0].start`.
    fn first_kept_start(&self, nodes: &[TemplateNode]) -> Option<u32> {
        let kept = if self.drop_first { &nodes[1..] } else { nodes };
        kept.first().map(node_start)
    }
}

fn node_start(node: &TemplateNode) -> u32 {
    use TemplateNode as N;
    match node {
        N::Text(n) => n.start,
        N::Comment(n) => n.start,
        N::ExpressionTag(n) => n.start,
        N::HtmlTag(n) => n.start,
        N::ConstTag(n) => n.start,
        N::DeclarationTag(n) => n.start,
        N::DebugTag(n) => n.start,
        N::RenderTag(n) => n.start,
        N::AttachTag(n) => n.start,
        N::IfBlock(n) => n.start,
        N::EachBlock(n) => n.start,
        N::AwaitBlock(n) => n.start,
        N::KeyBlock(n) => n.start,
        N::SnippetBlock(n) => n.start,
        N::RegularElement(n) => n.start,
        N::Component(n) => n.start,
        N::SvelteComponent(n) => n.start,
        N::SvelteElement(n) => n.start,
        N::TitleElement(n) => n.start,
        N::SlotElement(n) => n.start,
        N::SvelteOptions(n)
        | N::SvelteBody(n)
        | N::SvelteDocument(n)
        | N::SvelteFragment(n)
        | N::SvelteBoundary(n)
        | N::SvelteHead(n)
        | N::SvelteSelf(n)
        | N::SvelteWindow(n) => n.start,
    }
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
pub(crate) fn handle_svelte_special_element(
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

    // These are all `Element`s in official svelte2tsx: they own their own slot
    // scope (children must not inherit the component context) and forward their
    // own `let:` through the enclosing component's `$$slot_def`, keyed by a
    // static `slot=` when present.
    let saved_slot = counter.slot_inst.take();
    let named_slot: Option<(&str, &str)> = saved_slot
        .as_ref()
        .zip(slot_attr_static_name(&el.attributes))
        .map(|(inst, name)| (inst.as_str(), name));
    let named_slot_block = named_slot
        .as_ref()
        .map(|(inst, target_slot)| named_slot_let_block(&el.attributes, inst, target_slot, source));
    let default_slot_let = default_slot_let_block(&el.attributes, saved_slot.as_ref(), source);

    let is_boundary = el.name == "svelte:boundary";
    let whitespace = if is_boundary {
        SurroundingWhitespace::of(&el.fragment.nodes, source)
    } else {
        SurroundingWhitespace::default()
    };
    // `computeStartTagEnd` ends the opener transform at the first child, so
    // source between `>` and that child is collapsed. Only `<svelte:boundary>`
    // can have a gap there — every other element keeps its leading whitespace as
    // a `Text` child that starts right after the `>`.
    let opening_tag_end = whitespace
        .first_kept_start(&el.fragment.nodes)
        .filter(|_| whitespace.drop_first)
        .unwrap_or_else(|| {
            find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes)
        });
    // In a named-slot context the `slot` attribute is consumed by the wrapper
    // block, so build the attributes without it.
    let mut attrs_str = if named_slot.is_some() {
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

    // Only the `LITERAL_NAME_TAGS` name themselves with a string in the start
    // transformation; the rest keep the tag name as a source range.
    let head = (!LITERAL_NAME_TAGS.contains(&el.name.as_str()))
        .then(|| (el.start + 1, el.start + 1 + el.name.len() as u32));
    let spacing = opener_spacing(
        source,
        el.start,
        &el.name,
        opening_tag_end,
        head,
        &el.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: true,
            in_component_slot: saved_slot.is_some(),
            tag_name: &el.name,
            is_slot_tag: false,
        },
    );
    if spacing.in_attr_object > 0 {
        let mut padded = " ".repeat(spacing.in_attr_object);
        padded.push_str(&attrs_str);
        attrs_str = padded;
    }
    // The slot-let destructure sits *after* the opening tag's leading gap, so
    // emit the gap with it and leave the createElement block unindented.
    let indent = " ".repeat(spacing.before_block);
    let indent = match named_slot_block.as_ref().or(default_slot_let.as_ref()) {
        Some(block) => {
            str.append_left_fmt(el.start, format_args!("{}{}", indent, block));
            String::new()
        }
        None => indent,
    };

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
            "{}{{ svelteHTML.createElement(\"{}\", {{{}",
            indent, el.name, attrs_str
        );
        str.overwrite(el.start, opening_tag_end, &opener);

        // Process each direct child: transform snippet blocks as implicit props
        // and move them to anchor (just after the opening tag), then process
        // non-snippet children in-place (they will appear after the `});`).
        // Mirrors the `use_snippet_props` branch in `handle_component`.
        let mut anchor = opening_tag_end;
        let mut last_snippet_end: Option<u32> = None;

        for (index, node) in el.fragment.nodes.iter().enumerate() {
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
                process_child(
                    node,
                    index,
                    &el.fragment.nodes,
                    whitespace,
                    source,
                    options,
                    str,
                    counter,
                    depth + 1,
                );
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
                "{}{{ {}svelteHTML.createElement(\"{}\", {{{}}});{}{}",
                indent, element_var_decl, el.name, attrs_str, bind_suffix, directive_suffix
            )
        } else {
            format!(
                "{}{{{}{{ {}svelteHTML.createElement(\"{}\"{}, {{{}}});{}{}",
                indent,
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
        for (index, node) in el.fragment.nodes.iter().enumerate() {
            process_child(
                node,
                index,
                &el.fragment.nodes,
                whitespace,
                source,
                options,
                str,
                counter,
                depth + 1,
            );
        }

        let extra_close = if directive_prefix.is_empty() { "" } else { "}" };
        let closing_tag_start = find_closing_tag_start(source, el.end);
        if closing_tag_start < el.end {
            str.overwrite_fmt(
                closing_tag_start,
                el.end,
                format_args!(" }}{}", extra_close),
            );
        } else {
            str.append_left_fmt(el.end, format_args!("}}{}", extra_close));
        }
    }

    if named_slot.is_some() || default_slot_let.is_some() {
        str.append_left(el.end, "}");
    }
    counter.slot_inst = saved_slot;
}

/// Walk a fragment whose surrounding whitespace `legacy.js` removes.
pub(super) fn process_fragment_trimmed(
    nodes: &[TemplateNode],
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    let whitespace = SurroundingWhitespace::of(nodes, source);
    for (index, node) in nodes.iter().enumerate() {
        process_child(
            node, index, nodes, whitespace, source, options, str, counter, depth,
        );
    }
}

/// Dispatch one child, applying the `<svelte:boundary>` whitespace surgery: a
/// dropped node is never visited (so its source survives verbatim) and a
/// trimmed one is blanked from its shortened `data`.
#[allow(clippy::too_many_arguments)]
fn process_child(
    node: &TemplateNode,
    index: usize,
    nodes: &[TemplateNode],
    whitespace: SurroundingWhitespace,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    if let TemplateNode::Text(text) = node {
        let is_first = index == 0;
        let is_last = index + 1 == nodes.len();
        if (is_first && whitespace.drop_first) || (is_last && whitespace.drop_last) {
            return;
        }
        let trim_start = is_first && whitespace.trim_first;
        let trim_end = is_last && whitespace.trim_last;
        if trim_start || trim_end {
            handle_text_trimmed(text, str, trim_start, trim_end);
            return;
        }
    }
    process_node_inplace(node, source, options, str, counter, depth);
}
