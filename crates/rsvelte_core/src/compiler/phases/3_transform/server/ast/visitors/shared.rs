//! Shared SSR template-walk machinery — the Rust port of upstream
//! `3-transform/server/visitors/shared/utils.js`
//! (`process_children` / `build_template`).
//!
//! The SSR output is modelled as a flat list of [`TemplateEntry`] items pushed
//! onto [`super::super::ServerTransformState::template`]. There are three kinds:
//!
//! - [`TemplateEntry::Literal`] — a static run of HTML (element openers, closers,
//!   pure text). Upstream's `b.literal('<p')` / `b.literal('>')`.
//! - [`TemplateEntry::Template`] — a `b.template(quasis, expressions)` produced by
//!   [`process_children`] when a run of text / comment / expression-tag siblings
//!   is flushed; dynamic `{expr}` interpolations become `${$.escape(expr)}`.
//! - [`TemplateEntry::Stmt`] — an opaque statement (e.g. an `if` for `<textarea>`
//!   value handling, or an async `$$renderer.push(...)`); these break the
//!   coalescing run. Not produced by the simple visitors ported so far.
//!
//! [`build_template`] then coalesces consecutive `Literal` / `Template` entries
//! into a single `$$renderer.push(\`...\`)` call, mirroring upstream's
//! `build_template`.

use crate::ast::js::Expression;
use crate::ast::template::{Fragment, RegularElement, TemplateNode, Text};
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use crate::compiler::phases::phase3_transform::shared::template::escape_html;
use crate::compiler::phases::phase3_transform::utils::{
    is_svelte_whitespace_only, replace_leading_whitespace, replace_trailing_whitespace,
    svelte_trim_end, svelte_trim_start,
};
use compact_str::CompactString;
use oxc_ast::ast::{Expression as OxcExpression, Statement};
use std::borrow::Cow;

/// SSR hydration markers — the Rust mirror of the `b.literal(...)` constants in
/// upstream `shared/utils.js` (which derive from `internal/server/hydration.js`):
/// `BLOCK_OPEN = <!--[-->`, `BLOCK_OPEN_ELSE = <!--[!-->`,
/// `BLOCK_CLOSE = <!--]-->`, `EMPTY_COMMENT = <!---->`.
pub const BLOCK_OPEN: &str = "<!--[-->";
pub const BLOCK_OPEN_ELSE: &str = "<!--[!-->";
pub const BLOCK_CLOSE: &str = "<!--]-->";
pub const EMPTY_COMMENT: &str = "<!---->";

/// A single accumulated SSR template entry (see module docs).
pub enum TemplateEntry<'a> {
    /// A static HTML run (cooked string).
    Literal(String),
    /// A `b.template(quasis, expressions)`: `quasis.len() == expressions.len() + 1`.
    /// `quasis` are cooked strings; `exprs` are already-built oxc expressions
    /// (typically `$.escape(expr)`).
    Template {
        quasis: Vec<String>,
        exprs: Vec<OxcExpression<'a>>,
    },
    /// An opaque statement that breaks the coalescing run.
    Stmt(Statement<'a>),
}

/// Port of upstream `process_children`: walk a slice of sibling template nodes,
/// joining adjacent Text / Comment / ExpressionTag siblings into a single
/// [`TemplateEntry::Template`] and recursing into element/block children.
///
/// Mirrors `utils.js::process_children` — `sequence` accumulates the joinable
/// run, `flush()` converts it into one template entry.
///
/// NOTE (写经 gap): the upstream `scope.evaluate(...)` constant-folding of known
/// expressions is not yet ported, so every `{expr}` becomes a runtime
/// `$.escape(...)` interpolation. Async expression tags
/// (`node.metadata.expression.is_async()`) are also not handled (TODO).
///
/// `parent` / `namespace` are passed through to [`clean_whitespace`] so the
/// leading/trailing fragment trim, internal whitespace collapse, and the
/// `<pre>` / `<select>` / `<table>` / SVG special-cases match upstream's
/// `clean_nodes` + `trim_whitespace` exactly.
pub fn process_children<'a>(
    nodes: &[TemplateNode],
    parent: Option<&RegularElement>,
    namespace: &str,
    state: &mut ServerTransformState<'a>,
) {
    process_children_inner(nodes, parent, namespace, false, state);
}

