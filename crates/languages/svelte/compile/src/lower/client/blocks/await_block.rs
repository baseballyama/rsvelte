use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{BindingPattern, Statement, VariableDeclarationKind};
use oxc_ast_visit::VisitMut;
use rsvelte_svelte_semantic::compiler_syntax_tree::Children;
use rsvelte_svelte_semantic::resolve::TemplateScope;
use rsvelte_typescript_tree::PatternIdentifier;

use crate::lower::builder::Runtime;
use crate::lower::client::{
    ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, NodeKind, R, Read,
};
use crate::lower::paths::bound_names;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `AwaitBlock` (client): `$.await(node, () => promise, pending, then, catch)`.
    pub(in crate::lower::client) fn await_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) -> R<()> {
        let b = self.b;
        frag.tpl.push_comment();
        let NodeKind::Await(block) = &self.compiler_syntax_tree.node(identifier).kind else {
            unreachable!("an await block")
        };
        let promise = b.thunk(self.expression(block.expression));
        let then = match block.then() {
            Some(then) => {
                Some(self.await_branch(then, block.value, TemplateScope::Then(identifier))?)
            }
            None => None,
        };
        let catch = match block.catch() {
            Some(catch) => {
                Some(self.await_branch(catch, block.error, TemplateScope::Catch(identifier))?)
            }
            None => None,
        };
        // Upstream lowers the pending branch last.
        let pending = match block.pending() {
            Some(pending) => {
                let body = self.fragment(pending)?;
                self.anchor_arrow(body)
            }
            None => b.null(),
        };
        let call = b.runtime_some(
            "await",
            vec![Some(b.id(node)), Some(promise), Some(pending), then, catch],
        );
        l.initializer.push(b.stmt(call));
        Ok(())
    }

    /// A `{:then}` or `{:catch}` branch: its value is read from a derived, and a destructured
    /// one from `$$source` through one derived per name.
    fn await_branch(
        &mut self,
        body: Children,
        value: Option<PatternIdentifier>,
        scope: TemplateScope,
    ) -> R<oxc_ast::ast::Expression<'o>> {
        let b = self.b;
        let outer = self.scope;
        if let Some(scope) = self.res.template_scope(scope) {
            self.scope = scope;
        }
        let mut parameters = vec!["$$anchor".to_owned()];
        let mut declarations = Vec::new();
        let mut symbols = Vec::new();
        if let Some(value) = value {
            let pattern = &self.javascript.get_pattern(value).pattern;
            if let BindingPattern::BindingIdentifier(id) = pattern {
                parameters.push(id.name.to_string());
                symbols.push(id.symbol_id());
            } else {
                parameters.push("$$source".to_owned());
                declarations = self.await_destructure(pattern, &mut symbols);
            }
            for &symbol in &symbols {
                self.reads.insert(symbol, Read::Get);
            }
        }
        let fragment = self.fragment(body);
        for symbol in &symbols {
            self.reads.remove(symbol);
        }
        self.scope = outer;
        declarations.extend(fragment?);
        let parameters = b.params(parameters.iter().map(String::as_str));
        Ok(b.arrow_block(parameters, declarations, false))
    }

    /// Upstream `create_derived_block_argument` for a pattern.
    fn await_destructure(
        &mut self,
        pattern: &BindingPattern<'_>,
        symbols: &mut Vec<oxc_semantic::SymbolId>,
    ) -> Vec<Statement<'o>> {
        let b = self.b;
        let mut names = Vec::new();
        bound_names(pattern, false, &mut |binding, _| names.push(binding));
        for binding in &names {
            symbols.push(binding.symbol_id());
            self.reads.insert(binding.symbol_id(), Read::Plain);
        }
        let mut cloned = pattern.clone_in_with_semantic_ids(b.allocator());
        self.rewriter(true).visit_binding_pattern(&mut cloned);
        let object = b.object(names.iter().map(|n| b.init(&n.name, b.id(&n.name))));
        let source = b.runtime("get", [b.id("$$source")]);
        let body = vec![
            b.declaration(
                VariableDeclarationKind::Var,
                [b.declarator(cloned, Some(source))],
            ),
            b.return_(Some(object)),
        ];
        let derived = b.runtime("derived", [b.arrow_block(b.params([]), body, false)]);
        let mut declarations =
            vec![b.declare(VariableDeclarationKind::Var, "$$value", Some(derived))];
        for binding in names {
            let read = b.member(b.runtime("get", [b.id("$$value")]), &binding.name);
            let derived = b.runtime("derived", [b.thunk(read)]);
            declarations.push(b.declare(
                VariableDeclarationKind::Var,
                &binding.name,
                Some(derived),
            ));
        }
        declarations
    }
}
