use std::cell::{Cell, RefCell};

use oxc_ast::ast::Program;
use oxc_semantic::{Host, HostVisitor, ScopeFlags, ScopeId};
use rsvelte_typescript_tree::Tree;
use rsvelte_vue_syntax::syntax_tree::{DirectiveExpression, LoopExpression};
use rustc_hash::FxHashMap;

use crate::compiler_syntax_tree::{
    CompilerNodeIdentifier, CompilerSyntaxTree, NodeKind, PropertyKind,
};

/// The setup script, when a module script is the root program, and the template, evaluated inside
/// the setup script's top-level scope.
pub(super) struct TemplateHost<'t, 'a> {
    pub(super) tree: &'a Tree,
    pub(super) nested_setup: Option<&'a Program<'a>>,
    pub(super) compiler_syntax_tree: Option<&'t CompilerSyntaxTree>,
    /// The scopes the `v-for` elements opened, once the builder has visited the template.
    pub(super) for_scopes: RefCell<FxHashMap<CompilerNodeIdentifier, ScopeId>>,
}

impl<'a> Host<'a> for TemplateHost<'_, 'a> {
    fn visit(&self, visitor: &mut HostVisitor<'_, 'a>) {
        if let Some(setup) = self.nested_setup {
            visitor.enter_scope(ScopeFlags::Function, &setup.scope_id);
            visitor.visit_statements(&setup.body);
        }
        if let Some(compiler_syntax_tree) = self.compiler_syntax_tree {
            rsvelte_kernel::performance::stack::grow(|| {
                for &n in compiler_syntax_tree.root() {
                    self.node(compiler_syntax_tree, n, visitor);
                }
            });
        }
        if self.nested_setup.is_some() {
            visitor.leave_scope();
        }
    }
}

impl<'a> TemplateHost<'_, 'a> {
    fn node(
        &self,
        compiler_syntax_tree: &CompilerSyntaxTree,
        n: CompilerNodeIdentifier,
        visitor: &mut HostVisitor<'_, 'a>,
    ) {
        match &compiler_syntax_tree.node(n).kind {
            NodeKind::Text(_) | NodeKind::Comment { .. } => {}
            &NodeKind::Interpolation { expression } => {
                visitor.visit_expression(self.tree.get_expression(expression));
            }
            NodeKind::Element(el) => {
                let props = compiler_syntax_tree.props(el.props);
                let for_expression = props.iter().find_map(|p| match &p.kind {
                    PropertyKind::Directive(d) => match d.exp {
                        DirectiveExpression::For(f) => Some(f),
                        _ => None,
                    },
                    PropertyKind::Attribute { .. } => None,
                });
                // vue-eslint-parser: the aliases are visible on the whole element.
                let scope = Cell::new(None);
                if let Some(LoopExpression { parameters, source }) = for_expression {
                    visitor.visit_expression(self.tree.get_expression(source));
                    visitor.enter_scope(ScopeFlags::empty(), &scope);
                    visitor.visit_formal_parameters(self.tree.get_parameters(parameters));
                }
                for p in props {
                    if let PropertyKind::Directive(d) = &p.kind
                        && let DirectiveExpression::Expression(e) = d.exp
                    {
                        visitor.visit_expression(self.tree.get_expression(e));
                    }
                }
                for &child in compiler_syntax_tree.children(el.children) {
                    self.node(compiler_syntax_tree, child, visitor);
                }
                if for_expression.is_some() {
                    visitor.leave_scope();
                    // The pass that only counts nodes sets no id.
                    if let Some(id) = scope.get() {
                        self.for_scopes.borrow_mut().insert(n, id);
                    }
                }
            }
        }
    }
}
