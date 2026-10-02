use super::{
    Attribute, AttributeValue, BinaryOperator, DeclarationKind, Directive, Helper, Kind,
    NodeIdentifier, Property, R, Rewriter, SourceLocation, Span, SvelteNodeIdentifier, T, Target,
    expression_of, include_boolean_attribute, renderable, span_of, svelte, unsupported,
};

impl T<'_, '_> {
    /// `class={normalizeClass([…own, attrs.class])}`, at the own class's position or last.
    pub(super) fn dynamic_class(
        &mut self,
        attributes: &mut Vec<Attribute>,
        class: &[NodeIdentifier],
        at: Option<(usize, Span, u32)>,
        fallthrough: Option<&str>,
        owner: SvelteNodeIdentifier,
    ) {
        let normalize = |t: &mut Self, items: &[NodeIdentifier]| {
            let list = t.to.array(items, SourceLocation::SYNTHETIC);
            let callee = t.helper(Helper::NormalizeClass);
            t.to.call0(callee, &[list])
        };
        let own = match class {
            [] => None,
            &[only] if matches!(self.to.kind(only), Kind::String) => Some(only),
            _ => Some(normalize(self, class)),
        };
        let value = match fallthrough {
            None => own,
            Some(a) => {
                // runtime-core `mergeProps` merges the class only when the attributes carry one,
                // and Vue renders a `class` attribute exactly when the props have the key.
                let key = self.to.write_string("class");
                let o = self.to.identifier(a);
                let has = self
                    .to
                    .binary(BinaryOperator::In, key, o, SourceLocation::SYNTHETIC);
                let mut items = class.to_vec();
                let o = self.to.identifier(a);
                items.push(self.to.dot(o, "class"));
                let merged = normalize(self, &items);
                let (spread, value) = if let Some(own) = own {
                    let value = self.to.cond(has, merged, own, SourceLocation::SYNTHETIC);
                    (self.to.identifier(a), Some(value))
                } else {
                    // `{...attrs}` with its class normalized: a class attribute after a spread
                    // always renders, even for `undefined`.
                    let o = self.to.identifier(a);
                    let rest = self.to.spread(o, SourceLocation::SYNTHETIC);
                    let key = self.to.identifier("class");
                    let class = self.to.property(key, merged, 0, SourceLocation::SYNTHETIC);
                    let with_class = self.to.object(&[rest, class], SourceLocation::SYNTHETIC);
                    let plain = self.to.identifier(a);
                    (
                        self.to
                            .cond(has, with_class, plain, SourceLocation::SYNTHETIC),
                        None,
                    )
                };
                let spread = self.root_expression(spread);
                attributes.push(Attribute {
                    name: svelte::Name::Spelled {
                        text: "".into(),
                        span: Span::default(),
                    },
                    value: AttributeValue::Spread(spread),
                    span: Span::default(),
                    owner,
                    origin: u32::MAX,
                });
                value
            }
        };
        let Some(value) = value else {
            return;
        };
        let value = self.root_expression(value);
        let (index, span, origin) = match at {
            Some(at) if fallthrough.is_none() => at,
            Some((_, span, origin)) => (attributes.len(), span, origin),
            None => (attributes.len(), Span::default(), u32::MAX),
        };
        attributes.insert(
            index,
            Attribute {
                name: svelte::Name::Spelled {
                    text: "class".into(),
                    span,
                },
                value: AttributeValue::Expression {
                    expression: value,
                    quoted: false,
                },
                span,
                owner,
                origin,
            },
        );
    }

    /// runtime-dom `patchDOMProp` for a boolean property, and server-renderer's
    /// `includeBooleanAttr`: present for any truthy value and for `''`.
    pub(super) fn boolean_value(&mut self, v: NodeIdentifier) -> NodeIdentifier {
        let callee = if self.info.target == Target::Server {
            self.helper(Helper::SsrIncludeBooleanAttribute)
        } else {
            let name = if let Some(name) = &self.boolean_attribute {
                name.clone()
            } else {
                let name = self.names.fresh(self.info.from, "includeBooleanAttr");
                let declaration =
                    include_boolean_attribute(self.to, &name, self.names, self.info.from);
                self.hoisted.push(declaration);
                self.boolean_attribute = Some(name.clone());
                name
            };
            self.to.identifier(&name)
        };
        self.to.call0(callee, &[v])
    }

