use super::{
    AssignmentOperator, Attribute, AttributeValue, Class, DeclarationKind, Directive, Helper, Kind,
    NodeIdentifier, Property, R, SourceLocation, Span, SvelteNodeIdentifier, T, Target,
    expression_of, span_of, svelte, unsupported, vmodel,
};

impl T<'_, '_> {
    /// `v-model`. On the client, Vue's own directive runs on the element through an attachment;
    /// on the server, the attribute compiler-ssr's `ssrTransformModel` renders.
    #[expect(clippy::type_complexity, reason = "an attribute waiting for its owner")]
    pub(super) fn model(
        &mut self,
        tag: &str,
        ty: Option<&str>,
        value: Option<&str>,
        p: &Property,
        d: &Directive,
    ) -> R<Option<Box<dyn FnOnce(SvelteNodeIdentifier, &Property) -> Attribute>>> {
        let (source_text, from) = (self.source_text, self.info.from);
        if d.arg.is_some() {
            return Err(unsupported("a `v-model` argument on an element", p.span));
        }
        let exp = expression_of(d, p.span)?;
        if !matches!(from.kind(exp), Kind::Identifier(_) | Kind::Member { .. }) {
            return Err(unsupported(
                "a `v-model` value other than a variable or a member",
                span_of(from, exp),
            ));
        }
        self.check_model_target(exp)?;
        let dir = match (tag, ty) {
            ("input", Some("checkbox")) => Helper::VModelCheckbox,
            ("input", Some("radio")) => Helper::VModelRadio,
            ("input", Some("file")) => {
                return Err(unsupported("`v-model` on a file input", p.span));
            }
            ("input", _) => {
                if value.is_some() {
                    return Err(unsupported("`v-model` beside a `value`", p.span));
                }
                Helper::VModelText
            }
            ("select", _) => Helper::VModelSelect,
            _ => {
                return Err(unsupported(format_args!("`v-model` on `<{tag}>`"), p.span));
            }
        };
        let mut modifiers = Vec::new();
        for m in &d.modifiers {
            let m = m.text(source_text);
            if !matches!(m, "lazy" | "number" | "trim") {
                return Err(unsupported(
                    format_args!("the `v-model` modifier `.{m}`"),
                    p.span,
                ));
            }
            modifiers.push(m);
        }
        if self.info.target == Target::Server {
            return self.ssr_model(dir, exp, value);
        }
        let model = self.expression(exp)?;
        let callee = self.helper(dir);
        let mods: Vec<NodeIdentifier> = modifiers
            .iter()
            .map(|m| {
                let key = self.to.identifier(m);
                let yes = self.to.write_boolean(true, SourceLocation::SYNTHETIC);
                self.to.property(key, yes, 0, SourceLocation::SYNTHETIC)
            })
            .collect();
        let mods = self.to.object(&mods, SourceLocation::SYNTHETIC);
        let param = self.names.fresh(from, "value");
        let target = self.expression(exp)?;
        let new_value = self.to.identifier(&param);
        let assign = self.to.assign(
            AssignmentOperator::Assign,
            target,
            new_value,
            SourceLocation::SYNTHETIC,
        );
        let param_id = self.to.identifier(&param);
        let assigner = self
            .to
            .arrow(&[param_id], assign, true, false, SourceLocation::SYNTHETIC);
        let key = self.to.write_string("onUpdate:modelValue");
        let mut props = vec![
            self.to
                .property(key, assigner, 0, SourceLocation::SYNTHETIC),
        ];
        for (name, text) in [("type", ty), ("value", value)] {
            if let Some(text) = text {
                let key = self.to.identifier(name);
                let text = self.to.write_string(text);
                props.push(self.to.property(key, text, 0, SourceLocation::SYNTHETIC));
            }
        }
        let props = self.to.object(&props, SourceLocation::SYNTHETIC);
        let vmodel = self.vmodel_helper();
        let vmodel = self.to.identifier(&vmodel);
        let call = self.to.call(
            vmodel,
            &[callee, model, mods, props],
            false,
            SourceLocation::from(p.span),
        );
        let call = self.root_expression(call);
        Ok(Some(Box::new(move |owner, p| Attribute {
            name: svelte::Name::Spelled {
                text: "".into(),
                span: p.span,
            },
            value: AttributeValue::Attach(call),
            span: p.span,
            owner,
            origin: p.origin,
        })))
    }

