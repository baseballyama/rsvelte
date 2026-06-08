use oxc_allocator::Allocator;
use oxc_formatter::format_program;
use oxc_parser::{ParseOptions as OxcParseOptions, Parser};
use oxc_span::SourceType;
use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::{ExpressionTag, Fragment, TemplateNode};
use unicode_width::UnicodeWidthStr;

use crate::error::FormatError;
use crate::options::FormatOptions;

fn formatter_parse_options() -> OxcParseOptions {
    OxcParseOptions {
        preserve_parens: false,
        ..OxcParseOptions::default()
    }
}

/// Walk a `Fragment` recursively, appending `(start, end, replacement)`
/// edits for every JS expression we can safely format.
///
/// `depth` is the markup nesting level at which this fragment's nodes render
/// (root fragment is `0`, each enclosing element / block adds one). Content
/// expressions use it to match prettier-plugin-svelte's wrap column; see
/// [`format_content_expression`].
pub(crate) fn collect_template_edits(
    source: &str,
    fragment: &Fragment,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    for node in &fragment.nodes {
        collect_node_edits(source, node, depth, options, edits)?;
    }
    Ok(())
}

fn collect_node_edits(
    source: &str,
    node: &TemplateNode,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let child_depth = depth + 1;
    match node {
        TemplateNode::ExpressionTag(tag) => {
            push_expression_tag(source, tag, depth, options, edits)?;
        }
        TemplateNode::HtmlTag(tag) => {
            push_tag_form(
                source,
                tag.start,
                tag.end,
                "@html",
                &tag.expression,
                depth,
                options,
                edits,
            )?;
        }
        TemplateNode::RenderTag(tag) => {
            push_tag_form(
                source,
                tag.start,
                tag.end,
                "@render",
                &tag.expression,
                depth,
                options,
                edits,
            )?;
        }
        TemplateNode::AttachTag(tag) => {
            push_tag_form(
                source,
                tag.start,
                tag.end,
                "@attach",
                &tag.expression,
                depth,
                options,
                edits,
            )?;
        }
        TemplateNode::DebugTag(tag) => {
            push_debug_tag(source, tag.start, tag.end, &tag.identifiers, options, edits)?;
        }
        TemplateNode::ConstTag(tag) => {
            // `{@const x = e}` — the declaration is an assignment expression
            // (`x = e`); format it like any content expression so quotes /
            // spacing normalize (`{@const foo = 'bar'}` → `{@const foo = "bar"}`).
            push_tag_form(
                source,
                tag.start,
                tag.end,
                "@const",
                &tag.declaration,
                depth,
                options,
                edits,
            )?;
        }
        TemplateNode::DeclarationTag(_) => {
            // `{let x = e}` / `{const x = e}` — keyword-led VariableDeclaration;
            // defer until statement formatting lands.
        }
        // For every element type, attribute lists (and `this={X}` on
        // `<svelte:component>` / `<svelte:element>`) are owned by the
        // open-tag rewrite in `crate::markup`. Here we only recurse into
        // the children.
        TemplateNode::RegularElement(elem) => {
            collect_template_edits(source, &elem.fragment, child_depth, options, edits)?;
        }
        TemplateNode::Component(c) => {
            collect_template_edits(source, &c.fragment, child_depth, options, edits)?;
        }
        TemplateNode::TitleElement(t) => {
            collect_template_edits(source, &t.fragment, child_depth, options, edits)?;
        }
        TemplateNode::SlotElement(s) => {
            collect_template_edits(source, &s.fragment, child_depth, options, edits)?;
        }
        TemplateNode::SvelteHead(s)
        | TemplateNode::SvelteBody(s)
        | TemplateNode::SvelteDocument(s)
        | TemplateNode::SvelteFragment(s)
        | TemplateNode::SvelteBoundary(s)
        | TemplateNode::SvelteOptions(s)
        | TemplateNode::SvelteSelf(s)
        | TemplateNode::SvelteWindow(s) => {
            collect_template_edits(source, &s.fragment, child_depth, options, edits)?;
        }
        TemplateNode::SvelteComponent(c) => {
            collect_template_edits(source, &c.fragment, child_depth, options, edits)?;
        }
        TemplateNode::SvelteElement(e) => {
            collect_template_edits(source, &e.fragment, child_depth, options, edits)?;
        }
        TemplateNode::IfBlock(blk) => {
            // Walk the `{#if} / {:else if} / {:else}` chain at one consistent
            // depth — svelte desugars `{:else if}` into an alternate fragment
            // whose sole child is another IfBlock, so recursing naively would
            // add a level per branch. Mirrors `crate::indent`.
            let mut current: &rsvelte_core::ast::template::IfBlock = blk;
            loop {
                push_bare_expression(source, &current.test, options, edits)?;
                collect_template_edits(source, &current.consequent, child_depth, options, edits)?;
                match &current.alternate {
                    Some(alt) => match crate::indent::else_if_branch(alt) {
                        Some(chained) => current = chained,
                        None => {
                            collect_template_edits(source, alt, child_depth, options, edits)?;
                            break;
                        }
                    },
                    None => break,
                }
            }
        }
        TemplateNode::EachBlock(blk) => {
            push_bare_expression(source, &blk.expression, options, edits)?;
            if let Some(ctx) = &blk.context {
                push_pattern_at_span(source, ctx, options, edits)?;
            }
            if let Some(key) = &blk.key {
                push_brace_wrapped_expression(source, key, options, edits)?;
            }
            collect_template_edits(source, &blk.body, child_depth, options, edits)?;
            if let Some(fb) = &blk.fallback {
                collect_template_edits(source, fb, child_depth, options, edits)?;
            }
        }
        TemplateNode::AwaitBlock(blk) => {
            push_bare_expression(source, &blk.expression, options, edits)?;
            if let Some(v) = &blk.value {
                push_pattern_at_span(source, v, options, edits)?;
            }
            if let Some(e) = &blk.error {
                push_pattern_at_span(source, e, options, edits)?;
            }
            if let Some(frag) = &blk.pending {
                collect_template_edits(source, frag, child_depth, options, edits)?;
            }
            if let Some(frag) = &blk.then {
                collect_template_edits(source, frag, child_depth, options, edits)?;
            }
            if let Some(frag) = &blk.catch {
                collect_template_edits(source, frag, child_depth, options, edits)?;
            }
        }
        TemplateNode::KeyBlock(blk) => {
            push_bare_expression(source, &blk.expression, options, edits)?;
            collect_template_edits(source, &blk.fragment, child_depth, options, edits)?;
        }
        TemplateNode::SnippetBlock(blk) => {
            if blk.parameters.is_empty() {
                // No params — just normalize the name (`{#snippet foo()}`).
                push_bare_expression(source, &blk.expression, options, edits)?;
            } else {
                // Format the whole header `name<…>(params)` as one function
                // signature so a long parameter list breaks across lines like
                // prettier-plugin-svelte (the `{/snippet}` delimiter makes a
                // multi-line header safe — unlike `{#each}`/`{#await}`) (#797).
                push_snippet_header(source, blk, depth, options, edits)?;
            }
            collect_template_edits(source, &blk.body, child_depth, options, edits)?;
        }
        TemplateNode::Text(_) | TemplateNode::Comment(_) => {}
    }
    Ok(())
}

