use super::{
    Attribute, AttributeValue, BinaryOperator, Builder, CompilerNodeIdentifier,
    DirectiveExpression, DirectiveName, Helper, LOAD_ERROR_ELEMENTS, Name, NodeIdentifier,
    NodeKind, Parent, R, SourceLocation, Span, Steps, TypedIndex, bound, captured_event, directive,
    unsupported, vue,
};

impl Builder<'_, '_> {
    #[expect(
        clippy::too_many_lines,
        reason = "attributes and child scopes share one element lowering"
    )]
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
        if el.kind == super::ElementKind::Component
            || el.name.text(source_text) == "svelte:boundary"
        {
            return self.component(identifier, vue_parent, lead, extra);
        }
        let tag = el.name.text(source_text);
        let attributes = compiler_syntax_tree.attributes(el.attributes);
        let namespace = self
            .i
            .plan
            .namespaces
            .as_ref()
            .expect("translation uses a checked plan")
            .get(identifier);
        let scope = self.i.analysis.scoped[identifier]
            .then_some(self.i.stylesheet_hash)
            .flatten();
        let mut props = lead;
        if tag == "svelte:element" {
            let attribute =
                &compiler_syntax_tree.attributes[el.this.expect("a dynamic element has this")];
            let value = match &attribute.value {
                AttributeValue::Static(value) => self.to.write_string(value),
                AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression) => self.template_expression(*expression),
                _ => {
                    return Err(unsupported(
                        "this value of a dynamic element",
                        attribute.span,
                    ));
                }
            };
            props.push(bound("$$tag", el.name, value, attribute.span));
        }
        let mut steps = Steps::default();
        let mut select_target = None;
        let spread = attributes
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Spread(_)));
        let directives = attributes
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Class(_)));
        let styles = !self.i.server
            && attributes
                .iter()
                .any(|attribute| matches!(attribute.value, AttributeValue::Style { .. }));
        if styles && !spread {
            self.styles(attributes, &mut steps)?;
        }
        if spread {
            self.spread((tag, namespace), attributes, &mut props, &mut steps, scope)?;
        } else {
            if directives || scope.is_some() {
                self.class_directives(el.name, attributes, &mut props, &mut steps, scope)?;
            }
            for a in attributes {
                if let AttributeValue::Bind(t) = a.value
                    && tag == "select"
                {
                    select_target = Some(t);
                }
                let class = matches!(a.value, AttributeValue::Class(_))
                    || a.name.text(source_text) == "class";
                let style = styles
                    && (matches!(a.value, AttributeValue::Style { .. })
                        || a.name.text(source_text) == "style");
                if !(((directives || scope.is_some()) && class) || style) {
                    self.attribute(tag, namespace, attributes, a, &mut props, &mut steps)?;
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
            props.push(bound("$$ref", el.name, f, el.name));
        }
        let range = self.vb.props(props);
        let tag_type = self.vb.tag_type(tag, range, source_text);
        let kind = vue::NodeKind::Element(vue::Element {
            tag: if el.kind == super::ElementKind::Title && namespace == super::Namespace::Html {
                super::spelled("$$Title", el.name)
            } else {
                Name::Source(el.name)
            },
            tag_type,
            props: range,
            children: vue::Children::default(),
        });
        let origin = identifier.index() as u32;
        let v = self.vb.node(kind, node.span, vue_parent, origin);
        if namespace != super::Namespace::Html {
            self.namespaces.insert(v, namespace);
        }
        let children = if let Some(target) = select_target {
            self.options(
                el.children,
                v,
                target,
                node.span,
                attributes
                    .iter()
                    .any(|attribute| attribute.name.text(source_text) == "multiple"),
            )?
        } else {
            let preserve = preserve_whitespace || tag == "pre" || tag == "textarea";
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
        element: (&str, super::Namespace),
        attributes: &[Attribute],
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
        scope: Option<&str>,
    ) -> R<()> {
        let (tag, namespace) = element;
        let source_text = self.i.source_text;
        let mut fields = Vec::with_capacity(attributes.len());
        let mut classes = Vec::new();
        for a in attributes {
            let name = a.name.text(source_text);
            let value = match &a.value {
                &AttributeValue::Class(expression) => {
                    self.render_read(expression)?;
                    let value = self.template_expression(expression);
                    let name = self.to.write_string(name);
                    classes.push(self.to.property(name, value, 0, SourceLocation::SYNTHETIC));
                    continue;
                }
                &AttributeValue::Spread(e) => {
                    self.render_read(e)?;
                    let x = self.template_expression(e);
                    fields.push(self.to.spread(x, SourceLocation::SYNTHETIC));
                    continue;
                }
                AttributeValue::Style { .. } => continue,
                AttributeValue::Attach(_)
                | AttributeValue::Use { .. }
                | AttributeValue::Transition { .. }
                | AttributeValue::Animate { .. } => {
                    self.attribute(tag, namespace, attributes, a, props, steps)?;
                    continue;
                }
                &AttributeValue::Bind(t) => {
                    self.bind_this(a, t, steps)?;
                    continue;
                }
                AttributeValue::Interpolated(parts) => self.interpolated(parts),
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
        let mut object = self.to.object(&fields, SourceLocation::SYNTHETIC);
        if !classes.is_empty() {
            self.helpers.insert(Helper::ClassSpread);
            let classes = self.to.object(&classes, SourceLocation::SYNTHETIC);
            object = self.call("$$class_spread", &[object, classes]);
        }
        if let Some(scope) = scope {
            self.helpers.insert(Helper::ScopedClass);
            let scope = self.to.write_string(scope);
            object = self.call("$$scoped_spread", &[object, scope]);
        }
        let styles = if attributes
            .iter()
            .any(|attribute| matches!(attribute.value, AttributeValue::Style { .. }))
        {
            Some(self.style_declarations(attributes)?)
        } else {
            None
        };
        let at = attributes
            .first()
            .map_or_else(Span::default, |attribute| attribute.span);
        self.apply_spread(element, object, styles, props, steps, at);
        Ok(())
    }

    fn apply_spread(
        &mut self,
        element: (&str, super::Namespace),
        mut object: NodeIdentifier,
        styles: Option<NodeIdentifier>,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
        at: Span,
    ) {
        let (tag, namespace) = element;
        if self.i.server {
            if let Some(styles) = styles {
                let element = self.to.null(SourceLocation::SYNTHETIC);
                object = self.call("$$style_spread", &[element, object, styles]);
            }
            self.helpers.insert(Helper::Spread);
            let mut arguments = vec![object];
            if LOAD_ERROR_ELEMENTS.contains(&tag) {
                let events = ["onload", "onerror"].map(|e| self.to.write_string(e));
                arguments.push(self.to.array(&events, SourceLocation::SYNTHETIC));
            }
            if namespace != super::Namespace::Html || tag.contains('-') {
                if arguments.len() == 1 {
                    arguments.push(self.to.identifier("undefined"));
                }
                arguments.push(self.to.write_boolean(true, SourceLocation::SYNTHETIC));
                arguments.push(self.to.write_boolean(
                    namespace == super::Namespace::Html,
                    SourceLocation::SYNTHETIC,
                ));
            }
            let value = self.call("$$spread", &arguments);
            props.push(directive(
                DirectiveName::Bind,
                None,
                DirectiveExpression::Expression(value),
                at,
            ));
        } else {
            self.helpers.insert(Helper::Attributes);
            let element = self.to.identifier("$$el");
            let call = if let Some(styles) = styles {
                self.call("$$style_spread", &[element, object, styles])
            } else {
                self.call("$$attributes", &[element, object])
            };
            steps.mounted.push(call);
        }
    }

    /// `class:` directives with the `class` attribute: `set_class` (client, after each patch) or
    /// `attr_class` (server), both `to_class` of the value and the directives.
    pub(super) fn class_directives(
        &mut self,
        at: Span,
        attributes: &[Attribute],
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
        scope: Option<&str>,
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
                AttributeValue::Interpolated(parts) if name == "class" => {
                    value = Some(self.interpolated(parts));
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
        let mut value = value.unwrap_or_else(|| self.to.write_string(""));
        if let Some(scope) = scope {
            self.helpers.insert(Helper::ScopedClass);
            let scope = self.to.write_string(scope);
            value = self.call("$$scoped_class", &[value, scope]);
        }
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
}
