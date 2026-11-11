use crate::lower::builder::Runtime;
use crate::lower::client::{
    AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, ElementKind, Frag, Lists,
    NodeKind, R, check_foreign_element, is_custom_element_node, is_customizable_select,
    is_directive, is_load_error_element, unsupported,
};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `RegularElement`.
    pub(in crate::lower::client) fn element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        if el.kind != ElementKind::Regular {
            return self.special_element(identifier, node, frag, l);
        }
        let tag = el.name.text(self.source_text).to_ascii_lowercase();
        if matches!(tag.as_str(), "script" | "textarea" | "template") {
            return unsupported(&format!("`<{tag}>`"), el.name);
        }
        let custom_element = is_custom_element_node(compiler_syntax_tree, self.source_text, el);
        // Upstream sets a custom element's scoping class as a property, which is not lowered.
        if self.an.scoped[identifier] && custom_element {
            return unsupported("a scoped custom element", el.name);
        }
        if is_customizable_select(compiler_syntax_tree, self.source_text, &tag, el) {
            return unsupported(&format!("rich content in `<{tag}>`"), el.name);
        }
        let namespace = self.plan.namespace(identifier);
        if namespace == crate::render_plan::Namespace::Html {
            check_foreign_element(self.source_text, el.name)?;
        }
        let tag = if namespace == crate::render_plan::Namespace::Html {
            tag
        } else {
            el.name.text(self.source_text).to_owned()
        };
        frag.tpl.push_element(&tag, namespace);
        if tag == "noscript" {
            frag.tpl.pop_element();
            return Ok(());
        }
        let attribute_list = compiler_syntax_tree.attributes(el.attributes);
        frag.tpl.needs_import_node |= tag == "video" || custom_element;
        // Upstream visits directives into their own lists, which follow the children's.
        let mut directives = self.element_directives(attribute_list, &tag, node);
        let has_spread = attribute_list
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Spread(_)));
        // Upstream compares the name as written.
        let remove_defaults = el.name.text(self.source_text) == "input"
            && self.remove_input_defaults(attribute_list, has_spread, node, l);
        if has_spread {
            self.attribute_effect(identifier, &tag, attribute_list, node, remove_defaults, l);
        } else {
            self.element_attributes(identifier, &tag, attribute_list, node, frag, l)?;
        }
        let load_error_events = attribute_list.iter().any(|a| {
            !is_directive(&a.value) && matches!(a.name.text(self.source_text), "onload" | "onerror")
        });
        if is_load_error_element(&tag) && (has_spread || load_error_events) {
            let b = self.b;
            l.after
                .push(b.stmt(b.runtime("replay_events", [b.id(node)])));
        }

        let (snippets, child) =
            self.collecting_snippets(|context| context.element_children(identifier, node, frag));
        let mut child = child?;
        if snippets.is_empty() {
            if self.an.dynamic[identifier] {
                l.initializer.append(&mut child.initializer);
                l.update.append(&mut child.update);
                l.after.append(&mut child.after);
            }
            l.initializer.append(&mut directives.initializer);
            l.after.append(&mut directives.after);
        } else {
            // A block keeps the snippets' names from clashing with the parent's.
            let mut block = snippets;
            block.append(&mut child.initializer);
            block.append(&mut directives.initializer);
            if !child.update.is_empty() {
                block.push(self.render_statement(frag, child.update));
            }
            block.append(&mut child.after);
            block.append(&mut directives.after);
            l.initializer.push(self.b.block(block));
        }
        if attribute_list.iter().any(|a| {
            !is_directive(&a.value)
                && !matches!(a.value, AttributeValue::Spread(_))
                && a.name.text(self.source_text) == "dir"
        }) {
            // Chromium keeps an `auto` direction after the text changes unless it is set again.
            let b = self.b;
            let dir = || b.member(b.id(node), "dir");
            l.update.push(b.stmt(b.assign_member(dir(), dir())));
        }
        if !has_spread {
            self.select_value(el, &tag, attribute_list, node, frag, l);
        }
        frag.tpl.pop_element();
        Ok(())
    }
}
