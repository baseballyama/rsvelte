use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::semantic::legacy::Variable;
use rsvelte_typescript::operators::{AssignmentOperator, UnaryOperator};
use rsvelte_typescript::syntax_tree::Control;
use rsvelte_typescript::{Kind, NodeIdentifier};
use rustc_hash::FxHashMap;
use serde::Deserialize;

use super::javascript::span;
use super::legacy_reactivity::{bindings, legacy, property_name};
use super::runes::runes_mode;
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
        let sem = file.semantic();
        let mut bound: Option<FxHashMap<NodeIdentifier, Span>> = None;
        for (reference, top) in sem.references.iter().zip(&legacy.references) {
            let Some(top) = top else { continue };
            let Variable::Implicit(index) = top.variable else {
                continue;
            };
            let assignment = legacy.implicit[index as usize].assignment;
            let Kind::Assign(AssignmentOperator::Assign, left, _) = javascript.kind(assignment)
            else {
                continue;
            };
            let left = span(javascript, left);
            let id = span(javascript, reference.node);
            if left.start_offset <= id.start_offset && id.end_offset <= left.end_offset {
                continue;
            }
            let bound = bound.get_or_insert_with(|| bindings(component));
            let Some((at, properties)) = reassignment(file, bound, reference.node) else {
                continue;
            };
            if !self.props && properties {
                continue;
            }
            let name = javascript.name(reference.node);
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

/// Where `identifier` is reassigned, and whether through a property.
fn reassignment(
    file: &File<'_>,
    bound: &FxHashMap<NodeIdentifier, Span>,
    identifier: NodeIdentifier,
) -> Option<(Span, bool)> {
    let javascript = file.javascript();
    let parents = file.parents();
    let mut path: Vec<NodeIdentifier> = Vec::new();
    let mut node = identifier;
    loop {
        let parent = parents[node.index()];
        if parent.is_none() {
            return bound.get(&node).map(|&at| (at, !path.is_empty()));
        }
        let at = || (span(javascript, parent), !path.is_empty());
        match javascript.kind(parent) {
            Kind::Update { .. } | Kind::Unary(UnaryOperator::Delete, _) => return Some(at()),
            Kind::Assign(_, left, _) if left == node => return Some(at()),
            Kind::Control(Control::ForEach { left, .. }) if left == node => return Some(at()),
            Kind::Call { callee, .. } if callee == node => {
                let &member = path.last()?;
                if property_name(javascript, file.source(), member)
                    .is_some_and(|name| MUTATORS.contains(&name))
                {
                    path.pop();
                    return Some((span(javascript, parent), !path.is_empty()));
                }
                return None;
            }
            Kind::Member { object, .. } if object == node => {
                path.push(parent);
                node = parent;
            }
            Kind::Conditional { test, .. } if test != node => node = parent,
            Kind::Property { value, .. } if value == node => {
                let pattern = parents[parent.index()];
                if pattern.is_none() || !matches!(javascript.kind(pattern), Kind::ObjectPattern(_))
                {
                    return None;
                }
                node = pattern;
            }
            Kind::ArrayPattern(_) => node = parent,
            Kind::Rest(_) => {
                let pattern = parents[parent.index()];
                if pattern.is_none() {
                    return None;
                }
                node = pattern;
            }
            _ => return None,
        }
    }
}
