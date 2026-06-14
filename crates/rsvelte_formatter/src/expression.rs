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
    for (i, node) in fragment.nodes.iter().enumerate() {
        if crate::prettier_ignore::preceded_by_prettier_ignore(&fragment.nodes, i) {
            continue;
        }
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
                // Normalize extra whitespace between `{` and `#`/`:` in the
                // block opener: `{     #if cond}` → `{#if cond}`.
                normalize_block_opener_ws(source, current.start, edits);
                // Normalize leading whitespace before the test expression, e.g.
                // `{#if   cond}` → `{#if cond}`.
                if let Some(start) = current.test.start() {
                    normalize_leading_ws_before_expr(source, start, edits);
                }
                // push_bare_expression also strips any unnecessary source-level
                // outer parens (`{#if (b)}` → `{#if b}`) and returns the
                // effective end of the edit (which may be past the AST expression
                // end when parens were consumed).
                let effective_end = push_bare_expression(source, &current.test, options, edits)?;
                // Trim trailing whitespace before the header `}` — e.g.
                // `{#if cond }` → `{#if cond}`.
                trim_trailing_ws_before_close_brace(source, effective_end, edits);
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
            // Normalize extra whitespace between `{` and `#` in the opener.
            normalize_block_opener_ws(source, blk.start, edits);
            // Normalize leading whitespace before the iterable expression, e.g.
            // `{#each  items as x}` → `{#each items as x}`.
            if let Some(start) = blk.expression.start() {
                normalize_leading_ws_before_expr(source, start, edits);
            }
            push_bare_expression(source, &blk.expression, options, edits)?;
            if let Some(ctx) = &blk.context {
                push_pattern_at_span(source, ctx, options, edits)?;
            }
            if let Some(key) = &blk.key {
                push_brace_wrapped_expression(source, key, options, edits)?;
                // Ensure a space before the key's opening `(`.
                // prettier-plugin-svelte always emits a space before the key
                // parens regardless of what appears between the context binding
                // and the paren (e.g. `, idx`).
                // Find the `(` immediately before `key.start()` and insert a
                // space before it if the preceding character is not whitespace.
                if let Some(key_start) = key.start() {
                    // The `(` should be the character immediately before the
                    // key expression start.
                    let before_key = source.get(..key_start as usize).unwrap_or("");
                    // Walk backward skipping the key itself to find the `(`.
                    // In practice `(` is at key_start - 1 but guard with scan.
                    if let Some(paren_pos) = before_key.rfind('(') {
                        // Only act when the char before `(` is NOT whitespace
                        // (meaning there's no space yet).
                        let before_paren = before_key.get(..paren_pos).unwrap_or("");
                        let last_char = before_paren.chars().next_back();
                        if !matches!(last_char, None | Some(' ') | Some('\t')) {
                            edits.push((paren_pos as u32, paren_pos as u32, " ".to_string()));
                        }
                    }
                }
                // Trim trailing whitespace after the key's closing `)` before the
                // header `}` — e.g. `{#each arr as x (k) }` → `{#each arr as x (k)}`.
                if let Some(key_end) = key.end() {
                    // The key is wrapped in `(key)` in source; skip past the `)`.
                    let after_key = source
                        .get(key_end as usize..)
                        .and_then(|s| s.find(')').map(|i| key_end + i as u32 + 1));
                    if let Some(after_paren) = after_key {
                        trim_trailing_ws_before_close_brace(source, after_paren, edits);
                    }
                }
            } else if let Some(ctx) = &blk.context {
                // No key — trim trailing whitespace between context and the
                // header `}` (e.g. `{#each arr as x }` → `{#each arr as x}`).
                if let Some(ctx_end) = ctx.end() {
                    trim_trailing_ws_before_close_brace(source, ctx_end, edits);
                }
            }
            collect_template_edits(source, &blk.body, child_depth, options, edits)?;
            if let Some(fb) = &blk.fallback {
                collect_template_edits(source, fb, child_depth, options, edits)?;
            }
        }
        TemplateNode::AwaitBlock(blk) => {
            // Normalize extra whitespace between `{` and `#` in the opener.
            normalize_block_opener_ws(source, blk.start, edits);
            // When the pending block is empty (whitespace-only) and there is a
            // `{:then value}` or `{:catch error}` separator, prettier-plugin-svelte
            // collapses the two headers into one:
            //   `{#await expr}\n{:then value}` → `{#await expr then value}`
            //   `{#await expr}\n{:catch error}` → `{#await expr catch error}`
            // Emit a single rewrite spanning the entire collapsed region instead
            // of the individual expression/pattern edits — those would conflict
            // with the large rewrite if emitted separately.
            let collapsed = if await_pending_is_empty(blk.pending.as_ref()) {
                try_collapse_await_header(source, blk, options)?
            } else {
                None
            };
            // When the await block is already in shorthand form (`pending` is
            // `None`) but the `then` body is empty, strip the `then value`
            // clause entirely: `{#await expr then value}{/await}` →
            // `{#await expr}{/await}`. This matches prettier-plugin-svelte's
            // behaviour.
            let stripped = if blk.pending.is_none()
                && blk.value.is_some()
                && blk.catch.is_none()
                && blk.then.as_ref().is_some_and(is_empty_fragment_for_await)
            {
                try_strip_await_then_clause(source, blk, options)?
            } else {
                None
            };
            if let Some((rewrite_start, rewrite_end, replacement)) = collapsed.or(stripped) {
                edits.push((rewrite_start, rewrite_end, replacement));
                // Only recurse into the non-pending body fragments.
                if let Some(frag) = &blk.then {
                    collect_template_edits(source, frag, child_depth, options, edits)?;
                }
                if let Some(frag) = &blk.catch {
                    collect_template_edits(source, frag, child_depth, options, edits)?;
                }
            } else {
                // Normalize leading whitespace: `{#await  expr}` → `{#await expr}`.
                if let Some(start) = blk.expression.start() {
                    normalize_leading_ws_before_expr(source, start, edits);
                }
                let expr_end = push_bare_expression(source, &blk.expression, options, edits)?;
                // `blk.value` is the binding from `{#await expr then binding}` (header
                // inline) when pending is None, or from `{:then binding}` (separator)
                // when pending is Some.  Only treat it as a header binding in the first
                // case; in the second case we always trim the header expression trailing
                // whitespace and handle the separator binding separately below.
                if blk.pending.is_none() {
                    if let Some(v) = &blk.value {
                        push_pattern_at_span(source, v, options, edits)?;
                        // Trim `{#await expr then value }` → `{#await expr then value}`.
                        if let Some(v_end) = v.end() {
                            trim_trailing_ws_before_close_brace(source, v_end, edits);
                        }
                    } else {
                        // No `then` clause in the header — trim trailing whitespace
                        // before the `}`: `{#await []    }` → `{#await []}`.
                        trim_trailing_ws_before_close_brace(source, expr_end, edits);
                    }
                } else {
                    // 3-part form: header is `{#await expr}`, trim its trailing ws.
                    trim_trailing_ws_before_close_brace(source, expr_end, edits);
                    // The `:then binding` is handled below via `blk.value`.
                    if let Some(v) = &blk.value {
                        // Normalize `{   :then i}` → `{:then i}`.
                        if let Some(v_start) = v.start() {
                            normalize_separator_opener_before(source, v_start, edits);
                        }
                        push_pattern_at_span(source, v, options, edits)?;
                        // Trim `{:then i   }` → `{:then i}`.
                        if let Some(v_end) = v.end() {
                            trim_trailing_ws_before_close_brace(source, v_end, edits);
                        }
                    }
                }
                if let Some(e) = &blk.error {
                    // Normalize `{   :catch e}` → `{:catch e}`.
                    if let Some(e_start) = e.start() {
                        normalize_separator_opener_before(source, e_start, edits);
                    }
                    push_pattern_at_span(source, e, options, edits)?;
                    // Trim `{:catch error }` → `{:catch error}`.
                    if let Some(e_end) = e.end() {
                        trim_trailing_ws_before_close_brace(source, e_end, edits);
                    }
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
        }
        TemplateNode::KeyBlock(blk) => {
            // Normalize extra whitespace between `{` and `#` in the opener.
            normalize_block_opener_ws(source, blk.start, edits);
            // Normalize leading whitespace: `{#key  expr}` → `{#key expr}`.
            if let Some(start) = blk.expression.start() {
                normalize_leading_ws_before_expr(source, start, edits);
            }
            let effective_end = push_bare_expression(source, &blk.expression, options, edits)?;
            // Trim `{#key expr }` → `{#key expr}`.
            trim_trailing_ws_before_close_brace(source, effective_end, edits);
            collect_template_edits(source, &blk.fragment, child_depth, options, edits)?;
        }
        TemplateNode::SnippetBlock(blk) => {
            // Normalize extra whitespace between `{` and `#` in the opener.
            normalize_block_opener_ws(source, blk.start, edits);
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
///
/// Also strips any unnecessary outer parentheses that the source wraps around
/// the expression (e.g. `{#if (b)}` → `{#if b}`, `{#each (c) as x}` →
/// `{#each c as x}`). Returns the effective end position of the edit (which
/// may be past the original expression end if source parens were consumed).
fn push_bare_expression(
    source: &str,
    expr: &Expression,
    options: &FormatOptions,
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
    let formatted = format_inline_expression(slice, options)?;

    // prettier-plugin-svelte wraps assignment expressions in block-header
    // positions with parentheses to make intent clear:
    //   `{#if a = 0}` → `{#if (a = 0)}`
    //   `{#key c = 0}` → `{#key (c = 0)}`
    // OXC formats `(a = 0);` as `a = 0;` (statement context strips parens),
    // so we must re-add them when the expression is a top-level assignment.
    let formatted = if is_top_level_assignment(slice, options.typescript) {
        format!("({formatted})")
    } else {
        formatted
    };

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

/// Returns `true` when `expr_source` (trimmed) is a top-level assignment
/// expression (includes `=`, `+=`, `-=`, etc.).
/// Used to decide whether to wrap the formatted result in `()` in block-header
/// positions where prettier-plugin-svelte always parenthesises assignments.
fn is_top_level_assignment(expr_source: &str, typescript: bool) -> bool {
    let allocator = Allocator::default();
    let source_type = if typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };
    let wrapped = format!("({expr_source});");
    let parser_ret = Parser::new(&allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.errors.is_empty() {
        return false;
    }
    let Some(oxc_ast::ast::Statement::ExpressionStatement(stmt)) = parser_ret.program.body.first()
    else {
        return false;
    };
    // Unwrap a single layer of ParenthesizedExpression (from our `(expr)` wrapper)
    // and check whether the inner expression is an assignment.
    let inner = match &stmt.expression {
        oxc_ast::ast::Expression::ParenthesizedExpression(p) => &p.expression,
        other => other,
    };
    matches!(inner, oxc_ast::ast::Expression::AssignmentExpression(_))
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
        let before = source.get(..start as usize)?;
        let chars_before: Vec<(usize, char)> = before.char_indices().collect();
        // Walk backward, skipping spaces/tabs; stop at anything else.
        let mut paren_pos: Option<u32> = None;
        for &(pos, ch) in chars_before.iter().rev() {
            match ch {
                ' ' | '\t' => continue,
                '(' => {
                    paren_pos = Some(pos as u32);
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

/// Returns `true` when the pending fragment of an `{#await}` block is **present**
/// but contains only whitespace — i.e., the block was written in the expanded form
/// `{#await expr}\n{:then value}` with nothing between the headers.
///
/// Returns `false` when `pending` is `None` (the source already uses the
/// shorthand `{#await expr then value}` form and should not be re-collapsed).
pub(crate) fn await_pending_is_empty(
    pending: Option<&rsvelte_core::ast::template::Fragment>,
) -> bool {
    match pending {
        None => false, // shorthand form — already collapsed in source
        Some(frag) => frag.nodes.iter().all(|n| {
            matches!(n, rsvelte_core::ast::template::TemplateNode::Text(t) if t.data.trim().is_empty())
        }),
    }
}

/// Attempt to collapse an `{#await expr}` block with an empty pending body and a
/// `{:then value}` or `{:catch error}` separator into a single header:
///   `{#await expr}\n\n{:then value}` → `{#await expr then value}`
///
/// Returns `(edit_start, edit_end, replacement)` covering the entire region from
/// `{#await` through the closing `}` of the separator header. When the block
/// can't be collapsed (no value/error binding found, span out of range, etc.)
/// returns `None` — the caller falls back to the individual-edit path.
fn try_collapse_await_header(
    source: &str,
    blk: &rsvelte_core::ast::template::AwaitBlock,
    options: &FormatOptions,
) -> Result<Option<(u32, u32, String)>, FormatError> {
    // Determine which separator we're collapsing and its keyword + binding.
    let (keyword, binding) = if blk.then.is_some() && blk.value.is_some() {
        ("then", blk.value.as_ref())
    } else if blk.catch.is_some() && blk.error.is_some() {
        ("catch", blk.error.as_ref())
    } else {
        // No collapsible binding — fall back.
        return Ok(None);
    };

    let binding = binding.expect("checked above");

    // Formatted expression (the promise / async value).
    let (Some(expr_start), Some(expr_end)) = (blk.expression.start(), blk.expression.end()) else {
        return Ok(None);
    };
    let expr_src = source
        .get(expr_start as usize..expr_end as usize)
        .unwrap_or("")
        .trim();
    if expr_src.is_empty() {
        return Ok(None);
    }
    let fmt_expr = format_inline_expression(expr_src, options)?;

    // Formatted binding pattern (`value` / `error`).
    let (Some(bind_start), Some(bind_end)) = (binding.start(), binding.end()) else {
        return Ok(None);
    };
    let bind_src = source
        .get(bind_start as usize..bind_end as usize)
        .unwrap_or("")
        .trim();
    // If no binding source, skip collapse.
    if bind_src.is_empty() {
        return Ok(None);
    }
    let fmt_bind =
        format_pattern_source(bind_src, options).unwrap_or_else(|_| bind_src.to_string());

    // Find the `}` that closes the `{:then value}` / `{:catch error}` separator
    // header — it comes immediately after the binding expression end.
    let separator_close = source
        .get(bind_end as usize..)
        .and_then(|s| s.find('}'))
        .map(|rel| bind_end as usize + rel + 1);
    let Some(separator_close) = separator_close else {
        return Ok(None);
    };

    let replacement = format!("{{#await {fmt_expr} {keyword} {fmt_bind}}}");
    Ok(Some((blk.start, separator_close as u32, replacement)))
}

/// Returns `true` when a fragment contains only whitespace-only text nodes or
/// is entirely empty — used to detect an empty `then` body in a shorthand
/// `{#await expr then value}{/await}` block.
fn is_empty_fragment_for_await(frag: &rsvelte_core::ast::template::Fragment) -> bool {
    frag.nodes.iter().all(|n| {
        matches!(n, rsvelte_core::ast::template::TemplateNode::Text(t) if t.data.trim().is_empty())
    })
}

/// Strip the `then value` clause from a shorthand await block that has an
/// empty then body: `{#await expr then value}{/await}` → the rewrite span
/// covers from `blk.start` to the `}` that closes the header (`{#await expr
/// then value}`), replacing it with `{#await expr}`.
///
/// Returns `None` when the span cannot be determined from the source.
fn try_strip_await_then_clause(
    source: &str,
    blk: &rsvelte_core::ast::template::AwaitBlock,
    options: &FormatOptions,
) -> Result<Option<(u32, u32, String)>, FormatError> {
    let (Some(expr_start), Some(expr_end)) = (blk.expression.start(), blk.expression.end()) else {
        return Ok(None);
    };
    let expr_src = source
        .get(expr_start as usize..expr_end as usize)
        .unwrap_or("")
        .trim();
    if expr_src.is_empty() {
        return Ok(None);
    }
    let fmt_expr = format_inline_expression(expr_src, options)?;

    // Find the `}` that closes the header after the `then value` portion.
    // `blk.value` is the binding pattern (e.g. `counter`).
    let Some(v) = &blk.value else {
        return Ok(None);
    };
    let Some(v_end) = v.end() else {
        return Ok(None);
    };
    let header_close = source
        .get(v_end as usize..)
        .and_then(|s| s.find('}'))
        .map(|rel| v_end as usize + rel + 1);
    let Some(header_close) = header_close else {
        return Ok(None);
    };

    let replacement = format!("{{#await {fmt_expr}}}");
    Ok(Some((blk.start, header_close as u32, replacement)))
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
    Ok(Some(format_attribute_value_expression(
        inner, options, attr_depth, extra,
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
            format_attribute_value_expression(member_src, options, attr_depth + 1, 0)
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
    extra_lead: usize,
) -> Result<String, FormatError> {
    // Narrow by the attribute's nesting indent (`attr_depth` levels) plus any
    // `extra_lead` columns the caller adds — e.g. the `name={` prefix once the
    // open tag is known to wrap, so a long value breaks where prettier puts it
    // (#795).
    let indent_width = options.js.indent_width.value() as usize;
    let lead = attr_depth * indent_width + extra_lead;
    let narrowed = (options.js.line_width.value() as usize).saturating_sub(lead);
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
    let full_width = options.js.line_width.value() as usize;
    let narrowed = full_width.saturating_sub(lead);
    let line_width =
        oxc_formatter_core::LineWidth::try_from(narrowed as u16).unwrap_or(options.js.line_width);
    let formatted = format_expr_core(expr_source, options, line_width, false)?;
    // A single-line value that overflows once the surrounding `{ }` are counted is
    // a shallow expression (ternary / binary) prettier wraps at its top level;
    // re-format narrowed by the braces so it breaks the same way. A value that is
    // already multi-line (an arrow / object body) is left as-is (its continuation
    // lines sit at `depth` with full width).
    let formatted = if !formatted.contains('\n')
        && lead + 1 + UnicodeWidthStr::width(formatted.as_str()) + 1 > full_width
    {
        let narrowed2 = full_width.saturating_sub(lead + 2);
        let lw2 = oxc_formatter_core::LineWidth::try_from(narrowed2 as u16)
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

/// After formatting an expression or pattern whose source span ends at
/// `after`, emit a deletion edit for any horizontal whitespace (spaces /
/// tabs) that sits between `after` and the next `}` in the source.
///
/// This trims trailing whitespace from Svelte block headers — e.g.
/// `{#if cond }` → `{#if cond}`, `{#each arr as x }` → `{#each arr as x}`.
/// Only triggers when the very next non-whitespace character is `}` so it
/// cannot accidentally remove meaningful whitespace before ` as `, ` then`,
/// `(key)`, etc.
fn trim_trailing_ws_before_close_brace(
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
fn normalize_separator_opener_before(
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

fn normalize_block_opener_ws(source: &str, block_start: u32, edits: &mut Vec<(u32, u32, String)>) {
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

fn normalize_leading_ws_before_expr(
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
    // The final snippet line looks like:
    //   `{depth_indent}{#snippet name<…>(params)}`
    // totalling `depth*indent + 10 + header_len + 1` columns.  The oxc-formatted
    // wrapper is `function name<…>(params) {}`, where `function ` (9) and ` {}` (3)
    // surround the header_len chars.  So oxc must not break when
    //   9 + header_len + 3  <=  narrowed
    //   header_len  <=  narrowed - 12
    // We want all headers that fit in the output to pass, i.e.
    //   header_len  <=  line_width - depth*indent - 11
    // Combining: narrowed - 12  >=  line_width - depth*indent - 11
    //            narrowed       >=  line_width - depth*indent + 1
    let base = (options.js.line_width.value() as usize).saturating_sub(depth * indent_width);
    let narrowed = base.saturating_add(1);

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

    // prettier-plugin-svelte preserves the original source representation for
    // patterns: string-key quotes are kept as-is, computed keys preserve
    // internal whitespace. OXC normalises all of this (double-quote, strip
    // quotes from valid-identifier keys, etc.), so we use the source-based
    // light_normalize_pattern in all cases.
    //
    // For the multi-line case OXC hard-wraps regardless of `line_width` /
    // `expand`; for the single-line case OXC changes quote style.  Either way
    // the source-normalizing path is more faithful to the oracle.
    let _ = candidate; // keep the OXC parse/format step for error-detection only
    Ok(light_normalize_pattern(pattern_source))
}

/// Conservative whitespace-only normalization used when the JS formatter
/// produces a multi-line pattern.
///
/// Mirrors Prettier's destructuring spacing rules: braces (`{` / `}`)
/// always carry one inner space when non-empty; brackets (`[` / `]`)
/// and parens carry none; commas and colons are followed by exactly
/// one space.
///
/// Template-literal `${…}` expressions are passed through verbatim (no inner
/// spaces inserted) to match `oxfmt`'s behaviour: `` [`leng${th}`] `` stays
/// `` [`leng${th}`] ``, not `` [`leng${ th }`] ``.
///
/// Computed object keys `[expr]` are passed through verbatim, preserving
/// the original source whitespace and string-quote style.
/// Return the UTF-8 byte sequence starting at byte offset `i` in `src`.
/// For ASCII bytes this is a 1-byte slice; for multi-byte sequences we read
/// the length from the leading byte.  Always returns at least one byte (the
/// leading byte) so callers can advance `i` by `seq.len()` safely.
#[inline]
fn utf8_seq_at(src: &str, i: usize) -> &str {
    let bytes = src.as_bytes();
    let b = bytes[i];
    let seq_len = if b < 0x80 {
        1
    } else if b & 0xF8 == 0xF0 {
        4
    } else if b & 0xF0 == 0xE0 {
        3
    } else {
        2 // 0xC0..0xDF or stray continuation byte
    };
    let end = (i + seq_len).min(src.len());
    // SAFETY: we computed seq_len from the UTF-8 leading byte so end is a
    // char boundary; if the source is valid UTF-8 (it came from a &str) this
    // is always safe.
    &src[i..end]
}

fn light_normalize_pattern(src: &str) -> String {
    let bytes = src.as_bytes();
    let mut out = String::with_capacity(src.len());
    // Track brace/bracket nesting to detect computed keys.
    // `brace_depth` counts `{` / `}` (object pattern levels).
    // `bracket_depth` counts `[` / `]` (array pattern levels).
    // A `[` that immediately follows `,` / `{` / ` ` (i.e., property position
    // in an object pattern) is a computed key and should be passed verbatim.
    let mut brace_depth: u32 = 0;
    let mut bracket_depth: u32 = 0;
    // Last non-whitespace byte emitted to `out`, used to detect computed keys.
    let mut last_non_ws: u8 = 0;
    let mut i = 0;
    while i < bytes.len() {
        let b = bytes[i];

        // When inside a template literal string, pass chars through verbatim
        // until the matching close backtick (tracking `${…}` nesting).
        if b == b'`' {
            out.push('`');
            i += 1;
            let mut depth: u32 = 0; // nesting level of `${…}` expressions
            while i < bytes.len() {
                match bytes[i] {
                    b'`' if depth == 0 => {
                        out.push('`');
                        i += 1;
                        break; // end of this template literal
                    }
                    b'\\' => {
                        // Escape sequence — emit both bytes verbatim using
                        // char-boundary-safe slice rather than `as char`.
                        out.push('\\');
                        i += 1;
                        if i < bytes.len() {
                            let seq = utf8_seq_at(src, i);
                            out.push_str(seq);
                            i += seq.len();
                        }
                    }
                    b'$' if i + 1 < bytes.len() && bytes[i + 1] == b'{' => {
                        // Template expression `${…}` — emit both chars and
                        // recurse into the expression verbatim, tracking braces.
                        out.push('$');
                        out.push('{');
                        i += 2;
                        depth += 1;
                    }
                    b'{' if depth > 0 => {
                        out.push('{');
                        i += 1;
                        depth += 1;
                    }
                    b'}' if depth > 0 => {
                        out.push('}');
                        i += 1;
                        depth -= 1;
                    }
                    _ => {
                        // Verbatim passthrough — use char-boundary-safe slice.
                        let seq = utf8_seq_at(src, i);
                        out.push_str(seq);
                        i += seq.len();
                    }
                }
            }
            continue;
        }

        // Single- and double-quoted string literals: pass verbatim to preserve
        // the original quote style (the oracle does not normalize string quotes
        // in destructuring pattern keys: `{ 'prop-1': x }` stays single-quoted).
        if b == b'\'' || b == b'"' {
            let quote = b;
            out.push(quote as char);
            last_non_ws = quote;
            i += 1;
            while i < bytes.len() {
                match bytes[i] {
                    c if c == quote => {
                        out.push(quote as char);
                        i += 1;
                        break;
                    }
                    b'\\' => {
                        out.push('\\');
                        i += 1;
                        if i < bytes.len() {
                            let seq = utf8_seq_at(src, i);
                            out.push_str(seq);
                            i += seq.len();
                        }
                    }
                    _ => {
                        let seq = utf8_seq_at(src, i);
                        out.push_str(seq);
                        i += seq.len();
                    }
                }
            }
            continue;
        }

        // A `[` that appears in property position inside an object pattern
        // (i.e., after `{` or `,`) is a *computed key*. Its content should be
        // passed through verbatim to preserve the original whitespace and
        // string-quote style (e.g. `split('')` must not become `split("")`).
        if b == b'[' && brace_depth > 0 && bracket_depth == 0 && matches!(last_non_ws, b'{' | b',')
        {
            // Emit the `[` and copy until the matching `]`.
            out.push('[');
            i += 1;
            let mut depth: u32 = 1;
            while i < bytes.len() && depth > 0 {
                match bytes[i] {
                    b'[' => {
                        depth += 1;
                        out.push('[');
                        i += 1;
                    }
                    b']' => {
                        depth -= 1;
                        out.push(']');
                        i += 1;
                    }
                    b'\\' => {
                        out.push('\\');
                        i += 1;
                        if i < bytes.len() {
                            let seq = utf8_seq_at(src, i);
                            out.push_str(seq);
                            i += seq.len();
                        }
                    }
                    _ => {
                        let seq = utf8_seq_at(src, i);
                        out.push_str(seq);
                        i += seq.len();
                    }
                }
            }
            last_non_ws = b']';
            continue;
        }

        match b {
            b' ' | b'\t' | b'\n' | b'\r' => {
                // Drop existing whitespace; the rules below re-insert it.
            }
            b'{' => {
                brace_depth += 1;
                out.push('{');
                last_non_ws = b'{';
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
                brace_depth = brace_depth.saturating_sub(1);
                if !out.ends_with('{') && !out.ends_with(' ') {
                    out.push(' ');
                }
                out.push('}');
                last_non_ws = b'}';
            }
            b'[' => {
                bracket_depth += 1;
                out.push('[');
            }
            b']' => {
                bracket_depth = bracket_depth.saturating_sub(1);
                out.push(']');
            }
            b',' | b':' => {
                if out.ends_with(' ') {
                    out.pop();
                }
                out.push(b as char);
                last_non_ws = b;
                // Lookahead for next non-whitespace.
                let mut j = i + 1;
                while j < bytes.len() && matches!(bytes[j], b' ' | b'\t' | b'\n' | b'\r') {
                    j += 1;
                }
                if j < bytes.len() && !matches!(bytes[j], b'}' | b']' | b')') {
                    out.push(' ');
                }
            }
            b'=' => {
                // Default value assignment in destructuring pattern: `{ a = val }`.
                // Distinguish from compound/comparison operators by checking next char.
                // We emit spaces around `=` (but not `==`, `===`, `=>`, `!=`, `>=`, `<=`).
                let next = bytes.get(i + 1).copied().unwrap_or(0);
                if matches!(next, b'=' | b'>') {
                    // `==` / `===` / `=>` — emit as-is; no space manipulation.
                    out.push('=');
                } else {
                    // Plain `=` default value: ensure ` = ` spacing.
                    if !out.ends_with(' ') {
                        out.push(' ');
                    }
                    out.push('=');
                    // Lookahead for next non-whitespace.
                    let mut j = i + 1;
                    while j < bytes.len() && matches!(bytes[j], b' ' | b'\t' | b'\n' | b'\r') {
                        j += 1;
                    }
                    if j < bytes.len() {
                        out.push(' ');
                    }
                }
                last_non_ws = b'=';
            }
            other => {
                if other < 0x80 {
                    // ASCII: emit as a single char.
                    out.push(other as char);
                } else {
                    // Multi-byte UTF-8 sequence: determine length from the
                    // leading byte and copy the full sequence as a Rust char.
                    let seq_len = if other & 0xF8 == 0xF0 {
                        4
                    } else if other & 0xF0 == 0xE0 {
                        3
                    } else {
                        // 0xC0..0xDF two-byte sequence (or a stray continuation byte)
                        2
                    };
                    if let Some(slice) = src.get(i..i + seq_len) {
                        out.push_str(slice);
                        last_non_ws = other;
                        i += seq_len;
                        continue;
                    } else {
                        // Truncated sequence — emit best-effort.
                        out.push(other as char);
                    }
                }
                last_non_ws = other;
            }
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
