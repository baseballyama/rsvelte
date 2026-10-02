use crate::lower::server::{
    AttributeValue, CompilerNodeIdentifier, ElementKind, NodeKind, Piece, R,
    ServerCompilationContext, check_foreign_element, is_customizable_select, is_void, unsupported,
};

impl ServerCompilationContext<'_> {
    /// Upstream `RegularElement` + `build_element_attributes` (server, no spread).
    pub(in crate::lower::server) fn element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        if el.kind != ElementKind::Regular {
            return unsupported("a component, `<slot>` or `svelte:` element", el.name);
        }
        let tag = el.name.text(self.source_text).to_ascii_lowercase();
        if matches!(
            tag.as_str(),
            "svg" | "math" | "script" | "style" | "textarea" | "template"
        ) || tag.contains('-')
        {
            return unsupported(&format!("`<{tag}>`"), el.name);
        }
        if is_customizable_select(compiler_syntax_tree, self.source_text, &tag, el) {
            return unsupported(&format!("rich content in `<{tag}>`"), el.name);
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
}
