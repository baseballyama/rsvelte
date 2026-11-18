use oxc_ast::ast::{ArrowFunctionBody, Expression, Statement};
use oxc_semantic::SymbolId;
use rsvelte_vue_semantic::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind};
use rsvelte_vue_syntax::syntax_tree::{DirectiveExpression, DirectiveName};

use super::{Body, Emitter};

impl<'o> Emitter<'_, 'o> {
    /// A `$$Scope`: its declarations, then its children, in a block of their own.
    pub(super) fn scope(
        &mut self,
        identifier: CompilerNodeIdentifier,
        server: bool,
    ) -> Expression<'o> {
        let b = self.b;
        let DirectiveExpression::For(scope) = &self
            .structural(identifier, DirectiveName::For)
            .expect("a declaration scope has bindings")
            .exp
        else {
            unreachable!("a scope's directive is a loop")
        };
        let Expression::ArrowFunctionExpression(source) = self.source(scope.source) else {
            unreachable!("a scope's source is its declarations")
        };
        let ArrowFunctionBody::FunctionBody(declarations) = &source.body else {
            unreachable!("a scope's declarations are a block")
        };
        let parameters = self.res.tree().get_parameters(scope.parameters);
        let mut names: Vec<SymbolId> = parameters
            .items
            .iter()
            .flat_map(|p| p.pattern.get_binding_identifiers())
            .filter_map(|id| id.symbol_id.get())
            .collect();
        for statement in &declarations.statements {
            let Statement::VariableDeclaration(d) = statement else {
                unreachable!("a scope declares")
            };
            names.extend(
                d.declarations
                    .iter()
                    .flat_map(|d| d.id.get_binding_identifiers())
                    .filter_map(|id| id.symbol_id.get()),
            );
        }
        let added: Vec<_> = names
            .into_iter()
            .filter(|&symbol| self.cells.insert(symbol))
            .collect();
        let mut body = Body::default();
        for statement in &declarations.statements {
            let statement = self.copy_statement(statement);
            body.push(statement);
        }
        let NodeKind::Element(element) = &self.tree.node(identifier).kind else {
            unreachable!("a scope is an element")
        };
        let children = self.tree.children(element.children);
        let result = if server {
            self.server_list(children)
        } else {
            let nodes = self.list(children, &mut body);
            b.array(nodes)
        };
        for symbol in added {
            self.cells.remove(&symbol);
        }
        let mut statements = body.finish(b);
        statements.push(b.return_(Some(result)));
        self.run(statements, false)
    }
}
