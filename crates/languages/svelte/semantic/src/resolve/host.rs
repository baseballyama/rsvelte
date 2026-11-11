use std::cell::{Cell, RefCell};

use oxc_allocator::Allocator;
use oxc_ast::ast::{BindingIdentifier, Expression, Program};
use oxc_ast::builder::AstBuilder;
use oxc_semantic::{Host, HostVisitor, ScopeFlags, ScopeId, SymbolFlags};
use oxc_span::GetSpan;
use rsvelte_typescript_tree::{
    DeclarationIdentifier, ExpressionIdentifier, ParametersIdentifier, PatternIdentifier, Tree,
};
use rustc_hash::FxHashMap;

use super::walk::{Recorded, Roots, TemplateName, TemplateScope};
use crate::compiler_syntax_tree::{
    AttributeIdentifier, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, Name, NodeKind,
};

/// The instance script and the template, evaluated inside the module script's scope when there is
/// one, else inside the instance's own.
pub(super) struct ComponentHost<'t, 'a> {
    pub(super) tree: &'a Tree,
    pub(super) template: &'t Recorded,
    /// The instance script, when the module script is the root program.
    pub(super) nested_instance: Option<&'a Program<'a>>,
    pub(super) names: &'t Names<'a>,
    /// The scopes the template opened, once the builder has visited it.
    pub(super) scopes: RefCell<FxHashMap<TemplateScope, ScopeId>>,
}

/// The binding identifiers of the names the template declares outside a JavaScript pattern.
/// They live in the trees' arena, so the analysis can declare them like any other.
pub(super) struct Names<'a> {
    snippets: FxHashMap<CompilerNodeIdentifier, &'a BindingIdentifier<'a>>,
    lets: FxHashMap<AttributeIdentifier, Vec<&'a BindingIdentifier<'a>>>,
}

impl<'a> Names<'a> {
    pub(super) fn new(
        tree: &'a Tree,
        allocator: &'a Allocator,
        compiler_syntax_tree: &CompilerSyntaxTree,
    ) -> Self {
        let nodes = AstBuilder::new(allocator);
        let source_text: &'a str = tree.source_text();
        let mut names = Self {
            snippets: FxHashMap::default(),
            lets: FxHashMap::default(),
        };
        for (identifier, node) in compiler_syntax_tree.nodes.iter_enumerated() {
            match &node.kind {
                NodeKind::Snippet(snippet) => {
                    if let Expression::Identifier(name) = tree.get_expression(snippet.name) {
                        let binding = BindingIdentifier::new(name.span, name.name, &nodes);
                        names.snippets.insert(identifier, allocator.alloc(binding));
                    }
                }
                NodeKind::Element(el) => {
                    for attribute in el.attributes.iter() {
                        let a = &compiler_syntax_tree.attributes[attribute];
                        let AttributeValue::Let(value) = a.value else {
                            continue;
                        };
                        let mut bindings = Vec::new();
                        if let Some(value) = value {
                            let mut add = |span: oxc_span::Span, name: &'a str| {
                                let binding = BindingIdentifier::new(span, name, &nodes);
                                bindings.push(&*allocator.alloc(binding));
                            };
                            for_each_target(tree.get_expression(value), &mut add);
                        } else {
                            let span = match &a.name {
                                Name::Source(span) | Name::Spelled { span, .. } => *span,
                            };
                            let name = span.text(source_text);
                            let name = name.strip_prefix("let:").unwrap_or(name);
                            let span = oxc_span::Span::new(
                                span.end_offset - name.len() as u32,
                                span.end_offset,
                            );
                            let binding = BindingIdentifier::new(span, name, &nodes);
                            bindings.push(&*allocator.alloc(binding));
                        }
                        names.lets.insert(attribute, bindings);
                    }
                }
                _ => {}
            }
        }
        names
    }

    /// The symbols the builder gave the names.
    pub(super) fn symbols(&self) -> super::TemplateNames {
        let symbol = |binding: &BindingIdentifier<'_>| binding.symbol_id.get();
        super::TemplateNames {
            snippets: self
                .snippets
                .iter()
                .filter_map(|(&node, binding)| Some((node, symbol(binding)?)))
                .collect(),
            lets: self
                .lets
                .iter()
                .map(|(&attribute, bindings)| {
                    (
                        attribute,
                        bindings.iter().filter_map(|b| symbol(b)).collect(),
                    )
                })
                .collect(),
        }
    }
}

