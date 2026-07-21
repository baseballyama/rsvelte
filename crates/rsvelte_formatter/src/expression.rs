use oxc_allocator::Allocator;
use oxc_formatter::format_program;
use oxc_parser::{ParseOptions as OxcParseOptions, Parser};
use oxc_span::SourceType;
use rsvelte_core::ast::arena::try_with_current_serialize_arena;
use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::{ExpressionTag, Fragment, TemplateNode};
use rsvelte_core::ast::typed_expr::JsNode;
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
            // `{@const x = e}` — the declaration is a `const` variable
            // declaration (the parser records its full source span, *including*
            // any TypeScript type annotation, on `tag.declaration`). Format it
            // as a `const` declaration so a type annotation like
            // `{@const _: never = x}` parses (a bare assignment-expression parse
            // would reject the `: Type`), while quotes / spacing still normalize
            // (`{@const foo = 'bar'}` → `{@const foo = "bar"}`).
            push_const_tag(
                source,
                tag.start,
                tag.end,
                &tag.declaration,
                depth,
                options,
                edits,
            )?;
        }
        TemplateNode::DeclarationTag(tag) => {
            // `{let x = e}` / `{const x = e}` — keyword-led VariableDeclaration.
            push_declaration_tag(
                source,
                tag.start,
                tag.end,
                &tag.declaration,
                depth,
                options,
                edits,
            )?;
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
            let mut is_first = true;
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
                // `{#if ` = 5 chars, `{:else if ` = 10 chars.
                let if_prefix_len = if is_first {
                    "{#if ".len()
                } else {
                    "{:else if ".len()
                };
                let effective_end = push_bare_expression(
                    source,
                    &current.test,
                    options,
                    depth,
                    if_prefix_len,
                    edits,
                )?;
                // Trim trailing whitespace before the header `}` — e.g.
                // `{#if cond }` → `{#if cond}`.
                trim_trailing_ws_before_close_brace(source, effective_end, edits);
                // Expand an inline-empty body `{#if cond} {/if}` →
                // `{#if cond}\n\n{/if}` (prettier-plugin-svelte's behaviour for
                // invalid empty blocks). When the body already has a newline, the
                // indent pass's `empty_forced_body` logic handles it instead.
                expand_inline_empty_block_body(&current.consequent, depth, options, edits);
                collect_template_edits(source, &current.consequent, child_depth, options, edits)?;
                match &current.alternate {
                    Some(alt) => match crate::indent::else_if_branch(alt) {
                        Some(chained) => {
                            current = chained;
                            is_first = false;
                        }
                        None => {
                            expand_inline_empty_block_body(alt, depth, options, edits);
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
            // `{#each ` = 7 chars.
            push_bare_expression(
                source,
                &blk.expression,
                options,
                depth,
                "{#each ".len(),
                edits,
            )?;
            if let Some(ctx) = &blk.context {
                push_pattern_at_span(source, ctx, options, edits)?;
            }
            if let Some(key) = &blk.key {
                // The each-key syntax is `(KEY)`. The Svelte AST stores only the
                // inner KEY expression span; the delimiter parens — and any
                // redundant parens the source wrote around the key — live OUTSIDE
                // that span. Reformat the key and re-emit it wrapped in a single
                // delimiter pair, consuming the source's paren nesting.
                //
                // Without this, a parenthesized / sequence key such as
                // `((a, b))` gains an extra paren layer (and a stray space) on
                // every pass — the formatter re-parenthesizes the sequence but
                // never removes the source parens — so it never converges.
                // prettier-plugin-svelte keeps `((a, b))` (sequence parens +
                // delimiter) and strips redundant non-sequence parens
                // (`((x.id))` → `(x.id)`); widening to the outermost source paren
                // pair (the delimiter) and wrapping the formatted inner key
                // reproduces both, idempotently.
                // Locate the outermost delimiter paren pair. The AST key span
                // excludes the delimiter parens AND any redundant parens the
                // source wrote around the key, so scan outward over consecutive
                // `(` / `)` (and horizontal whitespace) to reach the delimiter.
                let delim = match (key.start(), key.end()) {
                    (Some(ks), Some(ke)) => find_each_key_delimiter(source, ks, ke),
                    _ => None,
                };
                match delim {
                    Some((delim_open, delim_close_excl)) => {
                        // The key AS WRITTEN sits between the delimiter parens
                        // (redundant inner parens included). Formatting it yields
                        // the canonical inner form — redundant parens stripped, a
                        // sequence expression re-parenthesized — which we wrap in a
                        // single delimiter pair. This matches prettier-plugin-svelte
                        // (`((a, b))` for a sequence key, `(x.id)` for `((x.id))`)
                        // and, crucially, is idempotent: without it a sequence /
                        // parenthesized key gained a paren layer on every pass.
                        let inner = source
                            .get(delim_open as usize + 1..delim_close_excl as usize - 1)
                            .map(str::trim)
                            .unwrap_or("");
                        if !inner.is_empty() {
                            let formatted = format_inline_expression(inner, options)?;
                            // A long key OXC broke as a method chain is reindented to
                            // the block depth, mirroring the each-iterable path.
                            let formatted =
                                reindent_header_method_chain(&formatted, depth, options)
                                    .unwrap_or(formatted);
                            // Normalize the horizontal whitespace before the
                            // delimiter to a single space — prettier-plugin-svelte
                            // always emits `… (key)` regardless of the preceding
                            // context binding (e.g. `, idx`).
                            let before = source.get(..delim_open as usize).unwrap_or("");
                            let ws_start = before.trim_end_matches([' ', '\t']).len() as u32;
                            edits.push((ws_start, delim_close_excl, format!(" ({formatted})")));
                            // Trim trailing whitespace between the delimiter `)` and
                            // the header `}` (`{#each arr as x (k) }` → `… (k)}`).
                            trim_trailing_ws_before_close_brace(source, delim_close_excl, edits);
                        }
                    }
                    None => {
                        // Defensive fallback: valid each-key syntax always wraps
                        // the key in parens, so the delimiter scan normally
                        // succeeds. If it doesn't, keep the previous best-effort
                        // formatting rather than dropping the key edit entirely.
                        push_brace_wrapped_expression(source, key, options, edits)?;
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
            // When the block has a non-empty pending body but an empty `then` body
            // (and no `catch`), strip the empty `{:then value}` separator entirely:
            //   `{#await expr}\n  <input />\n{:then f}\n{/await}` →
            //   `{#await expr}\n  <input />\n{/await}`
            // This matches prettier-plugin-svelte's behaviour.
            let separator_stripped = if collapsed.is_none()
                && stripped.is_none()
                && blk.pending.is_some()
                && blk.value.is_some()
                && blk.catch.is_none()
                && blk.then.as_ref().is_some_and(is_empty_fragment_for_await)
            {
                try_strip_await_then_separator(source, blk)?
            } else {
                None
            };
            // Remember whether the separator-stripped path fired before
            // the ownership moves into `.or()`.
            let separator_stripped_fired = separator_stripped.is_some();
            if let Some((rewrite_start, rewrite_end, replacement)) =
                collapsed.or(stripped).or(separator_stripped)
            {
                edits.push((rewrite_start, rewrite_end, replacement));
                // When the separator-stripped path fires (pending has content,
                // `{:then …}` and its empty body are erased), we still need to
                // recurse into the pending fragment to format its children
                // (e.g. `<input>` → `<input />`). For the `collapsed` and
                // `stripped` paths the pending is either empty/whitespace-only
                // or absent, so no recursion is needed there.
                if separator_stripped_fired && let Some(frag) = &blk.pending {
                    collect_template_edits(source, frag, child_depth, options, edits)?;
                }
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
                // `{#await ` = 8 chars.
                let expr_end = push_bare_expression(
                    source,
                    &blk.expression,
                    options,
                    depth,
                    "{#await ".len(),
                    edits,
                )?;
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
                    // When the pending body is whitespace-only and there is no
                    // `then` / `catch` separator to collapse into, strip the
                    // whitespace so `{#await promise} {/await}` →
                    // `{#await promise}{/await}`. We only do this when there is
                    // nothing else in the block (no then, no catch), matching
                    // prettier-plugin-svelte's behaviour.
                    if blk.then.is_none()
                        && blk.catch.is_none()
                        && await_pending_is_empty(Some(frag))
                    {
                        for node in &frag.nodes {
                            if let TemplateNode::Text(t) = node
                                && crate::is_blank_text(t.data.as_str())
                            {
                                edits.push((t.start, t.end, String::new()));
                            }
                        }
                    } else {
                        collect_template_edits(source, frag, child_depth, options, edits)?;
                    }
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
            // `{#key ` = 6 chars.
            let effective_end = push_bare_expression(
                source,
                &blk.expression,
                options,
                depth,
                "{#key ".len(),
                edits,
            )?;
            // Trim `{#key expr }` → `{#key expr}`.
            trim_trailing_ws_before_close_brace(source, effective_end, edits);
            // Expand inline-empty body `{#key expr} {/key}` → blank-line form.
            expand_inline_empty_block_body(&blk.fragment, depth, options, edits);
            collect_template_edits(source, &blk.fragment, child_depth, options, edits)?;
        }
        TemplateNode::SnippetBlock(blk) => {
            // Normalize extra whitespace between `{` and `#` in the opener.
            normalize_block_opener_ws(source, blk.start, edits);
            if blk.parameters.is_empty() {
                // No params — just normalize the name (`{#snippet foo()}`).
                // `{#snippet ` = 10 chars.
                push_bare_expression(
                    source,
                    &blk.expression,
                    options,
                    depth,
                    "{#snippet ".len(),
                    edits,
                )?;
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

/// Split `inner` at the boundary just past its leading run of `//` line-comment
/// lines. Returns `(leading, rest)` where `leading` retains its trailing
/// newlines (callers trim as needed) and `rest` is everything after the comment
/// block. When `inner` has no leading `//` comment, `leading` is empty.
fn split_leading_line_comments(inner: &str) -> (&str, &str) {
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
        // trailing comments on the expression node are not included.
        let expr_source =
            if let (Some(es), Some(ee)) = (tag.expression.start(), tag.expression.end()) {
                source.get(es as usize..ee as usize).unwrap_or("").trim()
            } else {
                rest.trim()
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
fn push_declaration_tag(
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
fn push_const_tag(
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

/// Push a block-header expression that OXC broke as a *method chain*
/// (`node\n  .a()\n  .b()`) out to the block's depth. Returns `None` when
/// `formatted` is single-line, ends its first line at a logical operator, or was
/// not broken as a method chain — the cases the caller keeps as-is. reindent
/// prepends the prefix ON TOP of OXC's own 2-space indent, so `depth` levels
/// yields `(depth+1)`-level continuations.
fn reindent_header_method_chain(
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
fn push_bare_expression(
    source: &str,
    expr: &Expression,
    options: &FormatOptions,
    depth: usize,
    prefix_len: usize,
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
    // Compute the header suffix length — the text from the expression end to the
    // closing `}` of the block header (inclusive).  For `{#each expr as x (k)}`,
    // this is ` as x (k)}`.  For `{#if cond}`, it is `}`.  We scan the source
    // looking for the first `}` that is not nested inside `{…}`, `(…)`, or `[…]`.
    let suffix_len = compute_header_suffix_len(source, end as usize);
    // First format inline (single-line) to get the canonical expression text.
    let formatted = format_inline_expression(slice, options)?;
    // prettier-plugin-svelte uses `forceSingleLine: true` (internally `removeLines`)
    // for block-header expressions like `{#each}`, `{#if}`, etc.  This means all
    // non-hard line breaks in the formatted expression doc are replaced by spaces,
    // producing a single-line result even for wide array/object literals.
    //
    // OXC's formatter (unlike prettier) always breaks arrays/objects of significant
    // width into multiple lines, even with `Expand::Never` and `LineWidth::MAX`.
    // When the source expression is an array or object literal with no newlines,
    // collapse the multi-line OXC output back to a single line to match oracle.
    let formatted = if formatted.contains('\n')
        && starts_with_array_or_object_literal(slice)
        && !slice.contains('\n')
    {
        collapse_multiline_to_single_line(&formatted)
    } else {
        formatted
    };
    // prettier-plugin-svelte wraps a block-header expression across lines when
    // the expression itself is longer than the print width (OXC at `full_width`
    // would break it).  When the expression fits within `full_width` — even if
    // the full header line (prefix + expression + suffix) overflows 80 cols —
    // prettier keeps it inline.  This avoids break points at logical operators
    // (`&&`, `||`) that OXC would pick but prettier does not in block headers.
    //
    // When wrapping, we pass the full `line_width` to OXC.  Continuation lines
    // carry only the block's indent (not the keyword prefix), so using the full
    // width avoids over-wrapping inner call arguments.
    // Compute the full visible start-of-line width: indentation + block keyword prefix.
    // prettier-plugin-svelte breaks a block-header expression when the COMPLETE header
    // line (indent + keyword + expression + suffix-after-expression) would overflow the
    // print width, not just when the expression alone is wider than the print width.
    // E.g. `{#each table.call().filter() as column (column)}` can overflow even though
    // `table.call().filter()` alone fits within 80 chars.
    let lead_width = depth * indent_width + prefix_len;
    let formatted = if !formatted.contains('\n')
            && lead_width + UnicodeWidthStr::width(formatted.as_str()) + suffix_len > full_width
            // prettier-plugin-svelte never breaks array or object literals in
            // block headers even when they are far wider than the print width —
            // e.g. `{#each ["a", "b", "c", …] as x}` stays on one line.
            && !starts_with_array_or_object_literal(formatted.as_str())
    {
        // First, try at the full line width — OXC may already decide to break
        // when the expression alone overflows.
        let multi = format_expr_core(slice, options, options.js.line_width, false)?;
        // If full-width didn't break, try a narrower width computed from how
        // much room the expression actually has in the block header:
        //   available = full_width − lead_width − suffix_len
        // This mirrors the oracle's decision: a method chain breaks when the
        // complete header line overflows, even if the expression alone fits
        // within `full_width`.  We only use the narrowed result when OXC breaks
        // it as a method chain (hard line breaks starting with `.`).
        let multi = if multi.contains('\n') {
            multi
        } else {
            let expr_len = UnicodeWidthStr::width(formatted.as_str());
            let available = full_width.saturating_sub(lead_width + suffix_len);
            // Only narrow when the expression genuinely doesn't fit in the
            // available space; use `expr_len - 1` as the narrowed width to
            // force the break while giving inner content maximum room.
            if expr_len > available {
                let narrowed_width = oxc_formatter_core::LineWidth::try_from(
                    (expr_len.saturating_sub(1)).max(1) as u16,
                )
                .unwrap_or(options.js.line_width);
                format_expr_core(slice, options, narrowed_width, false)?
            } else {
                multi
            }
        };
        // Only accept a method-chain break (hard `.`-led continuation lines,
        // which prettier's removeLines keeps); OXC's soft argument-wrap breaks are
        // collapsed back to one line by the oracle.
        if let Some(reindented) = reindent_header_method_chain(&multi, depth, options) {
            reindented
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
            if let Some(collapsed) = collapse_expanded_arg_form(&multi) {
                collapsed
            } else {
                formatted
            }
        } else {
            // OXC kept it on one line, broke at a logical operator, or couldn't
            // determine an expanded-arg form — keep the inline version.
            formatted
        }
    } else {
        formatted
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
fn find_each_key_delimiter(source: &str, inner_start: u32, inner_end: u32) -> Option<(u32, u32)> {
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

/// If `frag` is a block body that contains ONLY inline-whitespace (no newline)
/// text nodes — e.g. `{#if true} {/if}` — expand each such text node to a blank
/// line (`\n\n{parent_indent}`) so the output becomes:
/// ```text
/// {#if true}
///
/// {/if}
/// ```
/// This mirrors prettier-plugin-svelte's behaviour for "invalid empty" blocks.
/// The `depth` is the block's nesting depth (the body renders at `depth + 1`);
/// `parent_indent` is the indent for the closing tag line.
///
/// Only fires when the fragment consists SOLELY of whitespace-only text nodes
/// with no newline — i.e. the source had an inline empty body (`{#if} {/if}`).
/// A block that already has a newline in the body text is handled by the
/// indent pass's `empty_forced_body` logic instead.
fn expand_inline_empty_block_body(
    frag: &rsvelte_core::ast::template::Fragment,
    depth: usize,
    options: &crate::options::FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    // Only act when EVERY node is a whitespace-only text without a newline.
    let all_inline_ws = frag.nodes.iter().all(|n| {
        matches!(n, rsvelte_core::ast::template::TemplateNode::Text(t)
            if crate::is_blank_text(t.data.as_str()) && !t.data.contains('\n'))
    });
    if !all_inline_ws || frag.nodes.is_empty() {
        return;
    }
    let parent_indent = if depth == 0 {
        String::new()
    } else {
        let indent_width = options.js.indent_width.value() as usize;
        if options.js.indent_style.is_tab() {
            "\t".repeat(depth)
        } else {
            " ".repeat(depth * indent_width)
        }
    };
    for node in &frag.nodes {
        if let rsvelte_core::ast::template::TemplateNode::Text(t) = node {
            edits.push((t.start, t.end, format!("\n\n{parent_indent}")));
        }
    }
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
            matches!(n, rsvelte_core::ast::template::TemplateNode::Text(t) if crate::is_blank_text(t.data.as_str()))
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
        matches!(n, rsvelte_core::ast::template::TemplateNode::Text(t) if crate::is_blank_text(t.data.as_str()))
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

/// Strip an empty `{:then value}` (or `{:catch error}`) separator from a
/// 3-part await block whose `then` (or `catch`) body is empty:
///   `{#await expr}\n  <child />\n{:then f}\n{/await}` →
/// emits an edit removing the `{:then f}\n` region so the output becomes
///   `{#await expr}\n  <child />\n{/await}`
///
/// The edit span runs from the opening `{` of `{:then …}` up to (but not
/// including) the opening `{` of `{/await}`.
///
/// Returns `None` when the span cannot be determined from the source.
fn try_strip_await_then_separator(
    source: &str,
    blk: &rsvelte_core::ast::template::AwaitBlock,
) -> Result<Option<(u32, u32, String)>, FormatError> {
    // We need the binding position to locate `{:then …}` by scanning backward.
    let binding = if blk.value.is_some() {
        blk.value.as_ref()
    } else if blk.error.is_some() {
        blk.error.as_ref()
    } else {
        return Ok(None);
    };
    let binding = binding.expect("checked above");

    let Some(bind_start) = binding.start() else {
        return Ok(None);
    };

    let bytes = source.as_bytes();

    // Scan backward from the binding start to find the `{` that opens the separator.
    let mut i = bind_start as usize;
    while i > 0 {
        i -= 1;
        match bytes[i] {
            b' ' | b'\t' | b'\n' | b'\r' => continue,
            // Skip past the keyword (`then` or `catch`) and the leading `:`
            // that the separator opener contains.  We stop at `{`.
            b'n' | b'h' | b'c' | b'a' | b't' | b'e' | b':' => continue,
            b'{' => break,
            _ => return Ok(None),
        }
    }
    if bytes.get(i) != Some(&b'{') {
        return Ok(None);
    }
    let separator_open = i as u32;

    // Find the start of `{/await}` by scanning backward from `blk.end`.
    // `blk.end` points just past `}` of `{/await}`, so the `{` is at
    // `blk.end - 8` for the 8-byte literal `{/await}`.  We verify by
    // searching backward for `{` while skipping only non-brace chars.
    let close_tag = b"{/await}";
    let end = blk.end as usize;
    if end < close_tag.len() {
        return Ok(None);
    }
    // Verify the close tag is present.
    let close_tag_start = end - close_tag.len();
    if source.as_bytes().get(close_tag_start..end) != Some(close_tag.as_ref()) {
        // Try with a space: `{/ await}` — not standard but defensive.
        return Ok(None);
    }
    let close_tag_pos = close_tag_start as u32;

    // The edit removes everything from `{` of `{:then …}` up to the `{` of
    // `{/await}` (non-inclusive), which erases the separator header and its
    // empty body (typically just a newline).
    if separator_open >= close_tag_pos {
        return Ok(None);
    }

    Ok(Some((separator_open, close_tag_pos, String::new())))
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
    let allocator = Allocator::default();
    let source_type = if options.typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };
    let wrapped = format!("({seq_src});");
    let parser_ret = Parser::new(&allocator, &wrapped, source_type)
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
        .map(|(c, _)| UnicodeWidthStr::width(c) + 1 /* space */)
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
        + UnicodeWidthStr::width(inline.as_str())
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
        !any_multiline && inner_indent_cols + UnicodeWidthStr::width(inline.as_str()) <= line_width;

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
/// Returns `true` if `s` contains the keyword `await` (not as part of a larger
/// identifier like `awaiting` or `getAwaited`).
fn has_word_await(s: &str) -> bool {
    let bytes = s.as_bytes();
    let mut i = 0;
    while i + 5 <= bytes.len() {
        if &bytes[i..i + 5] == b"await" {
            let before_ok = i == 0
                || !matches!(
                    bytes[i - 1],
                    b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'_' | b'$'
                );
            let after_ok = i + 5 >= bytes.len()
                || !matches!(
                    bytes[i + 5],
                    b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'_' | b'$'
                );
            if before_ok && after_ok {
                return true;
            }
        }
        i += 1;
    }
    false
}

fn format_expr_core(
    expr_source: &str,
    options: &FormatOptions,
    line_width: oxc_formatter_core::LineWidth,
    single_line: bool,
) -> Result<String, FormatError> {
    let allocator = Allocator::default();

    // The wrapper and source type used to parse the expression snippet vary
    // depending on whether the file is TypeScript and whether the expression
    // contains `await`:
    //
    // Case A — TypeScript + contains `await`:
    //   Use `const _rsvelte_x_ = (expr);` with `SourceType::ts().with_module(true)`.
    //
    //   `with_module(true)` is required so `await` is always a keyword: in
    //   `Unambiguous` mode a snippet without `import`/`export` is classified as
    //   a Script where `await` is a regular identifier.
    //
    //   The `const` wrapper (instead of the plain `(expr);`) prevents OXC from
    //   breaking a nested-await member chain across lines.  When the same
    //   expression appears as a top-level ExpressionStatement, OXC breaks it
    //   (`(await (await a.nested).one);` → multi-line); as a const initializer
    //   OXC keeps it on one line.  The const wrapper is only used when `await`
    //   is present to avoid applying the prefix-length compensation below to
    //   non-await expressions with nested multi-line content (objects, arrays)
    //   where the extra width would suppress correct inner breaking.
    //
    //   The const-wrapper prefix is exactly 20 characters (`const _rsvelte_x_ = `).
    //   We pass `line_width + 20` to the formatter so OXC's break decision is
    //   based on `len(expr)` rather than `20 + len(expr)`.  This offset is exact
    //   for the single-line case (the only case that matters here — multi-line
    //   await expressions inside Svelte templates are extremely rare and the
    //   const-wrapper context keeps them inline anyway).
    //
    //   Note: OXC already emits a space after `await` when the argument is a
    //   parenthesized expression (`await (x)`, not `await(x)`), so no post-pass
    //   is needed.
    //
    // Case B — TypeScript, no `await`:
    //   Use `(expr);` with `SourceType::ts().with_module(true)`.
    //   `with_module(true)` ensures consistent TS parsing (e.g., type casts),
    //   but since there is no `await` the expression statement wrapper doesn't
    //   cause the multi-line wrapping problem, so no const wrapper is needed.
    //
    // Case C — JavaScript:
    //   Use `(expr);` with `SourceType::default()` (Unambiguous).
    //   JavaScript template expressions cannot contain `await` as a keyword
    //   (template tags are synchronous), so no special handling is needed.
    const TS_CONST_PREFIX: &str = "const _rsvelte_x_ = ";
    // TS_CONST_PREFIX.len() == 20
    const TS_CONST_PREFIX_LEN: u16 = 20;

    let expr_has_await = options.typescript && has_word_await(expr_source);

    let (wrapped, source_type, use_const_wrapper) = if expr_has_await {
        // Case A: TS + await — use const wrapper to avoid multi-line breaking
        let wrapped = format!("{TS_CONST_PREFIX}({expr_source});");
        let source_type = SourceType::ts().with_module(true);
        (wrapped, source_type, true)
    } else if options.typescript {
        // Case B: TS, no await — plain paren wrapper, still ESM for consistency
        let wrapped = format!("({expr_source});");
        let source_type = SourceType::ts().with_module(true);
        (wrapped, source_type, false)
    } else {
        // Case C: JS
        let wrapped = format!("({expr_source});");
        let source_type = SourceType::default();
        (wrapped, source_type, false)
    };

    let parser_ret = Parser::new(&allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.diagnostics.is_empty() {
        return Err(FormatError::ScriptParse(format!(
            "{:?}",
            parser_ret.diagnostics
        )));
    }

    // Detect a top-level sequence (comma) expression — only needed for the JS
    // `(expr);` wrapper.  For the TS const wrapper, OXC naturally keeps the
    // parens that make a sequence expression valid in a const initializer
    // (`const _rsvelte_x_ = (a, b);`), so no extra detection is required.
    //
    // For the JS wrapper, oxc_formatter intentionally re-adds the outer parens
    // of a top-level `SequenceExpression` (its `NeedsParentheses` impl returns
    // true for an `ExpressionStatement` parent), and prettier-plugin-svelte
    // keeps them — so `{((a = 1), '')}` must stay parenthesized. Stripping
    // them below would wrongly emit `{(a = 1), ''}` (#799).
    //
    // A top-level ASSIGNMENT expression behaves identically: in expression
    // position (mustache / attribute value / block header) prettier-plugin-svelte
    // always wraps it in exactly one pair — `{x = 5}` → `{(x = 5)}`,
    // `{(y = [])}` → `{(y = [])}` — whereas OXC at statement position strips the
    // parens. Treat both the same way: strip every redundant outer pair, then
    // re-wrap once.
    let is_top_paren_wrapped = !use_const_wrapper
        && matches!(
            parser_ret.program.body.first(),
            Some(oxc_ast::ast::Statement::ExpressionStatement(stmt))
                if matches!(
                    stmt.expression,
                    oxc_ast::ast::Expression::SequenceExpression(_)
                        | oxc_ast::ast::Expression::AssignmentExpression(_)
                )
        );

    // Detect an object literal that is the HEAD of a larger expression — the
    // object of a member access or callee of a call (`{ … }[key]`, `{ … }.foo`,
    // `{ … }()`). OXC parenthesizes the leading object because at statement
    // position a bare `{` would start a block, so it emits `({ … })[key]`. In a
    // mustache/attribute value the expression is in expression position, so
    // prettier-plugin-svelte keeps no parens (`{ … }[key]`). `strip_outer_parens`
    // can't help here because the formatted string ends with `]`/`.`/`)` of the
    // postfix, not the wrapper `)`. Flag it so the leading pair is stripped below.
    let leading_object_head = !use_const_wrapper
        && matches!(
            parser_ret.program.body.first(),
            Some(oxc_ast::ast::Statement::ExpressionStatement(stmt))
                if expr_has_object_head(&stmt.expression)
        );

    let mut js = options.js.clone();
    // Compensate for the const-wrapper prefix: tell OXC the line is `prefix_len`
    // characters wider than the target so its break decision is based on the
    // expression length alone.
    if use_const_wrapper {
        let lw = line_width.value().saturating_add(TS_CONST_PREFIX_LEN);
        js.line_width =
            oxc_formatter_core::LineWidth::try_from(lw).unwrap_or(options.js.line_width);
    } else {
        js.line_width = line_width;
    }
    if single_line {
        js.expand = oxc_formatter::Expand::Never;
    }
    let formatted = format_program(&allocator, &parser_ret.program, js, None)
        .print()
        .map_err(|e| FormatError::ScriptParse(format!("{e:?}")))?
        .into_code();

    let s = formatted.trim_end().trim_end_matches(';').trim_end();
    // With semicolons set to "as needed", OXC prefixes expression statements
    // such as arrow functions with an ASI guard. Template expressions are not
    // statement-position code, so carrying that guard into `{...}` is invalid.
    let s = s.strip_prefix(';').unwrap_or(s);

    let result = if use_const_wrapper {
        // Strip the `const _rsvelte_x_ = ` prefix that was added as a wrapper.
        // OXC may strip the inner parens we added (e.g. `(expr)` → `expr`) or
        // keep them when needed for disambiguation (e.g. sequence expressions
        // `(a, b)` stay parenthesized inside a const initializer).
        //
        // Two cases depending on whether OXC kept the expression inline:
        //
        // Inline: `const _rsvelte_x_ = expr` → strip the `prefix ` (with space).
        //
        // Multiline: `const _rsvelte_x_ =\n  firstLine\n  continuation`
        //   → strip `const _rsvelte_x_ =\n` and trim leading whitespace from the
        //   first continuation line (OXC indents at 2 spaces), yielding
        //   `firstLine\n  continuation` — the same shape the old `(expr);` wrapper
        //   produced after outer-paren stripping.
        if let Some(rest) = s.strip_prefix(TS_CONST_PREFIX) {
            // Inline case: `const _rsvelte_x_ = expr`
            rest.to_string()
        } else if let Some(rest) = s.strip_prefix("const _rsvelte_x_ =\n") {
            // Multiline case: value on next line(s), indented by OXC
            rest.trim_start().to_string()
        } else {
            // Fallback (shouldn't occur): return unchanged
            s.to_string()
        }
    } else {
        // prettier-plugin-svelte keeps exactly ONE set of outer parens around a
        // top-level sequence (comma) expression in both mustache/attribute values
        // AND block headers (`{#if (a, b)}`). Normalise to exactly one pair by
        // stripping all redundant outer pairs then re-wrapping once. (#799)
        if is_top_paren_wrapped {
            let mut inner = s.trim();
            loop {
                let stripped = strip_outer_parens(inner).trim();
                if stripped == inner {
                    break;
                }
                inner = stripped;
            }
            format!("({inner})")
        } else if leading_object_head {
            // Strip the leading `( … )` pair OXC wrapped around the head object,
            // keeping the postfix (`[key]` / `.foo` / `( … )`) verbatim.
            strip_leading_paren_pair(s).unwrap_or_else(|| s.to_string())
        } else {
            strip_outer_parens(s).trim().to_string()
        }
    };
    Ok(result)
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
fn format_inline_expression(
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
fn format_content_expression(
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
fn format_content_expression_with_prefix(
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
    let formatted = if !formatted.contains('\n')
        && lead + overhead + UnicodeWidthStr::width(formatted.as_str()) > full_width
    {
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

/// Format the body of a `{@const <decl>}` tag — the `<decl>` is the body of a
/// `const` variable declaration (`<binding>[: Type] = <init>`).
///
/// The body is parsed as `const <decl>;` (TypeScript when `options.typescript`)
/// so a type annotation parses, then the `const ` prefix and trailing `;` are
/// sliced back off, leaving the formatted declaration body. Width handling
/// mirrors [`format_content_expression`]: the body is formatted at indent 0 and
/// the wrap width narrowed by the markup `depth`, then continuation lines are
/// re-indented to that depth.
fn format_const_declaration(
    decl_source: &str,
    options: &FormatOptions,
    depth: usize,
) -> Result<String, FormatError> {
    let allocator = Allocator::default();
    let source_type = if options.typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };

    let wrapped = format!("const {decl_source};");
    let parser_ret = Parser::new(&allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.diagnostics.is_empty() {
        return Err(FormatError::ScriptParse(format!(
            "{:?}",
            parser_ret.diagnostics
        )));
    }

    let indent_width = options.js.indent_width.value() as usize;
    let lead = depth * indent_width;
    let full_width = options.js.line_width.value() as usize;

    // Format the wrapped `const <decl>;` at `narrowed` columns and strip the
    // `const ` / `;` affixes back off, recovering the declaration body.
    let format_at = |narrowed: usize| -> Result<String, FormatError> {
        let line_width = oxc_formatter_core::LineWidth::try_from(narrowed.max(1) as u16)
            .unwrap_or(options.js.line_width);
        let mut js = options.js.clone();
        js.line_width = line_width;
        let formatted = format_program(&allocator, &parser_ret.program, js, None)
            .print()
            .map_err(|e| FormatError::ScriptParse(format!("{e:?}")))?
            .into_code();
        let s = formatted.trim_end();
        let s = s.strip_prefix("const ").unwrap_or(s);
        let s = s.strip_suffix(';').unwrap_or(s);
        Ok(s.trim_end().to_string())
    };

    // The JS formatter measures the body as `const <body>;` at indent 0. Two
    // different real-render columns apply, so a single narrowing can't be exact
    // for both:
    //   - The FIRST line is rendered `{@const <body-line-1>}` at column `lead`,
    //     i.e. `+2` wider than the JS `const <body-line-1>` (`{@const ` = 8 vs
    //     `const ` = 6; the `}`/`;` delta is 0). So its break decision wants
    //     `full - lead - 2`.
    //   - Every CONTINUATION line is re-indented to `lead` and carries no
    //     `{@const` prefix, so it fits iff `lead + <js line> <= full`, wanting
    //     `full - lead`.
    // Format at `full - lead` first so a multi-line body's continuation lines
    // (ternary branches, call args, …) get their true budget and aren't broken
    // one column too early. If the result is single-line and the real
    // `{@const <body>}` tag overflows the print width, re-format at
    // `full - lead - 2` — the tighter width that forces the break at exactly the
    // point prettier picks. This keeps single-line consts identical to the old
    // uniform `full - lead - 2` narrowing while relaxing the over-narrowing that
    // used to hit deeply-nested continuation lines.
    let formatted = format_at(full_width.saturating_sub(lead))?;
    // `{@const ` (8) + body + `}` (1) at column `lead`.
    let formatted = if !formatted.contains('\n')
        && lead + 9 + UnicodeWidthStr::width(formatted.as_str()) > full_width
    {
        format_at(full_width.saturating_sub(lead + 2))?
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

/// Format the body of a `{let x = e}` / `{const x = e}` declaration tag.
///
/// The body already includes the keyword (`let`/`const`) and the full
/// declaration, e.g. `let count = $state(0)` or
/// `const label = 'count'`. Parse it as `<body>;` and format with OXC
/// (which normalises quote style, spacing, etc.), then strip the trailing `;`.
/// Width handling mirrors [`format_const_declaration`].
fn format_declaration_tag_body(
    body: &str,
    options: &FormatOptions,
    depth: usize,
) -> Result<String, FormatError> {
    let allocator = Allocator::default();
    let source_type = if options.typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };

    // Append `;` so OXC parses it as a complete statement.
    let wrapped = format!("{body};");
    let parser_ret = Parser::new(&allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.diagnostics.is_empty() {
        // Parse failed (e.g. TS-only syntax on JS path, or something unusual).
        // Return the source body unchanged rather than garbling it.
        return Ok(body.to_string());
    }

    let indent_width = options.js.indent_width.value() as usize;
    let lead = depth * indent_width;
    let full_width = options.js.line_width.value() as usize;
    // The emitted tag is `{<body>}` (1 + body_len + 1 = overhead 2).
    // The JS formatter sees the statement `<body>;` and measures its length
    // as `body_len + 1 (;)`. The real overhead is `{ }` = 2, so we subtract
    // `lead + 2 - 1 = lead + 1` to make OXC's break threshold match the
    // rendered column.
    let narrowed = full_width.saturating_sub(lead + 1);
    let line_width = oxc_formatter_core::LineWidth::try_from(narrowed.max(1) as u16)
        .unwrap_or(options.js.line_width);

    let mut js = options.js.clone();
    js.line_width = line_width;
    let formatted = format_program(&allocator, &parser_ret.program, js, None)
        .print()
        .map_err(|e| FormatError::ScriptParse(format!("{e:?}")))?
        .into_code();

    // Strip the trailing `;\n` added by OXC.
    let s = formatted.trim_end().trim_end_matches(';').trim_end();

    if !s.contains('\n') {
        return Ok(s.to_string());
    }
    // Multi-line declaration (L9 case: `let a = $state(0),\n  b = $derived(a * 2)`).
    // Re-indent continuation lines to the tag's depth.
    let prefix = if options.js.indent_style.is_tab() {
        "\t".repeat(depth)
    } else {
        " ".repeat(lead)
    };
    Ok(crate::reindent::reindent(s, &prefix, true))
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
    if !parser_ret.diagnostics.is_empty() {
        return Err(FormatError::ScriptParse(format!(
            "{:?}",
            parser_ret.diagnostics
        )));
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
    if !parser_ret.diagnostics.is_empty() {
        return Err(FormatError::ScriptParse(format!(
            "{:?}",
            parser_ret.diagnostics
        )));
    }

    // The parse above is the only thing OXC contributes here: it rejects a
    // malformed pattern. prettier-plugin-svelte preserves the original source
    // representation for patterns (string-key quotes kept as-is, computed keys
    // keep their internal whitespace), which OXC would normalise away
    // (double-quoting, stripping quotes from valid-identifier keys, hard-wrapping
    // multi-line), so the formatted program is never used — the source-based
    // `light_normalize_pattern` is more faithful to the oracle.
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

/// Returns `true` when `expr` is a member access or call whose left-most leaf
/// (walking down `.object` / `.callee`) is an object literal — i.e. the shape
/// `{ … }[key]` / `{ … }.foo` / `{ … }()` that OXC parenthesizes at statement
/// position but prettier keeps bare in expression position. A bare object (with
/// no postfix) returns `false`: that case is handled by `strip_outer_parens`.
fn expr_has_object_head(expr: &oxc_ast::ast::Expression) -> bool {
    use oxc_ast::ast::{ChainElement, Expression as E};
    // The top node must be a postfix wrapper, not a bare object.
    let mut cur = match expr {
        E::ComputedMemberExpression(_)
        | E::StaticMemberExpression(_)
        | E::PrivateFieldExpression(_)
        | E::CallExpression(_)
        | E::TaggedTemplateExpression(_)
        | E::ChainExpression(_) => expr,
        _ => return false,
    };
    loop {
        cur = match cur {
            E::ObjectExpression(_) => return true,
            E::ComputedMemberExpression(m) => &m.object,
            E::StaticMemberExpression(m) => &m.object,
            E::PrivateFieldExpression(m) => &m.object,
            E::CallExpression(c) => &c.callee,
            E::TaggedTemplateExpression(t) => &t.tag,
            E::ChainExpression(ch) => match &ch.expression {
                ChainElement::CallExpression(c) => &c.callee,
                ChainElement::ComputedMemberExpression(m) => &m.object,
                ChainElement::StaticMemberExpression(m) => &m.object,
                ChainElement::PrivateFieldExpression(m) => &m.object,
                _ => return false,
            },
            _ => return false,
        };
    }
}

/// Strips the first `( … )` pair from `s`, keeping everything after the matched
/// close paren verbatim. Returns `None` when `s` doesn't start with `(` or the
/// paren is unbalanced. Paren scanning skips string/template literals and
/// `//` / `/* */` comments so a `)` inside them isn't mistaken for the match.
fn strip_leading_paren_pair(s: &str) -> Option<String> {
    let t = s.trim_start();
    if !t.starts_with('(') {
        return None;
    }
    let chars: Vec<char> = t.chars().collect();
    let mut depth: i32 = 0;
    let mut i = 0;
    let mut in_string: Option<char> = None;
    let mut close: Option<usize> = None;
    while i < chars.len() {
        let c = chars[i];
        match in_string {
            Some(q) => {
                if c == '\\' {
                    i += 2;
                    continue;
                } else if c == q {
                    in_string = None;
                }
            }
            None => match c {
                '"' | '\'' | '`' => in_string = Some(c),
                '/' if chars.get(i + 1) == Some(&'/') => {
                    while i < chars.len() && chars[i] != '\n' {
                        i += 1;
                    }
                    continue;
                }
                '/' if chars.get(i + 1) == Some(&'*') => {
                    i += 2;
                    while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                        i += 1;
                    }
                    i += 2;
                    continue;
                }
                '(' => depth += 1,
                ')' => {
                    depth -= 1;
                    if depth == 0 {
                        close = Some(i);
                        break;
                    }
                }
                _ => {}
            },
        }
        i += 1;
    }
    let close = close?;
    let inner: String = chars[1..close].iter().collect();
    let rest: String = chars[close + 1..].iter().collect();
    Some(format!("{}{}", inner.trim(), rest))
}

fn strip_outer_parens(s: &str) -> &str {
    let trimmed = s.trim();
    let Some(inner) = trimmed.strip_prefix('(').and_then(|s| s.strip_suffix(')')) else {
        return s;
    };
    if outer_parens_match(inner) { inner } else { s }
}

/// Returns `true` when the first line of a block-header expression ends with a
/// top-level logical operator (`&&` or `||`).  Used to detect when OXC wraps
/// at a logical operator — prettier-plugin-svelte keeps block headers on one
/// line in that case (even when they overflow), so we reject the multi-line
/// form and use the inline version instead.
fn first_line_ends_with_logical_op(first_line: &str) -> bool {
    let t = first_line.trim_end();
    t.ends_with("&&") || t.ends_with("||") || t.ends_with("??")
}

/// Returns `true` when the expression source starts with `[` or `{`
/// (an array literal or object literal).  prettier-plugin-svelte never breaks
/// these in block-header positions even when they are far wider than the print
/// width — e.g. `{#each ["a", "b", …] as x}` stays on one line regardless.
fn starts_with_array_or_object_literal(formatted: &str) -> bool {
    let t = formatted.trim_start();
    t.starts_with('[') || t.starts_with('{')
}

/// Collapse a multi-line OXC-formatted array or object literal back to a
/// single line, matching prettier-plugin-svelte's `removeLines` / `forceSingleLine`
/// behaviour for block-header expressions.
///
/// OXC always breaks wide arrays/objects into multiple lines (with trailing
/// commas on the last element), but prettier-plugin-svelte keeps them on one
/// line in `{#each}`, `{#if}`, etc. headers.  We replicate this by:
///
/// 1. Splitting the multi-line output into lines.
/// 2. Trimming leading whitespace from each inner line.
/// 3. Removing the trailing comma from the last element before `]` / `}`.
/// 4. Joining with spaces / no separator as appropriate.
///
/// Example input:
/// ```text
/// [
///   { label: "Today", value: 0 },
///   { label: "Tomorrow", value: 1 },
/// ]
/// ```
/// Example output: `[{ label: "Today", value: 0 }, { label: "Tomorrow", value: 1 }]`
fn collapse_multiline_to_single_line(formatted: &str) -> String {
    let lines: Vec<&str> = formatted.lines().collect();
    if lines.len() < 2 {
        return formatted.to_string();
    }
    let first = lines[0].trim();
    let last = lines[lines.len() - 1].trim();
    // Collect inner lines (between first and last).
    let inner: Vec<&str> = lines[1..lines.len() - 1].iter().map(|l| l.trim()).collect();
    if inner.is_empty() {
        // Empty array/object: e.g. `[\n]` → `[]`
        return format!("{first}{last}");
    }
    // Join inner items. The last inner item has a trailing comma added by OXC;
    // remove it so the single-line form doesn't have a trailing comma.
    let mut items: Vec<&str> = inner.clone();
    // Strip trailing comma from the last non-empty item.
    if let Some(last_item) = items.last_mut() {
        *last_item = last_item.trim_end_matches(',').trim_end();
    }
    let joined = items.join(" ");
    format!("{first}{joined}{last}")
}

/// Computes the length of the block-header "suffix" — the text from the end of the
/// block's expression to the closing `}` of the header line (inclusive).
///
/// For `{#each items as x (k)}`, if `expr_end` points right after `items`, the suffix
/// is ` as x (k)}` (length 12).  For `{#if cond}` with `expr_end` after `cond`, the
/// suffix is `}` (length 1).
///
/// We scan forward through `source` starting at `expr_end`, tracking brace/paren/bracket
/// depth, and stop at the first `}` that returns us to depth 0.
fn compute_header_suffix_len(source: &str, expr_end: usize) -> usize {
    let tail = match source.get(expr_end..) {
        Some(t) => t,
        None => return 0,
    };
    let mut depth: i32 = 0;
    let mut len = 0usize;
    let mut in_string: Option<char> = None;
    let chars: Vec<char> = tail.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        let c = chars[i];
        len += c.len_utf8();
        match in_string {
            Some(q) => {
                if c == '\\' {
                    // skip next char
                    i += 1;
                    if i < chars.len() {
                        len += chars[i].len_utf8();
                    }
                } else if c == q {
                    in_string = None;
                }
            }
            None => match c {
                '"' | '\'' | '`' => in_string = Some(c),
                '{' | '(' | '[' => depth += 1,
                '}' => {
                    if depth == 0 {
                        // This `}` closes the block header — include it and stop.
                        return len;
                    }
                    depth -= 1;
                }
                ')' | ']' if depth > 0 => {
                    depth -= 1;
                }
                '\n' => {
                    // If we hit a newline before finding the closing `}`, the
                    // header closes on the next line — return current len (0 suffix).
                    return 0;
                }
                _ => {}
            },
        }
        i += 1;
    }
    0
}

/// Returns `true` when OXC's multi-line output represents a method-chain break —
/// i.e. at least one continuation line starts with `.` after trimming whitespace.
/// This distinguishes call-chain breaks (hardlines in prettier, kept by removeLines)
/// from argument-wrapping breaks (softlines in prettier, removed by removeLines).
fn is_method_chain_break(multi: &str) -> bool {
    multi
        .lines()
        .skip(1)
        .any(|line| line.trim_start().starts_with('.'))
}

fn outer_parens_match(inner: &str) -> bool {
    // Count parens to verify the stripped outer pair was balanced, but ignore
    // any `(`/`)` that appear inside a string/template literal or a line/block
    // comment — e.g. a body comment like `// 1.) No clamping` carries a lone `)`
    // that must not be counted, otherwise a perfectly balanced object/arrow value
    // is judged unbalanced and its redundant wrapper parens are kept (`{({…})}`).
    let mut depth: i32 = 0;
    let chars: Vec<char> = inner.chars().collect();
    let mut i = 0;
    let mut in_string: Option<char> = None;
    while i < chars.len() {
        let c = chars[i];
        match in_string {
            Some(q) => {
                if c == '\\' {
                    i += 2;
                    continue;
                } else if c == q {
                    in_string = None;
                }
            }
            None => match c {
                '"' | '\'' | '`' => in_string = Some(c),
                '/' if chars.get(i + 1) == Some(&'/') => {
                    // Line comment: skip to end of line.
                    while i < chars.len() && chars[i] != '\n' {
                        i += 1;
                    }
                    continue;
                }
                '/' if chars.get(i + 1) == Some(&'*') => {
                    // Block comment: skip to the closing `*/`.
                    i += 2;
                    while i + 1 < chars.len() && !(chars[i] == '*' && chars[i + 1] == '/') {
                        i += 1;
                    }
                    i += 2;
                    continue;
                }
                '(' => depth += 1,
                ')' => {
                    depth -= 1;
                    if depth < 0 {
                        return false;
                    }
                }
                _ => {}
            },
        }
        i += 1;
    }
    depth == 0
}

/// When OXC's multi-line output represents an expanded call-argument break
/// where the ARROW BODY (not the outer call) was expanded, collapse all the
/// lines into a single line and insert a leading space after the outermost
/// opening `(`.
///
/// This mimics prettier-plugin-svelte's `removeLines` / `forceSingleLine`
/// behavior: soft-breaks inside a call-argument list are collapsed to spaces,
/// BUT the expanded-args markers (`( ` prefix and `, )` suffix) are preserved.
///
/// Example:
/// ```text
/// input:
///   options.filter((opt) =>
///     selectedValues.has(opt.value),
///   )
/// output: options.filter( (opt) => selectedValues.has(opt.value), )
/// ```
///
/// Returns `None` when:
/// - The last line is not just `)` (not an expanded call-arg form).
/// - The joined form doesn't end with `, )`.
/// - The first line ends with `(` — this indicates the OUTER call was fully
///   expanded (OXC put all args on a new line starting with `(`), which means
///   prettier-plugin-svelte keeps the expression single-line WITHOUT the
///   expanded-arg markers.  These cases must stay as the inline form.
fn collapse_expanded_arg_form(multi: &str) -> Option<String> {
    // Step 1: join all lines into a single line, trimming leading whitespace
    // from each continuation line.
    let lines: Vec<&str> = multi.trim_end_matches(';').trim().lines().collect();
    if lines.len() < 2 {
        return None;
    }
    // The last line should be `)` alone (the closing of the outermost call).
    let last = lines[lines.len() - 1].trim();
    if last != ")" {
        return None;
    }
    // When the FIRST line ends with `(`, OXC expanded the outer call completely
    // (all args on a new line). prettier-plugin-svelte's `removeLines` collapses
    // this back to the inline form WITHOUT expanded-arg markers — so oracle keeps
    // it single-line. Do NOT apply the expanded form in this case.
    let first = lines[0].trim_end();
    if first.ends_with('(') {
        return None;
    }
    // Join all lines with a single space, trimming each line's leading whitespace.
    let joined = lines
        .iter()
        .map(|l| l.trim_start())
        .collect::<Vec<_>>()
        .join(" ");
    // Bail if the source contains string literals — delimiter scanning would be
    // ambiguous (a `(` or `)` inside a string would corrupt the depth walk).
    if joined.contains('\'') || joined.contains('"') || joined.contains('`') {
        return None;
    }
    // The joined form should end with `, )` (trailing comma from expanded args
    // followed by the closing `)`).
    if !joined.ends_with(", )") {
        return None;
    }
    // Step 2: find the outermost `(` that matches the trailing `)` and insert
    // a space after it to produce the `( arg, )` form.
    let close_pos = joined.len() - 1; // position of the trailing `)`
    let mut depth: i32 = 0;
    let bytes = joined.as_bytes();
    let mut open_pos: Option<usize> = None;
    for i in (0..close_pos).rev() {
        match bytes[i] {
            b')' => depth += 1,
            b'(' => {
                if depth == 0 {
                    open_pos = Some(i);
                    break;
                }
                depth -= 1;
            }
            _ => {}
        }
    }
    let open_pos = open_pos?;
    // Insert a space after the opening `(` to produce the `( arg )` form, and
    // DROP the trailing comma OXC bakes into its broken output. This mirrors
    // prettier-plugin-svelte's `removeLines` (`forceSingleLine`), which strips the
    // `ifBreak(",")` trailing-comma doc entirely when it collapses the group back
    // to one line — so the oracle emits `fn( arg )`, not `fn( arg, )`. (OXC's
    // broken form has the comma as literal text, not an `ifBreak`, so it survives
    // a naive line-join; we must remove it explicitly.)
    let joined = joined
        .strip_suffix(", )")
        .map(|head| format!("{head} )"))
        .unwrap_or(joined);
    let mut result = String::with_capacity(joined.len() + 1);
    result.push_str(&joined[..open_pos + 1]);
    result.push(' ');
    result.push_str(&joined[open_pos + 1..]);
    Some(result)
}

/// Convert OXC's `fn({ k: v, ... })` / `fn({\n  k: v,\n})` form to
/// prettier-plugin-svelte's "outer-expanded-arg" form:
/// ```text
/// fn(
///   { k: v },        // object fits on one line
/// )
/// ```
/// or:
/// ```text
/// fn(
///   {
///     k: v,
///   },               // object needed multi-line
/// )
/// ```
///
/// This is used for embedded mustache expressions inside quoted attributes
/// (`class="... {fn({...})}"`) where OXC always places the object literal
/// immediately after the `(`, but prettier-plugin-svelte separates the arg
/// onto its own line with a trailing comma (the "expanded-arg" marker).
///
/// Returns `None` when the input doesn't match the expected shape:
/// - Not a call expression ending with `)` or `})`.
/// - Has multiple arguments (more than one top-level comma at depth 0).
/// - The single argument is not an object literal `{...}`.
pub(crate) fn expand_obj_arg_call(s: &str, indent_width: usize) -> Option<String> {
    let s = s.trim();
    // Must end with `)` (single-line) or `})` (multi-line)
    if !s.ends_with(')') {
        return None;
    }
    // Bail if source contains string literals — delimiter scanning would be
    // ambiguous (a `{`, `(`, or `,` inside a string would corrupt depth walks).
    if s.contains('\'') || s.contains('"') || s.contains('`') {
        return None;
    }
    // Find the outermost opening `(` that matches the final `)`.
    let close_pos = s.len() - 1;
    let bytes = s.as_bytes();
    let mut depth: i32 = 0;
    let mut open_paren: Option<usize> = None;
    for i in (0..close_pos).rev() {
        match bytes[i] {
            b')' => depth += 1,
            b'(' => {
                if depth == 0 {
                    open_paren = Some(i);
                    break;
                }
                depth -= 1;
            }
            _ => {}
        }
    }
    let open_paren = open_paren?;
    // The prefix before `(` must be non-empty (it's the function/callee).
    if open_paren == 0 {
        return None;
    }
    let prefix = &s[..open_paren];
    // The argument body between `(` and `)`.
    let arg_body = s[open_paren + 1..close_pos].trim();
    // The argument must be an object literal `{...}`.
    if !arg_body.starts_with('{') {
        return None;
    }
    // Ensure it's a single object arg: only `{...}` at the top level (no
    // top-level commas outside the object braces).
    let arg_trimmed = arg_body.trim_end_matches(',').trim();
    if !arg_trimmed.starts_with('{') || !arg_trimmed.ends_with('}') {
        return None;
    }
    // Verify balanced braces (no stray top-level commas between separate args).
    let mut brace_depth: i32 = 0;
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;
    let mut has_top_level_comma = false;
    for (i, &b) in arg_trimmed.as_bytes().iter().enumerate() {
        match b {
            b'{' => brace_depth += 1,
            b'}' => brace_depth -= 1,
            b'(' => paren_depth += 1,
            b')' => paren_depth -= 1,
            b'[' => bracket_depth += 1,
            b']' => bracket_depth -= 1,
            b',' if brace_depth == 0 && paren_depth == 0 && bracket_depth == 0 && i > 0 => {
                has_top_level_comma = true;
                break;
            }
            _ => {}
        }
    }
    if has_top_level_comma || brace_depth != 0 {
        return None;
    }
    // Bail out when the object literal contains nested objects — the
    // re-indentation logic doesn't handle them correctly.
    {
        let mut depth = 0i32;
        let mut has_nested = false;
        for ch in arg_trimmed.chars() {
            match ch {
                '{' => {
                    depth += 1;
                    if depth > 1 {
                        has_nested = true;
                        break;
                    }
                }
                '}' => depth -= 1,
                _ => {}
            }
        }
        if has_nested {
            return None;
        }
    }
    // Build the expanded form.
    let indent = " ".repeat(indent_width);
    if !arg_body.contains('\n') {
        // Single-line object: `fn(\n  { k: v },\n)`
        // Strip trailing comma from the object literal if present (we add a new one).
        let arg_clean = arg_body.trim_end_matches(',').trim();
        Some(format!("{prefix}(\n{indent}{arg_clean},\n)"))
    } else {
        // Multi-line object: re-indent each line inside the `{...}` by one extra
        // level, then wrap with `fn(\n  {\n    ...\n  },\n)`.
        let lines: Vec<&str> = arg_body.lines().collect();
        if lines.is_empty() {
            return None;
        }
        // First line should be `{` (possibly with spaces, from OXC).
        // Last line should be `}` or `},` (the closing brace).
        let first = lines[0].trim();
        let last = lines[lines.len() - 1].trim().trim_end_matches(',');
        if first != "{" || last != "}" {
            return None;
        }
        let mut result = format!("{prefix}(\n{indent}{{\n");
        // Interior lines (everything except first `{` and last `}`).
        for line in &lines[1..lines.len() - 1] {
            let trimmed = line.trim_start();
            if trimmed.is_empty() {
                result.push('\n');
            } else {
                result.push_str(&indent);
                result.push_str(&indent);
                result.push_str(trimmed);
                result.push('\n');
            }
        }
        result.push_str(&indent);
        result.push_str("},\n)");
        Some(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn has_word_await_detects_standalone() {
        assert!(has_word_await("await foo"));
        assert!(has_word_await("x = await bar()"));
        assert!(has_word_await("(await x)"));
    }

    #[test]
    fn has_word_await_rejects_subword() {
        assert!(!has_word_await("getAwaiter"));
        assert!(!has_word_await("awaiting"));
        assert!(!has_word_await("noawait"));
        assert!(!has_word_await("$await"));
        assert!(!has_word_await("_await"));
    }

    #[test]
    fn has_word_await_empty() {
        assert!(!has_word_await(""));
        assert!(!has_word_await("foo bar"));
    }

    #[test]
    fn outer_parens_match_ignores_parens_in_comments_and_strings() {
        // Balanced object/arrow body where a line comment carries a lone `)`.
        let inner = "{\n  onpointerdown: (e) => {\n    // 1.) No clamping\n    foo(e);\n  },\n}";
        assert!(outer_parens_match(inner));
        // A `)` inside a string literal must likewise not be counted.
        assert!(outer_parens_match("{ label: \"a) b\", value: 1 }"));
        // A `)` inside a block comment must not be counted.
        assert!(outer_parens_match("x /* close ) here */ + y"));
        // Genuinely unbalanced parens are still rejected.
        assert!(!outer_parens_match("foo)"));
        assert!(!outer_parens_match("a) + (b"));
    }

    #[test]
    fn strip_leading_paren_pair_keeps_postfix() {
        // `({...})[size]` → `{...}[size]`
        assert_eq!(
            strip_leading_paren_pair("({ a: 1 })[size]").as_deref(),
            Some("{ a: 1 }[size]")
        );
        // `({...}).foo` → `{...}.foo`
        assert_eq!(
            strip_leading_paren_pair("({ a: 1 }).foo").as_deref(),
            Some("{ a: 1 }.foo")
        );
        // multi-line object head, postfix preserved
        assert_eq!(
            strip_leading_paren_pair("({\n  a: 1,\n})[k]").as_deref(),
            Some("{\n  a: 1,\n}[k]")
        );
        // a `)` in a comment must not be taken as the match
        assert_eq!(
            strip_leading_paren_pair("({\n  // 1.) x\n  a: 1,\n})[k]").as_deref(),
            Some("{\n  // 1.) x\n  a: 1,\n}[k]")
        );
        // not starting with `(`
        assert_eq!(strip_leading_paren_pair("{ a: 1 }[k]"), None);
    }

    #[test]
    fn strip_outer_parens_strips_object_with_paren_in_comment() {
        // The wrapper `({ … })` around a comment-bearing object value must be
        // stripped even though a body comment contains a lone `)` (#Arc track).
        let s = "({\n  onpointerdown: (e) => {\n    // 1.) No clamping\n    foo(e);\n  },\n})";
        let stripped = strip_outer_parens(s);
        assert!(stripped.trim_start().starts_with('{'));
        assert!(!stripped.trim_start().starts_with("({"));
    }

    #[test]
    fn collapse_expanded_arg_form_normal() {
        // Typical multi-line → collapsed form. prettier-plugin-svelte's
        // `removeLines` strips OXC's trailing comma when it collapses the group,
        // so the result is `fn( arg )` — space markers, NO trailing comma.
        let multi = "options.filter((opt) =>\n  selectedValues.has(opt.value),\n)";
        let result = collapse_expanded_arg_form(multi);
        assert!(result.is_some(), "expected Some for normal multi-line call");
        let s = result.unwrap();
        assert!(s.contains("( "), "result should have `( ` after open paren");
        assert!(
            s.ends_with(" )"),
            "result should end with ` )` (no trailing comma)"
        );
        assert!(
            !s.contains(", )"),
            "result must not keep the `, )` trailing comma"
        );
        assert_eq!(
            s,
            "options.filter( (opt) => selectedValues.has(opt.value) )"
        );
    }

    #[test]
    fn collapse_expanded_arg_form_none_on_single_line() {
        // Single-line input cannot be collapsed (fewer than 2 lines)
        let single = "foo(bar)";
        assert!(collapse_expanded_arg_form(single).is_none());
    }

    #[test]
    fn collapse_expanded_arg_form_none_when_last_line_not_paren() {
        // Last line is not `)` alone — bail
        let s = "foo(\n  bar\n}";
        assert!(collapse_expanded_arg_form(s).is_none());
    }

    #[test]
    fn collapse_expanded_arg_form_none_on_string_literal() {
        // FIX 4: bail on string literals
        let multi = "fn(\"hello\",\n)";
        assert!(collapse_expanded_arg_form(multi).is_none());
    }

    #[test]
    fn expand_obj_arg_call_single_object() {
        let s = "fn({ key: value })";
        let result = expand_obj_arg_call(s, 2);
        assert!(result.is_some(), "expected Some for single-object call");
        let out = result.unwrap();
        assert!(out.contains("fn(\n"), "result should start with fn(");
        assert!(
            out.contains("{ key: value },"),
            "result should contain object with trailing comma"
        );
    }

    #[test]
    fn expand_obj_arg_call_none_on_multi_arg() {
        // Two top-level arguments — must return None
        let s = "fn({ key: value }, extra)";
        assert!(expand_obj_arg_call(s, 2).is_none());
    }

    #[test]
    fn expand_obj_arg_call_none_on_nested_object() {
        // FIX 3: nested object inside arg — bail
        let s = "fn({ outer: { inner: 1 } })";
        assert!(expand_obj_arg_call(s, 2).is_none());
    }

    #[test]
    fn expand_obj_arg_call_none_on_string_literal() {
        // FIX 4: bail on string literals
        let s = "fn({ key: \"value\" })";
        assert!(expand_obj_arg_call(s, 2).is_none());
    }

    #[test]
    fn expand_obj_arg_call_none_on_non_object_arg() {
        // Non-object single arg — must return None
        let s = "fn(someVariable)";
        assert!(expand_obj_arg_call(s, 2).is_none());
    }
}
