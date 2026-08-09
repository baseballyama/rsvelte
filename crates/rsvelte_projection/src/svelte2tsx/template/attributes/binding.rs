//! `bind:` directives. Mirrors `htmlxtojsx_v2/nodes/Binding.ts`.

use std::fmt::Write as _;

use crate::ast::template::{Attribute, BindDirective};
use crate::svelte2tsx::svelte2tsx::slice_src;
use crate::svelte2tsx::template::segs::{Seg, segs_push_fmt, segs_push_lit, segs_push_src};
use crate::svelte2tsx::template::utils::expr::{
    extend_expr_end_with_ts_postfix, get_binding_lhs_text, get_expression_end_stripping_ts,
    get_expression_range, get_expression_text, get_set_binding_ranges,
};

/// Structured-bake variant of [`format_bind_directive`].
pub(crate) fn format_bind_directive_segments(bind: &BindDirective, source: &str) -> Vec<Seg> {
    let mut out = Vec::new();
    segs_push_fmt(&mut out, format_args!("\"bind:{}\":", bind.name));
    if let Some(((gs, ge), (ss, se))) = get_set_binding_ranges(&bind.expression, source) {
        // Svelte 5 function binding on an element: `bind:value={getFn, setFn}`
        // → `"bind:value":__sveltets_2_get_set_binding(getFn, setFn),`
        // (mirrors the `isGetSetBinding` branch in upstream Binding.ts).
        segs_push_lit(&mut out, "__sveltets_2_get_set_binding(");
        segs_push_src(&mut out, gs, ge);
        segs_push_lit(&mut out, ",");
        segs_push_src(&mut out, ss, se);
        segs_push_lit(&mut out, ")");
    } else if let Some((s, e)) = get_expression_range(&bind.expression) {
        // Keep a trailing TS postfix (`bind:value={binding!}` → `binding!`,
        // `… as number}` → `… as number`) that the parser narrowed off.
        let e = extend_expr_end_with_ts_postfix(source, e, bind.end);
        segs_push_src(&mut out, s, e);
    } else {
        segs_push_lit(&mut out, get_expression_text(&bind.expression, source));
    }
    segs_push_lit(&mut out, ",");
    out
}

/// Format a bind directive: `bind:name={expr}` → `"bind:name":expr,`. A Svelte
/// 5 function binding `bind:name={getFn, setFn}` becomes
/// `"bind:name":__sveltets_2_get_set_binding(getFn, setFn),`.
pub(crate) fn format_bind_directive(bind: &BindDirective, source: &str) -> String {
    if let Some(((gs, ge), (ss, se))) = get_set_binding_ranges(&bind.expression, source) {
        return format!(
            "\"bind:{}\":__sveltets_2_get_set_binding({},{}),",
            bind.name,
            slice_src(source, gs as usize, ge as usize),
            slice_src(source, ss as usize, se as usize),
        );
    }
    let expr_text = get_expression_text(&bind.expression, source);
    format!("\"bind:{}\":{},", bind.name, expr_text)
}

/// Component-side prop text for a `bind:` directive: `foo:expr,`, or the
/// shorthand `expr,` when written as bare `bind:foo`. `bind:this` contributes
/// no prop (it is applied as an assignment after the create call). Mirrors the
/// `InlineComponent` branch of upstream `Binding.ts`.
pub(crate) fn format_component_bind_directive(
    bind: &BindDirective,
    source: &str,
) -> Option<String> {
    if bind.name == "this" {
        return None;
    }
    let expr_range = get_expression_range(&bind.expression);
    let get_set = get_set_binding_ranges(&bind.expression, source);
    let is_shorthand = get_set.is_none()
        && expr_range.is_some_and(|(s, _)| s == bind.start + "bind:".len() as u32);
    if let Some((s, e)) = expr_range
        && is_shorthand
    {
        return Some(format!("{},", slice_src(source, s as usize, e as usize)));
    }
    let value = if let Some(((gs, ge), (ss, se))) = get_set {
        format!(
            "__sveltets_2_get_set_binding({},{})",
            slice_src(source, gs as usize, ge as usize),
            slice_src(source, ss as usize, se as usize),
        )
    } else if let Some((s, e)) = expr_range {
        // Keep a trailing TS postfix the parser narrowed out of the span.
        let e = extend_expr_end_with_ts_postfix(source, e, bind.end);
        slice_src(source, s as usize, e as usize).to_string()
    } else {
        get_expression_text(&bind.expression, source).to_string()
    };
    Some(format!("{}:{},", bind.name, value))
}

