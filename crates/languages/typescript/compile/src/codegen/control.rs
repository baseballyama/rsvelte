use rsvelte_typescript::syntax_tree::Control;

use super::{Gen, Kind, NodeIdentifier, prec};

impl Gen<'_> {
    #[expect(clippy::too_many_lines, reason = "one arm per control statement kind")]
    pub(super) fn control_statement(&mut self, control: Control<'_>) {
        match control {
            Control::Throw(value) => {
                self.e.push("throw ");
                self.expression(value, prec::SEQ);
                self.e.push(";");
            }
            Control::Try {
                block,
                handler,
                finalizer,
            } => {
                self.e.push("try ");
                self.block(block);
                if let Some(h) = handler {
                    self.e.push(" ");
                    self.statement(h);
                }
                if let Some(f) = finalizer {
                    self.e.push(" finally ");
                    self.block(f);
                }
            }
            Control::Catch { parameter, body } => {
                self.e.push("catch");
                if let Some(p) = parameter {
                    self.e.push(" (");
                    self.expression(p, prec::ASSIGN);
                    self.e.push(")");
                }
                self.e.push(" ");
                self.block(body);
            }
            Control::While { test, body, is_do } => {
                if is_do {
                    self.e.push("do ");
                    self.block(body);
                    self.e.push(" while (");
                    self.expression(test, prec::SEQ);
                    self.e.push(");");
                } else {
                    self.e.push("while (");
                    self.expression(test, prec::SEQ);
                    self.e.push(") ");
                    self.block(body);
                }
            }
            Control::ForEach {
                left,
                right,
                body,
                is_of,
                is_await,
            } => {
                self.e.push(if is_await { "for await (" } else { "for (" });
                self.for_initializer(left, false);
                self.e.push(if is_of { " of " } else { " in " });
                self.expression(right, prec::SEQ);
                self.e.push(") ");
                self.block(body);
            }
            Control::Switch {
                discriminant,
                cases,
            } => {
                self.e.push("switch (");
                self.expression(discriminant, prec::SEQ);
                self.e.push(") {");
                self.indent += 1;
                for &case in cases {
                    self.newline();
                    self.statement(case);
                }
                self.indent -= 1;
                if !cases.is_empty() {
                    self.newline();
                }
                self.e.push("}");
            }
            Control::Case { test, consequent } => {
                if let Some(t) = test {
                    self.e.push("case ");
                    self.expression(t, prec::SEQ);
                } else {
                    self.e.push("default");
                }
                self.e.push(":");
                self.indent += 1;
                self.statements(consequent);
                self.indent -= 1;
            }
            Control::Jump { label, is_continue } => {
                self.e.push(if is_continue { "continue" } else { "break" });
                if let Some(l) = label {
                    self.e.push(" ");
                    self.expression(l, prec::PRIMARY);
                }
                self.e.push(";");
            }
            Control::Labeled { label, body } => {
                self.expression(label, prec::PRIMARY);
                self.e.push(": ");
                self.statement(body);
            }
            Control::Debugger => self.e.push("debugger;"),
            Control::ExportList { specifiers, source } => {
                self.e.push("export { ");
                for (i, &n) in specifiers.iter().enumerate() {
                    if i > 0 {
                        self.e.push(", ");
                    }
                    self.statement(n);
                }
                self.e.push(" }");
                if let Some(s) = source {
                    self.e.push(" from ");
                    self.expression(s, prec::PRIMARY);
                }
                self.e.push(";");
            }
            Control::ExportSpecifier { local, exported } => {
                self.expression(local, prec::PRIMARY);
                if self.syntax_tree.atom(local) != self.syntax_tree.atom(exported)
                    || self.syntax_tree.atom(local).is_none()
                {
                    self.e.push(" as ");
                    self.expression(exported, prec::PRIMARY);
                }
            }
            Control::ExportAll { source, exported } => {
                self.e.push("export *");
                if let Some(n) = exported {
                    self.e.push(" as ");
                    self.expression(n, prec::PRIMARY);
                }
                self.e.push(" from ");
                self.expression(source, prec::PRIMARY);
                self.e.push(";");
            }
        }
    }

    pub(super) fn for_initializer(&mut self, node: NodeIdentifier, no_in: bool) {
        if let Kind::VariableDeclaration { kind, declarations } = self.syntax_tree.kind(node) {
            self.var_declaration_in(kind, declarations, no_in);
        } else if no_in {
            self.expression_no_in(node, prec::SEQ);
        } else {
            self.expression(node, prec::SEQ);
        }
    }
}
