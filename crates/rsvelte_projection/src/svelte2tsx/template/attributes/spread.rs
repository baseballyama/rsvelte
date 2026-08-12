//! Spread attributes (`{...props}`). Mirrors `htmlxtojsx_v2/nodes/Spread.ts`.

use crate::ast::template::SpreadAttribute;
use crate::svelte2tsx::svelte2tsx::slice_src;
use crate::svelte2tsx::template::segs::{Seg, segs_push_lit, segs_push_src};
use crate::svelte2tsx::template::utils::expr::{
    extend_expr_end_with_ts_postfix, get_expression_range, get_expression_text,
};

/// Structured-bake variant of [`format_spread_attribute`].
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
            segs_push_lit(&mut out, "...");
            segs_push_src(&mut out, s, e);
            segs_push_lit(&mut out, ",");
        }
    } else {
        segs_push_lit(&mut out, "...");
        segs_push_lit(&mut out, get_expression_text(&spread.expression, source));
        segs_push_lit(&mut out, ",");
    }
    out
}

/// Format a spread attribute: `{...expr}` → `...expr,`, or `{...expr as T}` → `...(expr as T),`.
/// When a trailing TS postfix (`as T`, `satisfies T`, `!`) is present the
/// spread operand must be parenthesised — `...expr as T` is a parse error in
/// TSX, but `...(expr as T)` is valid (mirrors upstream Spread.ts slicing
/// `[node.start+1, node.end-1]` and Element/InlineComponent context).
pub fn format_spread_attribute(spread: &SpreadAttribute, source: &str) -> String {
    if let Some((s, e)) = get_expression_range(&spread.expression) {
        let extended = extend_expr_end_with_ts_postfix(source, e, spread.end);
        if extended > e {
            // Has TS postfix — wrap in parens so `...expr as T` becomes `...(expr as T)`.
            let postfix = slice_src(source, e as usize, extended as usize);
            let expr_text = slice_src(source, s as usize, e as usize);
            return format!("...({expr_text}{postfix}),");
        }
        let expr_text = slice_src(source, s as usize, e as usize);
        return format!("...{expr_text},");
    }
    let expr_text = get_expression_text(&spread.expression, source);
    format!("...{expr_text},")
}
