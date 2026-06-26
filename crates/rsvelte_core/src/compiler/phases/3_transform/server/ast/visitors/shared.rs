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
    /// A hoistable declaration — a `{@const}` const or a non-hoistable
    /// `{#snippet}` `function` declaration. Like [`Stmt`](Self::Stmt) it breaks
    /// the coalescing run, but [`build_template`] lifts every `HoistableDecl` to
    /// the FRONT of the fragment body (preserving relative source order) and
    /// strips whitespace-only [`Literal`](Self::Literal) runs adjacent to the
    /// hoisted region. Mirrors the text oracle's
    /// `hoist_const_and_snippet_declarations` (upstream `state.init` ordering —
    /// declarations sit at the top of the enclosing block before any rendered
    /// HTML).
    HoistableDecl(Statement<'a>),
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
/// `parent` / `namespace` are passed through to `clean_whitespace` so the
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
    // 写经 upstream `RegularElement` `preserve_whitespace: state.preserve_whitespace
    // || name === 'pre' || name === 'textarea'`: STICKY — once an ancestor `<pre>`
    // / `<textarea>` turned it on (recorded in `state.preserve_whitespace`), every
    // descendant fragment keeps it, so a nested `<span>` inside a `<pre>` preserves
    // its inner whitespace. The immediate-parent check is kept as a belt-and-braces
    // fallback (the element visitor also sets the sticky flag before recursing).
    let preserve_whitespace = state.preserve_whitespace
        || parent.is_some_and(|el| matches!(el.name.as_str(), "pre" | "textarea"));

    // 写经 `clean_nodes` (utils.js:148-151): author HTML comments are dropped
    // from the children list BEFORE whitespace trimming unless `preserveComments`
    // is set. Doing it here (before `clean_whitespace`) means a removed comment
    // does not interpose between surrounding Text nodes, so their whitespace
    // collapses exactly as if the comment had never been there — matching the
    // `transform_server` oracle. The framework hydration markers (`<!--[-->`,
    // `<!---->`, `<!--]-->`) are NOT affected: those are emitted by block
    // visitors as `TemplateEntry::Literal`, never as `TemplateNode::Comment`.
    let preserve_comments = state.options.preserve_comments;

    // 写经 `clean_nodes` (utils.js:142-167): split the children into `hoisted`
    // (SSR-invisible / position-independent nodes — `{@const}` / `{@debug}` /
    // `{#snippet}` / `<svelte:head>` / `<title>` / `<svelte:body>` / `<svelte:window>`
    // / `<svelte:document>`) and `regular` (everything else). Author HTML comments
    // are dropped here too (unless `preserveComments`). Whitespace trimming and the
    // `is_text_first` computation then run on `regular` ONLY, so whitespace that sat
    // adjacent to a hoisted node becomes leading/trailing of `regular` and is
    // trimmed away — and a leading hoisted node never consumes the text-first slot.
    // 写经 `clean_nodes` (utils.js:138-140): in LEGACY mode, topologically sort
    // sibling `{@const}` tags by dependency before splitting, so a const that
    // reads another sibling const is emitted after it (Svelte-4 compat). Runes
    // mode keeps source order. `sort_const_tags` returns `None` (keep original)
    // when there is nothing to reorder.
    let reordered = sort_const_tags(nodes, state);
    let iter_nodes: Vec<&TemplateNode> = match reordered {
        Some(v) => v,
        None => nodes.iter().collect(),
    };

    let mut hoisted: Vec<&TemplateNode> = Vec::new();
    let mut filtered: Vec<&TemplateNode> = Vec::new();
    for &n in &iter_nodes {
        if matches!(n, TemplateNode::Comment(_)) && !preserve_comments {
            continue;
        }
        if is_hoisted_node(n) {
            hoisted.push(n);
        } else {
            filtered.push(n);
        }
    }

    // Visit hoisted nodes first (upstream's `for (const node of hoisted)
    // context.visit(node, state)`), BEFORE the `is_text_first` anchor and the
    // regular children, so e.g. `$.head(...)` is emitted ahead of the leading
    // `<!---->` and the sibling component calls.
    for node in &hoisted {
        super::visit_node(node, state);
    }

    let mut cleaned = clean_whitespace(&filtered, parent, namespace, preserve_whitespace);

    // 写经 `clean_nodes` (utils.js:254-263): if the first surviving child of a
    // `<pre>` is a Text node whose data is a single newline (`'\n'` / `'\r\n'`),
    // discard it — otherwise the browser would drop it for us at parse time,
    // breaking hydration. A `\n\n` (blank-line) first text is NOT a single
    // newline and is preserved.
    if parent.is_some_and(|el| el.name.as_str() == "pre") {
        let first_is_lone_newline = cleaned.first().is_some_and(
            |c| matches!(c.as_ref(), TemplateNode::Text(t) if t.data == "\n" || t.data == "\r\n"),
        );
        if first_is_lone_newline {
            cleaned.remove(0);
        }
    }

    // 写经 `clean_nodes` (utils.js:265-275) "lone script tag" special case: when
    // the ONLY surviving child is a `<script>` RegularElement, append an empty
    // `<!---->` comment node. Upstream needs this so the client's `run_scripts`
    // can `node.replaceWith()` the script (a parent-less script can't be replaced);
    // on the server it surfaces as a trailing `<!---->` after the script. Applies
    // to `<div><script>…</script></div>` and a lone `<script>` in `<svelte:head>`.
    if cleaned.len() == 1
        && matches!(
            cleaned[0].as_ref(),
            TemplateNode::RegularElement(el) if el.name.as_str() == "script"
        )
    {
        cleaned.push(Cow::Owned(TemplateNode::Comment(
            crate::ast::template::Comment {
                start: 0,
                end: 0,
                data: CompactString::default(),
            },
        )));
    }

    // 写经 `clean_nodes` → `Fragment` visitor: when the parent is a fragment /
    // block body and the first surviving child is Text / ExpressionTag, prepend
    // `<!---->` so the leading text isn't glued to the previous fragment.
    let first_visible = cleaned.first().map(|c| c.as_ref());
    if is_block_parent
        && matches!(
            first_visible,
            Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
        )
    {
        state
            .template
            .push(TemplateEntry::Literal(EMPTY_COMMENT.to_string()));
    }

    let mut sequence: Vec<SeqNode<'_>> = Vec::new();

    // 写经 the `AwaitExpression` server-visitor parent-walk: the direct children
    // of a RegularElement / TitleElement get `$.save`-wrapped awaits (their first
    // metadata-bearing ancestor is the element, not a Fragment). Block/fragment
    // bodies leave the flag at the parent's value. Saved/restored so nested
    // fragments (an `{#if}` body inside an element) re-derive it from their own
    // `parent` arg.
    let saved_in_element = state.in_element_children;
    state.in_element_children = parent.is_some();

    // 写经 upstream `state.namespace`: the children we are about to visit render
    // in `namespace`. Expose it on the state (save/restore) so a nested visitor —
    // e.g. the component `$.css_props(..., namespace === 'svg' ? false : true, …)`
    // SVG flag — can read the current namespace. `<foreignObject>` etc. switch
    // back to `html` for their children, which the element visitor already
    // reflects in the `namespace` it hands here.
    let saved_namespace = state.namespace;
    state.namespace = match namespace {
        "svg" => "svg",
        "mathml" => "mathml",
        _ => "html",
    };

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
                //
                // 写经 `process_children` (utils.js:79-95): an ASYNC expression
                // tag (`node.metadata.expression.is_async()`) does NOT join the
                // coalescing run — it FLUSHES the current sequence, then pushes
                // its own `$$renderer.async([$$promises[N]…], …)` push statement
                // as an opaque `Stmt`. An async tag here is one whose source
                // references an instance-level top-level-await blocker (a
                // non-empty `find_expression_blockers` against the precomputed
                // `top_level_blocker_map`, which is ONLY populated under
                // `experimental.async`, so this branch never fires for ordinary
                // sync components).
                // 写经 `is_async()` = `has_await || has_blockers()`. An inline
                // `{await …}` (no top-level blocker) flushes too and emits
                // `$$renderer.push(async () => $.escape(await …))` — the
                // `has_await=true, blockers=[]` shape. A top-level-await blocker
                // reference emits `$$renderer.async([$$promises[N]…], …)` with
                // `has_await=false` (the await lives in the instance thunk).
                // 写经 the const-blocker wrap (`apply_const_async_wrapping`): a
                // read of a binding registered in the per-fragment
                // `const_blocker_map` (an async `{@const}`) is routed through
                // `$$renderer.async([<blocker-expr>…], …)`, where the blocker is
                // the group's `promises[N]` member. Checked BEFORE the top-level
                // `$$promises[N]` blocker scan so a local async const dependency
                // wins.
                let const_blockers = expression_tag_const_blockers(&tag.expression, state);
                let blockers = expression_tag_blockers(&tag.expression, state);
                let inline_await = blockers.is_none()
                    && const_blockers.is_empty()
                    && state
                        .expr_source(&tag.expression)
                        .is_some_and(text_has_await);
                if !const_blockers.is_empty() {
                    flush_sequence(&sequence, state);
                    sequence.clear();
                    let visited = state.visit_expr(&tag.expression);
                    let stmt =
                        build_async_expression_push_exprs(state, visited, &const_blockers, false);
                    state.template.push(TemplateEntry::Stmt(stmt));
                } else if let Some(blockers) = blockers {
                    flush_sequence(&sequence, state);
                    sequence.clear();
                    let visited = state.visit_expr(&tag.expression);
                    let stmt = build_async_expression_push(state, visited, &blockers, false);
                    state.template.push(TemplateEntry::Stmt(stmt));
                } else if inline_await {
                    flush_sequence(&sequence, state);
                    sequence.clear();
                    // 写经 upstream server `AwaitExpression.js` parent-walk
                    // (`has_save = !in_block_body`): an inline `{await …}` whose
                    // IMMEDIATE template parent is a RegularElement / TitleElement
                    // (`parent.is_some()` — `process_children` runs inline on
                    // element children, leaving a non-Fragment metadata ancestor
                    // on top of the path) gets `$.save`-wrapped —
                    // `(await $.save(<arg>))()`. A Fragment / block body parent
                    // (`parent == None`: root component fragment, `{#if}` / `{#each}`
                    // / `{#key}` / snippet / await body, snippet) leaves the bare
                    // `await …`; the enclosing `child_block(async …)` (or the
                    // `$$renderer.push(async …)` thunk) already wraps the await.
                    // NOTE: `is_block_parent` is the `is_text_first` ANCHOR flag,
                    // which is a DIFFERENT axis (an `{#if}` body is a block parent
                    // but NOT text-first), so the save decision keys off `parent`.
                    let visited = if parent.is_some() {
                        let src = state
                            .expr_source(&tag.expression)
                            .map(|s| s.to_string())
                            .unwrap_or_default();
                        save_wrap_expr_text(state, &src)
                    } else {
                        state.visit_expr(&tag.expression)
                    };
                    let stmt = build_async_expression_push(state, visited, &[], true);
                    state.template.push(TemplateEntry::Stmt(stmt));
                } else {
                    sequence.push(SeqNode::Expr(&tag.expression));
                }
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
    state.in_element_children = saved_in_element;
    state.namespace = saved_namespace;
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
    nodes: &[&'n TemplateNode],
    parent: Option<&RegularElement>,
    namespace: &str,
    preserve_whitespace: bool,
) -> Vec<Cow<'n, TemplateNode>> {
    if preserve_whitespace {
        return nodes.iter().map(|n| Cow::Borrowed(*n)).collect();
    }

    // 写经 `clean_nodes` (utils.js:148-169): split the hoisted / SSR-invisible
    // nodes (`{#snippet}` / `{@const}` / `<svelte:head>` / `<title>` / window /
    // document / body / options) out of `regular` BEFORE the whitespace trim, so
    // text adjacent to a hoisted node (e.g. the trailing whitespace after the
    // last `<option>` in `<select>...</select>\n{#snippet}` or the leading
    // whitespace before `<svelte:boundary>` after a top-level `{#snippet}`) is
    // trimmed as a fragment-boundary edge. The hoisted nodes still need to be
    // visited (their function declaration is emitted into `state.hoisted`), so we
    // keep them in the returned list — but at the FRONT, where they emit nothing
    // into the template and do not perturb whitespace collapse between regulars.
    let mut hoisted: Vec<Cow<'n, TemplateNode>> = Vec::new();
    let mut regular: Vec<&'n TemplateNode> = Vec::with_capacity(nodes.len());
    for n in nodes {
        if is_hoisted_node(n) {
            hoisted.push(Cow::Borrowed(*n));
        } else {
            regular.push(*n);
        }
    }

    // Find the first / last non-whitespace-only nodes (the trimmable window).
    let is_ws_text = |n: &TemplateNode| match n {
        TemplateNode::Text(t) => is_svelte_whitespace_only(&t.data),
        _ => false,
    };
    let is_ws_text = |n: &&TemplateNode| is_ws_text(n);
    let start = regular.iter().position(|n| !is_ws_text(n));
    let Some(start) = start else {
        // No regular content survives: emit only the hoisted nodes.
        return hoisted;
    };
    let end = regular.iter().rposition(|n| !is_ws_text(n)).unwrap() + 1;
    let window: &[&'n TemplateNode] = &regular[start..end];

    let can_remove_entirely = match parent {
        Some(el) => matches!(
            el.name.as_str(),
            "select" | "tr" | "table" | "tbody" | "thead" | "tfoot" | "colgroup" | "datalist"
        ),
        None => false,
    } || (namespace == "svg"
        && !matches!(parent, Some(el) if el.name.as_str() == "text"));

    let last_idx = window.len() - 1;
    // Emit the hoisted nodes first (they render nothing into the template; their
    // function declarations are hoisted when visited), then the trimmed regulars.
    let mut out: Vec<Cow<'n, TemplateNode>> = hoisted;
    out.reserve(window.len());
    let mut prev_ends_with_ws = false;
    let mut prev_is_expression_tag = false;

    for (i, node) in window.iter().enumerate() {
        let node: &'n TemplateNode = node;
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
            .is_some_and(|n| matches!(**n, TemplateNode::ExpressionTag(_)));
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

/// Whether `node` is one of the hoisted / SSR-invisible / position-independent
/// node kinds that upstream's `clean_nodes` (utils.js:142-167) pulls out of
/// `regular` into `hoisted` BEFORE whitespace trimming and the `is_text_first`
/// computation. Hoisted nodes are visited first (in document order) and never
/// influence the trim / text-first slot, so adjacent whitespace collapses as if
/// they were absent. Mirrors upstream's hoist list: `ConstTag`, `DeclarationTag`,
/// `DebugTag`, `SvelteBody`, `SvelteWindow`, `SvelteDocument`, `SvelteHead`,
/// `TitleElement`, `SnippetBlock`. (`SvelteOptions` is removed during parsing
/// upstream; rsvelte may retain it as a node, so it is hoisted here too — its
/// visitor is a no-op for SSR output.)
fn is_hoisted_node(node: &TemplateNode) -> bool {
    matches!(
        node,
        TemplateNode::SvelteOptions(_)
            | TemplateNode::ConstTag(_)
            | TemplateNode::DeclarationTag(_)
            | TemplateNode::DebugTag(_)
            | TemplateNode::SnippetBlock(_)
            | TemplateNode::SvelteHead(_)
            | TemplateNode::TitleElement(_)
            | TemplateNode::SvelteBody(_)
            | TemplateNode::SvelteWindow(_)
            | TemplateNode::SvelteDocument(_)
    )
}

/// Determine whether an ExpressionTag's interpolation is "async" — i.e. it
/// references an instance-level top-level-await blocker — and, if so, return the
/// blocker indices for its `$$renderer.async([$$promises[N]…], …)` wrap.
///
/// Mirrors upstream `node.metadata.expression.is_async()` (true when the
/// expression has `await` OR carries blockers) restricted to the top-level
/// blocker case: the indices come from `find_expression_blockers` over the
/// precomputed `top_level_blocker_map`. That map is ONLY populated under
/// `experimental.async`, so a `None` is returned for every ordinary component
/// and this whole async path is inert for sync output.
fn expression_tag_blockers(expr: &Expression, state: &ServerTransformState) -> Option<Vec<usize>> {
    if state.eval_inputs.top_level_blocker_map.is_empty() {
        return None;
    }
    let (start, end) = (expr.start()?, expr.end()?);
    let (start, end) = (start as usize, end as usize);
    if end <= start || end > state.source.len() {
        return None;
    }
    let expr_text = &state.source[start..end];
    // A read of a name SHADOWED by an enclosing snippet / scoped-slot parameter
    // resolves to that local param, NOT the same-named instance binding, so it is
    // NOT an async blocker (e.g. `{#snippet child(n)}<div>{n}</div>{/snippet}` with
    // a component `const n = $derived(await …)` — the `{n}` is the snippet param).
    // The read-wrap pass already honours `shadowed_names`; mirror it here by
    // dropping shadowed names from the blocker map before the scan.
    let shadowed = state.collect_shadowed();
    let blockers = if shadowed.is_empty() {
        crate::compiler::phases::phase3_transform::server::helpers::find_expression_blockers(
            expr_text,
            &state.eval_inputs.top_level_blocker_map,
        )
    } else {
        let filtered: rustc_hash::FxHashMap<String, usize> = state
            .eval_inputs
            .top_level_blocker_map
            .iter()
            .filter(|(k, _)| !shadowed.contains(k.as_str()))
            .map(|(k, v)| (k.clone(), *v))
            .collect();
        crate::compiler::phases::phase3_transform::server::helpers::find_expression_blockers(
            expr_text, &filtered,
        )
    };
    if blockers.is_empty() {
        None
    } else {
        Some(blockers)
    }
}

/// Find the per-fragment const-tag blocker EXPRESSIONS (`promises[N]` source
/// strings) referenced by an ExpressionTag's interpolation, via
/// [`ServerTransformState::const_blocker_map`]. Empty when no async `{@const}`
/// in scope blocks any read in the expression. Mirrors the text oracle's
/// `find_const_expression_blockers`.
fn expression_tag_const_blockers(expr: &Expression, state: &ServerTransformState) -> Vec<String> {
    if state.const_blocker_map.is_empty() {
        return Vec::new();
    }
    let Some(text) = state.expr_source(expr) else {
        return Vec::new();
    };
    crate::compiler::phases::phase3_transform::server::helpers::find_const_expression_blockers(
        text,
        &state.const_blocker_map,
    )
}

/// A joinable sibling captured during [`process_children`].
enum SeqNode<'n> {
    Text(&'n str),
    Comment(&'n str),
    Expr(&'n Expression),
}

/// Whether `src` is a single bare JS identifier (`foo`, `$bar`, `_x9`) — used to
/// gate the block-local `constant_vars` fold so only a simple `{name}` read folds
/// to its registered literal (a member access / call / operator never does).
fn is_plain_identifier(src: &str) -> bool {
    let mut chars = src.chars();
    match chars.next() {
        Some(c) if c.is_alphabetic() || c == '_' || c == '$' => {}
        _ => return false,
    }
    chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
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
                // A `let:`-scoped SLOT variable read (`<Nested let:count>{count}
                // </Nested>`) must NOT constant-fold to the same-named COMPONENT
                // binding's value (`let count = 42`). Upstream resolves `count` to
                // the slot scope parameter (an opaque runtime value), so it stays
                // `$.escape(count)`. This wins over the `constant_vars` /
                // `scope.evaluate` folds. (A SNIPPET parameter is NOT in this set —
                // upstream DOES fold a snippet-param read whose component argument
                // is statically known, so `slot_let_shadows` is kept distinct from
                // the snippet-param `shadowed_names`.)
                if !state.slot_let_shadows.is_empty()
                    && let Some(src) = state.expr_source(expr)
                    && is_plain_identifier(src.trim())
                    && state
                        .slot_let_shadows
                        .iter()
                        .any(|f| f.contains(src.trim()))
                {
                    let visited = state.visit_expr(expr);
                    let escaped = state.b.call("$.escape", vec![visited]);
                    exprs.push(escaped);
                    quasis.push(String::new());
                    continue;
                }
                // Block-local DeclarationTag constant fold (写经 the text oracle's
                // `try_fold_with_constants`, which checks `constant_vars` BEFORE
                // any binding resolution): a `{const x = <literal>}` declaration
                // tag registers `x` in `eval_inputs.constant_vars`, and a bare
                // `{x}` read folds to that literal. This must win over the
                // analysis-binding evaluation below, because a SHADOWED name
                // (a nested `{const doubled = 'nested'}` shadowing an outer
                // `$derived doubled`) resolves to two disagreeing bindings and
                // `evaluate_template_expression` gives up (`unknown`) — leaving
                // the read wrapped as `doubled()`, which reads the WRONG outer
                // binding. The block-local constant_vars entry resolves it to the
                // shadowing const's literal value, matching the oracle.
                if !state.eval_inputs.constant_vars.is_empty()
                    && let Some(src) = state.expr_source(expr)
                    && is_plain_identifier(src.trim())
                    && let Some(value) = state.eval_inputs.constant_vars.get(src.trim())
                {
                    if value != "null" && value != "undefined" {
                        let last = quasis.last_mut().unwrap();
                        last.push_str(&escape_html(value));
                    }
                    continue;
                }
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
/// 写经 `3-transform/utils.js::sort_const_tags` (Svelte-4 compat, LEGACY ONLY):
/// reorder a child list so `{@const}` tags appear in topological dependency order
/// (a const whose initializer references another sibling const is emitted AFTER
/// it), with all consts moved ahead of the other children. Runs in
/// `process_children_inner` before the hoisted/regular split. Returns `None` when
/// the component is in runes mode or the list has no `{@const}` (caller keeps the
/// original order). Only inter-const edges matter for ordering — a dependency on
/// a non-const binding (prop / global) does not create an edge — so the
/// dependency scan only needs each const's declared names + the identifiers
/// referenced in its initializer (reusing the same string-based extraction the
/// const-tag visitor uses, so the two stay consistent).
fn sort_const_tags<'n>(
    nodes: &'n [TemplateNode],
    state: &ServerTransformState<'_>,
) -> Option<Vec<&'n TemplateNode>> {
    if state.analysis.runes {
        return None;
    }

    struct ConstInfo<'n> {
        node: &'n TemplateNode,
        declared: Vec<String>,
        deps: Vec<String>,
    }

    let mut consts: Vec<ConstInfo<'n>> = Vec::new();
    let mut others: Vec<&'n TemplateNode> = Vec::new();
    for n in nodes {
        if let TemplateNode::ConstTag(ct) = n {
            let start = ct.declaration.start().unwrap_or(0) as usize;
            let end = ct.declaration.end().unwrap_or(0) as usize;
            let (declared, deps) = if end > start && end <= state.source.len() {
                let src = state.source[start..end].trim();
                match super::const_tag::find_assignment_eq(src) {
                    Some(eq) => (
                        super::const_tag::extract_declared_names(&src[..eq]),
                        super::const_tag::extract_identifiers_from_expr(&src[eq + 1..]),
                    ),
                    None => (Vec::new(), Vec::new()),
                }
            } else {
                (Vec::new(), Vec::new())
            };
            consts.push(ConstInfo {
                node: n,
                declared,
                deps,
            });
        } else {
            others.push(n);
        }
    }

    if consts.is_empty() {
        return None;
    }

    // Map each declared name → the index of the const that declares it (first
    // wins, mirroring upstream's `tags.set(binding, …)` keyed by binding).
    let mut name_to_idx: rustc_hash::FxHashMap<&str, usize> = rustc_hash::FxHashMap::default();
    for (i, c) in consts.iter().enumerate() {
        for d in &c.declared {
            name_to_idx.entry(d.as_str()).or_insert(i);
        }
    }

    // Depth-first topological add: visit a const's dependency consts before it.
    // `done` is the post-order guard (upstream's `sorted.includes`); `on_stack`
    // breaks any dependency cycle so a malformed input can't recurse forever
    // (upstream errors on cycles via `check_graph_for_cycles`; for valid DAG
    // inputs both produce the same order).
    #[allow(clippy::too_many_arguments)]
    fn add(
        i: usize,
        deps_of: &[Vec<String>],
        name_to_idx: &rustc_hash::FxHashMap<&str, usize>,
        done: &mut [bool],
        on_stack: &mut [bool],
        sorted: &mut Vec<usize>,
    ) {
        if done[i] || on_stack[i] {
            return;
        }
        on_stack[i] = true;
        for dep in &deps_of[i] {
            if let Some(&j) = name_to_idx.get(dep.as_str())
                && j != i
            {
                add(j, deps_of, name_to_idx, done, on_stack, sorted);
            }
        }
        on_stack[i] = false;
        done[i] = true;
        sorted.push(i);
    }

    let deps_of: Vec<Vec<String>> = consts.iter().map(|c| c.deps.clone()).collect();
    let mut done = vec![false; consts.len()];
    let mut on_stack = vec![false; consts.len()];
    let mut sorted_idx: Vec<usize> = Vec::new();
    for i in 0..consts.len() {
        add(
            i,
            &deps_of,
            &name_to_idx,
            &mut done,
            &mut on_stack,
            &mut sorted_idx,
        );
    }

    let mut out: Vec<&'n TemplateNode> = sorted_idx.iter().map(|&i| consts[i].node).collect();
    out.extend(others);
    Some(out)
}

/// Lift every [`TemplateEntry::HoistableDecl`] to the front of the entry list,
/// preserving relative order, and drop whitespace-only [`TemplateEntry::Literal`]
/// runs that sit in the "hoisted region". 写经 the text oracle's
/// `hoist_const_and_snippet_declarations` (mirrors upstream's `state.init`
/// ordering: `{@const}` consts and non-hoistable `{#snippet}` functions sit at
/// the top of the enclosing fragment block ahead of any rendered HTML).
fn hoist_declarations<'a>(template: Vec<TemplateEntry<'a>>) -> Vec<TemplateEntry<'a>> {
    let has_decls = template
        .iter()
        .any(|e| matches!(e, TemplateEntry::HoistableDecl(_)));
    if !has_decls {
        return template;
    }
    let mut hoisted: Vec<TemplateEntry<'a>> = Vec::new();
    let mut rest: Vec<TemplateEntry<'a>> = Vec::new();
    // Like the oracle: start "in region" so leading whitespace before the first
    // declaration is stripped; a real (non-whitespace, non-decl) entry flips it
    // off and subsequent whitespace is kept in `rest`.
    let mut in_hoisted_region = true;
    for entry in template {
        match entry {
            TemplateEntry::HoistableDecl(_) => {
                in_hoisted_region = true;
                hoisted.push(entry);
            }
            TemplateEntry::Literal(ref s) if in_hoisted_region && s.trim().is_empty() => {
                // Whitespace-only literal in the hoisted region → dropped.
            }
            _ => {
                in_hoisted_region = false;
                rest.push(entry);
            }
        }
    }
    hoisted.extend(rest);
    hoisted
}

pub fn build_template<'a>(
    template: Vec<TemplateEntry<'a>>,
    state: &ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    let b = state.b;
    let mut statements: Vec<Statement<'a>> = Vec::new();

    // 写经 the text oracle's `hoist_const_and_snippet_declarations`: lift every
    // `HoistableDecl` (a `{@const}` const / non-hoistable `{#snippet}` function)
    // to the FRONT of the fragment body, preserving relative source order, and
    // strip whitespace-only `Literal` runs that sit in the hoisted region (so a
    // newline between a `{@const}` and a `{#snippet}` does not become a spurious
    // `$$renderer.push(' ')`). Everything else keeps its order in `rest`.
    let template = hoist_declarations(template);

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
            TemplateEntry::Stmt(stmt) | TemplateEntry::HoistableDecl(stmt) => {
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
    //
    // 写经 upstream `Fragment.js`: EACH fragment recomputes `is_standalone` from
    // its own `clean_nodes` and stores it on the fresh per-fragment `state`
    // (`{ ...context.state, is_standalone }`). A fragment whose single surviving
    // (non-hoisted) child is a non-dynamic Component / RenderTag is "standalone"
    // — the enclosing block's anchor (`<!--[-->`/`<!--]-->`, or the if-branch
    // markers) suffices, so the child's own trailing `<!---->` empty-comment
    // anchor is suppressed (see Component / RenderTag `!state.is_standalone`
    // guard). The previous code only set `is_standalone` for the ROOT fragment,
    // so a `{#if}…<Foo/>…{/if}` / `{#each}…<Foo/>…{/each}` / `<svelte:head><Foo/>`
    // arm wrongly emitted a spurious `$$renderer.push(\`<!---->\`)` after the
    // child. Recompute it here (save/restore) so every fragment block matches
    // upstream.
    let saved_standalone = state.is_standalone;
    state.is_standalone =
        ServerTransformState::is_standalone_fragment(&fragment.nodes, state.preserve_whitespace);
    // Track fragment nesting depth: the root component fragment is depth 1; any
    // nested block / boundary / snippet body is depth ≥ 2. The boundary visitor
    // reads this to decide `failed`-snippet hoist-vs-inline placement.
    state.fragment_depth += 1;
    let saved = std::mem::take(&mut state.template);

    // 写经 upstream `Fragment.js`: each fragment gets a FRESH
    // `async_consts: undefined` and inherits the parent `const_blocker_map`
    // (additions are local to this scope). Save/restore both around the body so
    // a block's async `{@const}` group does not leak to siblings, while a child
    // fragment can still see a parent-scope blocked binding.
    let saved_async_consts = state.async_consts.take();
    let saved_blocker_map = state.const_blocker_map.clone();
    let saved_local_derived = state.local_derived_names.clone();

    // 写经 upstream `SnippetBlock.js`: a NON-hoistable snippet pushes its function
    // declaration onto the ENCLOSING render scope's `state.init`. Each fragment
    // body (root component, block bodies, snippet bodies) is its own init scope,
    // so save/restore `snippet_inits` around this fragment: snippets collected
    // while walking THIS fragment's children (including those nested in inline
    // RegularElements, which do not open a new init scope) belong here and are
    // prepended to this fragment's body; a parent scope's pending inits are
    // restored afterward.
    let saved_snippet_inits = std::mem::take(&mut state.snippet_inits);

    // 写经 upstream `Fragment.js` → `clean_nodes(..., infer_namespace(...))`: a
    // fragment whose direct RegularElement children are all SVG (or all MathML)
    // adopts that namespace, so whitespace-only text between them is removable
    // (`can_remove_entirely`) just like inside an `<svg>` element. When the
    // fragment has no element children (only text / render tags / components),
    // it inherits the ENCLOSING namespace (`state.namespace`) rather than
    // defaulting to `html` — mirroring upstream `infer_namespace()`'s fall-through
    // to the incoming namespace. Previously this hardcoded `"html"`, so a
    // `{#snippet}` of adjacent render/component anchors inside `<svg>` kept its
    // whitespace text node, emitting a spurious trailing space in the SSR markup
    // (issue #1227). The root component fragment has `state.namespace == "html"`,
    // so its default is unchanged.
    let fragment_namespace = infer_namespace_from_nodes_owned(&fragment.nodes, state.namespace);
    process_children_inner(
        &fragment.nodes,
        None,
        &fragment_namespace,
        is_text_first_parent,
        state,
    );
    let template = std::mem::replace(&mut state.template, saved);
    let mut body = build_template(template, state);

    // Prepend this fragment's non-hoistable snippet function declarations to the
    // front of the body (ahead of the rendered template), then restore the
    // parent scope's pending inits.
    let fragment_snippet_inits = std::mem::replace(&mut state.snippet_inits, saved_snippet_inits);
    if !fragment_snippet_inits.is_empty() {
        let mut prelude = fragment_snippet_inits;
        prelude.append(&mut body);
        body = prelude;
    }

    // 写经 `Fragment.js`: when this fragment opened an async `{@const}` group,
    // prepend `let a; let b; var promises = $$renderer.run([thunks…]);` ahead of
    // the template body (`state.init.push(...)` → `[...state.init, ...template]`).
    if let Some(group) = state.async_consts.take()
        && !group.thunks.is_empty()
    {
        let run_decl = build_async_consts_run(state, &group);
        // 写经 upstream `state.init` order. The async-const `let`s land AFTER the
        // leading sync hoisted-const declarations (`build_template` lifts
        // `{const sync = 'sync'}` to the front), so a sync `{const}` precedes
        // them. The `var promises = run([…])` itself floats further, to AFTER all
        // leading hoisted declarations INCLUDING snippet `function` declarations
        // (`{#snippet}` bodies emitted into the init), since the run is built last
        // at the fragment-init end: `[const sync, let …, function greet(){…}, var
        // promises = run([…]), …pushes]`.
        let let_split = body
            .iter()
            .position(|s| !matches!(s, Statement::VariableDeclaration(_)))
            .unwrap_or(body.len());
        let mut new_body: Vec<Statement<'a>> = body.drain(..let_split).collect();
        new_body.extend(group.let_decls);
        new_body.append(&mut body);
        let run_split = new_body
            .iter()
            .position(|s| {
                !matches!(
                    s,
                    Statement::VariableDeclaration(_) | Statement::FunctionDeclaration(_)
                )
            })
            .unwrap_or(new_body.len());
        new_body.insert(run_split, run_decl);
        body = new_body;
    }

    state.async_consts = saved_async_consts;
    state.const_blocker_map = saved_blocker_map;
    state.local_derived_names = saved_local_derived;
    state.is_standalone = saved_standalone;
    state.fragment_depth -= 1;
    body
}

/// Build the `var <name> = $$renderer.run([<thunks>]);` declaration for an async
/// `{@const}` group (写经 `Fragment.js` lines 46-50 +
/// `add_async_declaration`). Each thunk's source text is reparsed into an oxc
/// expression so the printed output matches the text oracle byte-for-byte.
/// Saved parent async-const scope (group + blocker map) returned by
/// [`open_async_consts_scope`] and consumed by [`flush_element_async_consts`].
pub(super) type SavedAsyncConstsScope<'a> = (
    Option<crate::compiler::phases::phase3_transform::server::ast::AsyncConstsGroup<'a>>,
    rustc_hash::FxHashMap<String, String>,
);

