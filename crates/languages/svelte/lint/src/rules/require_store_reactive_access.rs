use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, TemplateNode,
};
use rsvelte_typescript::operators::{AssignmentOperator, BinaryOperator, UnaryOperator};
use rsvelte_typescript::scope::BindingIdentifier;
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::syntax_tree::{Class, Control};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::javascript::{span, walk};
use super::legacy_reactivity::is_html_element;
use super::svelte_store::store_calls;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/require-store-reactive-access",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(RequireStoreReactiveAccess))
}

#[derive(Debug)]
struct RequireStoreReactiveAccess;

impl SvelteRule for RequireStoreReactiveAccess {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let javascript = &component.javascript;
        let parents = file.parents();
        // Each variable a `svelte/store` call initialises, and whether it is `const`.
        let mut stores: FxHashMap<BindingIdentifier, bool> = FxHashMap::default();
        for (call, _) in store_calls(file, &["writable", "readable", "derived"]) {
            let declarator = parents[call.index()];
            if declarator.is_none() {
                continue;
            }
            let Kind::Declarator {
                identifier,
                initializer: Some(initializer),
            } = javascript.kind(declarator)
            else {
                continue;
            };
            if initializer != call || !javascript.is_identifier(identifier) {
                continue;
            }
            let declaration = parents[declarator.index()];
            if let Kind::VariableDeclaration { kind, .. } = javascript.kind(declaration)
                && let Some(binding) = file.semantic().binding_of(identifier)
            {
                stores.insert(binding, kind == flag::CONST);
            }
        }
        if stores.is_empty() {
            return;
        }
        let mut check = Check {
            file,
            javascript,
            stores: &stores,
            reporter,
        };
        walk(file, |node| check.javascript_node(node));
        check.template(component);
    }
}

struct Check<'a, 'r, 'p> {
    file: &'a File<'a>,
    javascript: &'a SyntaxTree,
    stores: &'a FxHashMap<BindingIdentifier, bool>,
    reporter: &'r mut Reporter<'p>,
}

