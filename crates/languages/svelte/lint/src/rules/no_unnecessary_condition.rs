use oxc_ast::AstKind;
use oxc_ast::ast::Expression;
use oxc_semantic::AstNodes;
use oxc_syntax::operator::{LogicalOperator, UnaryOperator};
use rsvelte_lint_runner::rule::Reporter;

use super::nodes::span;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};
use crate::types::TypeFacts;

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/@typescript-eslint/no-unnecessary-condition",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoUnnecessaryCondition))
}

#[derive(Debug)]
struct NoUnnecessaryCondition;

impl SvelteRule for NoUnnecessaryCondition {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        match file.condition_types().expect("a component rule") {
            Ok(types) => check(file.nodes(), types, reporter),
            Err(why) => reporter.fail(why),
        }
    }
}

fn check(nodes: &AstNodes<'_>, types: &TypeFacts, reporter: &mut Reporter<'_>) {
    let report = |node: &Expression<'_>, message, reporter: &mut Reporter<'_>| {
        reporter.range(message, span(node));
    };
    let condition = |node: &Expression<'_>, reporter: &mut Reporter<'_>| {
        let mut node = node;
        let mut is_not_argument = false;
        loop {
            match node {
                Expression::UnaryExpression(unary)
                    if unary.operator == UnaryOperator::LogicalNot =>
                {
                    node = &unary.argument;
                    is_not_argument = true;
                }
                Expression::LogicalExpression(logical)
                    if logical.operator != LogicalOperator::Coalesce =>
                {
                    node = &logical.right;
                    is_not_argument = false;
                }
                _ => break,
            }
        }
        if let Some(truthy) = types.get(node.node_id()).truthiness() {
            report(
                node,
                if truthy ^ is_not_argument {
                    "Unnecessary conditional, value is always truthy."
                } else {
                    "Unnecessary conditional, value is always falsy."
                },
                reporter,
            );
        }
    };
    for node in nodes.iter() {
        match node.kind() {
            AstKind::IfStatement(statement) => condition(&statement.test, reporter),
            AstKind::ConditionalExpression(expression) => condition(&expression.test, reporter),
            AstKind::LogicalExpression(logical)
                if logical.operator == LogicalOperator::Coalesce =>
            {
                let left = &logical.left;
                if let Some(nullish) = types.get(left.node_id()).nullish() {
                    report(
                        left,
                        if nullish {
                            concat!(
                                "Unnecessary conditional, left-hand side of `??` operator ",
                                "is always `null` or `undefined`."
                            )
                        } else {
                            concat!(
                                "Unnecessary conditional, expected left-hand side of `??` ",
                                "operator ",
                                "to be possibly null or undefined."
                            )
                        },
                        reporter,
                    );
                }
            }
            AstKind::LogicalExpression(logical) => condition(&logical.left, reporter),
            _ => {}
        }
    }
}