/// Like [`process_children`], but with `is_block_parent` controlling the
/// upstream `clean_nodes` → Fragment-visitor `is_text_first` anchor: when the
/// parent is a Fragment / block body (root component fragment, `{#if}` /
/// `{#each}` / `{#key}` / `{#snippet}` / `{#await}` body, Component / SvelteSelf
/// / SvelteComponent / SvelteBoundary slot) AND the first surviving (cleaned)
/// child is a `Text` / `ExpressionTag`, a leading `<!---->` (`EMPTY_COMMENT`) is
/// pushed so the text node isn't fused with the surrounding fragment during
/// hydration. RegularElement / TitleElement parents pass `false` (they are not
/// in upstream's `is_text_first` parent list).
pub fn process_children_inner<'a>(
    nodes: &[TemplateNode],
    parent: Option<&RegularElement>,
    namespace: &str,
    is_block_parent: bool,
    state: &mut ServerTransformState<'a>,
) {
    let preserve_whitespace = state.options.preserve_whitespace
        || parent.is_some_and(|el| matches!(el.name.as_str(), "pre" | "textarea"));
    let cleaned = clean_whitespace(nodes, parent, namespace, preserve_whitespace);

    // 写经 `clean_nodes` → `Fragment` visitor: when the parent is a fragment /
    // block body and the first surviving child is Text / ExpressionTag, prepend
    // `<!---->` so the leading text isn't glued to the previous fragment.
    if is_block_parent
        && matches!(
            cleaned.first().map(|c| c.as_ref()),
            Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
        )
    {
        state
            .template
            .push(TemplateEntry::Literal(EMPTY_COMMENT.to_string()));
    }

    let mut sequence: Vec<SeqNode<'_>> = Vec::new();

    for node in &cleaned {
        match node.as_ref() {
            TemplateNode::Text(t) => sequence.push(SeqNode::Text(t.data.as_str())),
            TemplateNode::Comment(c) => sequence.push(SeqNode::Comment(c.data.as_str())),
            TemplateNode::ExpressionTag(tag) => {
                // SAFETY-of-borrow: `tag` lives in `cleaned`, but the expression
                // it references is owned by the ORIGINAL `nodes` (every cleaned
                // node is `Cow::Borrowed`, EXCEPT rewritten Text nodes — and Text
                // nodes never carry an expression). So `&tag.expression`'s
                // lifetime is tied to `nodes`, which outlives this call. We
                // re-borrow from the original node to make that explicit.
                sequence.push(SeqNode::Expr(&tag.expression));
            }
            other => {
                flush_sequence(&sequence, state);
                sequence.clear();
                // `other` is borrowed from `cleaned`; for non-text structural
                // nodes the Cow is always `Borrowed`, so this points back into
                // the original `nodes` arena and the recursion is valid.
                super::visit_node(other, state);
            }
        }
    }
    flush_sequence(&sequence, state);
}

