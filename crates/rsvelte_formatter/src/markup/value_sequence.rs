use oxc_formatter::QuoteStyle;
use rsvelte_core::ast::template::AttributeValuePart;

use crate::doc::{Doc, print as doc_print, propagate_breaks};
use crate::error::FormatError;
use crate::expression::{
    expand_obj_arg_call, format_attribute_value_expression,
    format_attribute_value_expression_at_width, format_attribute_value_expression_flat,
};
use crate::options::FormatOptions;

use super::attribute::minimal_break_extra;
use super::util::{indent_str, visual_width};
use super::value::{expression_tag_inner, is_shallow_value};

/// Build the Doc for one literal-text chunk of a REGULAR quoted attribute
/// value, plus its flat visual width. prettier-plugin-svelte emits regular
/// attribute-value text VERBATIM (unlike element-children text, it is not run
/// through `splitTextToDocs` / `printWhitespace`, so it carries no `line` break
/// points) — confirmed by dumping the printer's Doc. So the chunk is a single
/// non-breaking `Text`; all breaking happens inside the interpolation groups.
/// (Style-directive values differ — their text IS a `fill` — and are excluded
/// from this path.)
fn attr_text_chunk_doc(raw: &str) -> (Doc, usize) {
    (Doc::Text(raw.to_string()), visual_width(raw))
}

