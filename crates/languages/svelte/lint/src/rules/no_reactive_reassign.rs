use oxc_ast::AstKind;
use oxc_ast::ast::{Expression, Statement};
use oxc_semantic::{AstNodes, NodeId, ReferenceId};
use oxc_span::GetSpan;
use oxc_syntax::operator::{AssignmentOperator, UnaryOperator};
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_semantic::legacy::{Variable, reactive_body};
use rustc_hash::FxHashMap;
use serde::Deserialize;

use super::legacy_reactivity::{bindings, expression_node, legacy, property_name};
use super::nodes::span;
use super::runes::runes_mode;
use super::svelte_store::is_value;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-reactive-reassign",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    props: Option<bool>,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(NoReactiveReassign {
        props: options.props.unwrap_or(true),
    }))
}

#[derive(Debug)]
struct NoReactiveReassign {
    /// Report assignments to a reactive value's properties too.
    props: bool,
}

const MUTATORS: &[&str] = &[
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "splice",
    "sort",
    "copyWithin",
    "fill",
];

impl SvelteRule for NoReactiveReassign {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        if runes_mode(component, file.source()) {
            return;
        }
        let legacy = legacy(file);
        let javascript = &component.javascript;
        let semantic = file.semantic();
        let scoping = semantic.scoping();
        let nodes = semantic.nodes();
        let mut bound: Option<FxHashMap<NodeId, Span>> = None;
        for id in (0..scoping.references_len()).map(ReferenceId::from_usize) {
            let reference = scoping.get_reference(id);
            if !is_value(reference) {
                continue;
            }
            let Some(top) = legacy.references[id.index()] else {
                continue;
            };
            let Variable::Implicit(index) = top.variable else {
                continue;
            };
            let statement = legacy.implicit[index as usize].statement.get(javascript);
            let Some(Statement::ExpressionStatement(statement)) = reactive_body(statement) else {
                continue;
            };
            let Expression::AssignmentExpression(assignment) = &statement.expression else {
                continue;
            };
            if assignment.operator != AssignmentOperator::Assign {
                continue;
            }
            let left = assignment.left.span();
            let identifier = nodes.kind(reference.node_id());
            let AstKind::IdentifierReference(name) = identifier else {
                continue;
            };
            if left.start <= name.span.start && name.span.end <= left.end {
                continue;
            }
            let bound = bound.get_or_insert_with(|| bindings(component));
            let Some((at, properties)) = reassignment(nodes, bound, reference.node_id()) else {
                continue;
            };
            if !self.props && properties {
                continue;
            }
            let name = name.name.as_str();
            let (message, id) = if properties {
                (
                    format!("Assignment to property of reactive value '{name}'."),
                    "assignmentToReactiveValueProp",
                )
            } else {
                (
                    format!("Assignment to reactive value '{name}'."),
                    "assignmentToReactiveValue",
                )
            };
            reporter.report(Report::range(message, at).message_id(id));
        }
    }
}

/// Where `identifier` is reassigned, and whether through a property (`getReassignData`).
fn reassignment(
    nodes: &AstNodes<'_>,
    bound: &FxHashMap<NodeId, Span>,
    identifier: NodeId,
) -> Option<(Span, bool)> {
    let mut path: Vec<AstKind<'_>> = Vec::new();
    let mut node = identifier;
    loop {
        let parent = nodes.parent_id(node);
        if parent == node {
            return None;
        }
        let at = || (span(&nodes.kind(parent)), !path.is_empty());
        let is_node = |expression: &Expression<'_>| expression_node(expression) == node;
        let node_span = nodes.kind(node).span();
        match nodes.kind(parent) {
            // A template expression, whose parent upstream is its directive.
            AstKind::Program(_) => return bound.get(&node).map(|&at| (at, !path.is_empty())),
            AstKind::UpdateExpression(_) => return Some(at()),
            AstKind::UnaryExpression(unary) if unary.operator == UnaryOperator::Delete => {
                return Some(at());
            }
            AstKind::AssignmentExpression(assignment) if assignment.left.span() == node_span => {
                return Some(at());
            }
            AstKind::ForInStatement(statement) if statement.left.span() == node_span => {
                return Some(at());
            }
            AstKind::ForOfStatement(statement) if statement.left.span() == node_span => {
                return Some(at());
            }
            AstKind::CallExpression(call) if is_node(&call.callee) => {
                let &member = path.last()?;
                if property_name(member).is_some_and(|name| MUTATORS.contains(&name)) {
                    path.pop();
                    return Some((span(&nodes.kind(parent)), !path.is_empty()));
                }
                return None;
            }
            kind if member_object(kind).is_some_and(is_node) => {
                path.push(kind);
                node = parent;
            }
            // `foo?.prop`, `(test ? foo : bar).prop` and `[foo] = …`.
            kind @ (AstKind::ChainExpression(_)
            | AstKind::ConditionalExpression(_)
            | AstKind::ArrayAssignmentTarget(_))
                if !matches!(kind, AstKind::ConditionalExpression(conditional)
                    if is_node(&conditional.test)) =>
            {
                node = parent;
            }
            // `({ a: name } = …)`.
            AstKind::AssignmentTargetPropertyProperty(property)
                if property.binding.span() == node_span =>
            {
                let pattern = nodes.parent_id(parent);
                if !matches!(nodes.kind(pattern), AstKind::ObjectAssignmentTarget(_)) {
                    return None;
                }
                node = pattern;
            }
            // `({ name } = …)`; with a default value, the name is in an `AssignmentPattern`.
            AstKind::AssignmentTargetPropertyIdentifier(property) if property.init.is_none() => {
                node = nodes.parent_id(parent);
            }
            AstKind::AssignmentTargetRest(_) => node = nodes.parent_id(parent),
            _ => return None,
        }
    }
}

/// The object of a member expression.
const fn member_object(kind: AstKind<'_>) -> Option<&Expression<'_>> {
    match kind {
        AstKind::StaticMemberExpression(member) => Some(&member.object),
        AstKind::ComputedMemberExpression(member) => Some(&member.object),
        AstKind::PrivateFieldExpression(member) => Some(&member.object),
        _ => None,
    }
}