/// Normalize template-text whitespace to match upstream's `clean_nodes` +
/// `trim_whitespace`
/// (`submodules/svelte/.../3-transform/utils.js` lines 173-263).
///
/// Unlike the full `clean_nodes`, this keeps ALL nodes in place — it does NOT
/// split out hoisted nodes (`{@const}` / `{#snippet}` / `<svelte:head>` / …) or
/// strip comments, because the AST server pipeline handles those concerns in its
/// own visitors. It only rewrites `Text` node `data` (and drops whitespace-only
/// text at fragment boundaries / in `can_remove_entirely` parents), which is the
/// whitespace lever this port targets.
///
/// Rules (verbatim from upstream):
/// - With `preserve_whitespace`, every node passes through untouched.
/// - Leading / trailing whitespace-only Text nodes are dropped; the first/last
///   surviving Text node has its leading/trailing whitespace trimmed entirely.
/// - Between nodes, a Text run's leading whitespace collapses to a single space
///   (or to `''` when the previous Text already ended with whitespace), unless
///   the previous sibling is an `ExpressionTag` (then it is preserved verbatim).
///   Trailing whitespace collapses to a single space unless the next sibling is
///   an `ExpressionTag`.
/// - A Text node that reduces to a single `' '` is dropped entirely when the
///   parent is a `select` / `tr` / `table` / `tbody` / `thead` / `tfoot` /
///   `colgroup` / `datalist`, or any non-`text` SVG element (`can_remove_entirely`).
/// - The first Text node inside `<pre>` is dropped if it is a lone `\n` / `\r\n`.
fn clean_whitespace<'n>(
    nodes: &'n [TemplateNode],
    parent: Option<&RegularElement>,
    namespace: &str,
    preserve_whitespace: bool,
) -> Vec<Cow<'n, TemplateNode>> {
    if preserve_whitespace {
        return nodes.iter().map(Cow::Borrowed).collect();
    }

    // Find the first / last non-whitespace-only nodes (the trimmable window).
    let is_ws_text = |n: &TemplateNode| match n {
        TemplateNode::Text(t) => is_svelte_whitespace_only(&t.data),
        _ => false,
    };
    let start = nodes.iter().position(|n| !is_ws_text(n));
    let Some(start) = start else {
        // Entire run is whitespace-only text: nothing survives.
        return Vec::new();
    };
    let end = nodes.iter().rposition(|n| !is_ws_text(n)).unwrap() + 1;
    let window = &nodes[start..end];

    let can_remove_entirely = match parent {
        Some(el) => matches!(
            el.name.as_str(),
            "select" | "tr" | "table" | "tbody" | "thead" | "tfoot" | "colgroup" | "datalist"
        ),
        None => false,
    } || (namespace == "svg"
        && !matches!(parent, Some(el) if el.name.as_str() == "text"));

    let last_idx = window.len() - 1;
    let mut out: Vec<Cow<'n, TemplateNode>> = Vec::with_capacity(window.len());
    let mut prev_ends_with_ws = false;
    let mut prev_is_expression_tag = false;

    for (i, node) in window.iter().enumerate() {
        let TemplateNode::Text(text) = node else {
            prev_ends_with_ws = false;
            prev_is_expression_tag = matches!(node, TemplateNode::ExpressionTag(_));
            out.push(Cow::Borrowed(node));
            continue;
        };

        let mut data: Cow<'_, str> = Cow::Borrowed(text.data.as_str());

        // Trim the very first / last Text node's outer whitespace entirely.
        if i == 0 {
            data = Cow::Owned(svelte_trim_start(&data).to_string());
        }
        if i == last_idx {
            data = Cow::Owned(svelte_trim_end(&data).to_string());
        }

        // Collapse leading whitespace (unless preceded by an ExpressionTag).
        if !prev_is_expression_tag {
            let replacement = if prev_ends_with_ws { "" } else { " " };
            let replaced = replace_leading_whitespace(&data, replacement);
            data = Cow::Owned(replaced);
        }

        // Collapse trailing whitespace (unless followed by an ExpressionTag).
        let next_is_expression_tag = window
            .get(i + 1)
            .is_some_and(|n| matches!(n, TemplateNode::ExpressionTag(_)));
        if !next_is_expression_tag {
            let replaced = replace_trailing_whitespace(&data, " ");
            data = Cow::Owned(replaced);
        }

        prev_ends_with_ws = data.as_bytes().last() == Some(&b' ');
        prev_is_expression_tag = false;

        // Drop empty / collapsible-only text where the parent forbids it.
        if data.is_empty() || (data.as_ref() == " " && can_remove_entirely) {
            continue;
        }

        if data.as_ref() == text.data.as_str() {
            out.push(Cow::Borrowed(node));
        } else {
            let mut new_text: Text = text.clone();
            new_text.data = CompactString::new(data.as_ref());
            out.push(Cow::Owned(TemplateNode::Text(new_text)));
        }
    }

    // `<pre>`: drop a leading lone-newline Text node (browser would re-add it).
    if matches!(parent, Some(el) if el.name.as_str() == "pre")
        && let Some(TemplateNode::Text(t)) = out.first().map(|c| c.as_ref())
        && (t.data.as_str() == "\n" || t.data.as_str() == "\r\n")
    {
        out.remove(0);
    }

    out
}

