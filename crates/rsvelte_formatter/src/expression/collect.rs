use rsvelte_core::ast::template::{Fragment, TemplateNode};

use super::await_block;
use super::call_args;
use super::declaration::format_pattern_source;
use super::splice::{
    find_each_key_delimiter, normalize_block_opener_ws, normalize_leading_ws_before_expr,
    normalize_separator_opener_before, push_bare_expression, push_brace_wrapped_expression,
    push_const_tag, push_debug_tag, push_declaration_tag, push_expression_tag,
    push_pattern_at_span, push_snippet_header, push_tag_form, reindent_header_method_chain,
    trim_trailing_ws_before_close_brace,
};
use super::width::format_inline_expression;
use crate::error::FormatError;
use crate::options::FormatOptions;
use crate::width::{VisualWidth, tab_width};

/// The each-key source between its delimiter parens, or `None` when the block
/// has no key. Used to measure how much the key widens the header line.
fn each_key_source<'a>(
    source: &'a str,
    blk: &rsvelte_core::ast::template::EachBlock,
) -> Option<&'a str> {
    let key = blk.key.as_ref()?;
    let (start, end) = (key.start()?, key.end()?);
    let (open, close_excl) = find_each_key_delimiter(source, start, end)?;
    source
        .get(open as usize + 1..close_excl as usize - 1)
        .map(str::trim)
        .filter(|inner| !inner.is_empty())
}

/// Collapse the whitespace around an each-block's `as` keyword to one space on
/// each side, which is what the oracle's fixed `' as'` + `' <pattern>'` prints.
fn normalize_each_as_keyword(
    source: &str,
    expr_end: u32,
    ctx_start: u32,
    edits: &mut Vec<(u32, u32, String)>,
) {
    let Some(region) = source.get(expr_end as usize..ctx_start as usize) else {
        return;
    };
    // Anything other than plain whitespace around `as` (a comment, say) is left
    // alone rather than rewritten into something that may not parse.
    if region.trim() != "as" || region == " as " {
        return;
    }
    edits.push((expr_end, ctx_start, " as ".to_string()));
}

/// The `[ws] , [ws] <index>` run that follows an each-block's pattern, as
/// `(start, end)`. The index name has no span in the AST, so it is located by
/// matching the parsed name against the source.
fn each_index_span(source: &str, ctx_end: u32, index: &str) -> Option<(u32, u32)> {
    const WS: [char; 4] = [' ', '\t', '\n', '\r'];
    let rest = source.get(ctx_end as usize..)?;
    let after = rest
        .trim_start_matches(WS)
        .strip_prefix(',')?
        .trim_start_matches(WS)
        .strip_prefix(index)?;
    // Guard against `i` matching the head of a longer name.
    if after.starts_with(|c: char| c.is_alphanumeric() || c == '_' || c == '$') {
        return None;
    }
    let end = ctx_end as usize + (rest.len() - after.len());
    Some((ctx_end, crate::source_offset(end)))
}

/// The each-iterable source, used to measure how much it widens the header line.
fn each_iterable_source<'a>(
    source: &'a str,
    blk: &rsvelte_core::ast::template::EachBlock,
) -> Option<&'a str> {
    let (start, end) = (blk.expression.start()?, blk.expression.end()?);
    source.get(start as usize..end as usize).map(str::trim)
}

