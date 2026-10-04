use super::{Kind, NodeIdentifier, Parser, R, T};
use crate::syntax_tree::Control;

impl Parser<'_, '_> {
    pub(super) fn control_statement(&mut self, keyword: &str) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        self.bump()?;
        let control = match keyword {
            "throw" => {
                if self.token.newline_before {
                    return self.fail("a line break is not allowed after throw");
                }
                let value = self.expression()?;
                self.semicolon()?;
                Control::Throw(value)
            }
            "try" => {
                let block = self.block()?;
                let handler = if self.is_kw("catch") {
                    let lo = self.token.span.start_offset;
                    self.bump()?;
                    let parameter = if self.eat(T::LParen)? {
                        let p = self.binding_target()?;
                        self.maybe_type_annotation(p)?;
                        self.expect(T::RParen, ")")?;
                        Some(p)
                    } else {
                        None
                    };
                    let body = self.block()?;
                    Some(
                        self.syntax_tree
                            .control(Control::Catch { parameter, body }, self.span_from(lo)),
                    )
                } else {
                    None
                };
                let finalizer = if self.is_kw("finally") {
                    self.bump()?;
                    Some(self.block()?)
                } else {
                    None
                };
                if handler.is_none() && finalizer.is_none() {
                    return self.fail("try needs catch or finally");
                }
                Control::Try {
                    block,
                    handler,
                    finalizer,
                }
            }
            "while" => {
                let test = self.parenthesized_test()?;
                let body = self.statement()?;
                Control::While {
                    test,
                    body,
                    is_do: false,
                }
            }
            "do" => {
                let body = self.statement()?;
                if !self.is_kw("while") {
                    return self.fail("expected while");
                }
                self.bump()?;
                let test = self.parenthesized_test()?;
                self.eat(T::Semi)?;
                Control::While {
                    test,
                    body,
                    is_do: true,
                }
            }
            "break" | "continue" => {
                let label = if !self.token.newline_before && self.token.t == T::Identifier {
                    let t = self.bump()?;
                    Some(self.syntax_tree.ident(self.text(t), t.span))
                } else {
                    None
                };
                self.semicolon()?;
                Control::Jump {
                    label,
                    is_continue: keyword == "continue",
                }
            }
            "debugger" => {
                self.semicolon()?;
                Control::Debugger
            }
            "switch" => return self.switch_statement(start),
            _ => unreachable!("a control keyword"),
        };
        Ok(self.syntax_tree.control(control, self.span_from(start)))
    }

    fn switch_statement(&mut self, start: u32) -> R<NodeIdentifier> {
        let discriminant = self.parenthesized_test()?;
        self.expect(T::LBrace, "{")?;
        let cases = self.open();
        let mut default = false;
        while self.token.t != T::RBrace {
            let lo = self.token.span.start_offset;
            let test = if self.is_kw("case") {
                self.bump()?;
                Some(self.expression()?)
            } else if self.is_kw("default") {
                if default {
                    return self.fail("duplicate switch default");
                }
                default = true;
                self.bump()?;
                None
            } else {
                return self.fail("expected case or default");
            };
            self.expect(T::Colon, ":")?;
            let body = self.open();
            while self.token.t != T::RBrace && !self.is_kw("case") && !self.is_kw("default") {
                if self.token.t == T::Eof {
                    return self.fail("unterminated switch");
                }
                let node = self.statement()?;
                self.item(node);
            }
            let span = self.span_from(lo);
            let case = self.close(body, |tree, consequent| {
                tree.control(Control::Case { test, consequent }, span)
            });
            self.item(case);
        }
        self.bump()?;
        let span = self.span_from(start);
        Ok(self.close(cases, |tree, cases| {
            tree.control(
                Control::Switch {
                    discriminant,
                    cases,
                },
                span,
            )
        }))
    }

    fn parenthesized_test(&mut self) -> R<NodeIdentifier> {
        self.expect(T::LParen, "(")?;
        let value = self.expression()?;
        self.expect(T::RParen, ")")?;
        Ok(value)
    }

    pub(super) fn for_statement(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        self.bump()?;
        let is_await = if self.is_kw("await") {
            self.bump()?;
            true
        } else {
            false
        };
        self.expect(T::LParen, "(")?;
        let previous = self.allow_in;
        self.allow_in = false;
        let initializer = if self.token.t == T::Semi {
            None
        } else if self.is_kw("let") || self.is_kw("const") || self.is_kw("var") {
            Some(self.var_declaration()?)
        } else {
            Some(self.expression()?)
        };
        self.allow_in = previous;
        if self.is_kw("in") || self.is_kw("of") {
            let is_of = self.is_kw("of");
            self.bump()?;
            let left = initializer.ok_or_else(|| super::ParseError {
                message: "expected loop binding".into(),
                span: self.token.span,
            })?;
            let left = if let Kind::VariableDeclaration { declarations, .. } =
                self.syntax_tree.kind(left)
            {
                if declarations.len() != 1 {
                    return self.fail("expected one loop binding");
                }
                left
            } else {
                self.check_assign_target(left, super::AssignmentOperator::Assign)?
            };
            if is_await && !is_of {
                return self.fail("for await needs of");
            }
            let right = if is_of {
                self.assignment()?
            } else {
                self.expression()?
            };
            self.expect(T::RParen, ")")?;
            let body = self.statement()?;
            return Ok(self.syntax_tree.control(
                Control::ForEach {
                    left,
                    right,
                    body,
                    is_of,
                    is_await,
                },
                self.span_from(start),
            ));
        }
        if is_await {
            return self.fail("for await needs of");
        }
        self.expect(T::Semi, ";")?;
        let test = if self.token.t == T::Semi {
            None
        } else {
            Some(self.expression()?)
        };
        self.expect(T::Semi, ";")?;
        let update = if self.token.t == T::RParen {
            None
        } else {
            Some(self.expression()?)
        };
        self.expect(T::RParen, ")")?;
        let body = self.statement()?;
        Ok(self
            .syntax_tree
            .for_(initializer, test, update, body, self.span_from(start)))
    }
}

