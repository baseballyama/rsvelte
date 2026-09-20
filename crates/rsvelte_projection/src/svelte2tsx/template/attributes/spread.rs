//! Spread attributes (`{...props}`). Mirrors `htmlxtojsx_v2/nodes/Spread.ts`.

use crate::ast::template::SpreadAttribute;
use crate::svelte2tsx::svelte2tsx::slice_src;
use crate::svelte2tsx::template::segs::{Seg, segs_push_lit, segs_push_src};
use crate::svelte2tsx::template::utils::expr::{
    extend_expr_end_with_ts_postfix, get_expression_range, get_expression_text,
};

/// A spread attribute as segments.
/// When a trailing TS postfix is present the spread operand is parenthesised:
/// `{...expr as T}` → `...(expr as T),` (mirrors upstream Spread.ts + paren rule).
pub fn format_spread_attribute_segments(spread: &SpreadAttribute, source: &str) -> Vec<Seg> {
    let mut out = Vec::new();
    if let Some((s, e)) = get_expression_range(&spread.expression) {
        let extended = extend_expr_end_with_ts_postfix(source, e, spread.end);
        if extended > e {
            // Has TS postfix — wrap in parens.
            segs_push_lit(&mut out, "...(");
            segs_push_src(&mut out, s, e);
            // The postfix text (e.g. " as T") is a literal because it's outside
            // the expression's AST span; include it then close the paren.
            segs_push_lit(&mut out, slice_src(source, e as usize, extended as usize));
            segs_push_lit(&mut out, "),");
        } else {
            // `Spread.ts:13-16`: one range, `[node.start + 1, node.end - 1]` —
            // the braces are dropped and the `...` comes from the source, so the
            // transformation array has no literal between the tag name and it.
            segs_push_src(&mut out, spread.start + 1, spread.end - 1);
            segs_push_lit(&mut out, ",");
        }
    } else {
        segs_push_lit(&mut out, "...");
        segs_push_lit(&mut out, get_expression_text(&spread.expression, source));
        segs_push_lit(&mut out, ",");
    }
    out
}
