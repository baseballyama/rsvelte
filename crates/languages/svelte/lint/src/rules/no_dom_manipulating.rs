use oxc_ast::AstKind;
use oxc_ast::ast::Expression;
use oxc_semantic::ReferenceId;
use oxc_span::GetSpan;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_semantic::legacy::Variable;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Part, TemplateNode};
use rustc_hash::FxHashSet;

use super::legacy_reactivity::{expression_node, is_html_element, legacy, property_name};
use super::nodes::span;
use super::svelte_store::is_value;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-dom-manipulating",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoDomManipulating))
}

#[derive(Debug)]
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
        let component = file.component().expect("a component rule");
        let source = file.source();
        let javascript = &component.javascript;
        // The expressions of `bind:this={name}` on HTML elements.
        let mut bound = FxHashSet::default();
        for node in &component.nodes {
            let TemplateNode::Element {
                name, attributes, ..
            } = node
            else {
                continue;
            };
            if !is_html_element(name.text(source)) {
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
        if bound.is_empty() {
            return;
        }
        let semantic = file.semantic();
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
            let Some(name) = property_name(member_kind) else {
                continue;
            };
            let parent = nodes.parent_id(member);
            if parent == member {
                continue;
            }
            let manipulates = match nodes.kind(parent) {
                AstKind::CallExpression(call) => {
                    expression_node(&call.callee) == member && METHODS.contains(&name)
                }
                AstKind::AssignmentExpression(assignment) => {
                    assignment.left.span() == member_kind.span() && PROPERTIES.contains(&name)
                }
                _ => false,
            };
            if manipulates {
                reporter.report(
                    Report::range(
                        "Don't manipulate the DOM directly. The Svelte runtime can get confused \
                         if there is a difference between the actual DOM and the DOM expected by \
                         the Svelte runtime.",
                        span(&member_kind),
                    )
                    .message_id("disallowManipulateDOM"),
                );
            }
        }
    }
}