// ─── Splice strategies ──────────────────────────────────────────────────

/// Replace `{...}` (template-position or attribute-value `ExpressionTag`)
/// with the formatted expression body wrapped in braces. Collapses any
/// whitespace inside the braces.
fn push_expression_tag(
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

    let formatted = format_content_expression(inner, options, depth)?;
    edits.push((tag.start, tag.end, format!("{{{formatted}}}")));
    Ok(())
}

/// Replace `{@<keyword> EXPR}` (full tag span) with the formatted expression
/// body and a single space after the keyword.
#[allow(clippy::too_many_arguments)]
fn push_tag_form(
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
    let formatted = format_content_expression(slice, options, depth)?;
    edits.push((tag_start, tag_end, format!("{{{keyword} {formatted}}}")));
    Ok(())
}

/// Replace `{@debug a, b, c}` with each identifier formatted, joined by
/// a comma + single space.
fn push_debug_tag(
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
fn push_brace_wrapped_expression(
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

/// Splice just the bare expression span — preserves whatever surrounds it
/// in the source. Used for block-header expressions (`{#if EXPR}`,
/// `{#each EXPR as ...}`, etc.) where the `{` is followed by a Svelte
/// keyword (`#if` / `#each` / ...) rather than the expression itself. The
/// expression is forced onto a single line: prettier-plugin-svelte keeps a
/// block tag's expression inline regardless of width.
fn push_bare_expression(
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
    edits.push((start, end, formatted));
    Ok(())
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
    let Some(inner) = directive_brace_inner(source, expr, value_end) else {
        return Ok(None);
    };
    let inner = inner.trim();
    if inner.is_empty() {
        return Ok(None);
    }
    Ok(Some(format_attribute_value_expression(
        inner, options, attr_depth,
    )?))
}

/// Locate a directive value's `{ … }` braces and return the raw inner source.
/// The opening brace is found by a whitespace-only back-scan from the
/// expression start; the closing brace is the byte just before `value_end`
/// (the directive node's `end`). Returns `None` when the braces can't be
/// located (e.g. a shorthand `bind:value` with no value).
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

    // Opening brace: whitespace-only back-scan from the expression start.
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
            _ => break,
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

    let Some(inner) = directive_brace_inner(source, expr, value_end) else {
        return Ok(None);
    };
    let inner = inner.trim();
    if inner.is_empty() {
        return Ok(None);
    }

    // Detect a top-level sequence and recover each member's source span.
    let allocator = Allocator::default();
    let source_type = if options.typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };
    let wrapped = format!("({inner});");
    let parser_ret = Parser::new(&allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.errors.is_empty() {
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
            format_attribute_value_expression(member_src, options, attr_depth + 1)
        })
        .collect::<Result<_, _>>()?;

    let indent_width = options.js.indent_width.value() as usize;
    let line_width = options.js.line_width.value() as usize;
    let any_multiline = members.iter().any(|m| m.contains('\n'));

    // Inline candidate: `{m1, m2}` on one line. Keep it inline only when no
    // member is multi-line and the whole value fits at its rendered column.
    let inline = members.join(", ");
    let inline_cols = lead_cols + 1 + UnicodeWidthStr::width(inline.as_str()) + 1;
    if !any_multiline && inline_cols <= line_width {
        return Ok(Some(format!("{{{inline}}}")));
    }

    // Broken form: each member on its own line, indented one level, braces on
    // their own lines. The caller's open-tag rewrite re-indents these
    // continuation lines out to the attribute column.
    let one_level = if options.js.indent_style.is_tab() {
        "\t".to_string()
    } else {
        " ".repeat(indent_width)
    };
    let mut out = String::from("{\n");
    for (i, m) in members.iter().enumerate() {
        out.push_str(&crate::reindent::reindent(m, &one_level, false));
        if i + 1 < members.len() {
            out.push(',');
        }
        out.push('\n');
    }
    out.push('}');
    Ok(Some(out))
}

