use super::{
    AssignmentOperator, BinaryOperator, Kind, Lexer, LogicalOperator, NodeIdentifier, Parser, R,
    Span, T, TypeScriptKind, UnaryOperator, UpdateOperator,
};

impl Parser<'_, '_> {
    // ---- expressions
    // -----------------------------------------------------------------------------

    /// # Errors
    ///
    /// [`super::ParseError`] at the first lexical or syntax error.
    pub fn expression(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let first = self.assignment()?;
        if self.token.t != T::Comma {
            return Ok(first);
        }
        let mut items = vec![first];
        while self.eat(T::Comma)? {
            items.push(self.assignment()?);
        }
        Ok(self.syntax_tree.seq(&items, self.span_from(start_offset)))
    }

    pub(super) fn assignment(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        if let Some(arrow) = self.try_arrow()? {
            return Ok(arrow);
        }
        let left = self.conditional()?;
        if self.token.t == T::Op
            && let Some(op) = AssignmentOperator::parse(self.text(self.token))
        {
            let target = self.check_assign_target(left, op)?;
            self.bump()?;
            let value = self.assignment()?;
            return Ok(self
                .syntax_tree
                .assign(op, target, value, self.span_from(start_offset)));
        }
        Ok(left)
    }

    pub(super) fn check_assign_target(
        &mut self,
        e: NodeIdentifier,
        op: AssignmentOperator,
    ) -> R<NodeIdentifier> {
        match self.syntax_tree.kind(e) {
            Kind::Identifier(_) | Kind::Member { .. } => Ok(e),
            Kind::Object(_) | Kind::Array(_) if op == AssignmentOperator::Assign => {
                self.assignment_pattern(e)
            }
            _ => self.fail("invalid assignment target"),
        }
    }

    /// Parses an arrow function if one starts here.
    pub(super) fn try_arrow(&mut self) -> R<Option<NodeIdentifier>> {
        let start_offset = self.token.span.start_offset;
        let is_async = if self.is_kw("async")
            && !self.peek().newline_before
            && matches!(self.peek().t, T::LParen | T::Identifier)
        {
            let mut l = self.lex;
            let mut scratch = Vec::new();
            let after = l.next(&mut scratch)?;
            let arrow_follows = if after.t == T::Identifier {
                l.next(&mut scratch)?.t == T::Arrow
            } else {
                Self::paren_arrow_ahead(l, &mut scratch)?
            };
            if !arrow_follows {
                return Ok(None);
            }
            self.bump()?;
            true
        } else {
            false
        };
        let type_parameters = if self.typescript && self.is_op("<") && self.generic_arrow_ahead()? {
            self.maybe_type_parameters()?
        } else {
            None
        };
        let mut ret = None;
        let parameters = if self.token.t == T::Identifier
            && self.peek().t == T::Arrow
            && !self.peek().newline_before
        {
            let t = self.bump()?;
            let parameters = self.open();
            let p = self.syntax_tree.ident(self.text(t), t.span);
            self.item(p);
            parameters
        } else if self.token.t == T::LParen && Self::paren_arrow_ahead(self.lex, &mut Vec::new())? {
            let p = self.parameters()?;
            ret = self.maybe_return_type(true)?;
            p
        } else {
            return Ok(None);
        };
        if self.token.t != T::Arrow || self.token.newline_before {
            return self.fail("expected `=>`");
        }
        self.bump()?;
        let (body, expression_body) = if self.token.t == T::LBrace {
            (self.block()?, false)
        } else {
            (self.assignment()?, true)
        };
        let span = self.span_from(start_offset);
        let f = self.close(parameters, |syntax_tree, parameters| {
            syntax_tree.arrow(parameters, body, expression_body, is_async, span)
        });
        self.signature_typescript(f, type_parameters, ret);
        Ok(Some(f))
    }

    /// With the lexer positioned just after a `(`, whether the matching `)` is followed by `=>`
    /// (or, in TypeScript, by a return type and then `=>`).
    pub(super) fn paren_arrow_ahead(mut l: Lexer<'_>, scratch: &mut Vec<Span>) -> R<bool> {
        Self::lookahead_group(&mut l, scratch)?;
        let t = l.next(scratch)?;
        match t.t {
            T::Arrow => Ok(!t.newline_before),
            T::Colon => {
                let mut depth = 0i32;
                loop {
                    let t = l.next(scratch)?;
                    match t.t {
                        T::Arrow if depth == 0 => return Ok(true),
                        T::LParen | T::LBracket | T::LBrace => depth += 1,
                        T::RParen | T::RBracket | T::RBrace => {
                            if depth == 0 {
                                return Ok(false);
                            }
                            depth -= 1;
                        }
                        T::Comma | T::Semi | T::Question | T::Eof if depth == 0 => {
                            return Ok(false);
                        }
                        _ => {}
                    }
                }
            }
            _ => Ok(false),
        }
    }

