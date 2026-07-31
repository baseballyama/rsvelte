//! `{@html expression}` tags. Mirrors `htmlxtojsx_v2/nodes/RawMustacheTag.ts`.

use crate::ast::template::HtmlTag;
use crate::svelte2tsx::magic_string::MagicString;

use crate::svelte2tsx::template::utils::expr::get_expression_range;

/// Handle an HTML tag: `{@html expression}`.
///
/// The expression needs type checking even though it's raw HTML.
pub(crate) fn handle_html_tag(html: &HtmlTag, _source: &str, str: &mut MagicString<'_>) {
    if html.start >= html.end {
        return;
    }

    if let Some((expr_start, expr_end)) = get_expression_range(&html.expression) {
        // Overwrite `{@html ` prefix
        if html.start < expr_start {
            str.overwrite(html.start, expr_start, "");
        }
        // Overwrite closing `}` with `;`
        if expr_end < html.end {
            str.overwrite(expr_end, html.end, ";");
        }
    } else {
        str.overwrite(html.start, html.end, " ");
    }
}
