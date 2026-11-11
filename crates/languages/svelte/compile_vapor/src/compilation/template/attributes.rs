use oxc_ast::AstKind;
use oxc_ast::ast::Expression;
use oxc_ast_visit::Visit;
use oxc_semantic::SymbolId;
use rsvelte_svelte_semantic::compiler_syntax_tree::Modifiers;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{
    Attribute, AttributeValue, DirectiveExpression, DirectiveName, Helper, Namespace,
    PASSIVE_EVENTS, R, Span, Steps, Template, attribute, binding_event, directive, is_boolean,
    is_primitive, reads_this, spelled, unsupported, vue,
};
use crate::compilation::string_key;

impl<'t> Template<'_, '_, 't> {
    /// `() => value`.
    pub(super) fn getter(&self, value: Expression<'t>) -> Expression<'t> {
        self.b.arrow(self.b.params([]), value)
    }

    /// The key a directive's runtime state is stored under: where it is written.
    fn key(&self, a: &Attribute) -> Expression<'t> {
        self.b.number(f64::from(a.span.start_offset))
    }

    pub(super) fn attribute(
        &mut self,
        tag: &str,
        namespace: Namespace,
        attributes: &[Attribute],
        a: &Attribute,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
    ) -> R<()> {
        let b = self.b;
        let name = a.name.text(self.i.source_text);
        let at = a.name.span();
        let plain = matches!(
            a.value,
            AttributeValue::Boolean
                | AttributeValue::Static(_)
                | AttributeValue::Expression { .. }
                | AttributeValue::Shorthand(_)
                | AttributeValue::Interpolated(_)
        );
        if !self.i.server
            && namespace == Namespace::Html
            && tag.contains('-')
            && !matches!(name, "class" | "style")
            && !name.starts_with("on")
            && plain
        {
            self.custom_element_attribute(a, steps);
            return Ok(());
        }
        if name.eq_ignore_ascii_case("defaultValue") || name.eq_ignore_ascii_case("defaultChecked")
        {
            return self.default_attribute(a, attributes, props, steps);
        }
        if matches!(name, "autofocus" | "hidden" | "muted") && plain {
            self.special_boolean_attribute(a, props, steps);
            return Ok(());
        }
        match &a.value {
            AttributeValue::Attach(_)
            | AttributeValue::Use { .. }
            | AttributeValue::Transition { .. }
            | AttributeValue::Animate { .. } => {
                if !self.i.server {
                    self.mounted_directive(a, steps);
                }
                Ok(())
            }
            AttributeValue::Style { value, modifiers } => {
                let mut value = self.style_value(value);
                let important = modifiers.contains(Modifiers::IMPORTANT);
                if self.i.server {
                    if important {
                        self.helpers.insert(Helper::Style);
                        value = self.call("$$style_value", [value, b.boolean(true)]);
                    }
                    let object = b.object([b.property(string_key(b, name), value, false)]);
                    props.push(self.bound("style", at, object, a.span));
                } else {
                    self.helpers.insert(Helper::Style);
                    let call = self.call(
                        "$$style",
                        [b.id("$$el"), b.string(name), value, b.boolean(important)],
                    );
                    steps.mounted.push(call);
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
                self.expression_attribute(namespace, a, expression, props, steps);
                Ok(())
            }
            AttributeValue::Interpolated(parts) => {
                let mut value = self.interpolated(parts);
                if rsvelte_svelte_compile::lower::is_boolean_attribute(name) {
                    if self.i.server {
                        self.helpers.insert(Helper::BooleanServer);
                        value = self.call("$$bool", [value]);
                    } else {
                        value = self.call("Boolean", [value]);
                    }
                }
                props.push(self.bound(name, at, value, a.span));
                Ok(())
            }
        }
    }

    /// An attachment, action, transition or animation: a call when the element mounts.
    fn mounted_directive(&mut self, a: &Attribute, steps: &mut Steps<'t>) {
        let b = self.b;
        let call = match &a.value {
            AttributeValue::Attach(expression) => {
                self.helpers.insert(Helper::Lifecycle);
                let expression = self.template_expression(*expression);
                self.call(
                    "$$attachment",
                    [b.id("$$el"), self.key(a), self.getter(expression)],
                )
            }
            AttributeValue::Use { action, argument } => {
                self.helpers.insert(Helper::Lifecycle);
                let action = self.template_expression(*action);
                let parameter = argument.map_or_else(
                    || b.id("undefined"),
                    |argument| self.template_expression(argument),
                );
                self.call(
                    "$$action",
                    [b.id("$$el"), self.key(a), action, self.getter(parameter)],
                )
            }
            AttributeValue::Transition {
                function,
                argument,
                intro,
                outro,
                modifiers,
            } => {
                self.helpers.insert(Helper::Transition);
                let function = self.template_expression(*function);
                let parameter = argument.map_or_else(
                    || b.object([]),
                    |argument| self.template_expression(argument),
                );
                self.call(
                    "$$transition",
                    [
                        b.id("$$el"),
                        self.key(a),
                        self.getter(function),
                        self.getter(parameter),
                        b.boolean(*intro),
                        b.boolean(*outro),
                        b.boolean(modifiers.contains(Modifiers::GLOBAL)),
                    ],
                )
            }
            AttributeValue::Animate { function, argument } => {
                self.helpers.insert(Helper::Animate);
                let function = self.template_expression(*function);
                let parameter = argument.map_or_else(
                    || b.id("undefined"),
                    |argument| self.template_expression(argument),
                );
                self.call(
                    "$$animate",
                    [
                        b.id("$$el"),
                        self.key(a),
                        self.getter(function),
                        self.getter(parameter),
                    ],
                )
            }
            _ => unreachable!("called on a mounted directive"),
        };
        steps.mounted.push(call);
    }

    /// `name={expression}`.
    fn expression_attribute(
        &mut self,
        namespace: Namespace,
        a: &Attribute,
        expression: ExpressionIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
    ) {
        let name = a.name.text(self.i.source_text);
        let at = a.name.span();
        let x = self.template_expression(expression);
        let metadata = self.i.analysis.meta(expression);
        if !self.i.server
            && !metadata.has_state
            && !metadata.has_call
            && calls(self.source(expression))
        {
            self.memoized.insert(oxc_span::GetSpan::span(&x));
        }
        if name == "class" {
            self.helpers.insert(Helper::Class);
            let v = self.call("$$class", [x]);
            props.push(self.bound("CLASS", at, v, a.span));
        } else if name == "value" {
            if self.i.server {
                let v = self.attribute_value(expression, x);
                props.push(self.bound("value", at, v, a.span));
            } else {
                self.helpers.insert(Helper::Value);
                let call = self.call("$$value", [self.b.id("$$el"), x]);
                steps.mounted.push(call);
            }
        } else if !self.i.server && namespace == Namespace::Svg && name.starts_with("xlink:") {
            let value = self.call("String", [x]);
            props.push(self.bound(name, at, value, a.span));
        } else if namespace != Namespace::Html
            || name == "style"
            || !rsvelte_svelte_compile::lower::is_boolean_attribute(name)
        {
            let v = self.attribute_value(expression, x);
            props.push(self.bound(name, at, v, a.span));
        } else {
            let v = self.boolean(expression, x);
            props.push(self.bound(name, at, v, a.span));
        }
    }

    /// A text attribute's value: as is when it is a string, number or boolean by construction,
    /// else through `$$attr`.
    pub(super) fn attribute_value(
        &mut self,
        expression: ExpressionIdentifier,
        x: Expression<'t>,
    ) -> Expression<'t> {
        if is_primitive(self.source(expression)) {
            return x;
        }
        self.helpers.insert(if self.i.server {
            Helper::AttributeServer
        } else {
            Helper::Attribute
        });
        self.call("$$attr", [x])
    }

