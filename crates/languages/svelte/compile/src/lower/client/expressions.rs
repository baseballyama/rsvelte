use crate::lower::builder::Runtime;
use oxc_ast::ast::Expression;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{ClientCompilationContext, Memo, Memoized, ScriptRewrite, Target};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// The template expression `e`, rewritten for the client.
    pub(super) fn expression(&self, e: ExpressionIdentifier) -> Expression<'o> {
        self.expression_with_rest_reads(e, true)
    }

    pub(super) fn expression_with_rest_reads(
        &self,
        e: ExpressionIdentifier,
        rest_reads: bool,
    ) -> Expression<'o> {
        self.rewrite(
            self.javascript.get_expression(e).get_inner_expression(),
            rest_reads,
        )
    }

    /// `e`, a node of the component's tree, rewritten for the client.
    pub(super) fn rewrite(&self, e: &Expression<'_>, rest_reads: bool) -> Expression<'o> {
        self.rewriter(rest_reads).expression(e)
    }

    pub(super) fn rewriter(&self, rest_reads: bool) -> ScriptRewrite<'_, 'o> {
        ScriptRewrite {
            b: self.b,
            target: Target::Client,
            accessors: self.custom_element.is_some(),
            rest_reads: rest_reads.then_some(self.rest_reads),
            res: self.res,
            template: Some(&self.reads),
            shadows: Some(&self.shadows),
            stores: self.stores,
            untracked: None,
            invalidates: Some(&self.invalidates),
            primitive: false,
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
            source,
            name,
        });
        if memo.derived {
            self.b.runtime("get", [read])
        } else {
            read
        }
    }
}
