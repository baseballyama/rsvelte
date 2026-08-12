//! `{#snippet}` blocks. Mirrors `htmlxtojsx_v2/nodes/SnippetBlock.ts`.

use crate::ast::template::{Fragment, SnippetBlock, TemplateNode};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::Svelte2TsxOptions;

use crate::svelte2tsx::template::ctx::{Counter, TemplateNodeExt};
use crate::svelte2tsx::template::nodes::special_element::process_fragment_trimmed;
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};

/// Hoist `{#snippet}` blocks to the top of their containing block/element.
///
/// Mirrors `hoistSnippetBlock` in the JS reference
/// (`htmlxtojsx_v2/nodes/SnippetBlock.ts`): each non-leading snippet child is
/// moved to `targetPosition`, the position of the first non-snippet,
/// non-empty-text child. This lets later content reference a snippet defined
/// further down in source (the generated `const foo = ...` declaration is
/// emitted before the `{const}` / `{let}` declaration tags and elements that
/// follow it).
///
/// Snippets that are already first (`targetPosition` still `None`) or already
/// at the target position are left untouched, matching the JS reference's
/// early-`continue` guards. Component / boundary containers are excluded by
/// their callers (they treat snippets as implicit props instead), so this is
/// only invoked for block and plain-element fragments.
pub fn hoist_snippet_blocks(fragment: &Fragment, source: &str, str: &mut MagicString<'_>) {
    let mut target_position: Option<u32> = None;
    for node in &fragment.nodes {
        if !matches!(node, TemplateNode::SnippetBlock(_)) {
            if target_position.is_none() {
                let is_empty_text = match node {
                    TemplateNode::Text(t) => source
                        .get(t.start as usize..t.end as usize)
                        .is_none_or(|s| s.trim().is_empty()),
                    _ => false,
                };
                if !is_empty_text {
                    // JS reference: `node.type === 'Text' ? node.end : node.start`
                    target_position = Some(match node {
                        TemplateNode::Text(t) => t.end,
                        _ => node.start(),
                    });
                }
            }
            continue;
        }

        // It's a snippet block.
        let Some(tp) = target_position else {
            // Already the first meaningful child — nothing to move.
            continue;
        };
        let s = node.start();
        if s == tp {
            continue;
        }
        str.move_range(s, node.end(), tp);
    }
}

/// Handle a snippet block: `{#snippet name(params)}...{/snippet}`.
///
/// Generates:
/// ```text
/// const name = (params): ReturnType<import('svelte').Snippet> => { async () => {
///   ...
/// };return __sveltets_2_any(0)};
/// ```
pub fn handle_snippet_block(
    block: &SnippetBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    handle_snippet_block_inner(block, source, options, str, counter, false, depth);
}

/// Transform a `{#snippet name(params)}` block that is a direct child of a
/// component into an **implicit prop**: `name:(params) => { async () => { …body…
/// };return __sveltets_2_any(0)},`. Unlike the standalone form there is no
/// leading `const`, no `: ReturnType<…>` annotation, and the closing ends in a
/// `,` so the result drops straight into the component's `props: { … }` object
/// literal (the caller relocates the range there via `move_range`). This mirrors
/// upstream svelte2tsx `addImplicitSnippetProp`, and lets TypeScript
/// contextually type the snippet's parameters from the prop's `Snippet<[T]>`
/// type while satisfying required snippet props (#780).
pub fn handle_snippet_block_as_component_prop(
    block: &SnippetBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    handle_snippet_block_inner(block, source, options, str, counter, true, depth);
}

/// Upstream reaches the standalone form through `transform()`, which turns the
/// gap in front of the moved name into one space and then collapses whatever is
/// left before `}` into a second one — so a snippet whose header ends flush
/// against `}` gets a single space and every other shape gets two.
fn opener_pad(block: &SnippetBlock, source: &str) -> &'static str {
    let anchor = block
        .parameters
        .last()
        .or(Some(&block.expression))
        .and_then(get_expression_range)
        .map(|(_, end)| end as usize);
    let Some(mut kept_end) = anchor else {
        return " ";
    };
    let Some(rel) = source.get(kept_end..).and_then(|rest| rest.find('}')) else {
        return " ";
    };
    let close = kept_end + rel + 1;
    if kept_end < close - 1 {
        kept_end += 1;
    }
    if close - kept_end >= 2 { "  " } else { " " }
}

