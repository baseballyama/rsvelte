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

/// The dev wrapper upstream builds in `visitors/ForOfStatement.js`.
pub(super) fn for_await_track_reactivity_loss_wrap(iterable_text: &str) -> String {
    format!("$.for_await_track_reactivity_loss({iterable_text})")
}

/// Whether upstream's `ForOfStatement` visitor would wrap this loop's iterable.
pub(super) fn is_for_await_instrumentable(
    stmt: &ForOfStatement<'_>,
    experimental_async: bool,
    ignored: bool,
) -> bool {
    stmt.r#await
        && experimental_async
        && !ignored
        && !is_for_await_track_reactivity_loss_call(&stmt.right)
}

/// Whether `expr` is an `await` this pass will itself rewrite in full.
fn awaits_over_the_whole_span(expr: &Expression<'_>, ignore: &AwaitIgnoreRanges) -> bool {
    let Expression::AwaitExpression(expr) = expr else {
        return false;
    };
    !is_track_reactivity_loss_call(&expr.argument)
        && !is_destructuring_iife_call(&expr.argument)
        && !ignore.contains(expr.span.start)
}

fn for_await_edit(
    stmt: &ForOfStatement<'_>,
    source: &str,
    experimental_async: bool,
    ignore: &AwaitIgnoreRanges,
) -> Option<Edit> {
    if !is_for_await_instrumentable(stmt, experimental_async, ignore.contains(stmt.span.start)) {
        return None;
    }
    // A bare awaited iterable produces an `await` edit over the very same span,
    // which the splice's strict-containment check cannot order; let that one
    // land and re-collect this loop over the settled expression.
    if awaits_over_the_whole_span(&stmt.right, ignore) {
        return None;
    }
    let span = stmt.right.span();
    let text = source[span.start as usize..span.end as usize].trim();
    Some((
        span.start,
        span.end,
        for_await_track_reactivity_loss_wrap(text),
    ))
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
    is_internal_call(expr, "track_reactivity_loss")
}

fn is_async_derived_call(expr: &Expression<'_>) -> bool {
    is_internal_call(expr, "async_derived")
}

/// `$inspect.trace()`'s wrapper. Upstream's `BlockStatement` visitor builds
/// `b.await(call)` *after* visiting the body, so the `await` it synthesizes
/// never reaches the `AwaitExpression` visitor.
fn is_trace_call(expr: &Expression<'_>) -> bool {
    is_internal_call(expr, "trace")
}

pub(super) fn is_save_call(expr: &Expression<'_>) -> bool {
    is_internal_call(expr, "save")
}

/// The `for await` wrapper is likewise re-collected by the fixed-point loop.
pub(super) fn is_for_await_track_reactivity_loss_call(expr: &Expression<'_>) -> bool {
    is_internal_call(expr, "for_await_track_reactivity_loss")
}

fn is_internal_call(expr: &Expression<'_>, name: &str) -> bool {
    let Expression::CallExpression(call) = expr.without_parentheses() else {
        return false;
    };
    let Expression::StaticMemberExpression(member) = &call.callee else {
        return false;
    };
    member.property.name == name
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
    experimental_async: bool,
) -> Vec<Edit> {
    let mut collector = AwaitCollector {
        source,
        runs: AwaitCommentRuns::collect(program),
        ignored: collect_await_ignore_ranges(program, source, is_runes),
        separators: rustc_hash::FxHashMap::default(),
        experimental_async,
        edits: Vec::new(),
    };
    collector.visit_program(program);
    collector.edits
}

/// Where the comments in front of an `await` keyword end up once the wrapper
/// replaces it.
///
/// Upstream rebuilds the expression from position-less nodes and keeps only the
/// argument's original span, so esrap — which flushes a pending comment at the
/// first *located* node it reaches that starts after it — cannot flush the run
/// before the wrapper and defers it to the argument. Two of esrap's other flush
/// points still catch a run first: an enclosing node that starts on the `await`
/// keyword itself, and the same-line trailing flush after a list element.
#[derive(Default)]
pub(super) struct AwaitCommentRuns {
    /// `(start, end, is_line)` per comment, in source order.
    comments: Vec<(u32, u32, bool)>,
    /// Offsets where a node other than an `await` begins. A node starting on an
    /// `await` keyword can only be one of that `await`'s ancestors, because
    /// spans sharing a start nest and no child of an `await` reaches its `a`.
    enclosing_starts: rustc_hash::FxHashSet<u32>,
}

impl AwaitCommentRuns {
    pub(super) fn collect(program: &Program<'_>) -> Self {
        if program.comments.is_empty() {
            return Self::default();
        }
        let mut scan = StartScan {
            starts: rustc_hash::FxHashSet::default(),
        };
        scan.visit_program(program);
        Self {
            comments: program
                .comments
                .iter()
                .map(|comment| (comment.span.start, comment.span.end, comment.is_line()))
                .collect(),
            enclosing_starts: scan.starts,
        }
    }

