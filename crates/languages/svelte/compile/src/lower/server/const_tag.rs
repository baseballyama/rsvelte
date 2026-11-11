use crate::lower::server::{CompilerNodeIdentifier, NodeKind, ServerCompilationContext};

impl ServerCompilationContext<'_, '_> {
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
