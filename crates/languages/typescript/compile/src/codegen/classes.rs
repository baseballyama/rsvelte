use rsvelte_typescript::syntax_tree::Class;

use super::{Gen, Kind, NodeIdentifier, flag, prec};

impl Gen<'_> {
    pub(super) fn class(&mut self, class: Class<'_>) {
        match class {
            Class::Definition {
                name,
                superclass,
                members,
                ..
            } => {
                self.e.push("class");
                if let Some(name) = name {
                    self.e.push(" ");
                    self.expression(name, prec::PRIMARY);
                }
                if let Some(parent) = superclass {
                    self.e.push(" extends ");
                    self.expression(parent, prec::CALL);
                }
                self.e.push(" {");
                self.indent += 1;
                for &member in members {
                    self.newline();
                    self.statement(member);
                }
                self.indent -= 1;
                if !members.is_empty() {
                    self.newline();
                }
                self.e.push("}");
            }
            Class::Method {
                key,
                function,
                computed,
                is_static,
                getter,
                setter,
            } => {
                if is_static {
                    self.e.push("static ");
                }
                if getter {
                    self.e.push("get ");
                }
                if setter {
                    self.e.push("set ");
                }
                if let Kind::Function {
                    parameters,
                    body,
                    is_async,
                    ..
                } = self.syntax_tree.kind(function)
                {
                    if is_async {
                        self.e.push("async ");
                    }
                    if self.syntax_tree.flags(function) & flag::GENERATOR != 0 {
                        self.e.push("*");
                    }
                    self.class_key(key, computed);
                    self.parameters(parameters);
                    self.e.push(" ");
                    self.block(body);
                }
            }
            Class::Field {
                key,
                value,
                computed,
                is_static,
            } => {
                if is_static {
                    self.e.push("static ");
                }
                self.class_key(key, computed);
                if let Some(value) = value {
                    self.e.push(" = ");
                    self.expression(value, prec::ASSIGN);
                }
                self.e.push(";");
            }
            Class::StaticBlock(body) => {
                self.e.push("static ");
                self.block(body);
            }
        }
    }

    fn class_key(&mut self, key: NodeIdentifier, computed: bool) {
        if computed {
            self.e.push("[");
            self.expression(key, prec::ASSIGN);
            self.e.push("]");
        } else {
            self.expression(key, prec::PRIMARY);
        }
    }
}
