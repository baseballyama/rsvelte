use super::{
    Formatter, Kind, LayoutInstructionIdentifier, NodeIdentifier, PatternContext, R, Slot,
    TypeScriptKind, Unsupported, flag,
};
use rsvelte_typescript_syntax::SyntaxTree;
use rsvelte_typescript_syntax::syntax_tree::Type;

impl Formatter<'_> {
    /// Prettier's `printFunction`.
    pub(super) fn function(
        &mut self,
        identifier: NodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let Kind::Function {
            name,
            parameters,
            body,
            is_async,
            ..
        } = self.syntax_tree.kind(identifier)
        else {
            unreachable!("a function")
        };
        if self
            .typescript_of(identifier, TypeScriptKind::TypeParameters)
            .is_some()
        {
            return Err(Unsupported::at(
                "type parameters",
                self.syntax_tree.source_location(identifier),
            ));
        }
        self.refuse_object_return_type(identifier)?;
        let mut parts = Vec::new();
        if is_async {
            parts.push(self.lit("async "));
        }
        let generator = self.syntax_tree.flags(identifier) & flag::GENERATOR != 0;
        parts.push(self.lit(if generator { "function* " } else { "function " }));
        if let Some(n) = name {
            parts.push(self.docs.text(self.syntax_tree.name(n)));
        }
        // `shouldGroupFunctionParameters` needs an object-type or breaking return type; a plain
        // type reference is neither.
        let saved = self.in_async;
        // `await` in a parameter list is an error, async or not.
        self.in_async = Some(false);
        let ps = self.parameters(parameters);
        self.in_async = Some(is_async);
        let b = ps.and_then(|ps| Ok((ps, self.block(body, true)?)));
        self.in_async = saved;
        let (ps, b) = b?;
        let ret = self.type_suffix(
            self.typescript_of(identifier, TypeScriptKind::ReturnType),
            ": ",
        )?;
        parts.push(self.docs.group(&[ps, ret]));
        parts.push(self.lit(" "));
        parts.push(b);
        Ok(self.cat(&parts))
    }

    /// Prettier's `printFunctionParameters`.
    pub(super) fn parameters(
        &mut self,
        parameters: &[NodeIdentifier],
    ) -> R<LayoutInstructionIdentifier> {
        if parameters.is_empty() {
            return Ok(self.lit("()"));
        }
        if let [p] = parameters
            && self.is_object_type(self.typescript_of(*p, TypeScriptKind::Annotation))
        {
            return Err(Unsupported::at(
                "the only parameter with an object type, which Prettier hugs",
                self.syntax_tree.source_location(*p),
            ));
        }
        let hug = self.hug_only_param(parameters);
        let mut printed = Vec::new();
        for (i, &p) in parameters.iter().enumerate() {
            printed.push(self.pattern(p, PatternContext::Param { hug })?);
            if i + 1 < parameters.len() {
                printed.push(self.lit(","));
                printed.push(self.docs.line());
            }
        }
        if hug {
            let open = self.lit("(");
            let close = self.lit(")");
            let mut parts = vec![open];
            parts.extend(printed);
            parts.push(close);
            return Ok(self.cat(&parts));
        }
        let ends_in_rest = matches!(
            self.syntax_tree
                .kind(*parameters.last().expect("non-empty")),
            Kind::Rest(_)
        );
        let trailing = if ends_in_rest {
            self.docs.nil()
        } else {
            self.trailing_comma()
        };
        let soft = self.docs.softline();
        let soft2 = self.docs.softline();
        let parts = self.bracketed("(", soft, printed, trailing, soft2, ")");
        Ok(self.cat(&parts))
    }

    /// Prettier's `shouldHugTheOnlyFunctionParameter`.
    /// Whether a type annotation or return type is an object type (`{ … }`), which changes how
    /// Prettier groups the parameters.
    pub(super) fn is_object_type(
        &self,
        span: Option<rsvelte_kernel::source::positions::Span>,
    ) -> bool {
        span.is_some_and(|s| {
            s.text(self.source_text)
                .trim_start_matches([':', ' ', '\t', '\n', '\r'])
                .starts_with('{')
        })
    }

    /// Refuses an object return type, with which Prettier groups the parameters differently.
    pub(super) fn refuse_object_return_type(&self, function: NodeIdentifier) -> R<()> {
        let ret = self.typescript_of(function, TypeScriptKind::ReturnType);
        if self.is_object_type(ret) {
            return Err(Unsupported::at(
                "an object return type",
                self.syntax_tree.source_location(function),
            ));
        }
        Ok(())
    }

    pub(super) fn hug_only_param(&self, parameters: &[NodeIdentifier]) -> bool {
        let [p] = parameters else { return false };
        match self.syntax_tree.kind(*p) {
            Kind::ObjectPattern(_) | Kind::ArrayPattern(_) => true,
            Kind::AssignPattern(l, r) => {
                matches!(
                    self.syntax_tree.kind(l),
                    Kind::ObjectPattern(_) | Kind::ArrayPattern(_)
                ) && match self.syntax_tree.kind(r) {
                    Kind::Identifier(_) => true,
                    Kind::Object(p) => p.is_empty(),
                    Kind::Array(e) => e.is_empty(),
                    _ => false,
                }
            }
            _ => false,
        }
    }

    /// Prettier's `printBlock`; `fn_body` for the bodies that print `{}` when empty.
    pub(super) fn block(
        &mut self,
        identifier: NodeIdentifier,
        fn_body: bool,
    ) -> R<LayoutInstructionIdentifier> {
        let Kind::Block(body) = self.syntax_tree.kind(identifier) else {
            return Err(Unsupported::at(
                "non-block body",
                self.syntax_tree.source_location(identifier),
            ));
        };
        let statements = self.statements(body, fn_body)?;
        Ok(self.braced(statements, fn_body))
    }

    /// A block's braces around its printed statements.
    pub(super) fn braced(
        &mut self,
        statements: Vec<LayoutInstructionIdentifier>,
        fn_body: bool,
    ) -> LayoutInstructionIdentifier {
        let open = self.lit("{");
        let close = self.lit("}");
        if statements.is_empty() {
            if fn_body {
                return self.cat(&[open, close]);
            }
            let h = self.docs.hardline();
            return self.cat(&[open, h, close]);
        }
        let h = self.docs.hardline();
        let mut inner = vec![h];
        inner.extend(statements);
        let inner = self.cat(&inner);
        let inner = self.docs.indent(inner);
        let h = self.docs.hardline();
        self.cat(&[open, inner, h, close])
    }

    /// Prettier's `printReturnOrThrowArgument`.
    pub(super) fn return_(
        &mut self,
        identifier: NodeIdentifier,
        arg: Option<NodeIdentifier>,
    ) -> R<LayoutInstructionIdentifier> {
        let kw = self.lit("return");
        let semi = self.lit(";");
        let Some(a) = arg else {
            return Ok(self.cat(&[kw, semi]));
        };
        let printed = self.expression(a, Some(identifier), Slot::Argument)?;
        let sp = self.lit(" ");
        let arg = if matches!(
            self.syntax_tree.kind(a),
            Kind::Binary(..) | Kind::Logical(..) | Kind::Sequence(_)
        ) {
            let lp = self.lit("(");
            let e = self.docs.nil();
            let open = self.docs.if_break(lp, e);
            let soft = self.docs.softline();
            let inner = self.cat(&[soft, printed]);
            let inner = self.docs.indent(inner);
            let soft = self.docs.softline();
            let rp = self.lit(")");
            let e = self.docs.nil();
            let close = self.docs.if_break(rp, e);
            self.docs.group(&[open, inner, soft, close])
        } else {
            printed
        };
        Ok(self.cat(&[kw, sp, arg, semi]))
    }

    /// Prettier's `printIfStatement`.
    pub(super) fn if_(
        &mut self,
        identifier: NodeIdentifier,
        test: NodeIdentifier,
        consequent: NodeIdentifier,
        alternate: Option<NodeIdentifier>,
    ) -> R<LayoutInstructionIdentifier> {
        // `else if` chains nest thousands deep in real input, so each `if` whose `else` is another
        // one waits on a stack instead of recursing.
        let mut open = Vec::new();
        let (mut identifier, mut test, mut consequent, mut alternate) =
            (identifier, test, consequent, alternate);
        let mut document = loop {
            let t = self.expression(test, Some(identifier), Slot::Test)?;
            let soft = self.docs.softline();
            let inner = self.cat(&[soft, t]);
            let inner = self.docs.indent(inner);
            let soft = self.docs.softline();
            let test_doc = self.docs.group(&[inner, soft]);
            // An operator test is not grouped (`isInsideParenthesis`): once the parentheses break,
            // every operator breaks, which is not built.
            let test_doc = if matches!(
                self.syntax_tree.kind(test),
                Kind::Binary(..) | Kind::Logical(..)
            ) {
                self.docs.flat_only(test_doc)
            } else {
                test_doc
            };
            let open_paren = self.lit("if (");
            let close = self.lit(")");
            let c = self.clause(consequent, false)?;
            let opening = self.docs.group(&[open_paren, test_doc, close, c]);
            let mut parts = vec![opening];
            let Some(a) = alternate else {
                break self.docs.group(&parts);
            };
            let same_line = matches!(self.syntax_tree.kind(consequent), Kind::Block(_));
            parts.push(if same_line {
                self.lit(" ")
            } else {
                self.docs.hardline()
            });
            parts.push(self.lit("else"));
            if let Kind::If {
                test: t,
                consequent: c,
                alternate: e,
            } = self.syntax_tree.kind(a)
            {
                open.push(parts);
                (identifier, test, consequent, alternate) = (a, t, c, e);
                continue;
            }
            let a = self.clause(a, false)?;
            parts.push(self.docs.group(&[a]));
            break self.docs.group(&parts);
        };
        while let Some(mut parts) = open.pop() {
            // `clause(else_if, true)`: a space, then the nested `if`.
            let sp = self.lit(" ");
            let a = self.cat(&[sp, document]);
            parts.push(self.docs.group(&[a]));
            document = self.docs.group(&parts);
        }
        Ok(document)
    }

    /// Prettier's `adjustClause`.
    pub(super) fn clause(
        &mut self,
        body: NodeIdentifier,
        force_space: bool,
    ) -> R<LayoutInstructionIdentifier> {
        match self.syntax_tree.kind(body) {
            Kind::Empty => Ok(self.lit(";")),
            Kind::Block(_) => {
                let b = self.block(body, false)?;
                let sp = self.lit(" ");
                Ok(self.cat(&[sp, b]))
            }
            _ => {
                let s = match self.syntax_tree.kind(body) {
                    // Only a string in a statement list could read as a directive and is wrapped.
                    Kind::ExpressionStatement(e)
                        if matches!(self.syntax_tree.kind(e), Kind::String) =>
                    {
                        let e = self.expression(e, None, Slot::Statement)?;
                        let semi = self.lit(";");
                        self.cat(&[e, semi])
                    }
                    _ => self.statement(body)?,
                };
                if force_space {
                    let sp = self.lit(" ");
                    Ok(self.cat(&[sp, s]))
                } else {
                    let line = self.docs.line();
                    let inner = self.cat(&[line, s]);
                    Ok(self.docs.indent(inner))
                }
            }
        }
    }

    /// Prettier's `printImportDeclaration`, without import attributes.
    pub(super) fn import(
        &mut self,
        identifier: NodeIdentifier,
        specifiers: &[NodeIdentifier],
        source: NodeIdentifier,
        type_only: bool,
    ) -> LayoutInstructionIdentifier {
        let mut parts = vec![self.lit(if type_only { "import type" } else { "import" })];
        // Prettier keeps written empty braces (`import {} from "x"`), which the tree has no node
        // for.
        let empty_braces = specifiers.is_empty()
            && self.source_text[self.span(identifier).start_offset as usize
                ..self.span(source).start_offset as usize]
                .contains('{');
        if empty_braces {
            parts.push(self.lit(" {} from"));
        } else if !specifiers.is_empty() {
            parts.push(self.lit(" "));
            let mut standalone = Vec::new();
            let mut named = Vec::new();
            for &s in specifiers {
                match self.syntax_tree.kind(s) {
                    Kind::ImportDefault(l) => {
                        standalone.push(self.docs.text(self.syntax_tree.name(l)));
                    }
                    Kind::ImportNamespace(l) => {
                        let text = format!("* as {}", self.syntax_tree.name(l));
                        standalone.push(self.docs.text(&text));
                    }
                    Kind::ImportNamed { imported, local } => {
                        let i = self.syntax_tree.name(imported);
                        let l = self.syntax_tree.name(local);
                        let tk = if self.syntax_tree.flags(s) & flag::TYPE_ONLY != 0 {
                            "type "
                        } else {
                            ""
                        };
                        let text = if i == l {
                            format!("{tk}{i}")
                        } else {
                            format!("{tk}{i} as {l}")
                        };
                        named.push(self.docs.text(&text));
                    }
                    _ => unreachable!("import specifier"),
                }
            }
            let sep = self.lit(", ");
            parts.extend(self.docs.join(sep, &standalone));
            if !named.is_empty() {
                if !standalone.is_empty() {
                    parts.push(self.lit(", "));
                }
                if named.len() > 1 || !standalone.is_empty() {
                    let comma = self.lit(",");
                    let l = self.docs.line();
                    let sep = self.cat(&[comma, l]);
                    let items = self.docs.join(sep, &named);
                    let line = self.docs.line();
                    let trailing = self.trailing_comma();
                    let line2 = self.docs.line();
                    let g = self.bracketed("{", line, items, trailing, line2, "}");
                    parts.push(self.docs.group(&g));
                } else {
                    parts.push(self.lit("{ "));
                    parts.push(named[0]);
                    parts.push(self.lit(" }"));
                }
            }
            parts.push(self.lit(" from"));
        }
        parts.push(self.lit(" "));
        parts.push(self.string(source));
        parts.push(self.lit(";"));
        self.cat(&parts)
    }

    /// `interface Name { key?: T; }` as Prettier prints a `TSInterfaceDeclaration` whose body has
    /// only property signatures: one member per line, each ending in `;`. Any other TypeScript
    /// declaration is unsupported.
    pub(super) fn interface(
        &mut self,
        statement: NodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let Some((name, members)) = plain_interface(self.syntax_tree, statement) else {
            return Err(Unsupported::at(
                "TypeScript declaration",
                self.syntax_tree.source_location(statement),
            ));
        };
        let head = format!("interface {} ", self.syntax_tree.name(name));
        let head = self.docs.text(&head);
        if members.is_empty() {
            let b = self.lit("{}");
            return Ok(self.cat(&[head, b]));
        }
        let mut inner = Vec::new();
        for (i, &m) in members.iter().enumerate() {
            let Kind::Type(Type::Property {
                key,
                value: Some(value),
                optional,
                ..
            }) = self.syntax_tree.kind(m)
            else {
                unreachable!("a plain interface member")
            };
            inner.push(self.docs.hardline());
            // A member's span ends at its key; its type may run over several lines.
            if let Some(&previous) = i.checked_sub(1).and_then(|j| members.get(j)) {
                let end = self
                    .typescript_of(previous, TypeScriptKind::Annotation)
                    .map_or_else(|| self.span(previous).end_offset, |t| t.end_offset);
                let end = self.lines.line_column(end).line;
                let start = self.lines.line_column(self.span(m).start_offset).line;
                if start > end + 1 {
                    inner.push(self.docs.hardline());
                }
            }
            inner.push(self.docs.text(self.syntax_tree.name(key)));
            if optional {
                inner.push(self.lit("?"));
            }
            let ty = self.type_text(self.span(value), ": ")?;
            inner.push(ty);
            inner.push(self.lit(";"));
        }
        let inner = self.cat(&inner);
        let inner = self.docs.indent(inner);
        let open = self.lit("{");
        let h = self.docs.hardline();
        let close = self.lit("}");
        Ok(self.cat(&[head, open, inner, h, close]))
    }
}

/// The name and members of an interface without type parameters or `extends` whose members are
/// all `key?: T` with a plain key and no modifier.
fn plain_interface(
    tree: &SyntaxTree,
    statement: NodeIdentifier,
) -> Option<(NodeIdentifier, &[NodeIdentifier])> {
    let Kind::Type(Type::Interface {
        name,
        parameters: None,
        heritage: None,
        body,
    }) = tree.kind(tree.declaration(statement)?)
    else {
        return None;
    };
    let start = |n: NodeIdentifier| tree.source_location(n).span().map(|s| s.start_offset);
    let plain = body.iter().all(|&m| match tree.kind(m) {
        Kind::Type(Type::Property {
            key,
            value: Some(_),
            computed: false,
            ..
        }) => tree.is_identifier(key) && tree.name(key) != "readonly" && start(key) == start(m),
        _ => false,
    });
    plain.then_some((name, body))
}