/// Whole-value Doc model for a REGULAR quoted attribute value: format the
/// entire value as one measured Doc (literal text verbatim, each `{expr}`
/// interpolation a `group([RawExpr])`) and print it in Break mode. The engine's
/// `fits` measures a trailing *breakable* interpolation only up to its first
/// break point (mirroring prettier's group-with-softline), so which
/// interpolation breaks matches prettier-plugin-svelte's greedy left-to-right
/// layout: an earlier interpolation stays flat whenever a later one can break
/// to absorb the overflow, and breaks only when everything after it up to the
/// first later break point still overflows.
///
/// Returns `None` (fall through to the legacy string path) when the value is
/// not eligible:
///  - fewer than two interpolations;
///  - any literal text spanning multiple source lines (a multi-line string
///    value — Cluster 7, handled by the legacy reindent path);
///  - a breakable interpolation with a block-bodied expansion (object / array /
///    arrow, or a call whose broken first line ends with `(` / `{` / `[`) —
///    its continuation lines sit at the attribute indent with full width, not
///    the +2 relative indent this RawExpr model assumes;
///  - no breakable interpolation at all (the value can only render flat, and
///    the legacy path's flat output is authoritative).
fn render_value_sequence_doc(
    parts: &[AttributeValuePart],
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
    name_prefix: usize,
) -> Result<Option<String>, FormatError> {
    let interp_count = parts
        .iter()
        .filter(|p| matches!(p, AttributeValuePart::ExpressionTag(_)))
        .count();
    if interp_count < 2 {
        return Ok(None);
    }
    if parts
        .iter()
        .any(|p| matches!(p, AttributeValuePart::Text(t) if t.raw.contains('\n')))
    {
        return Ok(None);
    }

    let indent_width = options.js.indent_width.value() as usize;
    let indent_cols = attr_depth * indent_width;
    let line_width = options.js.line_width.value() as usize;
    let start_col = indent_cols + name_prefix;

    // Embedded string literals prefer single quotes so they don't clash with
    // the `"` delimiter (`{x ?? ''}`), matching the legacy path.
    let mut opts_sq = options.clone();
    opts_sq.js.quote_style = QuoteStyle::Single;

    let mut docs: Vec<Doc> = Vec::with_capacity(parts.len());
    let mut breakable_count = 0usize;
    // Running flat column, so each interpolation's `broken` form is formatted at
    // its true (all-preceding-flat) start column.
    let mut col = start_col;
    for part in parts {
        match part {
            AttributeValuePart::Text(t) => {
                let (doc, w) = attr_text_chunk_doc(t.raw.as_ref());
                docs.push(doc);
                col += w;
            }
            AttributeValuePart::ExpressionTag(tag) => {
                let inner = expression_tag_inner(tag, source).trim();
                if inner.is_empty() {
                    docs.push(Doc::Text("{}".into()));
                    col += 2;
                    continue;
                }
                let flat_inner = format_attribute_value_expression_flat(inner, &opts_sq)?;
                let flat = format!("{{{flat_inner}}}");
                let flat_w = visual_width(&flat);
                // The enclosing group decides *whether* this interpolation
                // breaks (measuring its trailing tail); the `broken` form only
                // supplies the *shape*. Force the break at the narrower of (a)
                // the real width available at this column and (b) one column
                // under the flat form (guarantees at least the top-level
                // operator splits even when the overflow is trailing-caused).
                let flat_inner_w = visual_width(&flat_inner);
                let broken_width = line_width
                    .saturating_sub(col)
                    .min(flat_inner_w.saturating_sub(1))
                    .max(1);
                let broken_inner =
                    format_attribute_value_expression_at_width(inner, &opts_sq, broken_width)?;
                let broken = if broken_inner.contains('\n') {
                    breakable_count += 1;
                    // A block-bodied breakable value — an object / array / arrow
                    // literal (`is_shallow_value` false), or a call that expands
                    // its argument list into a bracket block (first line ends
                    // with an opening `(` / `{`) — keeps its continuation lines
                    // at the attribute indent with full width, not the +2
                    // relative indent this RawExpr model assumes, and OXC may
                    // over-expand it at the forced-break width. Leave those to
                    // the legacy path. A computed member access (`x[y]`, first
                    // line ends with `[`) is NOT block-bodied — it breaks cleanly
                    // as `x[` / `  y` / `]`, so it is allowed.
                    let first_line = broken_inner.lines().next().unwrap_or("").trim_end();
                    if !is_shallow_value(inner)
                        || first_line.ends_with('(')
                        || first_line.ends_with('{')
                    {
                        return Ok(None);
                    }
                    let mut lines: Vec<String> =
                        broken_inner.split('\n').map(str::to_string).collect();
                    let first = std::mem::take(&mut lines[0]);
                    lines[0] = format!("{{{first}");
                    let li = lines.len() - 1;
                    let last = std::mem::take(&mut lines[li]);
                    lines[li] = format!("{last}}}");
                    lines
                } else {
                    vec![flat.clone()]
                };
                docs.push(Doc::Group(vec![Doc::RawExpr { flat, broken }]));
                col += flat_w;
            }
        }
    }

    // Nothing breakable → the value can only render flat; leave it to the
    // legacy path (whose flat output is authoritative) rather than risk a
    // subtle divergence.
    if breakable_count == 0 {
        return Ok(None);
    }

    // Reserve one column for the closing `"` (always the last character on the
    // value's final line when the open tag wraps). Printed in Break mode (the
    // open tag has wrapped): verbatim text stays put, and each interpolation
    // group breaks or stays flat via `fits`, which measures a trailing
    // *breakable* interpolation only up to its first break — so an earlier
    // interpolation stays flat whenever a later one can absorb the overflow,
    // matching prettier-plugin-svelte.
    let width = line_width.saturating_sub(1);
    let unit = indent_str(1, &options.js);
    // The open-tag assembly emits a TEXT-led value (`class="text {…}"`,
    // `is_string_value_attr` true) VERBATIM, but re-indents an INTERPOLATION-led
    // value (`value="{…}"`) by the attribute column. So bake the absolute indent
    // into continuation lines only for the verbatim case; emit the interp-led
    // form RELATIVE (base_indent 0) so the downstream re-indent lands a broken
    // interpolation's continuation at `attr_indent + 2`, not `2*attr_indent + 2`.
    // (`fits` ignores indentation, so base_indent never changes a break decision.)
    let text_led = matches!(parts.first(), Some(AttributeValuePart::Text(t)) if !t.raw.is_empty());
    let base_indent = if text_led { attr_depth } else { 0 };
    let out = doc_print(
        &propagate_breaks(Doc::Concat(docs)),
        width,
        &unit,
        base_indent,
        start_col,
    );
    Ok(Some(out))
}

