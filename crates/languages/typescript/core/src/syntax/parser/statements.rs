use super::{List, NodeIdentifier, Parser, R, RESERVED, T, TypeScriptKind, flag};

impl Parser<'_, '_> {
    // ---- statements
    // ------------------------------------------------------------------------------

    pub(super) fn statement(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        match self.token.t {
            T::LBrace => return self.block(),
            T::Semi => {
                self.bump()?;
                return Ok(self.syntax_tree.empty(self.span_from(start_offset)));
            }
            T::Identifier => {}
            _ => return self.expression_statement(),
        }
        let kw = self.text(self.token);
        if self.peek().t == T::Colon {
            let t = self.bump()?;
            let label = self.syntax_tree.ident(self.text(t), t.span);
            self.bump()?;
            let body = self.statement()?;
            return Ok(self.syntax_tree.control(
                crate::syntax_tree::Control::Labeled { label, body },
                self.span_from(start_offset),
            ));
        }
        match kw {
            "try" | "throw" | "while" | "do" | "switch" | "break" | "continue" | "debugger" => {
                self.control_statement(kw)
            }
            "for" => self.for_statement(),
            "class" => self.class_definition(true),
            "import" => {
                if matches!(self.peek().t, T::LParen | T::Dot) {
                    self.expression_statement()
                } else {
                    self.import()
                }
            }
            "yield" | "super" => self.expression_statement(),
            "export" => self.export(),
            "let" | "const" | "var" => {
                let d = self.var_declaration()?;
                self.semicolon()?;
                Ok(d)
            }
            "function" => self.function(true, start_offset, false),
            "async"
                if self.peek().t == T::Identifier
                    && self.text(self.peek()) == "function"
                    && !self.peek().newline_before =>
            {
                self.bump()?;
                self.function(true, start_offset, true)
            }
            "return" => {
                self.bump()?;
                let arg = if matches!(self.token.t, T::Semi | T::RBrace | T::Eof)
                    || self.token.newline_before
                {
                    None
                } else {
                    Some(self.expression()?)
                };
                self.semicolon()?;
                Ok(self.syntax_tree.return_(arg, self.span_from(start_offset)))
            }
            "if" => {
                self.bump()?;
                self.expect(T::LParen, "(")?;
                let test = self.expression()?;
                self.expect(T::RParen, ")")?;
                let consequent = self.statement()?;
                let alternate = if self.is_kw("else") {
                    self.bump()?;
                    Some(self.statement()?)
                } else {
                    None
                };
                Ok(self
                    .syntax_tree
                    .if_(test, consequent, alternate, self.span_from(start_offset)))
            }
            "type" | "interface" | "declare" | "abstract" | "enum" | "namespace" | "module"
                if self.typescript
                    && self.peek().t == T::Identifier
                    && !self.peek().newline_before =>
            {
                self.typescript_declaration(start_offset)
            }
            _ if RESERVED.contains(&kw) => self.fail(format!("unsupported statement `{kw}`")),
            _ => self.expression_statement(),
        }
    }

    pub(super) fn expression_statement(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let e = self.expression()?;
        self.semicolon()?;
        Ok(self
            .syntax_tree
            .expression_statement_at(e, self.span_from(start_offset)))
    }

    pub(super) fn block(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        self.expect(T::LBrace, "{")?;
        let previous = self.allow_in;
        self.allow_in = true;
        let body = self.open();
        while self.token.t != T::RBrace {
            if self.token.t == T::Eof {
                return self.fail("unterminated block");
            }
            let s = self.statement()?;
            self.item(s);
        }
        self.bump()?;
        self.allow_in = previous;
        let span = self.span_from(start_offset);
        Ok(self.close(body, |syntax_tree, body| syntax_tree.block(body, span)))
    }

