use super::{
    AssignmentOperator, Attribute, BinaryOperator, BindingKind, Builder, DeclarationKind,
    DirectiveExpression, DirectiveName, Helper, Kind, LogicalOperator, NodeIdentifier, R,
    SourceLocation, Span, Steps, TEXT_INPUT_TYPES, bound, directive, spelled, static_type,
    unsupported, vue,
};

impl Builder<'_, '_> {
    pub(super) fn binding_read(&mut self, target: NodeIdentifier) -> NodeIdentifier {
        if let Kind::Sequence([getter, _]) = self.i.javascript.kind(target) {
            let getter = self.template_expression(*getter);
            self.to.call0(getter, &[])
        } else {
            self.template_expression(target)
        }
    }

    pub(super) fn binding_write(
        &mut self,
        target: NodeIdentifier,
        value: NodeIdentifier,
    ) -> NodeIdentifier {
        if let Kind::Sequence([_, setter]) = self.i.javascript.kind(target) {
            let setter = self.template_expression(*setter);
            self.to.call0(setter, &[value])
        } else {
            let target = self.template_expression(target);
            self.to.assign(
                AssignmentOperator::Assign,
                target,
                value,
                SourceLocation::SYNTHETIC,
            )
        }
    }

    pub(super) fn binding(
        &mut self,
        tag: &str,
        attributes: &[Attribute],
        a: &Attribute,
        target: NodeIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
        let source_text = self.i.source_text;
        let property = a.name.text(source_text);
        if property == "this" {
            return self.bind_this(a, target, steps);
        }
        if matches!(tag, "svelte:window" | "svelte:document") {
            self.check_target(target, a.span)?;
            if !self.i.server {
                self.helpers.insert(Helper::Lifecycle);
                let element = self.to.identifier("$$el");
                let name = self.to.write_string(property);
                let owner = self.to.identifier("$$instance_lifecycles");
                let value = self.to.identifier("$$value");
                let assignment = self.binding_write(target, value);
                let setter =
                    self.to
                        .arrow(&[value], assignment, true, false, SourceLocation::SYNTHETIC);
                if matches!(property, "scrollX" | "scrollY") {
                    self.helpers.insert(Helper::WindowScroll);
                    let value = self.binding_read(target);
                    let getter = self
                        .to
                        .arrow(&[], value, true, false, SourceLocation::SYNTHETIC);
                    steps.mounted.push(
                        self.call("$$window_scroll", &[element, name, getter, setter, owner]),
                    );
                } else {
                    steps
                        .mounted
                        .push(self.call("$$global_binding", &[element, name, setter, owner]));
                }
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
        if let Kind::Sequence([getter, _]) = self.i.javascript.kind(target) {
            self.render_read(*getter)?;
        } else {
            self.render_read(target)?;
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
    pub(super) fn check_target(&self, target: NodeIdentifier, span: Span) -> R<()> {
        if matches!(self.i.javascript.kind(target), Kind::Sequence([_, _])) {
            return Ok(());
        }
        let (javascript, resolution) = (self.i.javascript, self.i.resolution);
        let mut root = target;
        while let Kind::Member { object, .. } = javascript.kind(root) {
            root = object;
        }
        let kind = matches!(javascript.kind(root), Kind::Identifier(_))
            .then(|| resolution.binding(root).map(|(_, info)| info.kind))
            .flatten();
        let member = root != target;
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

    /// `bind_value` (client): an `input` listener, and after each patch its render effect
    /// (`value !== input.value && (input.value = value ?? '')`); a fresh element is empty, so the
    /// adoption of a non-empty DOM value never fires. The server prints the value.
    pub(super) fn bind_text(
        &mut self,
        a: &Attribute,
        target: NodeIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
        numeric: bool,
    ) {
        let at = a.name.span();
        let x = self.binding_read(target);
        if self.i.server {
            let v = self.attribute_value(target, x);
            props.push(bound("value", at, v, a.span));
            return;
        }
        if numeric {
            self.helpers.insert(Helper::NumberBinding);
            let element = self.to.identifier("$$el");
            let value = self.to.identifier("$$value");
            let assignment = self.binding_write(target, value);
            let setter =
                self.to
                    .arrow(&[value], assignment, true, false, SourceLocation::SYNTHETIC);
            steps
                .mounted
                .push(self.call("$$number_value", &[element, x, setter]));
        } else {
            self.helpers.insert(Helper::FormReset);
            let el = self.to.identifier("$$el");
            let value = self.to.identifier("$$value");
            let assign = self.binding_write(target, value);
            let setter = self
                .to
                .arrow(&[value], assign, true, false, SourceLocation::SYNTHETIC);
            steps
                .mounted
                .push(self.call("$$text_initial", &[el, x, setter]));
            let el = self.to.identifier("$$el");
            let dom = self.to.dot(el, "value");
            let differs = self.to.binary(
                BinaryOperator::StrictNotEq,
                x,
                dom,
                SourceLocation::SYNTHETIC,
            );
            let el = self.to.identifier("$$el");
            let dom = self.to.dot(el, "value");
            let current = self.binding_read(target);
            let empty = self.to.write_string("");
            let value = self.to.logical(
                LogicalOperator::Nullish,
                current,
                empty,
                SourceLocation::SYNTHETIC,
            );
            let assign = self.to.assign(
                AssignmentOperator::Assign,
                dom,
                value,
                SourceLocation::SYNTHETIC,
            );
            steps.mounted.push(self.to.logical(
                LogicalOperator::And,
                differs,
                assign,
                SourceLocation::SYNTHETIC,
            ));
        }
        let handler = self.assign_from_event(target, "value");
        let handler = if numeric {
            let event = self.to.identifier("$$event");
            let element = self.to.dot(event, "currentTarget");
            let value = self.to.dot(element, "value");
            let value = self.call("$$number", &[value]);
            let assignment = self.binding_write(target, value);
            self.to
                .arrow(&[event], assignment, true, false, SourceLocation::SYNTHETIC)
        } else {
            handler
        };
        let name = spelled("input", at);
        props.push(directive(
            DirectiveName::On,
            Some(name),
            DirectiveExpression::Expression(handler),
            a.span,
        ));
    }

    /// `bind_checked` (client): a `change` listener, on mount a nullish value set to the element's
    /// state, and after each patch its render effect (`input.checked = Boolean(value)`). The
    /// server prints `checked` as `attr(…, true)` does.
    pub(super) fn bind_checked(
        &mut self,
        a: &Attribute,
        target: NodeIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) {
        let at = a.name.span();
        let x = self.binding_read(target);
        if self.i.server {
            self.helpers.insert(Helper::BooleanServer);
            let v = self.call("$$bool", &[x]);
            props.push(bound("checked", at, v, a.span));
            return;
        }
        let handler = self.assign_from_event(target, "checked");
        let name = spelled("change", at);
        props.push(directive(
            DirectiveName::On,
            Some(name),
            DirectiveExpression::Expression(handler),
            a.span,
        ));
        self.helpers.insert(Helper::Once);
        let current = self.binding_read(target);
        let null = self.to.null(SourceLocation::SYNTHETIC);
        let is_null = self
            .to
            .binary(BinaryOperator::Eq, current, null, SourceLocation::SYNTHETIC);
        let el = self.to.identifier("$$el");
        let checked = self.to.dot(el, "checked");
        let assign = self.binding_write(target, checked);
        let adopt = self.to.logical(
            LogicalOperator::And,
            is_null,
            assign,
            SourceLocation::SYNTHETIC,
        );
        let step = self
            .to
            .arrow(&[], adopt, true, false, SourceLocation::SYNTHETIC);
        let el = self.to.identifier("$$el");
        steps.mounted.push(self.call("$$once", &[el, step]));
        let el = self.to.identifier("$$el");
        let dom = self.to.dot(el, "checked");
        let value = self.call("Boolean", &[x]);
        steps.mounted.push(self.to.assign(
            AssignmentOperator::Assign,
            dom,
            value,
            SourceLocation::SYNTHETIC,
        ));
    }

    /// `bind_select_value` (client): a `change` listener reading the chosen option, and after each
    /// patch `select_option`, with the browser's choice adopted for `undefined` on mount.
    pub(super) fn bind_select(
        &mut self,
        a: &Attribute,
        target: NodeIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) {
        self.helpers.insert(Helper::Select);
        self.helpers.insert(Helper::Option);
        let at = a.name.span();
        let event = self.to.identifier("$$e");
        let e = self.to.identifier("$$e");
        let select = self.to.dot(e, "currentTarget");
        let value = self.call("$$option", &[select]);
        let assign = self.binding_write(target, value);
        let handler = self
            .to
            .arrow(&[event], assign, true, false, SourceLocation::SYNTHETIC);
        let name = spelled("change", at);
        props.push(directive(
            DirectiveName::On,
            Some(name),
            DirectiveExpression::Expression(handler),
            a.span,
        ));
        let v = self.to.identifier("$$v");
        let v2 = self.to.identifier("$$v");
        let set_body = self.binding_write(target, v2);
        let set = self
            .to
            .arrow(&[v], set_body, true, false, SourceLocation::SYNTHETIC);
        let el = self.to.identifier("$$el");
        let current = self.binding_read(target);
        steps
            .mounted
            .push(self.call("$$select", &[el, current, set]));
    }

    pub(super) fn bind_this(
        &mut self,
        a: &Attribute,
        target: NodeIdentifier,
        steps: &mut Steps,
    ) -> R<()> {
        let (javascript, resolution) = (self.i.javascript, self.i.resolution);
        let writable = matches!(javascript.kind(target), Kind::Identifier(_))
            && resolution.binding(target).is_some_and(|(b, info)| {
                matches!(
                    info.kind,
                    BindingKind::State
                        | BindingKind::RawState
                        | BindingKind::Property
                        | BindingKind::BindableProperty
                ) || (info.kind == BindingKind::Normal
                    && matches!(
                        resolution.sem.bindings[b].kind,
                        DeclarationKind::Let | DeclarationKind::Variable
                    ))
            });
        if !writable
            && !matches!(
                javascript.kind(target),
                Kind::Member {
                    optional: false,
                    ..
                } | Kind::Sequence([_, _])
            )
        {
            return Err(unsupported("`bind:this` without a writable target", a.span));
        }
        if !self.i.server {
            let el = self.to.identifier("$$el");
            let assign = self.binding_write(target, el);
            steps.this.push(assign);
        }
        Ok(())
    }

    /// `($$e) => (target = $$e.currentTarget.<property>)`.
    pub(super) fn assign_from_event(
        &mut self,
        target: NodeIdentifier,
        property: &str,
    ) -> NodeIdentifier {
        let event = self.to.identifier("$$e");
        let e = self.to.identifier("$$e");
        let el = self.to.dot(e, "currentTarget");
        let value = self.to.dot(el, property);
        let assign = self.binding_write(target, value);
        self.to
            .arrow(&[event], assign, true, false, SourceLocation::SYNTHETIC)
    }
}