/// Open a FRESH async-const scope (写经 each Fragment / `has_declarations`
/// element getting its own `async_consts: undefined`). The current group is taken
/// (so a child element's async `{const}`s form their OWN `$$renderer.run` group,
/// not the parent's), and the `const_blocker_map` is cloned so a parent-scope
/// blocked binding stays visible while local additions are discarded on close.
pub(super) fn open_async_consts_scope<'a>(
    state: &mut ServerTransformState<'a>,
) -> SavedAsyncConstsScope<'a> {
    (state.async_consts.take(), state.const_blocker_map.clone())
}

/// Flush a `has_declarations` element's OWN async-const group into `body`: emit
/// the `let …; var promisesN = $$renderer.run([…]);` prelude AFTER the element's
/// leading sync hoisted-const declarations (mirroring upstream's `state.init`
/// ordering — a sync `{const nested = 'nested'}` precedes the async run that
/// depends on a parent-group binding), then restore the parent async-const scope.
/// No-op when the element opened no async group.
pub(super) fn flush_element_async_consts<'a>(
    state: &mut ServerTransformState<'a>,
    saved: SavedAsyncConstsScope<'a>,
    body: &mut Vec<Statement<'a>>,
) {
    let (saved_group, saved_map) = saved;
    if let Some(group) = state.async_consts.take()
        && !group.thunks.is_empty()
    {
        let run_decl = build_async_consts_run(state, &group);
        // Insert after the run of leading VariableDeclarations (the sync hoisted
        // `{const}`s that `build_template` lifted to the front) so the async
        // `let`s + run land between them and the rendered template pushes.
        let split = body
            .iter()
            .position(|s| !matches!(s, Statement::VariableDeclaration(_)))
            .unwrap_or(body.len());
        let mut new_body: Vec<Statement<'a>> =
            Vec::with_capacity(body.len() + group.let_decls.len() + 1);
        new_body.extend(body.drain(..split));
        new_body.extend(group.let_decls);
        new_body.push(run_decl);
        new_body.append(body);
        *body = new_body;
    }
    state.async_consts = saved_group;
    state.const_blocker_map = saved_map;
}

