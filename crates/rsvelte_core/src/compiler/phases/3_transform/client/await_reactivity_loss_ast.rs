//! Dev-mode `await X` → `(await $.track_reactivity_loss(X))()` instrumentation,
//! shared by every script kind that reaches it through a batched source rewrite:
//! the legacy instance tail (`instance_dev_tail_ast`) and the module tail
//! (`module_dev_tail_ast`, covering `<script module>` and `.svelte.(js|ts)`).
//!
//! Upstream has a single `visitors/AwaitExpression.js` in the client visitor map
//! that every one of those scripts walks, so the rewrite itself is one piece of
//! logic here too; only the batch it rides in differs per script kind.

use oxc_ast::AstKind;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_span::GetSpan;

use super::ast_rewrite::Edit;

/// Cheap byte probe: `await` is a keyword, so a script without those bytes
/// cannot hold an `AwaitExpression`.
pub(super) fn source_has_await(source: &str) -> bool {
    memchr::memmem::find(source.as_bytes(), b"await").is_some()
}

/// The dev wrapper upstream builds in `visitors/AwaitExpression.js`.
fn track_reactivity_loss_wrap(argument_text: &str) -> String {
    format!("(await $.track_reactivity_loss({argument_text}))()")
}

/// Whether `stmt`'s last token is an expression, so that a following line
/// opening with `(` continues it instead of starting a statement of its own.
/// A source `await` can never continue a line, but the wrapper this pass builds
/// can, so every such boundary has to be restored.
fn ends_in_open_expression(stmt: &Statement<'_>, source: &str) -> bool {
    let unterminated = |span: oxc_span::Span| {
        !source[span.start as usize..span.end as usize]
            .trim_end()
            .ends_with(';')
    };
    match stmt {
        Statement::ExpressionStatement(stmt) => unterminated(stmt.span),
        Statement::VariableDeclaration(decl) => unterminated(decl.span),
        Statement::ReturnStatement(stmt) => unterminated(stmt.span),
        Statement::ThrowStatement(stmt) => unterminated(stmt.span),
        Statement::IfStatement(stmt) => {
            ends_in_open_expression(stmt.alternate.as_ref().unwrap_or(&stmt.consequent), source)
        }
        Statement::ForStatement(stmt) => ends_in_open_expression(&stmt.body, source),
        Statement::ForInStatement(stmt) => ends_in_open_expression(&stmt.body, source),
        Statement::ForOfStatement(stmt) => ends_in_open_expression(&stmt.body, source),
        Statement::WhileStatement(stmt) => ends_in_open_expression(&stmt.body, source),
        Statement::LabeledStatement(stmt) => ends_in_open_expression(&stmt.body, source),
        _ => false,
    }
}

/// The end offset of the statement a wrapped `await` statement has to be
/// separated from, keyed by that statement's start. Only a statement that
/// *begins* with the `await` grows a leading `(`, and only a predecessor left
/// open by ASI can absorb it.
pub(super) fn separator_positions(
    stmts: &oxc_allocator::Vec<'_, Statement<'_>>,
    source: &str,
) -> Vec<(u32, u32)> {
    stmts
        .windows(2)
        .filter_map(|pair| {
            let Statement::ExpressionStatement(next) = &pair[1] else {
                return None;
            };
            ends_in_open_expression(&pair[0], source).then(|| (next.span.start, pair[0].span().end))
        })
        .collect()
}

/// The wrapper keeps an `await` of its own, so the fixed-point loop would wrap
/// it again on the next iteration; recognising the marker is what makes this
/// pass idempotent.
fn is_track_reactivity_loss_call(expr: &Expression<'_>) -> bool {
    let Expression::CallExpression(call) = expr.without_parentheses() else {
        return false;
    };
    let Expression::StaticMemberExpression(member) = &call.callee else {
        return false;
    };
    member.property.name == "track_reactivity_loss"
        && matches!(&member.object, Expression::Identifier(id) if id.name == "$")
}

/// The `await (async ($$value) => { … })(…)` an async destructuring assignment
/// is lowered to. Upstream destructures after a single instrumented `await`, so
/// this call — which rsvelte generates *after* the source `await` was already
/// wrapped — has no counterpart to instrument.
pub(super) fn is_destructuring_iife_call(expr: &Expression<'_>) -> bool {
    let Expression::CallExpression(call) = expr.without_parentheses() else {
        return false;
    };
    let Expression::ArrowFunctionExpression(arrow) = call.callee.without_parentheses() else {
        return false;
    };
    arrow.r#async
        && matches!(
            arrow.params.items.first().map(|param| &param.pattern),
            Some(BindingPattern::BindingIdentifier(id)) if id.name == "$$value"
        )
}

