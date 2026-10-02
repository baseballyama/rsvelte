use super::{Gen, Kind, NodeIdentifier, Tag, flag, prec};

impl Gen<'_> {
    pub(super) fn statements(&mut self, body: &[NodeIdentifier]) {
        for &s in body {
            if self.emits(s) {
                self.newline();
                self.statement(s);
            }
        }
    }

    pub(super) fn block(&mut self, identifier: NodeIdentifier) {
        let Kind::Block(body) = self.syntax_tree.kind(identifier) else {
            return self.statement(identifier);
        };
        self.e.push("{");
        self.indent += 1;
        self.statements(body);
        self.indent -= 1;
        if body.iter().any(|&s| self.emits(s)) {
            self.newline();
        }
        self.e.push("}");
    }

    #[expect(clippy::too_many_lines, reason = "one arm per statement kind")]
    pub(super) fn statement(&mut self, identifier: NodeIdentifier) {
        self.mark(identifier);
        match self.syntax_tree.kind(identifier) {
            Kind::VariableDeclaration { kind, declarations } => {
                self.var_declaration(kind, declarations);
                self.e.push(";");
            }
            Kind::ExpressionStatement(e) => {
                let wrap = self.starts_with_brace_or_function(e);
                if wrap {
                    self.e.push("(");
                }
                self.expression(e, prec::SEQ);
                if wrap {
                    self.e.push(")");
                }
                self.e.push(";");
            }
            Kind::Function { .. } => self.function(identifier),
            Kind::Return(arg) => {
                self.e.push("return");
                if let Some(a) = arg {
                    self.e.push(" ");
                    self.expression(a, prec::SEQ);
                }
                self.e.push(";");
            }
            Kind::If {
                test,
                consequent,
                alternate,
            } => {
                self.e.push("if (");
                self.expression(test, prec::SEQ);
                self.e.push(") ");
                self.block(consequent);
                if let Some(a) = alternate {
                    self.e.push(" else ");
                    if self.syntax_tree.tag(a) == Tag::If {
                        self.statement(a);
                    } else {
                        self.block(a);
                    }
                }
            }
            Kind::For {
                initializer,
                test,
                update,
                body,
            } => {
                self.e.push("for (");
                match initializer.map(|i| (i, self.syntax_tree.kind(i))) {
                    Some((_, Kind::VariableDeclaration { kind, declarations })) => {
                        self.var_declaration(kind, declarations);
                    }
                    Some((i, _)) => self.expression(i, prec::SEQ),
                    None => {}
                }
                self.e.push(";");
                if let Some(t) = test {
                    self.e.push(" ");
                    self.expression(t, prec::SEQ);
                }
                self.e.push(";");
                if let Some(u) = update {
                    self.e.push(" ");
                    self.expression(u, prec::SEQ);
                }
                self.e.push(") ");
                self.block(body);
            }
            Kind::Block(_) => self.block(identifier),
            Kind::Empty => self.e.push(";"),
            Kind::Import {
                specifiers, source, ..
            } => {
                self.e.push("import ");
                let live: Vec<NodeIdentifier> = specifiers
                    .iter()
                    .copied()
                    .filter(|&s| self.syntax_tree.flags(s) & flag::TYPE_ONLY == 0)
                    .collect();
                let (named, other): (Vec<NodeIdentifier>, Vec<NodeIdentifier>) = live
                    .iter()
                    .partition(|&&s| self.syntax_tree.tag(s) == Tag::ImportNamed);
                let mut parts = 0;
                for s in other {
                    if parts > 0 {
                        self.e.push(", ");
                    }
                    parts += 1;
                    match self.syntax_tree.kind(s) {
                        Kind::ImportDefault(l) => self.expression(l, prec::PRIMARY),
                        Kind::ImportNamespace(l) => {
                            self.e.push("* as ");
                            self.expression(l, prec::PRIMARY);
                        }
                        _ => {}
                    }
                }
                if !named.is_empty() {
                    if parts > 0 {
                        self.e.push(", ");
                    }
                    parts += 1;
                    self.e.push("{ ");
                    for (i, &s) in named.iter().enumerate() {
                        if i > 0 {
                            self.e.push(", ");
                        }
                        if let Kind::ImportNamed { imported, local } = self.syntax_tree.kind(s) {
                            self.expression(imported, prec::PRIMARY);
                            if self.syntax_tree.atom(imported) != self.syntax_tree.atom(local)
                                || self.syntax_tree.atom(imported).is_none()
                            {
                                self.e.push(" as ");
                                self.expression(local, prec::PRIMARY);
                            }
                        }
                    }
                    self.e.push(" }");
                }
                if parts > 0 {
                    self.e.push(" from ");
                }
                self.expression(source, prec::PRIMARY);
                self.e.push(";");
            }
            Kind::ExportNamed(d) => {
                self.e.push("export ");
                self.statement(d);
            }
            Kind::ExportDefault(d) => {
                self.e.push("export default ");
                if matches!(
                    self.syntax_tree.tag(d),
                    Tag::FunctionDeclaration | Tag::FunctionExpression
                ) {
                    self.function(d);
                } else {
                    self.expression(d, prec::ASSIGN);
                    self.e.push(";");
                }
            }
            Kind::TypeScriptDeclaration | Kind::TypeScriptInterface { .. } => {}
            _ => {
                self.expression(identifier, prec::SEQ);
                self.e.push(";");
            }
        }
    }

    pub(super) fn var_declaration(&mut self, kind: u8, declarations: &[NodeIdentifier]) {
        self.e.push(match kind {
            flag::LET => "let ",
            flag::CONST => "const ",
            _ => "var ",
        });
        for (i, &d) in declarations.iter().enumerate() {
            if i > 0 {
                self.e.push(", ");
            }
            if let Kind::Declarator {
                identifier,
                initializer,
            } = self.syntax_tree.kind(d)
            {
                self.expression(identifier, prec::ASSIGN);
                if let Some(v) = initializer {
                    self.e.push(" = ");
                    self.expression(v, prec::ASSIGN);
                }
            }
        }
    }

    pub(super) fn function(&mut self, identifier: NodeIdentifier) {
        let Kind::Function {
            name,
            parameters,
            body,
            is_async,
            ..
        } = self.syntax_tree.kind(identifier)
        else {
            return;
        };
        self.mark(identifier);
        if is_async {
            self.e.push("async ");
        }
        self.e.push("function ");
        if let Some(n) = name {
            self.expression(n, prec::PRIMARY);
        }
        self.parameters(parameters);
        self.e.push(" ");
        self.block(body);
    }

    pub(super) fn parameters(&mut self, parameters: &[NodeIdentifier]) {
        self.e.push("(");
        self.list(parameters, ", ");
        self.e.push(")");
    }

    pub(super) fn list(&mut self, items: &[NodeIdentifier], sep: &str) {
        for (i, &x) in items.iter().enumerate() {
            if i > 0 {
                self.e.push(sep);
            }
            self.expression(x, prec::ASSIGN);
        }
    }
}
