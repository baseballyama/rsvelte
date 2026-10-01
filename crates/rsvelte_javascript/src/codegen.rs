//! Code generation: prints an [`SyntaxTree`] as JavaScript into an [`Emitter`].
//!
//! A source mapping is recorded at every node that carries a real span. Layout is fixed and simple
//! (tabs, one statement per line): generated code is compared as an AST, and the formatter
//! ([`crate::format`]) owns canonical layout. TypeScript-only nodes are dropped.

use rsvelte_kernel::output::emitter::Emitter;

use crate::operators::{BinaryOperator, LogicalOperator, UnaryOperator};
use crate::syntax_tree::{Kind, NodeIdentifier, SyntaxTree, Tag, flag};

#[must_use]
pub fn print_program(
    syntax_tree: &SyntaxTree,
    source_text: &str,
    program: NodeIdentifier,
) -> Emitter {
    let mut g = Gen {
        syntax_tree,
        source_text,
        e: Emitter::new(),
        indent: 0,
    };
    if let Kind::Program(body) = syntax_tree.kind(program) {
        let mut first = true;
        for &s in body {
            if !g.emits(s) {
                continue;
            }
            if !first {
                g.e.push("\n");
            }
            first = false;
            g.statement(s);
            g.e.push("\n");
        }
    }
    g.e
}

/// Prints one expression (for embedding in other output, e.g. tests).
#[must_use]
pub fn print_expression(syntax_tree: &SyntaxTree, source_text: &str, e: NodeIdentifier) -> String {
    let mut g = Gen {
        syntax_tree,
        source_text,
        e: Emitter::new(),
        indent: 0,
    };
    g.expression(e, 0);
    g.e.out
}

struct Gen<'a> {
    syntax_tree: &'a SyntaxTree,
    source_text: &'a str,
    e: Emitter,
    indent: u32,
}

mod prec {
    pub(super) const SEQ: u8 = 1;
    pub(super) const ASSIGN: u8 = 2;
    pub(super) const COND: u8 = 3;
    /// Binary/logical operators occupy BIN + op precedence (1..=12).
    pub(super) const BIN: u8 = 3;
    pub(super) const UNARY: u8 = 17;
    pub(super) const POSTFIX: u8 = 18;
    pub(super) const CALL: u8 = 19;
    pub(super) const PRIMARY: u8 = 20;
}

