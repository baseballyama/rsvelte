//! Code generation: prints an [`Ast`] as JavaScript into an [`Emitter`].
//!
//! A source mapping is recorded at every node that carries a real span. Layout is fixed and simple
//! (tabs, one statement per line): generated code is compared as an AST, and the formatter
//! ([`crate::format`]) owns canonical layout. TypeScript-only nodes are dropped.

use rsv_kernel::emit::Emitter;

use crate::ast::{Ast, Kind, NodeId, Tag, flag};
use crate::ops::{BinOp, LogicalOp, UnaryOp};

#[must_use]
pub fn print_program(ast: &Ast, src: &str, program: NodeId) -> Emitter {
    let mut g = Gen {
        ast,
        src,
        e: Emitter::new(),
        indent: 0,
    };
    if let Kind::Program(body) = ast.kind(program) {
        let mut first = true;
        for &s in body {
            if !g.emits(s) {
                continue;
            }
            if !first {
                g.e.push("\n");
            }
            first = false;
            g.stmt(s);
            g.e.push("\n");
        }
    }
    g.e
}

/// Prints one expression (for embedding in other output, e.g. tests).
#[must_use]
pub fn print_expr(ast: &Ast, src: &str, e: NodeId) -> String {
    let mut g = Gen {
        ast,
        src,
        e: Emitter::new(),
        indent: 0,
    };
    g.expr(e, 0);
    g.e.out
}

