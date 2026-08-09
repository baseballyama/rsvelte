//! Suffix statements emitted after an element / component opener for the
//! directives that the JS reference lowers outside the props object.

use super::binding::bind_directive_suffix_seg;
use super::class_style::class_style_directive_seg;
use super::transition::{format_animate_directive_v4, format_transition_directive_v4};
use std::fmt::Write as _;

use crate::ast::template::Attribute;
use crate::svelte2tsx::svelte2tsx::slice_src;
use crate::svelte2tsx::template::segs::{Seg, segs_push_lit};
use crate::svelte2tsx::template::utils::expr::{
    extend_expr_end_with_ts_postfix, get_expression_range, get_expression_text,
};

/// Build the post-`createElement(...)` suffix statements for an element's
/// `class:` / `style:` / `transition:` / `in:` / `out:` / `animate:` / `bind:`
/// directives in a SINGLE source-order pass over the attributes.
///
/// Official (`htmlxtojsx_v2/nodes/Element.ts`) appends every such directive's
/// statement onto `startEndTransformation` as the htmlx walker visits the
/// attributes, so they emit strictly in source order — a `style:` after a
/// `transition:`/`bind:this` stays after it, rather than being grouped with
/// earlier `class:` directives. `el.attributes` is already in source order, so
/// a single dispatch loop reproduces that interleaving exactly. (`use:` actions
/// are NOT here — they are emitted as a `const $$action_N = …` PREFIX before the
/// createElement call.)
pub(crate) fn build_element_directive_suffix_segments(
    attributes: &[Attribute],
    source: &str,
    element_var: Option<&str>,
    parent_tag: &str,
    use_ts_syntax: bool,
    tag: &str,
) -> Vec<Seg> {
    let mut out: Vec<Seg> = Vec::new();
    for attr in attributes {
        match attr {
            Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => {
                if let Some(segs) = class_style_directive_seg(attr, source) {
                    out.extend(segs);
                }
            }
            Attribute::TransitionDirective(t) => {
                // Preserve a trailing TS postfix on the param expression
                // (`transition:fade={params as ParamsType}`), as Transition.ts does.
                let expr = t.expression.as_ref().map(|e| {
                    if let Some((s, ex)) = get_expression_range(e) {
                        let extended = extend_expr_end_with_ts_postfix(source, ex, t.end);
                        slice_src(source, s as usize, extended as usize)
                    } else {
                        get_expression_text(e, source)
                    }
                });
                segs_push_lit(
                    &mut out,
                    &format_transition_directive_v4(&t.name, expr, tag),
                );
            }
            Attribute::AnimateDirective(a) => {
                let expr = a.expression.as_ref().map(|e| {
                    if let Some((s, ex)) = get_expression_range(e) {
                        let extended = extend_expr_end_with_ts_postfix(source, ex, a.end);
                        slice_src(source, s as usize, extended as usize)
                    } else {
                        get_expression_text(e, source)
                    }
                });
                segs_push_lit(&mut out, &format_animate_directive_v4(&a.name, expr, tag));
            }
            Attribute::BindDirective(bind) => {
                let s =
                    bind_directive_suffix_seg(bind, source, element_var, parent_tag, use_ts_syntax);
                if !s.is_empty() {
                    segs_push_lit(&mut out, &s);
                }
            }
            _ => {}
        }
    }
    out
}

