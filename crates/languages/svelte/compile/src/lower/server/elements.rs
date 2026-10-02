use super::{
    AttributeValue, CompilerNodeIdentifier, Diagnostic, Element, ElementKind, NodeKind, Piece, R,
    ServerCompilationContext, SourceLocation, call_arguments, check_foreign_element,
    is_customizable_select, is_void, synthetic_value,
};

impl ServerCompilationContext<'_> {
    /// Upstream `RegularElement` + `build_element_attributes` (server, no spread).
    pub(super) fn element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        if el.kind != ElementKind::Regular {
            return Err(Diagnostic::error(
                "unsupported",
                "components, `<slot>` and `svelte:` elements are not supported yet",
                el.name,
            ));
        }
        let tag = el.name.text(self.source_text).to_ascii_lowercase();
        if matches!(
            tag.as_str(),
            "svg" | "math" | "script" | "style" | "textarea" | "template"
        ) || tag.contains('-')
        {
            return Err(Diagnostic::error(
                "unsupported",
                format!("`<{tag}>` is not supported yet"),
                el.name,
            ));
        }
        if is_customizable_select(compiler_syntax_tree, self.source_text, &tag, el) {
            return Err(Diagnostic::error(
                "unsupported",
                format!("rich content in `<{tag}>` is not supported yet"),
                el.name,
            ));
        }
        check_foreign_element(self.source_text, el.name)?;
        let select_special = tag == "select"
            && compiler_syntax_tree
                .attributes(el.attributes)
                .iter()
                .any(|a| match a.value {
                    AttributeValue::Spread(_) => true,
                    AttributeValue::Attach(_) | AttributeValue::Class(_) => false,
                    _ => {
                        let name = a.name.text(self.source_text);
                        name == "value" || name.eq_ignore_ascii_case("defaultvalue")
                    }
                });
        if select_special || tag == "option" {
            return self.select_element(identifier, el, &tag, template);
        }
        template.push(Piece::Text(format!("<{tag}")));
        self.element_attributes(
            identifier,
            &tag,
            compiler_syntax_tree.attributes(el.attributes),
            template,
        )?;
        let void = is_void(&tag);
        template.push(Piece::Text(if void { "/>".into() } else { ">".into() }));
        let cleaned = self.plan.fragment(el.children);
        self.process_children(&cleaned.items, template)?;
        if !void {
            template.push(Piece::Text(format!("</{tag}>")));
        }
        Ok(())
    }

    /// Upstream `RegularElement`'s `is_select_special` / `is_option_special` branches: the
    /// renderer writes the element, so it can mark the selected option.
    pub(super) fn select_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        el: &Element,
        tag: &str,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let body = if let Some(e) = synthetic_value(compiler_syntax_tree, self.source_text, tag, el)
        {
            self.expression(e)
        } else {
            let cleaned = self.plan.fragment(el.children);
            let mut inner = Vec::new();
            self.process_children(&cleaned.items, &mut inner)?;
            let statements = self.build_template(inner);
            let block = self.out.block(&statements, SourceLocation::SYNTHETIC);
            let param = self.out.identifier("$$renderer");
            self.out
                .arrow(&[param], block, false, false, SourceLocation::SYNTHETIC)
        };
        let (mut arguments, _) = self.spread_args(
            identifier,
            tag,
            compiler_syntax_tree.attributes(el.attributes),
            true,
        )?;
        arguments.insert(1, Some(body));
        let arguments = call_arguments(&mut self.out, arguments);
        let r = self.out.identifier("$$renderer");
        let callee = self.out.dot(r, tag);
        let call = self
            .out
            .call(callee, &arguments, false, SourceLocation::SYNTHETIC);
        template.push(Piece::Statement(self.out.expression_statement(call)));
        Ok(())
    }
}