    /// The run to move, as `(start of the run, the `(` run to re-emit ahead of
    /// the wrapper, text to re-emit before the argument)`, or `None` when it
    /// belongs outside the wrapper.
    pub(super) fn relocatable_run(
        &self,
        source: &str,
        await_start: u32,
    ) -> Option<(u32, String, String)> {
        if self.enclosing_starts.contains(&await_start) {
            return None;
        }

        let mut run_start = await_start;
        let mut first = self.comments.len();
        // Parentheses the run has to reach across. Their `)` stays in the source
        // past the edit, so each one is re-emitted ahead of the wrapper.
        let mut skipped_parens: Vec<u32> = Vec::new();
        for (index, &(start, end, _)) in self.comments.iter().enumerate().rev() {
            if end > run_start {
                continue;
            }
            let gap = &source[end as usize..run_start as usize];
            if !gap.chars().all(|c| c.is_whitespace() || c == '(') {
                break;
            }
            let parens: Vec<u32> = gap
                .char_indices()
                .filter(|&(_, c)| c == '(')
                .map(|(offset, _)| end + offset as u32)
                .collect();
            // A `(` that begins a node is a node this comment leads, so the run
            // stops there; one that begins only a parenthesis is invisible to
            // acorn and the run reaches across it.
            if parens
                .iter()
                .any(|offset| self.enclosing_starts.contains(offset))
            {
                break;
            }
            skipped_parens.extend(parens);
            run_start = start;
            first = index;
        }
        if first == self.comments.len() || flushed_as_a_trailing_comment(source, run_start) {
            return None;
        }

        let mut text = String::new();
        for (index, &(start, end, is_line)) in self.comments[first..].iter().enumerate() {
            if start >= await_start {
                break;
            }
            text.push_str(&source[start as usize..end as usize]);
            let next = self.comments[first + index + 1..]
                .first()
                .map_or(await_start, |&(next_start, ..)| next_start.min(await_start));
            // Whether the comment stood on a line of its own survives the move,
            // because the printer reproduces that break rather than the offset.
            // A line comment always breaks, or it would swallow the wrapper.
            let broken = is_line || source[end as usize..next as usize].contains('\n');
            text.push(if broken { '\n' } else { ' ' });
        }
        Some((run_start, "(".repeat(skipped_parens.len()), text))
    }
}

/// Whether the run at `run_start` sits on the same line as the end of the list
/// element it follows, separated from it only by that list's `,` — the shape
/// esrap prints as a trailing comment of the element instead.
///
/// A statement's `;` cannot reach here: it would make the `await` the first
/// token of the next statement, which the enclosing-start check already
/// rejects. Treating `;` as a separator would only misread a `for` head.
fn flushed_as_a_trailing_comment(source: &str, run_start: u32) -> bool {
    let before = source[..run_start as usize].trim_end();
    if !before.ends_with(',') {
        return false;
    }
    let previous = before[..before.len() - 1].trim_end();
    !previous.is_empty() && !source[previous.len()..run_start as usize].contains('\n')
}

struct StartScan {
    starts: rustc_hash::FxHashSet<u32>,
}

impl<'a> Visit<'a> for StartScan {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        // acorn builds no `ParenthesizedExpression`, so a `(` is not a node a
        // comment can lead upstream; only what oxc parses around it counts.
        if !matches!(
            kind,
            AstKind::AwaitExpression(_) | AstKind::ParenthesizedExpression(_)
        ) {
            self.starts.insert(kind.span().start);
        }
    }
}

struct AwaitCollector<'src> {
    source: &'src str,
    runs: AwaitCommentRuns,
    ignored: AwaitIgnoreRanges,
    /// Statement start → end of the statement a `;` has to separate it from.
    separators: rustc_hash::FxHashMap<u32, u32>,
    /// Upstream's `ForOfStatement` wrap is gated on `experimental.async`; the
    /// `AwaitExpression` one is not.
    experimental_async: bool,
    edits: Vec<Edit>,
}

impl<'a, 'src> Visit<'a> for AwaitCollector<'src> {
    fn visit_statements(&mut self, stmts: &oxc_allocator::Vec<'a, Statement<'a>>) {
        self.separators
            .extend(separator_positions(stmts, self.source));
        walk::walk_statements(self, stmts);
    }

    fn visit_for_of_statement(&mut self, stmt: &ForOfStatement<'a>) {
        walk::walk_for_of_statement(self, stmt);

        if let Some(edit) =
            for_await_edit(stmt, self.source, self.experimental_async, &self.ignored)
        {
            self.edits.push(edit);
        }
    }

    fn visit_await_expression(&mut self, expr: &AwaitExpression<'a>) {
        walk::walk_await_expression(self, expr);

        if is_track_reactivity_loss_call(&expr.argument)
            || is_async_derived_call(&expr.argument)
            || is_save_call(&expr.argument)
            || is_trace_call(&expr.argument)
            || is_destructuring_iife_call(&expr.argument)
            || self.ignored.contains(expr.span.start)
        {
            return;
        }

        // Copy the operand region the replacement covers — from just past the
        // `await` keyword to the expression's own end. Ending at the argument
        // instead would drop the trivia holding comments upstream flushes
        // inside the call, and would cut a parenthesized argument short of its
        // `)` wherever the parse does not preserve parens.
        let arg_start = expr.span.start as usize + "await".len();
        let arg_text = self.source[arg_start..expr.span.end as usize].trim();
        // The `;` rides inside this edit rather than as an insertion of its own,
        // which `splice`'s innermost-only filter would read as nested.
        let (start, replacement) = match self.separators.get(&expr.span.start) {
            Some(&prev_end) => (
                prev_end,
                format!(
                    ";{}{}",
                    &self.source[prev_end as usize..expr.span.start as usize],
                    track_reactivity_loss_wrap(arg_text)
                ),
            ),
            // A statement whose own start is the `await` is exactly the shape
            // that keeps its leading comments outside, so the two never mix.
            None => match self.runs.relocatable_run(self.source, expr.span.start) {
                Some((run_start, parens, comments)) => (
                    run_start,
                    format!(
                        "{parens}{}",
                        track_reactivity_loss_wrap(&format!("{comments}{arg_text}"))
                    ),
                ),
                None => (expr.span.start, track_reactivity_loss_wrap(arg_text)),
            },
        };
        self.edits.push((start, expr.span.end, replacement));
    }
}
