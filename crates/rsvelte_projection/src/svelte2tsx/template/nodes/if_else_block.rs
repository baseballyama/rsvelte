//! `{#if}` / `{:else if}` / `{:else}` blocks.
//! Mirrors `htmlxtojsx_v2/nodes/IfElseBlock.ts`.

use crate::ast::template::{IfBlock, TemplateNode};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::Svelte2TsxOptions;

use crate::svelte2tsx::template::ctx::{Counter, TemplateNodeExt};
use crate::svelte2tsx::template::nodes::special_element::process_fragment_trimmed;
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};

use super::snippet_block::hoist_snippet_blocks;

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("template source offsets are represented as u32")
}

/// Handle an if block: `{#if condition}...{:else if}...{:else}...{/if}`.
///
/// Generates: `if(show){...} else {...}`
pub fn handle_if_block(
    block: &IfBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    if block.start >= block.end {
        return;
    }

    let test_text = get_expression_text(&block.test, source);

    // Find the start of the consequent content. When the consequent is empty
    // (`{#if x}{:else …}` / `{#if x}{/if}`), the body still opens right after
    // the `}` that closes the `{#if EXPR}` (or `{:else if EXPR}`) tag — this
    // mirrors official `handleIf`, which always places the `){` body opener at
    // `indexOf('}', expressionEnd) + 1`. Using `block.end` here (the position
    // after `{/if}`) made the header overwrite swallow the entire `{:else …}`
    // / `{/if}` tail, corrupting the output.
    let consequent_start = if block.consequent.nodes.is_empty() {
        let test_end = get_expression_range(&block.test).map_or(block.start, |(_, e)| e);
        let bytes = source.as_bytes();
        let mut p = test_end as usize;
        while p < bytes.len() && bytes[p] != b'}' {
            p += 1;
        }
        source_offset((p + 1).min(bytes.len()))
    } else {
        block.consequent.nodes[0].start()
    };

    // Mirror `htmlxtojsx_v2/nodes/IfElseBlock.ts::handleIf`: an IfBlock that
    // is the elseif branch of an outer IfBlock starts at the `{` of
    // `{:else if EXPR}` (with `expression.start` *before* `block.start` —
    // svelte 5 records the test expression at its source-level position).
    // Overwrite `{:else if ` → `} else if (` and the trailing `}` → `){`,
    // exactly as the JS reference does.
    if block.elseif {
        let (test_start, test_end) = get_expression_range(&block.test).unwrap_or((0, 0));
        let bytes = source.as_bytes();
        let mut brace_open = test_start as usize;
        while brace_open > 0 && bytes[brace_open - 1] != b'{' {
            brace_open -= 1;
        }
        brace_open = brace_open.saturating_sub(1);
        str.overwrite(source_offset(brace_open), test_start, "} else if (");

        let mut close_brace = test_end as usize;
        while close_brace < bytes.len() && bytes[close_brace] != b'}' {
            close_brace += 1;
        }
        if close_brace < bytes.len() {
            str.overwrite(test_end, source_offset(close_brace + 1), "){");
        }
    } else {
        // Split the `{#if EXPR}` rewrite so the test expression stays as
        // an unchanged source chunk in MagicString — preserves
        // per-character source-map segments for TS diagnostics inside
        // the condition. Falls back to the bulk `overwrite` when the
        // expression has no concrete source range (e.g. synthesised).
        if let Some((test_start, test_end)) = get_expression_range(&block.test)
            && test_start >= block.start
            && test_end <= consequent_start
        {
            str.overwrite(block.start, test_start, "if(");
            // [test_start, test_end) left untouched.
            if test_end < consequent_start {
                str.overwrite(test_end, consequent_start, ")");
            } else {
                str.append_left(consequent_start, ")");
            }
        } else {
            str.overwrite_fmt(
                block.start,
                consequent_start,
                format_args!("if({test_text})"),
            );
        }
        // Insert opening brace
        str.append_left(consequent_start, "{");
    }

    // Hoist inner snippets above sibling `{@const}`/`{let}` / elements that
    // reference them (a `{@const xx = test}` before its `{#snippet test}` in the
    // same block needs `test` declared first), as in the each-body path.
    hoist_snippet_blocks(&block.consequent, source, str);

    // Process children (blocks don't increment depth)
    process_fragment_trimmed(
        &block.consequent.nodes,
        source,
        options,
        str,
        counter,
        depth,
    );

    if let Some(ref alternate) = block.alternate {
        if !handle_elseif_alternate(alternate, source, options, str, counter, depth) {
            // Find where the consequent content ends. For an empty consequent
            // this is the body-open position (right after `{#if EXPR}`), NOT
            // `block.start` — otherwise the `} else {` overwrite would clobber
            // the `if(EXPR){` header we just emitted.
            let consequent_end = if block.consequent.nodes.is_empty() {
                consequent_start
            } else {
                block.consequent.nodes.last().unwrap().end()
            };

            // For an empty `{:else}` body, the else block opens right after the
            // `}` that closes the `{:else}` tag — NOT at `block.end` (after
            // `{/if}`), which would make the `} else {` overwrite swallow the
            // `{/if}` and leave the else body unclosed.
            let alternate_start = if alternate.nodes.is_empty() {
                let bytes = source.as_bytes();
                let mut p = consequent_end as usize;
                while p < bytes.len() && bytes[p] != b'}' {
                    p += 1;
                }
                source_offset((p + 1).min(bytes.len()))
            } else {
                alternate.nodes[0].start()
            };

            rewrite_plain_else_tag(source, alternate_start, str);

            // Hoist alternate-branch snippets above sibling declarations too.
            hoist_snippet_blocks(alternate, source, str);
            // Process alternate children
            process_fragment_trimmed(&alternate.nodes, source, options, str, counter, depth);

            // Overwrite `{/if}` with `}`
            let alternate_end = if alternate.nodes.is_empty() {
                alternate_start
            } else {
                alternate.nodes.last().unwrap().end()
            };
            if alternate_end < block.end {
                str.overwrite(alternate_end, block.end, "}");
            }
        }
    } else {
        // No alternate - just close with `}`
        let consequent_end = if block.consequent.nodes.is_empty() {
            consequent_start
        } else {
            block.consequent.nodes.last().unwrap().end()
        };
        if consequent_end < block.end {
            str.overwrite(consequent_end, block.end, "}");
        }
    }
}

