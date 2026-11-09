use super::{
    Kind, LexedToken, List, NodeIdentifier, Parser, R, Span, T, TypeDeclaration,
    TypeDeclarationKind, TypeScriptFeature, TypeScriptKind, TypeScriptRuntime, TypeScriptSyntax,
};
use crate::syntax_tree::Type;

impl Parser<'_, '_> {
    /// `type`, `interface`, `enum`, `namespace`, `module`, `declare …`, `const enum`: a
    /// [`crate::syntax_tree::Tag::TypeScriptDeclaration`] that holds what it declares. An enum, or
    /// a namespace holding values, also goes to [`crate::SyntaxTree::typescript_runtime`].
    pub(super) fn typescript_declaration(&mut self, start_offset: u32) -> R<NodeIdentifier> {
        self.in_type += 1;
        let declaration = self.declaration_body(start_offset);
        self.in_type -= 1;
        let declaration = declaration?;
        let span = self.span_from(start_offset);
        Ok(self
            .syntax_tree
            .typescript_declaration(Some(declaration), span))
    }

    fn declaration_body(&mut self, start_offset: u32) -> R<NodeIdentifier> {
        let kw = self.text(self.token);
        if kw == "const" {
            self.bump()?;
            return self.declaration_body(start_offset);
        }
        self.bump()?;
        self.type_declaration(kw, start_offset);
        let start = self.prev.span.start_offset;
        match kw {
            "type" => {
                let name = self.declared_name()?;
                let parameters = self.maybe_type_parameters_node()?;
                if !self.eat_op("=")? {
                    return self.fail("expected `=`");
                }
                let value = self.ty()?;
                let span = self.span_from(start);
                self.semicolon()?;
                Ok(self.syntax_tree.type_node(
                    Type::Alias {
                        name,
                        parameters,
                        value,
                    },
                    span,
                ))
            }
            "interface" => self.interface(start),
            "enum" => self.enumeration(start, start_offset),
            "namespace" | "module" | "global" => {
                let runtime = kw != "global" && !self.declared;
                self.module(start, runtime)
            }
            "declare" => {
                let declared = std::mem::replace(&mut self.declared, true);
                let inner = self.declared_body(start_offset);
                self.declared = declared;
                inner
            }
            _ => self.fail(format!("unsupported statement `{kw}`")),
        }
    }

