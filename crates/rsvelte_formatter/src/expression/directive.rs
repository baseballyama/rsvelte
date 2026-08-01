use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::ast::js::Expression;

use super::splice::split_leading_line_comments;
use super::{format_attribute_value_expression, formatter_parse_options};
use crate::error::FormatError;
use crate::options::FormatOptions;
use crate::width::{VisualWidth, tab_width};

/// Format a directive value `{ EXPR }` by slicing the full brace interior
/// from the source, where `value_end` is the offset just past the closing
/// `}` (the directive node's `end`).
///
/// Unlike [`crate::markup::format_expression_at`], this works from source
/// text rather than the AST expression node. The parser narrows a TS cast
/// (`{value as string}`) down to its inner identifier (`value`), so the bare
/// node span would silently drop `as string` — turning `bind:value={value as
/// string}` into `bind:value` and `class:x={v as T}` into `class:x={v}`
/// (#682). Slicing `{` … `}` from the source keeps the cast verbatim, then
/// re-parses/formats it (as TypeScript when `options.typescript`).
///
/// Falls back to `None` (caller uses the bare-node path) when the value
/// braces can't be located, so non-`{expr}` values stay on the old path.
pub(crate) fn format_directive_value(
    source: &str,
    expr: &Expression,
    value_end: u32,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<Option<String>, FormatError> {
    format_directive_value_extra(source, expr, value_end, options, attr_depth, 0)
}

pub(crate) fn format_directive_value_extra(
    source: &str,
    expr: &Expression,
    value_end: u32,
    options: &FormatOptions,
    attr_depth: usize,
    extra: usize,
) -> Result<Option<String>, FormatError> {
    let Some(inner) = directive_brace_inner(source, expr, value_end) else {
        return Ok(None);
    };
    let inner = inner.trim();
    if inner.is_empty() {
        return Ok(None);
    }
    // When the brace interior starts with a `/* … */` block comment, OXC's
    // parser+formatter would silently drop the comment (OXC attaches it to
    // the AST but does not always re-emit it).  Prettier-plugin-svelte
    // preserves the comment verbatim in such cases, so we return the raw
    // source slice unchanged.
    if inner.starts_with("/*") {
        return Ok(Some(inner.to_string()));
    }
    // When the brace interior starts with one or more `//` line comments,
    // OXC would drop them.  Prettier-plugin-svelte preserves the leading
    // comment lines and formats the remaining expression.  Extract the
    // leading comment block, format the rest, and re-attach.
    if inner.starts_with("//") {
        let (leading_comments, rest) = split_leading_line_comments(inner);
        let rest = rest.trim();
        if rest.is_empty() {
            return Ok(Some(leading_comments.trim_end_matches('\n').to_string()));
        }
        let formatted_rest = format_attribute_value_expression(rest, options, attr_depth, extra)?;
        return Ok(Some(format!("{leading_comments}{formatted_rest}")));
    }
    Ok(Some(format_attribute_value_expression(
        inner, options, attr_depth, extra,
    )?))
}

/// Locate a directive value's `{ … }` braces and return the raw inner source.
/// The opening brace is found by a whitespace-and-comment back-scan from the
/// expression start; the closing brace is the byte just before `value_end`
/// (the directive node's `end`). Returns `None` when the braces can't be
/// located (e.g. a shorthand `bind:value` with no value).
///
/// The back-scan skips `/* … */` block comments so that a leading comment
/// like `bind:value={/** ( */ expr}` is correctly included in the returned
/// inner source rather than causing `None` to be returned (#Bug-D).
fn directive_brace_inner<'a>(
    source: &'a str,
    expr: &Expression,
    value_end: u32,
) -> Option<&'a str> {
    let expr_start = expr.start()?;
    let bytes = source.as_bytes();

    // Closing brace: the directive node ends just past it.
    let end = value_end as usize;
    if end == 0 || bytes.get(end - 1) != Some(&b'}') {
        return None;
    }
    let close = end - 1;

    // Opening brace: whitespace-and-block-comment back-scan from the expression
    // start.  This handles cases like `bind:value={/** ( */ expr}` where a
    // leading `/* … */` comment sits between the `{` and the expression node.
    // Also skips `//` line comments: `on:click={// comment\n  expr}`.
    let mut open = None;
    let mut i = expr_start as usize;
    while i > 0 {
        i -= 1;
        match bytes[i] {
            b' ' | b'\t' | b'\n' | b'\r' => continue,
            b'{' => {
                open = Some(i);
                break;
            }
            // Skip over a `/* … */` block comment by scanning backward to the
            // matching `/*`.  If we find `*/` at position i, scan leftward for
            // `/*`.
            b'/' if i > 0 && bytes.get(i.wrapping_sub(1)) == Some(&b'*') => {
                // We are at the `/` of `*/`; move to the `*`.
                i -= 1; // now at `*` of `*/`
                // Scan backward until we find `/*`.
                loop {
                    if i < 2 {
                        break;
                    }
                    i -= 1;
                    if bytes[i] == b'*' && bytes.get(i.wrapping_sub(1)) == Some(&b'/') {
                        i -= 1; // now at the `/` of `/*`
                        break;
                    }
                }
                // `i` is now at the `/` of `/*` (or we hit the start of string).
                // Continue the outer loop which will decrement `i` again, skipping
                // the `/*` open.
                continue;
            }
            _ => {
                // This byte might be part of a `//` line comment.  Scan backward
                // to the start of the current line and check whether `//` appears
                // anywhere on that line before (or at) position `i`.  If it does,
                // the entire line is a comment — skip it by jumping `i` to the
                // position of the `//` so the outer `i -= 1` in the next iteration
                // lands just before `//`, and the preceding `\n` (or whitespace)
                // will be consumed by the whitespace arm.
                let line_start = bytes[..i]
                    .iter()
                    .rposition(|&b| b == b'\n')
                    .map_or(0, |p| p + 1);
                let line_slice = &bytes[line_start..=i];
                if let Some(rel) = line_slice.windows(2).position(|w| w == b"//") {
                    // `rel` is the offset of the first `/` of `//` within
                    // `line_slice`.  The absolute position is `line_start + rel`.
                    // Jump `i` to the `//` position; the next `i -= 1` will land
                    // just before `//` (or wrap-underflow if at 0, but that
                    // terminates the loop).
                    i = line_start + rel;
                    continue;
                }
                // Not a line-comment line — stop scanning.
                break;
            }
        }
    }
    let open = open?;
    if open >= close {
        return None;
    }
    source.get(open + 1..close)
}