/// Build the directive prefix (action declarations) and suffix
/// (transition / animate calls) that wrap `svelteHTML.createElement(...)`
/// for an HTML element. Mirrors the JS reference's
/// `htmlxtojsx_v2/nodes/{Action,Transition,Animation}.ts`.
///
/// Returns `(prefix, suffix, action_count)`. `prefix` is the sequence of
/// `const $$action_N = __sveltets_2_ensureAction(…);` statements that
/// must be emitted *before* the createElement call; `suffix` collects
/// the transition / animate calls that go *after* it. `action_count`
/// is the number of actions — the createElement's second argument
/// becomes `__sveltets_2_union($$action_0[, $$action_1, …])` when this
/// is non-zero.
pub(crate) fn build_directive_prefix_suffix(
    attributes: &[Attribute],
    source: &str,
    tag: &str,
) -> (String, String, usize) {
    let mut prefix = String::new();
    let mut suffix = String::new();
    let mut action_count = 0usize;

    for attr in attributes {
        match attr {
            Attribute::UseDirective(use_dir) => {
                // Preserve trailing TS postfix on param expression
                // (`use:action={params as ParamsType}` mirrors Transition.ts / Action.ts).
                let expr = use_dir.expression.as_ref().map(|e| {
                    if let Some((s, ex)) = get_expression_range(e) {
                        let extended = extend_expr_end_with_ts_postfix(source, ex, use_dir.end);
                        slice_src(source, s as usize, extended as usize)
                    } else {
                        get_expression_text(e, source)
                    }
                });
                let id = format!("$$action_{}", action_count);
                action_count += 1;
                if let Some(expr_text) = expr {
                    let _ = write!(
                        prefix,
                        "const {} = __sveltets_2_ensureAction({}(svelteHTML.mapElementTag('{}'),({})));",
                        id, use_dir.name, tag, expr_text
                    );
                } else {
                    let _ = write!(
                        prefix,
                        "const {} = __sveltets_2_ensureAction({}(svelteHTML.mapElementTag('{}')));",
                        id, use_dir.name, tag
                    );
                }
            }
            Attribute::TransitionDirective(t) => {
                // Preserve trailing TS postfix on param expression
                // (`transition:fade={params as ParamsType}` mirrors Transition.ts).
                let expr = t.expression.as_ref().map(|e| {
                    if let Some((s, ex)) = get_expression_range(e) {
                        let extended = extend_expr_end_with_ts_postfix(source, ex, t.end);
                        slice_src(source, s as usize, extended as usize)
                    } else {
                        get_expression_text(e, source)
                    }
                });
                suffix.push_str(&format_transition_directive_v4(&t.name, expr, tag));
            }
            Attribute::AnimateDirective(a) => {
                // Preserve trailing TS postfix on param expression.
                let expr = a.expression.as_ref().map(|e| {
                    if let Some((s, ex)) = get_expression_range(e) {
                        let extended = extend_expr_end_with_ts_postfix(source, ex, a.end);
                        slice_src(source, s as usize, extended as usize)
                    } else {
                        get_expression_text(e, source)
                    }
                });
                suffix.push_str(&format_animate_directive_v4(&a.name, expr, tag));
            }
            _ => {}
        }
    }

    (prefix, suffix, action_count)
}

/// Lower `transition:`/`in:`/`out:`/`animate:` directives on a COMPONENT to
/// the suffix statements official emits after `new …({...})`. There is no real
/// element, so the element-tag expression is `undefined.mapElementTag("undefined")`
/// (mirrors upstream Element wrapping a component). `use:` is intentionally not
/// emitted — it is a compile error on a component.
pub(crate) fn build_component_directive_suffix(attributes: &[Attribute], source: &str) -> Vec<Seg> {
    let map_tag = "undefined.mapElementTag(\"undefined\")";
    let mut out: Vec<Seg> = Vec::new();
    for attr in attributes {
        match attr {
            Attribute::TransitionDirective(t) => {
                let s = match t
                    .expression
                    .as_ref()
                    .map(|e| get_expression_text(e, source))
                {
                    Some(expr) => format!(
                        "__sveltets_2_ensureTransition({}({},({})));",
                        t.name, map_tag, expr
                    ),
                    None => format!("__sveltets_2_ensureTransition({}({}));", t.name, map_tag),
                };
                segs_push_lit(&mut out, &s);
            }
            Attribute::AnimateDirective(a) => {
                let s = match a
                    .expression
                    .as_ref()
                    .map(|e| get_expression_text(e, source))
                {
                    Some(expr) => format!(
                        "__sveltets_2_ensureAnimation({}({},__sveltets_2_AnimationMove,({})));",
                        a.name, map_tag, expr
                    ),
                    None => format!(
                        "__sveltets_2_ensureAnimation({}({},__sveltets_2_AnimationMove));",
                        a.name, map_tag
                    ),
                };
                segs_push_lit(&mut out, &s);
            }
            _ => {}
        }
    }
    out
}
