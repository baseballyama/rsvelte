use super::{
    Kind, NodeIdentifier, Parser, R, Span, SyntaxTree, T, TypeScriptFeature, TypeScriptKind,
    TypeScriptRuntime, TypeScriptSyntax, parse_program,
};

impl Parser<'_, '_> {
    /// `type X = …`, `interface X {…}`, `declare …`, `enum …`, `namespace …`: skipped as one
    /// opaque statement. An enum, or a namespace holding values, also goes to
    /// [`SyntaxTree::ts_runtime`].
    pub(super) fn typescript_declaration(&mut self, start_offset: u32) -> R<NodeIdentifier> {
        let kw = self.text(self.token);
        if kw == "abstract" {
            return self.fail("unsupported statement `abstract class`");
        }
        let is_interface = kw == "interface";
        let is_namespace = matches!(kw, "namespace" | "module");
        self.bump()?;
        let is_enum = kw == "enum" || (kw == "declare" && self.is_kw("enum"));
        let mut body: Option<(u32, u32)> = None;
        if is_interface {
            if let Some(i) = self.typescript_interface(start_offset)? {
                return Ok(i);
            }
            self.in_type += 1;
            while self.token.t != T::LBrace {
                if self.token.t == T::Eof {
                    return self.fail("unterminated interface");
                }
                self.bump()?;
            }
            self.in_type -= 1;
            self.skip_balanced()?;
        } else {
            let mut depth = 0i32;
            self.in_type += 1;
            loop {
                match self.token.t {
                    T::Eof => break,
                    T::LBrace if depth == 0 && body.is_none() => {
                        body = Some((self.token.span.end_offset, self.token.span.end_offset));
                        depth += 1;
                    }
                    T::LParen | T::LBrace | T::LBracket => depth += 1,
                    T::RParen | T::RBrace | T::RBracket => {
                        if depth == 0 {
                            break;
                        }
                        depth -= 1;
                        if let (0, Some((open, _))) = (depth, body) {
                            body = Some((open, self.token.span.start_offset));
                        }
                        if depth == 0 && self.peek().newline_before && self.peek().t != T::Op {
                            self.bump()?;
                            break;
                        }
                    }
                    T::Semi if depth == 0 => break,
                    _ if depth == 0
                        && self.token.newline_before
                        && self.prev_end > start_offset
                        && !self.continues_type() =>
                    {
                        break;
                    }
                    _ => {}
                }
                self.bump()?;
            }
            self.in_type -= 1;
            self.eat(T::Semi)?;
        }
        let span = self.span_from(start_offset);
        if is_enum {
            self.syntax_tree.typescript_runtime.push(TypeScriptRuntime {
                feature: TypeScriptFeature::Enum,
                span,
            });
        } else if let (true, Some((open, close))) = (is_namespace, body) {
            self.namespace_runtime(Span::new(open, close), span)?;
        }
        Ok(self.syntax_tree.typescript_declaration(span))
    }

    /// Records the first construct in a namespace body that erasing types cannot remove: an enum
    /// anywhere inside it, else the namespace itself when any statement is not a type declaration.
    /// The body is parsed into a scratch tree, so none of its nodes join this one.
    pub(super) fn namespace_runtime(&mut self, body: Span, span: Span) -> R<()> {
        let mut scratch = SyntaxTree::new();
        let root = parse_program(&mut scratch, self.source_text, body, true)?;
        if let Some(&inner) = scratch.typescript_runtime.first() {
            self.syntax_tree.typescript_runtime.push(inner);
            return Ok(());
        }
        let Kind::Program(statements) = scratch.kind(root) else {
            unreachable!("parse_program returns a program")
        };
        let type_only = |n: NodeIdentifier| {
            matches!(
                scratch.kind(n),
                Kind::TypeScriptDeclaration | Kind::TypeScriptInterface { .. }
            )
        };
        let values = statements.iter().any(|&s| match scratch.kind(s) {
            Kind::ExportNamed(d) => !type_only(d),
            _ => !type_only(s),
        });
        if values {
            self.syntax_tree.typescript_runtime.push(TypeScriptRuntime {
                feature: TypeScriptFeature::NamespaceWithValues,
                span,
            });
        }
        Ok(())
    }