impl Check<'_, '_, '_> {
    /// `verifyExpression`: reports a store itself, with a fix that adds `$` to a name.
    fn verify(&mut self, node: NodeIdentifier, fix: bool, consistent: bool) {
        let javascript = self.javascript;
        if !javascript.is_identifier(node) || javascript.name(node).starts_with('$') {
            return;
        }
        let Some(binding) = self.file.semantic().binding_of(node) else {
            return;
        };
        let Some(&constant) = self.stores.get(&binding) else {
            return;
        };
        if consistent && !constant {
            return;
        }
        let at = span(javascript, node);
        let mut report = Report::range(
            "Use the $ prefix or the get function to access reactive values instead of accessing \
             the raw store.",
            at,
        )
        .message_id("usingRawStoreInText");
        if fix {
            report = report.fix(Fix::insert(at.start_offset, "$"));
        }
        self.reporter.report(report);
    }

    fn javascript_node(&mut self, node: NodeIdentifier) {
        let javascript = self.javascript;
        match javascript.kind(node) {
            Kind::If { test, .. }
            | Kind::Conditional { test, .. }
            | Kind::Control(Control::While { test, .. })
            | Kind::For {
                test: Some(test), ..
            } => self.verify(test, true, true),
            Kind::Control(Control::ForEach { right, .. }) => self.verify(right, true, false),
            Kind::Control(Control::Switch { discriminant, .. }) => {
                self.verify(discriminant, true, false);
            }
            Kind::Call { callee, .. } | Kind::New { callee, .. } => {
                if !matches!(javascript.kind(callee), Kind::Super) {
                    self.verify(callee, true, false);
                }
            }
            Kind::Unary(operator, argument) => self.verify(
                argument,
                true,
                matches!(operator, UnaryOperator::Not | UnaryOperator::TypeOf),
            ),
            Kind::Update { arg, .. } => self.verify(arg, true, false),
            Kind::Spread(argument) => self.verify(argument, true, false),
            Kind::Assign(operator, left, right) if operator != AssignmentOperator::Assign => {
                if !matches!(
                    javascript.kind(left),
                    Kind::ObjectPattern(_) | Kind::ArrayPattern(_)
                ) {
                    self.verify(left, true, false);
                }
                self.verify(right, true, false);
            }
            Kind::Binary(operator, left, right) => {
                let consistent = matches!(
                    operator,
                    BinaryOperator::Eq
                        | BinaryOperator::NotEq
                        | BinaryOperator::StrictEq
                        | BinaryOperator::StrictNotEq
                );
                self.verify(left, true, consistent);
                self.verify(right, true, consistent);
            }
            Kind::Logical(_, left, _) => self.verify(left, true, true),
            Kind::Template { expressions, .. } => {
                for &expression in expressions {
                    self.verify(expression, true, false);
                }
            }
            Kind::Property {
                key,
                computed: true,
                ..
            }
            | Kind::Class(
                Class::Method {
                    key,
                    computed: true,
                    ..
                }
                | Class::Field {
                    key,
                    computed: true,
                    ..
                },
            ) => self.verify(key, true, false),
            Kind::ImportExpression { source, .. } => self.verify(source, true, false),
            Kind::Await(argument) => self.verify(argument, true, true),
            _ => {}
        }
    }

    fn template(&mut self, component: &Component) {
        let source = self.file.source();
        for node in &component.nodes {
            match *node {
                TemplateNode::Expression { expression, .. }
                | TemplateNode::Html { expression, .. } => {
                    self.verify(expression, true, false);
                }
                TemplateNode::If { test, .. } => self.verify(test, true, true),
                TemplateNode::Await { expression, .. } => self.verify(expression, true, true),
                TemplateNode::Each { expression, .. } => self.verify(expression, true, false),
                TemplateNode::Element {
                    name, attributes, ..
                } => {
                    let name = name.text(source);
                    let accepts = !is_html_element(name);
                    let special = matches!(name, "svelte:component" | "svelte:element");
                    for attribute in component.attributes(attributes) {
                        self.attribute(component, attribute, accepts, special);
                    }
                }
                _ => {}
            }
        }
    }

    /// The checks of one attribute of an element; `accepts` when the element is a component
    /// (or a special element other than `<svelte:element>`), which may take a store.
    fn attribute(
        &mut self,
        component: &Component,
        attribute: &Attribute,
        accepts: bool,
        special: bool,
    ) {
        let source = self.file.source();
        let parts = match attribute.value {
            AttributeValue::Parts(parts) => component.parts(parts),
            AttributeValue::True => &[],
        };
        let single = match parts {
            [Part::Expression { expression, .. }] => Some(*expression),
            _ => None,
        };
        let directive = || {
            attribute
                .directive_name(&component.modifiers)
                .map(|name| name.text(source))
        };
        match attribute.kind {
            AttributeKind::Attribute => {
                let name = attribute.name.text(source);
                if special && name == "this" {
                    if let Some(expression) = single {
                        self.verify(expression, true, false);
                    }
                } else if attribute.shorthand {
                    if !accepts && let Some(expression) = single {
                        self.verify(expression, false, false);
                    }
                } else {
                    let accepted = accepts && parts.len() == 1 && !name.starts_with("--");
                    if !accepted {
                        self.mustaches(parts);
                    }
                }
            }
            AttributeKind::Spread | AttributeKind::On => {
                if let Some(expression) = single {
                    self.verify(expression, true, false);
                }
            }
            AttributeKind::Use | AttributeKind::Transition { .. } | AttributeKind::Animate => {
                if self.javascript.is_identifier(attribute.target) {
                    self.verify(attribute.target, true, false);
                }
            }
            AttributeKind::Bind => {
                if directive() != Some("this") && accepts {
                    return;
                }
                if let Some(expression) = single {
                    let fix = !attribute.shorthand;
                    match self.javascript.kind(expression) {
                        Kind::Sequence(expressions) => {
                            for &expression in expressions {
                                self.verify(expression, fix, false);
                            }
                        }
                        _ => self.verify(expression, fix, false),
                    }
                }
            }
            AttributeKind::Class => {
                if let Some(expression) = single {
                    self.verify(expression, !attribute.shorthand, true);
                }
            }
            AttributeKind::Style => {
                if attribute.shorthand {
                    if let Some(expression) = single {
                        self.verify(expression, false, false);
                    }
                } else {
                    self.mustaches(parts);
                }
            }
            AttributeKind::Attach | AttributeKind::Let => {}
        }
    }

    /// The `{expression}` chunks of a value, each a `SvelteMustacheTag`.
    fn mustaches(&mut self, parts: &[Part]) {
        for part in parts {
            if let Part::Expression { expression, .. } = *part {
                self.verify(expression, true, false);
            }
        }
    }
}
