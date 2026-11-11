//! The statements upstream removes outside development or on the server.

use oxc_allocator::Vec as ArenaVec;
use oxc_ast::ast::Statement;
use oxc_ast_visit::VisitMut;
use rsvelte_svelte_semantic::resolve::Resolution;

use super::ScriptRewrite;

impl<'o> ScriptRewrite<'_, 'o> {
    /// A statement list, rewritten; `drop_empty` as esrap prints a block or program body.
    pub(super) fn statement_list(
        &mut self,
        list: &mut ArenaVec<'o, Statement<'o>>,
        drop_empty: bool,
    ) {
        let b = self.b;
        let mut out = ArenaVec::with_capacity_in(list.len(), b);
        for mut statement in list.drain(..) {
            if inspect(self.res, &statement) == Some(Inspect::Value) {
                let span = oxc_span::GetSpan::span(&statement);
                out.push(Statement::new_empty_statement(span, b));
                out.push(Statement::new_empty_statement(span, b));
                continue;
            }
            self.visit_statement(&mut statement);
            if !drop_empty || !matches!(statement, Statement::EmptyStatement(_)) {
                out.push(statement);
            }
        }
        *list = out;
    }
}

/// Upstream server `ExpressionStatement`: an effect statement renders nothing.
pub(super) fn is_effect(res: &Resolution, statement: &Statement<'_>) -> bool {
    matches!(statement, Statement::ExpressionStatement(s)
        if res.rune(&s.expression).is_some_and(|(r, _)| matches!(r, "$effect" | "$effect.pre" | "$effect.root")))
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum Inspect {
    /// `$inspect(…)` or `$inspect(…).with(…)`, whose call upstream replaces with an empty
    /// statement, so the statement prints as `;;`.
    Value,
    /// `$inspect.trace(…)`, whose statement upstream replaces with an empty one.
    Trace,
}

/// An `$inspect` statement, which only a development build keeps.
pub(super) fn inspect(res: &Resolution, statement: &Statement<'_>) -> Option<Inspect> {
    let Statement::ExpressionStatement(s) = statement else {
        return None;
    };
    match res.rune(&s.expression)?.0 {
        "$inspect" | "$inspect().with" => Some(Inspect::Value),
        "$inspect.trace" => Some(Inspect::Trace),
        _ => None,
    }
}