    /// `interface Name { key?: T; … }` with only property members, positioned after `interface`.
    /// `None` (having consumed up to the point of doubt) when the interface has any other shape;
    /// the caller then skips the rest as an opaque declaration.
    pub(super) fn typescript_interface(&mut self, start_offset: u32) -> R<Option<NodeIdentifier>> {
        if self.token.t != T::Identifier || self.peek().t != T::LBrace {
            return Ok(None);
        }
        let t = self.bump()?;
        let name = self.syntax_tree.ident(self.text(t), t.span);
        self.bump()?; // `{`
        let members = self.open();
        while self.token.t != T::RBrace {
            let Some(m) = self.typescript_prop_sig()? else {
                self.drop_list(members);
                return self.opaque_body_rest(start_offset).map(Some);
            };
            self.item(m);
        }
        self.bump()?; // `}`
        let span = self.span_from(start_offset);
        Ok(Some(self.close(members, |syntax_tree, members| {
            syntax_tree.typescript_interface(name, members, span)
        })))
    }

    /// `key?: T;` inside an interface body; `None` at the first token of any other member shape.
    pub(super) fn typescript_prop_sig(&mut self) -> R<Option<NodeIdentifier>> {
        let k = self.token;
        if k.t != T::Identifier
            || self.is_kw("readonly")
            || !matches!(self.peek().t, T::Colon | T::Question)
        {
            return Ok(None);
        }
        self.bump()?;
        let key = self.syntax_tree.ident(self.text(k), k.span);
        let optional = self.eat(T::Question)?;
        if self.token.t != T::Colon {
            return Ok(None);
        }
        let m = self.syntax_tree.typescript_prop_sig(key, optional, k.span);
        self.maybe_type_annotation(m)?;
        let terminated = self.eat(T::Semi)?
            || self.eat(T::Comma)?
            || self.token.newline_before
            || self.token.t == T::RBrace;
        Ok(terminated.then_some(m))
    }

    /// Skips to the `}` closing a body whose `{` is already consumed; the declaration is opaque.
    pub(super) fn opaque_body_rest(&mut self, start_offset: u32) -> R<NodeIdentifier> {
        let mut depth = 1i32;
        self.in_type += 1;
        loop {
            match self.token.t {
                T::LParen | T::LBrace | T::LBracket => depth += 1,
                T::RParen | T::RBrace | T::RBracket => depth -= 1,
                T::Eof => return self.fail("unbalanced brackets"),
                _ => {}
            }
            self.bump()?;
            if depth == 0 {
                self.in_type -= 1;
                return Ok(self
                    .syntax_tree
                    .typescript_declaration(self.span_from(start_offset)));
            }
        }
    }

    /// A token at the start of a line that still belongs to a type (`| B`, `& C`, `= …`).
    pub(super) fn continues_type(&self) -> bool {
        self.token.t == T::Op && matches!(self.text(self.token), "|" | "&" | "=")
    }

    pub(super) fn skip_balanced(&mut self) -> R<()> {
        let mut depth = 0i32;
        self.in_type += 1;
        loop {
            match self.token.t {
                T::LParen | T::LBrace | T::LBracket => depth += 1,
                T::RParen | T::RBrace | T::RBracket => depth -= 1,
                T::Eof => return self.fail("unbalanced brackets"),
                _ => {}
            }
            self.bump()?;
            if depth == 0 {
                self.in_type -= 1;
                return Ok(());
            }
        }
    }

    pub(super) fn maybe_type_annotation(&mut self, target: NodeIdentifier) -> R<()> {
        if self.typescript && self.token.t == T::Colon {
            self.bump()?;
            let start_offset = self.token.span.start_offset;
            self.skip_type(false)?;
            self.typescript(
                target,
                TypeScriptKind::Annotation,
                Span::new(start_offset, self.prev_end),
            );
        }
        Ok(())
    }

    pub(super) fn typescript(&mut self, node: NodeIdentifier, kind: TypeScriptKind, span: Span) {
        self.syntax_tree
            .typescript
            .push(TypeScriptSyntax { node, kind, span });
    }

    /// `: T` after a parameter list; the span is recorded once the function node exists.
    pub(super) fn maybe_return_type(&mut self, stop_at_arrow: bool) -> R<Option<Span>> {
        if !(self.typescript && self.token.t == T::Colon) {
            return Ok(None);
        }
        self.bump()?;
        let start_offset = self.token.span.start_offset;
        self.skip_type(stop_at_arrow)?;
        Ok(Some(Span::new(start_offset, self.prev_end)))
    }

    pub(super) fn maybe_type_parameters(&mut self) -> R<Option<Span>> {
        if !(self.typescript && self.is_op("<")) {
            return Ok(None);
        }
        let start_offset = self.token.span.start_offset;
        self.skip_type_parameters()?;
        Ok(Some(Span::new(start_offset, self.prev_end)))
    }

    pub(super) fn signature_typescript(
        &mut self,
        f: NodeIdentifier,
        type_parameters: Option<Span>,
        ret: Option<Span>,
    ) {
        if let Some(s) = type_parameters {
            self.typescript(f, TypeScriptKind::TypeParameters, s);
        }
        if let Some(s) = ret {
            self.typescript(f, TypeScriptKind::ReturnType, s);
        }
    }