pub(super) fn render_attribute_value_sequence(
    parts: &[AttributeValuePart],
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
    name_prefix: usize,
    narrow_value: bool,
    regular_attr: bool,
) -> Result<String, FormatError> {
    // Whole-value Doc model, used only once the open tag is known to wrap (the
    // single-line pass renders flat anyway) and only for REGULAR attributes —
    // style/other directive values print their text as a prettier `fill` (a
    // different break structure), so they stay on the legacy path.
    if narrow_value
        && regular_attr
        && let Some(body) =
            render_value_sequence_doc(parts, source, options, attr_depth, name_prefix)?
    {
        return Ok(body);
    }
    // When the value starts with literal text (`"bg: {expr}"`), render_multi_line
    // treats it as a verbatim string and does NOT re-indent it, so a wrapped
    // interpolation's continuation lines must be re-indented here. When the value
    // starts with the interpolation (`"{expr}%"`), the value is not a string-value
    // attr and render_multi_line re-indents the whole thing — so don't double it.
    let value_starts_with_text =
        matches!(parts.first(), Some(AttributeValuePart::Text(t)) if !t.data.is_empty());
    let mut out = String::new();
    let mut any_expr_wrapped = false;
    for (i, part) in parts.iter().enumerate() {
        match part {
            AttributeValuePart::Text(t) => {
                // Emit the RAW source text, not the entity-decoded `data` — a value
                // like `title="&quot;"` must keep `&quot;` (decoding it to `"` would
                // prematurely close the quoted value and corrupt the markup).
                out.push_str(t.raw.as_ref());
            }
            AttributeValuePart::ExpressionTag(tag) => {
                let inner_src = expression_tag_inner(tag, source).trim();
                if inner_src.is_empty() {
                    out.push_str("{}");
                } else {
                    // The expression sits inside a double-quoted attribute
                    // (`class="…{expr}…"`); prettier prefers single quotes for
                    // its string literals so they don't clash with the `"`
                    // delimiter (`{x ?? ''}`, not `{x ?? ""}`).
                    let mut opts = options.clone();
                    opts.js.quote_style = QuoteStyle::Single;
                    // When the open tag wraps, narrow a shallow interpolated
                    // expression by the columns it can't use on its first line:
                    // everything before its `{` (the `name="` prefix plus value
                    // text already emitted on this line) AND after its `}` (the
                    // remaining literal text on the line plus the closing `"`).
                    //
                    // Same two-pass logic as `render_single_expression_value`:
                    // first format at indent-only width; if multi-line and the
                    // first line ends with `{`/`[` (expanded call-argument block),
                    // keep the wider result to avoid over-constraining inner exprs.
                    let on_line = out.rsplit('\n').next().unwrap_or(&out);
                    // A multi-line string value (`style="…\n\tleft: {expr}%;\n…"`)
                    // already carries the interpolation's physical column in the
                    // emitted leading text on its own line (the source tabs/spaces),
                    // so `lead_cols` IS the start column — the attribute's logical
                    // indent must NOT be added on top (that double-counts and
                    // over-breaks an expression that actually fits). On a single-line
                    // value the logical indent still applies.
                    let value_is_multiline = out.contains('\n');
                    let lead_cols = if value_is_multiline {
                        visual_width(on_line)
                    } else {
                        name_prefix + visual_width(on_line)
                    };
                    // `format_attribute_value_expression` narrows the print width by
                    // `attr_depth` indent levels. For a multi-line string value the
                    // interpolation's physical indent is the literal text already on
                    // its line (counted in `lead_cols`), NOT the logical attribute
                    // depth — so pass depth 0 there to avoid subtracting the indent
                    // twice (which over-breaks: e.g. a member chain wraps instead of
                    // the top-level `??`).
                    let effective_attr_depth = if value_is_multiline { 0 } else { attr_depth };
                    // Trailing columns that share the interpolation's closing-`}`
                    // LINE — i.e. literal text up to the next newline only. A
                    // multi-line string value (`style="…\n\twidth: {r * 2}px;\n…"`)
                    // keeps each interpolation on its own physical line, so text on
                    // SUBSEQUENT lines must not count toward this one's width (else a
                    // trivial `{r * 2}` is force-broken to fit a phantom-long line).
                    let mut trailing_cols = 0usize;
                    for p in &parts[i + 1..] {
                        match p {
                            AttributeValuePart::Text(t) => {
                                let raw = t.raw.as_ref();
                                if let Some(nl) = raw.find('\n') {
                                    trailing_cols += visual_width(&raw[..nl]);
                                    break;
                                }
                                trailing_cols += visual_width(raw);
                            }
                            // A following interpolation continues the same line; its
                            // width is unknown here, so (as before) count it as 0.
                            AttributeValuePart::ExpressionTag(_) => {}
                        }
                    }
                    // Whether there are trailing expression tags after this one.
                    // When true, the closing `)` of an expanded-arg form would land
                    // on a line followed by the next interpolation, producing
                    // `fn(\n  {...},\n)} {expr}` which the oracle does NOT emit.
                    let has_trailing_expr = parts[i + 1..]
                        .iter()
                        .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));
                    let first_pass = format_attribute_value_expression(
                        inner_src,
                        &opts,
                        effective_attr_depth,
                        0,
                    )?;
                    let formatted = if narrow_value && is_shallow_value(inner_src) {
                        let indent_cols = attr_depth * opts.js.indent_width.value() as usize;
                        // For a multi-line string value the physical indent is already
                        // in `lead_cols`; don't add the logical attribute indent again.
                        let effective_indent = if value_is_multiline { 0 } else { indent_cols };
                        let line_width_val = opts.js.line_width.value() as usize;
                        // Narrowing strategy: narrow only by the expression's START
                        // column (indent + prefix + `{`). When the expression wraps to
                        // multiple lines, the trailing text after `}` lands on the final
                        // continuation line — NOT the first — so it must NOT influence
                        // the first-line break decision (narrowing by the trailing width
                        // over-breaks nested calls/args). When the start-column form
                        // still fits on one line but the full assembled line overflows,
                        // force the MINIMAL break below (`force_extra`) so only the
                        // expression's top-level operator wraps, matching the oracle.
                        let extra_start = lead_cols + 1; // chars before `{`
                        if effective_indent + extra_start >= line_width_val {
                            // Expression starts at or past the print width.
                            // OXC formatted at indent-only width. When there are no
                            // trailing interpolations, apply the prettier-style
                            // outer expansion for single-object-arg calls:
                            // - Single-line `fn({ k: v })` → `fn(\n  { k: v },\n)`
                            // - Multi-line `fn({\n  k: v,\n})` → `fn(\n  {\n    k: v,\n  },\n)`
                            let indent_w = opts.js.indent_width.value() as usize;
                            if !has_trailing_expr {
                                let first_line_fp =
                                    first_pass.lines().next().unwrap_or("").trim_end();
                                // Try expansion for multi-line `fn({` form.
                                let try_expand = if first_pass.contains('\n')
                                    && (first_line_fp.ends_with('{')
                                        || first_line_fp.ends_with('['))
                                {
                                    expand_obj_arg_call(&first_pass, indent_w)
                                } else if !first_pass.contains('\n') {
                                    // Single-line `fn({ k: v })` — try outer expansion.
                                    expand_obj_arg_call(&first_pass, indent_w)
                                } else {
                                    None
                                };
                                if let Some(expanded) = try_expand {
                                    expanded
                                } else if !first_pass.contains('\n') {
                                    // Past-width but breakable (the outer guard already
                                    // ensured `is_shallow_value`): force the minimal
                                    // break so the oracle's top-level split happens.
                                    let base_width =
                                        line_width_val.saturating_sub(effective_indent);
                                    let force_extra = minimal_break_extra(
                                        base_width,
                                        visual_width(first_pass.as_str()),
                                    );
                                    let forced = format_attribute_value_expression(
                                        inner_src,
                                        &opts,
                                        effective_attr_depth,
                                        force_extra,
                                    )?;
                                    if forced.contains('\n') {
                                        forced
                                    } else {
                                        first_pass
                                    }
                                } else {
                                    first_pass
                                }
                            } else {
                                first_pass
                            }
                        } else if !first_pass.contains('\n') {
                            // Wide first-pass produced a single-line result.
                            // Check if it fits with trailing on the same line.
                            let total = effective_indent
                                + lead_cols
                                + 1
                                + visual_width(first_pass.as_str())
                                + 1
                                + trailing_cols
                                + 1;
                            if total <= line_width_val {
                                // Fits: no narrowing needed
                                first_pass
                            } else {
                                // Doesn't fit on one line. The oracle breaks the
                                // expression at its MINIMAL break point (top-level
                                // operator) and lets the trailing literal sit on the
                                // final continuation line — it never narrows by the
                                // trailing width (doing so over-breaks nested calls/args,
                                // e.g. `fieldError(form, 'fullName')` exploding into
                                // multi-line arguments). So pick the narrowest width that
                                // still keeps the expression's first line intact.
                                // First try start-column narrowing (the original approach).
                                let start_result = format_attribute_value_expression(
                                    inner_src,
                                    &opts,
                                    effective_attr_depth,
                                    extra_start,
                                )?;
                                if start_result.contains('\n') {
                                    // Start-column narrowing already breaks the expression
                                    // — use it (matches the oracle's break point for long
                                    // ternaries where the expression itself is wider than
                                    // the available space after the prefix).
                                    start_result
                                } else {
                                    // Start-column didn't break (expression fits at extra_start).
                                    // The expression is short relative to base_width but the
                                    // trailing text is enormous.  Force the minimum break:
                                    // `narrowed = expr_len - 1` so OXC breaks the expression
                                    // itself (e.g. ternary at `?`/`:` or comparison at `===`),
                                    // accepting that the trailing text may overflow on the last
                                    // continuation line.
                                    let base_width =
                                        line_width_val.saturating_sub(effective_indent);
                                    let force_extra = minimal_break_extra(
                                        base_width,
                                        visual_width(first_pass.as_str()),
                                    );
                                    let forced = format_attribute_value_expression(
                                        inner_src,
                                        &opts,
                                        effective_attr_depth,
                                        force_extra,
                                    )?;
                                    if forced.contains('\n') {
                                        forced
                                    } else {
                                        // Still can't break via width narrowing.
                                        // For `fn({ key: val })` calls without trailing
                                        // expressions, prettier-plugin-svelte expands to
                                        // `fn(\n  { key: val },\n)` — apply that.
                                        let indent_w = opts.js.indent_width.value() as usize;
                                        if !has_trailing_expr {
                                            if let Some(expanded) =
                                                expand_obj_arg_call(&start_result, indent_w)
                                            {
                                                expanded
                                            } else {
                                                start_result
                                            }
                                        } else {
                                            start_result
                                        }
                                    }
                                }
                            }
                        } else {
                            // Multi-line first-pass (at indent-only width).
                            let first_line = first_pass.lines().next().unwrap_or("").trim_end();
                            if first_line.ends_with('{') || first_line.ends_with('(') {
                                // OXC expanded a call argument block (`fn({` / `fn(`).
                                // prettier-plugin-svelte instead keeps the arg on its own
                                // line: `fn(\n  {\n    ...\n  },\n)`. Apply that transform
                                // when the expression is a single-object-arg call and
                                // there are no trailing interpolations.
                                let indent_w = opts.js.indent_width.value() as usize;
                                if !has_trailing_expr {
                                    if let Some(expanded) =
                                        expand_obj_arg_call(&first_pass, indent_w)
                                    {
                                        expanded
                                    } else {
                                        first_pass
                                    }
                                } else {
                                    first_pass
                                }
                            } else {
                                // Operator-break or computed-member-access break (`?.[`)
                                // — re-format at start-column width so the break lands
                                // where the brace column dictates (trailing text is on a
                                // subsequent line, not relevant here).
                                format_attribute_value_expression(
                                    inner_src,
                                    &opts,
                                    effective_attr_depth,
                                    extra_start,
                                )?
                            }
                        }
                    } else {
                        first_pass
                    };
                    // A wrapped interpolation's continuation lines come back at
                    // column 0+1level; push them out to the attribute column so
                    // they align under the attribute — but only when this value is
                    // a verbatim string (render_multi_line won't re-indent it).
                    let formatted = if formatted.contains('\n') && value_starts_with_text {
                        let prefix = indent_str(attr_depth, &options.js);
                        crate::reindent::reindent(&formatted, &prefix, true)
                    } else {
                        formatted
                    };
                    any_expr_wrapped |= formatted.contains('\n');
                    out.push('{');
                    out.push_str(&formatted);
                    out.push('}');
                }
            }
        }
    }
    // An interpolation-led value with a wrapped `{expr}` takes the whole-value
    // re-indent path in `render_multi_line`, which prepends the attribute indent
    // to every line. The literal whitespace BETWEEN interpolations still carries
    // its SOURCE indentation, so that re-indent would double-indent such a line.
    // Normalise it away (prettier reflows inter-interpolation whitespace to the
    // attribute column); the downstream re-indent then lands it at exactly the
    // attribute indent. Values without a wrapped expression stay verbatim.
    if any_expr_wrapped && out.starts_with('{') {
        out = normalize_interpolation_value_indent(&out);
    }
    Ok(out)
}