fn build_async_consts_run<'a>(
    state: &ServerTransformState<'a>,
    group: &crate::compiler::phases::phase3_transform::server::ast::AsyncConstsGroup<'a>,
) -> Statement<'a> {
    let b = state.b;
    let elems: Vec<Option<OxcExpression<'a>>> = group
        .thunks
        .iter()
        .map(|(code, _)| {
            Some(
                state
                    .reparse_slice_owned(code)
                    .unwrap_or_else(|| b.id("undefined")),
            )
        })
        .collect();
    let run_call = b.call("$$renderer.run", vec![b.array(elems)]);
    b.var_decl(b.id_pat(&group.name), Some(run_call))
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

// ===========================================================================
// Async SSR foundation (Stage 0).
//
// Faithful port of upstream `shared/utils.js` `create_child_block` and the
// top-level `render` / `async` expression-tag wrap. These two helpers are the
// reusable seam every async slice (top-level await, then block-level if/each/
// await wrapping) builds on, so they take the blocker indices + `has_await`
// flag explicitly and stay independent of any particular visitor.
// ===========================================================================

/// Build a `$$promises[i]` computed-member access — the canonical blocker
/// reference shape (`b.member_computed(b.id("$$promises"), b.number(i))`).
pub fn promise_ref<'a>(state: &ServerTransformState<'a>, i: usize) -> OxcExpression<'a> {
    let b = state.b;
    b.member_computed(b.id("$$promises"), b.number(i as f64))
}

