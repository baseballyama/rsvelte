//! `{expression}` tags. Mirrors `htmlxtojsx_v2/nodes/MustacheTag.ts`.

use crate::ast::template::ExpressionTag;
use crate::svelte2tsx::magic_string::MagicString;

/// Handle an expression tag: `{expression}`.
///
/// Upstream rewrites the two brace *positions* and nothing else, so whatever
/// sits between them — wrapping parens, comments, a TS postfix — is kept
/// verbatim: `{count}` → `count;`, `{(a ?? '')}` → `(a ?? '');`.
pub fn handle_expression_tag(expr: &ExpressionTag, source: &str, str: &mut MagicString<'_>) {
    if expr.start >= expr.end {
        return;
    }
    let inner = source
        .get(expr.start as usize + 1..expr.end as usize - 1)
        .unwrap_or("");
    if inner.trim_start().starts_with('{') {
        // Possibly an object literal — parenthesized so it reads as an
        // expression rather than a block.
        str.overwrite(expr.start, expr.start + 1, ";(");
        str.overwrite(expr.end - 1, expr.end, ");");
        return;
    }
    str.overwrite(expr.start, expr.start + 1, "");
    str.overwrite(expr.end - 1, expr.end, ";");
}