    pub(super) fn conditional(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let test = self.binary(1)?;
        if self.token.t != T::Question {
            return Ok(test);
        }
        self.bump()?;
        let consequent = self.assignment()?;
        self.expect(T::Colon, ":")?;
        let alternate = self.assignment()?;
        Ok(self
            .syntax_tree
            .cond(test, consequent, alternate, self.span_from(start_offset)))
    }

    pub(super) fn binary_op(&self) -> Option<(u8, Result<BinaryOperator, LogicalOperator>)> {
        if !self.allow_in && self.is_kw("in") {
            return None;
        }
        let text = match self.token.t {
            T::Op => self.text(self.token),
            T::Identifier if matches!(self.text(self.token), "in" | "instanceof") => {
                self.text(self.token)
            }
            _ => return None,
        };
        if let Some(op) = LogicalOperator::parse(text) {
            return Some((op.precedence(), Err(op)));
        }
        BinaryOperator::parse(text).map(|op| (op.precedence(), Ok(op)))
    }

    pub(super) fn binary(&mut self, min: u8) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let mut left = self.unary()?;
        loop {
            if self.typescript
                && self.token.t == T::Identifier
                && matches!(self.text(self.token), "as" | "satisfies")
                && !self.token.newline_before
            {
                let kind = if self.text(self.token) == "as" {
                    TypeScriptKind::As
                } else {
                    TypeScriptKind::Satisfies
                };
                self.bump()?;
                let tlo = self.token.span.start_offset;
                self.skip_type(true)?;
                self.typescript(left, kind, Span::new(tlo, self.prev_end));
                continue;
            }
            let Some((prec, op)) = self.binary_op() else {
                break;
            };
            // `min` is the lowest precedence this call may consume; `**` is right-associative.
            let right_assoc = op == Ok(BinaryOperator::Exp);
            if prec < min {
                break;
            }
            self.bump()?;
            let right = self.binary(if right_assoc { prec } else { prec + 1 })?;
            let span = self.span_from(start_offset);
            left = match op {
                Ok(b) => self.syntax_tree.binary(b, left, right, span),
                Err(l) => self.syntax_tree.logical(l, left, right, span),
            };
        }
        Ok(left)
    }

    pub(super) fn unary(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let text = self.text(self.token);
        let op = match self.token.t {
            T::Op => UnaryOperator::parse(text).filter(|_| !matches!(text, "++" | "--")),
            T::Identifier if matches!(text, "typeof" | "void" | "delete") => {
                UnaryOperator::parse(text)
            }
            _ => None,
        };
        if let Some(op) = op {
            self.bump()?;
            let arg = self.unary()?;
            return Ok(self
                .syntax_tree
                .unary(op, arg, self.span_from(start_offset)));
        }
        if self.token.t == T::Op && matches!(text, "++" | "--") {
            self.bump()?;
            let arg = self.unary()?;
            let op = if text == "++" {
                UpdateOperator::Inc
            } else {
                UpdateOperator::Dec
            };
            return Ok(self
                .syntax_tree
                .update(op, true, arg, self.span_from(start_offset)));
        }
        if self.is_kw("await")
            && !matches!(
                self.peek().t,
                T::Arrow | T::Op | T::RParen | T::Comma | T::Semi | T::Eof
            )
        {
            self.bump()?;
            let arg = self.unary()?;
            return Ok(self.syntax_tree.await_(arg, self.span_from(start_offset)));
        }
        let e = self.lhs()?;
        if self.token.t == T::Op
            && !self.token.newline_before
            && matches!(self.text(self.token), "++" | "--")
        {
            let op = if self.text(self.token) == "++" {
                UpdateOperator::Inc
            } else {
                UpdateOperator::Dec
            };
            self.bump()?;
            return Ok(self
                .syntax_tree
                .update(op, false, e, self.span_from(start_offset)));
        }
        Ok(e)
    }
}

impl Parser<'_, '_> {
    fn generic_arrow_ahead(&self) -> R<bool> {
        let mut lexer = self.lex;
        let mut comments = Vec::new();
        let mut depth = 1i32;
        loop {
            let token = lexer.next(&mut comments)?;
            if token.t == T::Eof {
                return Ok(false);
            }
            if token.t == T::Op {
                depth += match lexer.text(token.span) {
                    "<" => 1,
                    ">" => -1,
                    ">>" => -2,
                    ">>>" => -3,
                    _ => 0,
                };
            }
            if depth <= 0 {
                break;
            }
        }
        let token = lexer.next(&mut comments)?;
        if token.t != T::LParen {
            return Ok(false);
        }
        Self::paren_arrow_ahead(lexer, &mut comments)
    }
}
