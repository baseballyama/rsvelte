use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{Component, TemplateNode, TemplateNodeIdentifier};
use rsvelte_typescript_syntax::operators::LogicalOperator;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier};

use super::expressions::Expressions;
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
        let compare = Compare(Expressions::new(&component.javascript, file.source()));
        let outer = outer_blocks(component);
        for (identifier, node) in component.nodes.iter().enumerate() {
            let TemplateNode::If { test, .. } = *node else {
                continue;
            };
            // `a && b` repeats if `a`, `b` or both together are covered.
            let mut conditions: Vec<_> = if compare.is(test, LogicalOperator::And) {
                let mut split = compare.split(test, LogicalOperator::And);
                split.push(test);
                split
            } else {
                vec![test]
            }
            .into_iter()
            .map(|condition| (condition, compare.or_operands(condition)))
            .collect();
            let mut block = outer[identifier];
            'chain: while let Some(previous) = block {
                let TemplateNode::If { test, .. } = *component.node(previous) else {
                    unreachable!("an outer block is an `{{#if}}`")
                };
                let earlier = compare.or_operands(test);
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
                                compare.0.span(*condition),
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

struct Compare<'a>(Expressions<'a>);

impl Compare<'_> {
    /// A logical expression of `operator`; a type assertion around one is another node.
    fn logical(
        &self,
        node: NodeIdentifier,
    ) -> Option<(LogicalOperator, NodeIdentifier, NodeIdentifier)> {
        match self.0.javascript.kind(node) {
            Kind::Logical(op, left, right) if self.0.assertion(node).is_none() => {
                Some((op, left, right))
            }
            _ => None,
        }
    }

    fn is(&self, node: NodeIdentifier, operator: LogicalOperator) -> bool {
        self.logical(node).is_some_and(|(op, ..)| op == operator)
    }

    /// The operands `operator` joins, nested ones included: `a || (b || c)` is `[a, b, c]`.
    fn split(&self, node: NodeIdentifier, operator: LogicalOperator) -> Vec<NodeIdentifier> {
        let mut out = Vec::new();
        let mut pending = vec![node];
        while let Some(node) = pending.pop() {
            match self.logical(node) {
                Some((op, left, right)) if op == operator => {
                    pending.push(right);
                    pending.push(left);
                }
                _ => out.push(node),
            }
        }
        out
    }

    /// The `||` operands, each split at `&&`.
    fn or_operands(&self, node: NodeIdentifier) -> Vec<Vec<NodeIdentifier>> {
        self.split(node, LogicalOperator::Or)
            .into_iter()
            .map(|operand| self.split(operand, LogicalOperator::And))
            .collect()
    }

    /// Every operand of `a` is in `b`: `a && b` covers `a && b && c`.
    fn is_subset(&self, a: &[NodeIdentifier], b: &[NodeIdentifier]) -> bool {
        a.iter().all(|&a| b.iter().any(|&b| self.equal(a, b)))
    }

    /// Equal as conditions: `||` and `&&` commute.
    fn equal(&self, a: NodeIdentifier, b: NodeIdentifier) -> bool {
        let javascript = self.0.javascript;
        if javascript.tag(a) != javascript.tag(b) || self.0.assertion(a) != self.0.assertion(b) {
            return false;
        }
        if let (Some((op_a, left_a, right_a)), Some((op_b, left_b, right_b))) =
            (self.logical(a), self.logical(b))
            && op_a == op_b
            && matches!(op_a, LogicalOperator::Or | LogicalOperator::And)
        {
            return (self.equal(left_a, left_b) && self.equal(right_a, right_b))
                || (self.equal(left_a, right_b) && self.equal(right_a, left_b));
        }
        self.0.equal_tokens(a, b)
    }
}
