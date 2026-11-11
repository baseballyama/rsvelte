use oxc_ast::ast::BinaryOperator;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{
    AttributeValue, Children, Helper, Item, NodeKind, Parent, R, Span, Template, clean_nodes,
    unsupported, vue,
};

impl Template<'_, '_, '_> {
    /// The options of a bound `<select>`, each an `<option>` with a static `value`; on the server
    /// each is `selected` when the value is the bound one (`===`, as Svelte's renderer compares).
    pub(super) fn options(
        &mut self,
        children: Children,
        select: vue::CompilerNodeIdentifier,
        target: ExpressionIdentifier,
        at: Span,
        multiple: bool,
    ) -> R<vue::Children> {
        let b = self.b;
        let (compiler_syntax_tree, source_text) = (self.i.compiler_syntax_tree, self.i.source_text);
        let items = clean_nodes(
            compiler_syntax_tree,
            source_text,
            Parent::Element("select"),
            compiler_syntax_tree.children(children),
            false,
            false,
        )
        .items;
        let mut out = Vec::with_capacity(items.len());
        for item in &items {
            let &Item::Node(identifier) = item else {
                return Err(unsupported(
                    "a bound <select> with content other than options",
                    at,
                ));
            };
            let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
                return Err(unsupported("a block in a bound <select>", at));
            };
            let value = compiler_syntax_tree
                .attributes(el.attributes)
                .iter()
                .find(|a| a.name.text(source_text) == "value")
                .map(|a| &a.value);
            let (true, Some(AttributeValue::Static(value))) =
                (el.name.text(source_text) == "option", value)
            else {
                return Err(unsupported(
                    "a bound <select> with content other than options with a static `value`",
                    el.name,
                ));
            };
            let extra = self.i.server.then(|| {
                let x = self.binding_read(target);
                let test = if multiple {
                    self.helpers.insert(Helper::Select);
                    self.call("$$selected", [x, b.string(value)])
                } else {
                    b.binary(x, BinaryOperator::StrictEquality, b.string(value))
                };
                self.bound("selected", el.name, test, el.name)
            });
            out.push(self.element(identifier, Some(select), false, Vec::new(), extra)?);
        }
        Ok(self.vb.children(&out))
    }
}
