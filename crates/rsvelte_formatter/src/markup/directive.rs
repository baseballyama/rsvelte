use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::SpreadAttribute;

use crate::error::FormatError;
use crate::expression::format_attribute_value_expression;
use crate::options::FormatOptions;

use super::attribute::minimal_break_extra;
use super::value::is_shallow_value;
use crate::width::{VisualWidth, tab_width};

pub(super) fn render_spread(
    spread: &SpreadAttribute,
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<String, FormatError> {
    // Read the raw source between `{...` and `}` so that a TypeScript cast
    // like `{...restProps as any}` is preserved verbatim — the parser narrows
    // the expression span down to just the identifier, silently dropping `as T`.
    // This mirrors the `format_directive_value` approach for directive TS casts
    // (#682).  Fall back to the AST-expression path when the source braces can't
    // be located.
    let raw_inner = source
        .get(spread.start as usize..spread.end as usize)
        .and_then(|s| {
            // Strip leading `{...` (4 bytes) and trailing `}` (1 byte).
            s.strip_prefix("{...").and_then(|s| s.strip_suffix('}'))
        })
        .map(str::trim);
    let inner = if let Some(raw) = raw_inner.filter(|s| !s.is_empty()) {
        crate::expression::format_attribute_value_expression(raw, options, attr_depth, 0)?
    } else {
        format_expression_at(source, &spread.expression, options, attr_depth)?.unwrap_or_default()
    };
    Ok(format!("{{...{inner}}}"))
}

pub(super) fn render_modifiers<S: AsRef<str>>(modifiers: &[S]) -> String {
    if modifiers.is_empty() {
        return String::new();
    }
    let mut out = String::new();
    for m in modifiers {
        out.push('|');
        out.push_str(m.as_ref());
    }
    out
}

/// Slice the expression's source span, trim it, and format. Returns
/// `None` if the span is missing or empty.
/// Format a directive's `{ EXPR }` value. Prefers the source-brace slice
/// ([`crate::expression::format_directive_value`]) so a TS cast the parser
/// narrows away — `bind:value={value as string}` → bare `value` node — is
/// preserved verbatim (#682), and falls back to the bare-node formatter when
/// the value braces can't be located. `value_end` is the directive node's
/// `end` (just past the closing `}`).
pub(super) fn render_directive_value(
    source: &str,
    expr: &Expression,
    value_end: u32,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<String, FormatError> {
    if let Some(s) =
        crate::expression::format_directive_value(source, expr, value_end, options, attr_depth)?
    {
        return Ok(s);
    }
    Ok(format_expression_at(source, expr, options, attr_depth)?.unwrap_or_default())
}

/// Like `render_directive_value` but re-narrows single-line values that would
/// overflow the line when preceded by `prefix` characters at the attribute
/// indent column. Only re-narrows when `narrow_value` is true (i.e. the open
/// tag has already been broken to multi-line). Unlike plain attribute values,
/// directive values include arrow-function handlers (`on:click={(e) => ...}`)
/// which prettier also re-narrows, so we do not apply the `is_shallow_value`
/// guard that the plain-attribute path uses.
pub(super) fn render_directive_value_narrow(
    source: &str,
    expr: &Expression,
    value_end: u32,
    options: &FormatOptions,
    attr_depth: usize,
    narrow_value: bool,
    prefix: usize,
) -> Result<String, FormatError> {
    let tw = tab_width(options);
    let formatted = render_directive_value(source, expr, value_end, options, attr_depth)?;
    if narrow_value && !formatted.contains('\n') {
        let indent_cols = attr_depth * options.js.indent_width.value() as usize;
        let line_width = options.js.line_width.value() as usize;
        // `{` + formatted + `}` = 1 brace on each side
        if indent_cols + prefix + 1 + formatted.visual_width(tw) + 1 > line_width {
            // For shallow (non-block) values use `prefix + 1` (the `{` counts
            // against the first-line budget and the value has no multi-line
            // continuation, so narrowing by the full prefix + brace is safe).
            //
            // For arrow-function values the body sits on the next line at
            // `+indent_width` relative to the expression, which the final
            // re-indent pass lifts to `attr_indent + indent_width` in the
            // template. The effective available width for the body is
            // `line_width - (attr_indent + indent_width)`, which is
            // `line_width - attr_indent - prefix + (prefix - indent_width)`.
            // Using `extra_lead = prefix - indent_width` (instead of `prefix`)
            // leaves the body exactly one indent level of room, preventing
            // over-narrow breakage of nested object / array arguments.
            let indent_width = options.js.indent_width.value() as usize;
            // An expression-bodied arrow must split after `=>`; `prefix -
            // indent_width` yields `narrowed = inline_len` (fits exactly, off by
            // one), so use the minimal-break width instead.
            let is_expr_arrow = formatted.contains("=>")
                && formatted
                    .split_once("=>")
                    .is_some_and(|(_, body)| !body.trim_start().starts_with('{'));
            let extra_lead = if is_shallow_value(&formatted) {
                prefix + 1
            } else if is_expr_arrow {
                let base_width = line_width.saturating_sub(indent_cols);
                minimal_break_extra(base_width, formatted.visual_width(tw))
            } else {
                prefix.saturating_sub(indent_width)
            };
            if let Some(s) = crate::expression::format_directive_value_extra(
                source, expr, value_end, options, attr_depth, extra_lead,
            )? {
                return Ok(s);
            }
        }
    }
    Ok(formatted)
}

pub(super) fn format_expression_at(
    source: &str,
    expr: &Expression,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<Option<String>, FormatError> {
    format_expression_at_extra(source, expr, options, attr_depth, 0)
}

pub(super) fn format_expression_at_extra(
    source: &str,
    expr: &Expression,
    options: &FormatOptions,
    attr_depth: usize,
    extra_lead: usize,
) -> Result<Option<String>, FormatError> {
    let (Some(start), Some(end)) = (expr.start(), expr.end()) else {
        return Ok(None);
    };
    let raw = source
        .get(start as usize..end as usize)
        .unwrap_or("")
        .trim();
    if raw.is_empty() {
        return Ok(None);
    }
    Ok(Some(format_attribute_value_expression(
        raw, options, attr_depth, extra_lead,
    )?))
}
