use super::{
    Builder, CompilerNodeIdentifier, DirectiveExpression, DirectiveName, Helper, Item, Kind,
    LogicalOperator, LoopExpression, NodeIdentifier, NodeKind, Parent, R, SourceLocation, Span,
    Verbatim, bound, clean_nodes, copy, directive, known_string, unsupported, vue,
};

impl Builder<'_, '_> {
    #[expect(
        clippy::too_many_lines,
        reason = "fragments declare bindings before lowering their children"
    )]
    pub(super) fn list(
        &mut self,
        parent: Parent<'_>,
        ids: &[CompilerNodeIdentifier],
        mut vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        at: Span,
    ) -> R<vue::Children> {
        let (compiler_syntax_tree, source_text) = (self.i.compiler_syntax_tree, self.i.source_text);
        let mut cleaned = clean_nodes(
            compiler_syntax_tree,
            source_text,
            parent,
            ids,
            preserve_whitespace,
        );
        self.i
            .plan
            .namespaces
            .as_ref()
            .expect("translation uses a checked plan")
            .clean_foreign_whitespace(&mut cleaned, compiler_syntax_tree, preserve_whitespace);
        if let Some(&tag) = cleaned.hoisted.iter().find(|&&h| {
            !matches!(
                compiler_syntax_tree.node(h).kind,
                NodeKind::Element(_)
                    | NodeKind::Const { .. }
                    | NodeKind::Declaration { .. }
                    | NodeKind::Debug { .. }
                    | NodeKind::Snippet(_)
            )
        }) {
            return Err(unsupported(
                "this block or tag",
                compiler_syntax_tree.node(tag).span,
            ));
        }
        let items = cleaned.items;
        let mut scopes = Vec::new();
        if let Some(scope) = self.declarations(&cleaned.hoisted, vue_parent, at) {
            scopes.push(scope);
            vue_parent = Some(scope);
        }
        for &identifier in &cleaned.hoisted {
            if let NodeKind::Const { declaration } = compiler_syntax_tree.node(identifier).kind {
                let Kind::VariableDeclaration { declarations, .. } =
                    self.i.javascript.kind(declaration)
                else {
                    unreachable!("a const tag holds a declaration")
                };
                for &declaration in declarations {
                    let Kind::Declarator {
                        identifier,
                        initializer: Some(initializer),
                    } = self.i.javascript.kind(declaration)
                    else {
                        unreachable!("a const tag has an initializer")
                    };
                    let parameter = self.template_expression(identifier);
                    let value = self.template_expression(initializer);
                    let source = self.to.array(&[value], SourceLocation::SYNTHETIC);
                    let properties = self.vb.props([directive(
                        DirectiveName::For,
                        None,
                        DirectiveExpression::For(LoopExpression {
                            parameters: vec![parameter],
                            source,
                        }),
                        at,
                    )]);
                    let element = vue::Element {
                        tag: super::spelled("template", at),
                        tag_type: vue::TagType::Template,
                        props: properties,
                        children: vue::Children::default(),
                    };
                    let scope = self
                        .vb
                        .node(vue::NodeKind::Element(element), at, vue_parent, 0);
                    scopes.push(scope);
                    vue_parent = Some(scope);
                }
            }
        }
        let mut out = Vec::with_capacity(items.len());
        for identifier in cleaned.hoisted {
            if matches!(&compiler_syntax_tree.node(identifier).kind, NodeKind::Element(element) if element.name.text(source_text) == "svelte:options")
            {
                continue;
            }
            if let NodeKind::Snippet(snippet) = &compiler_syntax_tree.node(identifier).kind {
                out.push(self.snippet(
                    snippet,
                    vue_parent,
                    preserve_whitespace,
                    compiler_syntax_tree.node(identifier).span,
                )?);
            }
            if matches!(
                compiler_syntax_tree.node(identifier).kind,
                NodeKind::Element(_)
            ) {
                out.push(self.element(
                    identifier,
                    vue_parent,
                    preserve_whitespace,
                    Vec::new(),
                    None,
                )?);
            }
        }
        let mut i = 0;
        while i < items.len() {
            if let Item::Node(identifier) = items[i] {
                match &compiler_syntax_tree.node(identifier).kind {
                    NodeKind::Element(element)
                        if element.name.text(source_text) == "svelte:options" => {}
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
                    NodeKind::Key { expression, body } => {
                        let expression = *expression;
                        let children = compiler_syntax_tree.children(*body);
                        self.render_read(expression)?;
                        let value = self.template_expression(expression);
                        let source = self.to.array(&[value], SourceLocation::SYNTHETIC);
                        let parameter = self.to.identifier("$$key");
                        let lead = vec![
                            directive(
                                DirectiveName::For,
                                None,
                                DirectiveExpression::For(LoopExpression {
                                    parameters: vec![parameter],
                                    source,
                                }),
                                compiler_syntax_tree.node(identifier).span,
                            ),
                            bound("$$key", at, parameter, at),
                        ];
                        out.push(self.block_element(
                            Parent::Block,
                            children,
                            vue_parent,
                            lead,
                            preserve_whitespace,
                            at,
                        )?);
                    }
                    NodeKind::Html { expression } => {
                        out.push(self.raw_markup(identifier, *expression, vue_parent, at)?);
                    }
                    NodeKind::Await(await_) => {
                        out.push(self.await_block(
                            await_,
                            vue_parent,
                            preserve_whitespace,
                            compiler_syntax_tree.node(identifier).span,
                        )?);
                    }
                    NodeKind::Render { .. } => {
                        let NodeKind::Render { expression } =
                            compiler_syntax_tree.node(identifier).kind
                        else {
                            unreachable!()
                        };
                        if let Kind::Call { arguments, .. } = self.i.javascript.kind(expression)
                            && arguments.iter().any(|&argument| {
                                matches!(self.i.javascript.kind(argument), Kind::Spread(_))
                            })
                        {
                            return Err(unsupported("a render call with spread arguments", at));
                        }
                        let expression = self.template_expression(expression);
                        let props = self.vb.props([bound("value", at, expression, at)]);
                        let element = vue::Element {
                            tag: super::spelled("$$Render", at),
                            tag_type: vue::TagType::Template,
                            props,
                            children: vue::Children::default(),
                        };
                        out.push(
                            self.vb
                                .node(vue::NodeKind::Element(element), at, vue_parent, 0),
                        );
                    }
                    NodeKind::Text { .. }
                    | NodeKind::Comment { .. }
                    | NodeKind::Expression { .. }
                    | NodeKind::Snippet(_)
                    | NodeKind::Const { .. }
                    | NodeKind::Debug { .. }
                    | NodeKind::Declaration { .. } => {
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
            self.sequence(&items[start..i], parent, vue_parent, at, &mut out)?;
        }
        let mut children = self.vb.children(&out);
        for scope in scopes.into_iter().rev() {
            self.vb.set_element_children(scope, children);
            children = self.vb.children(&[scope]);
        }
        Ok(children)
    }

    /// A run of text and `{expression}` tags: one text node in both runtimes.
    pub(super) fn sequence(
        &mut self,
        items: &[Item<'_>],
        parent: Parent<'_>,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        at: Span,
        out: &mut Vec<vue::CompilerNodeIdentifier>,
    ) -> R<()> {
        let lone = items.len() == 1;
        let mut text = String::new();
        let mut quasis = Vec::new();
        let mut expressions = Vec::new();
        for (index, item) in items.iter().enumerate() {
            match item {
                Item::Text { raw, .. } if matches!(parent, Parent::Element("textarea")) => {
                    let raw =
                        super::static_text::textarea_text(raw, index == 0, self.i.server, items);
                    text.push_str(&rsvelte_svelte::syntax::syntax_tree::decode_attribute(raw));
                }
                Item::Text { data, .. } => text.push_str(data),
                Item::Expression(expression) => {
                    self.render_read(*expression)?;
                    let mut value = self.text_value(*expression, lone);
                    if !self.i.server
                        && !lone
                        && let Kind::Template {
                            quasis,
                            expressions,
                        } = self.to.kind(value)
                        && quasis.len() == 2
                        && expressions.len() == 1
                    {
                        value = expressions[0];
                    }
                    quasis.push(
                        self.to
                            .template_element(&super::sanitize_template_string(&text), false),
                    );
                    text.clear();
                    expressions.push(value);
                }
                Item::Node(_) => unreachable!("a sequence holds text and expressions"),
            }
        }
        if expressions.is_empty() {
            if !text.is_empty() {
                out.push(self.static_text(text, items, parent, vue_parent, at));
            }
        } else {
            if !self.i.server && matches!(parent, Parent::Element("textarea")) {
                self.helpers.insert(Helper::Value);
            }
            let expression = if lone {
                expressions[0]
            } else {
                quasis.push(
                    self.to
                        .template_element(&super::sanitize_template_string(&text), true),
                );
                self.to
                    .template(&quasis, &expressions, SourceLocation::SYNTHETIC)
            };
            out.push(self.vb.node(
                vue::NodeKind::Interpolation { expression },
                at,
                vue_parent,
                0,
            ));
        }
        Ok(())
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
    ) -> Option<CompilerNodeIdentifier> {
        let cleaned = clean_nodes(
            self.i.compiler_syntax_tree,
            self.i.source_text,
            parent,
            ids,
            false,
        );
        if !cleaned.hoisted.is_empty() {
            return None;
        }
        match cleaned.items.as_slice() {
            [Item::Node(identifier)]
                if matches!(
                    self.i.compiler_syntax_tree.node(*identifier).kind,
                    NodeKind::Element(_)
                ) =>
            {
                Some(*identifier)
            }
            _ => None,
        }
    }

    pub(super) fn block_element(
        &mut self,
        parent: Parent<'_>,
        children: &[CompilerNodeIdentifier],
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        lead: Vec<vue::Property>,
        preserve: bool,
        at: Span,
    ) -> R<vue::CompilerNodeIdentifier> {
        if let Some(element) = self.only_element(parent, children) {
            return self.element(element, vue_parent, preserve, lead, None);
        }
        let props = self.vb.props(lead);
        let tag = super::spelled("template", at);
        let kind = vue::NodeKind::Element(vue::Element {
            tag,
            tag_type: vue::TagType::Template,
            props,
            children: vue::Children::default(),
        });
        let node = self.vb.node(kind, at, vue_parent, 0);
        let children = self.list(parent, children, Some(node), preserve, at)?;
        self.vb.set_element_children(node, children);
        Ok(node)
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
            out.push(self.block_element(
                Parent::Block,
                compiler_syntax_tree.children(b.body),
                vue_parent,
                lead,
                preserve_whitespace,
                node.span,
            )?);
        }
        if let Some(o) = otherwise {
            let lead = vec![directive(
                DirectiveName::Else,
                None,
                DirectiveExpression::None,
                node.span,
            )];
            out.push(self.block_element(
                Parent::Block,
                compiler_syntax_tree.children(*o),
                vue_parent,
                lead,
                preserve_whitespace,
                node.span,
            )?);
        }
        Ok(())
    }

    #[expect(
        clippy::too_many_lines,
        reason = "the loop and fallback share one evaluated collection"
    )]
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
        self.render_read(each.collection)?;
        let mut source = self.each_source(each.collection);
        let mut wrapper = None;
        let mut vue_parent = vue_parent;
        let collection_name = format!("$$each_collection_{}", node.span.start_offset);
        if each.fallback.is_some() {
            let parameter = self.to.identifier(&collection_name);
            let array = self.to.array(&[source], SourceLocation::SYNTHETIC);
            let props = self.vb.props([directive(
                DirectiveName::For,
                None,
                DirectiveExpression::For(LoopExpression {
                    parameters: vec![parameter],
                    source: array,
                }),
                node.span,
            )]);
            let element = vue::Element {
                tag: super::spelled("template", node.span),
                tag_type: vue::TagType::Template,
                props,
                children: vue::Children::default(),
            };
            let identifier =
                self.vb
                    .node(vue::NodeKind::Element(element), node.span, vue_parent, 0);
            wrapper = Some(identifier);
            vue_parent = Some(identifier);
            source = self.to.identifier(&collection_name);
        }
        let context = if let Some(context) = each.context() {
            self.template_expression(context)
        } else {
            self.to
                .identifier(&format!("$$each_item_{}", node.span.start_offset))
        };
        let mut parameters = vec![context];
        if let Some(i) = each.index() {
            parameters.push(copy(javascript, self.to, &mut Verbatim, i));
        }
        let mut lead = Vec::new();
        if each.fallback.is_some() {
            let list = self.to.identifier(&collection_name);
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
            lead.push(bound("$$key", span, exp, span));
        }
        let mut children = Vec::new();
        let loop_node = self.block_element(
            Parent::Each,
            compiler_syntax_tree.children(each.body),
            vue_parent,
            lead,
            preserve_whitespace,
            node.span,
        )?;
        if super::has_animation(compiler_syntax_tree, each.body) {
            self.animation_loops.insert(loop_node);
        }
        children.push(loop_node);
        if let Some(f) = each.fallback {
            let lead = vec![directive(
                DirectiveName::Else,
                None,
                DirectiveExpression::None,
                node.span,
            )];
            children.push(self.block_element(
                Parent::Each,
                compiler_syntax_tree.children(f),
                vue_parent,
                lead,
                preserve_whitespace,
                node.span,
            )?);
        }
        if let Some(wrapper) = wrapper {
            let children = self.vb.children(&children);
            self.vb.set_element_children(wrapper, children);
            out.push(wrapper);
        } else {
            out.extend(children);
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
