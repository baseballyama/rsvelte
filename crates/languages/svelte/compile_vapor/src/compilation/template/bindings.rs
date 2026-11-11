use oxc_ast::ast::{
    AssignmentOperator, AssignmentTarget, BinaryOperator, Expression, LogicalOperator,
    VariableDeclarationKind,
};
use rsvelte_svelte_semantic::resolve::BindingKind;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{
    Attribute, DirectiveExpression, DirectiveName, Helper, R, Span, Steps, Template, directive,
    spelled, static_type, unsupported, vue,
};

/// The text-like input types whose `bind:value` is Svelte's string binding.
const TEXT_INPUT_TYPES: &[&str] = &["text", "search", "email", "url", "tel", "password"];

/// The target of an assignment to a name or a member the translation rewrote.
pub(super) fn assignment_target(e: Expression<'_>) -> AssignmentTarget<'_> {
    match e {
        Expression::Identifier(id) => AssignmentTarget::AssignmentTargetIdentifier(id),
        Expression::StaticMemberExpression(m) => AssignmentTarget::StaticMemberExpression(m),
        Expression::ComputedMemberExpression(m) => AssignmentTarget::ComputedMemberExpression(m),
        Expression::PrivateFieldExpression(m) => AssignmentTarget::PrivateFieldExpression(m),
        Expression::ParenthesizedExpression(p) => assignment_target(p.unbox().expression),
        _ => unreachable!("a checked binding target is a name or a member"),
    }
}

impl<'t> Template<'_, '_, 't> {
    /// `bind:x={get, set}`'s two functions.
    fn accessors(&self, target: ExpressionIdentifier) -> Option<[&Expression<'_>; 2]> {
        match self.source(target).get_inner_expression() {
            Expression::SequenceExpression(s) if s.expressions.len() == 2 => {
                Some([&s.expressions[0], &s.expressions[1]])
            }
            _ => None,
        }
    }

    pub(super) fn binding_read(&mut self, target: ExpressionIdentifier) -> Expression<'t> {
        if let Some([getter, _]) = self.accessors(target) {
            let getter = self.rewrite(getter);
            self.b.call(getter, [])
        } else {
            self.template_expression(target)
        }
    }

    pub(super) fn binding_write(
        &mut self,
        target: ExpressionIdentifier,
        value: Expression<'t>,
    ) -> Expression<'t> {
        if let Some([_, setter]) = self.accessors(target) {
            let setter = self.rewrite(setter);
            self.b.call(setter, [value])
        } else {
            let target = self.template_expression(target);
            self.b
                .assign(AssignmentOperator::Assign, assignment_target(target), value)
        }
    }

    /// `($$value) => target = $$value`.
    pub(super) fn setter(&mut self, target: ExpressionIdentifier) -> Expression<'t> {
        let assignment = self.binding_write(target, self.b.id("$$value"));
        self.b.arrow(self.b.params(["$$value"]), assignment)
    }

    pub(super) fn binding(
        &mut self,
        tag: &str,
        attributes: &[Attribute],
        a: &Attribute,
        target: ExpressionIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
    ) -> R<()> {
        let b = self.b;
        let source_text = self.i.source_text;
        let property = a.name.text(source_text);
        if property == "this" {
            return self.bind_this(a, target, steps);
        }
        if matches!(tag, "svelte:window" | "svelte:document") {
            self.check_target(target, a.span)?;
            if !self.i.server {
                self.helpers.insert(Helper::Lifecycle);
                let setter = self.setter(target);
                let owner = b.id("$$instance_lifecycles");
                let call = if matches!(property, "scrollX" | "scrollY") {
                    self.helpers.insert(Helper::WindowScroll);
                    let value = self.binding_read(target);
                    self.call(
                        "$$window_scroll",
                        [
                            b.id("$$el"),
                            b.string(property),
                            self.getter(value),
                            setter,
                            owner,
                        ],
                    )
                } else {
                    self.call(
                        "$$global_binding",
                        [b.id("$$el"), b.string(property), setter, owner],
                    )
                };
                steps.mounted.push(call);
            }
            return Ok(());
        }
        let beside = attributes.iter().any(|o| {
            let other = o.name.text(source_text);
            !std::ptr::eq(o, a)
                && matches!(other, "value" | "checked" | "group")
                && !matches!(
                    (property, other),
                    ("group", "value") | ("indeterminate", "checked")
                )
        });
        if beside {
            return Err(unsupported(
                "a binding beside a `value`, `checked` or another binding",
                a.span,
            ));
        }
        self.check_target(target, a.span)?;
        if !self.i.server && matches!(property, "value" | "checked" | "group" | "files") {
            self.bind_reset(a, target, attributes, steps);
        }
        if property == "group" {
            return self.bind_group(a, target, attributes, props, steps);
        }
        let property_event =
            super::property_bindings::event(source_text, property, tag, attributes);
        if let Some((event, readonly)) = property_event {
            self.bind_property(a, target, event, readonly, props, steps);
            return Ok(());
        }
        match (property, tag, static_type(source_text, attributes)) {
            ("value", "input", Some(t))
                if TEXT_INPUT_TYPES.contains(&t) || matches!(t, "number" | "range") =>
            {
                self.bind_text(a, target, props, steps, matches!(t, "number" | "range"));
                Ok(())
            }
            ("value", "textarea", _) => {
                self.bind_text(a, target, props, steps, false);
                Ok(())
            }
            ("value", "select", _) => {
                if !self.i.server {
                    self.bind_select(a, target, props, steps);
                }
                Ok(())
            }
            ("checked", "input", Some("checkbox")) => {
                self.bind_checked(a, target, props, steps);
                Ok(())
            }
            _ => Err(unsupported(
                format_args!("`bind:{property}` on this <{tag}>"),
                a.span,
            )),
        }
    }

    /// Svelte's `check_binding`: `$state`, or a member of `$state` or of an `{#each}` item.
    pub(super) fn check_target(&self, target: ExpressionIdentifier, span: Span) -> R<()> {
        if self.accessors(target).is_some() {
            return Ok(());
        }
        let res = self.i.resolution;
        let expression = self.source(target).get_inner_expression();
        let mut root = expression;
        while let Some(m) = root.as_member_expression() {
            root = m.object().get_inner_expression();
        }
        let kind = match root {
            Expression::Identifier(id) => res.symbol(id).map(|s| res.binding(s).kind),
            _ => None,
        };
        let member = !std::ptr::eq(root, expression);
        let ok = match kind {
            Some(
                BindingKind::State
                | BindingKind::RawState
                | BindingKind::Derived
                | BindingKind::DerivedBy
                | BindingKind::BindableProperty,
            ) => true,
            Some(BindingKind::Each) => member,
            _ => false,
        };
        if ok {
            Ok(())
        } else {
            Err(unsupported(
                "a binding to anything but `$state` or a member of `$state` or of an {#each} item",
                span,
            ))
        }
    }

    /// `v-on:<event>="handler"`.
    fn listener(&mut self, event: &str, a: &Attribute, handler: Expression<'t>) -> vue::Property {
        let handler = self.keep(handler);
        directive(
            DirectiveName::On,
            Some(spelled(event, a.name.span())),
            DirectiveExpression::Expression(handler),
            a.span,
        )
    }

    /// `bind_value` (client): an `input` listener, and after each patch its render effect
    /// (`value !== input.value && (input.value = value ?? '')`); a fresh element is empty, so the
    /// adoption of a non-empty DOM value never fires. The server prints the value.
    pub(super) fn bind_text(
        &mut self,
        a: &Attribute,
        target: ExpressionIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
        numeric: bool,
    ) {
        let b = self.b;
        let at = a.name.span();
        let x = self.binding_read(target);
        if self.i.server {
            let v = self.attribute_value(target, x);
            props.push(self.bound("value", at, v, a.span));
            return;
        }
        if numeric {
            self.helpers.insert(Helper::NumberBinding);
            let setter = self.setter(target);
            let call = self.call("$$number_value", [b.id("$$el"), x, setter]);
            steps.mounted.push(call);
        } else {
            self.helpers.insert(Helper::FormReset);
            let setter = self.setter(target);
            let call = self.call("$$text_initial", [b.id("$$el"), x, setter]);
            steps.mounted.push(call);
            let x = self.binding_read(target);
            let differs = b.binary(
                x,
                BinaryOperator::StrictInequality,
                b.member(b.id("$$el"), "value"),
            );
            let current = self.binding_read(target);
            let value = b.logical(current, LogicalOperator::Coalesce, b.string(""));
            let assign = b.assign_member(b.member(b.id("$$el"), "value"), value);
            steps
                .mounted
                .push(b.logical(differs, LogicalOperator::And, assign));
        }
        let handler = if numeric {
            let value = b.member(b.member(b.id("$$event"), "currentTarget"), "value");
            let value = self.call("$$number", [value]);
            let assignment = self.binding_write(target, value);
            b.arrow(b.params(["$$event"]), assignment)
        } else {
            self.assign_from_event(target, "value")
        };
        props.push(self.listener("input", a, handler));
    }

    /// `bind_checked` (client): a `change` listener, on mount a nullish value set to the element's
    /// state, and after each patch its render effect (`input.checked = Boolean(value)`). The
    /// server prints `checked` as `attr(…, true)` does.
    pub(super) fn bind_checked(
        &mut self,
        a: &Attribute,
        target: ExpressionIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
    ) {
        let b = self.b;
        let at = a.name.span();
        let x = self.binding_read(target);
        if self.i.server {
            self.helpers.insert(Helper::BooleanServer);
            let v = self.call("$$bool", [x]);
            props.push(self.bound("checked", at, v, a.span));
            return;
        }
        let handler = self.assign_from_event(target, "checked");
        props.push(self.listener("change", a, handler));
        self.helpers.insert(Helper::Once);
        let current = self.binding_read(target);
        let is_null = b.binary(current, BinaryOperator::Equality, b.null());
        let assign = self.binding_write(target, b.member(b.id("$$el"), "checked"));
        let adopt = b.logical(is_null, LogicalOperator::And, assign);
        let call = self.call("$$once", [b.id("$$el"), self.getter(adopt)]);
        steps.mounted.push(call);
        let value = self.call("Boolean", [x]);
        steps
            .mounted
            .push(b.assign_member(b.member(b.id("$$el"), "checked"), value));
    }

    /// `bind_select_value` (client): a `change` listener reading the chosen option, and after each
    /// patch `select_option`, with the browser's choice adopted for `undefined` on mount.
    pub(super) fn bind_select(
        &mut self,
        a: &Attribute,
        target: ExpressionIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
    ) {
        let b = self.b;
        self.helpers.insert(Helper::Select);
        self.helpers.insert(Helper::Option);
        let value = self.call("$$option", [b.member(b.id("$$e"), "currentTarget")]);
        let assign = self.binding_write(target, value);
        let handler = b.arrow(b.params(["$$e"]), assign);
        props.push(self.listener("change", a, handler));
        let set_body = self.binding_write(target, b.id("$$v"));
        let set = b.arrow(b.params(["$$v"]), set_body);
        let current = self.binding_read(target);
        let call = self.call("$$select", [b.id("$$el"), current, set]);
        steps.mounted.push(call);
    }

    pub(super) fn bind_this(
        &mut self,
        a: &Attribute,
        target: ExpressionIdentifier,
        steps: &mut Steps<'t>,
    ) -> R<()> {
        let res = self.i.resolution;
        let expression = self.source(target).get_inner_expression();
        let writable = match expression {
            Expression::Identifier(id) => res.symbol(id).is_some_and(|s| {
                matches!(
                    res.binding(s).kind,
                    BindingKind::State
                        | BindingKind::RawState
                        | BindingKind::Property
                        | BindingKind::BindableProperty
                ) || (res.binding(s).kind == BindingKind::Normal
                    && matches!(
                        res.variable_kind(s),
                        Some(VariableDeclarationKind::Let | VariableDeclarationKind::Var)
                    ))
            }),
            Expression::StaticMemberExpression(m) => !m.optional,
            Expression::ComputedMemberExpression(m) => !m.optional,
            Expression::PrivateFieldExpression(m) => !m.optional,
            _ => self.accessors(target).is_some(),
        };
        if !writable {
            return Err(unsupported("`bind:this` without a writable target", a.span));
        }
        if !self.i.server {
            let assign = self.binding_write(target, self.b.id("$$el"));
            steps.this.push(assign);
        }
        Ok(())
    }

    /// `($$e) => (target = $$e.currentTarget.<property>)`.
    pub(super) fn assign_from_event(
        &mut self,
        target: ExpressionIdentifier,
        property: &str,
    ) -> Expression<'t> {
        let b = self.b;
        let value = b.member(b.member(b.id("$$e"), "currentTarget"), property);
        let assign = self.binding_write(target, value);
        b.arrow(b.params(["$$e"]), assign)
    }
}
