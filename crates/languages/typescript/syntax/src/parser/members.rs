use super::{LexedToken, List, NodeIdentifier, Parser, R, Span, T, TypeScriptKind, decode_string};

impl Parser<'_, '_> {
    pub(super) fn lhs(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let mut e = if self.is_kw("new") {
            self.bump()?;
            let callee = self.primary()?;
            let callee = self.member_suffixes(callee, start_offset, false)?;
            self.maybe_type_arguments(callee)?;
            let arguments = if self.token.t == T::LParen {
                self.arguments()?
            } else {
                self.open()
            };
            let span = self.span_from(start_offset);
            self.close(arguments, |syntax_tree, arguments| {
                syntax_tree.new_(callee, arguments, span)
            })
        } else {
            self.primary()?
        };
        e = self.member_suffixes(e, start_offset, true)?;
        Ok(e)
    }

    pub(super) fn member_suffixes(
        &mut self,
        mut e: NodeIdentifier,
        start_offset: u32,
        calls: bool,
    ) -> R<NodeIdentifier> {
        loop {
            match self.token.t {
                T::Dot => {
                    self.bump()?;
                    let prop = self.property_name_ident()?;
                    e = self.syntax_tree.member(
                        e,
                        prop,
                        false,
                        false,
                        self.span_from(start_offset),
                    );
                }
                T::QuestionDot => {
                    self.bump()?;
                    match self.token.t {
                        T::LParen if calls => {
                            let arguments = self.arguments()?;
                            let span = self.span_from(start_offset);
                            e = self.close(arguments, |syntax_tree, arguments| {
                                syntax_tree.call(e, arguments, true, span)
                            });
                        }
                        T::LBracket => {
                            self.bump()?;
                            let p = self.expression()?;
                            self.expect(T::RBracket, "]")?;
                            e = self.syntax_tree.member(
                                e,
                                p,
                                true,
                                true,
                                self.span_from(start_offset),
                            );
                        }
                        _ => {
                            let prop = self.property_name_ident()?;
                            e = self.syntax_tree.member(
                                e,
                                prop,
                                false,
                                true,
                                self.span_from(start_offset),
                            );
                        }
                    }
                }
                T::LBracket => {
                    self.bump()?;
                    let p = self.expression()?;
                    self.expect(T::RBracket, "]")?;
                    e = self
                        .syntax_tree
                        .member(e, p, true, false, self.span_from(start_offset));
                }
                T::LParen if calls => {
                    let arguments = self.arguments()?;
                    let span = self.span_from(start_offset);
                    e = self.close(arguments, |syntax_tree, arguments| {
                        syntax_tree.call(e, arguments, false, span)
                    });
                }
                T::Template { .. } => return self.fail("tagged templates are not supported"),
                T::Op
                    if self.typescript
                        && self.text(self.token) == "!"
                        && !self.token.newline_before =>
                {
                    let bang = self.bump()?;
                    self.typescript(e, TypeScriptKind::NonNull, bang.span);
                }
                T::Op
                    if calls
                        && self.typescript
                        && self.is_op("<")
                        && self.type_arguments_before_call() =>
                {
                    self.maybe_type_arguments(e)?;
                }
                _ => return Ok(e),
            }
        }
    }

    pub(super) fn property_name_ident(&mut self) -> R<NodeIdentifier> {
        match self.token.t {
            T::Identifier | T::PrivateName => {
                let t = self.bump()?;
                Ok(self.syntax_tree.ident(self.text(t), t.span))
            }
            _ => self.fail("expected property name"),
        }
    }

    pub(super) fn arguments(&mut self) -> R<List> {
        self.expect(T::LParen, "(")?;
        let arguments = self.open();
        while self.token.t != T::RParen {
            let start_offset = self.token.span.start_offset;
            let a = self.assignment_or_spread(start_offset)?;
            self.item(a);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect(T::RParen, ")")?;
        Ok(arguments)
    }

    pub(super) fn string_node(&mut self, t: LexedToken) -> NodeIdentifier {
        let body = Span::new(t.span.start_offset + 1, t.span.end_offset - 1);
        match decode_string(body.text(self.source_text)) {
            Some(v) => self.syntax_tree.str_owned(&v, t.span),
            None => self.syntax_tree.str_in_source(body, t.span),
        }
    }

    #[expect(
        clippy::cast_precision_loss,
        reason = "a JavaScript number is an f64 and rounds the same way"
    )]
    pub(super) fn number_value(text: &str) -> Option<f64> {
        let clean: String = text.chars().filter(|&c| c != '_').collect();
        let lower = clean.to_ascii_lowercase();
        let radix = |r| u64::from_str_radix(&lower[2..], r).ok().map(|v| v as f64);
        match lower.get(..2) {
            Some("0x") => radix(16),
            Some("0o") => radix(8),
            Some("0b") => radix(2),
            _ => lower.parse().ok(),
        }
    }
}
