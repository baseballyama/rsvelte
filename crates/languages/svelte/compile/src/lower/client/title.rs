use crate::lower::builder::Runtime;
use oxc_ast::ast::LogicalOperator;
use rsvelte_svelte_semantic::compiler_syntax_tree::Children;
use rsvelte_svelte_semantic::evaluate::Evaluator;

use super::{ClientCompilationContext, Lists, Memo};

impl<'o> ClientCompilationContext<'_, 'o> {
    pub(super) fn title(&self, children: Children, lists: &mut Lists<'o>) {
        let b = self.b;
        let mut memo = Memo::default();
        let items = &self.plan.fragment(children).items;
        let (mut value, has_state) = self.template_chunk(items, &mut memo, false);
        if !Evaluator::in_scope(self.res, self.scope)
            .evaluate(&value)
            .is_defined
        {
            value = b.logical(value, LogicalOperator::Coalesce, b.string(""));
        }
        let title = b.member(b.member(b.id("$"), "document"), "title");
        let statement = b.stmt(b.assign_member(title, value));
        let (parameters, sync) = memo.into_effect(b);
        let callback = b.arrow_block(parameters, [statement], false);
        let method = if has_state {
            "deferred_template_effect"
        } else {
            "effect"
        };
        lists
            .after
            .push(b.stmt(b.runtime_some(method, vec![Some(callback), sync])));
    }
}
