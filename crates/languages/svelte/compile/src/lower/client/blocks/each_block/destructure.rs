use oxc_ast::ast::{BindingPattern, Statement};
use oxc_semantic::SymbolId;

use crate::lower::builder::Runtime;
use crate::lower::client::snippets::Hooks;
use crate::lower::client::{ClientCompilationContext, Read};
use crate::lower::paths::{Paths, bound_names};

/// The names a destructuring context binds, and whether a default value applies to each.
pub(super) fn names(pattern: &BindingPattern<'_>) -> Vec<(SymbolId, bool)> {
    let mut names = Vec::new();
    bound_names(pattern, false, &mut |binding, default| {
        names.push((binding.symbol_id.get().expect("a bound name"), default));
    });
    names
}

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream reads each name through a thunk, or a derived when a default applies, and keeps
    /// an array the pattern destructures in a derived.
    pub(super) fn destructure(
        &mut self,
        pattern: &'o BindingPattern<'o>,
        reactive: bool,
        declarations: &mut Vec<Statement<'o>>,
    ) {
        let b = self.b;
        for (symbol, _) in names(pattern) {
            self.reads.insert(symbol, Read::Plain);
        }
        let item = b.id("$$item");
        let item = if reactive {
            b.runtime("get", [item])
        } else {
            item
        };
        let mut paths = Vec::new();
        let mut walker = Paths {
            b,
            res: self.res,
            hooks: Hooks {
                context: self,
                declarations,
            },
        };
        walker.extract(pattern, item, false, &mut paths);
        for path in paths {
            let mut value = b.thunk(path.value);
            if path.default {
                value = b.runtime("derived_safe_equal", [value]);
            }
            declarations.push(b.let_(&path.binding.name, Some(value)));
        }
    }
}
