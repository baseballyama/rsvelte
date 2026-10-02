use super::{
    Attribute, AttributeValue, BinaryOperator, Builder, Children, CompilerNodeIdentifier,
    DirectiveExpression, DirectiveName, Helper, Item, LOAD_ERROR_ELEMENTS, Name, NodeIdentifier,
    NodeKind, Parent, R, SourceLocation, Span, Steps, TypedIndex, bound, captured_event,
    clean_nodes, directive, unsupported, vue,
};

impl Builder<'_, '_> {
    pub(super) fn element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        lead: Vec<vue::Property>,
        extra: Option<vue::Property>,
    ) -> R<vue::CompilerNodeIdentifier> {
        let (compiler_syntax_tree, source_text) = (self.i.compiler_syntax_tree, self.i.source_text);
        let node = compiler_syntax_tree.node(identifier);
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("called on an element")
        };
        let tag = el.name.text(source_text);
        let attributes = compiler_syntax_tree.attributes(el.attributes);
        let mut props = lead;
        let mut steps = Steps::default();
        let mut select_target = None;
        let spread = attributes
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Spread(_)));
        let directives = attributes
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Class(_)));
        if spread {
            self.spread(tag, attributes, &mut props, &mut steps)?;
        } else {
            if directives {
                self.class_directives(el.name, attributes, &mut props, &mut steps)?;
            }
            for a in attributes {
                if let AttributeValue::Bind(t) = a.value
                    && tag == "select"
                {
                    select_target = Some(t);
                }
                let class = matches!(a.value, AttributeValue::Class(_))
                    || a.name.text(source_text) == "class";
                if !(directives && class) {
                    self.attribute(tag, attributes, a, &mut props, &mut steps)?;
                }
            }
        }
        props.extend(extra);
        if self.i.server && !spread && LOAD_ERROR_ELEMENTS.contains(&tag) {
            for a in attributes {
                let name = a.name.text(source_text);
                let event = matches!(
                    a.value,
                    AttributeValue::Expression { .. } | AttributeValue::Shorthand(_)
                ) && matches!(name, "onload" | "onerror");
                if event {
                    props.push(captured_event(name, a.span));
                }
            }
        }
        if let Some(f) = self.ref_function(steps) {
            props.push(bound("ref", el.name, f, el.name));
        }
        let range = self.vb.props(props);
        let tag_type = self.vb.tag_type(tag, range, source_text);
        let kind = vue::NodeKind::Element(vue::Element {
            tag: Name::Source(el.name),
            tag_type,
            props: range,
            children: vue::Children::default(),
        });
        let origin = identifier.index() as u32;
        let v = self.vb.node(kind, node.span, vue_parent, origin);
        let children = if let Some(target) = select_target {
            self.options(el.children, v, target, node.span)?
        } else {
            let preserve = preserve_whitespace || tag == "pre" || tag == "textarea";
            if tag == "pre" {
                self.check_pre(el.children, preserve, node.span)?;
            }
            self.list(
                Parent::Element(tag),
                compiler_syntax_tree.children(el.children),
                Some(v),
                preserve,
                node.span,
            )?
        };
        self.vb.set_element_children(v, children);
        Ok(v)
    }

    /// An element with a spread attribute: all its attributes as one object, in order, which
    /// Svelte applies with `set_attributes` (client, after each patch) or prints with
    /// `attributes` (server). Vue is given none of them.
    pub(super) fn spread(
        &mut self,
        tag: &str,
        attributes: &[Attribute],
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
        let source_text = self.i.source_text;
        let mut fields = Vec::with_capacity(attributes.len());
        for a in attributes {
            let name = a.name.text(source_text);
            let value = match &a.value {
                &AttributeValue::Spread(e) => {
                    self.render_read(e)?;
                    let x = self.template_expression(e);
                    fields.push(self.to.spread(x, SourceLocation::SYNTHETIC));
                    continue;
                }
                &AttributeValue::Bind(t) => {
                    self.bind_this(a, t, steps)?;
                    continue;
                }
                AttributeValue::Boolean => self.to.write_boolean(true, SourceLocation::SYNTHETIC),
                AttributeValue::Static(v) => self.to.write_string(v),
                &(AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression)) => {
                    self.render_read(expression)?;
                    let x = self.template_expression(expression);
                    if self.i.server && name == "class" {
                        self.helpers.insert(Helper::Clsx);
                        self.call("$$sclsx", &[x])
                    } else {
                        x
                    }
                }
                _ => {
                    return Err(unsupported(
                        "this attribute beside a spread attribute",
                        a.span,
                    ));
                }
            };
            let key = self.to.write_string(name);
            fields.push(self.to.property(key, value, 0, SourceLocation::SYNTHETIC));
        }
        let object = self.to.object(&fields, SourceLocation::SYNTHETIC);
        if self.i.server {
            self.helpers.insert(Helper::Spread);
            let mut arguments = vec![object];
            if LOAD_ERROR_ELEMENTS.contains(&tag) {
                let events = ["onload", "onerror"].map(|e| self.to.write_string(e));
                arguments.push(self.to.array(&events, SourceLocation::SYNTHETIC));
            }
            let v = self.call("$$spread", &arguments);
            let span = attributes.first().map_or_else(Span::default, |a| a.span);
            props.push(directive(
                DirectiveName::Bind,
                None,
                DirectiveExpression::Expression(v),
                span,
            ));
        } else {
            self.helpers.insert(Helper::Attributes);
            let el = self.to.identifier("$$el");
            steps.mounted.push(self.call("$$attributes", &[el, object]));
        }
        Ok(())
    }

    /// `class:` directives with the `class` attribute: `set_class` (client, after each patch) or
    /// `attr_class` (server), both `to_class` of the value and the directives.
    pub(super) fn class_directives(
        &mut self,
        at: Span,
        attributes: &[Attribute],
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
        let source_text = self.i.source_text;
        let mut value = None;
        let mut fields = Vec::new();
        for a in attributes {
            let name = a.name.text(source_text);
            match &a.value {
                &AttributeValue::Class(e) => {
                    self.render_read(e)?;
                    let x = self.template_expression(e);
                    let key = self.to.write_string(name);
                    fields.push(self.to.property(key, x, 0, SourceLocation::SYNTHETIC));
                }
                AttributeValue::Static(v) if name == "class" => {
                    value = Some(self.to.write_string(v));
                }
                &(AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression))
                    if name == "class" =>
                {
                    self.render_read(expression)?;
                    let x = self.template_expression(expression);
                    self.helpers.insert(Helper::Clsx);
                    value = Some(self.call("$$sclsx", &[x]));
                }
                _ if name == "class" => {
                    return Err(unsupported(
                        "this `class` beside a `class:` directive",
                        a.span,
                    ));
                }
                _ => {}
            }
        }
        let value = value.unwrap_or_else(|| self.to.write_string(""));
        let object = self.to.object(&fields, SourceLocation::SYNTHETIC);
        if self.i.server {
            self.helpers.insert(Helper::ToClass);
            let v = self.call("$$to_class", &[value, object]);
            props.push(bound("CLASS", at, v, at));
        } else {
            self.helpers.insert(Helper::SetClass);
            let el = self.to.identifier("$$el");
            steps
                .mounted
                .push(self.call("$$set_class", &[el, value, object]));
        }
        Ok(())
    }

    /// `($$el) => { if ($$el !== null) { …mounted } …this }`: Vue calls a function ref with the
    /// element after every patch of it and with `null` on unmount, which is when Svelte's effects
    /// and `bind:this` run.
    pub(super) fn ref_function(&mut self, steps: Steps) -> Option<NodeIdentifier> {
        if steps.mounted.is_empty() && steps.this.is_empty() {
            return None;
        }
        let mut body = Vec::new();
        if !steps.mounted.is_empty() {
            let statements: Vec<NodeIdentifier> = steps
                .mounted
                .into_iter()
                .map(|s| self.to.expression_statement(s))
                .collect();
            let block = self.to.block(&statements, SourceLocation::SYNTHETIC);
            let el = self.to.identifier("$$el");
            let null = self.to.null(SourceLocation::SYNTHETIC);
            let test = self.to.binary(
                BinaryOperator::StrictNotEq,
                el,
                null,
                SourceLocation::SYNTHETIC,
            );
            body.push(self.to.if_(test, block, None, SourceLocation::SYNTHETIC));
        }
        body.extend(
            steps
                .this
                .into_iter()
                .map(|s| self.to.expression_statement(s)),
        );
        let block = self.to.block(&body, SourceLocation::SYNTHETIC);
        let param = self.to.identifier("$$el");
        Some(
            self.to
                .arrow(&[param], block, false, false, SourceLocation::SYNTHETIC),
        )
    }

    /// A `<pre>` whose content starts with a newline: the HTML parser drops it from the server's
    /// markup, the DOM keeps it in the client's.
    pub(super) fn check_pre(&self, children: Children, preserve: bool, at: Span) -> R<()> {
        let items = clean_nodes(
            self.i.compiler_syntax_tree,
            self.i.source_text,
            Parent::Element("pre"),
            self.i.compiler_syntax_tree.children(children),
            preserve,
        )
        .items;
        if let Some(Item::Text { data, .. }) = items.first()
            && data.starts_with(['\n', '\r'])
        {
            return Err(unsupported("a <pre> whose text starts with a newline", at));
        }
        Ok(())
    }
}