/// One-way HTML element bindings whose value reflects an element property
/// (`clientWidth`, etc.). Mirrors the JS reference's `oneWayBindingAttributes`
/// in `htmlxtojsx_v2/nodes/Binding.ts`.
pub(crate) fn is_one_way_binding_attribute(name: &str) -> bool {
    matches!(
        name,
        "clientWidth"
            | "clientHeight"
            | "offsetWidth"
            | "offsetHeight"
            | "duration"
            | "seeking"
            | "ended"
            | "readyState"
            | "naturalWidth"
            | "naturalHeight"
    )
}

/// One-way bindings whose property is *not* on the element directly — they
/// expose values like `DOMRectReadOnly` that need a typed null assignment.
/// Mirrors `oneWayBindingAttributesNotOnElement` in Binding.ts.
pub(crate) fn one_way_binding_not_on_element_type(name: &str) -> Option<&'static str> {
    Some(match name {
        "contentRect" => "DOMRectReadOnly",
        "contentBoxSize" => "ResizeObserverSize[]",
        "borderBoxSize" => "ResizeObserverSize[]",
        "devicePixelContentBoxSize" => "ResizeObserverSize[]",
        "buffered" => "import('svelte/elements').SvelteMediaTimeRange[]",
        "played" => "import('svelte/elements').SvelteMediaTimeRange[]",
        "seekable" => "import('svelte/elements').SvelteMediaTimeRange[]",
        _ => return None,
    })
}

pub(crate) fn is_one_way_bind(name: &str) -> bool {
    is_one_way_binding_attribute(name) || one_way_binding_not_on_element_type(name).is_some()
}

/// Whether a `bind:` directive should be filtered out of the createElement
/// props (because it gets emitted via a typed assignment after createElement).
pub(crate) fn bind_is_filtered_from_props(name: &str, parent_tag: &str) -> bool {
    name == "this" || is_one_way_bind(name) || (name == "group" && parent_tag == "input")
}

/// Whether a `bind:` directive forces declaration of an element variable
/// (`const $$_div0 = svelteHTML.createElement(...)`) so the assignment can
/// reference it. Mirrors the JS reference's `referencedName` flag in
/// `htmlxtojsx_v2/nodes/Element.ts`.
pub(crate) fn bind_needs_element_var(name: &str) -> bool {
    name == "this" || is_one_way_binding_attribute(name)
}

/// Build the suffix appended right after the `svelteHTML.createElement(...)`
/// call for all `bind:` directives on a regular HTML element. Mirrors the
/// branches of `htmlxtojsx_v2/nodes/Binding.ts::handleBinding`:
///
/// - `bind:this`               → `<expr> = <element_var>;`
/// - one-way (clientWidth, …)  → `<expr>= <element_var>.<attr>;`
/// - one-way-not-on-element    → `<expr>= /** @type {T} */ (null);` (typed null)
/// - any other `bind:foo`      → keeps the prop, then appends an
///   ignored-comments-wrapped `() => <expr> = __sveltets_2_any(null);` so TS
///   widens the type.
pub(crate) fn build_bind_directive_suffix(
    attributes: &[Attribute],
    source: &str,
    element_var: Option<&str>,
    parent_tag: &str,
    use_ts_syntax: bool,
) -> String {
    let mut out = String::new();
    for attr in attributes {
        let Attribute::BindDirective(bind) = attr else {
            continue;
        };
        out.push_str(&bind_directive_suffix_seg(
            bind,
            source,
            element_var,
            parent_tag,
            use_ts_syntax,
        ));
    }
    out
}