// ─── Expression formatter ───────────────────────────────────────────────

/// Format a single JS expression source at `line_width`. Wraps in parens to
/// force expression context (so object literals like `{a:1}` aren't parsed as
/// block statements) and strips the `( … );` wrapper from the output. With
/// `single_line`, the formatter is held on one line (`Expand::Never` + max
/// width) for spots where a break can't survive — block headers and the like.
/// The result may otherwise be multi-line, with continuation lines at
/// `oxc_formatter`'s own relative indent (measured from column 0).
fn format_expr_core(
    expr_source: &str,
    options: &FormatOptions,
    line_width: oxc_formatter_core::LineWidth,
    single_line: bool,
) -> Result<String, FormatError> {
    let allocator = Allocator::default();
    let source_type = if options.typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };

    let wrapped = format!("({expr_source});");
    let parser_ret = Parser::new(&allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.errors.is_empty() {
        return Err(FormatError::ScriptParse(format!("{:?}", parser_ret.errors)));
    }

    // Detect a top-level sequence (comma) expression before `program` is
    // borrowed by `format_program`. oxc_formatter intentionally re-adds the
    // outer parens of a top-level `SequenceExpression` (its `NeedsParentheses`
    // impl returns true for an `ExpressionStatement` parent), and
    // prettier-plugin-svelte keeps them — so `{((a = 1), '')}` must stay
    // parenthesized. Stripping them below would wrongly emit `{(a = 1), ''}`
    // (#799). Every other expression keeps the normal outer-paren strip.
    let is_top_sequence = matches!(
        parser_ret.program.body.first(),
        Some(oxc_ast::ast::Statement::ExpressionStatement(stmt))
            if matches!(stmt.expression, oxc_ast::ast::Expression::SequenceExpression(_))
    );

    let mut js = options.js.clone();
    js.line_width = line_width;
    if single_line {
        js.expand = oxc_formatter::Expand::Never;
    }
    let formatted = format_program(&allocator, &parser_ret.program, js, None)
        .print()
        .map_err(|e| FormatError::ScriptParse(format!("{e:?}")))?
        .into_code();

    let s = formatted.trim_end().trim_end_matches(';').trim_end();
    // prettier-plugin-svelte keeps exactly ONE set of outer parens around a
    // top-level sequence (comma) expression in a mustache / attribute value
    // (e.g. `{((ref = …), '')}`). These callers slice the full brace-enclosed
    // source, so the parens belong to the replaced span — normalise to exactly
    // one pair: strip every redundant outer pair, then re-wrap once. (Member
    // parens like `(a = 1)` inside `((a = 1), "")` are not outer pairs and
    // survive.) Block headers (`single_line`) slice the expression span
    // *without* its surrounding source parens, so wrapping here would
    // double-wrap (`{#if ((a, b))}`); they keep the plain strip, which leaves
    // the source parens intact. (#799)
    if is_top_sequence && !single_line {
        let mut inner = s.trim();
        loop {
            let stripped = strip_outer_parens(inner).trim();
            if stripped == inner {
                break;
            }
            inner = stripped;
        }
        Ok(format!("({inner})"))
    } else {
        Ok(strip_outer_parens(s).trim().to_string())
    }
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
) -> Result<String, FormatError> {
    let indent_width = options.js.indent_width.value() as usize;
    let narrowed =
        (options.js.line_width.value() as usize).saturating_sub(attr_depth * indent_width);
    let line_width =
        oxc_formatter_core::LineWidth::try_from(narrowed as u16).unwrap_or(options.js.line_width);
    format_expr_core(expr_source, options, line_width, false)
}