    pub(super) fn var_declaration(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        let kw = self.bump()?;
        let kind = match self.text(kw) {
            "let" => flag::LET,
            "const" => flag::CONST,
            _ => flag::VAR,
        };
        let declarations = self.open();
        loop {
            let dlo = self.token.span.start_offset;
            let identifier = self.binding_target()?;
            self.maybe_type_annotation(identifier)?;
            let initializer = if self.eat_op("=")? {
                Some(self.assignment()?)
            } else {
                None
            };
            let d = self
                .syntax_tree
                .declarator(identifier, initializer, self.span_from(dlo));
            self.item(d);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        let span = self.span_from(start_offset);
        Ok(self.close(declarations, |syntax_tree, declarations| {
            syntax_tree.var_declaration(kind, declarations, span)
        }))
    }

    pub(super) fn function(
        &mut self,
        declaration: bool,
        start_offset: u32,
        is_async: bool,
    ) -> R<NodeIdentifier> {
        self.bump()?; // `function`
        let generator = self.eat_op("*")?;
        let name = if self.token.t == T::Identifier {
            let t = self.bump()?;
            Some(self.syntax_tree.ident(self.text(t), t.span))
        } else if declaration {
            return self.fail("expected function name");
        } else {
            None
        };
        let type_parameters = self.maybe_type_parameters()?;
        let parameters = self.parameters()?;
        let ret = self.maybe_return_type(false)?;
        let body = self.block()?;
        let span = self.span_from(start_offset);
        let f = self.close(parameters, |syntax_tree, parameters| {
            syntax_tree.function(declaration, name, parameters, body, is_async, span)
        });
        self.syntax_tree.mark_generator(f, generator);
        self.signature_typescript(f, type_parameters, ret);
        Ok(f)
    }

    pub(super) fn parameters(&mut self) -> R<List> {
        self.expect(T::LParen, "(")?;
        let parameters = self.open();
        while self.token.t != T::RParen {
            let p = self.param()?;
            self.item(p);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect(T::RParen, ")")?;
        Ok(parameters)
    }

    pub(super) fn param(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        if self.eat(T::Ellipsis)? {
            let arg = self.binding_target()?;
            self.maybe_type_annotation(arg)?;
            return Ok(self.syntax_tree.rest(arg, self.span_from(start_offset)));
        }
        let target = self.binding_target()?;
        if self.typescript && self.token.t == T::Question {
            let q = self.bump()?;
            self.typescript(target, TypeScriptKind::Optional, q.span);
        }
        self.maybe_type_annotation(target)?;
        if self.eat_op("=")? {
            let d = self.assignment()?;
            return Ok(self
                .syntax_tree
                .assign_pat(target, d, self.span_from(start_offset)));
        }
        Ok(target)
    }

    pub(super) fn import(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        self.bump()?;
        let type_only = if self.typescript
            && self.is_kw("type")
            && !matches!(self.peek().t, T::Comma)
            && !(self.peek().t == T::Identifier && self.text(self.peek()) == "from")
        {
            self.bump()?;
            true
        } else {
            false
        };
        let specs = self.open();
        if self.token.t != T::String {
            if self.token.t == T::Identifier {
                let t = self.bump()?;
                let local = self.syntax_tree.ident(self.text(t), t.span);
                let spec = self.syntax_tree.import_default(local, t.span);
                self.item(spec);
                self.eat(T::Comma)?;
            }
            if self.is_op("*") {
                let slo = self.token.span.start_offset;
                self.bump()?;
                if !self.is_kw("as") {
                    return self.fail("expected `as`");
                }
                self.bump()?;
                let t = self.expect(T::Identifier, "identifier")?;
                let local = self.syntax_tree.ident(self.text(t), t.span);
                let spec = self
                    .syntax_tree
                    .import_namespace(local, self.span_from(slo));
                self.item(spec);
            } else if self.token.t == T::LBrace {
                self.bump()?;
                while self.token.t != T::RBrace {
                    let slo = self.token.span.start_offset;
                    let spec_type = if self.typescript
                        && self.is_kw("type")
                        && self.peek().t == T::Identifier
                        && self.text(self.peek()) != "as"
                    {
                        self.bump()?;
                        true
                    } else {
                        false
                    };
                    let t = self.bump()?;
                    let imported = match t.t {
                        T::Identifier => self.syntax_tree.ident(self.text(t), t.span),
                        T::String => self.string_node(t),
                        _ => return self.fail("expected import name"),
                    };
                    let local = if self.is_kw("as") {
                        self.bump()?;
                        let l = self.expect(T::Identifier, "identifier")?;
                        self.syntax_tree.ident(self.text(l), l.span)
                    } else if t.t == T::Identifier {
                        self.syntax_tree.ident(self.text(t), t.span)
                    } else {
                        return self.fail("string import names need `as`");
                    };
                    let spec = self.syntax_tree.import_named(
                        imported,
                        local,
                        spec_type,
                        self.span_from(slo),
                    );
                    self.item(spec);
                    if !self.eat(T::Comma)? {
                        break;
                    }
                }
                self.expect(T::RBrace, "}")?;
            }
            if !self.is_kw("from") {
                return self.fail("expected `from`");
            }
            self.bump()?;
        }
        let s = self.expect(T::String, "module specifier")?;
        let source = self.string_node(s);
        let attributes = if self.is_kw("assert") || self.is_kw("with") {
            self.bump()?;
            Some(self.object()?)
        } else {
            None
        };
        self.semicolon()?;
        let span = self.span_from(start_offset);
        Ok(self.close(specs, |syntax_tree, specs| {
            syntax_tree.import_with_attributes(specs, source, type_only, attributes, span)
        }))
    }

    pub(super) fn export(&mut self) -> R<NodeIdentifier> {
        let start_offset = self.token.span.start_offset;
        self.bump()?;
        if self.is_kw("default") {
            self.bump()?;
            let e = if self.is_kw("function") {
                let flo = self.token.span.start_offset;
                self.function(false, flo, false)?
            } else {
                let e = self.assignment()?;
                self.semicolon()?;
                e
            };
            return Ok(self
                .syntax_tree
                .export_default(e, self.span_from(start_offset)));
        }
        if self.typescript
            && (self.is_kw("type") || self.is_kw("interface") || self.is_kw("enum"))
            && self.peek().t == T::Identifier
        {
            let d = self.typescript_declaration(self.token.span.start_offset)?;
            return Ok(self
                .syntax_tree
                .export_named(d, self.span_from(start_offset)));
        }
        if self.typescript && self.is_kw("type") && matches!(self.peek().t, T::LBrace | T::Op) {
            self.bump()?;
            let declaration = self.export_list(start_offset)?;
            return Ok(self
                .syntax_tree
                .typescript_declaration(self.syntax_tree.source_location(declaration)));
        }
        if self.token.t == T::LBrace || self.is_op("*") {
            return self.export_list(start_offset);
        }
        if self.is_kw("async")
            && self.peek().t == T::Identifier
            && self.text(self.peek()) == "function"
        {
            let lo = self.token.span.start_offset;
            self.bump()?;
            let function = self.function(true, lo, true)?;
            return Ok(self
                .syntax_tree
                .export_named(function, self.span_from(start_offset)));
        }
        let declaration = match self.token.t {
            T::Identifier if matches!(self.text(self.token), "let" | "const" | "var") => {
                let d = self.var_declaration()?;
                self.semicolon()?;
                d
            }
            T::Identifier if self.text(self.token) == "function" => {
                let flo = self.token.span.start_offset;
                self.function(true, flo, false)?
            }
            T::Identifier if self.is_kw("class") => self.class_definition(true)?,
            _ => return self.fail("unsupported export form"),
        };
        Ok(self
            .syntax_tree
            .export_named(declaration, self.span_from(start_offset)))
    }
}
