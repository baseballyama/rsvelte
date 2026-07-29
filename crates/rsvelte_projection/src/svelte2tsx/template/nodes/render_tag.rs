//! `{@render …}` tags. Mirrors `htmlxtojsx_v2/nodes/RenderTag.ts`.

use crate::ast::template::RenderTag;
use crate::svelte2tsx::magic_string::MagicString;

use crate::svelte2tsx::template::utils::expr::get_expression_range;

/// Handle a render tag: `{@render snippet(args)}`.
///
/// `{@render foo(1)}` → `;__sveltets_2_ensureSnippet(foo(1));`
///
/// The wrapper is split into a prefix `;__sveltets_2_ensureSnippet(`
/// and a suffix `);` so the inner expression stays as an unchanged
/// source chunk in MagicString. That preserves per-character source-map
/// segments inside the snippet expression — a TS diagnostic at e.g.
/// `foo(1)`'s `1` resolves to its exact `.svelte` column instead of
/// snapping to the `{@render` anchor.
pub(crate) fn handle_render_tag(tag: &RenderTag, _source: &str, str: &mut MagicString<'_>) {
    if tag.start >= tag.end {
        return;
    }

    if let Some((expr_start, expr_end)) = get_expression_range(&tag.expression) {
        str.overwrite(tag.start, expr_start, ";__sveltets_2_ensureSnippet(");
        str.overwrite(expr_end, tag.end, ");");
    } else {
        str.overwrite(tag.start, tag.end, " ");
    }
}
