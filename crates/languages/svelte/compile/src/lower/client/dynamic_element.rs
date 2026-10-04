use super::{
    AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, NodeKind, R,
    SourceLocation,
};

impl ClientCompilationContext<'_> {
    pub(super) fn dynamic_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
        lists: &mut Lists,
    ) -> R<()> {
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("an element")
        };
        let attributes = tree.attributes(element.attributes);
        let tag = &tree.attributes[element.this.expect("dynamic tag is validated")];
        let tag = match &tag.value {
            AttributeValue::Static(tag) => self.out.write_string(tag),
            value => self.expression(
                super::super::template::single_expression(value).expect("a validated dynamic tag"),
            ),
        };
        let get_tag = self.thunk(tag);
        let name = self.names.generate("$$element");
        let mut inner = Lists::default();
        let directives = self.element_directives(attributes, "svelte:element", &name)?;
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
                    &mut element_frag,
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
                &mut element_frag,
                &mut inner,
            );
        }
        inner.after.extend(directives.after);
        let mut body = inner.initializer;
        if !inner.update.is_empty() {
            body.push(self.render_statement(&mut element_frag, &inner.update));
        }
        body.extend(inner.after);
        body.extend(self.fragment(element.children)?);
        let callback = (!body.is_empty()).then(|| {
            let block = self.out.block(&body, SourceLocation::SYNTHETIC);
            let element = self.out.identifier(&name);
            let anchor = self.out.identifier("$$anchor");
            self.out.arrow(
                &[element, anchor],
                block,
                false,
                false,
                SourceLocation::SYNTHETIC,
            )
        });
        let namespace = self.dynamic_namespace(attributes);
        let anchor = self.out.identifier(node);
        let foreign = self.plan.namespace(identifier) != crate::render_plan::Namespace::Html;
        let svg = self.out.write_boolean(foreign, SourceLocation::SYNTHETIC);
        let call = self.call(
            "element",
            vec![Some(anchor), Some(get_tag), Some(svg), callback, namespace],
        );
        frag.tpl.push_comment();
        lists.initializer.push(self.statement(call));
        Ok(())
    }

    fn dynamic_namespace(
        &mut self,
        attributes: &[super::Attribute],
    ) -> Option<super::NodeIdentifier> {
        let namespace = attributes.iter().find(|a| {
            a.name.text(self.source_text) == "xmlns"
                && !matches!(a.value, AttributeValue::Static(_))
        });
        namespace.map(|a| {
            let value = self.expression(
                super::super::template::single_expression(&a.value)
                    .expect("a namespace expression"),
            );
            self.out
                .arrow(&[], value, true, false, SourceLocation::SYNTHETIC)
        })
    }
}
