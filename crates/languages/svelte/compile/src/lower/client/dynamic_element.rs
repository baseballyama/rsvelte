use oxc_ast::ast::Expression;

use super::{
    Attribute, AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists,
    NodeKind, R,
};

impl<'o> ClientCompilationContext<'_, 'o> {
    pub(super) fn dynamic_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag<'o>,
        lists: &mut Lists<'o>,
    ) -> R<()> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("an element")
        };
        let attributes = tree.attributes(element.attributes);
        let tag = &tree.attributes[element.this.expect("dynamic tag is validated")];
        let tag = match &tag.value {
            AttributeValue::Static(tag) => b.string(tag),
            value => self.expression(
                super::super::template::single_expression(value).expect("a validated dynamic tag"),
            ),
        };
        let get_tag = b.thunk(tag);
        let name = self.names.generate("$$element");
        let mut inner = Lists::default();
        let directives = self.element_directives(attributes, "svelte:element", &name);
        inner.initializer.extend(directives.initializer);
        let classes: Vec<_> = attributes
            .iter()
            .filter(|a| matches!(a.value, AttributeValue::Class(_)))
            .collect();
        let mut element_frag = Frag::default();
        let mut actual = attributes.iter().filter(|a| {
            !matches!(
                a.value,
                AttributeValue::Bind(_)
                    | AttributeValue::Attach(_)
                    | AttributeValue::Class(_)
                    | AttributeValue::On { .. }
            )
        });
        let first = actual.next();
        if let Some(attribute) = first {
            if actual.next().is_none()
                && attribute
                    .name
                    .text(self.source_text)
                    .eq_ignore_ascii_case("class")
                && matches!(attribute.value, AttributeValue::Static(_))
            {
                self.set_class(
                    identifier,
                    &name,
                    Some(attribute),
                    &classes,
                    &mut element_frag.memo,
                    &mut inner,
                );
            } else {
                self.attribute_effect(
                    identifier,
                    "svelte:element",
                    attributes,
                    &name,
                    false,
                    &mut inner,
                );
            }
        }
        if first.is_none() && (!classes.is_empty() || self.an.scoped[identifier]) {
            self.set_class(
                identifier,
                &name,
                None,
                &classes,
                &mut element_frag.memo,
                &mut inner,
            );
        }
        inner.after.extend(directives.after);
        let mut body = inner.initializer;
        if !inner.update.is_empty() {
            body.push(self.render_statement(&mut element_frag, inner.update));
        }
        body.extend(inner.after);
        body.extend(self.fragment(element.children)?);
        let callback = (!body.is_empty())
            .then(|| b.arrow_block(b.params([name.as_str(), "$$anchor"]), body, false));
        let namespace = self.dynamic_namespace(attributes);
        let foreign = self.plan.namespace(identifier) != crate::render_plan::Namespace::Html;
        let call = b.runtime_some(
            "element",
            vec![
                Some(b.id(node)),
                Some(get_tag),
                Some(b.boolean(foreign)),
                callback,
                namespace,
            ],
        );
        frag.tpl.push_comment();
        lists.initializer.push(b.stmt(call));
        Ok(())
    }

    fn dynamic_namespace(&self, attributes: &[Attribute]) -> Option<Expression<'o>> {
        let namespace = attributes.iter().find(|a| {
            a.name.text(self.source_text) == "xmlns"
                && !matches!(a.value, AttributeValue::Static(_))
        });
        namespace.map(|a| {
            let value = self.expression(
                super::super::template::single_expression(&a.value)
                    .expect("a namespace expression"),
            );
            self.b.arrow(self.b.params([]), value)
        })
    }
}