    /// What follows `declare`.
    fn declared_body(&mut self, start_offset: u32) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        match self.text(self.token) {
            "const" if self.peek().t == T::Identifier && self.text(self.peek()) == "enum" => {
                self.declaration_body(start_offset)
            }
            "const" | "let" | "var" => {
                let d = self.var_declaration()?;
                self.semicolon()?;
                Ok(d)
            }
            "function" => self.function(true, start, false),
            "async" => {
                self.bump()?;
                self.function(true, start, true)
            }
            "abstract" => {
                self.bump()?;
                self.class_definition(true, start)
            }
            "class" => self.class_definition(true, start),
            _ => self.declaration_body(start_offset),
        }
    }

    fn declared_name(&mut self) -> R<NodeIdentifier> {
        let t = self.expect(T::Identifier, "a name")?;
        Ok(self.ident_node(t))
    }

    pub(super) fn maybe_type_parameters_node(&mut self) -> R<Option<NodeIdentifier>> {
        if self.is_op("<") {
            self.type_parameter_list().map(Some)
        } else {
            Ok(None)
        }
    }

    fn interface(&mut self, start: u32) -> R<NodeIdentifier> {
        let name = self.declared_name()?;
        let parameters = self.maybe_type_parameters_node()?;
        let heritage = if self.is_kw("extends") {
            self.bump()?;
            Some(self.heritage()?)
        } else {
            None
        };
        self.expect(T::LBrace, "{")?;
        let body = self.type_members()?;
        let span = self.span_from(start);
        Ok(self.close(body, |tree, body| {
            tree.type_node(
                Type::Interface {
                    name,
                    parameters,
                    heritage,
                    body,
                },
                span,
            )
        }))
    }

    fn enumeration(&mut self, start: u32, start_offset: u32) -> R<NodeIdentifier> {
        let name = self.declared_name()?;
        self.expect(T::LBrace, "{")?;
        let members = self.open();
        while self.token.t != T::RBrace {
            let t = self.token;
            let member_name = match t.t {
                T::Identifier => {
                    self.bump()?;
                    self.ident_node(t)
                }
                T::String => {
                    self.bump()?;
                    self.string_node(t)
                }
                _ => return self.fail("expected an enum member name"),
            };
            let initializer = if self.eat_op("=")? {
                Some(self.assignment()?)
            } else {
                None
            };
            let m = self.syntax_tree.type_node(
                Type::EnumMember {
                    name: member_name,
                    initializer,
                },
                self.span_from(t.span.start_offset),
            );
            self.item(m);
            if !self.eat(T::Comma)? {
                break;
            }
        }
        self.expect(T::RBrace, "}")?;
        let span = self.span_from(start);
        self.runtime(TypeScriptFeature::Enum, self.span_from(start_offset));
        Ok(self.close(members, |tree, members| {
            tree.type_node(Type::Enum { name, members }, span)
        }))
    }

    /// `namespace A.B { … }`, `module "m" { … }`, `module "m";`, `global { … }`, after the
    /// keyword. A body that is not `declare`d (`runtime`) must parse, and its runtime constructs
    /// are recorded; a `declare`d body this parser cannot read is skipped and has no statements.
    fn module(&mut self, start: u32, runtime: bool) -> R<NodeIdentifier> {
        let name = if self.prev.t == T::Identifier && self.text(self.prev) == "global" {
            self.syntax_tree.ident("global", self.prev.span)
        } else if self.token.t == T::String {
            let t = self.bump()?;
            self.string_node(t)
        } else {
            self.entity_name_value()?
        };
        if self.token.t != T::LBrace {
            let span = self.span_from(start);
            self.semicolon()?;
            return Ok(self
                .syntax_tree
                .type_node(Type::Module { name, body: None }, span));
        }
        let declarations = self.syntax_tree.type_declarations.len();
        let runtimes = self.syntax_tree.typescript_runtime.len();
        let checkpoint = self.checkpoint();
        let body = match self.module_body() {
            Ok(body) => body,
            Err(error) if runtime => return Err(error),
            Err(_) => {
                self.restore(checkpoint);
                self.skip_braces()?;
                return Ok(self
                    .syntax_tree
                    .type_node(Type::Module { name, body: None }, self.span_from(start)));
            }
        };
        for d in &mut self.syntax_tree.type_declarations[declarations..] {
            d.nested = true;
        }
        let span = self.span_from(start);
        if runtime {
            // The first construct erasing types cannot remove: an enum anywhere inside, else
            // the namespace itself when a statement is not a type declaration.
            self.syntax_tree.typescript_runtime.truncate(runtimes + 1);
            let tree = &*self.syntax_tree;
            let values = tree.scratch[body.0..].iter().any(|&s| {
                let s = match tree.kind(s) {
                    Kind::ExportNamed(d) => d,
                    _ => s,
                };
                !matches!(tree.kind(s), Kind::TypeScriptDeclaration)
            });
            if values && self.syntax_tree.typescript_runtime.len() == runtimes {
                self.runtime(TypeScriptFeature::NamespaceWithValues, span);
            }
        } else {
            self.syntax_tree.typescript_runtime.truncate(runtimes);
        }
        Ok(self.close(body, |tree, body| {
            tree.type_node(
                Type::Module {
                    name,
                    body: Some(body),
                },
                span,
            )
        }))
    }

    fn module_body(&mut self) -> R<List> {
        self.bump()?; // `{`
        let body = self.open();
        while self.token.t != T::RBrace {
            if self.token.t == T::Eof {
                return self.fail("unterminated namespace");
            }
            let s = self.statement()?;
            self.item(s);
        }
        self.bump()?;
        Ok(body)
    }

    /// Skips from a `{` through its matching `}`.
    fn skip_braces(&mut self) -> R<()> {
        let mut depth = 0i32;
        loop {
            match self.token.t {
                T::LParen | T::LBrace | T::LBracket => depth += 1,
                T::RParen | T::RBrace | T::RBracket => depth -= 1,
                T::Eof => return self.fail("unbalanced brackets"),
                _ => {}
            }
            self.bump()?;
            if depth == 0 {
                return Ok(());
            }
        }
    }

    /// `A` or `A.B` as a qualified name.
    pub(super) fn entity_name_value(&mut self) -> R<NodeIdentifier> {
        let start = self.token.span.start_offset;
        let mut name = self.declared_name()?;
        while self.token.t == T::Dot {
            self.bump()?;
            let right = self.property_name_ident()?;
            name = self
                .syntax_tree
                .type_node(Type::Qualified { left: name, right }, self.span_from(start));
        }
        Ok(name)
    }

    pub(super) fn runtime(&mut self, feature: TypeScriptFeature, span: Span) {
        self.syntax_tree
            .typescript_runtime
            .push(TypeScriptRuntime { feature, span });
    }

    /// Records the name, the current token, that the statement starting with keyword `kw`
    /// declares; after `declare`, the declaration that follows records it.
    fn type_declaration(&mut self, kw: &str, start_offset: u32) {
        let name = self.token;
        let kind = match kw {
            "type" => TypeDeclarationKind::Alias,
            "interface" => TypeDeclarationKind::Interface,
            "enum" => TypeDeclarationKind::Enum,
            "namespace" | "module" => TypeDeclarationKind::Namespace,
            _ => return,
        };
        if name.t == T::Identifier {
            let name = crate::lexer::identifier_name(self.text(name));
            let name = self.syntax_tree.atoms.intern(&name);
            self.syntax_tree.type_declarations.push(TypeDeclaration {
                name,
                kind,
                start_offset,
                nested: false,
            });
        }
    }

    /// `import name = A.B` or `import name = require("m")`, after `import` (and `type`).
    pub(super) fn import_equals(&mut self, start_offset: u32) -> R<NodeIdentifier> {
        let type_only = self.prev.t == T::Identifier && self.text(self.prev) == "type";
        let name = self.declared_name()?;
        self.bump()?; // `=`
        let reference = if self.is_kw("require") && self.peek().t == T::LParen {
            let start = self.token.span.start_offset;
            self.bump()?;
            self.bump()?;
            let s = self.expect(T::String, "a module specifier")?;
            let source = self.string_node(s);
            self.expect(T::RParen, ")")?;
            self.syntax_tree
                .type_node(Type::External(source), self.span_from(start))
        } else {
            self.entity_name_value()?
        };
        self.semicolon()?;
        let span = self.span_from(start_offset);
        if !type_only {
            self.runtime(TypeScriptFeature::ImportEquals, span);
        }
        let declaration = self
            .syntax_tree
            .type_node(Type::ImportEquals { name, reference }, span);
        Ok(self
            .syntax_tree
            .typescript_declaration(Some(declaration), span))
    }

    /// `export = value;` and `export as namespace N;`, after `export`.
    pub(super) fn export_assignment(&mut self, start_offset: u32) -> R<NodeIdentifier> {
        let declaration = if self.eat_op("=")? {
            let value = self.expression()?;
            self.semicolon()?;
            let span = self.span_from(start_offset);
            self.runtime(TypeScriptFeature::ExportAssignment, span);
            self.syntax_tree
                .type_node(Type::ExportAssignment(value), span)
        } else {
            self.bump()?; // `as`
            self.bump()?; // `namespace`
            let name = self.declared_name()?;
            self.semicolon()?;
            self.syntax_tree
                .type_node(Type::NamespaceExport(name), self.span_from(start_offset))
        };
        let span = self.span_from(start_offset);
        Ok(self
            .syntax_tree
            .typescript_declaration(Some(declaration), span))
    }

    pub(super) fn maybe_type_annotation(&mut self, target: NodeIdentifier) -> R<()> {
        if self.typescript && self.token.t == T::Colon {
            self.bump()?;
            let start_offset = self.token.span.start_offset;
            let ty = self.ty()?;
            self.typescript(
                target,
                TypeScriptKind::Annotation,
                Span::new(start_offset, self.prev_end),
                ty,
            );
        }
        Ok(())
    }

    pub(super) fn typescript(
        &mut self,
        node: NodeIdentifier,
        kind: TypeScriptKind,
        span: Span,
        syntax: NodeIdentifier,
    ) {
        self.syntax_tree.typescript.push(TypeScriptSyntax {
            node,
            kind,
            span,
            syntax,
        });
    }

    /// `: T` after a parameter list; recorded once the function node exists.
    pub(super) fn maybe_return_type(&mut self) -> R<Option<(Span, NodeIdentifier)>> {
        if !(self.typescript && self.token.t == T::Colon) {
            return Ok(None);
        }
        self.bump()?;
        let start_offset = self.token.span.start_offset;
        let ty = self.return_type()?;
        Ok(Some((Span::new(start_offset, self.prev_end), ty)))
    }

    pub(super) fn maybe_type_parameters(&mut self) -> R<Option<(Span, NodeIdentifier)>> {
        if !(self.typescript && self.is_op("<")) {
            return Ok(None);
        }
        let start_offset = self.token.span.start_offset;
        let ty = self.type_parameter_list()?;
        Ok(Some((Span::new(start_offset, self.prev_end), ty)))
    }

    pub(super) fn signature_typescript(
        &mut self,
        f: NodeIdentifier,
        type_parameters: Option<(Span, NodeIdentifier)>,
        ret: Option<(Span, NodeIdentifier)>,
    ) {
        if let Some((s, ty)) = type_parameters {
            self.typescript(f, TypeScriptKind::TypeParameters, s, ty);
        }
        if let Some((s, ty)) = ret {
            self.typescript(f, TypeScriptKind::ReturnType, s, ty);
        }
    }

    /// `<T>` after an expression (`f<T>(…)`, `new C<T>(…)`, `f<T>`), recorded on it. `false`,
    /// consuming nothing, when the `<` is a comparison.
    pub(super) fn maybe_type_arguments(&mut self, callee: NodeIdentifier) -> R<bool> {
        if !(self.typescript && self.is_op("<") && self.type_arguments_before_call()) {
            return Ok(false);
        }
        let start_offset = self.token.span.start_offset;
        let ty = self.type_argument_list()?;
        self.typescript(
            callee,
            TypeScriptKind::TypeArgs,
            Span::new(start_offset, self.prev_end),
            ty,
        );
        Ok(true)
    }

    /// Whether the `<` here opens a type argument list after an expression. TypeScript reads
    /// `f<T>(x)` as a call with type arguments where JavaScript reads two comparisons; outside
    /// brackets, a token no type can contain means a comparison, and so does a `>` that an operand
    /// follows on the same line (`a < b > c`).
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
                        return l
                            .next(&mut scratch)
                            .is_ok_and(|next| self.follows_type_arguments(next));
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

    /// TypeScript's `canFollowTypeArgumentsInExpression`: whether `next`, the token after a
    /// closing `>`, leaves the list type arguments.
    fn follows_type_arguments(&self, next: LexedToken) -> bool {
        match next.t {
            T::LParen | T::Template { .. } => true,
            T::Op if matches!(self.text(next), "<" | ">" | "+" | "-") => false,
            _ if next.newline_before => true,
            T::Op => !matches!(self.text(next), "!" | "~" | "++" | "--"),
            T::Identifier => matches!(self.text(next), "as" | "satisfies" | "in" | "instanceof"),
            T::RParen
            | T::RBracket
            | T::RBrace
            | T::Semi
            | T::Comma
            | T::Colon
            | T::Question
            | T::QuestionDot
            | T::Dot
            | T::Arrow
            | T::Eof => true,
            _ => false,
        }
    }
}

#[cfg(test)]
mod tests;
