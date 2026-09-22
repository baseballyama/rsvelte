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

/// The source range of a directive's own name — `myFade` in
/// `transition:myFade={…}` — so the generated call can keep it rather than
/// synthesize it. Upstream's `transform()` moves that range, which is why
/// official's map has a segment for every byte of it and rsvelte's had none
/// (#4464).
///
/// The equality check is the guard: a directive whose source spelling this
/// does not reproduce exactly falls back to generated text, where a wrong
/// range would move the mapping onto unrelated bytes.
pub fn directive_name_span(source: &str, attr_start: u32, name: &str) -> Option<(u32, u32)> {
    let colon = source.get(attr_start as usize..)?.find(':')?;
    let start = attr_start as usize + colon + 1;
    let end = start + name.len();
    if source.get(start..end)? != name {
        return None;
    }
    Some((u32::try_from(start).ok()?, u32::try_from(end).ok()?))
}
