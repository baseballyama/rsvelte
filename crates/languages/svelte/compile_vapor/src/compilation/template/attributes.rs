use super::{
    Attribute, AttributeValue, BindingIdentifier, Builder, DeclarationKind, DirectiveExpression,
    DirectiveName, Helper, Kind, NodeIdentifier, PASSIVE_EVENTS, Part, R, ScopeIdentifier, Span,
    Steps, attribute, binding_event, bound, directive, is_boolean, is_primitive, reads_this,
    spelled, unsupported, vue, walk,
};

impl Builder<'_, '_> {
    #[expect(clippy::too_many_lines, reason = "one arm per directive shape")]
    pub(super) fn attribute(
        &mut self,
        tag: &str,
        namespace: super::Namespace,
        attributes: &[Attribute],
        a: &Attribute,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
        let name = a.name.text(self.i.source_text);
        let at = a.name.span();
        if !self.i.server
            && namespace == super::Namespace::Html
            && tag.contains('-')
            && !matches!(name, "class" | "style")
            && !name.starts_with("on")
            && matches!(
                a.value,
                AttributeValue::Boolean
                    | AttributeValue::Static(_)
                    | AttributeValue::Expression { .. }
                    | AttributeValue::Shorthand(_)
                    | AttributeValue::Interpolated(_)
            )
        {
            return self.custom_element_attribute(a, steps);
        }
        if name.eq_ignore_ascii_case("defaultValue") || name.eq_ignore_ascii_case("defaultChecked")
        {
            return self.default_attribute(a, attributes, props, steps);
        }
        if matches!(name, "autofocus" | "hidden" | "muted")
            && matches!(
                a.value,
                AttributeValue::Boolean
                    | AttributeValue::Static(_)
                    | AttributeValue::Expression { .. }
                    | AttributeValue::Shorthand(_)
                    | AttributeValue::Interpolated(_)
            )
        {
            return self.special_boolean_attribute(a, props, steps);
        }
        match &a.value {
            AttributeValue::Attach(expression) => {
                if !self.i.server {
                    self.helpers.insert(Helper::Lifecycle);
                    let element = self.to.identifier("$$el");
                    let key = self.to.write_number(
                        f64::from(a.span.start_offset),
                        super::SourceLocation::SYNTHETIC,
                    );
                    let expression = self.template_expression(*expression);
                    let getter = self.to.arrow(
                        &[],
                        expression,
                        true,
                        false,
                        super::SourceLocation::SYNTHETIC,
                    );
                    steps
                        .mounted
                        .push(self.call("$$attachment", &[element, key, getter]));
                }
                Ok(())
            }
            AttributeValue::Use { action, argument } => {
                if !self.i.server {
                    self.helpers.insert(Helper::Lifecycle);
                    let element = self.to.identifier("$$el");
                    let key = self.to.write_number(
                        f64::from(a.span.start_offset),
                        super::SourceLocation::SYNTHETIC,
                    );
                    let action = self.template_expression(*action);
                    let parameter = match argument {
                        Some(argument) => self.template_expression(*argument),
                        None => self.to.identifier("undefined"),
                    };
                    let parameter = self.to.arrow(
                        &[],
                        parameter,
                        true,
                        false,
                        super::SourceLocation::SYNTHETIC,
                    );
                    steps
                        .mounted
                        .push(self.call("$$action", &[element, key, action, parameter]));
                }
                Ok(())
            }
            AttributeValue::Transition {
                function,
                argument,
                intro,
                outro,
                modifiers,
            } => {
                if !self.i.server {
                    self.helpers.insert(Helper::Transition);
                    let element = self.to.identifier("$$el");
                    let key = self.to.write_number(
                        f64::from(a.span.start_offset),
                        super::SourceLocation::SYNTHETIC,
                    );
                    let function = self.template_expression(*function);
                    let function =
                        self.to
                            .arrow(&[], function, true, false, super::SourceLocation::SYNTHETIC);
                    let parameter = match argument {
                        Some(argument) => self.template_expression(*argument),
                        None => self.to.object(&[], super::SourceLocation::SYNTHETIC),
                    };
                    let parameter = self.to.arrow(
                        &[],
                        parameter,
                        true,
                        false,
                        super::SourceLocation::SYNTHETIC,
                    );
                    let intro = self
                        .to
                        .write_boolean(*intro, super::SourceLocation::SYNTHETIC);
                    let outro = self
                        .to
                        .write_boolean(*outro, super::SourceLocation::SYNTHETIC);
                    let global = self.to.write_boolean(
                        modifiers.contains(
                            rsvelte_svelte::compilation::compiler_syntax_tree::Modifiers::GLOBAL,
                        ),
                        super::SourceLocation::SYNTHETIC,
                    );
                    steps.mounted.push(self.call(
                        "$$transition",
                        &[element, key, function, parameter, intro, outro, global],
                    ));
                }
                Ok(())
            }
            AttributeValue::Animate { function, argument } => {
                if !self.i.server {
                    self.helpers.insert(Helper::Animate);
                    let element = self.to.identifier("$$el");
                    let key = self.to.write_number(
                        f64::from(a.span.start_offset),
                        super::SourceLocation::SYNTHETIC,
                    );
                    let function = self.template_expression(*function);
                    let function =
                        self.to
                            .arrow(&[], function, true, false, super::SourceLocation::SYNTHETIC);
                    let parameter = match argument {
                        Some(argument) => self.template_expression(*argument),
                        None => self.to.identifier("undefined"),
                    };
                    let parameter = self.to.arrow(
                        &[],
                        parameter,
                        true,
                        false,
                        super::SourceLocation::SYNTHETIC,
                    );
                    steps
                        .mounted
                        .push(self.call("$$animate", &[element, key, function, parameter]));
                }
                Ok(())
            }
            AttributeValue::Style { value, modifiers } => {
                use rsvelte_svelte::compilation::compiler_syntax_tree::Modifiers;
                let mut value = self.style_value(value)?;
                let important = modifiers.contains(Modifiers::IMPORTANT);
                let property = self.to.write_string(name);
                if self.i.server {
                    if important {
                        self.helpers.insert(Helper::Style);
                        let important = self
                            .to
                            .write_boolean(true, super::SourceLocation::SYNTHETIC);
                        value = self.call("$$style_value", &[value, important]);
                    }
                    let field =
                        self.to
                            .property(property, value, 0, super::SourceLocation::SYNTHETIC);
                    let object = self.to.object(&[field], super::SourceLocation::SYNTHETIC);
                    props.push(bound("style", at, object, a.span));
                } else {
                    self.helpers.insert(Helper::Style);
                    let element = self.to.identifier("$$el");
                    let important = self
                        .to
                        .write_boolean(important, super::SourceLocation::SYNTHETIC);
                    steps
                        .mounted
                        .push(self.call("$$style", &[element, property, value, important]));
                }
                Ok(())
            }
            &AttributeValue::Bind(e) => self.binding(tag, attributes, a, e, props, steps),
            AttributeValue::Class(_)
            | AttributeValue::Spread(_)
            | AttributeValue::On { .. }
            | AttributeValue::Let(_) => Err(unsupported("this attribute", a.span)),
            AttributeValue::Boolean => {
                props.push(attribute(a, None));
                Ok(())
            }
            AttributeValue::Static(v) => {
                if tag == "select" && name == "value" {
                    return Err(unsupported("a `value` attribute on a <select>", a.span));
                }
                if !(name == "class" && v.is_empty()) {
                    props.push(attribute(a, Some(v)));
                }
                Ok(())
            }
            &(AttributeValue::Expression { expression, .. }
            | AttributeValue::Shorthand(expression)) => {
                if let Some(event) = name.strip_prefix("on") {
                    return self.handler(attributes, a, event, expression, props, steps);
                }
                self.render_read(expression)?;
                let x = self.template_expression(expression);
                let metadata = self.i.analysis.meta(expression);
                if !self.i.server && !metadata.has_state && !metadata.has_call {
                    let mut called = false;
                    walk(self.i.javascript, expression, &mut |node| {
                        called |= matches!(self.i.javascript.kind(node), Kind::Call { .. });
                        Ok(())
                    })?;
                    if called {
                        self.memoized.insert(x);
                    }
                }
                if name == "class" {
                    self.helpers.insert(Helper::Class);
                    let v = self.call("$$class", &[x]);
                    props.push(bound("CLASS", at, v, a.span));
                } else if name == "value" {
                    if self.i.server {
                        let v = self.attribute_value(expression, x);
                        props.push(bound("value", at, v, a.span));
                    } else {
                        self.helpers.insert(Helper::Value);
                        let el = self.to.identifier("$$el");
                        steps.mounted.push(self.call("$$value", &[el, x]));
                    }
                } else if !self.i.server
                    && namespace == super::Namespace::Svg
                    && name.starts_with("xlink:")
                {
                    let value = self.call("String", &[x]);
                    props.push(bound(name, at, value, a.span));
                } else if namespace != super::Namespace::Html
                    || name == "style"
                    || !rsvelte_svelte_compile::lower::is_boolean_attribute(name)
                {
                    let v = self.attribute_value(expression, x);
                    props.push(bound(name, at, v, a.span));
                } else {
                    let v = self.boolean(expression, x);
                    props.push(bound(name, at, v, a.span));
                }
                Ok(())
            }
            AttributeValue::Interpolated(parts) => {
                for p in parts {
                    if let Part::Expression { expression, .. } = *p {
                        self.render_read(expression)?;
                    }
                }
                let mut value = self.interpolated(parts);
                if rsvelte_svelte_compile::lower::is_boolean_attribute(name) {
                    if self.i.server {
                        self.helpers.insert(Helper::BooleanServer);
                        value = self.call("$$bool", &[value]);
                    } else {
                        value = self.call("Boolean", &[value]);
                    }
                }
                props.push(bound(name, at, value, a.span));
                Ok(())
            }
        }
    }