/// Format a Svelte 5 **function binding** — `bind:value={get, set}`, whose value
/// is a top-level sequence (comma) expression — as the value part (including the
/// surrounding `{ … }`).
///
/// Unlike a mustache sequence (`{(a, b)}`, which keeps its outer parens — #799),
/// prettier-plugin-svelte prints a function binding *without* the parens and,
/// when the members don't fit on the attribute line (or any member is itself
/// multi-line), breaks the `{` / `}` onto their own lines with each member
/// indented one level (#795 sub-case b):
///
/// ```svelte
/// bind:value={
///   () => model.x ?? '',
///   (value) => {
///     model.x = value;
///   }
/// }
/// ```
///
/// Returns `None` when the value is not a top-level sequence — the caller then
/// falls back to the normal single-expression directive path. `lead_cols` is the
/// visual column at which the value's opening `{` lands once the open tag wraps
/// (`attr_depth` indent + `bind:name=` prefix), used for the inline-fit check.
pub(crate) fn format_function_binding(
    source: &str,
    expr: &Expression,
    value_end: u32,
    options: &FormatOptions,
    attr_depth: usize,
    lead_cols: usize,
) -> Result<Option<String>, FormatError> {
    use oxc_span::GetSpan;

    let tw = tab_width(options);

    let Some(inner) = directive_brace_inner(source, expr, value_end) else {
        return Ok(None);
    };
    let inner = inner.trim();
    if inner.is_empty() {
        return Ok(None);
    }
    // When the brace interior has a leading `/* … */` block comment, extract
    // the comment and format the rest as a sequence expression. prettier
    // preserves the comment and wraps the sequence in outer parens, producing
    // `{/** comment */ (m1, m2)}`.  We mirror that here so the value stays
    // single-line (no multi-line attribute value that would force the tag to
    // wrap).  If the comment extraction or sequence parse fails we fall back to
    // `None` so the caller uses the normal directive-value path.
    let leading_block_comment = if inner.starts_with("/*") {
        // Find the end of the `/* … */` comment.
        if let Some(rel) = inner.find("*/") {
            let comment = &inner[..rel + 2]; // e.g. `/** ( */`
            let rest = inner[rel + 2..].trim();
            if rest.is_empty() {
                // Comment-only value: fall back to normal path.
                return Ok(None);
            }
            Some((comment, rest))
        } else {
            // Unclosed block comment: fall back.
            return Ok(None);
        }
    } else {
        None
    };

    // The source to parse as a sequence: either the full `inner` (no leading
    // comment) or the rest after the comment.
    let seq_src = match leading_block_comment {
        Some((_, rest)) => rest,
        None => inner,
    };

    // Detect a top-level sequence and recover each member's source span.
    let allocator = crate::scratch::acquire();
    let source_type = if options.typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };
    let wrapped = format!("({seq_src});");
    let parser_ret = Parser::new(allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.diagnostics.is_empty() {
        return Ok(None);
    }
    let Some(oxc_ast::ast::Statement::ExpressionStatement(stmt)) = parser_ret.program.body.first()
    else {
        return Ok(None);
    };
    let oxc_ast::ast::Expression::SequenceExpression(seq) = &stmt.expression else {
        return Ok(None);
    };

    // Members render one level deeper than the brace line, so narrow each
    // member's wrap width by that extra level.
    let members: Vec<String> = seq
        .expressions
        .iter()
        .map(|e| {
            let span = e.span();
            let member_src = wrapped
                .get(span.start as usize..span.end as usize)
                .unwrap_or("")
                .trim();
            format_attribute_value_expression(member_src, options, attr_depth + 1, 0)
        })
        .collect::<Result<_, _>>()?;

    let indent_width = options.js.indent_width.value() as usize;
    let line_width = options.js.line_width.value() as usize;
    let any_multiline = members.iter().any(|m| m.contains('\n'));

    // Inline candidate: keep it inline only when no member is multi-line and
    // the whole value fits at its rendered column.
    // When there is a leading block comment, prettier wraps the sequence in
    // outer parens — e.g. `{/** comment */ (m1, m2)}` — so we account for the
    // extra `comment + 2` columns (2 for the parens) in the width check.
    let inline = members.join(", ");
    let comment_prefix_cols = leading_block_comment
        .map(|(c, _)| c.visual_width(tw) + 1 /* space */)
        .unwrap_or(0);
    // +2 for outer parens when there is a comment, +0 otherwise.
    let outer_parens_cols = if leading_block_comment.is_some() {
        2
    } else {
        0
    };
    let inline_cols = lead_cols
        + 1  // opening `{`
        + comment_prefix_cols
        + outer_parens_cols
        + inline.visual_width(tw)
        + 1; // closing `}`
    if !any_multiline && inline_cols <= line_width {
        return Ok(Some(if let Some((comment, _)) = leading_block_comment {
            // `{/** comment */ (m1, m2)}`
            format!("{{{comment} ({inline})}}")
        } else {
            format!("{{{inline}}}")
        }));
    }

    // Broken form: braces on their own lines.  prettier-plugin-svelte first tries
    // to fit ALL members on a single intermediate line — e.g.
    //   `bind:checked={\n  getter, setter\n}`.
    // Only if the combined members line overflows does it fall back to one member
    // per line.  Check: does `inline` fit at the inner indent level?
    let one_level = if options.js.indent_style.is_tab() {
        "\t".to_string()
    } else {
        " ".repeat(indent_width)
    };
    let inner_indent_cols = (attr_depth + 1) * indent_width;
    let inline_on_one_line =
        !any_multiline && inner_indent_cols + inline.visual_width(tw) <= line_width;

    // When there is a leading block comment, include it on the first line.
    let mut out = if let Some((comment, _)) = leading_block_comment {
        format!("{{{comment}\n")
    } else {
        String::from("{\n")
    };
    if inline_on_one_line && leading_block_comment.is_none() {
        // All members fit on one line inside the braces.
        out.push_str(&crate::reindent::reindent(&inline, &one_level, false));
        out.push('\n');
    } else {
        for (i, m) in members.iter().enumerate() {
            out.push_str(&crate::reindent::reindent(m, &one_level, false));
            if i + 1 < members.len() {
                out.push(',');
            }
            out.push('\n');
        }
    }
    out.push('}');
    Ok(Some(out))
}