/// Source spans whose whole subtree carries a `svelte-ignore
/// await_reactivity_loss`, mirroring upstream's analysis-phase ignore stack:
/// a leading comment binds to the outermost node starting after it, and every
/// descendant of that node inherits the ignore — so one interval per annotated
/// node is all the stack ever expresses.
#[derive(Default)]
pub(super) struct AwaitIgnoreRanges(Vec<(u32, u32)>);

impl AwaitIgnoreRanges {
    pub(super) fn contains(&self, offset: u32) -> bool {
        self.0
            .iter()
            .any(|&(start, end)| offset >= start && offset < end)
    }
}

pub(super) fn collect_await_ignore_ranges(
    program: &Program<'_>,
    source: &str,
    is_runes: bool,
) -> AwaitIgnoreRanges {
    let mut scan = IgnoreScan {
        comments: &program.comments,
        cursor: 0,
        source,
        is_runes,
        ranges: Vec::new(),
    };
    scan.visit_program(program);
    AwaitIgnoreRanges(scan.ranges)
}

struct IgnoreScan<'src, 'c> {
    comments: &'c [Comment],
    cursor: usize,
    source: &'src str,
    is_runes: bool,
    ranges: Vec<(u32, u32)>,
}

impl<'a> Visit<'a> for IgnoreScan<'_, '_> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        let span = kind.span();
        let mut ignored = false;
        // Pre-order arrival makes every still-unconsumed comment before this
        // node's start one of its leading comments, as upstream's acorn
        // attachment pass computes them.
        while let Some(comment) = self.comments.get(self.cursor) {
            if comment.span.start >= span.start {
                break;
            }
            self.cursor += 1;
            let content = comment.content_span();
            let text = &self.source[content.start as usize..content.end as usize];
            if crate::compiler::phases::phase2_analyze::utils::extract_svelte_ignore(
                text,
                self.is_runes,
            )
            .iter()
            .any(|code| code == "await_reactivity_loss")
            {
                ignored = true;
            }
        }
        if ignored {
            self.ranges.push((span.start, span.end));
        }
    }
}

/// Collect the `await X` → `(await $.track_reactivity_loss(X))()` edits from a
/// single parse. Nested awaits settle across fixed-point iterations: the outer
/// edit's span strictly contains the inner one, so the innermost-first splice
/// defers it and the next iteration re-collects it over the rewritten argument.
pub(super) fn collect_await_reactivity_loss_edits(
    program: &Program<'_>,
    source: &str,
    is_runes: bool,
) -> Vec<Edit> {
    let mut collector = AwaitCollector {
        source,
        ignored: collect_await_ignore_ranges(program, source, is_runes),
        separators: rustc_hash::FxHashMap::default(),
        edits: Vec::new(),
    };
    collector.visit_program(program);
    collector.edits
}

struct AwaitCollector<'src> {
    source: &'src str,
    ignored: AwaitIgnoreRanges,
    /// Statement start → end of the statement a `;` has to separate it from.
    separators: rustc_hash::FxHashMap<u32, u32>,
    edits: Vec<Edit>,
}

impl<'a, 'src> Visit<'a> for AwaitCollector<'src> {
    fn visit_statements(&mut self, stmts: &oxc_allocator::Vec<'a, Statement<'a>>) {
        self.separators
            .extend(separator_positions(stmts, self.source));
        walk::walk_statements(self, stmts);
    }

    fn visit_await_expression(&mut self, expr: &AwaitExpression<'a>) {
        walk::walk_await_expression(self, expr);

        if is_track_reactivity_loss_call(&expr.argument)
            || is_destructuring_iife_call(&expr.argument)
            || self.ignored.contains(expr.span.start)
        {
            return;
        }

        let arg_span = expr.argument.span();
        let arg_text = self.source[arg_span.start as usize..arg_span.end as usize].trim();
        let wrap = track_reactivity_loss_wrap(arg_text);
        // The `;` rides inside this edit rather than as an insertion of its own,
        // which `splice`'s innermost-only filter would read as nested.
        let (start, replacement) = match self.separators.get(&expr.span.start) {
            Some(&prev_end) => (
                prev_end,
                format!(
                    ";{}{wrap}",
                    &self.source[prev_end as usize..expr.span.start as usize]
                ),
            ),
            None => (expr.span.start, wrap),
        };
        self.edits.push((start, expr.span.end, replacement));
    }
}