/// A joinable sibling captured during [`process_children`].
enum SeqNode<'n> {
    Text(&'n str),
    Comment(&'n str),
    Expr(&'n Expression),
}

/// Convert the accumulated `sequence` into one [`TemplateEntry::Template`]
/// (skipped when empty). Mirrors the inner `flush()` of upstream
/// `process_children`: cooked text accumulates into the current quasi, and each
/// dynamic expression splits a new quasi and pushes `$.escape(expr)`.
fn flush_sequence<'a>(sequence: &[SeqNode<'_>], state: &mut ServerTransformState<'a>) {
    if sequence.is_empty() {
        return;
    }

    let mut quasis: Vec<String> = vec![String::new()];
    let mut exprs: Vec<OxcExpression<'a>> = Vec::new();

    for node in sequence {
        match node {
            SeqNode::Text(data) => {
                let last = quasis.last_mut().unwrap();
                last.push_str(&escape_html(data));
            }
            SeqNode::Comment(data) => {
                use std::fmt::Write as _;
                let last = quasis.last_mut().unwrap();
                let _ = write!(last, "<!--{data}-->");
            }
            SeqNode::Expr(expr) => {
                // SSR constant-folding (`scope.evaluate`): upstream's
                // `process_children` evaluates every ExpressionTag and, when the
                // result is "known" (exactly one primitive value), inlines the
                // escaped value into the surrounding quasi instead of emitting
                // `$.escape(...)`. Known nullish values render as nothing.
                let evaluation = state.eval_ctx().evaluate_template_expression(expr);
                if let Some(value) = evaluation.known_value() {
                    use crate::compiler::phases::phase3_transform::server::evaluate::{
                        EvalValue, js_display_string,
                    };
                    if !matches!(value, EvalValue::Null | EvalValue::Undefined) {
                        let content = js_display_string(value);
                        let last = quasis.last_mut().unwrap();
                        last.push_str(&escape_html(&content));
                    }
                    continue;
                }

                let visited = state.visit_expr(expr);
                let escaped = state.b.call("$.escape", vec![visited]);
                exprs.push(escaped);
                quasis.push(String::new());
            }
        }
    }

    if exprs.is_empty() {
        // Pure-text/comment run: a plain literal (matches upstream where the
        // template degenerates to a single-quasi literal that build_template
        // then folds into the surrounding string).
        state
            .template
            .push(TemplateEntry::Literal(quasis.pop().unwrap()));
    } else {
        state
            .template
            .push(TemplateEntry::Template { quasis, exprs });
    }
}

