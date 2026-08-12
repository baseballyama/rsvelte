//! `on:` directives. Mirrors `htmlxtojsx_v2/nodes/EventHandler.ts`.

use crate::ast::template::{Attribute, OnDirective};
use crate::svelte2tsx::template::segs::{Seg, segs_push_fmt, segs_push_lit, segs_push_src};
use std::fmt::Write as _;

use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};

/// Collect references to all `on:` directives from an attribute list.
pub fn get_on_directives<'a>(attributes: &'a [Attribute<'a>]) -> Vec<&'a OnDirective<'a>> {
    attributes
        .iter()
        .filter_map(|attr| match attr {
            Attribute::OnDirective(on) => Some(on),
            _ => None,
        })
        .collect()
}

/// Build `.$on()` call strings for a set of on directives.
///
/// Each directive becomes `inst.$on("eventName", handler);`
/// If no handler expression, uses `() => {}`.
pub fn build_on_calls(inst_var: &str, on_directives: &[&OnDirective], source: &str) -> String {
    let mut calls = String::new();
    for on in on_directives {
        let handler = on.expression.as_ref().map_or_else(
            || "() => {}".to_string(),
            |expr| get_expression_text(expr, source).to_string(),
        );
        let _ = write!(calls, "{}.$on(\"{}\", {});", inst_var, on.name, handler);
    }
    calls
}

/// Structured-bake variant of [`format_on_directive`].
pub fn format_on_directive_segments(on: &OnDirective, source: &str) -> Vec<Seg> {
    let mut out = Vec::new();
    if let Some(ref expr) = on.expression {
        segs_push_fmt(&mut out, format_args!("\"on:{}\":", on.name));
        if let Some((s, e)) = get_expression_range(expr) {
            segs_push_src(&mut out, s, e);
        } else {
            segs_push_lit(&mut out, get_expression_text(expr, source));
        }
        segs_push_lit(&mut out, ",");
    } else {
        // Event forwarding has no expression to preserve.
        segs_push_fmt(&mut out, format_args!("\"on:{}\":undefined,", on.name));
    }
    out
}

/// Format an on directive: `on:click={handler}` → `"on:click":handler,`
pub fn format_on_directive(on: &OnDirective, source: &str) -> String {
    on.expression.as_ref().map_or_else(
        || format!("\"on:{}\":undefined,", on.name),
        |expr| {
            let expr_text = get_expression_text(expr, source);
            format!("\"on:{}\":{},", on.name, expr_text)
        },
    )
}