pub fn handle_snippet_block_inner(
    block: &SnippetBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    as_component_prop: bool,
    // Snippet bodies always start at depth 0 (official resets `element` on
    // entry), so the inherited depth is intentionally unused.
    _depth: u32,
) {
    if block.start >= block.end {
        return;
    }

    let name_text = get_expression_text(&block.expression, source);

    // Build parameters string
    let params_text = if block.parameters.is_empty() {
        String::new()
    } else {
        block
            .parameters
            .iter()
            .map(|p| get_expression_text(p, source))
            .collect::<Vec<_>>()
            .join(", ")
    };

    let has_body_nodes = !block.body.nodes.is_empty();
    let body_start = if has_body_nodes {
        block.body.nodes[0].start()
    } else {
        block.end
    };

    // Overwrite `{#snippet name(params)}` with function declaration.
    // Position markers are added to help the language server:
    // - `/*Ωignore_positionΩ*/` after the name and after `async ()`
    // - Return type wrapped in `/*Ωignore_startΩ*/.../*Ωignore_endΩ*/`
    //
    // Two emission modes match the JS reference (`SnippetBlock.ts`):
    // - TS syntax (TS file or non-JSDoc emit): `: ReturnType<...>` after the
    //   parameter list, with `<typeParams>` if the snippet declared generics
    // - JSDoc syntax (JS file + JSDoc emit): `/** @returns {ReturnType<...>} */`
    //   before the `(params)` arrow, no generic-params syntax
    let use_ts_syntax = options.is_ts_file || !options.emit_jsdoc;
    let type_params_str = match (use_ts_syntax, block.type_params.as_ref()) {
        (true, Some(tp)) => format!("<{tp}>"),
        _ => String::new(),
    };
    // Implicit-prop form (`name:(params) => …`) vs standalone declaration
    // (`const name = (params): ReturnType<…> => …`). The implicit form omits the
    // leading `const`, the return-type annotation, and the generic `<typeParams>`
    // — mirroring upstream's `addImplicitSnippetProp` transforms — and closes
    // with a trailing `,` so it slots into the component `props` object literal.
    let header = if as_component_prop {
        format!(
            "{name_text}:({params_text}) => {{ async ()/*\u{03A9}ignore_position\u{03A9}*/ => {{"
        )
    } else if use_ts_syntax {
        format!(
            "{}const {}/*\u{03A9}ignore_position\u{03A9}*/ = {}({})/*\u{03A9}ignore_start\u{03A9}*/: ReturnType<import('svelte').Snippet>/*\u{03A9}ignore_end\u{03A9}*/ => {{ async ()/*\u{03A9}ignore_position\u{03A9}*/ => {{",
            opener_pad(block, source),
            name_text,
            type_params_str,
            params_text
        )
    } else {
        format!(
            "{}const {}/*\u{03A9}ignore_position\u{03A9}*/ = /** @returns {{ReturnType<import('svelte').Snippet>}} */ ({}) => {{ async ()/*\u{03A9}ignore_position\u{03A9}*/ => {{",
            opener_pad(block, source),
            name_text,
            params_text
        )
    };
    let closing = if as_component_prop {
        "};return __sveltets_2_any(0)},"
    } else {
        "};return __sveltets_2_any(0)};"
    };
    if has_body_nodes {
        str.overwrite(block.start, body_start, &header);
        // Process body at depth 0: official resets `element = undefined` when
        // entering a SnippetBlock, so element/component names inside a snippet
        // body always count depth from the snippet (e.g. `<Child>` directly in
        // a snippet is `$$_…C0C`), regardless of how deeply the snippet itself
        // is nested in elements / `<svelte:boundary>`. That reset also drops the
        // enclosing component's slot scope, so a `let:`/`slot=` inside the body
        // is a plain attribute rather than a `$$slot_def` consumer.
        let saved_slot = counter.slot_inst.take();
        process_fragment_trimmed(&block.body.nodes, source, options, str, counter, 0);
        counter.slot_inst = saved_slot;

        let body_end = block.body.nodes.last().unwrap().end();
        if body_end < block.end {
            // Overwrite `{/snippet}` with closing
            str.overwrite(body_end, block.end, closing);
        }
    } else {
        // Empty body: collapse the whole `{#snippet name(params)}{/snippet}`
        // into a single declaration. Without this branch the closing
        // `};return __sveltets_2_any(0)};` was never emitted because both the
        // body-start overwrite and the would-be closing overwrite landed at
        // the same offset.
        let combined = format!("{header}{closing}");
        str.overwrite(block.start, block.end, &combined);
    }
}
