use super::{
    Builder, CompilerNodeIdentifier, DirectiveExpression, DirectiveName, Helper, Item,
    LogicalOperator, LoopExpression, NodeIdentifier, NodeKind, Parent, R, SourceLocation, Span,
    Text, Verbatim, bound, clean_nodes, copy, directive, is_name_chain, known_string, unsupported,
    vue,
};

impl Builder<'_, '_> {
    pub(super) fn list(
        &mut self,
        parent: Parent<'_>,
        ids: &[CompilerNodeIdentifier],
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        at: Span,
    ) -> R<vue::Children> {
        let (compiler_syntax_tree, source_text) = (self.i.compiler_syntax_tree, self.i.source_text);
        let items = clean_nodes(
            compiler_syntax_tree,
            source_text,
            parent,
            ids,
            preserve_whitespace,
        )
        .items;
        let mut out = Vec::with_capacity(items.len());
        let mut i = 0;
        while i < items.len() {
            if let Item::Node(identifier) = items[i] {
                match &compiler_syntax_tree.node(identifier).kind {
                    NodeKind::Element(_) => {
                        out.push(self.element(
                            identifier,
                            vue_parent,
                            preserve_whitespace,
                            Vec::new(),
                            None,
                        )?);
                    }
                    NodeKind::If { .. } => {
                        self.if_chain(identifier, vue_parent, preserve_whitespace, &mut out)?;
                    }
                    NodeKind::Each(_) => {
                        self.each(identifier, vue_parent, preserve_whitespace, &mut out)?;
                    }
                    NodeKind::Text { .. }
                    | NodeKind::Comment { .. }
                    | NodeKind::Expression { .. } => {
                        unreachable!("clean_nodes keeps only elements and blocks as nodes")
                    }
                }
                i += 1;
                continue;
            }
            let start = i;
            while i < items.len() && !matches!(items[i], Item::Node(_)) {
                i += 1;
            }
            self.sequence(&items[start..i], vue_parent, at, &mut out)?;
        }
        Ok(self.vb.children(&out))
    }