/// Port of upstream `build_template`: coalesce consecutive `Literal` / `Template`
/// entries in `template` into `$$renderer.push(\`...\`)` calls, flushing the run
/// whenever a `Stmt` entry is hit.
///
/// Returns the assembled body statements (in order).
pub fn build_template<'a>(
    template: Vec<TemplateEntry<'a>>,
    state: &ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    let b = state.b;
    let mut statements: Vec<Statement<'a>> = Vec::new();

    // The coalescing run: `strings.len() == exprs.len() + 1` always holds while
    // a run is open (we seed `strings` lazily with a leading "").
    let mut strings: Vec<String> = Vec::new();
    let mut exprs: Vec<OxcExpression<'a>> = Vec::new();

    let flush = |strings: &mut Vec<String>,
                 exprs: &mut Vec<OxcExpression<'a>>,
                 statements: &mut Vec<Statement<'a>>| {
        let quasis: Vec<&str> = strings.iter().map(|s| s.as_str()).collect();
        let tmpl = b.template(quasis, std::mem::take(exprs));
        statements.push(b.stmt(b.call("$$renderer.push", vec![tmpl])));
        strings.clear();
    };

    for entry in template {
        match entry {
            TemplateEntry::Stmt(stmt) => {
                if !strings.is_empty() {
                    flush(&mut strings, &mut exprs, &mut statements);
                }
                statements.push(stmt);
            }
            TemplateEntry::Literal(s) => {
                if strings.is_empty() {
                    strings.push(String::new());
                }
                let last = strings.last_mut().unwrap();
                last.push_str(&s);
            }
            TemplateEntry::Template {
                quasis,
                exprs: tmpl_exprs,
            } => {
                if strings.is_empty() {
                    strings.push(String::new());
                }
                // Merge: append first quasi onto the current last string, push the
                // rest of the quasis, and extend the expressions. Mirrors the
                // `TemplateLiteral` branch in upstream `build_template`.
                let mut it = quasis.into_iter();
                if let Some(first) = it.next() {
                    strings.last_mut().unwrap().push_str(&first);
                }
                for q in it {
                    strings.push(q);
                }
                exprs.extend(tmpl_exprs);
            }
        }
    }

    if !strings.is_empty() {
        flush(&mut strings, &mut exprs, &mut statements);
    }

    statements
}

/// Walk a fragment's children through [`process_children`] and emit the coalesced
/// `$$renderer.push(...)` body. Used for the root component fragment.
///
/// `is_text_first_parent` gates the upstream `clean_nodes`/`Fragment` visitor
/// `is_text_first` leading `<!---->` anchor. It must be `true` ONLY when this
/// fragment's parent is one of upstream's `is_text_first` parents — Fragment
/// (root), SnippetBlock, EachBlock, Component / SvelteSelf / SvelteComponent,
/// SvelteBoundary — and `false` for IfBlock / KeyBlock / AwaitBlock / SvelteHead
/// / SvelteElement / SvelteFragment / TitleElement bodies.
pub fn build_fragment_body<'a>(
    fragment: &Fragment,
    is_text_first_parent: bool,
    state: &mut ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    // Fragment-level bodies (root component, block bodies, `<svelte:head>` /
    // `<svelte:element>` children, snippets) have NO RegularElement parent, so
    // the `<pre>` / `<select>` / table special-cases don't apply and the
    // namespace is the default `html`. Element children route through
    // [`process_children`] directly with their real parent/namespace.
    let saved = std::mem::take(&mut state.template);
    process_children_inner(&fragment.nodes, None, "html", is_text_first_parent, state);
    let template = std::mem::replace(&mut state.template, saved);
    build_template(template, state)
}

/// Render a fragment as a `{ ... }` block statement — the Rust port of upstream's
/// server `Fragment` visitor return value `b.block([...init, ...build_template])`.
///
/// Block visitors (IfBlock / EachBlock / KeyBlock / AwaitBlock) wrap their child
/// fragments through this so the nested template content renders inside a real
/// `BlockStatement` (which [`build_template`] then flushes as an opaque `Stmt`).
///
/// The `is_text_first` leading `<!---->` insertion IS ported (via
/// [`process_children_inner`] with `is_block_parent = true`). 写经 gap: the
/// `clean_nodes` hoist pass is still handled by the per-visitor pipeline rather
/// than centrally here.
pub fn build_fragment_block<'a>(
    fragment: &Fragment,
    is_text_first_parent: bool,
    state: &mut ServerTransformState<'a>,
) -> Statement<'a> {
    let body = build_fragment_body(fragment, is_text_first_parent, state);
    state.b.block(body)
}
