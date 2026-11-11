use rsvelte_typescript_tree::DeclarationIdentifier;

use crate::lower::names::Names;
use crate::lower::script;
use crate::lower::server::{CompilerNodeIdentifier, NodeKind, ServerCompilationContext};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `DeclarationTag` (server): declared with the fragment's `{@const}`s.
    pub(super) fn declaration_tag(
        &mut self,
        declaration: DeclarationIdentifier,
    ) -> Vec<oxc_ast::ast::Statement<'o>> {
        let declaration = self.javascript.get_declaration(declaration);
        let mut names = std::mem::replace(&mut self.names, Names::empty());
        let lowered = script::lower_declaration_tag(&mut self.rewrite(), declaration, &mut names);
        self.names = names;
        lowered
    }

    /// Upstream `ConstTag` (server): `const x = init`, declared before the fragment's markup.
    pub(super) fn const_tag(&mut self, identifier: CompilerNodeIdentifier) {
        let b = self.b;
        let NodeKind::Const { declaration } = self.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!("a const tag")
        };
        let d = &self.javascript.get_declaration(declaration).declarations[0];
        let mut rewrite = self.rewrite();
        let mut declarator = rewrite.declarator(d);
        if let Some(init) = &mut declarator.init {
            *init = std::mem::replace(init, b.null()).into_inner_expression();
        }
        let declaration = b.declaration(
            oxc_ast::ast::VariableDeclarationKind::Const,
            vec![declarator],
        );
        self.snippets.push(declaration);
    }
}
