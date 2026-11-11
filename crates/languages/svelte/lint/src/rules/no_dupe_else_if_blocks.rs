use std::mem::discriminant;

use oxc_ast::ast::Expression;
use oxc_syntax::operator::LogicalOperator;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{Component, TemplateNode, TemplateNodeIdentifier};

use super::expressions::equal_tokens;
use super::nodes;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-dupe-else-if-blocks",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoDupeElseIfBlocks))
}

#[derive(Debug)]
struct NoDupeElseIfBlocks;

impl SvelteRule for NoDupeElseIfBlocks {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let compare = Compare {
            component,
            source: file.source(),
        };
        let outer = outer_blocks(component);
        for (identifier, node) in component.nodes.iter().enumerate() {
            let TemplateNode::If { test, .. } = *node else {
                continue;
            };
            let test = component.javascript.get_expression(test);
            // `a && b` repeats if `a`, `b` or both together are covered.
            let mut conditions: Vec<_> =
                if logical(test).is_some_and(|(op, ..)| op == LogicalOperator::And) {
                    let mut operands = split(test, LogicalOperator::And);
                    operands.push(test);
                    operands
                } else {
                    vec![test]
                }
                .into_iter()
                .map(|condition| (condition, or_operands(condition)))
                .collect();
            let mut block = outer[identifier];
            'chain: while let Some(previous) = block {
                let TemplateNode::If { test, .. } = *component.node(previous) else {
                    unreachable!("an outer block is an `{{#if}}`")
                };
                let earlier = or_operands(component.javascript.get_expression(test));
                for (condition, operands) in &mut conditions {
                    // An operand some earlier `||` operand covers can never be what is true here.
                    operands.retain(|operand| {
                        !earlier
                            .iter()
                            .any(|earlier| compare.is_subset(earlier, operand))
                    });
                    if operands.is_empty() {
                        reporter.report(
                            Report::range(
                                "This branch can never execute. Its condition is a duplicate or \
                                 covered by previous conditions in the `{#if}` / `{:else if}` \
                                 chain.",
                                nodes::span(*condition),
                            )
                            .message_id("unexpected"),
                        );
                        break 'chain;
                    }
                }
                block = outer[previous as usize];
            }
        }
    }
}

/// For each `{#if}`, the `{#if}` whose `{:else}` holds it directly, as `{:else if}` is held.
fn outer_blocks(component: &Component) -> Vec<Option<TemplateNodeIdentifier>> {
    let mut outer = vec![None; component.nodes.len()];
    for (identifier, node) in component.nodes.iter().enumerate() {
        if let TemplateNode::If {
            alternate: Some(alternate),
            ..
        } = *node
        {
            for &child in component.children(alternate) {
                if matches!(component.node(child), TemplateNode::If { .. }) {
                    outer[child as usize] = Some(identifier as TemplateNodeIdentifier);
                }
            }
        }
    }
    outer
}

struct Compare<'a> {
    component: &'a Component,
    source: &'a str,
}

type Logical<'e> = (LogicalOperator, &'e Expression<'e>, &'e Expression<'e>);

/// A logical expression; a type assertion around one is another node.
fn logical<'e>(expression: &'e Expression<'e>) -> Option<Logical<'e>> {
    match expression {
        Expression::LogicalExpression(logical) => {
            Some((logical.operator, &logical.left, &logical.right))
        }
        _ => None,
    }
}

/// The operands `operator` joins, nested ones included: `a || (b || c)` is `[a, b, c]`.
fn split<'e>(expression: &'e Expression<'e>, operator: LogicalOperator) -> Vec<&'e Expression<'e>> {
    let mut out = Vec::new();
    let mut pending = vec![expression];
    while let Some(expression) = pending.pop() {
        match logical(expression) {
            Some((op, left, right)) if op == operator => {
                pending.push(right);
                pending.push(left);
            }
            _ => out.push(expression),
        }
    }
    out
}

/// The `||` operands, each split at `&&`.
fn or_operands<'e>(expression: &'e Expression<'e>) -> Vec<Vec<&'e Expression<'e>>> {
    split(expression, LogicalOperator::Or)
        .into_iter()
        .map(|operand| split(operand, LogicalOperator::And))
        .collect()
}

impl Compare<'_> {
    /// Every operand of `a` is in `b`: `a && b` covers `a && b && c`.
    fn is_subset(&self, a: &[&Expression<'_>], b: &[&Expression<'_>]) -> bool {
        a.iter().all(|a| b.iter().any(|b| self.equal(a, b)))
    }

    /// Equal as conditions: `||` and `&&` commute.
    fn equal(&self, a: &Expression<'_>, b: &Expression<'_>) -> bool {
        if discriminant(a) != discriminant(b) {
            return false;
        }
        if let (Some((op_a, left_a, right_a)), Some((op_b, left_b, right_b))) =
            (logical(a), logical(b))
            && op_a == op_b
            && matches!(op_a, LogicalOperator::Or | LogicalOperator::And)
        {
            return (self.equal(left_a, left_b) && self.equal(right_a, right_b))
                || (self.equal(left_a, right_b) && self.equal(right_a, left_b));
        }
        equal_tokens(self.component, self.source, nodes::span(a), nodes::span(b))
    }
}