    /// A run of text and `{expression}` tags: one text node in both runtimes.
    pub(super) fn sequence(
        &mut self,
        items: &[Item<'_>],
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        at: Span,
        out: &mut Vec<vue::CompilerNodeIdentifier>,
    ) -> R<()> {
        let lone = items.len() == 1;
        let mut text = String::new();
        for item in items {
            match item {
                Item::Text { data, .. } => text.push_str(data),
                Item::Expression(e) => {
                    if !text.is_empty() {
                        out.push(self.text(std::mem::take(&mut text), vue_parent, at));
                    }
                    self.render_read(*e)?;
                    let expression = self.text_value(*e, lone);
                    let span = self.i.javascript.source_location(*e).span().unwrap_or(at);
                    let kind = vue::NodeKind::Interpolation { expression };
                    out.push(self.vb.node(kind, span, vue_parent, 0));
                }
                Item::Node(_) => unreachable!("a sequence holds text and expressions"),
            }
        }
        if !text.is_empty() {
            out.push(self.text(text, vue_parent, at));
        }
        Ok(())
    }

    pub(super) fn text(
        &mut self,
        data: String,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        at: Span,
    ) -> vue::CompilerNodeIdentifier {
        let t = Text {
            raw: at,
            cooked: Some(data.into_boxed_str()),
        };
        self.vb.node(vue::NodeKind::Text(t), at, vue_parent, 0)
    }

    /// The string an `{expression}` contributes: Svelte's `build_template_chunk` with `set_text`
    /// or a one-time `nodeValue` (client), or its server `escape`.
    pub(super) fn text_value(&mut self, e: NodeIdentifier, lone: bool) -> NodeIdentifier {
        let (javascript, source_text, resolution) =
            (self.i.javascript, self.i.source_text, self.i.resolution);
        let evaluated = resolution.evaluate(javascript, source_text, e);
        if evaluated.is_known {
            let s = known_string(&evaluated.value);
            return self.to.write_string(&s);
        }
        let x = self.template_expression(e);
        if self.i.server {
            let empty = self.to.write_string("");
            let v = self.to.logical(
                LogicalOperator::Nullish,
                x,
                empty,
                SourceLocation::SYNTHETIC,
            );
            return self.call("String", &[v]);
        }
        if lone && !self.i.analysis.meta(e).has_state {
            self.helpers.insert(Helper::NodeValue);
            return self.call("$$node", &[x]);
        }
        let value = if lone || !evaluated.is_defined {
            let empty = self.to.write_string("");
            self.to.logical(
                LogicalOperator::Nullish,
                x,
                empty,
                SourceLocation::SYNTHETIC,
            )
        } else {
            x
        };
        let head = self.to.template_element("", false);
        let tail = self.to.template_element("", true);
        self.to
            .template(&[head, tail], &[value], SourceLocation::SYNTHETIC)
    }

    /// The one element a block's fragment must be.
    pub(super) fn only_element(
        &self,
        parent: Parent<'_>,
        ids: &[CompilerNodeIdentifier],
        at: Span,
    ) -> R<CompilerNodeIdentifier> {
        let items = clean_nodes(
            self.i.compiler_syntax_tree,
            self.i.source_text,
            parent,
            ids,
            false,
        )
        .items;
        match items.as_slice() {
            [Item::Node(identifier)]
                if matches!(
                    self.i.compiler_syntax_tree.node(*identifier).kind,
                    NodeKind::Element(_)
                ) =>
            {
                Ok(*identifier)
            }
            _ => Err(unsupported(
                "a block whose content is not exactly one element",
                at,
            )),
        }
    }

    pub(super) fn if_chain(
        &mut self,
        identifier: CompilerNodeIdentifier,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        out: &mut Vec<vue::CompilerNodeIdentifier>,
    ) -> R<()> {
        let compiler_syntax_tree = self.i.compiler_syntax_tree;
        let node = compiler_syntax_tree.node(identifier);
        let NodeKind::If {
            branches,
            otherwise,
        } = &node.kind
        else {
            unreachable!("called on an if")
        };
        for (i, b) in compiler_syntax_tree.branches(*branches).iter().enumerate() {
            let el = self.only_element(
                Parent::Block,
                compiler_syntax_tree.children(b.body),
                node.span,
            )?;
            self.render_read(b.test)?;
            let test = self.template_expression(b.test);
            let name = if i == 0 {
                DirectiveName::If
            } else {
                DirectiveName::ElseIf
            };
            let lead = vec![directive(
                name,
                None,
                DirectiveExpression::Expression(test),
                node.span,
            )];
            out.push(self.element(el, vue_parent, preserve_whitespace, lead, None)?);
        }
        if let Some(o) = otherwise {
            let el =
                self.only_element(Parent::Block, compiler_syntax_tree.children(*o), node.span)?;
            let lead = vec![directive(
                DirectiveName::Else,
                None,
                DirectiveExpression::None,
                node.span,
            )];
            out.push(self.element(el, vue_parent, preserve_whitespace, lead, None)?);
        }
        Ok(())
    }

    pub(super) fn each(
        &mut self,
        identifier: CompilerNodeIdentifier,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        out: &mut Vec<vue::CompilerNodeIdentifier>,
    ) -> R<()> {
        let (compiler_syntax_tree, javascript) = (self.i.compiler_syntax_tree, self.i.javascript);
        let node = compiler_syntax_tree.node(identifier);
        let NodeKind::Each(each) = &node.kind else {
            unreachable!("called on an each")
        };
        let context = each
            .context()
            .expect("checked: an {#each} has an item name");
        let el = self.only_element(
            Parent::Each,
            compiler_syntax_tree.children(each.body),
            node.span,
        )?;
        let fallback = match each.fallback {
            Some(f) => {
                if !is_name_chain(javascript, each.collection) {
                    return Err(unsupported(
                        "an {#each} fallback over a collection that is not a name or a chain of \
                         names",
                        node.span,
                    ));
                }
                Some(self.only_element(
                    Parent::Each,
                    compiler_syntax_tree.children(f),
                    node.span,
                )?)
            }
            None => None,
        };
        self.render_read(each.collection)?;
        let source = self.each_source(each.collection);
        let mut parameters = vec![copy(javascript, self.to, &mut Verbatim, context)];
        if let Some(i) = each.index() {
            parameters.push(copy(javascript, self.to, &mut Verbatim, i));
        }
        let mut lead = Vec::new();
        if fallback.is_some() {
            let list = self.each_source(each.collection);
            let length = self.to.dot(list, "length");
            lead.push(directive(
                DirectiveName::If,
                None,
                DirectiveExpression::Expression(length),
                node.span,
            ));
        }
        lead.push(directive(
            DirectiveName::For,
            None,
            DirectiveExpression::For(LoopExpression { parameters, source }),
            node.span,
        ));
        if let Some(k) = each.key().filter(|_| each.keyed(javascript)) {
            self.render_read(k)?;
            let exp = self.template_expression(k);
            let span = javascript.source_location(k).span().unwrap_or(node.span);
            lead.push(bound("key", span, exp, span));
        }
        out.push(self.element(el, vue_parent, preserve_whitespace, lead, None)?);
        if let Some(f) = fallback {
            let lead = vec![directive(
                DirectiveName::Else,
                None,
                DirectiveExpression::None,
                node.span,
            )];
            out.push(self.element(f, vue_parent, preserve_whitespace, lead, None)?);
        }
        Ok(())
    }

    pub(super) fn each_source(&mut self, collection: NodeIdentifier) -> NodeIdentifier {
        self.helpers.insert(if self.i.server {
            Helper::EachServer
        } else {
            Helper::Each
        });
        let c = self.template_expression(collection);
        self.call("$$each", &[c])
    }
}
