use super::{
    Formatter, Kind, LayoutInstructionIdentifier, NodeIdentifier, PatternContext, R, Slot, Span,
    Unsupported, flag,
};

impl Formatter<'_> {
    /// Prettier's `printStatementSequence`; a program or function body (`directives`) starts
    /// with its directive prologue.
    pub(super) fn statements(
        &mut self,
        body: &[NodeIdentifier],
        directives: bool,
    ) -> R<Vec<LayoutInstructionIdentifier>> {
        let prologue = if directives {
            body.iter()
                .take_while(|&&s| self.directive(s).is_some())
                .count()
        } else {
            0
        };
        let body: Vec<NodeIdentifier> = body
            .iter()
            .copied()
            .filter(|&s| !matches!(self.syntax_tree.kind(s), Kind::Empty))
            .collect();
        let mut out = Vec::new();
        for (i, &s) in body.iter().enumerate() {
            // The prologue holds no empty statement, so it keeps its indices here.
            out.push(match self.directive(s) {
                Some(raw) if i < prologue => self.print_directive(raw),
                _ => self.statement(s)?,
            });
            if let Some(&next) = body.get(i + 1) {
                out.push(self.docs.hardline());
                if self.blank_line_between(s, next) {
                    out.push(self.docs.hardline());
                }
            }
        }
        Ok(out)
    }

    /// The raw text of a statement that reads as a directive: a string, not in parentheses.
    fn directive(&self, statement: NodeIdentifier) -> Option<Span> {
        let Kind::ExpressionStatement(e) = self.syntax_tree.kind(statement) else {
            return None;
        };
        let span = self.span(e);
        let parenthesized = self.source_text[..span.start_offset as usize]
            .trim_end()
            .ends_with('(');
        (matches!(self.syntax_tree.kind(e), Kind::String) && !parenthesized).then_some(span)
    }

    /// Prettier's `printDirective`: the raw text, with the preferred quotes when it holds none.
    fn print_directive(&mut self, raw: Span) -> LayoutInstructionIdentifier {
        let raw = raw.text(self.source_text);
        let content = &raw[1..raw.len() - 1];
        let text = if content.contains(['"', '\'']) {
            format!("{raw};")
        } else {
            let q = if self.options.single_quote { '\'' } else { '"' };
            format!("{q}{content}{q};")
        };
        self.docs.text(&text)
    }

    pub(super) fn statement(
        &mut self,
        identifier: NodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        match self.syntax_tree.kind(identifier) {
            Kind::VariableDeclaration { kind, declarations } => {
                self.var_declaration(kind, declarations)
            }
            Kind::ExpressionStatement(e) => {
                // A statement nested in this one (in a function body) sets its own and gives
                // this one back.
                let saved = self.paren_leftmost;
                self.paren_leftmost = self.leftmost_needing_parens(e, false);
                let e = self.expression(e, Some(identifier), Slot::Statement);
                self.paren_leftmost = saved;
                let e = e?;
                let semi = self.lit(";");
                Ok(self.cat(&[e, semi]))
            }
            Kind::Function { .. } => self.function(identifier),
            Kind::Return(arg) => self.return_(identifier, arg),
            Kind::If {
                test,
                consequent,
                alternate,
            } => self.if_(identifier, test, consequent, alternate),
            Kind::Block(_) => self.block(identifier, false),
            Kind::Import {
                specifiers,
                source,
                type_only,
                attributes,
            } => {
                if attributes.is_some() {
                    Err(Unsupported::at(
                        "import attributes",
                        self.syntax_tree.source_location(identifier),
                    ))
                } else {
                    Ok(self.import(specifiers, source, type_only))
                }
            }
            Kind::TypeScriptInterface { name, members } => self.interface(name, members),
            Kind::ExportNamed(d) => {
                let d = self.statement(d)?;
                let e = self.lit("export ");
                Ok(self.cat(&[e, d]))
            }
            Kind::TypeScriptDeclaration => Err(Unsupported::at(
                "TypeScript declaration",
                self.syntax_tree.source_location(identifier),
            )),
            _ => Err(Unsupported::at(
                "statement kind",
                self.syntax_tree.source_location(identifier),
            )),
        }
    }

    /// Prettier's `printVariableDeclaration`.
    pub(super) fn var_declaration(
        &mut self,
        kind: u8,
        declarations: &[NodeIdentifier],
    ) -> R<LayoutInstructionIdentifier> {
        let kw = match kind {
            flag::LET => "let",
            flag::CONST => "const",
            _ => "var",
        };
        let printed = declarations
            .iter()
            .map(|&d| self.declarator(d))
            .collect::<R<Vec<_>>>()?;
        let has_initializer = declarations.iter().any(|&d| {
            matches!(
                self.syntax_tree.kind(d),
                Kind::Declarator {
                    initializer: Some(_),
                    ..
                }
            )
        });
        let first = if printed.len() == 1 {
            printed[0]
        } else {
            self.docs.indent(printed[0])
        };
        let mut rest = Vec::new();
        for &p in &printed[1..] {
            let comma = self.lit(",");
            let sep = if has_initializer {
                self.docs.hardline()
            } else {
                self.docs.line()
            };
            rest.push(self.cat(&[comma, sep, p]));
        }
        let rest = self.cat(&rest);
        let rest = self.docs.indent(rest);
        let kw = self.lit(kw);
        let sp = self.lit(" ");
        let semi = self.lit(";");
        Ok(self.docs.group(&[kw, sp, first, rest, semi]))
    }

    pub(super) fn declarator(
        &mut self,
        identifier: NodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let Kind::Declarator {
            identifier: target,
            initializer,
        } = self.syntax_tree.kind(identifier)
        else {
            unreachable!("a declarator")
        };
        let left = self.pattern(target, PatternContext::Declarator)?;
        let Some(initializer) = initializer else {
            return Ok(left);
        };
        let right = self.expression(initializer, Some(identifier), Slot::Init)?;
        let op = self.lit(" =");
        self.assignment(left, op, right, target, initializer, true)
    }
}