fn rewrite_plain_else_tag(source: &str, alternate_start: u32, str: &mut MagicString<'_>) {
    // `alternate_start` is a byte offset; keep the search off the `str` index
    // so a multi-byte char at that offset cannot panic. `}` is ASCII.
    let else_close = source.as_bytes()[..alternate_start as usize]
        .iter()
        .rposition(|&b| b == b'}');
    let colon = else_close.and_then(|end| source[..end].rfind(":else"));
    let else_open = colon.and_then(|word| source[..word].rfind('{'));
    if let (Some(else_open), Some(colon), Some(else_close)) = (else_open, colon, else_close) {
        let else_open = source_offset(else_open);
        let else_close = source_offset(else_close);
        let colon = source_offset(colon);
        str.overwrite(else_open, else_open + 1, "}");
        str.overwrite(else_close, else_close + 1, "{");
        str.remove(colon, colon + 1);
    }
}

fn handle_elseif_alternate(
    alternate: &crate::ast::template::Fragment<'_>,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) -> bool {
    let is_elseif = alternate.nodes.len() == 1
        && matches!(&alternate.nodes[0], TemplateNode::IfBlock(nested) if nested.elseif);
    if is_elseif {
        hoist_snippet_blocks(alternate, source, str);
        process_fragment_trimmed(&alternate.nodes, source, options, str, counter, depth);
    }
    is_elseif
}
