use oxc_ast::AstKind;
use oxc_ast::ast::Expression;
use oxc_semantic::{NodeId, ReferenceId};
use oxc_span::GetSpan;
use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_semantic::legacy::Variable;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Part, TemplateNode};
use rsvelte_typescript_semantic::static_value::StaticValues;
use rustc_hash::FxHashSet;

use super::shared::element_kind::is_markup_element;
use super::shared::legacy_reactivity::{expression_node, legacy, property_name};
use super::shared::nodes::span;
use super::shared::svelte_store::is_value;
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

#[cfg(test)]
mod tests;

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-dom-manipulating",
    files: Files::Components,
    category: Category::Correctness,
    configure: without_options::<NoDomManipulating>,
};

#[derive(Debug, Default)]
struct NoDomManipulating;

const METHODS: &[&str] = &[
    "appendChild",
    "insertBefore",
    "normalize",
    "removeChild",
    "replaceChild",
    "after",
    "append",
    "before",
    "insertAdjacentElement",
    "insertAdjacentHTML",
    "insertAdjacentText",
    "prepend",
    "remove",
    "replaceChildren",
    "replaceWith",
];

const PROPERTIES: &[&str] = &[
    "textContent",
    "innerHTML",
    "outerHTML",
    "innerText",
    "outerText",
];

impl SvelteRule for NoDomManipulating {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        // Analyzed first: until then a node's id is the parser's, not the analysis's.
        let semantic = file.semantic();
        let bound = bound_this(file);
        if bound.is_empty() {
            return;
        }
        let scoping = semantic.scoping();
        let nodes = semantic.nodes();
        let legacy = legacy(file);
        let references = || {
            (0..scoping.references_len())
                .map(ReferenceId::from_usize)
                .map(|id| (scoping.get_reference(id), legacy.references[id.index()]))
                .filter(|(reference, _)| is_value(reference))
        };
        let variables: FxHashSet<Variable> = references()
            .filter(|(reference, _)| bound.contains(&reference.node_id()))
            .filter_map(|(_, top)| top.map(|top| top.variable))
            .collect();
        let keys = StaticValues::without_names(semantic);
        for (reference, top) in references() {
            if !top.is_some_and(|top| variables.contains(&top.variable)) {
                continue;
            }
            let identifier = reference.node_id();
            let member = nodes.parent_id(identifier);
            let member_kind = nodes.kind(member);
            let object = match member_kind {
                AstKind::StaticMemberExpression(member) => &member.object,
                AstKind::ComputedMemberExpression(member) => &member.object,
                _ => continue,
            };
            if expression_node(object) != identifier {
                continue;
            }
            let computed;
            let name = match (property_name(member_kind), member_kind) {
                (Some(name), _) => name,
                // `getPropertyName` without a scope evaluates only what the key spells out.
                (None, AstKind::ComputedMemberExpression(member)) => {
                    let Some(name) = keys.string(&member.expression) else {
                        continue;
                    };
                    computed = name;
                    computed.as_str()
                }
                (None, _) => continue,
            };
            // `(foo?.remove)()` calls the chain the member ends.
            let mut callee = member;
            let mut parent = nodes.parent_id(member);
            while parent != callee && matches!(nodes.kind(parent), AstKind::ChainExpression(_)) {
                callee = parent;
                parent = nodes.parent_id(parent);
            }
            if parent == callee {
                continue;
            }
            let manipulates = match nodes.kind(parent) {
                AstKind::CallExpression(call) => {
                    expression_node(&call.callee) == callee && METHODS.contains(&name)
                }
                AstKind::AssignmentExpression(assignment) => {
                    assignment.left.span() == member_kind.span() && PROPERTIES.contains(&name)
                }
                _ => false,
            };
            if manipulates {
                reporter.report(Report::range(
                    "Don't manipulate the DOM directly. The Svelte runtime can get confused \
                         if there is a difference between the actual DOM and the DOM expected by \
                         the Svelte runtime.",
                    span(&member_kind),
                ));
            }
        }
    }
}

/// The expressions of `bind:this={name}` on HTML elements.
fn bound_this(file: &File<'_>) -> FxHashSet<NodeId> {
    let component = file.component().expect("a component rule");
    let source = file.source();
    let javascript = &component.javascript;
    let mut bound = FxHashSet::default();
    for node in &component.nodes {
        let TemplateNode::Element {
            name, attributes, ..
        } = node
        else {
            continue;
        };
        if !is_markup_element(name.text(source)) {
            continue;
        }
        for attribute in component.attributes(*attributes) {
            if attribute.kind != AttributeKind::Bind
                || attribute
                    .directive_name(&component.modifiers)
                    .is_none_or(|name| name.text(source) != "this")
            {
                continue;
            }
            if let AttributeValue::Parts(parts) = attribute.value
                && let [Part::Expression { expression, .. }] = component.parts(parts)
                && let expression = javascript.get_expression(*expression)
                && matches!(expression, Expression::Identifier(_))
            {
                bound.insert(expression_node(expression));
            }
        }
    }
    bound
}
