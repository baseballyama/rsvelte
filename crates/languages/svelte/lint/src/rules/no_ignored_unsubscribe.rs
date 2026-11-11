use oxc_ast::AstKind;
use oxc_ast::ast::Expression;
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::javascript::walk;
use super::nodes::span;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-ignored-unsubscribe",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoIgnoredUnsubscribe))
}

#[derive(Debug)]
struct NoIgnoredUnsubscribe;

impl SvelteRule for NoIgnoredUnsubscribe {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        walk(file, |node| {
            let AstKind::ExpressionStatement(statement) = node.kind() else {
                return;
            };
            // An optional chain is a `ChainExpression`, not a call.
            let Expression::CallExpression(call) = &statement.expression else {
                return;
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
                    _ => return,
                },
                _ => return,
            };
            reporter.report(
                Report::range(
                    "Ignoring returned value of the subscribe method is forbidden.",
                    property,
                )
                .message_id("forbidden"),
            );
        });
    }
}
