use oxc_ast::AstKind;
use oxc_ast::ast::Expression;
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::shared::nodes::span;
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

#[cfg(test)]
mod tests;

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-ignored-unsubscribe",
    files: Files::All,
    configure: without_options::<NoIgnoredUnsubscribe>,
};

#[derive(Debug, Default)]
struct NoIgnoredUnsubscribe;

impl SvelteRule for NoIgnoredUnsubscribe {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        for node in file.nodes().iter() {
            let AstKind::ExpressionStatement(statement) = node.kind() else {
                continue;
            };
            // An optional chain is a `ChainExpression`, not a call.
            let Expression::CallExpression(call) = &statement.expression else {
                continue;
            };
            // `property.name` is also an identifier's name inside brackets.
            let property = match &call.callee {
                Expression::StaticMemberExpression(member)
                    if member.property.name == "subscribe" =>
                {
                    span(&member.property)
                }
                Expression::ComputedMemberExpression(member) => match &member.expression {
                    Expression::Identifier(property) if property.name == "subscribe" => {
                        span(property.as_ref())
                    }
                    _ => continue,
                },
                // A private name's ESTree `name` has no `#`.
                Expression::PrivateFieldExpression(member) if member.field.name == "subscribe" => {
                    span(&member.field)
                }
                _ => continue,
            };
            reporter.report(Report::range(
                "Ignoring returned value of the subscribe method is forbidden.",
                property,
            ));
        }
    }
}
