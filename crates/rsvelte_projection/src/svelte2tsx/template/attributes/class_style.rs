//! `class:` / `style:` directives.
//! Mirrors `htmlxtojsx_v2/nodes/Class.ts` and `StyleDirective.ts`.

use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, ClassDirective, StyleDirective,
};
use crate::svelte2tsx::template::segs::{Seg, segs_push_lit, segs_push_src};
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};

/// Lower `class:` / `style:` directives as statements appended *after* the
/// element's `svelteHTML.createElement(...)` call, instead of as keys in the
/// (typed) props object. Mirrors upstream `htmlxtojsx_v2/nodes/Class.ts`
/// (`class:xx={yyy}` → `yyy;`) and `StyleDirective.ts`
/// (`style:xx={yy}` → `__sveltets_2_ensureType(String, Number, yy);`). The
/// expression chunks are preserved as `Seg::Src` so type errors map back to
/// the original column.
pub(crate) fn build_class_style_directive_suffix_segments(
    attributes: &[Attribute],
    source: &str,
) -> Vec<Seg> {
    let mut out: Vec<Seg> = Vec::new();
    for attr in attributes {
        if let Some(segs) = class_style_directive_seg(attr, source) {
            out.extend(segs);
        }
    }
    out
}

/// Per-attribute variant of [`build_class_style_directive_suffix_segments`]:
/// returns the suffix segments for a single `class:` / `style:` directive (or
/// `None` for any other attribute). Used both by the grouped builder above and
/// by the source-order unified element-suffix builder so each directive can be
/// interleaved with `transition:` / `bind:` statements at its own position.
pub(crate) fn class_style_directive_seg(attr: &Attribute, source: &str) -> Option<Vec<Seg>> {
    let mut out: Vec<Seg> = Vec::new();
    match attr {
        Attribute::ClassDirective(class) => {
            // `class:xx={expr}` → `expr;` — type-check the toggle
            // expression as a standalone statement.
            if let Some((s, e)) = get_expression_range(&class.expression) {
                segs_push_src(&mut out, s, e);
            } else {
                segs_push_lit(&mut out, get_expression_text(&class.expression, source));
            }
            segs_push_lit(&mut out, ";");
        }
        Attribute::StyleDirective(style) => {
            // `style:xx={expr}` → `__sveltets_2_ensureType(String, Number, expr);`
            segs_push_lit(&mut out, "__sveltets_2_ensureType(String, Number, ");
            match &style.value {
                AttributeValue::True(_) => {
                    // Shorthand `style:color` → `…, color);` (implicit
                    // reference to the `color` binding; synthesised from
                    // the directive name, so no source range to pin).
                    segs_push_lit(&mut out, &style.name);
                }
                AttributeValue::Expression(expr) => {
                    if let Some((s, e)) = get_expression_range(&expr.expression) {
                        segs_push_src(&mut out, s, e);
                    } else {
                        segs_push_lit(&mut out, get_expression_text(&expr.expression, source));
                    }
                }
                // Mirrors upstream StyleDirective.ts. svelte2tsx moves the
                // value range into the element's attrs object, so the
                // ensureType reference is left with the BLANKED text — every
                // static text run collapses to a single space. Hence:
                //   `style:x="red"`  → `, " ");`            (single text → " ")
                //   `style:x={y}`    → `, y);`              (single expr → bare)
                //   `style:x="a{b}"` → `, ` ${b}`);`        (text→space, expr kept)
                // Empty value (`style:--c=""`): official emits the empty
                // string `""` (single-Text branch with a zero-length text
                // range), not an empty template literal.
                AttributeValue::Sequence(parts) if parts.is_empty() => {
                    segs_push_lit(&mut out, "\"\"");
                }
                AttributeValue::Sequence(parts) if parts.len() == 1 => match &parts[0] {
                    AttributeValuePart::Text(_) => {
                        segs_push_lit(&mut out, "\" \"");
                    }
                    AttributeValuePart::ExpressionTag(expr) => {
                        if let Some((s, e)) = get_expression_range(&expr.expression) {
                            segs_push_src(&mut out, s, e);
                        } else {
                            segs_push_lit(&mut out, get_expression_text(&expr.expression, source));
                        }
                    }
                },
                AttributeValue::Sequence(parts) => {
                    // Multi-part: a template literal. Official blanks each
                    // static text run to ONLY its whitespace chars (the
                    // element processing overwrites the non-whitespace), so
                    // `rgb({c}, 0, 0)` → `` ` ${c}  ` `` (", 0, 0)" keeps its
                    // two spaces). A run with no whitespace collapses to a
                    // single space.
                    segs_push_lit(&mut out, "`");
                    for part in parts {
                        match part {
                            AttributeValuePart::Text(t) => {
                                let ws: String =
                                    t.data.chars().filter(|c| c.is_whitespace()).collect();
                                segs_push_lit(&mut out, if ws.is_empty() { " " } else { &ws });
                            }
                            AttributeValuePart::ExpressionTag(expr) => {
                                segs_push_lit(&mut out, "${");
                                if let Some((s, e)) = get_expression_range(&expr.expression) {
                                    segs_push_src(&mut out, s, e);
                                } else {
                                    segs_push_lit(
                                        &mut out,
                                        get_expression_text(&expr.expression, source),
                                    );
                                }
                                segs_push_lit(&mut out, "}");
                            }
                        }
                    }
                    segs_push_lit(&mut out, "`");
                }
            }
            segs_push_lit(&mut out, ");");
        }
        _ => return None,
    }
    Some(out)
}

/// Format a class directive: `class:active={expr}` → `"class:active":expr,`
pub(crate) fn format_class_directive(class: &ClassDirective, source: &str) -> String {
    let expr_text = get_expression_text(&class.expression, source);
    format!("\"class:{}\":{},", class.name, expr_text)
}

/// Format a style directive: `style:color={expr}` → `"style:color":expr,`
pub(crate) fn format_style_directive(style: &StyleDirective, source: &str) -> String {
    match &style.value {
        AttributeValue::True(_) => {
            // Shorthand: `style:color` → `"style:color":color,`
            format!("\"style:{}\":{},", style.name, style.name)
        }
        AttributeValue::Expression(expr) => {
            let expr_text = get_expression_text(&expr.expression, source);
            format!("\"style:{}\":{},", style.name, expr_text)
        }
        AttributeValue::Sequence(parts) => {
            let mut value_parts = Vec::new();
            for part in parts {
                match part {
                    AttributeValuePart::Text(text) => {
                        // Escape backslash first so `\n` / `\t` in raw text
                        // (e.g. a Windows path) stay literal. H-091.
                        let escaped = text
                            .raw
                            .replace('\\', "\\\\")
                            .replace('`', "\\`")
                            .replace('$', "\\$");
                        value_parts.push(escaped);
                    }
                    AttributeValuePart::ExpressionTag(expr) => {
                        let expr_text = get_expression_text(&expr.expression, source);
                        value_parts.push(format!("${{{}}}", expr_text));
                    }
                }
            }
            format!("\"style:{}\":`{}`,", style.name, value_parts.join(""))
        }
    }
}
