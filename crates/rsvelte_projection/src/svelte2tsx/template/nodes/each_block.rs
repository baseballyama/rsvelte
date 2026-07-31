//! `{#each}` blocks. Mirrors `htmlxtojsx_v2/nodes/EachBlock.ts`.

use std::fmt::Write as _;

use crate::ast::template::EachBlock;
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, slice_src};

use crate::svelte2tsx::template::ctx::{Counter, TemplateNodeExt};
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};
use crate::svelte2tsx::template::walk::process_fragment_inplace;

use super::snippet_block::hoist_snippet_blocks;

/// Header lead-in for the each-block when CTX is relocated. Mirrors the
/// simple-case ` for(let ` prefix; the trailing space lets the moved CTX
/// chunk slot in cleanly.
pub(crate) fn prefix_with_for(prefix: &str) -> String {
    format!("{}for(let ", prefix)
}

/// Build the text emitted after EXPR (and the relocated CTX) in the
/// structured-bake each-block header. Mirrors the non-relocated
/// `header_after_expr`: `))` closes `__sveltets_2_ensureArray(EXPR)` and
/// the `for(...)` argument list; `{` opens the for body; the idx / key
/// bindings still travel as plain text — only CTX is source-preserved.
pub(crate) fn build_each_after_ctx_tail(block: &EachBlock, source: &str) -> String {
    let suffix = if block.context.is_some() {
        ""
    } else {
        "$$each_item;"
    };
    // `))` closes `__sveltets_2_ensureArray(EXPR)` + the `for(...)`
    // argument list; `{` opens the for body.
    let mut s = format!(")){{{}", suffix);
    if let Some(ref index) = block.index {
        let _ = write!(s, "let {} = 1;", index);
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
pub(crate) fn rfind_as_keyword(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut found = None;
    let mut j = 0usize;
    while j + 1 < bytes.len() {
        if bytes[j] == b'a' && bytes[j + 1] == b's' {
            let before_ok = j == 0 || bytes[j - 1].is_ascii_whitespace();
            let after_ok = bytes.get(j + 2).is_none_or(|c| c.is_ascii_whitespace());
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
pub(crate) fn each_collection_extended_end(block: &EachBlock, source: &str, expr_end: u32) -> u32 {
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
    expr_end + postfix.len() as u32
}

pub(crate) fn handle_each_block(
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
    let context_text = block
        .context
        .as_ref()
        .map(|c| get_expression_text(c, source).to_string())
        .unwrap_or_else(|| "$$each_item".to_string());

    let body_start = if !block.body.nodes.is_empty() {
        block.body.nodes[0].start()
    } else {
        block.end
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
        + (has_context as usize)
        + (block.index.is_some() as usize)
        + (block.key.is_some() as usize);
    let prefix = " ".repeat(prefix_spaces);

    // Build the wrapper around the expression chunk so MagicString can
    // preserve the expression's per-character mapping back to the
    // original source. Context/index/key bindings come AFTER the
    // expression in source but appear earlier (or later) in the for-loop
    // header — bake them as ordinary text. Their column mapping is lost
    // but they're rarely the target of type errors.
    let (header_before_expr, header_after_expr) = if needs_temp_var {
        (
            format!("{}{{ const $$_each = __sveltets_2_ensureArray(", prefix),
            {
                let mut s = format!("); for(let {} of $$_each){{", context_text);
                if let Some(ref index) = block.index {
                    let _ = write!(s, "let {} = 1;", index);
                }
                if let Some(ref key) = block.key {
                    let key_text = get_expression_text(key, source);
                    s.push_str(key_text);
                    s.push(';');
                }
                s
            },
        )
    } else {
        let suffix = if has_context { "" } else { "$$each_item;" };
        (
            format!(
                "{}for(let {} of __sveltets_2_ensureArray(",
                prefix, context_text
            ),
            {
                let mut s = format!(")){{{}", suffix);
                if let Some(ref index) = block.index {
                    let _ = write!(s, "let {} = 1;", index);
                }
                if let Some(ref key) = block.key {
                    let key_text = get_expression_text(key, source);
                    s.push_str(key_text);
                    s.push(';');
                }
                s
            },
        )
    };

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
            str.prepend_right(expr_start, " of __sveltets_2_ensureArray(");
            // " as " (or whitespace) between EXPR and CTX → "){...tail".
            // Then the trailing characters between CTX and body get
            // emitted/cleared.
            let tail = build_each_after_ctx_tail(block, source);
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
        let header = format!("{}{}{}", header_before_expr, expr_text, header_after_expr);
        str.overwrite(block.start, body_start, &header);
    }

    // Hoist inner snippets to the top of the each body before processing, so
    // their generated `const foo = ...` declarations precede the `{const}` /
    // `{let}` declaration tags and elements that reference them.
    hoist_snippet_blocks(&block.body, source, str);

    // Process body children (each blocks don't increment depth)
    process_fragment_inplace(&block.body, source, options, str, counter, depth);

    // Handle fallback ({:else}...{/each})
    let body_end = if !block.body.nodes.is_empty() {
        block.body.nodes.last().unwrap().end()
    } else {
        body_start
    };

    if let Some(ref fallback) = block.fallback {
        let fallback_start = if !fallback.nodes.is_empty() {
            fallback.nodes[0].start()
        } else {
            block.end
        };

        // Overwrite {:else} with `}`
        str.overwrite(body_end, fallback_start, "}");

        // Process fallback
        process_fragment_inplace(fallback, source, options, str, counter, depth);

        let fallback_end = if !fallback.nodes.is_empty() {
            fallback.nodes.last().unwrap().end()
        } else {
            fallback_start
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