/// Upstream `extract_identifiers` of a `let:` value, which is written as an expression.
fn for_each_target<'a>(e: &'a Expression<'a>, f: &mut impl FnMut(oxc_span::Span, &'a str)) {
    match e {
        Expression::Identifier(identifier) => f(identifier.span, identifier.name.as_str()),
        Expression::ObjectExpression(object) => {
            for property in &object.properties {
                match property {
                    oxc_ast::ast::ObjectPropertyKind::ObjectProperty(p) => {
                        for_each_target(&p.value, f);
                    }
                    oxc_ast::ast::ObjectPropertyKind::SpreadProperty(s) => {
                        for_each_target(&s.argument, f);
                    }
                }
            }
        }
        Expression::ArrayExpression(array) => {
            for element in &array.elements {
                match element {
                    oxc_ast::ast::ArrayExpressionElement::SpreadElement(s) => {
                        for_each_target(&s.argument, f);
                    }
                    oxc_ast::ast::ArrayExpressionElement::Elision(_) => {}
                    element => {
                        if let Some(e) = element.as_expression() {
                            for_each_target(e, f);
                        }
                    }
                }
            }
        }
        Expression::AssignmentExpression(assignment) => {
            if let Some(target) = assignment.left.get_identifier_name() {
                f(assignment.left.span(), target);
            }
        }
        _ => {}
    }
}

impl<'a> Host<'a> for ComponentHost<'_, 'a> {
    fn visit(&self, visitor: &mut HostVisitor<'_, 'a>) {
        if let Some(instance) = self.nested_instance {
            visitor.enter_scope(ScopeFlags::Function, &instance.scope_id);
        }
        // The instance script's `generics`, whose names its body and the template read.
        for (_, parameters) in self.tree.type_parameters() {
            visitor.visit_ts_type_parameter_declaration(parameters);
        }
        if let Some(instance) = self.nested_instance {
            visitor.visit_statements(&instance.body);
        }
        let mut roots = HostRoots {
            host: self,
            visitor,
            open: Vec::new(),
        };
        self.template.replay(&mut roots);
        if self.nested_instance.is_some() {
            visitor.leave_scope();
        }
    }
}

struct HostRoots<'h, 'v, 'w, 't, 'a> {
    host: &'h ComponentHost<'t, 'a>,
    visitor: &'v mut HostVisitor<'w, 'a>,
    /// The scopes entered and not yet left, with the cell the builder stores each id in.
    open: Vec<(TemplateScope, Cell<Option<ScopeId>>)>,
}

impl Roots for HostRoots<'_, '_, '_, '_, '_> {
    fn expression(&mut self, expression: ExpressionIdentifier) {
        self.visitor
            .visit_expression(self.host.tree.get_expression(expression));
    }

    fn bound(&mut self, expression: ExpressionIdentifier) {
        self.expression(expression);
    }

    fn declaration(&mut self, declaration: DeclarationIdentifier) {
        self.visitor
            .visit_variable_declaration(self.host.tree.get_declaration(declaration));
    }

    fn pattern(&mut self, pattern: PatternIdentifier) {
        self.visitor
            .visit_formal_parameter(self.host.tree.get_pattern(pattern));
    }

    fn parameters(&mut self, parameters: ParametersIdentifier) {
        self.visitor
            .visit_formal_parameters(self.host.tree.get_parameters(parameters));
    }

    fn name(&mut self, name: TemplateName) {
        match name {
            TemplateName::Snippet(node) => {
                if let Some(binding) = self.host.names.snippets.get(&node) {
                    self.visitor.declare(binding, SymbolFlags::Function);
                }
            }
            TemplateName::Let(attribute) => {
                for binding in self.host.names.lets.get(&attribute).into_iter().flatten() {
                    self.visitor
                        .declare(binding, SymbolFlags::BlockScopedVariable);
                }
            }
        }
    }

    fn enter(&mut self, scope: TemplateScope) {
        let flags = match scope {
            TemplateScope::Snippet(_) => ScopeFlags::Function,
            _ => ScopeFlags::empty(),
        };
        self.open.push((scope, Cell::new(None)));
        let (_, cell) = self.open.last().expect("just pushed");
        self.visitor.enter_scope(flags, cell);
    }

    fn leave(&mut self) {
        self.visitor.leave_scope();
        let (scope, cell) = self.open.pop().expect("entered before");
        // The pass that only counts nodes sets no id.
        if let Some(id) = cell.get() {
            self.host.scopes.borrow_mut().insert(scope, id);
        }
    }
}
