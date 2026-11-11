use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::Expression;

use crate::lower::server::{
    AttributeValue, CompilerNodeIdentifier, Element, ElementKind, NodeKind, Piece, R,
    ServerCompilationContext, is_customizable_select, is_void,
};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `RegularElement` + `build_element_attributes` (server, no spread).
    pub(in crate::lower::server) fn element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        if el.kind != ElementKind::Regular {
            return self.special_element(identifier, template);
        }
        let tag = el.name.text(self.source_text).to_ascii_lowercase();
        let namespace = self.plan.namespace(identifier);
        let tag = if namespace == crate::render_plan::Namespace::Html {
            tag
        } else {
            el.name.text(self.source_text).to_owned()
        };
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
        if let Some(text) = self.raw_text(&tag, el) {
            // Upstream pushes a `<script>` or `<style>` as a statement of its own.
            let mut own = vec![Piece::Text(format!("<{tag}"))];
            let attributes = compiler_syntax_tree.attributes(el.attributes);
            self.element_attributes(identifier, &tag, attributes, &mut own);
            own.push(Piece::Text(format!(">{text}</{tag}>")));
            template.extend(self.build_template(own).into_iter().map(Piece::Statement));
            return Ok(());
        }
        let tree = compiler_syntax_tree;
        if !(tree.children(el.children).iter())
            .any(|&c| matches!(tree.node(c).kind, NodeKind::Declaration { .. }))
        {
            return self.markup(identifier, el, &tag, template);
        }
        // Upstream renders an element that holds a declaration tag in a block of its own.
        let outer = std::mem::take(&mut self.snippets);
        let mut own = Vec::new();
        self.markup(identifier, el, &tag, &mut own)?;
        let mut block = std::mem::replace(&mut self.snippets, outer);
        block.extend(self.build_template(own));
        template.push(Piece::Statement(self.b.block(block)));
        Ok(())
    }
}

impl<'o> ServerCompilationContext<'_, 'o> {
    /// The text of a `<script>` or `<style>`, which upstream writes as it is.
    fn raw_text(&self, tag: &str, el: &Element) -> Option<&'o str> {
        if !matches!(tag, "script" | "style") {
            return None;
        }
        match self.compiler_syntax_tree.children(el.children) {
            [] => Some(""),
            &[only] => match &self.compiler_syntax_tree.node(only).kind {
                NodeKind::Text { raw, .. } => Some(raw.text(self.source_text)),
                _ => None,
            },
            _ => None,
        }
    }
}

impl<'o> ServerCompilationContext<'_, 'o> {
    /// The element's tag, attributes and children.
    fn markup(
        &mut self,
        identifier: CompilerNodeIdentifier,
        el: &Element,
        tag: &str,
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        template.push(Piece::Text(format!("<{tag}")));
        self.element_attributes(
            identifier,
            tag,
            compiler_syntax_tree.attributes(el.attributes),
            template,
        );
        let void = is_void(tag);
        template.push(Piece::Text(if void { "/>".into() } else { ">".into() }));

        let cleaned = self.plan.fragment(el.children);
        let body = self.element_body(tag, compiler_syntax_tree.attributes(el.attributes));
        if let Some(body) = body {
            // Upstream renders the children only when the bound content is empty.
            let b = self.b;
            let id = if let Expression::Identifier(_) = body {
                body
            } else {
                let name = self.names.generate("$$body");
                template.push(Piece::Statement(b.const_(&name, body)));
                b.id(&name)
            };
            let mut children = Vec::new();
            self.hoisted_elements(&cleaned.hoisted, |_| false, &mut children)?;
            self.process_children(&cleaned.items, &mut children)?;
            let content = self.build_template(vec![Piece::Expression(id.clone_in(b.allocator()))]);
            let children = self.build_template(children);
            template.push(Piece::Statement(b.if_(
                id,
                b.block(content),
                Some(b.block(children)),
            )));
        } else {
            self.hoisted_elements(&cleaned.hoisted, |_| false, template)?;
            self.process_children(&cleaned.items, template)?;
            // The hydration marker of rich content, which upstream puts after it.
            if matches!(tag, "optgroup" | "select")
                && is_customizable_select(compiler_syntax_tree, self.source_text, el)
            {
                template.push(Piece::Text("<!>".to_owned()));
            }
        }
        if !void {
            template.push(Piece::Text(format!("</{tag}>")));
        }
        Ok(())
    }
}
