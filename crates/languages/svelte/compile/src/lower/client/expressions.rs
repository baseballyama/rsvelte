use oxc_ast::ast::Expression;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{ClientCompilationContext, Memo, Memoized};
use crate::input::Target;
use crate::lower::builder::Runtime;
use crate::lower::script::ScriptRewrite;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// The template expression `e`, rewritten for the client.
    pub(super) fn expression(&self, e: ExpressionIdentifier) -> Expression<'o> {
        self.rewrite(self.javascript.get_expression(e).get_inner_expression())
    }

    /// `e`, a node of the component's tree, rewritten for the client.
    pub(super) fn rewrite(&self, e: &Expression<'_>) -> Expression<'o> {
        self.rewriter().expression(e)
    }

    pub(super) fn rewriter(&self) -> ScriptRewrite<'_, 'o> {
        ScriptRewrite {
            accessors: self.custom_element.is_some(),
            template: Some(&self.reads),
            shadows: Some(&self.shadows),
            stores: self.stores,
            invalidates: Some(&self.invalidates),
            ..ScriptRewrite::new(self.b, Target::Client, self.res)
        }
    }

    /// Upstream `Memoizer.add`: `value` stays inline unless `source` calls a function, or holds
    /// state when `if_state`.
    pub(super) fn memoize(
        &self,
        memo: &mut Memo<'o>,
        source: ExpressionIdentifier,
        value: Expression<'o>,
        if_state: bool,
    ) -> Expression<'o> {
        let meta = self.an.meta(source);
        if !(meta.has_call || if_state && meta.has_state) {
            return value;
        }
        let name = format!("${}", memo.entries.len());
        let read = self.b.id(&name);
        memo.entries.push(Memoized {
            value,
            source: Some(source),
            name,
        });
        if memo.derived {
            self.b.runtime("get", [read])
        } else {
            read
        }
    }

    /// `value` memoized whatever it reads, for a value built from several template expressions.
    pub(super) fn memoize_value(
        &self,
        memo: &mut Memo<'o>,
        value: Expression<'o>,
    ) -> Expression<'o> {
        let name = format!("${}", memo.entries.len());
        let read = self.b.id(&name);
        memo.entries.push(Memoized {
            value,
            source: None,
            name,
        });
        if memo.derived {
            self.b.runtime("get", [read])
        } else {
            read
        }
    }
}
