//! `on:` directives. Mirrors `htmlxtojsx_v2/nodes/EventHandler.ts`.

use crate::ast::template::{Attribute, OnDirective};
use crate::svelte2tsx::template::segs::{Seg, segs_push_fmt, segs_push_lit, segs_push_src};
use std::fmt::Write as _;

use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::template::transform::surround_with;
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

/// `InlineComponent.addEvent` (`InlineComponent.ts:136-151`) as segments.
///
/// The event name and the handler are transformation RANGES, not baked text:
/// `transform` moves them and collapses the source between them, which is where
/// the props object's spacing comes from (#4650).
pub fn build_on_call_segments(
    str: &mut MagicString<'_>,
    inst_var: &str,
    on_directives: &[&OnDirective],
    source: &str,
) -> Vec<Seg> {
    let mut out = Vec::new();
    for on in on_directives {
        segs_push_fmt(&mut out, format_args!("{inst_var}.$on("));
        match directive_name_range(source, on) {
            Some((start, end)) => {
                surround_with(str, start, end, "\"", "\"");
                segs_push_src(&mut out, start, end);
            }
            None => segs_push_fmt(&mut out, format_args!("\"{}\"", on.name)),
        }
        segs_push_lit(&mut out, ", ");
        match on.expression.as_ref().and_then(get_expression_range) {
            Some((start, end)) => segs_push_src(&mut out, start, end),
            None => segs_push_lit(&mut out, "() => {}"),
        }
        segs_push_lit(&mut out, ");");
    }
    out
}

/// `getDirectiveNameStartEndIdx` (`node-utils.ts:169-172`): the name is what
/// follows the directive's first `:`.
fn directive_name_range(source: &str, on: &OnDirective) -> Option<(u32, u32)> {
    let start = on.start as usize;
    let colon = source.get(start..on.end as usize)?.find(':')? + start + 1;
    let end = colon + on.name.len();
    (end <= on.end as usize).then_some((colon as u32, end as u32))
}

/// An `on:` directive as segments.
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
