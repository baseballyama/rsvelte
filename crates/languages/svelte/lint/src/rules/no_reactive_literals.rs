use oxc_ast::ast::{AssignmentTarget, Expression, Statement};
use oxc_syntax::operator::AssignmentOperator;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::nodes::span;
use super::reactive_statements::reactive_statements;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-reactive-literals",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoReactiveLiterals))
}

#[derive(Debug)]
struct NoReactiveLiterals;

impl SvelteRule for NoReactiveLiterals {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        for (statement, body) in reactive_statements(component, file.source()) {
            let Statement::ExpressionStatement(expression) = body else {
                continue;
            };
            let Expression::AssignmentExpression(assignment) = &expression.expression else {
                continue;
            };
            // ESTree's `Literal`, `[]` and `{}`.
            let literal = match &assignment.right {
                Expression::StringLiteral(_)
                | Expression::NumericLiteral(_)
                | Expression::BooleanLiteral(_)
                | Expression::NullLiteral(_)
                | Expression::RegExpLiteral(_)
                | Expression::BigIntLiteral(_) => true,
                Expression::ArrayExpression(array) => array.elements.is_empty(),
                Expression::ObjectExpression(object) => object.properties.is_empty(),
                _ => false,
            };
            if !literal {
                continue;
            }
            let statement = span(statement);
            let mut report = Report::range(
                "Do not assign literal values inside reactive statements unless absolutely \
                 necessary.",
                statement,
            )
            .message_id("noReactiveLiterals");
            // Upstream also suggests `let a += 1` and `let obj.x = 1`, which do not parse.
            if assignment.operator == AssignmentOperator::Assign
                && matches!(
                    assignment.left,
                    AssignmentTarget::AssignmentTargetIdentifier(_)
                )
            {
                report = report.suggest(Suggestion {
                    message_id: Some("fixReactiveLiteral".into()),
                    message: "Move the literal out of the reactive statement into an assignment"
                        .to_owned(),
                    fix: Fix::replace(
                        statement,
                        format!("let {}", span(&**assignment).text(file.source())),
                    ),
                });
            }
            reporter.report(report);
        }
    }
}
