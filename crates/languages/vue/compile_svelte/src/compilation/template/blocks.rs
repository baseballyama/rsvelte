use super::{
    Branch, CompilerNodeIdentifier, Directive, DirectiveExpression, DirectiveName, Each, Helper,
    Kind, NodeIdentifier, NodeKind, Property, PropertyKind, R, SourceLocation, Span,
    SvelteNodeIdentifier, SvelteNodeKind, T, TagType, directive, directive_key, directives,
    expression_of, span_of, svelte, unsupported,
};

impl T<'_, '_> {
    pub(super) fn list(
        &mut self,
        child_nodes: &[CompilerNodeIdentifier],
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<Vec<SvelteNodeIdentifier>> {
        let (vue_tree, source_text) = (self.vue_tree, self.source_text);
        let mut out = Vec::with_capacity(child_nodes.len());
        let mut at = 0;
        while at < child_nodes.len() {
            let child = child_nodes[at];
            let node = vue_tree.node(child);
            let origin = vue_tree.origin[child];
            match &node.kind {
                NodeKind::Text(t) => {
                    let kind = svelte::spelled_text(t.raw, t.text(source_text).into());
                    out.push(self.b.node(kind, node.span, parent, origin));
                }
                &NodeKind::Comment { data } => {
                    out.push(self.b.node(
                        SvelteNodeKind::Comment { data },
                        node.span,
                        parent,
                        origin,
                    ));
                }
                &NodeKind::Interpolation { expression } => {
                    let e = self.expression(expression)?;
                    let callee = self.helper(Helper::ToDisplayString);
                    let call = self
                        .to
                        .call(callee, &[e], false, SourceLocation::from(node.span));
                    let call = self.root_expression(call);
                    out.push(self.b.node(
                        SvelteNodeKind::Expression { expression: call },
                        node.span,
                        parent,
                        origin,
                    ));
                }
                NodeKind::Element(el) => {
                    let cond = directives(vue_tree, el).into_iter().find(|d| {
                        matches!(
                            d.name,
                            DirectiveName::If | DirectiveName::ElseIf | DirectiveName::Else
                        )
                    });
                    match cond.map(|d| d.name) {
                        Some(DirectiveName::If) => {
                            let mut chain = vec![child];
                            let mut next = at + 1;
                            let mut end = at;
                            while next < child_nodes.len() {
                                match &vue_tree.node(child_nodes[next]).kind {
                                    NodeKind::Comment { .. } => {}
                                    NodeKind::Text(t) if t.text(source_text).trim().is_empty() => {}
                                    NodeKind::Element(e) => {
                                        let branch = directive(vue_tree, e, DirectiveName::ElseIf)
                                            .or_else(|| {
                                                directive(vue_tree, e, DirectiveName::Else)
                                            });
                                        match branch.map(|(_, d)| d.name) {
                                            Some(DirectiveName::ElseIf) => {
                                                chain.push(child_nodes[next]);
                                                end = next;
                                            }
                                            Some(_) => {
                                                chain.push(child_nodes[next]);
                                                end = next;
                                                break;
                                            }
                                            None => break,
                                        }
                                    }
                                    _ => break,
                                }
                                next += 1;
                            }
                            out.push(self.if_chain(&chain, parent)?);
                            at = end + 1;
                            continue;
                        }
                        Some(_) => {
                            return Err(unsupported(
                                "`v-else` or `v-else-if` without `v-if`",
                                node.span,
                            ));
                        }
                        None => out.push(self.element_or_each(child, parent)?),
                    }
                }
            }
            at += 1;
        }
        Ok(out)
    }

    pub(super) fn if_chain(
        &mut self,
        chain: &[CompilerNodeIdentifier],
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<SvelteNodeIdentifier> {
        let vue_tree = self.vue_tree;
        let first = vue_tree.node(chain[0]).span;
        let last = vue_tree.node(chain[chain.len() - 1]).span;
        let span = Span::new(first.start_offset, last.end_offset);
        let placeholder = SvelteNodeKind::Comment {
            data: Span::default(),
        };
        let identifier = self
            .b
            .node(placeholder, span, parent, vue_tree.origin[chain[0]]);
        let mut branches = Vec::new();
        let mut otherwise = None;
        for &k in chain {
            let NodeKind::Element(el) = &vue_tree.node(k).kind else {
                unreachable!("a chain holds elements")
            };
            if directive(vue_tree, el, DirectiveName::For).is_some() {
                return Err(unsupported(
                    "`v-if` and `v-for` on one element",
                    vue_tree.node(k).span,
                ));
            }
            let (p, d) = directive(vue_tree, el, DirectiveName::If)
                .or_else(|| directive(vue_tree, el, DirectiveName::ElseIf))
                .or_else(|| directive(vue_tree, el, DirectiveName::Else))
                .expect("a chain's elements have a condition");
            let test = if d.name == DirectiveName::Else {
                None
            } else {
                let e = expression_of(d, p.span)?;
                let e = self.expression(e)?;
                Some(self.root_expression(e))
            };
            let body = self.fragment_body(k, Some(identifier))?;
            let body = self.b.children(&body);
            match test {
                Some(test) => branches.push(Branch {
                    test,
                    body,
                    origin: vue_tree.origin[k],
                }),
                None => otherwise = Some(body),
            }
        }
        let branches = self.b.branches(branches);
        self.b.set_kind(
            identifier,
            SvelteNodeKind::If {
                branches,
                otherwise,
            },
        );
        Ok(identifier)
    }

    /// What a branch or a `v-for` renders: a `<template>`'s children, or the element itself.
    pub(super) fn fragment_body(
        &mut self,
        k: CompilerNodeIdentifier,
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<Vec<SvelteNodeIdentifier>> {
        let vue_tree = self.vue_tree;
        let node = vue_tree.node(k);
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("directives sit on elements")
        };
        if el.tag_type == TagType::Template {
            let structural = |p: &Property| match &p.kind {
                PropertyKind::Directive(d) => {
                    matches!(
                        d.name,
                        DirectiveName::If
                            | DirectiveName::ElseIf
                            | DirectiveName::Else
                            | DirectiveName::For
                    ) || (d.name == DirectiveName::Bind
                        && d.arg
                            .as_ref()
                            .is_some_and(|a| a.text(self.source_text) == "key"))
                }
                PropertyKind::Attribute { .. } => false,
            };
            if let Some(p) = vue_tree.props(el.props).iter().find(|p| !structural(p)) {
                return Err(unsupported(
                    "an attribute on a `<template>` fragment",
                    p.span,
                ));
            }
            return self.list(vue_tree.children(el.children), parent);
        }
        Ok(vec![self.element(k, parent)?])
    }

    pub(super) fn element_or_each(
        &mut self,
        k: CompilerNodeIdentifier,
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<SvelteNodeIdentifier> {
        let vue_tree = self.vue_tree;
        let NodeKind::Element(el) = &vue_tree.node(k).kind else {
            unreachable!("called on elements")
        };
        match directive(vue_tree, el, DirectiveName::For) {
            Some((p, d)) => self.each(k, p, d, parent),
            None => self.element(k, parent),
        }
    }

    /// `v-for`: an `{#each}` over `renderList`, which iterates arrays, strings, numbers and objects
    /// as Vue does. One alias is the block's context; with more, the context is an entry array
    /// the aliases are read from.
    #[expect(clippy::too_many_lines, reason = "one arm per alias shape Vue reads")]
    pub(super) fn each(
        &mut self,
        at: CompilerNodeIdentifier,
        prop: &Property,
        dir: &Directive,
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<SvelteNodeIdentifier> {
        let (vue_tree, from) = (self.vue_tree, self.info.from);
        let node = vue_tree.node(at);
        let DirectiveExpression::For(f) = &dir.exp else {
            return Err(unsupported("a `v-for` without a value", prop.span));
        };
        if !dir.modifiers.is_empty() {
            return Err(unsupported("a `v-for` modifier", prop.span));
        }
        // `renderList` passes value, key and index; Vue leaves a fourth alias undefined.
        if !(1..=3).contains(&f.parameters.len()) {
            return Err(unsupported(
                "a `v-for` with no alias or more than three",
                prop.span,
            ));
        }
        for &param in &f.parameters {
            if !matches!(from.kind(param), Kind::Identifier(_)) {
                return Err(unsupported(
                    "a destructuring `v-for` alias",
                    span_of(from, param),
                ));
            }
            if let Some(b) = self.info.resolution.sem.binding_of(param) {
                let binding = &self.info.resolution.sem.bindings[b];
                if binding.writes > 0 {
                    return Err(unsupported(
                        "a write to a `v-for` alias",
                        span_of(from, param),
                    ));
                }
            }
        }
        let source = self.expression(f.source)?;
        let count = f.parameters.len();
        let parameters: Vec<String> = (0..count)
            .map(|i| self.names.fresh(from, ["value", "key", "index"][i]))
            .collect();
        let param_ids: Vec<NodeIdentifier> =
            parameters.iter().map(|p| self.to.identifier(p)).collect();
        let body = if count <= 1 {
            self.to.identifier(&parameters[0])
        } else {
            let items: Vec<NodeIdentifier> =
                parameters.iter().map(|p| self.to.identifier(p)).collect();
            self.to.array(&items, SourceLocation::SYNTHETIC)
        };
        let item = self
            .to
            .arrow(&param_ids, body, true, false, SourceLocation::SYNTHETIC);
        let render_list = self.helper(Helper::RenderList);
        let collection = self.to.call(
            render_list,
            &[source, item],
            false,
            SourceLocation::SYNTHETIC,
        );
        let collection = self.root_expression(collection);
        let outer = self.aliases.clone();
        let context = if count == 1 {
            self.to.ident(
                from.name(f.parameters[0]),
                from.source_location(f.parameters[0]),
            )
        } else {
            let entry = self.names.fresh(from, "entry");
            for (i, &param) in f.parameters.iter().enumerate() {
                if let Some(b) = self.info.resolution.sem.binding_of(param) {
                    self.aliases.insert(b, (entry.clone(), i as u32));
                }
            }
            self.to.ident(&entry, from.source_location(f.parameters[0]))
        };
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("called on elements")
        };
        let key = match directive_key(vue_tree, el, self.source_text) {
            Some((kp, kd)) => {
                let key = expression_of(kd, kp.span)?;
                let key = self.expression(key)?;
                self.root_expression(key)
            }
            None => NodeIdentifier::NONE,
        };
        let placeholder = SvelteNodeKind::Comment {
            data: Span::default(),
        };
        let identifier = self
            .b
            .node(placeholder, node.span, parent, vue_tree.origin[at]);
        let body = self.fragment_body(at, Some(identifier))?;
        let body = self.b.children(&body);
        self.aliases = outer;
        self.b.set_kind(
            identifier,
            SvelteNodeKind::Each(Each {
                collection,
                context,
                index: NodeIdentifier::NONE,
                key,
                body,
                fallback: None,
            }),
        );
        Ok(identifier)
    }
}
