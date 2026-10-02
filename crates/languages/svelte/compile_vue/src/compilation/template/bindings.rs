use super::{
    AssignmentOperator, Attribute, AttributeValue, BinaryOperator, BindingKind, Builder,
    DirectiveExpression, DirectiveName, Helper, Kind, LogicalOperator, NodeIdentifier, R,
    ScopeIdentifier, SourceLocation, Span, Steps, TEXT_INPUT_TYPES, bound, directive, spelled,
    static_type, unsupported, vue,
};

impl Builder<'_, '_> {
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
        let beside = attributes.iter().any(|o| {
            let other = o.name.text(source_text);
            !std::ptr::eq(o, a)
                && (matches!(other, "value" | "checked" | "group")
                    || (matches!(o.value, AttributeValue::Bind(_)) && other != "this"))
        });
        if beside {
            return Err(unsupported(
                "a binding beside a `value`, `checked` or another binding",
                a.span,
            ));
        }
        self.check_target(target, a.span)?;
        self.render_read(target)?;
        match (property, tag, static_type(source_text, attributes)) {
            ("value", "input", Some(t)) if TEXT_INPUT_TYPES.contains(&t) => {
                self.bind_text(a, target, props, steps);
                Ok(())
            }
            ("value", "textarea", _) => {
                self.bind_text(a, target, props, steps);
                Ok(())
            }
            ("value", "select", _) => {
                if attributes
                    .iter()
                    .any(|o| o.name.text(source_text) == "multiple")
                {
                    return Err(unsupported("`bind:value` on a <select multiple>", a.span));
                }
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
            Some(BindingKind::State | BindingKind::RawState) => true,
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
    ) {
        let at = a.name.span();
        let x = self.template_expression(target);
        if self.i.server {
            let v = self.attribute_value(target, x);
            props.push(bound("value", at, v, a.span));
            return;
        }
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
        let current = self.template_expression(target);
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
        let handler = self.assign_from_event(target, "value");
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
        let x = self.template_expression(target);
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
        let current = self.template_expression(target);
        let null = self.to.null(SourceLocation::SYNTHETIC);
        let is_null = self
            .to
            .binary(BinaryOperator::Eq, current, null, SourceLocation::SYNTHETIC);
        let lhs = self.template_expression(target);
        let el = self.to.identifier("$$el");
        let checked = self.to.dot(el, "checked");
        let assign = self.to.assign(
            AssignmentOperator::Assign,
            lhs,
            checked,
            SourceLocation::SYNTHETIC,
        );
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
        let lhs = self.template_expression(target);
        let e = self.to.identifier("$$e");
        let select = self.to.dot(e, "currentTarget");
        let value = self.call("$$option", &[select]);
        let assign = self.to.assign(
            AssignmentOperator::Assign,
            lhs,
            value,
            SourceLocation::SYNTHETIC,
        );
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
        let lhs = self.template_expression(target);
        let v2 = self.to.identifier("$$v");
        let set_body = self.to.assign(
            AssignmentOperator::Assign,
            lhs,
            v2,
            SourceLocation::SYNTHETIC,
        );
        let set = self
            .to
            .arrow(&[v], set_body, true, false, SourceLocation::SYNTHETIC);
        let el = self.to.identifier("$$el");
        let current = self.template_expression(target);
        steps
            .mounted
            .push(self.call("$$select", &[el, current, set]));
    }

    /// `bind:this={x}` on a top-level `$state`: `x = $$el` after each patch, `null` on unmount.
    pub(super) fn bind_this(
        &mut self,
        a: &Attribute,
        target: NodeIdentifier,
        steps: &mut Steps,
    ) -> R<()> {
        let (javascript, resolution) = (self.i.javascript, self.i.resolution);
        let state = matches!(javascript.kind(target), Kind::Identifier(_))
            && resolution.binding(target).is_some_and(|(b, info)| {
                matches!(info.kind, BindingKind::State | BindingKind::RawState)
                    && resolution.sem.bindings[b].scope == ScopeIdentifier::ROOT
            });
        if !state {
            return Err(unsupported(
                "`bind:this` to anything but a top-level `$state`",
                a.span,
            ));
        }
        if !self.i.server {
            let lhs = self.template_expression(target);
            let el = self.to.identifier("$$el");
            steps.this.push(self.to.assign(
                AssignmentOperator::Assign,
                lhs,
                el,
                SourceLocation::SYNTHETIC,
            ));
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
        let lhs = self.template_expression(target);
        let e = self.to.identifier("$$e");
        let el = self.to.dot(e, "currentTarget");
        let value = self.to.dot(el, property);
        let assign = self.to.assign(
            AssignmentOperator::Assign,
            lhs,
            value,
            SourceLocation::SYNTHETIC,
        );
        self.to
            .arrow(&[event], assign, true, false, SourceLocation::SYNTHETIC)
    }
}