/// Build the `[$$promises[i], …]` blockers array expression from a list of
/// blocker indices (empty list → `[]`).
pub fn blockers_array<'a>(
    state: &ServerTransformState<'a>,
    indices: &[usize],
) -> OxcExpression<'a> {
    let b = state.b;
    let elems: Vec<Option<OxcExpression<'a>>> = indices
        .iter()
        .map(|&i| Some(promise_ref(state, i)))
        .collect();
    b.array(elems)
}

/// Port of upstream `shared/utils.js::create_child_block` (lines 298-308).
///
/// Wraps a block of `statements` in the appropriate child renderer call:
/// - no blockers AND no await → the statements are returned verbatim (no wrap);
/// - blockers present → `[$$renderer.async_block([$$promises[i]…], fn)]`;
/// - else (await only) → `[$$renderer.child_block(fn)]`.
///
/// `fn` is `($$renderer) => { <statements> }`, made `async` iff `has_await`.
/// This is the reusable seam for the block-level (if/each/await) async wrapping
/// in Stage 2 — it does NOT touch non-async output (empty blockers + no await
/// returns the input unchanged).
pub fn create_child_block<'a>(
    state: &ServerTransformState<'a>,
    statements: Vec<Statement<'a>>,
    blocker_indices: &[usize],
    has_await: bool,
) -> Vec<Statement<'a>> {
    if blocker_indices.is_empty() && !has_await {
        return statements;
    }
    let b = state.b;
    // ($$renderer) => { <statements> }, async iff has_await.
    let params = b.params(vec![b.id_pat("$$renderer")], None);
    let fn_body = b.body(statements);
    let arrow = b.arrow(params, fn_body, false, has_await);

    if !blocker_indices.is_empty() {
        let blockers = blockers_array(state, blocker_indices);
        vec![b.stmt(b.call("$$renderer.async_block", vec![blockers, arrow]))]
    } else {
        vec![b.stmt(b.call("$$renderer.child_block", vec![arrow]))]
    }
}