/// Format a block-header expression (`{#if cond}`, `{#each items …}`) onto a
/// single line. prettier-plugin-svelte never breaks a block tag's expression
/// across lines regardless of width, so format at the widest line the
/// formatter allows (`LineWidth::MAX`) with `Expand::Never` so neither a long
/// binary chain nor a magic-comma object splits the block header.
fn format_inline_expression(
    expr_source: &str,
    options: &FormatOptions,
) -> Result<String, FormatError> {
    let wide = oxc_formatter_core::LineWidth::try_from(oxc_formatter_core::LineWidth::MAX)
        .unwrap_or(options.js.line_width);
    format_expr_core(expr_source, options, wide, true)
}

/// Format a content expression (`{expr}`, `{@html e}`, `{@render e()}`) that
/// renders at markup nesting `depth`.
///
/// The body is formatted at indent 0, so a wrap decision made against the full
/// `line_width` ignores the `depth` levels of indent it will sit at once
/// spliced — a line that "fits" at column 0 overflows once nested. Narrow the
/// width by that lead so breaks land where prettier-plugin-svelte puts them,
/// then push every continuation line out to the nesting depth (the first line
/// stays inline after the opening `{`).
fn format_content_expression(
    expr_source: &str,
    options: &FormatOptions,
    depth: usize,
) -> Result<String, FormatError> {
    let indent_width = options.js.indent_width.value() as usize;
    let lead = depth * indent_width;
    let narrowed = (options.js.line_width.value() as usize).saturating_sub(lead);
    let line_width =
        oxc_formatter_core::LineWidth::try_from(narrowed as u16).unwrap_or(options.js.line_width);
    let formatted = format_expr_core(expr_source, options, line_width, false)?;
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

/// Splice a destructuring pattern's source span with its formatted
/// version. Mirrors `push_bare_expression` but routes through
/// `format_pattern_source` so default values and rest elements survive.
fn push_pattern_at_span(
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

/// Emit one edit replacing a `{#snippet}` header's `name<…>(params)` with a
/// width-driven-formatted version. The header span runs from the snippet name
/// to the `)` that closes its parameter list (generics in between are sliced
/// from source verbatim, so they survive). Only called when there is at least
/// one parameter.
fn push_snippet_header(
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

/// Format a snippet header `name<…>(params)` by wrapping it as a function
/// signature (`function name<…>(params) {}`) and formatting with normal,
/// width-driven breaking (NOT the single-line `Expand::Never` path the block
/// headers use). The width is narrowed by the markup depth and the
/// `{#snippet ` prefix so breaks land where prettier-plugin-svelte puts them.
fn format_snippet_header_source(
    header_src: &str,
    options: &FormatOptions,
    depth: usize,
) -> Result<String, FormatError> {
    let allocator = Allocator::default();
    let source_type = if options.typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };

    let wrapped = format!("function {header_src} {{}}");
    let parser_ret = Parser::new(&allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.errors.is_empty() {
        return Err(FormatError::ScriptParse(format!("{:?}", parser_ret.errors)));
    }

    let indent_width = options.js.indent_width.value() as usize;
    // `{#snippet ` is 10 columns; the header then sits at `depth` indent.
    let lead = depth * indent_width + "{#snippet ".len();
    let narrowed = (options.js.line_width.value() as usize).saturating_sub(lead);

    let mut js = options.js.clone();
    js.line_width =
        oxc_formatter_core::LineWidth::try_from(narrowed as u16).unwrap_or(options.js.line_width);
    // NOTE: do NOT set `expand = Never` — width-driven breaking is the point.

    let formatted = format_program(&allocator, &parser_ret.program, js, None)
        .print()
        .map_err(|e| FormatError::ScriptParse(format!("{e:?}")))?
        .into_code();

    // Output: `function name<…>(params) {}` (params possibly multi-line).
    // Peel the leading `function ` and the trailing empty body ` {}`.
    let s = formatted.trim();
    let body = s.strip_prefix("function ").unwrap_or(s).trim_end();
    let header = body.strip_suffix("{}").unwrap_or(body).trim_end();

    if !header.contains('\n') {
        return Ok(header.to_string());
    }
    // Push continuation lines out to the snippet's markup depth (the first line
    // stays inline after `{#snippet `).
    let prefix = if options.js.indent_style.is_tab() {
        "\t".repeat(depth)
    } else {
        " ".repeat(depth * indent_width)
    };
    Ok(crate::reindent::reindent(header, &prefix, true))
}

/// Format a destructuring pattern. Patterns like `{a, b = 1}`,
/// `[a, ...rest]`, or `{ a: { b } }` aren't valid as bare expressions
/// (object literals can't carry default values), so we wrap them in a
/// `let PATTERN = $$;` declaration and parse the whole thing as a
/// Program. The formatted declaration is then sliced back down to just
/// the pattern body.
///
/// We force `line_width` to its maximum so nested patterns stay on one
/// line — multi-line patterns inside `{#each as ...}` would land
/// across the block header, which Svelte's parser then can't re-read.
pub(crate) fn format_pattern_source(
    pattern_source: &str,
    options: &FormatOptions,
) -> Result<String, FormatError> {
    const SENTINEL: &str = "__rsvelte_fmt_rhs__";
    let allocator = Allocator::default();
    let source_type = if options.typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };

    let wrapped = format!("let {pattern_source} = {SENTINEL};");
    let parser_ret = Parser::new(&allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.errors.is_empty() {
        return Err(FormatError::ScriptParse(format!("{:?}", parser_ret.errors)));
    }

    // Build a single-line copy of JsFormatOptions for this pattern only.
    // Setting `expand = Never` plus a very wide `line_width` keeps even
    // deeply nested destructuring on one line — the multi-line form
    // would land across a Svelte block header (`{#each as ...}`) and
    // re-parse incorrectly.
    let mut single_line = options.js.clone();
    single_line.line_width =
        oxc_formatter_core::LineWidth::try_from(u16::MAX).unwrap_or(single_line.line_width);
    single_line.expand = oxc_formatter::Expand::Never;

    let formatted = format_program(&allocator, &parser_ret.program, single_line, None)
        .print()
        .map_err(|e| FormatError::ScriptParse(format!("{e:?}")))?
        .into_code();

    // Output shape: `let <pattern> = __rsvelte_fmt_rhs__;\n`. Strip the
    // leading `let ` and the trailing ` = __rsvelte_fmt_rhs__;` so we
    // are left with the formatted pattern.
    let s = formatted.trim_end();
    let stripped_prefix = s.strip_prefix("let ").unwrap_or(s);
    let suffix = format!(" = {SENTINEL};");
    let pattern = stripped_prefix
        .strip_suffix(&suffix)
        .unwrap_or(stripped_prefix);
    let candidate = pattern.trim().to_string();

    // Some patterns (deeply nested destructuring) get hard-wrapped by
    // oxc_formatter regardless of `line_width` / `expand`. A multi-line
    // pattern can't safely sit inside a Svelte block header
    // (`{#each as ...}` re-reads the header as a single line), so
    // fall back to a light source-normalization for those.
    if candidate.contains('\n') {
        return Ok(light_normalize_pattern(pattern_source));
    }
    Ok(candidate)
}

/// Conservative whitespace-only normalization used when the JS formatter
/// produces a multi-line pattern.
///
/// Mirrors Prettier's destructuring spacing rules: braces (`{` / `}`)
/// always carry one inner space when non-empty; brackets (`[` / `]`)
/// and parens carry none; commas and colons are followed by exactly
/// one space.
fn light_normalize_pattern(src: &str) -> String {
    let bytes = src.as_bytes();
    let mut out = String::with_capacity(src.len());
    let mut i = 0;
    while i < bytes.len() {
        let b = bytes[i];
        match b {
            b' ' | b'\t' | b'\n' | b'\r' => {
                // Drop existing whitespace; the rules below re-insert it.
            }
            b'{' => {
                out.push('{');
                // Peek past whitespace to see whether the brace is empty.
                let mut j = i + 1;
                while j < bytes.len() && matches!(bytes[j], b' ' | b'\t' | b'\n' | b'\r') {
                    j += 1;
                }
                if j < bytes.len() && bytes[j] != b'}' {
                    out.push(' ');
                }
            }
            b'}' => {
                if !out.ends_with('{') && !out.ends_with(' ') {
                    out.push(' ');
                }
                out.push('}');
            }
            b',' | b':' => {
                if out.ends_with(' ') {
                    out.pop();
                }
                out.push(b as char);
                // Lookahead for next non-whitespace.
                let mut j = i + 1;
                while j < bytes.len() && matches!(bytes[j], b' ' | b'\t' | b'\n' | b'\r') {
                    j += 1;
                }
                if j < bytes.len() && !matches!(bytes[j], b'}' | b']' | b')') {
                    out.push(' ');
                }
            }
            other => out.push(other as char),
        }
        i += 1;
    }
    out
}

fn strip_outer_parens(s: &str) -> &str {
    let trimmed = s.trim();
    let Some(inner) = trimmed.strip_prefix('(').and_then(|s| s.strip_suffix(')')) else {
        return s;
    };
    if outer_parens_match(inner) { inner } else { s }
}

fn outer_parens_match(inner: &str) -> bool {
    let mut depth: i32 = 0;
    for c in inner.chars() {
        match c {
            '(' => depth += 1,
            ')' => {
                depth -= 1;
                if depth < 0 {
                    return false;
                }
            }
            _ => {}
        }
    }
    depth == 0
}