impl Parser<'_, '_> {
    pub(super) fn export_list(&mut self, start: u32) -> R<NodeIdentifier> {
        if self.eat_op("*")? {
            let exported = if self.is_kw("as") {
                self.bump()?;
                Some(self.export_name()?)
            } else {
                None
            };
            if !self.is_kw("from") {
                return self.fail("expected from");
            }
            self.bump()?;
            let token = self.expect(T::String, "module specifier")?;
            let source = self.string_node(token);
            self.semicolon()?;
            return Ok(self.syntax_tree.control(
                Control::ExportAll { source, exported },
                self.span_from(start),
            ));
        }
        self.expect(T::LBrace, "{")?;
        let specs = self.open();
        while self.token.t != T::RBrace {
            let lo = self.token.span.start_offset;
            let local = self.export_name()?;
            let exported = if self.is_kw("as") {
                self.bump()?;
                self.export_name()?
            } else {
                local
            };
            let spec = self.syntax_tree.control(
                Control::ExportSpecifier { local, exported },
                self.span_from(lo),
            );
            self.item(spec);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect(T::RBrace, "}")?;
        let source = if self.is_kw("from") {
            self.bump()?;
            let token = self.expect(T::String, "module specifier")?;
            Some(self.string_node(token))
        } else {
            None
        };
        self.semicolon()?;
        let span = self.span_from(start);
        Ok(self.close(specs, |tree, specifiers| {
            tree.control(Control::ExportList { specifiers, source }, span)
        }))
    }

    fn export_name(&mut self) -> R<NodeIdentifier> {
        let token = self.bump()?;
        match token.t {
            T::Identifier => Ok(self.syntax_tree.ident(self.text(token), token.span)),
            T::String => Ok(self.string_node(token)),
            _ => self.fail("expected export name"),
        }
    }
}