    /// A text attribute's value: as is when it is a string, number or boolean by construction,
    /// else through `$$attr`.
    pub(super) fn attribute_value(
        &mut self,
        expression: NodeIdentifier,
        x: NodeIdentifier,
    ) -> NodeIdentifier {
        if is_primitive(self.i.javascript, expression) {
            return x;
        }
        self.helpers.insert(if self.i.server {
            Helper::AttributeServer
        } else {
            Helper::Attribute
        });
        self.call("$$attr", &[x])
    }

    /// A boolean attribute's value: Svelte's client assigns the property (`Boolean`), its server
    /// renders `''` as present (`$$bool`).
    pub(super) fn boolean(
        &mut self,
        expression: NodeIdentifier,
        x: NodeIdentifier,
    ) -> NodeIdentifier {
        if is_boolean(self.i.javascript, expression) {
            return x;
        }
        if self.i.server {
            self.helpers.insert(Helper::BooleanServer);
            self.call("$$bool", &[x])
        } else {
            self.call("Boolean", &[x])
        }
    }

    pub(super) fn handler(
        &mut self,
        attributes: &[Attribute],
        a: &Attribute,
        event: &str,
        expression: NodeIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
        let source_text = self.i.source_text;
        if event.is_empty() || !event.bytes().all(|b| b.is_ascii_lowercase()) {
            return Err(unsupported(
                format_args!("the event attribute `on{event}`"),
                a.span,
            ));
        }
        let capture = event.ends_with("capture")
            && !matches!(event, "gotpointercapture" | "lostpointercapture");
        let bound_event = attributes.iter().any(|o| {
            matches!(o.value, AttributeValue::Bind(_))
                && binding_event(o.name.text(source_text)) == event
        });
        if self.i.server {
            return Ok(());
        }
        let value = self.template_expression(expression);
        if capture
            || PASSIVE_EVENTS.contains(&event)
            || bound_event
            || self.check_handler(expression, a.span).is_err()
        {
            self.helpers.insert(Helper::Lifecycle);
            let element = self.to.identifier("$$el");
            let name = self.to.write_string(event);
            let getter = self
                .to
                .arrow(&[], value, true, false, super::SourceLocation::SYNTHETIC);
            steps
                .mounted
                .push(self.call("$$event", &[element, name, getter]));
            return Ok(());
        }
        let name = spelled(event, a.name.span());
        props.push(directive(
            DirectiveName::On,
            Some(name),
            DirectiveExpression::Expression(value),
            a.span,
        ));
        Ok(())
    }

