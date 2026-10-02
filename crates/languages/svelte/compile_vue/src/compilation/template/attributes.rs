use super::{
    Attribute, AttributeValue, BindingIdentifier, Builder, DeclarationKind, DirectiveExpression,
    DirectiveName, Helper, Kind, NodeIdentifier, PASSIVE_EVENTS, Part, R, ScopeIdentifier, Span,
    Steps, attribute, binding_event, bound, directive, is_boolean, is_primitive, is_text_attribute,
    reads_this, spelled, unsupported, vue,
};

impl Builder<'_, '_> {
    pub(super) fn attribute(
        &mut self,
        tag: &str,
        attributes: &[Attribute],
        a: &Attribute,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
        let name = a.name.text(self.i.source_text);
        let at = a.name.span();
        match &a.value {
            &AttributeValue::Bind(e) => self.binding(tag, attributes, a, e, props, steps),
            AttributeValue::Attach(_) | AttributeValue::Class(_) | AttributeValue::Spread(_) => {
                Err(unsupported("this attribute", a.span))
            }
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
                    return self.handler(attributes, a, event, expression, props);
                }
                self.render_read(expression)?;
                let x = self.template_expression(expression);
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
                } else if is_text_attribute(name) {
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
                let value = self.interpolated(parts);
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
        if capture || PASSIVE_EVENTS.contains(&event) {
            return Err(unsupported(
                format_args!("the capture or passive event `on{event}`"),
                a.span,
            ));
        }
        let bound_event = attributes.iter().any(|o| {
            matches!(o.value, AttributeValue::Bind(_))
                && binding_event(o.name.text(source_text)) == event
        });
        if bound_event {
            return Err(unsupported(
                format_args!("`on{event}` beside a binding that listens to `{event}`"),
                a.span,
            ));
        }
        self.check_handler(expression, a.span)?;
        if self.i.server {
            return Ok(());
        }
        let value = self.template_expression(expression);
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
