use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_semantic::legacy::Variable;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Part, TemplateNode};
use rsvelte_typescript_syntax::Kind;
use rustc_hash::FxHashSet;

use super::javascript::span;
use super::legacy_reactivity::{is_html_element, legacy, property_name};
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
                    && javascript.is_identifier(*expression)
                {
                    bound.insert(*expression);
                }
            }
        }
        if bound.is_empty() {
            return;
        }
        let sem = file.semantic();
        let legacy = legacy(file);
        let variables: FxHashSet<Variable> = sem
            .references
            .iter()
            .zip(&legacy.references)
            .filter(|(reference, _)| bound.contains(&reference.node))
            .filter_map(|(_, top)| top.map(|top| top.variable))
            .collect();
        let parents = file.parents();
        for (reference, top) in sem.references.iter().zip(&legacy.references) {
            if !top.is_some_and(|top| variables.contains(&top.variable)) {
                continue;
            }
            let member = parents[reference.node.index()];
            if member.is_none() {
                continue;
            }
            if !matches!(javascript.kind(member), Kind::Member { object, .. } if object == reference.node)
            {
                continue;
            }
            let Some(name) = property_name(javascript, source, member) else {
                continue;
            };
            let parent = parents[member.index()];
            if parent.is_none() {
                continue;
            }
            let manipulates = match javascript.kind(parent) {
                Kind::Call { callee, .. } => callee == member && METHODS.contains(&name),
                Kind::Assign(_, left, _) => left == member && PROPERTIES.contains(&name),
                _ => false,
            };
            if manipulates {
                reporter.report(
                    Report::range(
                        "Don't manipulate the DOM directly. The Svelte runtime can get confused \
                         if there is a difference between the actual DOM and the DOM expected by \
                         the Svelte runtime.",
                        span(javascript, member),
                    )
                    .message_id("disallowManipulateDOM"),
                );
            }
        }
    }
}