/// Local (per-block) const blocker SOURCE strings referenced by `expr_text` —
/// bindings declared by an async `{@const}` / `{@let}` inside the current block
/// whose `$$renderer.run([...])` group member (e.g. `"promises[1]"`) gates them.
/// Mirrors `metadata.expression.blockers()` for the LOCAL portion (the instance
/// `$$promises[N]` portion comes from [`expr_text_blockers`]). Empty when no
/// async const is in scope.
pub fn expr_local_const_blockers(state: &ServerTransformState, expr_text: &str) -> Vec<String> {
    if state.const_blocker_map.is_empty() {
        return Vec::new();
    }
    crate::compiler::phases::phase3_transform::server::helpers::find_const_expression_blockers(
        expr_text,
        &state.const_blocker_map,
    )
}

/// Build a `[$$promises[i]…, <local source>…]` blockers array combining instance
/// blockers (numeric indices → `$$promises[i]`) with local const blocker source
/// strings (reparsed verbatim, e.g. `promises[1]` / `promises_1[0]`).
pub fn blockers_array_combined<'a>(
    state: &ServerTransformState<'a>,
    indices: &[usize],
    local_sources: &[String],
) -> OxcExpression<'a> {
    let b = state.b;
    let mut elems: Vec<Option<OxcExpression<'a>>> = Vec::new();
    for &i in indices {
        elems.push(Some(promise_ref(state, i)));
    }
    for src in local_sources {
        if let Some(e) = state.reparse_slice_owned(src) {
            elems.push(Some(e));
        }
    }
    b.array(elems)
}

