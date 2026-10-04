use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::diagnostic::{Diagnostic, Severity};
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint::rules::Rule;
use rsvelte_svelte::Parsed;
use rsvelte_typescript::operators::{LogicalOperator, UnaryOperator};
use rsvelte_typescript::syntax_tree::TypeScriptKind;
use rsvelte_typescript::{Kind, NodeIdentifier};

use crate::computation::ConditionTypes;
use crate::types::TypeFacts;

pub(crate) const RULE: &str = "svelte/@typescript-eslint/no-unnecessary-condition";

fn check_conditions(context: &DocumentContext<'_>, types: &TypeFacts, out: &mut Vec<Diagnostic>) {
    let component = context
        .get::<Parsed>()
        .as_ref()
        .expect("lint checks parsing first");
    let tree = &component.javascript;
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
    let report = |node, message, out: &mut Vec<Diagnostic>| {
        let mut span = tree
            .source_location(node)
            .span()
            .expect("a source node has a span");
        for (_, assertion) in &assertions[assertion_range(node)] {
            span.start_offset = span.start_offset.min(assertion.start_offset);
            span.end_offset = span.end_offset.max(assertion.end_offset);
        }
        out.push(Diagnostic::error(RULE, message, span));
    };
    let condition = |mut node: NodeIdentifier, out: &mut Vec<Diagnostic>| {
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
                out,
            );
        }
    };
    for index in 0..tree.len() {
        let node = NodeIdentifier(index as u32);
        match tree.kind(node) {
            Kind::If { test, .. } | Kind::Conditional { test, .. } => condition(test, out),
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
                        out,
                    );
                }
            }
            Kind::Logical(_, left, _) => condition(left, out),
            _ => {}
        }
    }
}

pub(super) struct NoUnnecessaryCondition(pub(super) Severity);

impl Rule<DocumentContext<'_>> for NoUnnecessaryCondition {
    fn identifier(&self) -> &'static str {
        RULE
    }

    fn check(&self, context: &DocumentContext<'_>, out: &mut Vec<Diagnostic>) {
        let before = out.len();
        if let Some(types) = context.facet::<ConditionTypes>() {
            check_conditions(context, types, out);
        } else {
            out.push(
                Diagnostic::error(
                    RULE,
                    "This rule requires a condition type provider.",
                    Span::new(0, 0),
                )
                .without_end(),
            );
        }
        for diagnostic in &mut out[before..] {
            diagnostic.severity = self.0;
        }
    }
}