    /// `<T>` between a callee and its arguments, recorded on the callee. `false`, consuming
    /// nothing, when the `<` is a comparison.
    pub(super) fn maybe_type_arguments(&mut self, callee: NodeIdentifier) -> R<bool> {
        if !(self.typescript && self.is_op("<") && self.type_arguments_before_call()) {
            return Ok(false);
        }
        let start_offset = self.token.span.start_offset;
        self.skip_type_parameters()?;
        self.typescript(
            callee,
            TypeScriptKind::TypeArgs,
            Span::new(start_offset, self.prev_end),
        );
        Ok(true)
    }

    /// Whether the `<` here opens a type argument list that a `(` follows. TypeScript reads
    /// `f<T>(x)` as a call with type arguments where JavaScript reads two comparisons; outside
    /// brackets, a token no type can contain means a comparison.
    pub(super) fn type_arguments_before_call(&self) -> bool {
        let mut l = self.lex;
        let mut scratch = Vec::new();
        let (mut angle, mut nest) = (1i32, 0i32);
        loop {
            let Ok(t) = l.next(&mut scratch) else {
                return false;
            };
            match t.t {
                T::Eof => return false,
                T::LParen | T::LBracket | T::LBrace => nest += 1,
                T::RParen | T::RBracket | T::RBrace => {
                    nest -= 1;
                    if nest < 0 {
                        return false;
                    }
                }
                T::Op => {
                    angle -= match self.text(t) {
                        "<" => -1,
                        ">" => 1,
                        ">>" => 2,
                        ">>>" => 3,
                        "|" | "&" | "-" => 0,
                        _ if nest > 0 => 0,
                        _ => return false,
                    };
                    if angle < 0 || (angle == 0 && nest != 0) {
                        return false;
                    }
                    if angle == 0 {
                        return l.next(&mut scratch).is_ok_and(|n| n.t == T::LParen);
                    }
                }
                T::Identifier
                | T::String
                | T::Number
                | T::Dot
                | T::Comma
                | T::Question
                | T::Colon
                | T::Arrow
                | T::Ellipsis => {}
                _ if nest > 0 => {}
                _ => return false,
            }
        }
    }

    pub(super) fn skip_type_parameters(&mut self) -> R<()> {
        let mut depth = 0i32;
        self.in_type += 1;
        loop {
            if self.is_op("<") {
                depth += 1;
            } else if self.is_op(">") {
                depth -= 1;
            } else if self.is_op(">>") {
                depth -= 2;
            } else if self.is_op(">>>") {
                depth -= 3;
            } else if self.token.t == T::Eof {
                return self.fail("unterminated type parameters");
            }
            self.bump()?;
            if depth <= 0 {
                self.in_type -= 1;
                return Ok(());
            }
        }
    }

    /// Skips a type. Stops (without consuming) at a depth-0 `,` `)` `]` `}` `;` `=` `?` or EOF, at
    /// a depth-0 `=>` when `stop_at_arrow`, and at a line break that cannot continue the type.
    pub(super) fn skip_type(&mut self, stop_at_arrow: bool) -> R<()> {
        let mut depth = 0i32;
        let start = self.token.span.start_offset;
        self.in_type += 1;
        loop {
            let t = self.token;
            if depth == 0 {
                let stop = match t.t {
                    T::Comma
                    | T::RParen
                    | T::RBracket
                    | T::RBrace
                    | T::Semi
                    | T::Eof
                    | T::Question => true,
                    T::Arrow => stop_at_arrow,
                    T::Op => matches!(self.text(t), "=" | "+=" | "-="),
                    T::LBrace if t.span.start_offset != start && !self.after_type_operator() => {
                        true
                    }
                    _ => t.newline_before && t.span.start_offset != start && !self.continues_type(),
                };
                if stop {
                    self.in_type -= 1;
                    return Ok(());
                }
            }
            match t.t {
                T::LParen | T::LBrace | T::LBracket => depth += 1,
                T::RParen | T::RBrace | T::RBracket => depth -= 1,
                T::Op => match self.text(t) {
                    "<" => depth += 1,
                    ">" => depth -= 1,
                    ">>" => depth -= 2,
                    ">>>" => depth -= 3,
                    _ => {}
                },
                _ => {}
            }
            self.bump()?;
        }
    }

    /// Whether the previous token makes a following `{` part of the type (`: {`, `| {`, `& {`,
    /// `<{`, `,{`).
    pub(super) fn after_type_operator(&self) -> bool {
        let prev = self.source_text[..self.prev_end as usize].trim_end();
        prev.ends_with(['|', '&', '<', ',', ':', '(', '[', '='])
    }
}