/// Like `create_child_block` but accepts BOTH instance blocker indices and
/// local const blocker source strings. 写经 `create_child_block` with a
/// `blockers()` set that mixes instance `$$promises[N]` and per-block
/// `promises[N]` members: a non-empty combined set →
/// `$$renderer.async_block([…], fn)`, await-only → `$$renderer.child_block(fn)`,
/// neither → the statements verbatim.
pub fn create_child_block_combined<'a>(
    state: &ServerTransformState<'a>,
    statements: Vec<Statement<'a>>,
    indices: &[usize],
    local_sources: &[String],
    has_await: bool,
) -> Vec<Statement<'a>> {
    if indices.is_empty() && local_sources.is_empty() && !has_await {
        return statements;
    }
    let b = state.b;
    let params = b.params(vec![b.id_pat("$$renderer")], None);
    let fn_body = b.body(statements);
    let arrow = b.arrow(params, fn_body, false, has_await);

    if !indices.is_empty() || !local_sources.is_empty() {
        let blockers = blockers_array_combined(state, indices, local_sources);
        vec![b.stmt(b.call("$$renderer.async_block", vec![blockers, arrow]))]
    } else {
        vec![b.stmt(b.call("$$renderer.child_block", vec![arrow]))]
    }
}

/// The shared `$.save` / await-wrap helper — the reusable seam for block-level
/// async test/iterable expressions (IfBlock, and later EachBlock / AwaitBlock /
/// KeyBlock). Given the SOURCE TEXT of a block's controlling expression, it
/// returns the oxc expression that should drive the emitted `if (...)` / `for`
/// header:
///
/// - When the expression contains a top-level `await` (an inline await, NOT a
///   nested function/arrow), every such await's argument is wrapped via
///   upstream's `save(argument)` → `(await $.save(<arg>))()`
///   (`utils/ast.js::save`), the textual rewrite from
///   `super::super::super::await_save_ast::transform_await_to_save_ast`, and
///   the result is re-parsed into an oxc expression. This is the `$.save`
///   await-wrap. The accompanying [`text_has_await`] returns `true` so the
///   caller makes its wrapping arrow `async`.
/// - Otherwise (no inline await) the expression is read-wrapped via
///   `ServerTransformState::visit_expr` (so a derived `blocking` becomes
///   `blocking()`), matching the non-await branch of the oracle.
///
/// 写经 upstream server `AwaitExpression` visitor + `IfBlock.js`: the test of an
/// await-bearing `{#if}` is `context.visit(node.test)`, where the nested
/// `AwaitExpression` visitor rewrites each `await x` into `save(x)`. Doing the
/// rewrite textually here mirrors the proven text-oracle path
/// (`convert_if_block` → `transform_await_to_save`) and re-parses the result so
/// the AST printer emits it.
pub fn save_wrap_expr_text<'a>(
    state: &ServerTransformState<'a>,
    expr_text: &str,
) -> OxcExpression<'a> {
    if text_has_await(expr_text)
        && let Some(saved) =
            crate::compiler::phases::phase3_transform::server::await_save_ast::transform_await_to_save_ast(
                expr_text,
            )
        && let Some(reparsed) = state.reparse_slice_owned(&saved)
    {
        return reparsed;
    }
    // No await (or the save rewrite/reparse failed): fall back to the plain
    // read-wrapped expression. `reparse_slice_owned` already trims, so a bare
    // text reparse keeps the non-await spelling intact.
    if let Some(reparsed) = state.reparse_slice_owned(expr_text) {
        return reparsed;
    }
    state.b.id("undefined")
}

