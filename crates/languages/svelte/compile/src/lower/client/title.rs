use rsvelte_svelte_semantic::compiler_syntax_tree::Children;

use super::{
    AssignmentOperator, ClientCompilationContext, Lists, LogicalOperator, Memo, SourceLocation,
};

impl ClientCompilationContext<'_> {
    pub(super) fn title(&mut self, children: Children, lists: &mut Lists) {
        let mut memo = Memo::default();
        let items = &self.plan.fragment(children).items;
        let (mut value, has_state) = self.template_chunk(items, &mut memo);
        let evaluated = self.res.evaluate_output(
            self.javascript,
            self.source_text,
            &self.out,
            value,
            self.scope,
        );
        if !evaluated.is_defined {
            let empty = self.out.write_string("");
            value = self.out.logical(
                LogicalOperator::Nullish,
                value,
                empty,
                SourceLocation::SYNTHETIC,
            );
        }
        let namespace = self.out.identifier("$");
        let document = self.out.dot(namespace, "document");
        let title = self.out.dot(document, "title");
        let assignment = self.out.assign(
            AssignmentOperator::Assign,
            title,
            value,
            SourceLocation::SYNTHETIC,
        );
        let statement = self.statement(assignment);
        let block = self.out.block(&[statement], SourceLocation::SYNTHETIC);
        let parameters = memo.names(&mut self.out);
        let callback = self
            .out
            .arrow(&parameters, block, false, false, SourceLocation::SYNTHETIC);
        let sync = if memo.values.is_empty() {
            None
        } else {
            let values: Vec<_> = memo
                .values
                .into_iter()
                .map(|value| {
                    self.out
                        .arrow(&[], value, true, false, SourceLocation::SYNTHETIC)
                })
                .collect();
            Some(self.out.array(&values, SourceLocation::SYNTHETIC))
        };
        let call = self.call(
            if has_state {
                "deferred_template_effect"
            } else {
                "effect"
            },
            vec![Some(callback), sync],
        );
        lists.after.push(self.statement(call));
    }
}
