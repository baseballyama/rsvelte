use super::{
    ClientCompilationContext, Frag, Item, Kind, Lists, NodeIdentifier, NodeKind, Prev, R,
    SourceLocation, TEMPLATE_FRAGMENT, TEMPLATE_USE_IMPORT_NODE, Template,
    sanitize_template_string,
};

impl ClientCompilationContext<'_> {
    /// Upstream `Fragment` visitor: the statements of one block.
    pub(super) fn fragment(
        &mut self,
        children: rsvelte_svelte::compilation::compiler_syntax_tree::Children,
    ) -> R<Vec<NodeIdentifier>> {
        self.fragment_with_snippets(children, true)
    }

    pub(super) fn fragment_with_snippets(
        &mut self,
        children: rsvelte_svelte::compilation::compiler_syntax_tree::Children,
        include_snippets: bool,
    ) -> R<Vec<NodeIdentifier>> {
        let cleaned = self.plan.fragment(children);
        let items = &cleaned.items;
        let mut frag = Frag::default();
        let mut l = Lists::default();
        self.fragment_hoisted(&cleaned.hoisted, include_snippets, &mut frag, &mut l)?;
        if items.is_empty() {
            l.initializer.append(&mut l.after);
            return Ok(l.initializer);
        }
        let close;

        let single_element = match items.as_ref() {
            [Item::Node(identifier)] => match &self.compiler_syntax_tree.node(*identifier).kind {
                NodeKind::Element(e) if e.kind == super::ElementKind::Regular => {
                    Some((*identifier, e.name))
                }
                _ => None,
            },
            _ => None,
        };
        if let Some((el, name)) = single_element {
            let identifier = self.names.generate(name.text(self.source_text));
            self.element(el, &identifier, &mut frag, &mut l)?;
            let flags = if frag.tpl.needs_import_node {
                TEMPLATE_USE_IMPORT_NODE
            } else {
                0
            };
            let callee = self.transform_template(&frag.tpl, "root", flags);
            let call = self.out.call0(callee, &[]);
            let declaration = self.var(&identifier, call);
            l.initializer.insert(0, declaration);
            close = self.append(&identifier);
        } else if let [Item::Text { data, .. }] = items.as_ref() {
            let identifier = self.names.generate("text");
            let s = self.out.write_string(data);
            let call = self.call("text", vec![Some(s)]);
            let declaration = self.var(&identifier, call);
            l.initializer.insert(0, declaration);
            close = self.append(&identifier);
        } else {
            let identifier = self.names.generate("fragment");
            let use_space_template = items.iter().any(|i| matches!(i, Item::Expression(_)))
                && items
                    .iter()
                    .all(|i| matches!(i, Item::Text { .. } | Item::Expression(_)));
            if use_space_template {
                let text = self.names.generate("text");
                self.process_children(
                    items,
                    Prev::Identifier(text.clone()),
                    false,
                    &mut frag,
                    &mut l,
                )?;
                let call = self.call("text", vec![]);
                let declaration = self.var(&text, call);
                l.initializer.insert(0, declaration);
                close = self.append(&text);
            } else {
                self.process_children(
                    items,
                    Prev::Call {
                        method: "first_child",
                        of: identifier.clone(),
                    },
                    false,
                    &mut frag,
                    &mut l,
                )?;
                let mut flags = TEMPLATE_FRAGMENT;
                if frag.tpl.needs_import_node {
                    flags |= TEMPLATE_USE_IMPORT_NODE;
                }
                let callee = self.transform_template(&frag.tpl, "root", flags);
                let call = self.out.call0(callee, &[]);
                let declaration = self.var(&identifier, call);
                l.initializer.insert(0, declaration);
                close = self.append(&identifier);
            }
        }

        let mut body = Vec::new();
        if cleaned.text_first {
            let next = self.call("next", vec![]);
            body.push(self.statement(next));
        }
        body.append(&mut l.initializer);
        if !l.update.is_empty() {
            let effect = self.render_statement(&mut frag, &std::mem::take(&mut l.update));
            body.push(effect);
        }
        body.append(&mut l.after);
        body.push(close);
        Ok(body)
    }

    fn fragment_hoisted(
        &mut self,
        identifiers: &[super::CompilerNodeIdentifier],
        include_snippets: bool,
        frag: &mut Frag,
        lists: &mut Lists,
    ) -> R<()> {
        for &identifier in identifiers {
            if !include_snippets
                && matches!(
                    self.compiler_syntax_tree.node(identifier).kind,
                    NodeKind::Snippet(_)
                )
            {
                continue;
            }
            self.special_element(identifier, "", frag, lists)?;
        }
        Ok(())
    }

    fn append(&mut self, identifier: &str) -> NodeIdentifier {
        let anchor = self.out.identifier("$$anchor");
        let x = self.out.identifier(identifier);
        let call = self.call("append", vec![Some(anchor), Some(x)]);
        self.statement(call)
    }

    /// Upstream `build_render_statement`.
    pub(super) fn render_statement(
        &mut self,
        frag: &mut Frag,
        update: &[NodeIdentifier],
    ) -> NodeIdentifier {
        let identifiers: Vec<NodeIdentifier> = (0..frag.memo.len())
            .map(|i| self.out.identifier(&format!("${i}")))
            .collect();
        let single = match update {
            [s] => match self.out.kind(*s) {
                Kind::ExpressionStatement(e) => Some(e),
                _ => None,
            },
            _ => None,
        };
        let body = if let Some(e) = single {
            self.out
                .arrow(&identifiers, e, true, false, SourceLocation::SYNTHETIC)
        } else {
            let b = self.out.block(update, SourceLocation::SYNTHETIC);
            self.out
                .arrow(&identifiers, b, false, false, SourceLocation::SYNTHETIC)
        };
        let values = if frag.memo.is_empty() {
            None
        } else {
            let memo = std::mem::take(&mut frag.memo);
            let thunks: Vec<NodeIdentifier> = memo
                .into_iter()
                .map(|m| {
                    self.out
                        .arrow(&[], m, true, false, SourceLocation::SYNTHETIC)
                })
                .collect();
            Some(self.out.array(&thunks, SourceLocation::SYNTHETIC))
        };
        let call = self.call("template_effect", vec![Some(body), values]);
        self.statement(call)
    }

    /// Upstream `transform_template`: hoists `var root = $.from_html(…)` (shared by identical
    /// templates) and returns the callee that builds the fragment.
    fn transform_template(&mut self, tpl: &Template, name: &str, flags: u32) -> NodeIdentifier {
        if tpl.is_lone_comment() {
            let ns = self.out.identifier("$");
            return self.out.dot(ns, "comment");
        }
        let markup = tpl.markup();
        let namespace = match tpl.namespace.unwrap_or_default() {
            crate::render_plan::Namespace::Html => "html",
            crate::render_plan::Namespace::Svg => "svg",
            crate::render_plan::Namespace::Mathml => "mathml",
        };
        let key = format!("{namespace} {flags} {markup}");
        if let Some(existing) = self.templates.get(&key) {
            let existing = existing.clone();
            return self.out.identifier(&existing);
        }
        let raw = sanitize_template_string(&markup).into_owned();
        let q = self.out.template_element(&raw, true);
        let t = self.out.template(&[q], &[], SourceLocation::SYNTHETIC);
        let flags_arg = (flags != 0).then(|| self.write_number(flags));
        let call = self.call(
            match namespace {
                "svg" => "from_svg",
                "mathml" => "from_mathml",
                _ => "from_html",
            },
            vec![Some(t), flags_arg],
        );
        let identifier = self.names.unique(name);
        let declaration = self.var(&identifier, call);
        self.hoisted.push(declaration);
        self.templates.insert(key, identifier.clone());
        self.out.identifier(&identifier)
    }
}