/// Whether `expr_text` contains an inline (top-level, not nested in a
/// function/arrow body) `await`. Thin re-export of the server helper so the
/// async block visitors share ONE await-detection predicate
/// (`metadata.expression.has_await`). Cheap `memmem("await")` pre-check inside.
pub fn text_has_await(expr_text: &str) -> bool {
    crate::compiler::phases::phase3_transform::server::helpers::expr_contains_await(expr_text)
}

/// Find the top-level-await blocker indices (`$$promises[N]`) referenced by
/// `expr_text` against the precomputed instance blocker map. Empty when async is
/// off (the map is only populated under `experimental.async`) or the expression
/// references no blocked binding. Mirrors `metadata.expression.blockers()`.
pub fn expr_text_blockers(state: &ServerTransformState, expr_text: &str) -> Vec<usize> {
    crate::compiler::phases::phase3_transform::server::helpers::find_expression_blockers(
        expr_text,
        &state.eval_inputs.top_level_blocker_map,
    )
}

/// Build the top-level async-wrapped expression-tag push statement — the Rust
/// mirror of the ExpressionTag async branch in upstream `process_children`
/// (`shared/utils.js` lines 79-95):
///
/// ```text
/// $$renderer.push(() => $.escape(expr))                      // inner push
/// $$renderer.async([$$promises[N]…], ($$renderer) => <push>) // when blockers
/// ```
///
/// `expr` is the already-visited (read-wrapped) interpolation expression;
/// `has_await` marks whether the read itself contains an `await` (true → the
/// inner `b.thunk` becomes `async () => …`). For the top-level-await fixtures
/// the await lives in the instance thunk, so `has_await` is false and the
/// blockers (from the instance `$$promises`) drive the `$$renderer.async(...)`
/// wrap. With no blockers and no await the bare inner push is returned (so a
/// non-async expression tag is untouched).
pub fn build_async_expression_push<'a>(
    state: &ServerTransformState<'a>,
    expr: OxcExpression<'a>,
    blocker_indices: &[usize],
    has_await: bool,
) -> Statement<'a> {
    let b = state.b;
    let escaped = b.call("$.escape", vec![expr]);
    let thunk = b.thunk(escaped, has_await);
    let mut call = b.call("$$renderer.push", vec![thunk]);
    if !blocker_indices.is_empty() {
        let blockers = blockers_array(state, blocker_indices);
        let params = b.params(vec![b.id_pat("$$renderer")], None);
        let arrow = b.arrow_expr(params, call, false);
        call = b.call("$$renderer.async", vec![blockers, arrow]);
    }
    b.stmt(call)
}

/// Like [`build_async_expression_push`], but the blockers are arbitrary
/// EXPRESSION strings (`promises[N]`) rather than `$$promises[N]` indices — the
/// async `{@const}` reader wrap (`$$renderer.async([promises[1]], …)`). Each
/// blocker source is reparsed into an oxc expression. With an empty list the
/// bare inner push is returned.
pub fn build_async_expression_push_exprs<'a>(
    state: &ServerTransformState<'a>,
    expr: OxcExpression<'a>,
    blocker_exprs: &[String],
    has_await: bool,
) -> Statement<'a> {
    let b = state.b;
    let escaped = b.call("$.escape", vec![expr]);
    let thunk = b.thunk(escaped, has_await);
    let mut call = b.call("$$renderer.push", vec![thunk]);
    if !blocker_exprs.is_empty() {
        let elems: Vec<Option<OxcExpression<'a>>> = blocker_exprs
            .iter()
            .map(|src| {
                Some(
                    state
                        .reparse_slice_owned(src)
                        .unwrap_or_else(|| b.id("undefined")),
                )
            })
            .collect();
        let blockers = b.array(elems);
        let params = b.params(vec![b.id_pat("$$renderer")], None);
        let arrow = b.arrow_expr(params, call, false);
        call = b.call("$$renderer.async", vec![blockers, arrow]);
    }
    b.stmt(call)
}

/// Rust port of upstream `shared/utils.js::PromiseOptimiser` — the per-element /
/// per-component async-attribute/prop optimiser. Each attribute / prop / spread
/// value expression is routed through [`PromiseOptimiser::transform`]; when it
/// carries an inline `await` it is hoisted into a `const $$N = …;` binding and
/// replaced inline by the bare `$$N` identifier, so multiple async values share
/// ONE `Promise.all` wait and ONE child wrapper.
///
/// Blockers (top-level `$$promises[N]` references — only populated under
/// `experimental.async`) are accumulated via [`PromiseOptimiser::check_blockers`]
/// so an element/component that reads a blocked binding wraps in
/// `$$renderer.async([$$promises[N]…], …)` even without an inline await.
///
/// At emit time, [`PromiseOptimiser::render`] (elements →
/// `$$renderer.child`/`async`) or [`PromiseOptimiser::render_block`] (components →
/// `$$renderer.child_block`/`async_block`) prepends the `#apply()` declaration and
/// wraps the statements. A non-async optimiser (`is_async() == false`) returns the
/// input statements unchanged, so sync output is untouched.
#[derive(Default)]
pub struct PromiseOptimiser<'a> {
    /// The hoisted async expressions (already `$.save`-wrapped), in order. Their
    /// index is the `$$N` placeholder suffix.
    expressions: Vec<OxcExpression<'a>>,
    /// Whether ANY transformed value carried an inline await.
    has_await: bool,
    /// Insertion-ordered, de-duplicated top-level blocker indices.
    blockers: Vec<usize>,
}

impl<'a> PromiseOptimiser<'a> {
    pub fn new() -> Self {
        Self::default()
    }

