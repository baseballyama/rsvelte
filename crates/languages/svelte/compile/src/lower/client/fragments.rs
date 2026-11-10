use super::{
    ClientCompilationContext, Frag, Item, Kind, Lists, NodeIdentifier, NodeKind, Prev, R,
    SourceLocation, Template, sanitize_template_string,
};

const TEMPLATE_FRAGMENT: u32 = 1;

const TEMPLATE_USE_IMPORT_NODE: u32 = 2;

impl ClientCompilationContext<'_> {
    /// Upstream `Fragment` visitor: the statements of one block.
    pub(super) fn fragment(
        &mut self,
        children: rsvelte_svelte_semantic::compiler_syntax_tree::Children,
    ) -> R<Vec<NodeIdentifier>> {
        self.fragment_with_snippets(children, true)
    }

    pub(super) fn fragment_with_snippets(
        &mut self,
        children: rsvelte_svelte_semantic::compiler_syntax_tree::Children,
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
        let single_element = match items.as_ref() {
            [Item::Node(identifier)] => match &self.compiler_syntax_tree.node(*identifier).kind {
                NodeKind::Element(e) if e.kind == super::ElementKind::Regular => {
                    Some((*identifier, e.name))
                }
                _ => None,
            },
            _ => None,
        };
        let root = if let Some((el, name)) = single_element {
            let identifier = self.names.generate(name.text(self.source_text));
            self.element(el, &identifier, &mut frag, &mut l)?;
            let flags = if frag.tpl.needs_import_node {
                TEMPLATE_USE_IMPORT_NODE
            } else {
                0
            };
            let callee = self.transform_template(&frag.tpl, cleaned.namespace, "root", flags);
            Some((identifier, self.out.call0(callee, &[])))
        } else if let [Item::Text { data, .. }] = items.as_ref() {
            let identifier = self.names.generate("text");
            let s = self.out.write_string(data);
            Some((identifier, self.call("text", vec![Some(s)])))
        } else {
            let identifier = self.names.generate("fragment");
            let use_space_template = items.iter().any(|i| matches!(i, Item::Expression(_)))
                && items
                    .iter()
                    .all(|i| matches!(i, Item::Text { .. } | Item::Expression(_)));
            if use_space_template {
                let text = self.names.generate("text");
                let initial = Prev::Identifier(text.clone());
                self.process_children(items, initial, false, &mut frag, &mut l)?;
                Some((text, self.call("text", vec![])))
            } else if let Some(component) = super::super::component::standalone_component(
                self.compiler_syntax_tree,
                self.javascript,
                self.res,
                items,
            ) {
                // A lone static component has no markup to clone, so it mounts at the anchor.
                self.component(component, "$$anchor", true, &mut frag, &mut l)?;
                None
            } else {
                let initial = Prev::Call {
                    method: "first_child",
                    of: identifier.clone(),
                };
                self.process_children(items, initial, false, &mut frag, &mut l)?;
                let mut flags = TEMPLATE_FRAGMENT;
                if frag.tpl.needs_import_node {
                    flags |= TEMPLATE_USE_IMPORT_NODE;
                }
                let callee = self.transform_template(&frag.tpl, cleaned.namespace, "root", flags);
                Some((identifier, self.out.call0(callee, &[])))
            }
        };
        let close = root.map(|(identifier, call)| {
            let declaration = self.var(&identifier, call);
            l.initializer.insert(0, declaration);
            self.append(&identifier)
        });

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
        body.extend(close);
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
        let single = match update {
            [s] => match self.out.kind(*s) {
                Kind::ExpressionStatement(e) => Some(e),
                _ => None,
            },
            _ => None,
        };
        let (body, expression_body) = match single {
            Some(e) => (e, true),
            None => (self.out.block(update, SourceLocation::SYNTHETIC), false),
        };
        let (body, values) =
            std::mem::take(&mut frag.memo).into_effect(&mut self.out, body, expression_body);
        let call = self.call("template_effect", vec![Some(body), values]);
        self.statement(call)
    }

    /// Upstream `transform_template`: hoists `var root = $.from_html(…)` (shared by identical
    /// templates) and returns the callee that builds the fragment.
    fn transform_template(
        &mut self,
        tpl: &Template,
        namespace: crate::render_plan::Namespace,
        name: &str,
        flags: u32,
    ) -> NodeIdentifier {
        if tpl.is_lone_comment() {
            let ns = self.out.identifier("$");
            return self.out.dot(ns, "comment");
        }
        let markup = tpl.markup();
        let namespace = match namespace {
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