struct Gen<'a> {
    ast: &'a Ast,
    src: &'a str,
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
    fn nl(&mut self) {
        self.e.push("\n");
        for _ in 0..self.indent {
            self.e.push("\t");
        }
    }

    fn mark(&mut self, id: NodeId) {
        if let Some(s) = self.ast.loc(id).span() {
            self.e.mark(s.lo);
        }
    }

    /// Whether a statement produces output (TypeScript-only statements do not).
    fn emits(&self, s: NodeId) -> bool {
        match self.ast.kind(s) {
            Kind::TsDecl | Kind::TsInterface { .. } => false,
            Kind::Import {
                specifiers,
                type_only,
                ..
            } => {
                !type_only
                    && (specifiers.is_empty()
                        || specifiers
                            .iter()
                            .any(|&sp| self.ast.flags(sp) & flag::TYPE_ONLY == 0))
            }
            Kind::ExportNamed(d) => self.emits(d),
            _ => true,
        }
    }

    fn stmts(&mut self, body: &[NodeId]) {
        for &s in body {
            if self.emits(s) {
                self.nl();
                self.stmt(s);
            }
        }
    }

    fn block(&mut self, id: NodeId) {
        let Kind::Block(body) = self.ast.kind(id) else {
            return self.stmt(id);
        };
        self.e.push("{");
        self.indent += 1;
        self.stmts(body);
        self.indent -= 1;
        if body.iter().any(|&s| self.emits(s)) {
            self.nl();
        }
        self.e.push("}");
    }

    #[expect(clippy::too_many_lines, reason = "one arm per statement kind")]
    fn stmt(&mut self, id: NodeId) {
        self.mark(id);
        match self.ast.kind(id) {
            Kind::VarDecl { kind, decls } => {
                self.var_decl(kind, decls);
                self.e.push(";");
            }
            Kind::ExprStmt(e) => {
                let wrap = self.starts_with_brace_or_function(e);
                if wrap {
                    self.e.push("(");
                }
                self.expr(e, prec::SEQ);
                if wrap {
                    self.e.push(")");
                }
                self.e.push(";");
            }
            Kind::Function { .. } => self.function(id),
            Kind::Return(arg) => {
                self.e.push("return");
                if let Some(a) = arg {
                    self.e.push(" ");
                    self.expr(a, prec::SEQ);
                }
                self.e.push(";");
            }
            Kind::If { test, cons, alt } => {
                self.e.push("if (");
                self.expr(test, prec::SEQ);
                self.e.push(") ");
                self.block(cons);
                if let Some(a) = alt {
                    self.e.push(" else ");
                    if self.ast.tag(a) == Tag::If {
                        self.stmt(a);
                    } else {
                        self.block(a);
                    }
                }
            }
            Kind::For {
                init,
                test,
                update,
                body,
            } => {
                self.e.push("for (");
                match init.map(|i| (i, self.ast.kind(i))) {
                    Some((_, Kind::VarDecl { kind, decls })) => self.var_decl(kind, decls),
                    Some((i, _)) => self.expr(i, prec::SEQ),
                    None => {}
                }
                self.e.push(";");
                if let Some(t) = test {
                    self.e.push(" ");
                    self.expr(t, prec::SEQ);
                }
                self.e.push(";");
                if let Some(u) = update {
                    self.e.push(" ");
                    self.expr(u, prec::SEQ);
                }
                self.e.push(") ");
                self.block(body);
            }
            Kind::Block(_) => self.block(id),
            Kind::Empty => self.e.push(";"),
            Kind::Import {
                specifiers, source, ..
            } => {
                self.e.push("import ");
                let live: Vec<NodeId> = specifiers
                    .iter()
                    .copied()
                    .filter(|&s| self.ast.flags(s) & flag::TYPE_ONLY == 0)
                    .collect();
                let (named, other): (Vec<NodeId>, Vec<NodeId>) = live
                    .iter()
                    .partition(|&&s| self.ast.tag(s) == Tag::ImportNamed);
                let mut parts = 0;
                for s in other {
                    if parts > 0 {
                        self.e.push(", ");
                    }
                    parts += 1;
                    match self.ast.kind(s) {
                        Kind::ImportDefault(l) => self.expr(l, prec::PRIMARY),
                        Kind::ImportNamespace(l) => {
                            self.e.push("* as ");
                            self.expr(l, prec::PRIMARY);
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
                        if let Kind::ImportNamed { imported, local } = self.ast.kind(s) {
                            self.expr(imported, prec::PRIMARY);
                            if self.ast.atom(imported) != self.ast.atom(local)
                                || self.ast.atom(imported).is_none()
                            {
                                self.e.push(" as ");
                                self.expr(local, prec::PRIMARY);
                            }
                        }
                    }
                    self.e.push(" }");
                }
                if parts > 0 {
                    self.e.push(" from ");
                }
                self.expr(source, prec::PRIMARY);
                self.e.push(";");
            }
            Kind::ExportNamed(d) => {
                self.e.push("export ");
                self.stmt(d);
            }
            Kind::ExportDefault(d) => {
                self.e.push("export default ");
                if matches!(self.ast.tag(d), Tag::FnDecl | Tag::FnExpr) {
                    self.function(d);
                } else {
                    self.expr(d, prec::ASSIGN);
                    self.e.push(";");
                }
            }
            Kind::TsDecl | Kind::TsInterface { .. } => {}
            _ => {
                self.expr(id, prec::SEQ);
                self.e.push(";");
            }
        }
    }

    fn var_decl(&mut self, kind: u8, decls: &[NodeId]) {
        self.e.push(match kind {
            flag::LET => "let ",
            flag::CONST => "const ",
            _ => "var ",
        });
        for (i, &d) in decls.iter().enumerate() {
            if i > 0 {
                self.e.push(", ");
            }
            if let Kind::Declarator { id, init } = self.ast.kind(d) {
                self.expr(id, prec::ASSIGN);
                if let Some(v) = init {
                    self.e.push(" = ");
                    self.expr(v, prec::ASSIGN);
                }
            }
        }
    }

    fn function(&mut self, id: NodeId) {
        let Kind::Function {
            name,
            params,
            body,
            is_async,
            ..
        } = self.ast.kind(id)
        else {
            return;
        };
        self.mark(id);
        if is_async {
            self.e.push("async ");
        }
        self.e.push("function ");
        if let Some(n) = name {
            self.expr(n, prec::PRIMARY);
        }
        self.params(params);
        self.e.push(" ");
        self.block(body);
    }

    fn params(&mut self, params: &[NodeId]) {
        self.e.push("(");
        self.list(params, ", ");
        self.e.push(")");
    }

    fn list(&mut self, items: &[NodeId], sep: &str) {
        for (i, &x) in items.iter().enumerate() {
            if i > 0 {
                self.e.push(sep);
            }
            self.expr(x, prec::ASSIGN);
        }
    }

    fn leftmost(&self, mut e: NodeId) -> NodeId {
        loop {
            e = match self.ast.kind(e) {
                Kind::Member { object, .. } => object,
                Kind::Call { callee, .. } => callee,
                Kind::Binary(_, l, _) | Kind::Logical(_, l, _) | Kind::Assign(_, l, _) => l,
                Kind::Cond { test, .. } => test,
                Kind::Seq(items) => items[0],
                Kind::Update {
                    prefix: false, arg, ..
                } => arg,
                _ => return e,
            };
        }
    }

    fn starts_with_brace_or_function(&self, e: NodeId) -> bool {
        matches!(
            self.ast.tag(self.leftmost(e)),
            Tag::Object | Tag::ObjectPat | Tag::FnExpr
        )
    }

    fn prec_of(&self, id: NodeId) -> u8 {
        match self.ast.kind(id) {
            Kind::Seq(_) => prec::SEQ,
            Kind::Assign(..) | Kind::Arrow { .. } => prec::ASSIGN,
            Kind::Cond { .. } => prec::COND,
            Kind::Logical(op, ..) => prec::BIN + op.precedence(),
            Kind::Binary(op, ..) => prec::BIN + op.precedence(),
            Kind::Unary(..) | Kind::Await(_) | Kind::Update { prefix: true, .. } => prec::UNARY,
            Kind::Update { prefix: false, .. } => prec::POSTFIX,
            Kind::Call { .. } | Kind::Member { .. } | Kind::New { .. } => prec::CALL,
            _ => prec::PRIMARY,
        }
    }

    fn expr(&mut self, id: NodeId, min: u8) {
        let p = self.prec_of(id);
        if p < min {
            self.e.push("(");
            self.expr_inner(id);
            self.e.push(")");
        } else {
            self.expr_inner(id);
        }
    }

    fn logical_operand(&mut self, parent: LogicalOp, child: NodeId, min: u8) {
        // `??` cannot be mixed with `||` / `&&` without parentheses.
        let nullish = parent == LogicalOp::Nullish;
        let mixes = matches!(
            self.ast.kind(child),
            Kind::Logical(op, ..) if (op == LogicalOp::Nullish) != nullish
        );
        if mixes {
            self.e.push("(");
            self.expr_inner(child);
            self.e.push(")");
        } else {
            self.expr(child, min);
        }
    }

    #[expect(clippy::too_many_lines, reason = "one arm per expression kind")]
    fn expr_inner(&mut self, id: NodeId) {
        self.mark(id);
        match self.ast.kind(id) {
            Kind::Ident(a) => self.e.push(self.ast.atoms.get(a)),
            Kind::Num(v) => match self.ast.loc(id).span() {
                Some(s) => self.e.push(s.text(self.src)),
                None => self.e.push(&number(v)),
            },
            Kind::Str => {
                if let (Some(s), 0) = (self.ast.loc(id).span(), self.ast.flags(id) & flag::OWNED) {
                    self.e.push(s.text(self.src));
                } else {
                    let v = self.ast.str_value(id, self.src).to_owned();
                    quote(&mut self.e.out, &v);
                }
            }
            Kind::Bool(b) => self.e.push(if b { "true" } else { "false" }),
            Kind::Null => self.e.push("null"),
            Kind::This => self.e.push("this"),
            Kind::Template { quasis, exprs } => {
                self.e.push("`");
                for (i, &q) in quasis.iter().enumerate() {
                    let raw = self.ast.str_value(q, self.src).to_owned();
                    self.e.push(&raw);
                    if let Some(&x) = exprs.get(i) {
                        self.e.push("${");
                        self.expr(x, prec::SEQ);
                        self.e.push("}");
                    }
                }
                self.e.push("`");
            }
            Kind::TemplateElem { .. } => {
                let raw = self.ast.str_value(id, self.src).to_owned();
                self.e.push(&raw);
            }
            Kind::Array(items) | Kind::ArrayPat(items) => {
                self.e.push("[");
                for (i, &x) in items.iter().enumerate() {
                    if i > 0 {
                        self.e.push(", ");
                    }
                    self.expr(x, prec::ASSIGN);
                }
                if items.last().is_some_and(|&x| self.ast.tag(x) == Tag::Hole) {
                    self.e.push(",");
                }
                self.e.push("]");
            }
            Kind::Object(props) | Kind::ObjectPat(props) => {
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
                    self.expr(value, prec::ASSIGN);
                    return;
                }
                if computed {
                    self.e.push("[");
                    self.expr(key, prec::ASSIGN);
                    self.e.push("]");
                } else {
                    self.expr(key, prec::PRIMARY);
                }
                if method {
                    if let Kind::Function { params, body, .. } = self.ast.kind(value) {
                        self.params(params);
                        self.e.push(" ");
                        self.block(body);
                    }
                } else {
                    self.e.push(": ");
                    self.expr(value, prec::ASSIGN);
                }
            }
            Kind::Spread(a) | Kind::Rest(a) => {
                self.e.push("...");
                self.expr(a, prec::ASSIGN);
            }
            Kind::Member {
                object,
                property,
                computed,
                optional,
            } => {
                let wrap_num = self.ast.tag(object) == Tag::Num;
                if wrap_num {
                    self.e.push("(");
                    self.expr(object, 0);
                    self.e.push(")");
                } else {
                    self.expr(object, prec::CALL);
                }
                if computed {
                    self.e.push(if optional { "?.[" } else { "[" });
                    self.expr(property, prec::SEQ);
                    self.e.push("]");
                } else {
                    self.e.push(if optional { "?." } else { "." });
                    self.expr(property, prec::PRIMARY);
                }
            }
            Kind::Call {
                callee,
                args,
                optional,
                pure,
            } => {
                if pure {
                    self.e.push("/* @__PURE__ */ ");
                }
                self.expr(callee, prec::CALL);
                if matches!(self.ast.tag(callee), Tag::Arrow | Tag::FnExpr) {
                    // already parenthesized by precedence
                }
                self.e.push(if optional { "?.(" } else { "(" });
                self.list(args, ", ");
                self.e.push(")");
            }
            Kind::New { callee, args } => {
                self.e.push("new ");
                self.expr(callee, prec::CALL);
                self.e.push("(");
                self.list(args, ", ");
                self.e.push(")");
            }
            Kind::Arrow {
                params,
                body,
                is_async,
                expr_body,
            } => {
                if is_async {
                    self.e.push("async ");
                }
                self.params(params);
                self.e.push(" => ");
                if expr_body {
                    if self.starts_with_brace_or_function(body)
                        && self.ast.tag(self.leftmost(body)) != Tag::FnExpr
                    {
                        self.e.push("(");
                        self.expr(body, prec::SEQ);
                        self.e.push(")");
                    } else {
                        self.expr(body, prec::ASSIGN);
                    }
                } else {
                    self.block(body);
                }
            }
            Kind::Function { .. } => self.function(id),
            Kind::Unary(op, arg) => {
                self.e.push(op.as_str());
                let needs_space = matches!(op, UnaryOp::TypeOf | UnaryOp::Void | UnaryOp::Delete)
                    || matches!(
                        (op, self.ast.kind(arg)),
                        (UnaryOp::Neg, Kind::Unary(UnaryOp::Neg, _))
                            | (UnaryOp::Plus, Kind::Unary(UnaryOp::Plus, _))
                    )
                    || matches!(self.ast.kind(arg), Kind::Update { prefix: true, .. });
                if needs_space {
                    self.e.push(" ");
                }
                self.expr(arg, prec::UNARY);
            }
            Kind::Update { op, prefix, arg } => {
                if prefix {
                    self.e.push(op.as_str());
                    self.expr(arg, prec::UNARY);
                } else {
                    self.expr(arg, prec::POSTFIX);
                    self.e.push(op.as_str());
                }
            }
            Kind::Binary(op, l, r) => {
                let p = prec::BIN + op.precedence();
                let (lmin, rmin) = if op == BinOp::Exp {
                    (p + 1, p)
                } else {
                    (p, p + 1)
                };
                self.expr(l, lmin);
                self.e.push(" ");
                self.e.push(op.as_str());
                self.e.push(" ");
                self.expr(r, rmin);
            }
            Kind::Logical(op, l, r) => {
                let p = prec::BIN + op.precedence();
                self.logical_operand(op, l, p);
                self.e.push(" ");
                self.e.push(op.as_str());
                self.e.push(" ");
                self.logical_operand(op, r, p + 1);
            }
            Kind::Cond { test, cons, alt } => {
                self.expr(test, prec::COND + 1);
                self.e.push(" ? ");
                self.expr(cons, prec::ASSIGN);
                self.e.push(" : ");
                self.expr(alt, prec::ASSIGN);
            }
            Kind::Assign(op, t, v) => {
                self.expr(t, prec::CALL);
                self.e.push(" ");
                self.e.push(op.as_str());
                self.e.push(" ");
                self.expr(v, prec::ASSIGN);
            }
            Kind::Seq(items) => self.list(items, ", "),
            Kind::Await(a) => {
                self.e.push("await ");
                self.expr(a, prec::UNARY);
            }
            Kind::AssignPat(l, r) => {
                self.expr(l, prec::ASSIGN);
                self.e.push(" = ");
                self.expr(r, prec::ASSIGN);
            }
            Kind::Hole => {}
            k @ (Kind::Program(_)
            | Kind::VarDecl { .. }
            | Kind::Declarator { .. }
            | Kind::ExprStmt(_)
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
            | Kind::TsDecl
            | Kind::TsInterface { .. }
            | Kind::TsPropSig { .. }) => unreachable!("statement in expression position: {k:?}"),
        }
    }
}

/// JavaScript's `Number.prototype.toString()` (ECMA-262 `Number::toString`, radix 10).
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
        for (v, js) in [
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
            assert_eq!(number(v), js, "{v:?}");
        }
    }
}
