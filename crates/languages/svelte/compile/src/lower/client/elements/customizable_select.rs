use oxc_ast::ast::Statement;

use crate::lower::builder::Runtime;
use crate::lower::client::{ClientCompilationContext, Frag, Item, Lists, Memo, Prev, R};
use crate::render_plan::Namespace;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `RegularElement`'s branch for a `<select>`, `<optgroup>` or `<option>` with rich
    /// content: the content gets a template of its own, which only a browser that keeps rich
    /// options mounts (`$.customizable_select`).
    pub(super) fn customizable_select(
        &mut self,
        items: &[Item<'_>],
        node: &str,
        tag: &str,
        namespace: Namespace,
        frag: &mut Frag<'o>,
    ) -> R<Statement<'o>> {
        let b = self.b;
        // The hydration marker that `$.child` finds inside the element.
        frag.tpl.push_comment();
        let fragment = self.names.generate("fragment");
        let anchor = self.names.generate("anchor");
        let mut content = Frag {
            memo: Memo {
                entries: Vec::new(),
                derived: frag.memo.derived,
            },
            ..Frag::default()
        };
        let mut lists = Lists::default();
        let initial = Prev::Call {
            method: "first_child",
            of: fragment.clone(),
            content: false,
        };
        self.process_children(items, initial, false, &mut content, &mut lists)?;
        let name = format!("{tag}_content");
        let template = self.transform_template(
            &content.tpl,
            namespace,
            &name,
            super::super::fragments::TEMPLATE_FRAGMENT,
        );
        let mut body = vec![
            b.var(&anchor, b.runtime("child", [b.id(node)])),
            b.var(&fragment, b.call(template, [])),
        ];
        body.append(&mut lists.initializer);
        if !lists.update.is_empty() {
            body.push(self.render_statement(&mut content, lists.update));
        }
        body.append(&mut lists.after);
        body.push(b.statement(b.runtime("append", [b.id(&anchor), b.id(&fragment)])));
        let callback = b.arrow_block(b.parameters([]), body, false);
        Ok(b.statement(b.runtime("customizable_select", [b.id(node), callback])))
    }
}
