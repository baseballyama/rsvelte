use super::{
    Formatter, Kind, LayoutInstructionIdentifier, NodeIdentifier, PatternContext, R, Slot,
    TypeScriptKind, Unsupported, flag,
};

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
        let mut parts = Vec::new();
        if is_async {
            parts.push(self.lit("async "));
        }
        parts.push(self.lit("function "));
        if let Some(n) = name {
            parts.push(self.docs.text(self.syntax_tree.name(n)));
        }
        // `shouldGroupFunctionParameters` needs an object-type or breaking return type; a plain
        // type reference is neither.
        let ps = self.parameters(parameters)?;
        let ret = self.type_suffix(
            self.typescript_of(identifier, TypeScriptKind::ReturnType),
            ": ",
        )?;
        parts.push(self.docs.group(&[ps, ret]));
        parts.push(self.lit(" "));
        parts.push(self.block(body, true)?);
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
        let statements = self.statements(body)?;
        let open = self.lit("{");
        let close = self.lit("}");
        if statements.is_empty() {
            if fn_body {
                return Ok(self.cat(&[open, close]));
            }
            let h = self.docs.hardline();
            return Ok(self.cat(&[open, h, close]));
        }
        let h = self.docs.hardline();
        let mut inner = vec![h];
        inner.extend(statements);
        let inner = self.cat(&inner);
        let inner = self.docs.indent(inner);
        let h = self.docs.hardline();
        Ok(self.cat(&[open, inner, h, close]))
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
        let t = self.expression(test, Some(identifier), Slot::Test)?;
        let soft = self.docs.softline();
        let inner = self.cat(&[soft, t]);
        let inner = self.docs.indent(inner);
        let soft = self.docs.softline();
        let test_doc = self.docs.group(&[inner, soft]);
        let open = self.lit("if (");
        let close = self.lit(")");
        let c = self.clause(consequent, false)?;
        let opening = self.docs.group(&[open, test_doc, close, c]);
        let mut parts = vec![opening];
        if let Some(a) = alternate {
            let same_line = matches!(self.syntax_tree.kind(consequent), Kind::Block(_));
            parts.push(if same_line {
                self.lit(" ")
            } else {
                self.docs.hardline()
            });
            parts.push(self.lit("else"));
            let is_if = matches!(self.syntax_tree.kind(a), Kind::If { .. });
            let a = self.clause(a, is_if)?;
            parts.push(self.docs.group(&[a]));
        }
        Ok(self.docs.group(&parts))
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
                let s = self.statement(body)?;
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
        specifiers: &[NodeIdentifier],
        source: NodeIdentifier,
        type_only: bool,
    ) -> LayoutInstructionIdentifier {
        let mut parts = vec![self.lit(if type_only { "import type" } else { "import" })];
        if !specifiers.is_empty() {
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
    /// only property signatures: one member per line, each ending in `;`.
    pub(super) fn interface(
        &mut self,
        name: NodeIdentifier,
        members: &[NodeIdentifier],
    ) -> R<LayoutInstructionIdentifier> {
        let head = format!("interface {} ", self.syntax_tree.name(name));
        let head = self.docs.text(&head);
        if members.is_empty() {
            let b = self.lit("{}");
            return Ok(self.cat(&[head, b]));
        }
        let mut inner = Vec::new();
        for (i, &m) in members.iter().enumerate() {
            let Kind::TypeScriptPropertySignature { key, optional } = self.syntax_tree.kind(m)
            else {
                unreachable!("interface member")
            };
            inner.push(self.docs.hardline());
            if i > 0 && self.blank_line_between(members[i - 1], m) {
                inner.push(self.docs.hardline());
            }
            inner.push(self.docs.text(self.syntax_tree.name(key)));
            if optional {
                inner.push(self.lit("?"));
            }
            let ty = self.type_suffix(self.typescript_of(m, TypeScriptKind::Annotation), ": ")?;
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
