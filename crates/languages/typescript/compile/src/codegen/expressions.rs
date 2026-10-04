use super::{
    BinaryOperator, Gen, Kind, LogicalOperator, NodeIdentifier, Tag, UnaryOperator, flag, number,
    prec, quote,
};

impl Gen<'_> {
    pub(super) fn leftmost(&self, mut e: NodeIdentifier) -> NodeIdentifier {
        loop {
            e = match self.syntax_tree.kind(e) {
                Kind::Member { object, .. } => object,
                Kind::Call { callee, .. } => callee,
                Kind::Binary(_, l, _) | Kind::Logical(_, l, _) | Kind::Assign(_, l, _) => l,
                Kind::Conditional { test, .. } => test,
                Kind::Sequence(items) => items[0],
                Kind::Update {
                    prefix: false, arg, ..
                } => arg,
                _ => return e,
            };
        }
    }

    pub(super) fn starts_with_brace_or_function(&self, e: NodeIdentifier) -> bool {
        matches!(
            self.syntax_tree.tag(self.leftmost(e)),
            Tag::Object | Tag::ObjectPattern | Tag::FunctionExpression | Tag::Class
        )
    }

    pub(super) fn prec_of(&self, identifier: NodeIdentifier) -> u8 {
        match self.syntax_tree.kind(identifier) {
            Kind::Sequence(_) => prec::SEQ,
            Kind::Assign(..) | Kind::Arrow { .. } | Kind::Yield { .. } => prec::ASSIGN,
            Kind::Conditional { .. } => prec::COND,
            Kind::Logical(op, ..) => prec::BIN + op.precedence(),
            Kind::Binary(op, ..) => prec::BIN + op.precedence(),
            Kind::Unary(..) | Kind::Await(_) | Kind::Update { prefix: true, .. } => prec::UNARY,
            Kind::Update { prefix: false, .. } => prec::POSTFIX,
            Kind::Call { .. } | Kind::Member { .. } | Kind::New { .. } => prec::CALL,
            _ => prec::PRIMARY,
        }
    }

    pub(super) fn expression(&mut self, identifier: NodeIdentifier, min: u8) {
        let p = self.prec_of(identifier);
        if p < min || self.syntax_tree.flags(identifier) & flag::GROUPED != 0 {
            self.e.push("(");
            self.expression_inner(identifier);
            self.e.push(")");
        } else {
            self.expression_inner(identifier);
        }
    }

    pub(super) fn expression_no_in(&mut self, node: NodeIdentifier, min: u8) {
        let wrap = self.contains_in(node);
        if wrap {
            self.e.push("(");
        }
        self.expression(node, min);
        if wrap {
            self.e.push(")");
        }
    }

    fn contains_in(&self, node: NodeIdentifier) -> bool {
        if matches!(
            self.syntax_tree.kind(node),
            Kind::Binary(BinaryOperator::In, ..)
        ) {
            return true;
        }
        if matches!(
            self.syntax_tree.kind(node),
            Kind::Function { .. } | Kind::Arrow { .. }
        ) {
            return false;
        }
        let mut found = false;
        self.syntax_tree
            .for_each_child(node, |child| found |= self.contains_in(child));
        found
    }

    pub(super) fn logical_operand(
        &mut self,
        parent: LogicalOperator,
        child: NodeIdentifier,
        min: u8,
    ) {
        // `??` cannot be mixed with `||` / `&&` without parentheses.
        let nullish = parent == LogicalOperator::Nullish;
        let mixes = matches!(
            self.syntax_tree.kind(child),
            Kind::Logical(op, ..) if (op == LogicalOperator::Nullish) != nullish
        );
        if mixes {
            self.e.push("(");
            self.expression_inner(child);
            self.e.push(")");
        } else {
            self.expression(child, min);
        }
    }

    #[expect(clippy::too_many_lines, reason = "one arm per expression kind")]
    pub(super) fn expression_inner(&mut self, identifier: NodeIdentifier) {
        self.mark(identifier);
        match self.syntax_tree.kind(identifier) {
            Kind::Class(class) => self.class(class),
            Kind::Super => self.e.push("super"),
            Kind::Yield { argument, delegate } => {
                self.e.push(if delegate { "yield*" } else { "yield" });
                if let Some(argument) = argument {
                    self.e.push(" ");
                    self.expression(argument, prec::ASSIGN);
                }
            }
            Kind::ImportExpression { source, options } => {
                self.e.push("import(");
                self.expression(source, prec::ASSIGN);
                if let Some(o) = options {
                    self.e.push(", ");
                    self.expression(o, prec::ASSIGN);
                }
                self.e.push(")");
            }
            Kind::MetaProperty { meta, property } => {
                self.expression(meta, prec::PRIMARY);
                self.e.push(".");
                self.expression(property, prec::PRIMARY);
            }
            Kind::BigInt => {
                let [start_offset, end_offset] = self.syntax_tree.raw_data(identifier);
                self.e.push(
                    rsvelte_kernel::source::positions::Span::new(start_offset, end_offset)
                        .text(self.source_text),
                );
            }
            Kind::Identifier(a) => self.e.push(self.syntax_tree.atoms.get(a)),
            Kind::Number(v) => match self.syntax_tree.source_location(identifier).span() {
                Some(s) => self.e.push(s.text(self.source_text)),
                None => self.e.push(&number(v)),
            },
            Kind::String => {
                if let (Some(s), 0) = (
                    self.syntax_tree.source_location(identifier).span(),
                    self.syntax_tree.flags(identifier) & flag::OWNED,
                ) {
                    self.e.push(s.text(self.source_text));
                } else {
                    let v = self
                        .syntax_tree
                        .str_value(identifier, self.source_text)
                        .to_owned();
                    quote(&mut self.e.out, &v);
                }
            }
            Kind::Regex { pattern, flags } => {
                self.e.push("/");
                self.e.push(pattern.text(self.source_text));
                self.e.push("/");
                self.e.push(flags.text(self.source_text));
            }
            Kind::Boolean(b) => self.e.push(if b { "true" } else { "false" }),
            Kind::Null => self.e.push("null"),
            Kind::This => self.e.push("this"),
            Kind::Template {
                quasis,
                expressions,
            } => {
                self.e.push("`");
                for (i, &q) in quasis.iter().enumerate() {
                    let raw = self.syntax_tree.str_value(q, self.source_text).to_owned();
                    self.e.push(&raw);
                    if let Some(&x) = expressions.get(i) {
                        self.e.push("${");
                        self.expression(x, prec::SEQ);
                        self.e.push("}");
                    }
                }
                self.e.push("`");
            }
            Kind::TemplateElement { .. } => {
                let raw = self
                    .syntax_tree
                    .str_value(identifier, self.source_text)
                    .to_owned();
                self.e.push(&raw);
            }
            Kind::Array(items) | Kind::ArrayPattern(items) => {
                self.e.push("[");
                for (i, &x) in items.iter().enumerate() {
                    if i > 0 {
                        self.e.push(", ");
                    }
                    self.expression(x, prec::ASSIGN);
                }
                if items
                    .last()
                    .is_some_and(|&x| self.syntax_tree.tag(x) == Tag::Hole)
                {
                    self.e.push(",");
                }
                self.e.push("]");
            }
            Kind::Object(props) | Kind::ObjectPattern(props) => {
                if props.is_empty() {
                    self.e.push("{}");
                } else {
                    self.e.push("{ ");
                    self.list(props, ", ");
                    self.e.push(" }");
                }
            }
            Kind::Property {
                key,
                value,
                shorthand,
                computed,
                method,
                getter,
                setter,
            } => {
                if method {
                    if let Kind::Function { is_async: true, .. } = self.syntax_tree.kind(value) {
                        self.e.push("async ");
                    }
                    if self.syntax_tree.flags(value) & flag::GENERATOR != 0 {
                        self.e.push("*");
                    }
                }
                if getter {
                    self.e.push("get ");
                }
                if setter {
                    self.e.push("set ");
                }
                if shorthand {
                    self.expression(value, prec::ASSIGN);
                    return;
                }
                if computed {
                    self.e.push("[");
                    self.expression(key, prec::ASSIGN);
                    self.e.push("]");
                } else {
                    self.expression(key, prec::PRIMARY);
                }
                if method || getter || setter {
                    if let Kind::Function {
                        parameters, body, ..
                    } = self.syntax_tree.kind(value)
                    {
                        self.parameters(parameters);
                        self.e.push(" ");
                        self.block(body);
                    }
                } else {
                    self.e.push(": ");
                    self.expression(value, prec::ASSIGN);
                }
            }
            Kind::Spread(a) | Kind::Rest(a) => {
                self.e.push("...");
                self.expression(a, prec::ASSIGN);
            }
            Kind::Member {
                object,
                property,
                computed,
                optional,
            } => {
                let wrap_num = self.syntax_tree.tag(object) == Tag::Number;
                if wrap_num {
                    self.e.push("(");
                    self.expression(object, 0);
                    self.e.push(")");
                } else {
                    self.expression(object, prec::CALL);
                }
                if computed {
                    self.e.push(if optional { "?.[" } else { "[" });
                    self.expression(property, prec::SEQ);
                    self.e.push("]");
                } else {
                    self.e.push(if optional { "?." } else { "." });
                    self.expression(property, prec::PRIMARY);
                }
            }
            Kind::Call {
                callee,
                arguments,
                optional,
                pure,
            } => {
                if pure {
                    self.e.push("/* @__PURE__ */ ");
                }
                self.expression(callee, prec::CALL);
                if matches!(
                    self.syntax_tree.tag(callee),
                    Tag::Arrow | Tag::FunctionExpression
                ) {
                    // already parenthesized by precedence
                }
                self.e.push(if optional { "?.(" } else { "(" });
                self.list(arguments, ", ");
                self.e.push(")");
            }
            Kind::New { callee, arguments } => {
                self.e.push("new ");
                self.expression(callee, prec::CALL);
                self.e.push("(");
                self.list(arguments, ", ");
                self.e.push(")");
            }
            Kind::Arrow {
                parameters,
                body,
                is_async,
                expression_body,
            } => {
                if is_async {
                    self.e.push("async ");
                }
                self.parameters(parameters);
                self.e.push(" => ");
                if expression_body {
                    if self.starts_with_brace_or_function(body)
                        && self.syntax_tree.tag(self.leftmost(body)) != Tag::FunctionExpression
                    {
                        self.e.push("(");
                        self.expression(body, prec::SEQ);
                        self.e.push(")");
                    } else {
                        self.expression(body, prec::ASSIGN);
                    }
                } else {
                    self.block(body);
                }
            }
            Kind::Function { .. } => self.function(identifier),
            Kind::Unary(op, arg) => {
                self.e.push(op.as_str());
                let needs_space = matches!(
                    op,
                    UnaryOperator::TypeOf | UnaryOperator::Void | UnaryOperator::Delete
                ) || matches!(
                    (op, self.syntax_tree.kind(arg)),
                    (UnaryOperator::Neg, Kind::Unary(UnaryOperator::Neg, _))
                        | (UnaryOperator::Plus, Kind::Unary(UnaryOperator::Plus, _))
                ) || matches!(
                    self.syntax_tree.kind(arg),
                    Kind::Update { prefix: true, .. }
                );
                if needs_space {
                    self.e.push(" ");
                }
                self.expression(arg, prec::UNARY);
            }
            Kind::Update { op, prefix, arg } => {
                if prefix {
                    self.e.push(op.as_str());
                    self.expression(arg, prec::UNARY);
                } else {
                    self.expression(arg, prec::POSTFIX);
                    self.e.push(op.as_str());
                }
            }
            Kind::Binary(op, l, r) => {
                let p = prec::BIN + op.precedence();
                let (lmin, rmin) = if op == BinaryOperator::Exp {
                    (p + 1, p)
                } else {
                    (p, p + 1)
                };
                self.expression(l, lmin);
                self.e.push(" ");
                self.e.push(op.as_str());
                self.e.push(" ");
                self.expression(r, rmin);
            }
            Kind::Logical(op, l, r) => {
                let p = prec::BIN + op.precedence();
                self.logical_operand(op, l, p);
                self.e.push(" ");
                self.e.push(op.as_str());
                self.e.push(" ");
                self.logical_operand(op, r, p + 1);
            }
            Kind::Conditional {
                test,
                consequent,
                alternate,
            } => {
                self.expression(test, prec::COND + 1);
                self.e.push(" ? ");
                self.expression(consequent, prec::ASSIGN);
                self.e.push(" : ");
                self.expression(alternate, prec::ASSIGN);
            }
            Kind::Assign(op, t, v) => {
                self.expression(t, prec::CALL);
                self.e.push(" ");
                self.e.push(op.as_str());
                self.e.push(" ");
                self.expression(v, prec::ASSIGN);
            }
            Kind::Sequence(items) => self.list(items, ", "),
            Kind::Await(a) => {
                self.e.push("await ");
                self.expression(a, prec::UNARY);
            }
            Kind::AssignPattern(l, r) => {
                self.expression(l, prec::ASSIGN);
                self.e.push(" = ");
                self.expression(r, prec::ASSIGN);
            }
            Kind::Hole => {}
            k @ (Kind::Control(_)
            | Kind::Program(_)
            | Kind::VariableDeclaration { .. }
            | Kind::Declarator { .. }
            | Kind::ExpressionStatement(_)
            | Kind::Return(_)
            | Kind::If { .. }
            | Kind::For { .. }
            | Kind::Block(_)
            | Kind::Empty
            | Kind::Import { .. }
            | Kind::ImportDefault(_)
            | Kind::ImportNamed { .. }
            | Kind::ImportNamespace(_)
            | Kind::ExportNamed(_)
            | Kind::ExportDefault(_)
            | Kind::TypeScriptDeclaration
            | Kind::TypeScriptInterface { .. }
            | Kind::TypeScriptPropertySignature { .. }) => {
                unreachable!("statement in expression position: {k:?}")
            }
        }
    }
}