/// Per-attribute variant of [`build_bind_directive_suffix`]: returns the
/// suffix string for a single `bind:` directive. Used both by the grouped
/// builder above and by the source-order unified element-suffix builder.
pub(crate) fn bind_directive_suffix_seg(
    bind: &BindDirective,
    source: &str,
    element_var: Option<&str>,
    parent_tag: &str,
    use_ts_syntax: bool,
) -> String {
    let mut out = String::new();
    {
        // Svelte 5 function binding `bind:foo={getFn, setFn}`: the get/set
        // pair is checked via `__sveltets_2_get_set_binding(...)` in the
        // attribute list, so the one-way / group / generic type-widener
        // suffixes (all guarded by `if (!isGetSetBinding)` upstream) are
        // skipped. `bind:this={getFn, setFn}` instead invokes the setter
        // with the element instance: `(setFn)(var);` (mirrors Binding.ts).
        if let Some((_, (ss, se))) = get_set_binding_ranges(&bind.expression, source) {
            if bind.name == "this"
                && let Some(var) = element_var
            {
                let _ = write!(
                    out,
                    "({})({});",
                    slice_src(source, ss as usize, se as usize),
                    var
                );
            }
            return out;
        }
        // Every branch here emits `expr` as an assignment LHS, so a trailing TS
        // assertion must be stripped (mirrors upstream `getEnd(attr.expression)`).
        let expr_text = get_binding_lhs_text(&bind.expression, source);
        if bind.name == "this" {
            if let Some(var) = element_var {
                // A trailing TS postfix on the bind expression
                // (`bind:this={el as HTMLElement}`) moves onto the RHS var:
                // `el = $$_var as HTMLElement;` (mirrors Binding.ts appending
                // `[getEnd, expression.end]` after the assignment).
                let postfix = get_expression_range(&bind.expression)
                    .map(|(_, e)| {
                        let ge =
                            get_expression_end_stripping_ts(&bind.expression, source).unwrap_or(e);
                        let ee = extend_expr_end_with_ts_postfix(source, e, bind.end);
                        slice_src(source, ge as usize, ee as usize)
                    })
                    .unwrap_or("");
                let _ = write!(out, "{} = {}{};", expr_text, var, postfix);
            }
        } else if bind.name == "group" && parent_tag == "input" {
            // `bind:group` on `<input>` only gets a type-widening
            // assignment; mirrors the dedicated branch in
            // `htmlxtojsx_v2/nodes/Binding.ts::handleBinding`.
            let _ = write!(out, "{} = __sveltets_2_any(null);", expr_text);
        } else if let Some(ty) = one_way_binding_not_on_element_type(&bind.name) {
            // `Binding.ts`'s `useTypescriptSyntax`. A TS assertion in a shadow
            // emitted as JavaScript is a SYNTAX error (TS8016), which suppresses
            // every semantic diagnostic in the program.
            let value = if use_ts_syntax {
                format!("null as {}", ty)
            } else {
                format!("/** @type {{{}}} */ (null)", ty)
            };
            let _ = write!(
                out,
                "{}= /*\u{03A9}ignore_start\u{03A9}*/{}/*\u{03A9}ignore_end\u{03A9}*/;",
                expr_text, value
            );
        } else if is_one_way_binding_attribute(&bind.name) {
            if let Some(var) = element_var {
                let _ = write!(out, "{}= {}.{};", expr_text, var, bind.name);
            }
        } else {
            // Generic two-way binding: type-widener so TS doesn't infer
            // an overly-narrow type.
            let _ = write!(
                out,
                "/*\u{03A9}ignore_start\u{03A9}*/() => {} = __sveltets_2_any(null);/*\u{03A9}ignore_end\u{03A9}*/",
                expr_text
            );
        }
    }
    out
}

/// Whether any `bind:` directive on this element forces a `const $$_xxx = …`
/// declaration of the createElement value.
pub(crate) fn any_bind_needs_element_var(attributes: &[Attribute], source: &str) -> bool {
    attributes.iter().any(|attr| {
        matches!(attr, Attribute::BindDirective(b)
            if bind_needs_element_var(&b.name)
                // A get/set binding on a one-way binding *attribute*
                // (`bind:clientWidth={get, set}`) is kept as a
                // `"bind:…": __sveltets_2_get_set_binding(…)` prop, so it needs
                // no element var. `bind:this` always needs the element var
                // (even as get/set — it's applied as `(setter)(elementVar)`).
                && (b.name == "this"
                    || get_set_binding_ranges(&b.expression, source).is_none()))
    })
}

/// The `$$_<base><depth>` element-variable base for a tag, mirroring official
/// `Element.ts`'s constructor: the colon-bearing special elements
/// (`svelte:window` → `sveltewindow`, …) drop the colon; `svelte:element` →
/// `svelteelement`; `slot` → `slot`; everything else (including `svelte:document`)
/// goes through `sanitizePropName` (so `svelte:document` → `svelte_document`).
pub(crate) fn element_var_base_name(name: &str) -> String {
    match name {
        "svelte:options" | "svelte:head" | "svelte:window" | "svelte:body" | "svelte:fragment" => {
            format!("svelte{}", &name["svelte:".len()..])
        }
        "svelte:element" => "svelteelement".to_string(),
        "slot" => "slot".to_string(),
        _ => sanitize_tag_for_var(name),
    }
}

/// Sanitize an HTML/SVG tag name for use as a JavaScript identifier:
/// replaces any non-`[A-Za-z0-9_$]` byte with `_`. Mirrors
/// `sanitizePropName` in the JS reference (sanitization rules are
/// equivalent for the tag-name use case here).
pub(crate) fn sanitize_tag_for_var(name: &str) -> String {
    name.chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
                c
            } else {
                '_'
            }
        })
        .collect()
}
