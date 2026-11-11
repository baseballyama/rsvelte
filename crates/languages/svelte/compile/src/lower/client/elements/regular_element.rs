use crate::lower::builder::Runtime;
use crate::lower::client::{
    AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, ElementKind, Frag, Lists,
    Memo, NodeKind, R, is_custom_element_node, is_directive, is_load_error_element,
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
        let mut lets = self.let_directives(identifier, el)?;
        l.lets.append(&mut lets);
        let tag = el.name.text(self.source_text).to_ascii_lowercase();
        let custom_element = is_custom_element_node(compiler_syntax_tree, self.source_text, el);
        let is_markup = self.is_markup(identifier);
        let tag = if is_markup {
            tag
        } else {
            el.name.text(self.source_text).to_owned()
        };
        frag.tpl.push_element(&tag, is_markup);
        if tag == "noscript" {
            frag.tpl.pop_element();
            return Ok(());
        }
        let attribute_list = compiler_syntax_tree.attributes(el.attributes);
        frag.tpl.needs_import_node |= tag == "video" || custom_element;
        // Upstream visits directives into their own lists, which follow the children's.
        let directives =
            self.element_directives(attribute_list, &tag, node, Some(&mut l.initializer));
        let has_spread = attribute_list
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Spread(_)));
        // Upstream compares the name as written.
        let remove_defaults = el.name.text(self.source_text) == "input"
            && self.remove_input_defaults(attribute_list, has_spread, node, l);
        if tag == "textarea" {
            self.remove_textarea_child(attribute_list, has_spread, node, l);
        }
        if let Some(AttributeValue::Static(v)) = self
            .template_is(identifier, attribute_list)
            .map(|a| &a.value)
        {
            frag.tpl.set_prop("is", Some(v.to_string()));
        }
        if has_spread {
            self.attribute_effect(identifier, &tag, attribute_list, node, remove_defaults, l);
        } else {
            self.element_attributes(identifier, &tag, attribute_list, node, frag, l)?;
        }
        let load_error_events = attribute_list.iter().any(|a| {
            !is_directive(&a.value) && matches!(a.name.text(self.source_text), "onload" | "onerror")
        });
        let has_use = attribute_list
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Use { .. }));
        if is_load_error_element(&tag) && (has_spread || has_use || load_error_events) {
            let b = self.b;
            l.after
                .push(b.statement(b.runtime("replay_events", [b.id(node)])));
        }

        self.element_body(identifier, node, directives, frag, l)?;
        if attribute_list.iter().any(|a| {
            !is_directive(&a.value)
                && !matches!(a.value, AttributeValue::Spread(_))
                && a.name.text(self.source_text) == "dir"
        }) {
            // Chromium keeps an `auto` direction after the text changes unless it is set again.
            let b = self.b;
            let dir = || b.member(b.id(node), "dir");
            l.update.push(b.statement(b.assign_member(dir(), dir())));
        }
        if tag == "selectedcontent" {
            let b = self.b;
            let assign = b.arrow(
                b.parameters(["$$element"]),
                b.assign_name(node, b.id("$$element")),
            );
            let call = b.runtime("selectedcontent", [b.id(node), assign]);
            l.initializer.push(b.statement(call));
        }
        if !has_spread {
            self.select_value(el, &tag, attribute_list, node, frag, l);
        }
        frag.tpl.pop_element();
        Ok(())
    }

    /// The children and directives, in a block of their own when the element holds a snippet or
    /// a declaration tag.
    fn element_body(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        mut directives: Lists<'o>,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) -> R<()> {
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &tree.node(identifier).kind else {
            unreachable!("a regular element")
        };
        // The children's block has an effect of its own, so its values must not join the
        // parent's: upstream shares one memoizer and leaks them into both effects.
        let holds = |f: fn(&NodeKind) -> bool| {
            (tree.children(el.children).iter()).any(|&c| f(&tree.node(c).kind))
        };
        let holds_snippet = holds(|k| matches!(k, NodeKind::Snippet(_)));
        let declares = holds(|k| matches!(k, NodeKind::Declaration { .. }));
        let parent_memo = (holds_snippet || declares).then(|| {
            let derived = frag.memo.derived;
            std::mem::replace(
                &mut frag.memo,
                Memo {
                    entries: Vec::new(),
                    derived,
                },
            )
        });
        let (snippets, child) =
            self.collecting_snippets(|context| context.element_children(identifier, node, frag));
        let mut child = child?;
        // A slot's element may hold `{@const}`s, which upstream declares with the fragment's.
        if !declares {
            l.consts.append(&mut child.consts);
        }
        if snippets.is_empty() && !declares {
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
            block.append(&mut child.consts);
            block.append(&mut child.initializer);
            block.append(&mut directives.initializer);
            if !child.update.is_empty() {
                block.push(self.render_statement(frag, child.update));
            }
            block.append(&mut child.after);
            block.append(&mut directives.after);
            l.initializer.push(self.b.block(block));
        }
        if let Some(memo) = parent_memo {
            frag.memo = memo;
        }
        Ok(())
    }
}
