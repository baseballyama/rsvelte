use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::ast::arena::try_with_current_serialize_arena;
use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::ExpressionTag;
use rsvelte_core::ast::typed_expr::JsNode;
use unicode_width::UnicodeWidthStr;

use super::call_args;
use super::declaration::{
    format_const_declaration, format_declaration_tag_body, format_snippet_header_source,
};
use super::format_core::format_expr_core;
use super::text::{
    collapse_block_header_expanded_call, collapse_expanded_arg_form,
    collapse_multiline_to_single_line, compute_header_suffix_len, first_line_ends_with_logical_op,
    is_method_chain_break, starts_with_array_or_object_literal,
};
use super::width::{
    format_content_expression, format_content_expression_with_prefix, format_inline_expression,
};
use super::{format_expression_source, format_pattern_source, formatter_parse_options};
use crate::error::FormatError;
use crate::options::FormatOptions;

// ─── Splice strategies ──────────────────────────────────────────────────

/// Split `inner` at the boundary just past its leading run of `//` line-comment
/// lines. Returns `(leading, rest)` where `leading` retains its trailing
/// newlines (callers trim as needed) and `rest` is everything after the comment
/// block. When `inner` has no leading `//` comment, `leading` is empty.
pub(super) fn split_leading_line_comments(inner: &str) -> (&str, &str) {
    let mut comment_end = 0;
    for line in inner.lines() {
        if line.trim().starts_with("//") {
            comment_end += line.len() + 1; // +1 for '\n'
        } else {
            break;
        }
    }
    inner.split_at(comment_end.min(inner.len()))
}

