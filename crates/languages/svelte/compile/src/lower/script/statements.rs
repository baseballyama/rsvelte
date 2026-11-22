//! The statements upstream removes outside development or on the server.

use oxc_allocator::Vec as ArenaVec;
use oxc_ast::ast::{Declaration, Statement, VariableDeclarator};
use oxc_ast_visit::VisitMut;
use oxc_span::Span;
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

/// Upstream server `ExpressionStatement`: an effect or `$inspect.trace(…)` statement renders
/// nothing, and its comments go with it.
pub(super) fn removed_on_server(res: &Resolution, statement: &Statement<'_>) -> bool {
    matches!(statement, Statement::ExpressionStatement(s)
        if res.rune(&s.expression).is_some_and(|(r, _)| matches!(r, "$effect" | "$effect.pre" | "$effect.root" | "$inspect.trace")))
}

/// Whether `comment` is outside every statement of `removed`, which are apart and in source order:
/// upstream drops the comments inside a statement the server removes.
pub(in crate::lower) fn outside(removed: &[Span], comment: Span) -> bool {
    let candidate = removed.partition_point(|statement| statement.end < comment.end);
    removed
        .get(candidate)
        .is_none_or(|statement| comment.start < statement.start || comment.end > statement.end)
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

/// A declarator of `$inspect(…).with(…)`, which upstream's client does not declare outside
/// development.
pub(super) fn inspects_with(res: &Resolution, d: &VariableDeclarator<'_>) -> bool {
    (d.init.as_ref())
        .is_some_and(|init| res.rune(init).is_some_and(|(r, _)| r == "$inspect().with"))
}

/// A declaration left with no declarator, which upstream replaces with nothing.
pub(super) fn declares_nothing(statement: &Statement<'_>) -> bool {
    match statement {
        Statement::VariableDeclaration(d) => d.declarations.is_empty(),
        Statement::ExportDeclaration(export) => {
            matches!(&export.declaration, Declaration::VariableDeclaration(d) if d.declarations.is_empty())
        }
        _ => false,
    }
}
