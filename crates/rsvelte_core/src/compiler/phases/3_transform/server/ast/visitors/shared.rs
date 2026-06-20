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
use crate::ast::template::{Fragment, TemplateNode};
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use crate::compiler::phases::phase3_transform::shared::template::escape_html;
use oxc_ast::ast::{Expression as OxcExpression, Statement};

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
pub fn process_children<'a>(nodes: &[TemplateNode], state: &mut ServerTransformState<'a>) {
    let mut sequence: Vec<SeqNode<'_>> = Vec::new();

    for node in nodes {
        match node {
            TemplateNode::Text(t) => sequence.push(SeqNode::Text(t.data.as_str())),
            TemplateNode::Comment(c) => sequence.push(SeqNode::Comment(c.data.as_str())),
            TemplateNode::ExpressionTag(tag) => sequence.push(SeqNode::Expr(&tag.expression)),
            other => {
                flush_sequence(&sequence, state);
                sequence.clear();
                super::visit_node(other, state);
            }
        }
    }
    flush_sequence(&sequence, state);
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
pub fn build_fragment_body<'a>(
    fragment: &Fragment,
    state: &mut ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    let saved = std::mem::take(&mut state.template);
    process_children(&fragment.nodes, state);
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
/// 写経 gap: the `clean_nodes` whitespace/hoist pass and the `is_text_first`
/// leading `<!---->` insertion are not ported here — the simple-sample block
/// bodies exercised so far don't require them.
pub fn build_fragment_block<'a>(
    fragment: &Fragment,
    state: &mut ServerTransformState<'a>,
) -> Statement<'a> {
    let body = build_fragment_body(fragment, state);
    state.b.block(body)
}
