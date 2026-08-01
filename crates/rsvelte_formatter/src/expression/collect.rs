use rsvelte_core::ast::template::{Fragment, TemplateNode};

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
                                && crate::is_blank_text(t.data.as_ref())
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
            matches!(n, rsvelte_core::ast::template::TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref()))
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
        matches!(n, rsvelte_core::ast::template::TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref()))
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
