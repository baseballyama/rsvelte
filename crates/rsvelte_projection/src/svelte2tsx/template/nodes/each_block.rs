//! `{#each}` blocks. Mirrors `htmlxtojsx_v2/nodes/EachBlock.ts`.

use std::fmt::Write as _;

use crate::ast::template::EachBlock;
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, slice_src};

use crate::svelte2tsx::template::ctx::{Counter, TemplateNodeExt};
use crate::svelte2tsx::template::nodes::special_element::process_fragment_trimmed;
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};

use super::snippet_block::hoist_snippet_blocks;

/// Header lead-in for the each-block when CTX is relocated. Mirrors the
/// simple-case ` for(let ` prefix; the trailing space lets the moved CTX
/// chunk slot in cleanly.
pub fn prefix_with_for(prefix: &str) -> String {
    format!("{prefix}for(let ")
}

/// Build the text emitted after EXPR (and the relocated CTX) in the
/// structured-bake each-block header. Mirrors the non-relocated
/// `header_after_expr`: `))` closes `__sveltets_2_ensureArray(EXPR)` and
/// the `for(...)` argument list; `{` opens the for body; the idx / key
/// bindings still travel as plain text — only CTX is source-preserved.
pub fn build_each_after_ctx_tail(block: &EachBlock, source: &str, comma_wrap: bool) -> String {
    let suffix = if block.context.is_some() {
        ""
    } else {
        "$$each_item;"
    };
    // `))` closes `__sveltets_2_ensureArray(EXPR)` + the `for(...)`
    // argument list; `{` opens the for body.
    let close = if comma_wrap { ")" } else { "" };
    let mut s = format!("{close})){{{suffix}");
    if let Some(ref index) = block.index {
        let _ = write!(s, "let {index} = 1;");
    }
    if let Some(ref key) = block.key {
        let key_text = get_expression_text(key, source);
        s.push_str(key_text);
        s.push(';');
    }
    s
}

/// Handle an each block: `{#each items as item, i (key)}...{:else}...{/each}`.
///
/// Generates: `for(let item of __sveltets_2_ensureArray(items)){let i = 1;key;...}`
/// Find the byte offset of the last whitespace-bounded `as` keyword in `s`.
pub fn rfind_as_keyword(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut found = None;
    let mut j = 0usize;
    while j + 1 < bytes.len() {
        if bytes[j] == b'a' && bytes[j + 1] == b's' {
            let before_ok = j == 0 || bytes[j - 1].is_ascii_whitespace();
            let after_ok = bytes.get(j + 2).is_none_or(u8::is_ascii_whitespace);
            if before_ok && after_ok {
                found = Some(j);
            }
        }
        j += 1;
    }
    found
}

/// Extend the each-collection expression's end past a trailing TypeScript
/// postfix (`as const`, `as T`, `satisfies T`, `!`) that `remove_typescript_nodes`
/// stripped from `block.expression`'s span. The collection is everything in the
/// source before the each binding's ` as ` keyword (the one immediately preceding
/// `block.context`); the parser's narrowed `expr_end` drops a trailing postfix,
/// which official svelte2tsx keeps (e.g. `{#each link.sections! as s}` →
/// `__sveltets_2_ensureArray(link.sections!)`). Only applies when there is a
/// context binding (`as X`); index/key-only forms keep the narrowed end.
pub fn each_collection_extended_end(block: &EachBlock, source: &str, expr_end: u32) -> u32 {
    let Some(ctx) = block.context.as_ref() else {
        return expr_end;
    };
    let Some((ctx_start, _)) = get_expression_range(ctx) else {
        return expr_end;
    };
    if ctx_start <= expr_end || ctx_start as usize > source.len() {
        return expr_end;
    }
    let region = slice_src(source, expr_end as usize, ctx_start as usize);
    // The each separator is the LAST whitespace-bounded `as` before the context;
    // everything before it (after expr_end) is the TS postfix, if any.
    let Some(as_off) = rfind_as_keyword(region) else {
        return expr_end;
    };
    let postfix = region[..as_off].trim_end();
    // Only extend for a genuine TS postfix (`as …`, `satisfies …`, `!`). A bare
    // `)` here is the closing paren of a `(expr)` whose wrapping parens the
    // parser stripped symmetrically (`{#each (c) as x}`) — that must stay
    // dropped, like the expression-tag handler. (Mirrors `handle_expression_tag`.)
    let pf = postfix.trim_start();
    let is_ts_postfix =
        pf.starts_with("as ") || pf.starts_with("satisfies ") || pf.starts_with('!');
    if !is_ts_postfix {
        return expr_end;
    }
    expr_end + u32::try_from(postfix.len()).expect("postfix length fits in u32")
}

