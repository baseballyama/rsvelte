use super::{NodeIdentifier, Parser, R, RESERVED, Span, T, flag};

impl Parser<'_, '_> {
    #[expect(clippy::too_many_lines, reason = "one arm per primary expression kind")]
    pub(super) fn primary(&mut self) -> R<NodeIdentifier> {
        let t = self.token;
        let start_offset = t.span.start_offset;
        match t.t {
            T::Identifier => {
                let text = self.text(t);
                match text {
                    "true" | "false" => {
                        self.bump()?;
                        Ok(self.syntax_tree.write_boolean(text == "true", t.span))
                    }
                    "null" => {
                        self.bump()?;
                        Ok(self.syntax_tree.null(t.span))
                    }
                    "this" => {
                        self.bump()?;
                        Ok(self.syntax_tree.this(t.span))
                    }
                    "function" => self.function(false, start_offset, false),
                    "async"
                        if self.peek().t == T::Identifier
                            && self.text(self.peek()) == "function" =>
                    {
                        self.bump()?;
                        self.function(false, start_offset, true)
                    }
                    "import" => self.import_primary(),
                    "class" => self.class_definition(false),
                    "super" => {
                        self.bump()?;
                        Ok(self.syntax_tree.super_(t.span))
                    }
                    "yield" => {
                        self.bump()?;
                        let delegate = self.eat_op("*")?;
                        let argument = if !delegate
                            && (self.token.newline_before
                                || matches!(
                                    self.token.t,
                                    T::Semi | T::RBrace | T::RParen | T::Comma | T::Eof
                                )) {
                            None
                        } else {
                            Some(self.assignment()?)
                        };
                        Ok(self.syntax_tree.yield_(
                            argument,
                            delegate,
                            self.span_from(start_offset),
                        ))
                    }
                    _ if RESERVED.contains(&text) => {
                        self.fail(format!("unexpected keyword `{text}`"))
                    }
                    _ => {
                        self.bump()?;
                        Ok(self.syntax_tree.ident(text, t.span))
                    }
                }
            }
            T::BigInt => {
                self.bump()?;
                Ok(self.syntax_tree.bigint(t.span))
            }
            T::Number => {
                self.bump()?;
                match Self::number_value(self.text(t)) {
                    Some(v) => Ok(self.syntax_tree.write_number(v, t.span)),
                    None => self.fail("invalid number"),
                }
            }
            T::String => {
                self.bump()?;
                Ok(self.string_node(t))
            }
            T::Template { .. } => self.template(),
            T::LParen => {
                self.bump()?;
                let previous = self.allow_in;
                self.allow_in = true;
                let e = self.expression()?;
                self.allow_in = previous;
                self.expect(T::RParen, ")")?;
                Ok(e)
            }
            T::LBracket => {
                self.bump()?;
                let items = self.open();
                while self.token.t != T::RBracket {
                    let ilo = self.token.span.start_offset;
                    if self.token.t == T::Comma {
                        self.bump()?;
                        let hole = self.syntax_tree.hole(Span::new(ilo, ilo));
                        self.item(hole);
                        continue;
                    }
                    let a = self.assignment_or_spread(ilo)?;
                    self.item(a);
                    if !self.eat(T::Comma)? {
                        break;
                    }
                }
                self.expect(T::RBracket, "]")?;
                let span = self.span_from(start_offset);
                Ok(self.close(items, |syntax_tree, items| syntax_tree.array(items, span)))
            }
            T::LBrace => self.object(),
            T::Op if matches!(self.text(t), "/" | "/=") => {
                let literal = self.lex.regex(t.span)?;
                self.token = literal.token;
                self.token.newline_before = t.newline_before;
                self.bump()?;
                Ok(self.syntax_tree.regex(literal.pattern, literal.flags))
            }
            T::Op if self.typescript && self.text(t) == "<" => {
                let start = self.token.span.start_offset;
                self.skip_type_parameters()?;
                let end = self.prev_end;
                let value = self.unary()?;
                self.typescript(
                    value,
                    super::TypeScriptKind::Assertion,
                    Span::new(start, end),
                );
                Ok(value)
            }
            T::Eof => self.fail("unexpected end of input"),
            _ => self.fail(format!("unexpected token `{}`", self.text(t))),
        }
    }

    pub(super) fn template(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let mut quasis = Vec::new();
        let mut expressions = Vec::new();
        loop {
            let T::Template { tail } = self.token.t else {
                return self.fail("expected template continuation");
            };
            let s = self.token.span;
            let raw = Span::new(
                s.start_offset + 1,
                if tail {
                    s.end_offset - 1
                } else {
                    s.end_offset - 2
                },
            );
            quasis.push(self.syntax_tree.template_element_in_source(raw, tail, raw));
            if tail {
                self.bump()?;
                break;
            }
            self.bump()?;
            expressions.push(self.expression()?);
            if self.token.t != T::RBrace {
                return self.fail("expected `}` in template literal");
            }
            self.token = self.lex.template_continue(self.token.span)?;
        }
        Ok(self
            .syntax_tree
            .template(&quasis, &expressions, self.span_from(start_offset)))
    }

