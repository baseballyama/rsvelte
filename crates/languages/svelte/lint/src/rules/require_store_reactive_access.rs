use oxc_ast::AstKind;
use oxc_ast::ast::{
    AssignmentTarget, BindingPattern, Expression, IdentifierReference, PropertyKey,
    SimpleAssignmentTarget, VariableDeclarationKind,
};
use oxc_semantic::{AstNode, SymbolId};
use oxc_syntax::operator::{AssignmentOperator, BinaryOperator, UnaryOperator};
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, TemplateNode,
};
use rsvelte_typescript_tree::{ExpressionIdentifier, Tree};
use rustc_hash::FxHashMap;

use super::javascript::walk;
use super::legacy_reactivity::is_markup_element;
use super::nodes::span;
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
        let nodes = file.nodes();
        // Each variable a `svelte/store` call initialises, and whether it is `const`.
        let mut stores: FxHashMap<SymbolId, bool> = FxHashMap::default();
        for (call, _) in store_calls(file, &["writable", "readable", "derived"]) {
            let declarator = nodes.parent_id(call.node_id());
            let AstKind::VariableDeclarator(declarator_node) = nodes.kind(declarator) else {
                continue;
            };
            let BindingPattern::BindingIdentifier(identifier) = &declarator_node.id else {
                continue;
            };
            if let AstKind::VariableDeclaration(declaration) = nodes.parent_kind(declarator)
                && let Some(symbol) = identifier.symbol_id.get()
            {
                stores.insert(symbol, declaration.kind == VariableDeclarationKind::Const);
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
    javascript: &'a Tree,
    stores: &'a FxHashMap<SymbolId, bool>,
    reporter: &'r mut Reporter<'p>,
}

impl Check<'_, '_, '_> {
    /// `verifyExpression`: reports a store itself, with a fix that adds `$` to a name.
    fn verify(&mut self, expression: &Expression<'_>, fix: bool, consistent: bool) {
        if let Expression::Identifier(identifier) = expression {
            self.verify_identifier(identifier, fix, consistent);
        }
    }

    fn verify_identifier(
        &mut self,
        identifier: &IdentifierReference<'_>,
        fix: bool,
        consistent: bool,
    ) {
        if identifier.name.starts_with('$') {
            return;
        }
        let scoping = self.file.semantic().scoping();
        let Some(symbol) = identifier
            .reference_id
            .get()
            .and_then(|id| scoping.get_reference(id).symbol_id())
        else {
            return;
        };
        let Some(&constant) = self.stores.get(&symbol) else {
            return;
        };
        if consistent && !constant {
            return;
        }
        let at = span(identifier);
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

    /// [`Check::verify`] of the expression a template part holds.
    fn verify_part(&mut self, expression: ExpressionIdentifier, fix: bool, consistent: bool) {
        let javascript = self.javascript;
        self.verify(javascript.get_expression(expression), fix, consistent);
    }

    /// A computed key, which upstream checks.
    fn verify_key(&mut self, key: &PropertyKey<'_>, computed: bool) {
        if computed && let Some(key) = key.as_expression() {
            self.verify(key, true, false);
        }
    }

    fn javascript_node(&mut self, node: &AstNode<'_>) {
        match node.kind() {
            AstKind::IfStatement(statement) => self.verify(&statement.test, true, true),
            AstKind::ConditionalExpression(conditional) => {
                self.verify(&conditional.test, true, true);
            }
            AstKind::WhileStatement(statement) => self.verify(&statement.test, true, true),
            AstKind::DoWhileStatement(statement) => self.verify(&statement.test, true, true),
            AstKind::ForStatement(statement) => {
                if let Some(test) = &statement.test {
                    self.verify(test, true, true);
                }
            }
            AstKind::ForInStatement(statement) => self.verify(&statement.right, true, false),
            AstKind::ForOfStatement(statement) => self.verify(&statement.right, true, false),
            AstKind::SwitchStatement(statement) => {
                self.verify(&statement.discriminant, true, false);
            }
            AstKind::CallExpression(call) => self.verify(&call.callee, true, false),
            AstKind::NewExpression(new) => self.verify(&new.callee, true, false),
            AstKind::UnaryExpression(unary) => self.verify(
                &unary.argument,
                true,
                matches!(
                    unary.operator,
                    UnaryOperator::LogicalNot | UnaryOperator::Typeof
                ),
            ),
            AstKind::UpdateExpression(update) => {
                if let SimpleAssignmentTarget::AssignmentTargetIdentifier(identifier) =
                    &update.argument
                {
                    self.verify_identifier(identifier, true, false);
                }
            }
            AstKind::SpreadElement(spread) => self.verify(&spread.argument, true, false),
            AstKind::AssignmentExpression(assignment)
                if assignment.operator != AssignmentOperator::Assign =>
            {
                if let AssignmentTarget::AssignmentTargetIdentifier(identifier) = &assignment.left {
                    self.verify_identifier(identifier, true, false);
                }
                self.verify(&assignment.right, true, false);
            }
            AstKind::BinaryExpression(binary) => {
                let consistent = matches!(
                    binary.operator,
                    BinaryOperator::Equality
                        | BinaryOperator::Inequality
                        | BinaryOperator::StrictEquality
                        | BinaryOperator::StrictInequality
                );
                self.verify(&binary.left, true, consistent);
                self.verify(&binary.right, true, consistent);
            }
            AstKind::PrivateInExpression(binary) => self.verify(&binary.right, true, false),
            AstKind::LogicalExpression(logical) => self.verify(&logical.left, true, true),
            AstKind::TemplateLiteral(template) => {
                for expression in &template.expressions {
                    self.verify(expression, true, false);
                }
            }
            AstKind::TaggedTemplateExpression(tagged) => self.verify(&tagged.tag, true, false),
            AstKind::ObjectProperty(property) => self.verify_key(&property.key, property.computed),
            AstKind::BindingProperty(property) => {
                self.verify_key(&property.key, property.computed);
            }
            AstKind::AssignmentTargetPropertyProperty(property) => {
                self.verify_key(&property.name, property.computed);
            }
            AstKind::MethodDefinition(method) => self.verify_key(&method.key, method.computed),
            AstKind::PropertyDefinition(property) => {
                self.verify_key(&property.key, property.computed);
            }
            AstKind::ImportExpression(import) => self.verify(&import.source, true, false),
            AstKind::AwaitExpression(expression) => self.verify(&expression.argument, true, true),
            _ => {}
        }
    }

    fn template(&mut self, component: &Component) {
        let source = self.file.source();
        for node in &component.nodes {
            match *node {
                TemplateNode::Expression { expression, .. }
                | TemplateNode::Html { expression, .. } => {
                    self.verify_part(expression, true, false);
                }
                TemplateNode::If { test, .. } => self.verify_part(test, true, true),
                TemplateNode::Await { expression, .. } => {
                    self.verify_part(expression, true, true);
                }
                TemplateNode::Each { expression, .. } => self.verify_part(expression, true, false),
                TemplateNode::Element {
                    name, attributes, ..
                } => {
                    let name = name.text(source);
                    let accepts = !is_markup_element(name);
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
                        self.verify_part(expression, true, false);
                    }
                } else if attribute.shorthand {
                    if !accepts && let Some(expression) = single {
                        self.verify_part(expression, false, false);
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
                    self.verify_part(expression, true, false);
                }
            }
            AttributeKind::Use | AttributeKind::Transition { .. } | AttributeKind::Animate => {
                if let Some(target) = attribute.target {
                    self.verify_part(target, true, false);
                }
            }
            AttributeKind::Bind => {
                if directive() != Some("this") && accepts {
                    return;
                }
                if let Some(expression) = single {
                    let fix = !attribute.shorthand;
                    match self.javascript.get_expression(expression) {
                        Expression::SequenceExpression(sequence) => {
                            for expression in &sequence.expressions {
                                self.verify(expression, fix, false);
                            }
                        }
                        expression => self.verify(expression, fix, false),
                    }
                }
            }
            AttributeKind::Class => {
                if let Some(expression) = single {
                    self.verify_part(expression, !attribute.shorthand, true);
                }
            }
            AttributeKind::Style => {
                if attribute.shorthand {
                    if let Some(expression) = single {
                        self.verify_part(expression, false, false);
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
                self.verify_part(expression, true, false);
            }
        }
    }
}
