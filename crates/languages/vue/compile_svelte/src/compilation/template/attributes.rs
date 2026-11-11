use super::{
    Attribute, AttributeValue, BinaryOperator, Declared, Directive, Expression, GetSpan, Helper,
    Property, R, Rewriter, Span, SvelteNodeIdentifier, T, Target, conditional, expression_of,
    include_boolean_attribute, renderable, span_of, svelte, unsupported,
};

impl<'a> T<'_, '_, '_, 'a> {
    /// `normalizeClass([…items])`.
    fn normalize_class(&mut self, items: Vec<Expression<'a>>) -> Expression<'a> {
        let list = self.b.array(items);
        let callee = self.helper(Helper::NormalizeClass);
        self.b.call(callee, [list])
    }

    /// `class={normalizeClass([…own, attrs.class])}`, at the own class's position or last.
    pub(super) fn dynamic_class(
        &mut self,
        attributes: &mut Vec<Attribute>,
        class: Vec<Expression<'a>>,
        at: Option<(usize, Span, u32)>,
        fallthrough: Option<&str>,
        owner: SvelteNodeIdentifier,
    ) {
        let b = self.b;
        let own = match class.as_slice() {
            [] => None,
            [only @ Expression::StringLiteral(_)] => Some(self.copy(only)),
            _ => {
                let items = class.iter().map(|c| self.copy(c)).collect();
                Some(self.normalize_class(items))
            }
        };
        let value = match fallthrough {
            None => own,
            Some(a) => {
                // runtime-core `mergeProps` merges the class only when the attributes carry one,
                // and Vue renders a `class` attribute exactly when the props have the key.
                let has = b.binary(b.string("class"), BinaryOperator::In, b.id(a));
                let mut items = class;
                items.push(b.member(b.id(a), "class"));
                let merged = self.normalize_class(items);
                let (spread, value) = if let Some(own) = own {
                    (b.id(a), Some(conditional(b, has, merged, own)))
                } else {
                    // `{...attrs}` with its class normalized: a class attribute after a spread
                    // always renders, even for `undefined`.
                    let with_class = b.object([
                        b.spread_property(b.id(a)),
                        b.property(b.key("class"), merged, false),
                    ]);
                    (conditional(b, has, with_class, b.id(a)), None)
                };
                let spread = self.keep(spread);
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
        let value = self.keep(value);
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
    pub(super) fn boolean_value(&mut self, v: Expression<'a>) -> Expression<'a> {
        let callee = if self.info.target == Target::Server {
            self.helper(Helper::SsrIncludeBooleanAttribute)
        } else {
            let name = if let Some(name) = &self.boolean_attribute {
                name.clone()
            } else {
                let name = self.names.fresh("includeBooleanAttr");
                let declaration = include_boolean_attribute(self.b, &name, self.names);
                self.hoisted.push(declaration);
                self.boolean_attribute = Some(name.clone());
                name
            };
            self.b.id(&name)
        };
        self.b.call(callee, [v])
    }

    /// server-renderer `isRenderableAttrValue`: Vue renders only strings, numbers and booleans.
    pub(super) fn renderable_value(&mut self, v: Expression<'a>) -> Expression<'a> {
        let name = if let Some(name) = &self.renderable {
            name.clone()
        } else {
            let name = self.names.fresh("renderable");
            let declaration = renderable(self.b, &name, self.names);
            self.hoisted.push(declaration);
            self.renderable = Some(name.clone());
            name
        };
        self.b.call(self.b.id(&name), [v])
    }

    /// `@event.modifiers="handler"`, as compiler-core `transformOn` and compiler-dom's
    /// `resolveModifiers` build it.
    pub(super) fn handler(&mut self, p: &Property, d: &Directive) -> R<(String, Expression<'a>)> {
        let (source_text, info) = (self.source_text, self.info);
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
        let written = info.from.get_expression(e);
        let mut handler = match written {
            Expression::ArrowFunctionExpression(_) => self.expression(e)?,
            Expression::FunctionExpression(f) => {
                return Err(unsupported(
                    "a `function` expression as a handler (its `this` differs)",
                    span_of(f.span),
                ));
            }
            Expression::Identifier(identifier) => {
                let function = info.symbol(identifier).is_some_and(|s| {
                    info.top.get(&s).is_some_and(|top| {
                        top.declared == Declared::Function
                            || (top.declared == Declared::Const
                                && top.initializer.is_some_and(|i| {
                                    matches!(
                                        i,
                                        Expression::ArrowFunctionExpression(_)
                                            | Expression::FunctionExpression(_)
                                    )
                                }))
                    })
                });
                if !function {
                    return Err(unsupported(
                        "a handler named by something other than a function the script declares",
                        span_of(identifier.span),
                    ));
                }
                self.expression(e)?
            }
            written if written.is_member_expression() => {
                return Err(unsupported(
                    "a member expression as a handler",
                    span_of(written.span()),
                ));
            }
            _ => {
                let event_parameter = self.names.fresh("event");
                let mut rewriter = Rewriter::new(info, self.b, true, &self.aliases);
                rewriter.event = Some(&event_parameter);
                let body = rewriter.expression(written)?;
                self.b
                    .arrow(self.b.params([event_parameter.as_str()]), body)
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
            let list = self.b.array(non_key.iter().map(|m| self.b.string(m)));
            handler = self.b.call(callee, [handler, list]);
        }
        if !keys.is_empty() && matches!(event, "keyup" | "keydown" | "keypress") {
            let callee = self.helper(Helper::WithKeys);
            let list = self.b.array(keys.iter().map(|m| self.b.string(m)));
            handler = self.b.call(callee, [handler, list]);
        }
        Ok((event.to_owned(), handler))
    }
}