    /// Svelte calls a handler with the element as `this`, Vue with none: only handlers that
    /// cannot read `this`.
    pub(super) fn check_handler(&self, expression: NodeIdentifier, span: Span) -> R<()> {
        let (javascript, resolution) = (self.i.javascript, self.i.resolution);
        let refused = || {
            Err(unsupported(
                "an event handler that is not an arrow, a function or a top-level function that \
                 does not read `this`",
                span,
            ))
        };
        match javascript.kind(expression) {
            Kind::Arrow { .. } => Ok(()),
            Kind::Function { body, .. } if !reads_this(javascript, body) => Ok(()),
            Kind::Identifier(_) => {
                let Some((b, info)) = resolution.binding(expression) else {
                    return refused();
                };
                if resolution.sem.bindings[b].scope != ScopeIdentifier::ROOT || !info.is_function {
                    return refused();
                }
                match self.function_of(b) {
                    Some(f) if !reads_this(javascript, f) => Ok(()),
                    _ => refused(),
                }
            }
            _ => refused(),
        }
    }

    /// The function a top-level function binding holds: its declaration or initialiser.
    pub(super) fn function_of(&self, b: BindingIdentifier) -> Option<NodeIdentifier> {
        let javascript = self.i.javascript;
        let binding = &self.i.resolution.sem.bindings[b];
        if binding.kind == DeclarationKind::Function {
            return self.i.plan.functions.get(&b).copied();
        }
        binding.initializer(javascript).filter(|&i| {
            matches!(
                javascript.kind(i),
                Kind::Function { .. } | Kind::Arrow { .. }
            )
        })
    }
}
