//! `{expression}` tags. Mirrors `htmlxtojsx_v2/nodes/MustacheTag.ts`.

use crate::ast::template::ExpressionTag;
use crate::svelte2tsx::magic_string::MagicString;

use super::comment::comments_in_opener_range;
use crate::svelte2tsx::template::utils::expr::get_expression_range;

/// Handle an expression tag: `{expression}`.
///
/// Overwrites `{` with empty and `}` with `;` so the expression is preserved
/// as a statement: `{count}` → `count;`
pub(crate) fn handle_expression_tag(expr: &ExpressionTag, source: &str, str: &mut MagicString) {
    if expr.start >= expr.end {
        return;
    }

    if let Some((expr_start, expr_end)) = get_expression_range(&expr.expression) {
        // Leading: keep any `{/* c */ expr}` comments between the `{` and the
        // expression (official preserves them, stripping only the `{` and a
        // wrapping `(`). Strip from `{` up to the first such comment.
        let lead_keep = comments_in_opener_range(expr.start, expr_start)
            .first()
            .map(|&(cs, _)| cs)
            .unwrap_or(expr_start);
        if expr.start < lead_keep {
            str.overwrite(expr.start, lead_keep, "");
        }
        // The parser narrows the expression span past a trailing TS postfix —
        // `name as string`, `x satisfies T`, `x!`. Those must be PRESERVED
        // (official keeps them), unlike wrapping parens (`(foo)`) which the
        // narrowing strips symmetrically and which must stay stripped. So if the
        // text between `expr_end` and the closing `}` is a TS postfix, keep it
        // (overwrite only the `}`); otherwise overwrite from `expr_end` (which
        // drops a trailing `)` to match the stripped leading `(`).
        let close = {
            let bytes = source.as_bytes();
            let mut c = expr.end as usize;
            while c > expr_end as usize && bytes[c - 1] != b'}' {
                c -= 1;
            }
            c
        };
        let tail = source
            .get(expr_end as usize..close.saturating_sub(1))
            .unwrap_or("")
            .trim_start();
        let is_ts_postfix =
            tail.starts_with("as ") || tail.starts_with("satisfies ") || tail.starts_with('!');
        if is_ts_postfix && close > expr_end as usize {
            str.overwrite((close - 1) as u32, expr.end, ";");
        } else {
            // Trailing: keep any `{expr /* c */}` comments between the expression
            // and `}` (emit `;` right after the expression, strip a wrapping `)`
            // and the `}`).
            let trailing = comments_in_opener_range(expr_end, close.saturating_sub(1) as u32);
            match (trailing.first(), trailing.last()) {
                (Some(&(first_cs, _)), Some(&(_, last_ce))) => {
                    if expr_end < first_cs {
                        str.overwrite(expr_end, first_cs, "; ");
                    }
                    if last_ce < expr.end {
                        str.overwrite(last_ce, expr.end, "");
                    }
                }
                _ if expr_end < expr.end => {
                    str.overwrite(expr_end, expr.end, ";");
                }
                _ => {}
            }
        }
    } else {
        // Fallback: overwrite the whole thing with a space
        str.overwrite(expr.start, expr.end, " ");
    }
}