    #[expect(clippy::type_complexity, reason = "an attribute waiting for its owner")]
    pub(super) fn ssr_model(
        &mut self,
        dir: Helper,
        e: NodeIdentifier,
        value: Option<&str>,
    ) -> R<Option<Box<dyn FnOnce(SvelteNodeIdentifier, &Property) -> Attribute>>> {
        let (name, v) = match dir {
            Helper::VModelText => {
                let m = self.expression(e)?;
                ("value", self.renderable_value(m))
            }
            Helper::VModelCheckbox => {
                let value = self.value_or_null(value);
                let test = self.is_array(e)?;
                let m = self.expression(e)?;
                let contain = self.helper(Helper::SsrLooseContain);
                let contain = self.to.call0(contain, &[m, value]);
                let m = self.expression(e)?;
                let c = self.to.cond(test, contain, m, SourceLocation::SYNTHETIC);
                ("checked", self.ssr_boolean(c))
            }
            Helper::VModelRadio => {
                let value = self.value_or_null(value);
                let m = self.expression(e)?;
                let eq = self.helper(Helper::SsrLooseEqual);
                let eq = self.to.call0(eq, &[m, value]);
                ("checked", self.ssr_boolean(eq))
            }
            _ => return Ok(None),
        };
        let v = self.root_expression(v);
        Ok(Some(Box::new(move |owner, p| Attribute {
            name: svelte::Name::Spelled {
                text: name.into(),
                span: p.span,
            },
            value: AttributeValue::Expression {
                expression: v,
                quoted: false,
            },
            span: p.span,
            owner,
            origin: p.origin,
        })))
    }

    /// compiler-ssr `processOption`.
    pub(super) fn ssr_option_selected(
        &mut self,
        model: NodeIdentifier,
        value: Option<&str>,
        owner: SvelteNodeIdentifier,
        span: Span,
    ) -> R<Attribute> {
        let test = self.is_array(model)?;
        let v = self.value_or_null(value);
        let m = self.expression(model)?;
        let contain = self.helper(Helper::SsrLooseContain);
        let contain = self.to.call0(contain, &[m, v]);
        let value = self.value_or_null(value);
        let m = self.expression(model)?;
        let eq = self.helper(Helper::SsrLooseEqual);
        let eq = self.to.call0(eq, &[m, value]);
        let c = self.to.cond(test, contain, eq, SourceLocation::SYNTHETIC);
        let v = self.ssr_boolean(c);
        let v = self.root_expression(v);
        Ok(Attribute {
            name: svelte::Name::Spelled {
                text: "selected".into(),
                span,
            },
            value: AttributeValue::Expression {
                expression: v,
                quoted: false,
            },
            span,
            owner,
            origin: u32::MAX,
        })
    }

    pub(super) fn value_or_null(&mut self, value: Option<&str>) -> NodeIdentifier {
        match value {
            Some(v) => self.to.write_string(v),
            None => self.to.null(SourceLocation::SYNTHETIC),
        }
    }

    pub(super) fn is_array(&mut self, e: NodeIdentifier) -> R<NodeIdentifier> {
        let m = self.expression(e)?;
        let array = self.to.identifier("Array");
        let is_array = self.to.dot(array, "isArray");
        Ok(self.to.call0(is_array, &[m]))
    }

    pub(super) fn ssr_boolean(&mut self, v: NodeIdentifier) -> NodeIdentifier {
        let callee = self.helper(Helper::SsrIncludeBooleanAttribute);
        self.to.call0(callee, &[v])
    }

    /// What `v-model` may assign: not a prop, a computed, a `v-for` alias, a constant or an
    /// unresolved name.
    pub(super) fn check_model_target(&self, e: NodeIdentifier) -> R<()> {
        let from = self.info.from;
        let mut root = e;
        while let Kind::Member { object, .. } = from.kind(root) {
            root = object;
        }
        if root == e {
            let ok = self.info.resolution.sem.binding_of(e).is_some_and(|b| {
                let binding = &self.info.resolution.sem.bindings[b];
                self.info.class.get(&b) == Some(&Class::Ref)
                    || (binding.scope == rsvelte_typescript::scope::ScopeIdentifier::ROOT
                        && matches!(
                            binding.kind,
                            DeclarationKind::Let | DeclarationKind::Variable
                        ))
            });
            if !ok {
                return Err(unsupported(
                    "`v-model` on something other than a ref or a variable",
                    span_of(from, e),
                ));
            }
        } else if matches!(from.kind(root), Kind::Identifier(_))
            && self
                .info
                .class_of(root)
                .is_some_and(|c| matches!(c, Class::Props | Class::Computed))
        {
            return Err(unsupported(
                "`v-model` on a prop or a computed",
                span_of(from, e),
            ));
        }
        Ok(())
    }

    pub(super) fn vmodel_helper(&mut self) -> String {
        if let Some(n) = &self.vmodel {
            return n.clone();
        }
        let from = self.info.from;
        let name = self.names.fresh(from, "vmodel");
        let untrack = self.names.helper(from, Helper::Untrack);
        let declarations = vmodel(self.to, &name, &untrack, self.names, from);
        self.hoisted.extend(declarations);
        self.vmodel = Some(name.clone());
        name
    }
}