    /// server-renderer `isRenderableAttrValue`: Vue renders only strings, numbers and booleans.
    pub(super) fn renderable_value(&mut self, v: NodeIdentifier) -> NodeIdentifier {
        let name = if let Some(name) = &self.renderable {
            name.clone()
        } else {
            let name = self.names.fresh(self.info.from, "renderable");
            let declaration = renderable(self.to, &name, self.names, self.info.from);
            self.hoisted.push(declaration);
            self.renderable = Some(name.clone());
            name
        };
        let callee = self.to.identifier(&name);
        self.to.call0(callee, &[v])
    }

    /// `@event.modifiers="handler"`, as compiler-core `transformOn` and compiler-dom's
    /// `resolveModifiers` build it.
    pub(super) fn handler(&mut self, p: &Property, d: &Directive) -> R<(String, NodeIdentifier)> {
        let (source_text, from) = (self.source_text, self.info.from);
        let event = d
            .arg
            .as_ref()
            .expect("the parser requires an argument")
            .text(source_text);
        if event.is_empty() || !event.bytes().all(|c| c.is_ascii_lowercase()) {
            return Err(unsupported(
                "an event name other than lowercase letters (Vue hyphenates it, Svelte \
                 lowercases it)",
                p.span,
            ));
        }
        let e = expression_of(d, p.span)?;
        let mut handler = match from.kind(e) {
            Kind::Arrow { .. } => self.expression(e)?,
            Kind::Function { .. } => {
                return Err(unsupported(
                    "a `function` expression as a handler (its `this` differs)",
                    span_of(from, e),
                ));
            }
            Kind::Identifier(_) => {
                let function = self.info.resolution.sem.binding_of(e).is_some_and(|b| {
                    let binding = &self.info.resolution.sem.bindings[b];
                    binding.scope == rsvelte_typescript::scope::ScopeIdentifier::ROOT
                        && (binding.kind == DeclarationKind::Function
                            || (binding.kind == DeclarationKind::Const
                                && binding.initializer(from).is_some_and(|i| {
                                    matches!(
                                        from.kind(i),
                                        Kind::Arrow { .. } | Kind::Function { .. }
                                    )
                                })))
                });
                if !function {
                    return Err(unsupported(
                        "a handler named by something other than a function the script declares",
                        span_of(from, e),
                    ));
                }
                self.expression(e)?
            }
            Kind::Member { .. } => {
                return Err(unsupported(
                    "a member expression as a handler",
                    span_of(from, e),
                ));
            }
            _ => {
                let event_param = self.names.fresh(from, "event");
                let aliases = std::mem::take(&mut self.aliases);
                let mut rewriter = Rewriter::new(self.info, true, &aliases);
                rewriter.event = Some(&event_param);
                let body = rewriter.copy(self.to, e);
                self.aliases = aliases;
                let body = body?;
                let param = self.to.identifier(&event_param);
                self.to
                    .arrow(&[param], body, true, false, SourceLocation::SYNTHETIC)
            }
        };
        let mut non_key = Vec::new();
        let mut keys = Vec::new();
        for m in &d.modifiers {
            let m = m.text(source_text);
            match m {
                "stop" | "prevent" | "self" | "ctrl" | "shift" | "alt" | "meta" | "exact" => {
                    non_key.push(m);
                }
                "once" | "passive" | "capture" | "left" | "right" | "middle" | "native" => {
                    return Err(unsupported(
                        format_args!("the event modifier `.{m}`"),
                        p.span,
                    ));
                }
                _ => keys.push(m),
            }
        }
        if !non_key.is_empty() {
            let callee = self.helper(Helper::WithModifiers);
            let list: Vec<NodeIdentifier> =
                non_key.iter().map(|m| self.to.write_string(m)).collect();
            let list = self.to.array(&list, SourceLocation::SYNTHETIC);
            handler = self.to.call0(callee, &[handler, list]);
        }
        if !keys.is_empty() && matches!(event, "keyup" | "keydown" | "keypress") {
            let callee = self.helper(Helper::WithKeys);
            let list: Vec<NodeIdentifier> = keys.iter().map(|m| self.to.write_string(m)).collect();
            let list = self.to.array(&list, SourceLocation::SYNTHETIC);
            handler = self.to.call0(callee, &[handler, list]);
        }
        Ok((event.to_owned(), handler))
    }
}
