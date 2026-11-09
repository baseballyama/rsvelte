use rsvelte_lint_runner::rule::Reporter;
use rsvelte_typescript::operators::{LogicalOperator, UnaryOperator};
use rsvelte_typescript::syntax_tree::TypeScriptKind;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

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
            Ok(types) => check(file.javascript(), types, reporter),
            Err(why) => reporter.fail(why),
        }
    }
}

fn check(tree: &SyntaxTree, types: &TypeFacts, reporter: &mut Reporter<'_>) {
    let mut assertions: Vec<_> = tree
        .typescript
        .iter()
        .filter(|syntax| matches!(syntax.kind, TypeScriptKind::As | TypeScriptKind::Assertion))
        .map(|syntax| (syntax.node, syntax.span))
        .collect();
    assertions.sort_unstable_by_key(|(node, _)| node.index());
    let assertion_range = |node: NodeIdentifier| {
        let start = assertions.partition_point(|(id, _)| id.index() < node.index());
        let end = assertions.partition_point(|(id, _)| id.index() <= node.index());
        start..end
    };
    let report = |node, message, reporter: &mut Reporter<'_>| {
        let mut span = tree
            .source_location(node)
            .span()
            .expect("a source node has a span");
        for (_, assertion) in &assertions[assertion_range(node)] {
            span.start_offset = span.start_offset.min(assertion.start_offset);
            span.end_offset = span.end_offset.max(assertion.end_offset);
        }
        reporter.range(message, span);
    };
    let condition = |mut node: NodeIdentifier, reporter: &mut Reporter<'_>| {
        let mut is_not_argument = false;
        loop {
            if !assertion_range(node).is_empty() {
                break;
            }
            match tree.kind(node) {
                Kind::Unary(UnaryOperator::Not, argument) => {
                    node = argument;
                    is_not_argument = true;
                }
                Kind::Logical(operator, _, right) if operator != LogicalOperator::Nullish => {
                    node = right;
                    is_not_argument = false;
                }
                _ => break,
            }
        }
        if let Some(truthy) = types.get(node).truthiness() {
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
    for index in 0..tree.len() {
        let node = NodeIdentifier(index as u32);
        match tree.kind(node) {
            Kind::If { test, .. } | Kind::Conditional { test, .. } => condition(test, reporter),
            Kind::Logical(LogicalOperator::Nullish, left, _) => {
                if let Some(nullish) = types.get(left).nullish() {
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
            Kind::Logical(_, left, _) => condition(left, reporter),
            _ => {}
        }
    }
}
