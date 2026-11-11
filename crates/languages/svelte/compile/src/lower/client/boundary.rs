use super::{ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, NodeKind, R};

impl<'o> ClientCompilationContext<'_, 'o> {
    pub(super) fn boundary(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag<'o>,
        lists: &mut Lists<'o>,
    ) -> R<()> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("a boundary element")
        };
        let mut properties = Vec::new();
        for attribute in tree.attributes(element.attributes) {
            let expression = super::super::template::single_expression(&attribute.value)
                .expect("boundary attributes are validated");
            let value = self.expression(expression);
            let name = attribute.name.text(self.source_text);
            let property = if self.an.meta(expression).has_state {
                b.getter(name, value)
            } else {
                b.init(name, value)
            };
            properties.push(property);
        }
        let mut declarations = Vec::new();
        for &child in &self.plan.fragment(element.children).hoisted {
            if let NodeKind::Snippet(snippet) = &tree.node(child).kind {
                declarations.push(self.snippet_declaration(snippet)?);
                let name = self.snippet_name(snippet);
                if matches!(name, "failed" | "pending") {
                    properties.push(b.init(name, b.id(name)));
                }
            }
        }
        let props = b.object(properties);
        let body = self.fragment_without(element.children, |_| true)?;
        let callback = b.arrow_block(b.params(["$$anchor"]), body, false);
        let statement = b.stmt(b.runtime("boundary", [b.id(node), props, callback]));
        let statement = if declarations.is_empty() {
            statement
        } else {
            declarations.push(statement);
            b.block(declarations)
        };
        frag.tpl.push_comment();
        lists.initializer.push(statement);
        Ok(())
    }
}
