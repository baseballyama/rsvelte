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

/// The start offset of a whole-statement `await` that a following statement
/// would be folded into once the wrapper's trailing `)()` makes the line
/// continuable. Restricted to statements with a successor because the same
/// visitor also runs over expression fragments parsed as one-statement
/// programs, where a `;` would land in expression position.
pub(super) fn unterminated_await_statement(stmt: &Statement<'_>, source: &str) -> Option<u32> {
    let Statement::ExpressionStatement(stmt) = stmt else {
        return None;
    };
    let Expression::AwaitExpression(_) = &stmt.expression else {
        return None;
    };
    let text = &source[stmt.span.start as usize..stmt.span.end as usize];
    (!text.ends_with(';')).then(|| stmt.expression.span().start)
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
        unterminated: rustc_hash::FxHashSet::default(),
        edits: Vec::new(),
    };
    collector.visit_program(program);
    collector.edits
}

struct AwaitCollector<'src> {
    source: &'src str,
    ignored: AwaitIgnoreRanges,
    /// Starts of `await` expressions that are a whole statement relying on ASI.
    unterminated: rustc_hash::FxHashSet<u32>,
    edits: Vec<Edit>,
}

impl<'a, 'src> Visit<'a> for AwaitCollector<'src> {
    fn visit_statements(&mut self, stmts: &oxc_allocator::Vec<'a, Statement<'a>>) {
        for pair in stmts.windows(2) {
            if let Some(start) = unterminated_await_statement(&pair[0], self.source) {
                self.unterminated.insert(start);
            }
        }
        walk::walk_statements(self, stmts);
    }

    fn visit_await_expression(&mut self, expr: &AwaitExpression<'a>) {
        walk::walk_await_expression(self, expr);

        if is_track_reactivity_loss_call(&expr.argument) || self.ignored.contains(expr.span.start) {
            return;
        }

        let arg_span = expr.argument.span();
        let arg_text = self.source[arg_span.start as usize..arg_span.end as usize].trim();
        let mut replacement = track_reactivity_loss_wrap(arg_text);
        if self.unterminated.contains(&expr.span.start) {
            replacement.push(';');
        }
        self.edits
            .push((expr.span.start, expr.span.end, replacement));
    }
}
