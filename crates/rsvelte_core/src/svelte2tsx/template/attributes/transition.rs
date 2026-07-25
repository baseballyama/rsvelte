//! `transition:` / `in:` / `out:` / `animate:` directives.
//! Mirrors `htmlxtojsx_v2/nodes/Transition.ts` and `Animation.ts`.

use crate::ast::template::TransitionDirective;
use crate::svelte2tsx::template::utils::expr::get_expression_text;

/// Format a transition directive in the JS reference's element-suffix form:
/// `transition:fade={params}` → `__sveltets_2_ensureTransition(fade(svelteHTML.mapElementTag('<tag>'),(params)));`
/// (mirrors `htmlxtojsx_v2/nodes/Transition.ts`). Used as a *suffix*
/// appended after `svelteHTML.createElement(…)`, not as a createElement
/// prop. Expressions like `in:`, `out:`, and `animate:` use the same shape.
pub(crate) fn format_transition_directive_v4(name: &str, expr: Option<&str>, tag: &str) -> String {
    if let Some(expr_text) = expr {
        format!(
            "__sveltets_2_ensureTransition({}(svelteHTML.mapElementTag('{}'),({})));",
            name, tag, expr_text
        )
    } else {
        format!(
            "__sveltets_2_ensureTransition({}(svelteHTML.mapElementTag('{}')));",
            name, tag
        )
    }
}

/// Like `format_transition_directive_v4` but uses
/// `__sveltets_2_ensureAnimation(...)` and adds the
/// `__sveltets_2_AnimationMove` placeholder argument the JS reference
/// passes for `animate:` directives.
pub(crate) fn format_animate_directive_v4(name: &str, expr: Option<&str>, tag: &str) -> String {
    if let Some(expr_text) = expr {
        format!(
            "__sveltets_2_ensureAnimation({}(svelteHTML.mapElementTag('{}'),__sveltets_2_AnimationMove,({})));",
            name, tag, expr_text
        )
    } else {
        format!(
            "__sveltets_2_ensureAnimation({}(svelteHTML.mapElementTag('{}'),__sveltets_2_AnimationMove));",
            name, tag
        )
    }
}

/// Legacy V5-style transition formatter — kept for non-Element callers
/// (svelte:dynamic-element handlers) that haven't been ported to the V4
/// suffix form yet.
pub(crate) fn format_transition_directive(
    transition: &TransitionDirective,
    source: &str,
) -> Option<String> {
    if let Some(ref expr) = transition.expression {
        let expr_text = get_expression_text(expr, source);
        Some(format!(
            "__sveltets_2_ensureTransition({})(svelteHTML.mapElementTag('{}'), {}),",
            transition.name, "", expr_text
        ))
    } else {
        Some(format!(
            "__sveltets_2_ensureTransition({})(svelteHTML.mapElementTag('{}'), {{}}),",
            transition.name, ""
        ))
    }
}
