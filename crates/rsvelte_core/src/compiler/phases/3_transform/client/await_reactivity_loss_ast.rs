//! Dev-mode `await X` → `(await $.track_reactivity_loss(X))()` instrumentation,
//! shared by every script kind that reaches it through a batched source rewrite:
//! the legacy instance tail (`instance_dev_tail_ast`) and the module tail
//! (`module_dev_tail_ast`, covering `<script module>` and `.svelte.(js|ts)`).
//!
//! Upstream has a single `visitors/AwaitExpression.js` in the client visitor map
//! that every one of those scripts walks, so the rewrite itself is one piece of
//! logic here too; only the batch it rides in differs per script kind.

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

/// True when the statement enclosing `offset` is preceded by a `svelte-ignore`
/// comment naming `await_reactivity_loss`. Upstream reads this off the
/// analysis-phase ignore stack; these passes rewrite source spans, so they read
/// the same comment back out of the script text.
pub(super) fn await_reactivity_loss_ignored(source: &str, offset: u32, is_runes: bool) -> bool {
    // Start from the top of the await's own line: the statement text to its
    // left is not a comment and would end the scan immediately.
    let offset = source[..offset as usize].rfind('\n').map_or(0, |nl| nl + 1);
    let before = &source[..offset];
    for line in before.lines().rev() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        let Some(comment) = line
            .strip_prefix("//")
            .or_else(|| line.strip_prefix("/*").map(|c| c.trim_end_matches("*/")))
        else {
            // The first non-comment line above is the start of the
            // statement itself; anything earlier cannot annotate it.
            return false;
        };
        // A run of comments can carry several `svelte-ignore` lines, so keep
        // looking when this one names other codes.
        if crate::compiler::phases::phase2_analyze::utils::extract_svelte_ignore(comment, is_runes)
            .iter()
            .any(|c| c == "await_reactivity_loss")
        {
            return true;
        }
    }
    false
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
        is_runes,
        edits: Vec::new(),
    };
    collector.visit_program(program);
    collector.edits
}

struct AwaitCollector<'src> {
    source: &'src str,
    is_runes: bool,
    edits: Vec<Edit>,
}

impl<'a, 'src> Visit<'a> for AwaitCollector<'src> {
    fn visit_await_expression(&mut self, expr: &AwaitExpression<'a>) {
        walk::walk_await_expression(self, expr);

        if is_track_reactivity_loss_call(&expr.argument)
            || await_reactivity_loss_ignored(self.source, expr.span.start, self.is_runes)
        {
            return;
        }

        let arg_span = expr.argument.span();
        let arg_text = self.source[arg_span.start as usize..arg_span.end as usize].trim();
        self.edits.push((
            expr.span.start,
            expr.span.end,
            track_reactivity_loss_wrap(arg_text),
        ));
    }
}
