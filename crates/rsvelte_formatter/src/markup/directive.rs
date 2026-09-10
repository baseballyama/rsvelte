use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::SpreadAttribute;

use crate::error::FormatError;
use crate::expression::format_attribute_value_expression;
use crate::options::FormatOptions;

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

/// Like `render_directive_value` but, once the open tag is known to wrap
/// (`narrow_value`), re-formats a single-line value that would overflow its
/// attribute line. The `name={` prefix is charged to the value's first line
/// only: prettier measures each group against the column it starts at, so a
/// continuation line has the whole width minus its own indent, and charging
/// the prefix to it re-breaks a line that fits (#4119).
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
        if indent_cols + prefix + 1 + formatted.visual_width(tw) + 1 > line_width
            && let Some(s) = crate::expression::format_directive_value_offset(
                source,
                expr,
                value_end,
                options,
                attr_depth,
                prefix + 1,
            )?
        {
            return Ok(s);
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
