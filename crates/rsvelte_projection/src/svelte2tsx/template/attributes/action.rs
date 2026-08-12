//! `use:` directives. Mirrors `htmlxtojsx_v2/nodes/Action.ts`.

use crate::ast::template::UseDirective;
use crate::svelte2tsx::template::utils::expr::get_expression_text;

/// Legacy V5-style use formatter — see `format_transition_directive`.
pub fn format_use_directive(use_dir: &UseDirective, source: &str) -> String {
    use_dir.expression.as_ref().map_or_else(
        || {
            format!(
                "__sveltets_2_ensureAction({})(svelteHTML.mapElementTag('{}'), {{}}),",
                use_dir.name, ""
            )
        },
        |expr| {
            let expr_text = get_expression_text(expr, source);
            format!(
                "__sveltets_2_ensureAction({})(svelteHTML.mapElementTag('{}'), {}),",
                use_dir.name, "", expr_text
            )
        },
    )
}
