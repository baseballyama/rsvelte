use oxc_ast::ast::{Expression, Statement};
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::TokenType;

use super::shared::nodes::span;
use super::shared::reactive_statements::{between, reactive_statements};
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-reactive-functions",
    files: Files::Components,
    configure: without_options::<NoReactiveFunctions>,
};

#[derive(Debug, Default)]
struct NoReactiveFunctions;

impl SvelteRule for NoReactiveFunctions {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let tokens = &component.tokens;
        for (statement, body) in reactive_statements(file, component) {
            let Statement::ExpressionStatement(expression) = body else {
                continue;
            };
            let Expression::AssignmentExpression(assignment) = &expression.expression else {
                continue;
            };
            if !matches!(
                assignment.right,
                Expression::FunctionExpression(_) | Expression::ArrowFunctionExpression(_)
            ) {
                continue;
            }
            let span = span(statement);
            let mut report = Report::range(
                "Do not create functions inside reactive statements unless absolutely necessary.",
                span,
            );
            // `$`, `:` and the token after them.
            let label = tokens.after(span.start_offset).map(|t| tokens.get(t).span);
            let colon = label
                .and_then(|l| tokens.after(l.end_offset))
                .map(|t| tokens.get(t).span);
            let next = colon
                .and_then(|c| tokens.after(c.end_offset))
                .map(|t| tokens.get(t).span);
            if let (Some(label), Some(colon), Some(next)) = (label, colon, next) {
                let spaced = between(tokens, colon.end_offset, next.start_offset)
                    .any(|token| token.kind == TokenType::Whitespace);
                report = report.suggest(Suggestion {
                    message: "Move the function out of the reactive statement".to_owned(),
                    fix: Fix::replace(
                        Span::new(label.start_offset, colon.end_offset),
                        if spaced { "const" } else { "const " },
                    ),
                });
            }
            reporter.report(report);
        }
    }
}
