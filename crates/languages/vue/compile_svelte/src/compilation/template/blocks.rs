use oxc_ast::ast::{BindingIdentifier, BindingPattern};

use super::{
    Argument, Branch, CompilerNodeIdentifier, CompilerSyntaxTree, Directive, DirectiveExpression,
    DirectiveName, Each, Element, Expression, Helper, NodeKind, Property, PropertyKind, R, Span,
    SvelteNodeIdentifier, SvelteNodeKind, T, TagType, directive, directives, expression_of,
    output_span, span_of, svelte, unsupported,
};

/// The `:key` of a `v-for` element.
fn directive_key<'h>(
    compiler_syntax_tree: &'h CompilerSyntaxTree,
    el: &Element,
    source_text: &str,
) -> Option<(&'h Property, &'h Directive)> {
    compiler_syntax_tree
        .props(el.props)
        .iter()
        .find_map(|p| match &p.kind {
            PropertyKind::Directive(d)
                if d.name == DirectiveName::Bind
                    && d.arg.as_ref().is_some_and(|a| a.text(source_text) == "key") =>
            {
                Some((p, d))
            }
            _ => None,
        })
}

impl T<'_, '_, '_, '_> {
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
                    out.push(self.hir.node(kind, node.span, parent, origin));
                }
                &NodeKind::Comment { data } => {
                    out.push(self.hir.node(
                        SvelteNodeKind::Comment { data },
                        node.span,
                        parent,
                        origin,
                    ));
                }
                &NodeKind::Interpolation { expression } => {
                    let e = self.expression(expression)?;
                    let callee = self.helper(Helper::ToDisplayString);
                    let call = Expression::new_call_expression(
                        output_span(node.span),
                        callee,
                        None,
                        self.b.vec([Argument::from(e)]),
                        false,
                        self.b,
                    );
                    let call = self.keep(call);
                    out.push(self.hir.node(
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
            .hir
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
                Some(self.keep(e))
            };
            let body = self.fragment_body(k, Some(identifier))?;
            let body = self.hir.children(&body);
            match test {
                Some(test) => branches.push(Branch {
                    test,
                    body,
                    origin: vue_tree.origin[k],
                }),
                None => otherwise = Some(body),
            }
        }
        let branches = self.hir.branches(branches);
        self.hir.set_kind(
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
    pub(super) fn each(
        &mut self,
        at_node: CompilerNodeIdentifier,
        prop: &Property,
        dir: &Directive,
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<SvelteNodeIdentifier> {
        let (vue_tree, info) = (self.vue_tree, self.info);
        let node = vue_tree.node(at_node);
        let DirectiveExpression::For(f) = &dir.exp else {
            return Err(unsupported("a `v-for` without a value", prop.span));
        };
        if !dir.modifiers.is_empty() {
            return Err(unsupported("a `v-for` modifier", prop.span));
        }
        let parameters = info.from.get_parameters(f.parameters);
        // `renderList` passes value, key and index; Vue leaves a fourth alias undefined.
        let count = parameters.items.len() + usize::from(parameters.rest.is_some());
        if !(1..=3).contains(&count) {
            return Err(unsupported(
                "a `v-for` with no alias or more than three",
                prop.span,
            ));
        }
        let destructuring = |span| unsupported("a destructuring `v-for` alias", span_of(span));
        let mut aliases: Vec<&BindingIdentifier<'_>> = Vec::with_capacity(count);
        for parameter in &parameters.items {
            let BindingPattern::BindingIdentifier(identifier) = &parameter.pattern else {
                return Err(destructuring(parameter.span));
            };
            if parameter.initializer.is_some() {
                return Err(destructuring(parameter.span));
            }
            if identifier
                .symbol_id
                .get()
                .is_some_and(|s| info.is_written(s))
            {
                return Err(unsupported(
                    "a write to a `v-for` alias",
                    span_of(parameter.span),
                ));
            }
            aliases.push(identifier);
        }
        if let Some(rest) = &parameters.rest {
            return Err(destructuring(rest.span));
        }
        let source = self.expression(f.source)?;
        let names: Vec<String> = ["value", "key", "index"][..count]
            .iter()
            .map(|base| self.names.fresh(base))
            .collect();
        let b = self.b;
        let body = match names.as_slice() {
            [only] => b.id(only),
            _ => b.array(names.iter().map(|n| b.id(n))),
        };
        let item = b.arrow(b.params(names.iter().map(String::as_str)), body);
        let render_list = self.helper(Helper::RenderList);
        let collection = b.call(render_list, [source, item]);
        let collection = self.keep(collection);
        let outer = self.aliases.clone();
        let first = aliases[0];
        let context = if count == 1 {
            b.binding_at(first.name.as_str(), first.span)
        } else {
            let entry = self.names.fresh("entry");
            for (i, alias) in aliases.iter().enumerate() {
                if let Some(s) = alias.symbol_id.get() {
                    self.aliases.insert(s, (entry.clone(), i as u32));
                }
            }
            b.binding_at(&entry, first.span)
        };
        let context = self.tree.keep_pattern(b.parameter(context));
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("called on elements")
        };
        let key = match directive_key(vue_tree, el, self.source_text) {
            Some((kp, kd)) => {
                let key = expression_of(kd, kp.span)?;
                let key = self.expression(key)?;
                Some(self.keep(key))
            }
            None => None,
        };
        let placeholder = SvelteNodeKind::Comment {
            data: Span::default(),
        };
        let identifier = self
            .hir
            .node(placeholder, node.span, parent, vue_tree.origin[at_node]);
        let body = self.fragment_body(at_node, Some(identifier))?;
        let body = self.hir.children(&body);
        self.aliases = outer;
        self.hir.set_kind(
            identifier,
            SvelteNodeKind::Each(Each {
                collection,
                context: Some(context),
                index: None,
                key,
                body,
                fallback: None,
            }),
        );
        Ok(identifier)
    }
}