/// Strip the leading horizontal whitespace after a brace-depth-0 newline in an
/// interpolation-led attribute value body (`{expr}…{expr}`) **only when that
/// whitespace runs straight into the next interpolation `{`** — i.e. it is
/// purely structural whitespace between two interpolations. The downstream
/// whole-value re-indent re-establishes the attribute indent, so this source
/// indentation must not be carried through (it would be added on top), and
/// prettier reflows such inter-interpolation whitespace to the attribute column.
///
/// Depth-0 lines that carry literal content (`class="{expr}\n\tfoo bar"`) are
/// left verbatim — that is HTML attribute text whose interior whitespace is
/// significant and which the oracle preserves as-is. Lines inside `{…}` —
/// wrapped expression continuations formatted at column 0 — always keep their
/// relative indent. String / template-literal content is skipped so its braces
/// aren't miscounted and its interior newlines (multi-line template quasi) are
/// left verbatim. The brace/quote scanning mirrors
/// [`is_verbatim_interpolation_value`], so the verbatim-vs-re-indent decision
/// and this normalisation agree on depth.
fn normalize_interpolation_value_indent(value: &str) -> String {
    let chars: Vec<char> = value.chars().collect();
    let n = chars.len();
    let mut out = String::with_capacity(value.len());
    let mut depth: i32 = 0;
    let mut quote: Option<char> = None;
    let mut escaped = false;
    let mut i = 0;
    while i < n {
        let ch = chars[i];
        match quote {
            Some(q) => {
                out.push(ch);
                if escaped {
                    escaped = false;
                } else if ch == '\\' {
                    escaped = true;
                } else if ch == q {
                    quote = None;
                }
                i += 1;
            }
            None => match ch {
                '\'' | '"' | '`' if depth > 0 => {
                    quote = Some(ch);
                    out.push(ch);
                    i += 1;
                }
                '{' => {
                    depth += 1;
                    out.push(ch);
                    i += 1;
                }
                '}' => {
                    depth -= 1;
                    out.push(ch);
                    i += 1;
                }
                '\n' if depth == 0 => {
                    out.push(ch);
                    i += 1;
                    // Look past horizontal whitespace: strip it only if the next
                    // non-whitespace character opens another interpolation.
                    let mut j = i;
                    while j < n && (chars[j] == ' ' || chars[j] == '\t') {
                        j += 1;
                    }
                    if j < n && chars[j] == '{' {
                        i = j;
                    }
                }
                _ => {
                    out.push(ch);
                    i += 1;
                }
            },
        }
    }
    out
}

