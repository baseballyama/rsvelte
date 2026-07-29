use unicode_width::UnicodeWidthStr;

use super::format_core::format_expr_core;
use crate::error::FormatError;
use crate::options::FormatOptions;

// ─── Expression formatter ───────────────────────────────────────────────

/// Re-format a content-tag expression (already extracted from `{…}` / `{@html …}`)
/// at an explicit `width`, then push its continuation lines out to `indent_cols`
/// columns. Used by the collapse pass to wrap a block element's sole content-tag
/// child onto its own line (`<h1>`\n`  {@html foo.bar(`\n`    …`\n`  )}`\n`</h1>`).
pub(crate) fn reformat_content_at_width(
    expr_source: &str,
    options: &FormatOptions,
    width: usize,
    indent_cols: usize,
) -> Result<String, FormatError> {
    let lw = oxc_formatter_core::LineWidth::try_from(width.max(1) as u16)
        .unwrap_or(options.js.line_width);
    let formatted = format_expr_core(expr_source, options, lw, false)?;
    if !formatted.contains('\n') {
        return Ok(formatted);
    }
    let prefix = if options.js.indent_style.is_tab() {
        "\t".repeat(indent_cols / options.js.indent_width.value() as usize)
    } else {
        " ".repeat(indent_cols)
    };
    Ok(crate::reindent::reindent(&formatted, &prefix, true))
}

/// Format an attribute / directive value expression (`bind:value={ … }`) at
/// the configured width. Attribute-position wrapping is owned by the open-tag
/// rewrite in [`crate::markup`], so this applies no markup-depth adjustment.
pub(crate) fn format_expression_source(
    expr_source: &str,
    options: &FormatOptions,
) -> Result<String, FormatError> {
    format_expr_core(expr_source, options, options.js.line_width, false)
}

/// Format an attribute / directive value expression, narrowing the print
/// width by the attribute's nesting depth (`attr_depth` indent levels). The
/// value is formatted at column 0 but rendered at `attr_depth` once the open
/// tag wraps, so a value that "fits" at column 0 but overflows once nested
/// must break — narrowing the width makes the break decision land where
/// prettier-plugin-svelte puts it (#795). Unlike [`format_content_expression`],
/// this does NOT reindent: the open-tag rewrite (`crate::markup::render_multi_line`)
/// owns pushing continuation lines out to the attribute column.
pub(crate) fn format_attribute_value_expression(
    expr_source: &str,
    options: &FormatOptions,
    attr_depth: usize,
    extra_lead: usize,
) -> Result<String, FormatError> {
    // Narrow by the attribute's nesting indent (`attr_depth` levels) plus any
    // `extra_lead` columns the caller adds — e.g. the `name={` prefix once the
    // open tag is known to wrap, so a long value breaks where prettier puts it
    // (#795).
    let indent_width = options.js.indent_width.value() as usize;
    let indent_cols = attr_depth * indent_width;
    let line_width_val = options.js.line_width.value() as usize;
    let lead = indent_cols + extra_lead;
    // When `extra_lead` alone would already push the first character past the
    // print width, the expression is guaranteed to overflow. Use the
    // continuation-line width (`line_width - indent_cols`) instead of
    // `line_width - lead` (which would be zero or negative) so that OXC still
    // applies sensible wrapping to the expression's own internal structure —
    // e.g. a ternary inside a string-sequence attribute breaks at `?`/`:`.
    let narrowed = if lead >= line_width_val {
        line_width_val.saturating_sub(indent_cols)
    } else {
        line_width_val - lead
    };
    let line_width = oxc_formatter_core::LineWidth::try_from(narrowed.max(1) as u16)
        .unwrap_or(options.js.line_width);
    format_expr_core(expr_source, options, line_width, false)
}

/// Format an attribute / directive value expression at an explicit print
/// `width` (in columns), formatted at column 0 (no reindent). Used by the
/// whole-value Doc model (`crate::markup`) to produce an interpolation's `flat`
/// form (at the widest line OXC allows) and its `broken` form (at the width
/// that forces the break the enclosing group already decided on).
pub(crate) fn format_attribute_value_expression_at_width(
    expr_source: &str,
    options: &FormatOptions,
    width: usize,
) -> Result<String, FormatError> {
    let lw = oxc_formatter_core::LineWidth::try_from(width.max(1) as u16)
        .unwrap_or(options.js.line_width);
    format_expr_core(expr_source, options, lw, false)
}