/// Replace `{...}` (template-position or attribute-value `ExpressionTag`)
/// with the formatted expression body wrapped in braces. Collapses any
/// whitespace inside the braces.
/// The byte range of the leading expression code inside `rest`, excluding any
/// surrounding comments — the boundaries a typed parse's expression span gives,
/// recovered via an oxc parse for the deferred (`Lazy`) case. `None` when the
/// snippet doesn't parse (caller falls back to the raw text).
fn expression_code_range(rest: &str, options: &FormatOptions) -> Option<std::ops::Range<usize>> {
    let allocator = crate::scratch::acquire();
    let wrapped = format!("({rest});");
    let source_type = if options.typescript {
        SourceType::ts().with_module(true)
    } else {
        SourceType::default()
    };
    let ret = Parser::new(allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !ret.diagnostics.is_empty() {
        return None;
    }
    let oxc_ast::ast::Statement::ExpressionStatement(stmt) = ret.program.body.first()? else {
        return None;
    };
    let span = oxc_span::GetSpan::span(&stmt.expression);
    let (start, end) = (span.start as usize, span.end as usize);
    // The `(` wrapper shifts every offset by one byte.
    (start >= 1 && end >= start && end - 1 <= rest.len()).then(|| start - 1..end - 1)
}

fn is_top_level_call_expression(source: &str, options: &FormatOptions) -> bool {
    let allocator = crate::scratch::acquire();
    let wrapped = format!("({source});");
    let source_type = if options.typescript {
        SourceType::ts().with_module(true)
    } else {
        SourceType::default()
    };
    let ret = Parser::new(allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !ret.diagnostics.is_empty() {
        return false;
    }
    matches!(
        ret.program.body.first(),
        Some(oxc_ast::ast::Statement::ExpressionStatement(stmt))
            if matches!(stmt.expression, oxc_ast::ast::Expression::CallExpression(_))
    )
}

pub(super) fn push_expression_tag(
    source: &str,
    tag: &ExpressionTag,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let outer = source
        .get(tag.start as usize..tag.end as usize)
        .ok_or_else(|| FormatError::Parse("expression tag span out of bounds".into()))?;
    let inner = outer
        .strip_prefix('{')
        .and_then(|s| s.strip_suffix('}'))
        .ok_or_else(|| FormatError::Parse("expression tag missing braces".into()))?
        .trim();

    if inner.is_empty() {
        return Ok(());
    }

    // When the expression tag body starts with `//` line comments, OXC would
    // either drop them or fold trailing comments of the real expression into
    // the output.  Prettier-plugin-svelte preserves the leading comment lines
    // and formats only the AST expression node (using its source span, which
    // does not include trailing inline/block comments).  Mirror that: extract
    // the leading comment block, format only the expression-span source, and
    // re-attach the comments.
    if inner.starts_with("//") {
        let (leading, rest) = split_leading_line_comments(inner);
        let leading_comments = leading.trim_end_matches('\n');
        // Use the AST expression span as the expression source so that
        // trailing comments on the expression node are not included. A Lazy
        // span covers the whole braced body (comments included), so derive the
        // code range from an oxc parse instead — same boundaries a typed node's
        // span would have had.
        let lazy = matches!(
            tag.expression,
            rsvelte_core::ast::js::Expression::Lazy { .. }
        );
        let expr_source =
            if !lazy && let (Some(es), Some(ee)) = (tag.expression.start(), tag.expression.end()) {
                source.get(es as usize..ee as usize).unwrap_or("").trim()
            } else {
                let r = rest.trim();
                match expression_code_range(r, options) {
                    Some(range) => r.get(range).unwrap_or(r).trim(),
                    None => r,
                }
            };
        if expr_source.is_empty() {
            edits.push((tag.start, tag.end, format!("{{{leading_comments}}}")));
            return Ok(());
        }
        let formatted_expr = format_content_expression(expr_source, options, depth)?;
        edits.push((
            tag.start,
            tag.end,
            format!("{{{leading_comments}\n{formatted_expr}}}"),
        ));
        return Ok(());
    }

    let prefix_lead =
        if tag.start > 0 && source.as_bytes().get(tag.start as usize - 1) == Some(&b'}') {
            let line_start = source[..tag.start as usize]
                .rfind('\n')
                .map_or(0, |index| index + 1);
            let source_column =
                UnicodeWidthStr::width(source.get(line_start..tag.start as usize).unwrap_or(""));
            let indent = depth * options.js.indent_width.value() as usize;
            source_column.saturating_sub(indent) + 1
        } else {
            1
        };
    let formatted = format_content_expression_with_prefix(inner, options, depth, prefix_lead)?;
    edits.push((tag.start, tag.end, format!("{{{formatted}}}")));
    Ok(())
}

/// Replace `{@<keyword> EXPR}` (full tag span) with the formatted expression
/// body and a single space after the keyword.
pub(super) fn push_tag_form(
    source: &str,
    tag_start: u32,
    tag_end: u32,
    keyword: &str,
    expr: &Expression,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let (Some(start), Some(end)) = (expr.start(), expr.end()) else {
        return Ok(());
    };
    let slice = source
        .get(start as usize..end as usize)
        .ok_or_else(|| FormatError::Parse("tag expression span out of bounds".into()))?
        .trim();
    if slice.is_empty() {
        return Ok(());
    }
    // The expression starts after `{@<keyword> ` — account for those extra chars
    // so OXC's break decision reflects the real rendered column.
    // `{` (1) + `@` (1) + keyword.len() + ` ` (1) = keyword.len() + 3 (but `@` is
    // part of the keyword string already for `@render`, `@html`, `@attach`).
    // Actually the emitted tag is `{keyword} expr}` where keyword is e.g. `@render`,
    // so the prefix is `{` + `@render` + ` ` = 1 + keyword.len() + 1.
    let prefix_lead = 1 + keyword.len() + 1; // `{` + keyword + ` `
    let formatted = format_content_expression_with_prefix(slice, options, depth, prefix_lead)?;
    edits.push((tag_start, tag_end, format!("{{{keyword} {formatted}}}")));
    Ok(())
}

/// Format a `{let x = e}` / `{const x = e}` declaration tag (Svelte 5
/// `DeclarationTag`) by formatting the entire source slice (including the
/// keyword) as a variable-declaration statement.
///
/// Unlike `{@const}`, the keyword (`let`/`const`) is part of the declaration
/// and is stored in the source between `{` and `}`. We slice the whole body
/// from source, parse it as `<body>;`, format with OXC (which normalises
/// quote style, spacing, etc.), and re-wrap in `{ }`.
pub(super) fn push_declaration_tag(
    source: &str,
    tag_start: u32,
    tag_end: u32,
    decl: &Expression,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let (Some(start), Some(end)) = (decl.start(), decl.end()) else {
        return Ok(());
    };
    // The AST records the VariableDeclaration span (which starts at the keyword).
    // Walk backward from decl.start to the `{` to include any leading whitespace
    // between `{` and the keyword that the AST span might exclude.
    let tag_src = source
        .get(tag_start as usize..tag_end as usize)
        .unwrap_or("")
        .trim();
    // Slice from just after `{` to just before `}`.
    let inner = tag_src
        .strip_prefix('{')
        .and_then(|s| s.strip_suffix('}'))
        .unwrap_or_else(|| {
            // Fallback: use the declaration span directly.
            source
                .get(start as usize..end as usize)
                .unwrap_or("")
                .trim()
        })
        .trim();
    if inner.is_empty() {
        return Ok(());
    }
    let formatted = format_declaration_tag_body(inner, options, depth)?;
    edits.push((tag_start, tag_end, format!("{{{formatted}}}")));
    Ok(())
}

/// Replace `{@const <decl>}` by formatting `<decl>` as the body of a `const`
/// variable declaration.
///
/// Unlike [`push_tag_form`], the body is parsed as `const <decl>;` rather than
/// as a bare expression, so a TypeScript type annotation on the binding
/// (`{@const _: never = x}`, `{@const name: Type = value}`) parses and round
/// trips. The declaration's source span (recorded by the parser) covers the
/// whole body including the annotation.
pub(super) fn push_const_tag(
    source: &str,
    tag_start: u32,
    tag_end: u32,
    decl: &Expression,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    // Slice the FIRST declarator's span (`name = value`), not the whole
    // `VariableDeclaration` span. The declaration `start` points at the `const`
    // keyword (Svelte 5.56.4 `start: start + 2`), so slicing the declaration
    // would wrongly include a leading `const `; the declarator span is exactly
    // `<binding> = <init>`.
    // Read the first declarator's span straight from the typed AST. Going
    // through `decl.as_json()` would serialize the entire `VariableDeclaration`
    // subtree — including the initializer — just to recover two offsets.
    let node = decl.as_node();
    let (Some(start), Some(end)) = (match &*node {
        JsNode::VariableDeclaration { declarations, .. } => {
            try_with_current_serialize_arena(|arena| {
                arena
                    .get_js_children(*declarations)
                    .first()
                    .map(|d| (d.start(), d.end()))
            })
            .flatten()
        }
        _ => None,
    })
    .unwrap_or((None, None)) else {
        return Ok(());
    };
    let slice = source
        .get(start as usize..end as usize)
        .ok_or_else(|| FormatError::Parse("const declaration span out of bounds".into()))?
        .trim();
    if slice.is_empty() {
        return Ok(());
    }
    let formatted = format_const_declaration(slice, options, depth)?;
    edits.push((tag_start, tag_end, format!("{{@const {formatted}}}")));
    Ok(())
}

/// Replace `{@debug a, b, c}` with each identifier formatted, joined by
/// a comma + single space.
pub(super) fn push_debug_tag(
    source: &str,
    tag_start: u32,
    tag_end: u32,
    identifiers: &[Expression],
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let mut parts = Vec::with_capacity(identifiers.len());
    for id in identifiers {
        let (Some(start), Some(end)) = (id.start(), id.end()) else {
            continue;
        };
        let slice = source
            .get(start as usize..end as usize)
            .ok_or_else(|| FormatError::Parse("debug identifier span out of bounds".into()))?
            .trim();
        if slice.is_empty() {
            continue;
        }
        parts.push(format_expression_source(slice, options)?);
    }
    if parts.is_empty() {
        return Ok(());
    }
    let joined = parts.join(", ");
    edits.push((tag_start, tag_end, format!("{{@debug {joined}}}")));
    Ok(())
}

/// Splice over an expression's enclosing `{ ... }` if the source has
/// `{ <ws> EXPR <ws> }` around the AST expression span (the `{#each … (KEY)}`
/// key in particular). The expression is forced onto a single line — it sits
/// in a Svelte block header, which prettier-plugin-svelte never breaks.
pub(super) fn push_brace_wrapped_expression(
    source: &str,
    expr: &Expression,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let (Some(start), Some(end)) = (expr.start(), expr.end()) else {
        return Ok(());
    };
    let slice = source
        .get(start as usize..end as usize)
        .ok_or_else(|| FormatError::Parse("expression span out of bounds".into()))?
        .trim();
    if slice.is_empty() {
        return Ok(());
    }
    let formatted = format_inline_expression(slice, options)?;

    if let Some((brace_start, brace_end)) = enclosing_braces_span(source, start, end) {
        edits.push((brace_start, brace_end, format!("{{{formatted}}}")));
    } else {
        edits.push((start, end, formatted));
    }
    Ok(())
}

/// Push a block-header expression that OXC broke as a *method chain*
/// (`node\n  .a()\n  .b()`) out to the block's depth. Returns `None` when
/// `formatted` is single-line, ends its first line at a logical operator, or was
/// not broken as a method chain — the cases the caller keeps as-is. reindent
/// prepends the prefix ON TOP of OXC's own 2-space indent, so `depth` levels
/// yields `(depth+1)`-level continuations.
pub(super) fn reindent_header_method_chain(
    formatted: &str,
    depth: usize,
    options: &FormatOptions,
) -> Option<String> {
    if !formatted.contains('\n')
        || first_line_ends_with_logical_op(formatted.lines().next().unwrap_or(""))
        || !is_method_chain_break(formatted)
    {
        return None;
    }
    let indent_width = options.js.indent_width.value() as usize;
    let cont_indent = if options.js.indent_style.is_tab() {
        "\t".repeat(depth)
    } else {
        " ".repeat(depth * indent_width)
    };
    Some(crate::reindent::reindent(formatted, &cont_indent, true))
}

/// Splice just the bare expression span — preserves whatever surrounds it
/// in the source. Used for block-header expressions (`{#if EXPR}`,
/// `{#each EXPR as ...}`, etc.) where the `{` is followed by a Svelte
/// keyword (`#if` / `#each` / ...) rather than the expression itself.
///
/// When the expression itself is longer than `full_width` (i.e. OXC at
/// `full_width` would wrap it), reformats at `full_width` and reindents
/// continuation lines to `(depth + 1) * indent_width`.  Breaks at logical
/// operators (`&&`, `||`) are rejected — prettier keeps block headers on one
/// line when the only wrapping option is a logical op.
///
/// Also strips any unnecessary outer parentheses that the source wraps around
/// the expression (e.g. `{#if (b)}` → `{#if b}`, `{#each (c) as x}` →
/// `{#each c as x}`). Returns the effective end position of the edit (which
/// may be past the original expression end if source parens were consumed).
pub(super) fn push_bare_expression(
    source: &str,
    expr: &Expression,
    options: &FormatOptions,
    depth: usize,
    prefix_len: usize,
    sibling_expansion: usize,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<u32, FormatError> {
    let (Some(start), Some(end)) = (expr.start(), expr.end()) else {
        return Ok(expr.end().unwrap_or(0));
    };
    let slice = source
        .get(start as usize..end as usize)
        .ok_or_else(|| FormatError::Parse("expression span out of bounds".into()))?
        .trim();
    if slice.is_empty() {
        return Ok(end);
    }
    let indent_width = options.js.indent_width.value() as usize;
    let full_width = options.js.line_width.value() as usize;
    let suffix_len = compute_header_suffix_len(source, end as usize);
    // First format inline (single-line) to get the canonical expression text.
    let formatted = format_inline_expression(slice, options)?;
    // prettier-plugin-svelte forces block-header expressions onto one line
    // (`forceSingleLine`/`removeLines`). OXC breaks some expressions across lines
    // even at `LineWidth::MAX` — wide array/object literals, and calls whose last
    // argument is huggable (prettier's shouldExpandLastArg, printed as
    // `allArgsBrokenOut`). When the source is single-line, collapse OXC's
    // multi-line result back to one line so a block header is never emitted broken.
    let formatted = if formatted.contains('\n') && !slice.contains('\n') {
        if starts_with_array_or_object_literal(slice) {
            // Array/object literal: prettier keeps it flat with no added spaces.
            collapse_multiline_to_single_line(&formatted)
        } else if let Some(collapsed) = collapse_block_header_expanded_call(&formatted) {
            // A call OXC expanded because its last arg is huggable. prettier's
            // `removeLines` collapses the `allArgsBrokenOut` layout to one line but
            // keeps the expanded-arg spacing: `fn( a, b )`.
            collapsed
        } else {
            formatted
        }
    } else {
        formatted
    };
    let expression_width = UnicodeWidthStr::width(formatted.as_str());
    // `sibling_expansion` is the width a not-yet-settled expression later on the
    // header line gains from its own grouped calls — the `{#each}` key, measured
    // at its widest while the iterable ahead of it is being judged.
    let header_width =
        depth * indent_width + prefix_len + expression_width + suffix_len + sibling_expansion;
    let header_overflows = header_width > full_width;
    // The oracle accounts for the full header around call expressions, but keeps
    // a fitting plain member chain inline even when its `as` suffix overflows.
    let should_break = expression_width > full_width
        || (header_overflows && is_top_level_call_expression(slice, options));
    let broken = if !formatted.contains('\n')
            && should_break
            // prettier-plugin-svelte never breaks array or object literals in
            // block headers even when they are far wider than the print width —
            // e.g. `{#each ["a", "b", "c", …] as x}` stays on one line.
            && !starts_with_array_or_object_literal(formatted.as_str())
    {
        let multi = format_expr_core(slice, options, options.js.line_width, false)?;
        let multi = if multi.contains('\n') || expression_width > full_width {
            multi
        } else {
            let narrowed_width = oxc_formatter_core::LineWidth::try_from(
                expression_width.saturating_sub(1).max(1) as u16,
            )
            .unwrap_or(options.js.line_width);
            format_expr_core(slice, options, narrowed_width, false)?
        };
        // Only accept a method-chain break (hard `.`-led continuation lines,
        // which prettier's removeLines keeps); OXC's soft argument-wrap breaks are
        // collapsed back to one line by the oracle.
        if let Some(reindented) = reindent_header_method_chain(&multi, depth, options) {
            Some(reindented)
        } else if multi.contains('\n')
            && !first_line_ends_with_logical_op(multi.lines().next().unwrap_or(""))
        {
            // OXC broke at call-argument expansion (expanded args, not method chain).
            // prettier-plugin-svelte's `removeLines` / `forceSingleLine` collapses the
            // newlines back to spaces but PRESERVES the expanded-args markers: a leading
            // space after the outermost `(` and a trailing `, ` before the closing `)`.
            // This produces `call( arg, )` rather than `call(arg)`.
            //
            // Detect: OXC's joined-lines form ends with `, )` (trailing comma inside the
            // outermost call). If so, insert a space after the matching opening `(` to
            // match the oracle's expanded-arg-collapsed form.
            collapse_expanded_arg_form(&multi)
        } else {
            // OXC kept it on one line, broke at a logical operator, or couldn't
            // determine an expanded-arg form — keep the inline version.
            None
        }
    } else {
        None
    };
    let formatted = match broken {
        Some(broken) => broken,
        // The oracle keeps an overflowing header on one line but renders every
        // call in it whose arguments oxc lays out grouped from that expanded
        // layout: `callee( a, b )`. Calls it lays out ungrouped stay `callee(a, b)`.
        None if header_overflows && !formatted.contains('\n') => {
            call_args::expand_grouped_call_parens(&formatted, options).unwrap_or(formatted)
        }
        None => formatted,
    };

    // A top-level assignment in a block header (`{#if a = 0}` → `{#if (a = 0)}`)
    // is wrapped in parens by `format_expr_core` itself (the same canonical
    // one-pair rule it applies to mustache / attribute assignments), so no
    // block-header-specific re-wrap is needed here.

    // prettier-plugin-svelte strips unnecessary outer parens from block-header
    // expressions: `{#if (b)}` → `{#if b}`, `{#each (c) as x}` → `{#each c as x}`.
    // The Svelte AST stores the inner expression span (just `b` / `c`), so the
    // parens are in the source *outside* the span. Walk outward and include them
    // in the edit so they are replaced together with the inner expression.
    // For assignment expressions we always emit with parens, so also consume any
    // existing source parens (they would be replaced by our canonical `(expr)` pair).
    let (edit_start, edit_end) = widen_to_source_parens(source, start, end).unwrap_or((start, end));

    edits.push((edit_start, edit_end, formatted));
    Ok(edit_end)
}

/// Locate an each-block key's delimiter paren pair `( … )` around the key
/// expression span `[inner_start, inner_end)`.
///
/// The Svelte AST stores only the inner key expression span; the delimiter
/// parens — plus any redundant parens the source wrapped around the key — sit
/// outside it. Walk backward over consecutive `(` (and horizontal whitespace)
/// to the outermost `(`, and forward over consecutive `)` (and horizontal
/// whitespace) to the outermost `)`. Returns `(delim_open, delim_close_excl)`
/// covering the whole `( … )` (both delimiter parens included), or `None` when
/// no wrapping parens are found (which should not happen for valid each-key
/// syntax). Only horizontal whitespace is crossed, so a paren on a different
/// line is left alone.
pub(super) fn find_each_key_delimiter(
    source: &str,
    inner_start: u32,
    inner_end: u32,
) -> Option<(u32, u32)> {
    let before = source.get(..inner_start as usize)?;
    let mut open: Option<u32> = None;
    for (pos, ch) in before.char_indices().rev() {
        match ch {
            ' ' | '\t' => {}
            '(' => open = Some(pos as u32),
            _ => break,
        }
    }
    let open = open?;

    let after = source.get(inner_end as usize..)?;
    let mut close_excl: Option<u32> = None;
    for (i, ch) in after.char_indices() {
        match ch {
            ' ' | '\t' => {}
            ')' => close_excl = Some(inner_end + (i + ch.len_utf8()) as u32),
            _ => break,
        }
    }
    let close_excl = close_excl?;
    Some((open, close_excl))
}

/// If the source has `(` immediately before `inner_start` (possibly with
/// leading whitespace after a preceding keyword) and `)` immediately after
/// `inner_end` (possibly with trailing whitespace), returns the span
/// `(paren_open, paren_close_excl)` that includes those outer parens.
/// Handles multiple levels (e.g. `((b))` → widened twice).
///
/// Only considers horizontal whitespace (space/tab) between the paren and the
/// expression — a newline means the paren is on a different line from the
/// expression, which we leave alone.
fn widen_to_source_parens(source: &str, mut start: u32, mut end: u32) -> Option<(u32, u32)> {
    let mut widened = false;
    loop {
        // Look backward from `start` for `(` through horizontal whitespace only.
        // The targets — space, tab, `(` — are all ASCII, so a raw reverse byte
        // scan is safe: any UTF-8 continuation or non-ASCII lead byte falls into
        // the `_ => break` arm, and a matched byte is a char boundary.
        let before = source.get(..start as usize)?;
        let bytes = before.as_bytes();
        let mut paren_pos: Option<u32> = None;
        let mut i = bytes.len();
        while i > 0 {
            i -= 1;
            match bytes[i] {
                b' ' | b'\t' => continue,
                b'(' => {
                    paren_pos = Some(i as u32);
                    break;
                }
                _ => break,
            }
        }
        let paren_open = match paren_pos {
            Some(p) => p,
            None => break,
        };

        // Look forward from `end` for `)` through horizontal whitespace only.
        let after = source.get(end as usize..)?;
        let mut close_offset: Option<usize> = None;
        for (i, ch) in after.char_indices() {
            match ch {
                ' ' | '\t' => continue,
                ')' => {
                    close_offset = Some(i + ch.len_utf8());
                    break;
                }
                _ => break,
            }
        }
        let paren_close_excl = match close_offset {
            Some(off) => end + off as u32,
            None => break,
        };

        // Only widen when the paren immediately follows a keyword boundary
        // (the char before `paren_open` must be a space/tab or the start of
        // the string — we don't want to eat call-expression parens like
        // `f(b)` or index parens `arr[f(b)]`).
        // Check the char right before paren_open.
        let before_paren = source.get(..paren_open as usize).unwrap_or("");
        let last_char_before_paren = before_paren.chars().next_back();
        match last_char_before_paren {
            None | Some(' ') | Some('\t') | Some('\n') | Some('\r') => {}
            _ => break, // paren is part of a call / grouping in a larger expr
        }

        start = paren_open;
        end = paren_close_excl;
        widened = true;
    }
    if widened { Some((start, end)) } else { None }
}

/// If the AST expression at `[expr_start, expr_end)` is enclosed by `{`
/// and `}` (only whitespace between brace and expression), return the
/// span covering the braces inclusive. Otherwise return `None`.
fn enclosing_braces_span(source: &str, expr_start: u32, expr_end: u32) -> Option<(u32, u32)> {
    let bytes = source.as_bytes();

    let mut lbrace = None;
    let mut i = expr_start as usize;
    while i > 0 {
        i -= 1;
        match bytes[i] {
            b' ' | b'\t' | b'\n' | b'\r' => continue,
            b'{' => {
                lbrace = Some(i);
                break;
            }
            _ => return None,
        }
    }
    let lbrace = lbrace?;

    let mut rbrace = None;
    let mut j = expr_end as usize;
    while j < bytes.len() {
        match bytes[j] {
            b' ' | b'\t' | b'\n' | b'\r' => j += 1,
            b'}' => {
                rbrace = Some(j);
                break;
            }
            _ => return None,
        }
    }
    let rbrace = rbrace?;

    Some((lbrace as u32, (rbrace + 1) as u32))
}

/// Splice a destructuring pattern's source span with its formatted
/// version. Mirrors `push_bare_expression` but routes through
/// `format_pattern_source` so default values and rest elements survive.
pub(super) fn push_pattern_at_span(
    source: &str,
    expr: &Expression,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let (Some(start), Some(end)) = (expr.start(), expr.end()) else {
        return Ok(());
    };
    let slice = source
        .get(start as usize..end as usize)
        .ok_or_else(|| FormatError::Parse("pattern span out of bounds".into()))?
        .trim();
    if slice.is_empty() {
        return Ok(());
    }
    let formatted = format_pattern_source(slice, options)?;
    edits.push((start, end, formatted));
    Ok(())
}

/// After formatting an expression or pattern whose source span ends at
/// `after`, emit a deletion edit for any horizontal whitespace (spaces /
/// tabs) that sits between `after` and the next `}` in the source.
///
/// This trims trailing whitespace from Svelte block headers — e.g.
/// `{#if cond }` → `{#if cond}`, `{#each arr as x }` → `{#each arr as x}`.
/// Only triggers when the very next non-whitespace character is `}` so it
/// cannot accidentally remove meaningful whitespace before ` as `, ` then`,
/// `(key)`, etc.
pub(super) fn trim_trailing_ws_before_close_brace(
    source: &str,
    after: u32,
    edits: &mut Vec<(u32, u32, String)>,
) {
    let rest = match source.get(after as usize..) {
        Some(r) => r,
        None => return,
    };
    // Only horizontal whitespace — a newline means a multi-line header and we
    // leave those alone.
    let ws_len = rest
        .chars()
        .take_while(|c| *c == ' ' || *c == '\t')
        .map(char::len_utf8)
        .sum::<usize>();
    if ws_len > 0 && rest[ws_len..].starts_with('}') {
        edits.push((after, after + ws_len as u32, String::new()));
    }
}

/// Normalize leading horizontal whitespace immediately before a block-header
/// expression to exactly one space. Applies only when there are 2+ spaces/tabs
/// between the keyword end and the expression start, e.g.:
///   `{#if   cond}` → `{#if cond}`
///   `{#each  items as x}` → `{#each items as x}`
/// Does nothing when a newline precedes the expression (multi-line headers).
/// Normalize extra whitespace between the `{` opener and the `#`/`:` keyword
/// prefix of a block tag:  `{     #if cond}` → `{#if cond}`.
///
/// `block_start` is the position of the `{` character. The function scans
/// forward, skipping spaces/tabs, until it finds `#` or `:`. If any
/// whitespace was skipped, it emits an edit that removes it (replacing the
/// `{  #` span with `{#`, etc.).
/// Given the position of a binding/pattern in a separator token (`{:then binding}`,
/// `{:catch error}`, `{:else if cond}`), walk backward in `source` to find the
/// `{` that opens the separator and call `normalize_block_opener_ws` on it.
/// Handles extra whitespace like `{   :then binding}` → `{:then binding}`.
pub(super) fn normalize_separator_opener_before(
    source: &str,
    binding_start: u32,
    edits: &mut Vec<(u32, u32, String)>,
) {
    // Walk backward from binding_start to find the `{` of the separator.
    let before = match source.get(..binding_start as usize) {
        Some(s) => s,
        None => return,
    };
    // The structure is `{  :then ` or `{  :catch ` — find the last `{` before binding_start.
    if let Some(brace_pos) = before.rfind('{') {
        normalize_block_opener_ws(source, brace_pos as u32, edits);
    }
}

pub(super) fn normalize_block_opener_ws(
    source: &str,
    block_start: u32,
    edits: &mut Vec<(u32, u32, String)>,
) {
    let bytes = source.as_bytes();
    let start = block_start as usize;
    // Verify the position points to `{`.
    if bytes.get(start) != Some(&b'{') {
        return;
    }
    // Skip any whitespace between `{` and the keyword prefix (`#` or `:`).
    let mut i = start + 1;
    while i < bytes.len() && matches!(bytes[i], b' ' | b'\t') {
        i += 1;
    }
    // Only emit an edit when there was extra whitespace.
    let ws_len = i - (start + 1);
    if ws_len > 0 && matches!(bytes.get(i), Some(&b'#') | Some(&b':')) {
        // Replace `{<spaces>` with `{` by removing the spaces.
        edits.push(((start + 1) as u32, i as u32, String::new()));
    }
}

pub(super) fn normalize_leading_ws_before_expr(
    source: &str,
    expr_start: u32,
    edits: &mut Vec<(u32, u32, String)>,
) {
    let before = match source.get(..expr_start as usize) {
        Some(s) => s,
        None => return,
    };
    // Walk backward over horizontal whitespace only (space / tab).
    let ws_start = before
        .bytes()
        .enumerate()
        .rev()
        .take_while(|(_, b)| *b == b' ' || *b == b'\t')
        .last()
        .map_or(before.len(), |(i, _)| i);
    let ws_len = expr_start as usize - ws_start;
    // Only emit an edit when there are extra spaces (> 1) — a single space is
    // already correct and emitting a no-op edit can disturb overlap detection.
    if ws_len > 1 {
        edits.push((ws_start as u32, expr_start, " ".to_string()));
    }
}

/// Emit one edit replacing a `{#snippet}` header's `name<…>(params)` with a
/// width-driven-formatted version. The header span runs from the snippet name
/// to the `)` that closes its parameter list (generics in between are sliced
/// from source verbatim, so they survive). Only called when there is at least
/// one parameter.
pub(super) fn push_snippet_header(
    source: &str,
    blk: &rsvelte_core::ast::template::SnippetBlock,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let Some(name_start) = blk.expression.start() else {
        return Ok(());
    };
    let Some(last_end) = blk.parameters.last().and_then(|p| p.end()) else {
        return Ok(());
    };
    // The parameter list closes at the first `)` at or after the last
    // parameter's end (any `)` *inside* a parameter — `cb: () => void`, a
    // parenthesized default — ends before `last_end`).
    let Some(close_rel) = source.get(last_end as usize..).and_then(|s| s.find(')')) else {
        return Ok(());
    };
    let header_end = last_end as usize + close_rel + 1;
    let Some(header_src) = source.get(name_start as usize..header_end) else {
        return Ok(());
    };
    let formatted = format_snippet_header_source(header_src.trim(), options, depth)?;
    edits.push((name_start, header_end as u32, formatted));
    Ok(())
}
