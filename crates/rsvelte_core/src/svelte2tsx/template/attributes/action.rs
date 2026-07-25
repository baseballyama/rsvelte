//! `use:` directives. Mirrors `htmlxtojsx_v2/nodes/Action.ts`.

use crate::ast::template::UseDirective;
use crate::svelte2tsx::template::utils::expr::get_expression_text;

/// Legacy V5-style use formatter — see `format_transition_directive`.
pub(crate) fn format_use_directive(use_dir: &UseDirective, source: &str) -> Option<String> {
    if let Some(ref expr) = use_dir.expression {
        let expr_text = get_expression_text(expr, source);
        Some(format!(
            "__sveltets_2_ensureAction({})(svelteHTML.mapElementTag('{}'), {}),",
            use_dir.name, "", expr_text
        ))
    } else {
        Some(format!(
            "__sveltets_2_ensureAction({})(svelteHTML.mapElementTag('{}'), {{}}),",
            use_dir.name, ""
        ))
    }
}