/// Format an attribute / directive value expression onto a single line,
/// regardless of length — the `RawExpr` flat variant for the whole-value Doc
/// model. Formats at the widest line OXC allows so a long ternary / member
/// chain does not split.
pub(crate) fn format_attribute_value_expression_flat(
    expr_source: &str,
    options: &FormatOptions,
) -> Result<String, FormatError> {
    let wide = oxc_formatter_core::LineWidth::MAX as usize;
    format_attribute_value_expression_at_width(expr_source, options, wide)
}

/// Format a block-header expression (`{#if cond}`, `{#each items …}`) onto a
/// single line. prettier-plugin-svelte never breaks a block tag's expression
/// across lines regardless of width, so format at the widest line the
/// formatter allows (`LineWidth::MAX`) with `Expand::Never` so neither a long
/// binary chain nor a magic-comma object splits the block header.
pub(super) fn format_inline_expression(
    expr_source: &str,
    options: &FormatOptions,
) -> Result<String, FormatError> {
    let wide = oxc_formatter_core::LineWidth::try_from(oxc_formatter_core::LineWidth::MAX)
        .unwrap_or(options.js.line_width);
    format_expr_core(expr_source, options, wide, true)
}

/// Format a content expression (`{expr}`) that renders at markup nesting `depth`.
///
/// The body is formatted at indent 0, so a wrap decision made against the full
/// `line_width` ignores the `depth` levels of indent it will sit at once
/// spliced — a line that "fits" at column 0 overflows once nested. Narrow the
/// width by that lead so breaks land where prettier-plugin-svelte puts them,
/// then push every continuation line out to the nesting depth (the first line
/// stays inline after the opening `{`).
pub(super) fn format_content_expression(
    expr_source: &str,
    options: &FormatOptions,
    depth: usize,
) -> Result<String, FormatError> {
    format_content_expression_with_prefix(expr_source, options, depth, 1)
}

/// Like [`format_content_expression`] but with an explicit `prefix_lead` that
/// accounts for any extra characters before the expression on the same line.
/// For a plain `{expr}`, `prefix_lead` is 1 (just the `{`). For `{@render e}`
/// or `{@html e}`, the prefix is `{@render ` / `{@html ` (e.g. 9 / 7 chars),
/// so `prefix_lead` should be `"{".len() + keyword.len() + " ".len()`.
///
/// This only affects the overflow re-check (the second `format_expr_core` call)
/// — the first-pass width is the same as [`format_content_expression`] so that
/// OXC's internal decision to expand objects/arrays is unchanged. The re-check
/// detects when a single-line result would overflow once the full prefix is
/// accounted for, and re-formats at the correct narrower width.
pub(super) fn format_content_expression_with_prefix(
    expr_source: &str,
    options: &FormatOptions,
    depth: usize,
    prefix_lead: usize,
) -> Result<String, FormatError> {
    let indent_width = options.js.indent_width.value() as usize;
    let lead = depth * indent_width;
    let full_width = options.js.line_width.value() as usize;
    // First-pass width: same as format_content_expression (narrowed only by indent).
    let narrowed = full_width.saturating_sub(lead);
    let line_width = oxc_formatter_core::LineWidth::try_from(narrowed.max(1) as u16)
        .unwrap_or(options.js.line_width);
    let formatted = format_expr_core(expr_source, options, line_width, false)?;
    // Overflow re-check: a single-line result that overflows when the actual
    // prefix (braces + keyword) is counted must be re-formatted at a narrower
    // width so OXC breaks it the same way prettier-plugin-svelte does.
    // `overhead` = prefix_lead (e.g. `{@render ` = 9) + 1 (closing `}`).
    let overhead = prefix_lead + 1;
    let first_line_width =
        UnicodeWidthStr::width(formatted.lines().next().unwrap_or(formatted.as_str()));
    let formatted = if lead + overhead + first_line_width > full_width {
        let narrowed2 = full_width.saturating_sub(lead + overhead);
        let lw2 = oxc_formatter_core::LineWidth::try_from(narrowed2.max(1) as u16)
            .unwrap_or(options.js.line_width);
        format_expr_core(expr_source, options, lw2, false)?
    } else {
        formatted
    };
    if !formatted.contains('\n') {
        return Ok(formatted);
    }
    let prefix = if options.js.indent_style.is_tab() {
        "\t".repeat(depth)
    } else {
        " ".repeat(lead)
    };
    Ok(crate::reindent::reindent(&formatted, &prefix, true))
}