    /// 写经 `transform(expression, metadata)`: record the expression's blockers,
    /// and — if `has_await` — hoist `expression` into a `$$N` slot, returning the
    /// bare `$$N` placeholder identifier. Otherwise the expression is returned
    /// verbatim. `expr_text` is the SOURCE of the value (used for the await /
    /// blocker predicates); `expression` is the already-visited (`$.save`-wrapped)
    /// oxc expression to hoist.
    pub fn transform(
        &mut self,
        state: &ServerTransformState<'a>,
        expr_text: &str,
        expression: OxcExpression<'a>,
    ) -> OxcExpression<'a> {
        self.check_blockers(state, expr_text);
        if text_has_await(expr_text) {
            self.has_await = true;
            let idx = self.expressions.len();
            self.expressions.push(expression);
            return state.b.id(&format!("$${idx}"));
        }
        expression
    }

    /// 写经 `check_blockers(metadata)`: union the top-level-await blocker indices
    /// referenced by `expr_text` into the blocker set (insertion-ordered).
    pub fn check_blockers(&mut self, state: &ServerTransformState<'a>, expr_text: &str) {
        for idx in expr_text_blockers(state, expr_text) {
            if !self.blockers.contains(&idx) {
                self.blockers.push(idx);
            }
        }
    }

    /// 写经 `is_async()`: any hoisted expression OR any blocker.
    pub fn is_async(&self) -> bool {
        !self.expressions.is_empty() || !self.blockers.is_empty()
    }

    /// 写经 `#apply()`: build the `const` declaration that resolves the hoisted
    /// promises. `None` when there are no hoisted expressions (a blocker-only
    /// optimiser emits no declaration). Single → `const $$0 = <expr>;`. Multiple →
    /// `const [$$0, …] = (await $.save(Promise.all([thunk0, …])))();`.
    fn apply(&mut self, state: &ServerTransformState<'a>) -> Option<Statement<'a>> {
        let b = state.b;
        if self.expressions.is_empty() {
            return None;
        }
        let exprs = std::mem::take(&mut self.expressions);
        if exprs.len() == 1 {
            let only = exprs.into_iter().next().unwrap();
            return Some(b.const_id("$$0", only));
        }
        // Multiple: `const [$$0, …] = (await $.save(Promise.all([...])))();`.
        let n = exprs.len();
        let elems: Vec<Option<OxcExpression<'a>>> = exprs.into_iter().map(Some).collect();
        let array = b.array(elems);
        let promise_all = b.call("Promise.all", vec![array]);
        // save(Promise.all(...)) = `(await $.save(Promise.all(...)))()`.
        let saved = b.call("$.save", vec![promise_all]);
        let awaited = b.await_expr(saved);
        let resolved = b.call(awaited, vec![]);
        // Build the `[$$0, …]` destructuring pattern via an array expression.
        let pat_elems: Vec<Option<OxcExpression<'a>>> =
            (0..n).map(|i| Some(b.id(&format!("$${i}")))).collect();
        let pat = b.expr_to_pattern(b.array(pat_elems), "undefined");
        Some(b.const_decl(pat, Some(resolved)))
    }

    /// 写经 `render(statements)` — the ELEMENT wrapper: `$$renderer.child(async …)`
    /// (inline await) / `$$renderer.async([$$promises[N]…], …)` (blockers). Sync
    /// (no await, no blockers) returns the statements unchanged.
    pub fn render(
        &mut self,
        state: &ServerTransformState<'a>,
        mut statements: Vec<Statement<'a>>,
    ) -> Vec<Statement<'a>> {
        if !self.is_async() {
            return statements;
        }
        if let Some(decl) = self.apply(state) {
            statements.insert(0, decl);
        }
        let b = state.b;
        let params = b.params(vec![b.id_pat("$$renderer")], None);
        let arrow = b.arrow(params, b.body(statements), false, self.has_await);
        if !self.blockers.is_empty() {
            let blockers = blockers_array(state, &self.blockers);
            vec![b.stmt(b.call("$$renderer.async", vec![blockers, arrow]))]
        } else {
            vec![b.stmt(b.call("$$renderer.child", vec![arrow]))]
        }
    }

    /// 写经 `render_block(statements)` — the COMPONENT/BLOCK wrapper:
    /// `$$renderer.child_block(async …)` / `$$renderer.async_block([…], …)` via
    /// `create_child_block`. Sync returns the statements unchanged.
    pub fn render_block(
        &mut self,
        state: &ServerTransformState<'a>,
        mut statements: Vec<Statement<'a>>,
    ) -> Vec<Statement<'a>> {
        if !self.is_async() {
            return statements;
        }
        if let Some(decl) = self.apply(state) {
            statements.insert(0, decl);
        }
        create_child_block(state, statements, &self.blockers, self.has_await)
    }
}

/// Compute 1-based line number and 0-based column for a byte offset in source.
/// (Relocated from the deleted text `server/visitors/element.rs` — used by the
/// dev-mode `$.push_element($$renderer, '<name>', <line>, <col>)` instrumentation.)
pub(crate) fn locate_in_source(source: &str, offset: usize) -> (usize, usize) {
    let offset = offset.min(source.len());
    let mut line = 1usize;
    let mut col = 0usize;
    for (i, ch) in source.char_indices() {
        if i >= offset {
            break;
        }
        if ch == '\n' {
            line += 1;
            col = 0;
        } else {
            col += 1;
        }
    }
    (line, col)
}

/// Accumulator state for [`infer_namespace_from_nodes_owned`], mirroring the
/// `Namespace | 'keep' | 'maybe_html'` variable in upstream
/// `check_nodes_for_namespace()`.
#[derive(Clone, Copy, PartialEq, Eq)]
enum NsScan {
    Keep,
    MaybeHtml,
    Html,
    Svg,
    Mathml,
}

/// Infer a fragment's namespace from its children (owned-slice variant).
///
/// Faithful port of `infer_namespace()` / `check_nodes_for_namespace()` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`. The walk
/// descends through block containers (`{#if}` / `{#each}` / `{#await}` /
/// `{#key}` / fragments) and stops at the first element it reaches; components,
/// render tags, and nested snippets are not descended. A fragment whose elements
/// are all SVG (or all MathML) adopts that namespace, so whitespace-only text
/// between them is removable (`can_remove_entirely`). When no element is found
/// — only text / render tags / components — the fragment inherits the enclosing
/// `parent_namespace` (issue #1227: a `{#snippet}` of adjacent render/component
/// anchors inside `<svg>` must inherit `svg` so the interior whitespace is
/// trimmed, rather than defaulting to `html`).
pub(crate) fn infer_namespace_from_nodes_owned(
    nodes: &[TemplateNode],
    parent_namespace: &str,
) -> String {
    let mut ns = NsScan::Keep;
    for node in nodes {
        // The per-node "stop" only halts the walk within one top-level node;
        // upstream's outer loop keeps scanning siblings until it resolves `html`.
        ns_scan_node(node, &mut ns);
        if ns == NsScan::Html {
            break;
        }
    }
    match ns {
        NsScan::Html => "html".to_string(),
        NsScan::Svg => "svg".to_string(),
        NsScan::Mathml => "mathml".to_string(),
        NsScan::Keep | NsScan::MaybeHtml => parent_namespace.to_string(),
    }
}

/// Apply upstream's element-namespace rule. Returns `true` to stop the walk
/// (upstream's `stop()`): the first element reached decides the namespace.
fn ns_apply_element(svg: bool, mathml: bool, ns: &mut NsScan) -> bool {
    if !svg && !mathml {
        *ns = NsScan::Html;
    } else if *ns == NsScan::Keep {
        *ns = if svg { NsScan::Svg } else { NsScan::Mathml };
    }
    true
}

/// Recursive walk mirroring upstream `check_nodes_for_namespace()`. Returns
/// `true` when the walk should stop (an element was found).
fn ns_scan_node(node: &TemplateNode, ns: &mut NsScan) -> bool {
    match node {
        TemplateNode::RegularElement(e) => ns_apply_element(e.metadata.svg, e.metadata.mathml, ns),
        TemplateNode::SvelteElement(e) => ns_apply_element(e.metadata.svg, e.metadata.mathml, ns),
        TemplateNode::Text(t) => {
            if !t.data.trim().is_empty() {
                *ns = NsScan::MaybeHtml;
            }
            false
        }
        TemplateNode::IfBlock(b) => {
            ns_scan_nodes(&b.consequent.nodes, ns)
                || b.alternate
                    .as_ref()
                    .is_some_and(|f| ns_scan_nodes(&f.nodes, ns))
        }
        TemplateNode::EachBlock(b) => {
            ns_scan_nodes(&b.body.nodes, ns)
                || b.fallback
                    .as_ref()
                    .is_some_and(|f| ns_scan_nodes(&f.nodes, ns))
        }
        TemplateNode::AwaitBlock(b) => {
            b.pending
                .as_ref()
                .is_some_and(|f| ns_scan_nodes(&f.nodes, ns))
                || b.then.as_ref().is_some_and(|f| ns_scan_nodes(&f.nodes, ns))
                || b.catch
                    .as_ref()
                    .is_some_and(|f| ns_scan_nodes(&f.nodes, ns))
        }
        TemplateNode::KeyBlock(b) => ns_scan_nodes(&b.fragment.nodes, ns),
        _ => false,
    }
}

/// Walk a node list, stopping early when a child requests a stop.
fn ns_scan_nodes(nodes: &[TemplateNode], ns: &mut NsScan) -> bool {
    for node in nodes {
        if ns_scan_node(node, ns) {
            return true;
        }
    }
    false
}