    pub(super) fn object(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        self.bump()?;
        let props = self.open();
        while self.token.t != T::RBrace {
            let plo = self.token.span.start_offset;
            if self.eat(T::Ellipsis)? {
                let a = self.assignment()?;
                let spread = self.syntax_tree.spread(a, self.span_from(plo));
                self.item(spread);
            } else {
                let is_async = self.is_kw("async")
                    && !matches!(self.peek().t, T::Colon | T::Comma | T::RBrace | T::LParen);
                if is_async {
                    self.bump()?;
                }
                let generator = self.eat_op("*")?;
                let accessor = if (self.is_kw("get") || self.is_kw("set"))
                    && !matches!(self.peek().t, T::Colon | T::Comma | T::RBrace | T::LParen)
                {
                    if is_async {
                        return self.fail("an accessor cannot be async");
                    }
                    let flag = if self.is_kw("get") {
                        flag::GETTER
                    } else {
                        flag::SETTER
                    };
                    self.bump()?;
                    flag
                } else {
                    0
                };
                let (key, computed, key_token) = self.property_key()?;
                if self.token.t == T::LParen {
                    let parameters = self.parameters()?;
                    if accessor != 0 {
                        if generator {
                            return self.fail("an accessor cannot be a generator");
                        }
                        self.accessor_parameters(parameters, accessor == flag::GETTER)?;
                    }
                    let ret = self.maybe_return_type(false)?;
                    let body = self.block()?;
                    let span = Span::new(key_token.start_offset, self.prev_end);
                    let f = self.close(parameters, |syntax_tree, parameters| {
                        syntax_tree.function(false, None, parameters, body, is_async, span)
                    });
                    self.syntax_tree.mark_generator(f, generator);
                    self.signature_typescript(f, None, ret);
                    let flags = if accessor == 0 {
                        flag::METHOD
                    } else {
                        accessor
                    } | if computed { flag::COMPUTED } else { 0 };
                    let prop = self
                        .syntax_tree
                        .property(key, f, flags, self.span_from(plo));
                    self.item(prop);
                } else if accessor != 0 {
                    return self.fail("expected accessor parameters");
                } else if self.eat(T::Colon)? {
                    let v = self.assignment()?;
                    let flags = if computed { flag::COMPUTED } else { 0 };
                    let prop = self
                        .syntax_tree
                        .property(key, v, flags, self.span_from(plo));
                    self.item(prop);
                } else if let Some(name) = self.syntax_tree.atom(key).filter(|_| !computed) {
                    let value = self.syntax_tree.ident_atom(name, key_token);
                    let prop =
                        self.syntax_tree
                            .property(key, value, flag::SHORTHAND, self.span_from(plo));
                    self.item(prop);
                } else {
                    return self.fail("expected `:`");
                }
            }
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect(T::RBrace, "}")?;
        let span = self.span_from(start_offset);
        Ok(self.close(props, |syntax_tree, props| syntax_tree.object(props, span)))
    }

    pub(super) fn property_key(&mut self) -> R<(NodeIdentifier, bool, Span)> {
        let t = self.token;
        match t.t {
            T::Identifier | T::PrivateName => {
                self.bump()?;
                Ok((self.syntax_tree.ident(self.text(t), t.span), false, t.span))
            }
            T::String => {
                self.bump()?;
                Ok((self.string_node(t), false, t.span))
            }
            T::Number => {
                self.bump()?;
                let v = Self::number_value(self.text(t)).unwrap_or(0.0);
                Ok((self.syntax_tree.write_number(v, t.span), false, t.span))
            }
            T::LBracket => {
                self.bump()?;
                let e = self.assignment()?;
                self.expect(T::RBracket, "]")?;
                Ok((e, true, Span::new(t.span.start_offset, self.prev_end)))
            }
            _ => self.fail("expected property key"),
        }
    }
}

impl Parser<'_, '_> {
    fn import_primary(&mut self) -> R<NodeIdentifier> {
        let token = self.bump()?;
        if self.eat(T::Dot)? {
            let property = self.expect(T::Identifier, "meta")?;
            if self.text(property) != "meta" {
                return self.fail("expected import.meta");
            }
            let meta = self.syntax_tree.ident("import", token.span);
            let property = self.syntax_tree.ident("meta", property.span);
            return Ok(self.syntax_tree.meta_property(
                meta,
                property,
                self.span_from(token.span.start_offset),
            ));
        }
        self.expect(T::LParen, "(")?;
        let source = self.assignment()?;
        let options = if self.eat(T::Comma)? {
            if self.token.t == T::RParen {
                None
            } else {
                let options = self.assignment()?;
                self.eat(T::Comma)?;
                Some(options)
            }
        } else {
            None
        };
        self.expect(T::RParen, ")")?;
        Ok(self.syntax_tree.import_expression(
            source,
            options,
            self.span_from(token.span.start_offset),
        ))
    }
}