pub fn handle_each_block(
    block: &EachBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    if block.start >= block.end {
        return;
    }

    // Expression range, extended to include a trailing TS postfix the parser
    // narrowed away (`x!`, `x as const`).
    let expr_range = get_expression_range(&block.expression)
        .map(|(s, e)| (s, each_collection_extended_end(block, source, e)));
    let expr_text = match expr_range {
        Some((s, e)) => source.get(s as usize..e as usize).unwrap_or(""),
        None => "",
    };
    let has_context = block.context.is_some();
    let context_text = block.context.as_ref().map_or_else(
        || "$$each_item".to_string(),
        |c| get_expression_text(c, source).to_string(),
    );

    let body_start = if block.body.nodes.is_empty() {
        block.end
    } else {
        block.body.nodes[0].start()
    };

    // Build the for loop header.
    // The `{#` prefix of `{#each` is replaced with spaces to preserve
    // source positions (matching JS svelte2tsx behavior).
    //
    // When the loop variable shadows the collection variable (e.g., `{#each items as items}`),
    // a temporary variable is used to avoid the shadowing issue:
    //   `{ const $$_each = __sveltets_2_ensureArray(items); for(let items of $$_each){`
    // Match the JS reference's prefix-spacing for `{#each ... }` headers.
    // The JS port uses MagicString.transform() with per-position chunk moves
    // and appendLefts; the surviving leading whitespace ends up being:
    //   - 1 space when there's no context binding (no `as item`)
    //   - 2 spaces when there's a context binding (`as item`)
    //   - 3 spaces when there's a context + index binding (`as item, i`)
    //   - 4 spaces when there's a context + index + key binding
    //     (`as item, i (key)`)
    // Replicate that spacing here so the column-position assertions in the
    // language-tools fixtures match.
    let needs_temp_var = context_text == expr_text;
    let prefix_spaces = 1
        + usize::from(has_context)
        + usize::from(block.index.is_some())
        + usize::from(block.key.is_some());
    let prefix = " ".repeat(prefix_spaces);

    // Build the wrapper around the expression chunk so MagicString can
    // preserve the expression's per-character mapping back to the
    // original source. Context/index/key bindings come AFTER the
    // expression in source but appear earlier (or later) in the for-loop
    // header — bake them as ordinary text. Their column mapping is lost
    // but they're rarely the target of type errors.
    // `{#each true, [1, 2] as x}` is legal Svelte but `for (const x of true, [1, 2])`
    // is not, so upstream parenthesises any expression whose source carries a comma.
    let comma_wrap = expr_text.contains(',');
    let (header_before_expr, header_after_expr) = build_each_loop_header(
        block,
        source,
        &prefix,
        &context_text,
        has_context,
        needs_temp_var,
        comma_wrap,
    );

    if let Some((expr_start, expr_end)) = expr_range {
        // Try to also preserve the context binding's source range so a
        // diagnostic on a destructuring pattern like `{ name, age }` keeps
        // its exact column. The relocation pattern mirrors the
        // await-with-pending case (`MagicString::move_range` + surrounding
        // overwrites).
        //
        // Bails to the simpler EXPR-only preservation when:
        //   - the context isn't an identifier or pattern with a stable
        //     source range,
        //   - the expression and context source ranges overlap (parser
        //     edge case),
        //   - the variable name collides with the expression text
        //     (`{#each items as items}`) — the `needs_temp_var` branch
        //     above rebakes the wrapper around the expression and would
        //     repeat the context text twice.
        let context_range = block.context.as_ref().and_then(get_expression_range);
        if let (Some((ctx_s, ctx_e)), false) = (context_range, needs_temp_var)
            && ctx_s > expr_end
            && ctx_e <= body_start
        {
            // Generated header rewritten to flow as:
            //   "  for(let " + CTX + " of __sveltets_2_ensureArray(" + EXPR + "){...rest..."
            //
            // We move CTX in the chunk list to before EXPR, then overwrite
            // each surrounding gap. Idx / key bindings stay baked into
            // the "after-expr" tail as plain text — preserving their
            // columns would require additional relocations and offers
            // little user value for trivial identifiers.
            str.move_range(ctx_s, ctx_e, expr_start);
            str.overwrite(block.start, expr_start, &prefix_with_for(&prefix));
            str.prepend_right(
                expr_start,
                if comma_wrap {
                    " of __sveltets_2_ensureArray(("
                } else {
                    " of __sveltets_2_ensureArray("
                },
            );
            // " as " (or whitespace) between EXPR and CTX → "){...tail".
            // Then the trailing characters between CTX and body get
            // emitted/cleared.
            let tail = build_each_after_ctx_tail(block, source, comma_wrap);
            if expr_end < ctx_s {
                str.overwrite(expr_end, ctx_s, &tail);
            } else {
                str.append_left(ctx_s, &tail);
            }
            if ctx_e < body_start {
                str.overwrite(ctx_e, body_start, "");
            }
        } else {
            str.overwrite(block.start, expr_start, &header_before_expr);
            if expr_end < body_start {
                str.overwrite(expr_end, body_start, &header_after_expr);
            } else {
                // expr_end >= body_start (no space between expr and body opener).
                // Append the suffix immediately after the expression chunk so
                // MagicString anchors it at the right boundary.
                str.append_left(expr_end, &header_after_expr);
            }
        }
    } else {
        // Parser produced no span for the expression — fall back to the
        // monolithic bake (original behaviour).
        let header = format!("{header_before_expr}{expr_text}{header_after_expr}");
        str.overwrite(block.start, body_start, &header);
    }

    // Hoist inner snippets to the top of the each body before processing, so
    // their generated `const foo = ...` declarations precede the `{const}` /
    // `{let}` declaration tags and elements that reference them.
    hoist_snippet_blocks(&block.body, source, str);

    // Process body children (each blocks don't increment depth)
    process_fragment_trimmed(&block.body.nodes, source, options, str, counter, depth);

    // Handle fallback ({:else}...{/each})
    let body_end = if block.body.nodes.is_empty() {
        body_start
    } else {
        block.body.nodes.last().unwrap().end()
    };

    if let Some(ref fallback) = block.fallback {
        let fallback_start = if fallback.nodes.is_empty() {
            block.end
        } else {
            fallback.nodes[0].start()
        };

        // Overwrite {:else} with `}`
        str.overwrite(body_end, fallback_start, "}");

        // Process fallback
        hoist_snippet_blocks(fallback, source, str);
        process_fragment_trimmed(&fallback.nodes, source, options, str, counter, depth);

        let fallback_end = if fallback.nodes.is_empty() {
            fallback_start
        } else {
            fallback.nodes.last().unwrap().end()
        };

        if fallback_end < block.end {
            str.overwrite(fallback_end, block.end, "");
        }
    } else {
        // Close the for loop
        let closing = if needs_temp_var { "}}" } else { "}" };
        if body_end < block.end {
            str.overwrite(body_end, block.end, closing);
        } else {
            // Empty each body (`{#each x as i}{/each}`): body_end == block.end,
            // so there is no source region left to overwrite with the closing
            // brace (the opening-tag remainder + `{/each}` were already cleared
            // by the header handling). Append it so the `for(...){` opened by
            // the header is balanced — otherwise the unclosed brace cascades up
            // and leaves `$$render` itself unterminated.
            str.append_left(block.end, closing);
        }
    }
}

fn build_each_loop_header(
    block: &EachBlock,
    source: &str,
    prefix: &str,
    context_text: &str,
    has_context: bool,
    needs_temp_var: bool,
    comma_wrap: bool,
) -> (String, String) {
    let (open, close) = if comma_wrap { ("(", ")") } else { ("", "") };
    let (before, mut after) = if needs_temp_var {
        (
            format!("{prefix}{{ const $$_each = __sveltets_2_ensureArray({open}"),
            format!("{close}); for(let {context_text} of $$_each){{"),
        )
    } else {
        let suffix = if has_context { "" } else { "$$each_item;" };
        (
            format!("{prefix}for(let {context_text} of __sveltets_2_ensureArray({open}"),
            format!("{close})){{{suffix}"),
        )
    };
    if let Some(index) = &block.index {
        let _ = write!(after, "let {index} = 1;");
    }
    if let Some(key) = &block.key {
        after.push_str(get_expression_text(key, source));
        after.push(';');
    }
    (before, after)
}