impl Gen<'_> {
    fn newline(&mut self) {
        self.e.push("\n");
        for _ in 0..self.indent {
            self.e.push("\t");
        }
    }

    fn mark(&mut self, identifier: NodeIdentifier) {
        if let Some(s) = self.syntax_tree.source_location(identifier).span() {
            self.e.mark(s.start_offset);
        }
    }

    /// Whether a statement produces output (TypeScript-only statements do not).
    fn emits(&self, s: NodeIdentifier) -> bool {
        match self.syntax_tree.kind(s) {
            Kind::TypeScriptDeclaration | Kind::TypeScriptInterface { .. } => false,
            Kind::Import {
                specifiers,
                type_only,
                ..
            } => {
                !type_only
                    && (specifiers.is_empty()
                        || specifiers
                            .iter()
                            .any(|&sp| self.syntax_tree.flags(sp) & flag::TYPE_ONLY == 0))
            }
            Kind::ExportNamed(d) => self.emits(d),
            _ => true,
        }
    }

    fn statements(&mut self, body: &[NodeIdentifier]) {
        for &s in body {
            if self.emits(s) {
                self.newline();
                self.statement(s);
            }
        }
    }

    fn block(&mut self, identifier: NodeIdentifier) {
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
    fn statement(&mut self, identifier: NodeIdentifier) {
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

    fn var_declaration(&mut self, kind: u8, declarations: &[NodeIdentifier]) {
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

    fn function(&mut self, identifier: NodeIdentifier) {
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

    fn parameters(&mut self, parameters: &[NodeIdentifier]) {
        self.e.push("(");
        self.list(parameters, ", ");
        self.e.push(")");
    }

    fn list(&mut self, items: &[NodeIdentifier], sep: &str) {
        for (i, &x) in items.iter().enumerate() {
            if i > 0 {
                self.e.push(sep);
            }
            self.expression(x, prec::ASSIGN);
        }
    }

    fn leftmost(&self, mut e: NodeIdentifier) -> NodeIdentifier {
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

    fn starts_with_brace_or_function(&self, e: NodeIdentifier) -> bool {
        matches!(
            self.syntax_tree.tag(self.leftmost(e)),
            Tag::Object | Tag::ObjectPattern | Tag::FunctionExpression
        )
    }

    fn prec_of(&self, identifier: NodeIdentifier) -> u8 {
        match self.syntax_tree.kind(identifier) {
            Kind::Sequence(_) => prec::SEQ,
            Kind::Assign(..) | Kind::Arrow { .. } => prec::ASSIGN,
            Kind::Conditional { .. } => prec::COND,
            Kind::Logical(op, ..) => prec::BIN + op.precedence(),
            Kind::Binary(op, ..) => prec::BIN + op.precedence(),
            Kind::Unary(..) | Kind::Await(_) | Kind::Update { prefix: true, .. } => prec::UNARY,
            Kind::Update { prefix: false, .. } => prec::POSTFIX,
            Kind::Call { .. } | Kind::Member { .. } | Kind::New { .. } => prec::CALL,
            _ => prec::PRIMARY,
        }
    }

    fn expression(&mut self, identifier: NodeIdentifier, min: u8) {
        let p = self.prec_of(identifier);
        if p < min {
            self.e.push("(");
            self.expression_inner(identifier);
            self.e.push(")");
        } else {
            self.expression_inner(identifier);
        }
    }

    fn logical_operand(&mut self, parent: LogicalOperator, child: NodeIdentifier, min: u8) {
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
    fn expression_inner(&mut self, identifier: NodeIdentifier) {
        self.mark(identifier);
        match self.syntax_tree.kind(identifier) {
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
            } => {
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
                if method {
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
            k @ (Kind::Program(_)
            | Kind::VariableDeclaration { .. }
            | Kind::Declarator { .. }
            | Kind::ExpressionStatement(_)
            | Kind::Return(_)
            | Kind::If { .. }
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

/// JavaScript's `Number.prototype.function toString() { [native code] }()` (ECMA-262
/// `Number::function toString() { [native code] }`, radix 10).
///
/// # Panics
///
/// Never: Rust's exponential formatting of a finite `f64` always has an integer exponent.
#[must_use]
#[expect(
    clippy::cast_possible_wrap,
    reason = "an f64 has at most 17 significant digits"
)]
pub fn number(v: f64) -> String {
    if v.is_nan() {
        return "NaN".into();
    }
    if v == 0.0 {
        return "0".into();
    }
    if v.is_infinite() {
        return if v > 0.0 { "Infinity" } else { "-Infinity" }.into();
    }
    if v < 0.0 {
        return format!("-{}", number(-v));
    }
    // Rust's `{:e}` prints the shortest digits that round-trip, which is what the spec asks for.
    let e = format!("{v:e}");
    let (mantissa, exp) = e
        .split_once('e')
        .expect("exponential notation always has an exponent");
    let digits: String = mantissa.chars().filter(|c| *c != '.').collect();
    let k = digits.len() as i32;
    let n = exp.parse::<i32>().expect("integer exponent") + 1;
    if k <= n && n <= 21 {
        format!("{digits}{}", "0".repeat((n - k).unsigned_abs() as usize))
    } else if 0 < n && n <= 21 {
        let n = n.unsigned_abs() as usize;
        format!("{}.{}", &digits[..n], &digits[n..])
    } else if -6 < n && n <= 0 {
        format!("0.{}{digits}", "0".repeat(n.unsigned_abs() as usize))
    } else {
        let sign = if n > 0 { '+' } else { '-' };
        let rest = if k > 1 {
            format!(".{}", &digits[1..])
        } else {
            String::new()
        };
        format!("{}{rest}e{sign}{}", &digits[..1], (n - 1).abs())
    }
}

/// Single-quoted JS string literal.
pub fn quote(out: &mut String, v: &str) {
    out.push('\'');
    for c in v.chars() {
        match c {
            '\'' => out.push_str("\\'"),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\u{2028}' => out.push_str("\\u2028"),
            '\u{2029}' => out.push_str("\\u2029"),
            c => out.push(c),
        }
    }
    out.push('\'');
}

#[cfg(test)]
mod tests {
    use super::number;

    #[test]
    fn number_to_string_matches_javascript() {
        for (v, javascript) in [
            (0.0, "0"),
            (-0.0, "0"),
            (1.0, "1"),
            (-42.5, "-42.5"),
            (0.1 + 0.2, "0.30000000000000004"),
            (1e21, "1e+21"),
            (123_456_789_012_345_680_000.0, "123456789012345680000"),
            (1e-7, "1e-7"),
            (0.000_001, "0.000001"),
            (1.5e-10, "1.5e-10"),
            (f64::INFINITY, "Infinity"),
            (f64::NAN, "NaN"),
        ] {
            assert_eq!(number(v), javascript, "{v:?}");
        }
    }
}
