use std::borrow::Cow;

use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::Expression;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    AttributeValue, CompilerNodeIdentifier, Element, ElementKind, NodeKind,
};
use rsvelte_svelte_syntax::parse::is_void;

use crate::lower::attributes::{is_customizable_select, lowercase};
use crate::lower::server::template::Template;
use crate::lower::server::{R, ServerCompilationContext};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `RegularElement` + `build_element_attributes` (server, no spread).
    pub(in crate::lower::server) fn element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Template<'_, 'o>,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        if el.kind != ElementKind::Regular {
            return self.special_element(identifier, template);
        }
        let name = el.name.text(self.source_text);
        let tag = if self.plan.namespace(identifier) == crate::render_plan::Namespace::Html {
            lowercase(name)
        } else {
            Cow::Borrowed(name)
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
            let mut own = Template::new(self.b);
            own.text_fmt(format_args!("<{tag}"));
            let attributes = compiler_syntax_tree.attributes(el.attributes);
            self.element_attributes(identifier, &tag, attributes, &mut own);
            own.text_fmt(format_args!(">{text}</{tag}>"));
            template.statements(own.finish());
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
        let mut own = Template::new(self.b);
        self.markup(identifier, el, &tag, &mut own)?;
        let mut block = std::mem::replace(&mut self.snippets, outer);
        block.extend(own.finish());
        template.statement(self.b.block(block));
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
        template: &mut Template<'_, 'o>,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        template.text_fmt(format_args!("<{tag}"));
        self.element_attributes(
            identifier,
            tag,
            compiler_syntax_tree.attributes(el.attributes),
            template,
        );
        let void = is_void(tag);
        template.text(if void { "/>" } else { ">" });

        let cleaned = self.plan.fragment(el.children);
        let body = self.element_body(tag, compiler_syntax_tree.attributes(el.attributes));
        if let Some(body) = body {
            // Upstream renders the children only when the bound content is empty.
            let b = self.b;
            let id = if let Expression::Identifier(_) = body {
                body
            } else {
                let name = self.names.generate("$$body");
                template.statement(b.const_(&name, body));
                b.id(&name)
            };
            let mut children = Template::new(b);
            self.hoisted_elements(&cleaned.hoisted, |_| false, &mut children)?;
            self.process_children(&cleaned.items, &mut children)?;
            let mut content = Template::new(b);
            content.expression(id.clone_in(b.allocator()));
            let (content, children) = (content.finish(), children.finish());
            template.statement(b.if_(id, b.block(content), Some(b.block(children))));
        } else {
            self.hoisted_elements(&cleaned.hoisted, |_| false, template)?;
            self.process_children(&cleaned.items, template)?;
            // The hydration marker of rich content, which upstream puts after it.
            if matches!(tag, "optgroup" | "select")
                && is_customizable_select(compiler_syntax_tree, self.source_text, el)
            {
                template.text("<!>");
            }
        }
        if !void {
            template.text_fmt(format_args!("</{tag}>"));
        }
        Ok(())
    }
}
