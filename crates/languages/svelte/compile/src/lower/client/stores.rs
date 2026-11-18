use oxc_ast::ast::{BindingPattern, Statement, VariableDeclarationKind};
use oxc_span::SPAN;

use super::ClientCompilationContext;
use crate::lower::builder::Runtime;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream's store setup: `const $name = () => $.store_get(name, '$name', $$stores)` for
    /// each subscription, then `const [$$stores, $$cleanup] = $.setup_stores()`.
    pub(super) fn store_setup(&self) -> Vec<Statement<'o>> {
        let b = self.b;
        if self.stores.is_empty() {
            return Vec::new();
        }
        let rewrite = self.rewriter(false);
        let mut setup: Vec<_> = (self.stores.iter())
            .map(|name| {
                let store = rewrite.store_of(name);
                let get = b.runtime("store_get", [store, b.string(name), b.id("$$stores")]);
                b.const_(name, b.thunk(get))
            })
            .collect();
        let pattern = BindingPattern::new_array_pattern(
            SPAN,
            b.vec([Some(b.binding("$$stores")), Some(b.binding("$$cleanup"))]),
            None::<oxc_allocator::Box<'o, oxc_ast::ast::BindingRestElement<'o>>>,
            b,
        );
        let declarator = b.declarator(pattern, Some(b.runtime("setup_stores", [])));
        setup.push(b.declaration(VariableDeclarationKind::Const, vec![declarator]));
        setup
    }
}