#[cfg(test)]
mod normalize_tests {
    use super::normalize_interpolation_value_indent;

    #[test]
    fn strips_structural_whitespace_before_next_interpolation() {
        // Whitespace between two interpolations is reflowed by the downstream
        // re-indent, so its source indentation is removed here.
        assert_eq!(
            normalize_interpolation_value_indent("{a}\n      {b}"),
            "{a}\n{b}"
        );
    }

    #[test]
    fn keeps_literal_text_line_verbatim() {
        // A depth-0 line carrying literal content (not another interpolation) is
        // significant HTML attribute text and must be left untouched.
        assert_eq!(
            normalize_interpolation_value_indent("{a}\n      foo bar"),
            "{a}\n      foo bar"
        );
    }

    #[test]
    fn does_not_touch_wrapped_expression_continuations() {
        // Newlines inside `{…}` (a wrapped expression, depth > 0) are the
        // formatter's own relative indent and are preserved as-is.
        assert_eq!(
            normalize_interpolation_value_indent("{a\n  ? b\n  : c}\n  {d}"),
            "{a\n  ? b\n  : c}\n{d}"
        );
    }

    #[test]
    fn ignores_braces_inside_strings() {
        // A `{` inside a JS string literal is not an interpolation boundary, so
        // brace depth stays correct and the following literal line is kept.
        assert_eq!(
            normalize_interpolation_value_indent("{x ?? '{'}\n      foo"),
            "{x ?? '{'}\n      foo"
        );
    }
}
