//! `{#key}` blocks. Mirrors `htmlxtojsx_v2/nodes/Key.ts`.

use crate::ast::template::KeyBlock;
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::Svelte2TsxOptions;

use crate::svelte2tsx::template::ctx::{Counter, TemplateNodeExt};
use crate::svelte2tsx::template::nodes::special_element::process_fragment_trimmed;
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};

/// Handle a key block: `{#key expression}...{/key}`.
pub fn handle_key_block(
    block: &KeyBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    if block.start >= block.end {
        return;
    }

    let expr_text = get_expression_text(&block.expression, source);

    // For an empty `{#key EXPR}{/key}` body, the block scope opens right after
    // the `}` that closes the `{#key EXPR}` tag — NOT at `block.end` (after
    // `{/key}`), which would make the header rewrite swallow `{/key}` and leave
    // the `{` unbalanced.
    let content_start = if block.fragment.nodes.is_empty() {
        let expr_end = get_expression_range(&block.expression).map_or(block.start, |(_, e)| e);
        let bytes = source.as_bytes();
        let mut p = expr_end as usize;
        while p < bytes.len() && bytes[p] != b'}' {
            p += 1;
        }
        u32::try_from((p + 1).min(bytes.len())).expect("template offset fits in u32")
    } else {
        block.fragment.nodes[0].start()
    };

    // Preserve the expression chunk in place so its per-character mapping
    // survives. Official emits the key expression as a bare statement followed
    // by a block scope for the body — `{#key value}…{/key}` → `value; { … }`
    // (NOT `{ value; … }`). So drop the `{#key ` prefix and turn the closing
    // `}` of the opening tag into `; {`. Mirrors KeyBlock handling in upstream
    // htmlxtojsx_v2.
    if let Some((expr_start, expr_end)) = get_expression_range(&block.expression) {
        str.overwrite(block.start, expr_start, "");
        if expr_end < content_start {
            str.overwrite(expr_end, content_start, "; {");
        } else {
            str.append_left(expr_end, "; {");
        }
    } else {
        str.overwrite_fmt(block.start, content_start, format_args!("{expr_text}; {{"));
    }

    // Process children
    process_fragment_trimmed(&block.fragment.nodes, source, options, str, counter, depth);

    let content_end = if block.fragment.nodes.is_empty() {
        content_start
    } else {
        block.fragment.nodes.last().unwrap().end()
    };

    if content_end < block.end {
        str.overwrite(content_end, block.end, "}");
    }
}