    /// A boolean attribute's value: Svelte's client assigns the property (`Boolean`), its server
    /// renders `''` as present (`$$bool`).
    pub(super) fn boolean(
        &mut self,
        expression: ExpressionIdentifier,
        x: Expression<'t>,
    ) -> Expression<'t> {
        if is_boolean(self.source(expression)) {
            return x;
        }
        if self.i.server {
            self.helpers.insert(Helper::BooleanServer);
            self.call("$$bool", [x])
        } else {
            self.call("Boolean", [x])
        }
    }

    pub(super) fn handler(
        &mut self,
        attributes: &[Attribute],
        a: &Attribute,
        event: &str,
        expression: ExpressionIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
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
            let call = self.call(
                "$$event",
                [self.b.id("$$el"), self.b.string(event), self.getter(value)],
            );
            steps.mounted.push(call);
            return Ok(());
        }
        let value = self.keep(value);
        props.push(directive(
            DirectiveName::On,
            Some(spelled(event, a.name.span())),
            DirectiveExpression::Expression(value),
            a.span,
        ));
        Ok(())
    }

    /// Svelte calls a handler with the element as `this`, Vue with none: only handlers that
    /// cannot read `this`.
    pub(super) fn check_handler(&self, expression: ExpressionIdentifier, span: Span) -> R<()> {
        let res = self.i.resolution;
        let refused = || {
            Err(unsupported(
                "an event handler that is not an arrow, a function or a top-level function that \
                 does not read `this`",
                span,
            ))
        };
        match self.source(expression).get_inner_expression() {
            Expression::ArrowFunctionExpression(_) => Ok(()),
            Expression::FunctionExpression(f)
                if f.body.as_ref().is_some_and(|b| !reads_this(b)) =>
            {
                Ok(())
            }
            Expression::Identifier(id) => {
                let Some(symbol) = res.symbol(id) else {
                    return refused();
                };
                if res.scoping().symbol_scope_id(symbol) != res.instance_scope()
                    || !res.binding(symbol).is_function
                {
                    return refused();
                }
                if self.function_reads_this(symbol) {
                    return refused();
                }
                Ok(())
            }
            _ => refused(),
        }
    }

    /// Whether the function a top-level function binding holds reads its own `this`; an arrow
    /// has none.
    fn function_reads_this(&self, symbol: SymbolId) -> bool {
        let res = self.i.resolution;
        if let AstKind::Function(f) = res.declaration(symbol) {
            return f.body.as_deref().is_none_or(reads_this);
        }
        match res
            .initializer(symbol)
            .map(Expression::get_inner_expression)
        {
            Some(Expression::FunctionExpression(f)) => f.body.as_deref().is_none_or(reads_this),
            Some(Expression::ArrowFunctionExpression(_)) => false,
            _ => true,
        }
    }
}

/// Whether `e` makes a call anywhere, inside its functions too.
fn calls(e: &Expression<'_>) -> bool {
    struct Calls(bool);
    impl<'a> Visit<'a> for Calls {
        fn visit_call_expression(&mut self, _: &oxc_ast::ast::CallExpression<'a>) {
            self.0 = true;
        }
    }
    let mut v = Calls(false);
    v.visit_expression(e);
    v.0
}
