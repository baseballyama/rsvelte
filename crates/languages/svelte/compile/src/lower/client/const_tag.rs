use oxc_ast::ast::BindingPattern;

use crate::lower::builder::Runtime;
use crate::lower::client::{ClientCompilationContext, CompilerNodeIdentifier, Lists, NodeKind};
use crate::lower::script::Read;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `ConstTag` (client): `const x = $.derived(() => init)`, read through `$.get`.
    pub(super) fn const_tag(&mut self, identifier: CompilerNodeIdentifier, l: &mut Lists<'o>) {
        let b = self.b;
        let NodeKind::Const { declaration } = self.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!("a const tag")
        };
        let d = &self.javascript.get_declaration(declaration).declarations[0];
        let BindingPattern::BindingIdentifier(id) = &d.id else {
            unreachable!("coverage refuses a destructured `{{@const}}`")
        };
        let init = d.init.as_ref().expect("a `{@const}` has an initializer");
        let value = self.rewrite(init.get_inner_expression(), true);
        l.consts
            .push(b.const_(&id.name, b.runtime("derived", [b.thunk(value)])));
        self.reads.insert(id.symbol_id(), Read::Get);
    }
}
