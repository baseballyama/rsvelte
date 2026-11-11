use oxc_ast::ast::{Expression, Statement, VariableDeclarationKind};
use oxc_semantic::{ScopeId, SymbolId};
use rsvelte_svelte_semantic::resolve::TemplateScope;

use super::{ClientCompilationContext, CompilerNodeIdentifier, Element, R};
use crate::lower::builder::Runtime;
use crate::lower::lets::{directives, pattern};
use crate::lower::paths::bound_names;
use crate::lower::script::Read;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `LetDirective` (client): `const x = $.derived(() => $$slotProps.x)`, read through
    /// `$.get`. A pattern keeps its names in one derived object.
    pub(super) fn let_directives(
        &mut self,
        identifier: CompilerNodeIdentifier,
        element: &'o Element,
    ) -> R<Vec<Statement<'o>>> {
        let b = self.b;
        let scope = self.res.template_scope(TemplateScope::Let(identifier));
        let mut statements = Vec::new();
        let directives = directives(
            self.compiler_syntax_tree,
            self.javascript,
            self.source_text,
            element,
        );
        for directive in directives {
            let read = b.member(b.id("$$slotProps"), directive.prop);
            let value = match directive.value {
                None => directive.prop,
                Some(Expression::Identifier(name)) => name.name.as_str(),
                Some(value) => {
                    let pattern = pattern(b, &directive, value)?;
                    let mut names = Vec::new();
                    bound_names(&pattern, false, &mut |binding, _| {
                        names.push(b.str(&binding.name));
                    });
                    let object = self.names.generate(directive.prop);
                    let body = [
                        b.declaration(
                            VariableDeclarationKind::Let,
                            [b.declarator(pattern, Some(read))],
                        ),
                        b.return_(Some(
                            b.object(names.iter().map(|&name| b.init(name, b.id(name)))),
                        )),
                    ];
                    let derived =
                        b.runtime("derived", [b.arrow_block(b.parameters([]), body, false)]);
                    statements.push(b.const_(&object, derived));
                    for name in names {
                        let symbol = self.let_symbol(scope, name);
                        self.reads
                            .insert(symbol, Read::Field(object.as_str().into()));
                    }
                    continue;
                }
            };
            statements.push(b.const_(value, b.runtime("derived", [b.thunk(read)])));
            self.reads.insert(self.let_symbol(scope, value), Read::Get);
        }
        Ok(statements)
    }

    fn let_symbol(&self, scope: Option<ScopeId>, name: &str) -> SymbolId {
        scope
            .and_then(|scope| self.res.scoping().get_binding(scope, name.into()))
            .expect("a `let:` directive declares its names in its element's scope")
    }
}
