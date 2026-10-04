use rsvelte_vue::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind};
use rsvelte_vue::syntax_tree::{DirectiveExpression, DirectiveName};

use super::{Builder, Kind, NodeIdentifier, SYNTHETIC};

impl Builder<'_> {
    pub(super) fn scope(
        &mut self,
        identifier: CompilerNodeIdentifier,
        server: bool,
    ) -> NodeIdentifier {
        let block = self.input.scopes[&identifier];
        let Kind::Block(statements) = self.input.javascript.kind(block) else {
            unreachable!()
        };
        let DirectiveExpression::For(scope) = &self
            .structural(identifier, DirectiveName::For)
            .expect("a declaration scope has bindings")
            .exp
        else {
            unreachable!()
        };
        let mut names = scope.parameters.clone();
        for &statement in statements {
            let Kind::VariableDeclaration { declarations, .. } =
                self.input.javascript.kind(statement)
            else {
                unreachable!()
            };
            names.extend(declarations.iter().flat_map(|&declaration| {
                let Kind::Declarator { identifier, .. } = self.input.javascript.kind(declaration)
                else {
                    unreachable!()
                };
                crate::compilation::patterns::names(&self.input.javascript, identifier)
            }));
        }
        let added: Vec<_> = names
            .into_iter()
            .filter_map(|name| self.resolution.sem.binding_of(name))
            .filter(|&binding| self.loop_bindings.insert(binding))
            .collect();
        let mut body: Vec<_> = statements
            .iter()
            .map(|&statement| self.copy_expression(statement))
            .collect();
        let NodeKind::Element(element) = &self.input.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        let children = self.input.compiler_syntax_tree.children(element.children);
        let result = if server {
            self.server_list(children)
        } else {
            let nodes = self.list(children, &mut body);
            self.to.array(&nodes, SYNTHETIC)
        };
        for binding in added {
            self.loop_bindings.remove(&binding);
        }
        body.push(self.to.return_(Some(result), SYNTHETIC));
        let block = self.to.block(&body, SYNTHETIC);
        let function = self.to.arrow(&[], block, false, false, SYNTHETIC);
        self.to.call0(function, &[])
    }
}