/// Walk a `Fragment` recursively, appending `(start, end, replacement)`
/// edits for every JS expression we can safely format.
///
/// `depth` is the markup nesting level at which this fragment's nodes render
/// (root fragment is `0`, each enclosing element / block adds one). Content
/// expressions use it to match prettier-plugin-svelte's wrap column; see
/// [`format_content_expression`].
pub fn collect_template_edits(
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
    let tw = tab_width(options);
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
                let prefix_len = if is_first {
                    "{#if ".len()
                } else {
                    "{:else if ".len()
                };
                let effective_end = push_bare_expression(
                    source,
                    &current.test,
                    options,
                    depth,
                    prefix_len,
                    0,
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
                    Some(alt) => {
                        if let Some(chained) = crate::indent::else_if_branch(alt) {
                            current = chained;
                            is_first = false;
                        } else {
                            expand_inline_empty_block_body(alt, depth, options, edits);
                            collect_template_edits(source, alt, child_depth, options, edits)?;
                            break;
                        }
                    }
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
            // The iterable is settled first, so the key that follows it on the
            // header line is still at its widest when the iterable's fit is judged.
            let key_expansion = each_key_source(source, blk)
                .map_or(0, |key| call_args::grouped_call_expansion(key, options));
            push_bare_expression(
                source,
                &blk.expression,
                options,
                depth,
                "{#each ".len(),
                key_expansion,
                edits,
            )?;
            // prettier-plugin-svelte re-prints the header's fixed parts, so the
            // ` as ` keyword and the `, index` separator always come out
            // canonically spaced no matter how the source wrote them.
            let index_end = if let Some(ctx) = &blk.context {
                if let (Some(expr_end), Some(ctx_start)) = (blk.expression.end(), ctx.start()) {
                    normalize_each_as_keyword(source, expr_end, ctx_start, edits);
                }
                push_pattern_at_span(source, ctx, options, edits)?;
                match (ctx.end(), blk.index.as_deref()) {
                    (Some(ctx_end), Some(index)) => each_index_span(source, ctx_end, index)
                        .map(|(start, end)| {
                            edits.push((start, end, format!(", {index}")));
                            end
                        })
                        .or(Some(ctx_end)),
                    (ctx_end, _) => ctx_end,
                }
            } else {
                None
            };
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
                            .map_or("", str::trim);
                        if !inner.is_empty() {
                            let formatted = format_inline_expression(inner, options)?;
                            // A long key OXC broke as a method chain is reindented to
                            // the block depth, mirroring the each-iterable path.
                            let formatted =
                                reindent_header_method_chain(&formatted, depth, options)
                                    .unwrap_or(formatted);
                            // A key that stays on one line still gains the expanded
                            // spacing on its grouped calls once the header overflows,
                            // exactly as the iterable does. The trigger is the whole
                            // header line, so measure the source from the block opener
                            // up to the delimiter `(` and add the formatted key plus
                            // the closing `)}` — the same source-side approximation
                            // `compute_header_suffix_len` makes for the iterable.
                            let prefix = source
                                .get(blk.start as usize..delim_open as usize)
                                .filter(|prefix| !prefix.contains('\n'));
                            let formatted = match prefix {
                                Some(prefix) if !formatted.contains('\n') => {
                                    let full_width = options.js.line_width.value() as usize;
                                    let flat_width = depth
                                        * options.js.indent_width.value() as usize
                                        + prefix.visual_width(tw)
                                        + "(".len()
                                        + formatted.visual_width(tw)
                                        + ")}".len();
                                    // The oracle settles the header's groups left to
                                    // right, so the key is measured against whatever
                                    // the iterable actually chose — adding the
                                    // iterable's expansion unconditionally would
                                    // expand a key whose header still fits.
                                    let measured = if flat_width + key_expansion > full_width {
                                        flat_width
                                            + each_iterable_source(source, blk).map_or(0, |src| {
                                                call_args::grouped_call_expansion(src, options)
                                            })
                                    } else {
                                        flat_width
                                    };
                                    if measured > full_width {
                                        call_args::expand_grouped_call_parens(&formatted, options)
                                            .unwrap_or(formatted)
                                    } else {
                                        formatted
                                    }
                                }
                                _ => formatted,
                            };
                            // Normalize the horizontal whitespace before the
                            // delimiter to a single space — prettier-plugin-svelte
                            // always emits `… (key)` regardless of the preceding
                            // context binding (e.g. `, idx`).
                            let before = source.get(..delim_open as usize).unwrap_or("");
                            let ws_start =
                                crate::source_offset(before.trim_end_matches([' ', '\t']).len());
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
            } else if let Some(header_end) = index_end {
                // No key — trim trailing whitespace between the last header part
                // and the `}` (e.g. `{#each arr as x }` → `{#each arr as x}`).
                trim_trailing_ws_before_close_brace(source, header_end, edits);
            }
            collect_template_edits(source, &blk.body, child_depth, options, edits)?;
            if let Some(fb) = &blk.fallback {
                collect_template_edits(source, fb, child_depth, options, edits)?;
            }
        }
        TemplateNode::AwaitBlock(blk) => {
            // Normalize extra whitespace between `{` and `#` in the opener.
            normalize_block_opener_ws(source, blk.start, edits);
            // prettier-plugin-svelte prints only the clauses whose fragment holds
            // something that is not blank text, and collapses the header when the
            // pending clause is one of the dropped ones. `await_block::plan`
            // reproduces that decision; everything below just applies it.
            let plan = await_block::plan(source, blk);
            for (del_start, del_end) in &plan.deletions {
                edits.push((*del_start, *del_end, String::new()));
            }
            let mut rewritten = false;
            if let Some(rewrite_end) = plan.rewrite_end
                && let Some(header) = render_await_header(source, blk, plan.form, options)?
            {
                edits.push((blk.start, rewrite_end, header));
                rewritten = true;
            }
            if !rewritten {
                // Normalize leading whitespace: `{#await  expr}` → `{#await expr}`.
                if let Some(start) = blk.expression.start() {
                    normalize_leading_ws_before_expr(source, start, edits);
                }
                let expr_end = push_bare_expression(
                    source,
                    &blk.expression,
                    options,
                    depth,
                    "{#await ".len(),
                    0,
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
                    if plan.keep_then
                        && let Some(v) = &blk.value
                    {
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
                if plan.keep_catch
                    && let Some(e) = &blk.error
                {
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
            }
            // Only recurse into the fragments the plan keeps — a dropped clause's
            // body is erased wholesale, so an edit inside it would collide.
            if plan.keep_pending
                && let Some(frag) = &blk.pending
            {
                collect_template_edits(source, frag, child_depth, options, edits)?;
            }
            if plan.keep_then
                && let Some(frag) = &blk.then
            {
                collect_template_edits(source, frag, child_depth, options, edits)?;
            }
            if plan.keep_catch
                && let Some(frag) = &blk.catch
            {
                collect_template_edits(source, frag, child_depth, options, edits)?;
            }
        }
        TemplateNode::KeyBlock(blk) => {
            // Normalize extra whitespace between `{` and `#` in the opener.
            normalize_block_opener_ws(source, blk.start, edits);
            // Normalize leading whitespace: `{#key  expr}` → `{#key expr}`.
            if let Some(start) = blk.expression.start() {
                normalize_leading_ws_before_expr(source, start, edits);
            }
            let effective_end = push_bare_expression(
                source,
                &blk.expression,
                options,
                depth,
                "{#key ".len(),
                0,
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
                push_bare_expression(
                    source,
                    &blk.expression,
                    options,
                    depth,
                    "{#snippet ".len(),
                    0,
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
            if crate::is_blank_text(t.data.as_ref()) && !t.data.contains('\n'))
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

/// Render the collapsed `{#await …}` header the oracle prints for `form`.
///
/// Returns `None` when the promise expression cannot be read back from the
/// source, in which case the caller leaves the header untouched.
fn render_await_header(
    source: &str,
    blk: &rsvelte_core::ast::template::AwaitBlock,
    form: await_block::AwaitHeaderForm,
    options: &FormatOptions,
) -> Result<Option<String>, FormatError> {
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
    let clause = match form {
        await_block::AwaitHeaderForm::Bare => String::new(),
        await_block::AwaitHeaderForm::Then => {
            render_await_clause(source, "then", blk.value.as_ref(), options)
        }
        await_block::AwaitHeaderForm::Catch => {
            render_await_clause(source, "catch", blk.error.as_ref(), options)
        }
    };
    Ok(Some(format!("{{#await {fmt_expr}{clause}}}")))
}

/// ` then value` / ` catch error`, or the bare keyword when the clause has no
/// binding (`{:then}` collapses to `{#await p then}`, as the oracle prints it).
fn render_await_clause(
    source: &str,
    keyword: &str,
    binding: Option<&rsvelte_core::ast::js::Expression>,
    options: &FormatOptions,
) -> String {
    let rendered = binding
        .and_then(|b| Some((b.start()?, b.end()?)))
        .and_then(|(s, e)| source.get(s as usize..e as usize))
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(|s| format_pattern_source(s, options).unwrap_or_else(|_| s.to_string()));
    match rendered {
        Some(b) => format!(" {keyword} {b}"),
        None => format!(" {keyword}"),
    }
}
