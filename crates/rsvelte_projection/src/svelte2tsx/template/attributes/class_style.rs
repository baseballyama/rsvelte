//! `class:` / `style:` directives.
//! Mirrors `htmlxtojsx_v2/nodes/Class.ts` and `StyleDirective.ts`.

use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, ClassDirective, StyleDirective,
};
use crate::svelte2tsx::template::segs::{Seg, segs_push_lit, segs_push_src};
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};

/// The character class upstream's blanking preserves is JavaScript's `\s`,
/// which is neither `char::is_whitespace` (that misses U+FEFF and adds U+0085)
/// nor ASCII whitespace. Measured against the official svelte2tsx on all 26
/// candidates, U+2000-U+200A included.
fn is_js_whitespace(c: char) -> bool {
    matches!(
        c,
        '\u{9}'
            | '\u{a}'
            | '\u{b}'
            | '\u{c}'
            | '\u{d}'
            | '\u{20}'
            | '\u{a0}'
            | '\u{1680}'
            | '\u{2000}'
            ..='\u{200a}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202f}'
                | '\u{205f}'
                | '\u{3000}'
                | '\u{feff}'
    )
}

/// What a static text run of a `style:` value is left as once the element
/// transform has moved the attribute out: its whitespace characters, in order.
/// A non-empty run with no whitespace collapses to one space; an empty run
/// stays empty, which is what makes `style:x=""` print `""` and not `" "`.
fn blanked_text_run(text: &str) -> String {
    let ws: String = text.chars().filter(|c| is_js_whitespace(*c)).collect();
    if ws.is_empty() && !text.is_empty() {
        " ".to_string()
    } else {
        ws
    }
}

/// The quote upstream wraps a single-text `style:` value in: the source's own
/// quote character, defaulting to `"` for an unquoted value. Read from the
/// character after the directive's `=` so the empty value (`style:x=''`), which
/// has no text run to look behind, answers from the same place.
fn style_value_quote(style: &StyleDirective, source: &str) -> char {
    let (start, end) = (style.start as usize, style.end as usize);
    let Some(span) = source.get(start..end) else {
        return '"';
    };
    span.find('=')
        .and_then(|i| span[i + 1..].chars().next())
        .filter(|q| *q == '"' || *q == '\'')
        .unwrap_or('"')
}

/// Lower `class:` / `style:` directives as statements appended *after* the
/// element's `svelteHTML.createElement(...)` call, instead of as keys in the
/// (typed) props object. Mirrors upstream `htmlxtojsx_v2/nodes/Class.ts`
/// (`class:xx={yyy}` → `yyy;`) and `StyleDirective.ts`
/// (`style:xx={yy}` → `__sveltets_2_ensureType(String, Number, yy);`). The
/// expression chunks are preserved as `Seg::Src` so type errors map back to
/// the original column.
pub fn build_class_style_directive_suffix_segments(
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
pub fn class_style_directive_seg(attr: &Attribute, source: &str) -> Option<Vec<Seg>> {
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
                // ensureType reference is left with the BLANKED text:
                //   `style:x="red"`     → `, " ");`
                //   `style:x="a  b"`    → `, "  ");`  (whitespace survives)
                //   `style:x='red'`     → `, ' ');`   (the source's own quote)
                //   `style:x=""`        → `, "");`    (an empty run stays empty)
                //   `style:x={y}`       → `, y);`
                //   `style:x="a{b}"`    → `, ` ${b}`);`
                AttributeValue::Sequence(parts) if parts.is_empty() => {
                    let q = style_value_quote(style, source);
                    segs_push_lit(&mut out, &format!("{q}{q}"));
                }
                AttributeValue::Sequence(parts) if parts.len() == 1 => match &parts[0] {
                    AttributeValuePart::Text(text) => {
                        let q = style_value_quote(style, source);
                        segs_push_lit(&mut out, &format!("{q}{}{q}", blanked_text_run(&text.data)));
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
                                segs_push_lit(&mut out, &blanked_text_run(&t.data));
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
pub fn format_class_directive(class: &ClassDirective, source: &str) -> String {
    let expr_text = get_expression_text(&class.expression, source);
    format!("\"class:{}\":{},", class.name, expr_text)
}

/// Format a style directive: `style:color={expr}` → `"style:color":expr,`
pub fn format_style_directive(style: &StyleDirective, source: &str) -> String {
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
                        value_parts.push(format!("${{{expr_text}}}"));
                    }
                }
            }
            format!("\"style:{}\":`{}`,", style.name, value_parts.join(""))
        }
    }
}
