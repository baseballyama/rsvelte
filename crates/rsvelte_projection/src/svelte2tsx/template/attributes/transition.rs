//! `transition:` / `in:` / `out:` / `animate:` directives.
//! Mirrors `htmlxtojsx_v2/nodes/Transition.ts` and `Animation.ts`.

/// Format a transition directive in the JS reference's element-suffix form:
/// `transition:fade={params}` → `__sveltets_2_ensureTransition(fade(svelteHTML.mapElementTag('<tag>'),(params)));`
/// (mirrors `htmlxtojsx_v2/nodes/Transition.ts`). Used as a *suffix*
/// appended after `svelteHTML.createElement(…)`, not as a createElement
/// prop. Expressions like `in:`, `out:`, and `animate:` use the same shape.
pub fn format_transition_directive_v4(
    name: &str,
    expr: Option<&str>,
    tag: &str,
    ns: &str,
) -> String {
    expr.map_or_else(
        || format!("__sveltets_2_ensureTransition({name}({ns}.mapElementTag('{tag}')));"),
        |expr_text| {
            format!(
                "__sveltets_2_ensureTransition({name}({ns}.mapElementTag('{tag}'),({expr_text})));"
            )
        },
    )
}

/// Like `format_transition_directive_v4` but uses
/// `__sveltets_2_ensureAnimation(...)` and adds the
/// `__sveltets_2_AnimationMove` placeholder argument the JS reference
/// passes for `animate:` directives.
pub fn format_animate_directive_v4(name: &str, expr: Option<&str>, tag: &str, ns: &str) -> String {
    expr.map_or_else(|| format!(
        "__sveltets_2_ensureAnimation({name}({ns}.mapElementTag('{tag}'),__sveltets_2_AnimationMove));"
    ), |expr_text| {
        format!(
            "__sveltets_2_ensureAnimation({name}({ns}.mapElementTag('{tag}'),__sveltets_2_AnimationMove,({expr_text})));"
        )
    })
}
