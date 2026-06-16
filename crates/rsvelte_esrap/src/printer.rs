//! The oxc-AST → JavaScript visitor.
//!
//! A port of esrap's `languages/ts` visitor, adapted to oxc's AST. Where esrap
//! dispatches through a `visitors[node.type]` map, this matches on oxc node
//! kinds; the layout logic — precedence-based parenthesisation, the `sequence`
//! helper for comma lists, and the `body` helper for statement lists — is the
//! same.
//!
//! Coverage is intentionally incremental (this is step 0 of the printer port):
//! the [`golden`](../../tests/golden.rs) test measures how much of the official
//! snapshot corpus round-trips, and that rate only ratchets up. Nodes that are
//! not yet handled return [`Unsupported`] so the harness can attribute misses
//! precisely rather than emit wrong output.

use oxc_ast::ast::*;
use oxc_syntax::operator::UnaryOperator;

use crate::context::Context;
use crate::{PrintOptions, QuoteStyle};

/// A node kind the printer does not yet handle. Carries the kind name so the
/// conformance harness can report exactly which visitors are still missing.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Unsupported(pub &'static str);

pub struct Printer<'opt> {
    options: &'opt PrintOptions,
    /// Set by the first unsupported node encountered; printing continues so the
    /// harness gets a single representative miss per file.
    pub missing: Option<Unsupported>,
}

/// esrap's `EXPRESSIONS_PRECEDENCE`, keyed by oxc `Expression` kind. Higher
/// binds tighter; a child is parenthesised when its precedence is lower than the
/// position requires.
fn expr_precedence(expr: &Expression) -> u8 {
    match expr {
        Expression::ArrayExpression(_)
        | Expression::TaggedTemplateExpression(_)
        | Expression::ThisExpression(_)
        | Expression::Identifier(_)
        | Expression::TemplateLiteral(_)
        | Expression::SequenceExpression(_) => 20,
        Expression::StaticMemberExpression(_)
        | Expression::ComputedMemberExpression(_)
        | Expression::PrivateFieldExpression(_)
        | Expression::MetaProperty(_)
        | Expression::CallExpression(_)
        | Expression::ChainExpression(_)
        | Expression::ImportExpression(_)
        | Expression::NewExpression(_) => 19,
        Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::StringLiteral(_) => 18,
        Expression::AwaitExpression(_)
        | Expression::ClassExpression(_)
        | Expression::FunctionExpression(_)
        | Expression::ObjectExpression(_) => 17,
        Expression::UpdateExpression(_) => 16,
        Expression::UnaryExpression(_) => 15,
        Expression::BinaryExpression(_) => 14,
        Expression::LogicalExpression(_) => 12,
        Expression::ConditionalExpression(_) => 4,
        Expression::ArrowFunctionExpression(_) | Expression::AssignmentExpression(_) => 3,
        Expression::YieldExpression(_) => 2,
        // Parenthesised wrappers are unwrapped before precedence is consulted.
        Expression::ParenthesizedExpression(_) => 20,
        _ => 18,
    }
}

/// Binary/logical operator precedence (esrap's `OPERATOR_PRECEDENCE`).
fn binary_operator_precedence(op: &str) -> u8 {
    match op {
        "||" => 2,
        "&&" => 3,
        "??" => 4,
        "|" => 5,
        "^" => 6,
        "&" => 7,
        "==" | "!=" | "===" | "!==" => 8,
        "<" | ">" | "<=" | ">=" | "in" | "instanceof" => 9,
        "<<" | ">>" | ">>>" => 10,
        "+" | "-" => 11,
        "*" | "%" | "/" => 12,
        "**" => 13,
        _ => 0,
    }
}

/// Port of esrap's `needs_parens` for a binary/logical operand. `parent_op` is
/// the enclosing operator and `parent_is_logical` selects its node-type
/// precedence (12 for logical, 14 for binary).
fn binary_needs_parens(
    child: &Expression,
    parent_is_logical: bool,
    parent_op: &str,
    is_right: bool,
) -> bool {
    let parent_precedence = if parent_is_logical { 12 } else { 14 };

    // `??` cannot be mixed with `||`/`&&` without parentheses.
    if parent_is_logical && let Expression::LogicalExpression(c) = child {
        let child_op = c.operator.as_str();
        if (parent_op == "??" && child_op != "??") || (parent_op != "??" && child_op == "??") {
            return true;
        }
    }

    let precedence = expr_precedence(child);
    if precedence != parent_precedence {
        return (!is_right && precedence == 15 && parent_precedence == 14 && parent_op == "**")
            || precedence < parent_precedence;
    }

    // Same node-type precedence — only meaningful for binary (14) / logical (12)
    // children, where associativity via operator precedence decides parens.
    if precedence != 12 && precedence != 14 {
        return false;
    }

    let child_op = child_binary_op(child);
    if child_op == "**" && parent_op == "**" {
        // Exponentiation is right-associative.
        return !is_right;
    }

    let co = binary_operator_precedence(child_op);
    let po = binary_operator_precedence(parent_op);
    if is_right { co <= po } else { co < po }
}

/// The operator string of a binary/logical child (only consulted when the child
/// is known to be one of those).
fn child_binary_op(expr: &Expression) -> &'static str {
    match expr {
        Expression::BinaryExpression(b) => b.operator.as_str(),
        Expression::LogicalExpression(l) => l.operator.as_str(),
        _ => "",
    }
}

/// Strip `ParenthesizedExpression` wrappers — esrap's input has no paren nodes;
/// it recomputes them from precedence, so we work on the inner expression.
fn unparen<'a, 'b>(mut expr: &'b Expression<'a>) -> &'b Expression<'a> {
    while let Expression::ParenthesizedExpression(p) = expr {
        expr = &p.expression;
    }
    expr
}

impl<'opt> Printer<'opt> {
    pub fn new(options: &'opt PrintOptions) -> Self {
        Self {
            options,
            missing: None,
        }
    }

    fn unsupported(&mut self, kind: &'static str, ctx: &mut Context) {
        if self.missing.is_none() {
            self.missing = Some(Unsupported(kind));
        }
        // Emit a marker so output is obviously wrong if a miss slips through a
        // test that forgot to check `missing`.
        ctx.write(format!("/*unsupported:{kind}*/"));
    }

    // ----- statements -------------------------------------------------------

    pub fn print_program(&mut self, program: &Program, ctx: &mut Context) {
        self.body(&program.body, ctx);
    }

    /// esrap's `body`: statements on their own lines, with a blank line between
    /// two multiline statements or a change of statement kind.
    fn body(&mut self, statements: &[Statement], ctx: &mut Context) {
        let mut prev: Option<(std::mem::Discriminant<Statement>, bool)> = None;
        for stmt in statements {
            if matches!(stmt, Statement::EmptyStatement(_)) {
                continue;
            }
            let mut child = ctx.child();
            self.print_statement(stmt, &mut child);

            if let Some((prev_disc, prev_multiline)) = prev {
                if child.multiline || prev_multiline || std::mem::discriminant(stmt) != prev_disc {
                    ctx.margin();
                }
                ctx.newline();
            }
            let multiline = child.multiline;
            ctx.append(child);
            prev = Some((std::mem::discriminant(stmt), multiline));
        }
        // A trailing newline closes the body (matches esrap when loc is present).
        if !statements.is_empty() {
            ctx.newline();
        }
    }

    fn print_statement(&mut self, stmt: &Statement, ctx: &mut Context) {
        match stmt {
            Statement::ExpressionStatement(s) => {
                // esrap wraps a leading object/function-expression statement in
                // parens so it isn't parsed as a block/declaration.
                let inner = unparen(&s.expression);
                let needs_parens = matches!(
                    inner,
                    Expression::ObjectExpression(_) | Expression::FunctionExpression(_)
                ) || matches!(inner, Expression::AssignmentExpression(a)
                    if matches!(a.left, AssignmentTarget::ObjectAssignmentTarget(_)));
                if needs_parens {
                    ctx.write("(");
                    self.print_expression(inner, ctx);
                    ctx.write(");");
                } else {
                    self.print_expression(inner, ctx);
                    ctx.write(";");
                }
            }
            Statement::VariableDeclaration(d) => {
                self.variable_declaration(d, ctx);
                ctx.write(";");
            }
            Statement::ReturnStatement(s) => {
                ctx.write("return");
                if let Some(arg) = &s.argument {
                    ctx.write(" ");
                    self.print_expression(unparen(arg), ctx);
                }
                ctx.write(";");
            }
            Statement::BlockStatement(b) => self.block(&b.body, ctx),
            Statement::EmptyStatement(_) => {}
            Statement::BreakStatement(_) => ctx.write("break;"),
            Statement::ContinueStatement(_) => ctx.write("continue;"),
            other => self.unsupported(statement_kind(other), ctx),
        }
    }

    /// esrap's `BlockStatement|ClassBody`: build the body into a child context,
    /// and only break it across lines when it has real content (so an empty body
    /// stays `{}`). The `Newline`s are idempotent flags, so body's trailing
    /// newline and the closing one collapse to a single line break before `}`.
    fn block(&mut self, body: &[Statement], ctx: &mut Context) {
        ctx.write("{");
        let mut child = ctx.child();
        self.body(body, &mut child);
        if !child.empty() {
            ctx.indent();
            ctx.newline();
            ctx.append(child);
            ctx.dedent();
            ctx.newline();
        }
        ctx.write("}");
    }

    fn variable_declaration(&mut self, decl: &VariableDeclaration, ctx: &mut Context) {
        ctx.write(match decl.kind {
            VariableDeclarationKind::Var => "var ",
            VariableDeclarationKind::Let => "let ",
            VariableDeclarationKind::Const => "const ",
            VariableDeclarationKind::Using => "using ",
            VariableDeclarationKind::AwaitUsing => "await using ",
        });
        for (i, declarator) in decl.declarations.iter().enumerate() {
            if i > 0 {
                ctx.write(", ");
            }
            self.binding_pattern(&declarator.id, ctx);
            if let Some(init) = &declarator.init {
                ctx.write(" = ");
                self.print_expression(unparen(init), ctx);
            }
        }
    }

    fn binding_pattern(&mut self, pattern: &BindingPattern, ctx: &mut Context) {
        match pattern {
            BindingPattern::BindingIdentifier(id) => ctx.write(id.name.as_str()),
            BindingPattern::AssignmentPattern(a) => {
                self.binding_pattern(&a.left, ctx);
                ctx.write(" = ");
                self.print_expression(unparen(&a.right), ctx);
            }
            BindingPattern::ObjectPattern(_) => self.unsupported("ObjectPattern", ctx),
            BindingPattern::ArrayPattern(_) => self.unsupported("ArrayPattern", ctx),
        }
    }

    // ----- expressions ------------------------------------------------------

    fn print_expression(&mut self, expr: &Expression, ctx: &mut Context) {
        match expr {
            Expression::ParenthesizedExpression(p) => self.print_expression(&p.expression, ctx),
            Expression::ChainExpression(c) => match &c.expression {
                ChainElement::CallExpression(call) => self.call_expression(call, ctx),
                ChainElement::StaticMemberExpression(m) => self.static_member(m, ctx),
                ChainElement::ComputedMemberExpression(m) => self.computed_member(m, ctx),
                ChainElement::PrivateFieldExpression(_) => {
                    self.unsupported("PrivateFieldExpression", ctx)
                }
                _ => self.unsupported("ChainElement", ctx),
            },
            Expression::Identifier(id) => ctx.write(id.name.as_str()),
            Expression::ThisExpression(_) => ctx.write("this"),
            Expression::BooleanLiteral(b) => ctx.write(if b.value { "true" } else { "false" }),
            Expression::NullLiteral(_) => ctx.write("null"),
            Expression::NumericLiteral(n) => ctx
                .write(literal_raw(n.raw.as_ref().map(|a| a.as_str()), || {
                    n.value.to_string()
                })),
            Expression::BigIntLiteral(n) => ctx
                .write(literal_raw(n.raw.as_ref().map(|a| a.as_str()), || {
                    format!("{}n", n.value)
                })),
            Expression::StringLiteral(s) => ctx.write(self.string_literal(s)),
            Expression::TemplateLiteral(_) => self.unsupported("TemplateLiteral", ctx),
            Expression::BinaryExpression(b) => self.binary_expression(b, ctx),
            Expression::LogicalExpression(l) => self.logical_expression(l, ctx),
            Expression::UnaryExpression(u) => self.unary_expression(u, ctx),
            Expression::CallExpression(c) => self.call_expression(c, ctx),
            Expression::StaticMemberExpression(m) => self.static_member(m, ctx),
            Expression::ComputedMemberExpression(m) => self.computed_member(m, ctx),
            Expression::ArrayExpression(a) => self.array_expression(a, ctx),
            Expression::ObjectExpression(o) => self.object_expression(o, ctx),
            Expression::AssignmentExpression(a) => self.assignment_expression(a, ctx),
            Expression::ConditionalExpression(c) => self.conditional_expression(c, ctx),
            Expression::SequenceExpression(s) => {
                for (i, e) in s.expressions.iter().enumerate() {
                    if i > 0 {
                        ctx.write(", ");
                    }
                    self.print_expression(unparen(e), ctx);
                }
            }
            other => self.unsupported(expression_kind(other), ctx),
        }
    }

    /// Print `child` parenthesised iff its precedence is below `min`.
    fn child_with_parens(&mut self, child: &Expression, min: u8, ctx: &mut Context) {
        let child = unparen(child);
        if expr_precedence(child) < min {
            ctx.write("(");
            self.print_expression(child, ctx);
            ctx.write(")");
        } else {
            self.print_expression(child, ctx);
        }
    }

    fn binary_expression(&mut self, node: &BinaryExpression, ctx: &mut Context) {
        let op = node.operator.as_str();
        self.binary_child(&node.left, false, op, false, ctx);
        ctx.write(format!(" {op} "));
        self.binary_child(&node.right, false, op, true, ctx);
    }

    fn logical_expression(&mut self, node: &LogicalExpression, ctx: &mut Context) {
        let op = node.operator.as_str();
        self.binary_child(&node.left, true, op, false, ctx);
        ctx.write(format!(" {op} "));
        self.binary_child(&node.right, true, op, true, ctx);
    }

    /// Print one operand of a binary/logical expression, parenthesised per
    /// esrap's `needs_parens` (operator precedence + associativity + the `**`
    /// and `??`-mixing special cases).
    fn binary_child(
        &mut self,
        child: &Expression,
        parent_is_logical: bool,
        parent_op: &str,
        is_right: bool,
        ctx: &mut Context,
    ) {
        let child = unparen(child);
        if binary_needs_parens(child, parent_is_logical, parent_op, is_right) {
            ctx.write("(");
            self.print_expression(child, ctx);
            ctx.write(")");
        } else {
            self.print_expression(child, ctx);
        }
    }

    fn unary_expression(&mut self, node: &UnaryExpression, ctx: &mut Context) {
        let op = node.operator.as_str();
        // `typeof`/`void`/`delete` are word operators and need a trailing space.
        if matches!(
            node.operator,
            UnaryOperator::Typeof | UnaryOperator::Void | UnaryOperator::Delete
        ) {
            ctx.write(format!("{op} "));
        } else {
            ctx.write(op.to_string());
        }
        self.child_with_parens(&node.argument, 15, ctx);
    }

    fn call_expression(&mut self, node: &CallExpression, ctx: &mut Context) {
        self.child_with_parens(&node.callee, 19, ctx);
        if node.optional {
            ctx.write("?.");
        }
        ctx.write("(");
        self.sequence_arguments(&node.arguments, ctx);
        ctx.write(")");
    }

    fn static_member(&mut self, node: &StaticMemberExpression, ctx: &mut Context) {
        self.child_with_parens(&node.object, 19, ctx);
        ctx.write(if node.optional { "?." } else { "." });
        ctx.write(node.property.name.as_str());
    }

    fn computed_member(&mut self, node: &ComputedMemberExpression, ctx: &mut Context) {
        self.child_with_parens(&node.object, 19, ctx);
        if node.optional {
            ctx.write("?.");
        }
        ctx.write("[");
        self.print_expression(unparen(&node.expression), ctx);
        ctx.write("]");
    }

    fn assignment_expression(&mut self, node: &AssignmentExpression, ctx: &mut Context) {
        self.assignment_target(&node.left, ctx);
        ctx.write(format!(" {} ", node.operator.as_str()));
        self.child_with_parens(&node.right, 3, ctx);
    }

    fn assignment_target(&mut self, target: &AssignmentTarget, ctx: &mut Context) {
        match target {
            AssignmentTarget::AssignmentTargetIdentifier(id) => ctx.write(id.name.as_str()),
            AssignmentTarget::StaticMemberExpression(m) => self.static_member(m, ctx),
            AssignmentTarget::ComputedMemberExpression(m) => self.computed_member(m, ctx),
            _ => self.unsupported("AssignmentTarget", ctx),
        }
    }

    fn conditional_expression(&mut self, node: &ConditionalExpression, ctx: &mut Context) {
        self.child_with_parens(&node.test, 5, ctx);
        ctx.write(" ? ");
        self.child_with_parens(&node.consequent, 4, ctx);
        ctx.write(" : ");
        self.child_with_parens(&node.alternate, 4, ctx);
    }

    fn array_expression(&mut self, node: &ArrayExpression, ctx: &mut Context) {
        ctx.write("[");
        let elems: Vec<Option<&Expression>> = node
            .elements
            .iter()
            .map(|e| match e {
                ArrayExpressionElement::SpreadElement(_) => None, // handled below
                ArrayExpressionElement::Elision(_) => None,
                _ => e.as_expression(),
            })
            .collect();
        // Only the simple (no spread/elision) case is wired for now.
        if node.elements.iter().any(|e| {
            matches!(
                e,
                ArrayExpressionElement::SpreadElement(_) | ArrayExpressionElement::Elision(_)
            )
        }) {
            self.unsupported("ArraySpreadOrElision", ctx);
        } else {
            for (i, el) in elems.iter().enumerate() {
                if i > 0 {
                    ctx.write(", ");
                }
                if let Some(e) = el {
                    self.print_expression(unparen(e), ctx);
                }
            }
        }
        ctx.write("]");
    }

    fn object_expression(&mut self, node: &ObjectExpression, ctx: &mut Context) {
        if node.properties.is_empty() {
            ctx.write("{}");
            return;
        }
        ctx.write("{ ");
        for (i, prop) in node.properties.iter().enumerate() {
            if i > 0 {
                ctx.write(", ");
            }
            match prop {
                ObjectPropertyKind::ObjectProperty(p) => self.object_property(p, ctx),
                ObjectPropertyKind::SpreadProperty(s) => {
                    ctx.write("...");
                    self.print_expression(unparen(&s.argument), ctx);
                }
            }
        }
        ctx.write(" }");
    }

    fn object_property(&mut self, prop: &ObjectProperty, ctx: &mut Context) {
        // Shorthand `{ x }` when key and value are the same identifier.
        if !prop.computed
            && prop.kind == PropertyKind::Init
            && let (PropertyKey::StaticIdentifier(key), Expression::Identifier(val)) =
                (&prop.key, &prop.value)
            && key.name == val.name
        {
            ctx.write(val.name.as_str());
            return;
        }
        if prop.computed {
            ctx.write("[");
            self.property_key(&prop.key, ctx);
            ctx.write("]: ");
        } else {
            self.property_key(&prop.key, ctx);
            ctx.write(": ");
        }
        self.print_expression(unparen(&prop.value), ctx);
    }

    fn property_key(&mut self, key: &PropertyKey, ctx: &mut Context) {
        match key {
            PropertyKey::StaticIdentifier(id) => ctx.write(id.name.as_str()),
            PropertyKey::PrivateIdentifier(id) => ctx.write(format!("#{}", id.name)),
            PropertyKey::StringLiteral(s) => ctx.write(self.string_literal(s)),
            PropertyKey::NumericLiteral(n) => ctx
                .write(literal_raw(n.raw.as_ref().map(|a| a.as_str()), || {
                    n.value.to_string()
                })),
            _ => {
                if let Some(e) = key.as_expression() {
                    self.print_expression(unparen(e), ctx);
                } else {
                    self.unsupported("PropertyKey", ctx);
                }
            }
        }
    }

    fn sequence_arguments(&mut self, args: &[Argument], ctx: &mut Context) {
        for (i, arg) in args.iter().enumerate() {
            if i > 0 {
                ctx.write(", ");
            }
            match arg {
                Argument::SpreadElement(s) => {
                    ctx.write("...");
                    self.print_expression(unparen(&s.argument), ctx);
                }
                _ => {
                    if let Some(e) = arg.as_expression() {
                        self.print_expression(unparen(e), ctx);
                    } else {
                        self.unsupported("Argument", ctx);
                    }
                }
            }
        }
    }

    // ----- literals ---------------------------------------------------------

    fn string_literal(&self, s: &StringLiteral) -> String {
        if let Some(raw) = &s.raw {
            return raw.to_string();
        }
        quote(s.value.as_str(), self.options.quote)
    }
}

/// esrap prefers a literal's preserved `raw` spelling; only synthesised literals
/// fall back to a canonical rendering.
fn literal_raw(raw: Option<&str>, fallback: impl FnOnce() -> String) -> String {
    match raw {
        Some(r) => r.to_string(),
        None => fallback(),
    }
}

/// Quote a string value with the preferred quote char, escaping as needed.
fn quote(value: &str, style: QuoteStyle) -> String {
    let q = match style {
        QuoteStyle::Single => '\'',
        QuoteStyle::Double => '"',
    };
    let mut out = String::with_capacity(value.len() + 2);
    out.push(q);
    for ch in value.chars() {
        match ch {
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if c == q => {
                out.push('\\');
                out.push(c);
            }
            c => out.push(c),
        }
    }
    out.push(q);
    out
}

fn statement_kind(stmt: &Statement) -> &'static str {
    match stmt {
        Statement::FunctionDeclaration(_) => "FunctionDeclaration",
        Statement::ClassDeclaration(_) => "ClassDeclaration",
        Statement::ImportDeclaration(_) => "ImportDeclaration",
        Statement::ExportNamedDeclaration(_) => "ExportNamedDeclaration",
        Statement::ExportDefaultDeclaration(_) => "ExportDefaultDeclaration",
        Statement::IfStatement(_) => "IfStatement",
        Statement::ForStatement(_) => "ForStatement",
        Statement::WhileStatement(_) => "WhileStatement",
        _ => "Statement",
    }
}

fn expression_kind(expr: &Expression) -> &'static str {
    match expr {
        Expression::ArrowFunctionExpression(_) => "ArrowFunctionExpression",
        Expression::FunctionExpression(_) => "FunctionExpression",
        Expression::NewExpression(_) => "NewExpression",
        Expression::TemplateLiteral(_) => "TemplateLiteral",
        Expression::AwaitExpression(_) => "AwaitExpression",
        Expression::UpdateExpression(_) => "UpdateExpression",
        _ => "Expression",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    fn roundtrip(src: &str) -> (String, Option<Unsupported>) {
        let allocator = Allocator::default();
        let ret = Parser::new(&allocator, src, SourceType::mjs()).parse();
        assert!(
            ret.diagnostics.is_empty(),
            "parse error: {:?}",
            ret.diagnostics
        );
        let opts = PrintOptions::default();
        let mut printer = Printer::new(&opts);
        let mut ctx = Context::new();
        printer.print_program(&ret.program, &mut ctx);
        (
            crate::command::print(&ctx.into_commands(), &opts.indent),
            printer.missing,
        )
    }

    fn print_ok(src: &str) -> String {
        let (out, missing) = roundtrip(src);
        assert!(
            missing.is_none(),
            "unsupported node: {missing:?} for {src:?}"
        );
        out
    }

    #[test]
    fn simple_var_and_expr() {
        assert_eq!(print_ok("const x = 1;"), "const x = 1;");
        assert_eq!(print_ok("let a = b;"), "let a = b;");
    }

    #[test]
    fn binary_precedence_parens() {
        assert_eq!(print_ok("const x = (1 + 2) * 3;"), "const x = (1 + 2) * 3;");
        assert_eq!(print_ok("const x = 1 + 2 * 3;"), "const x = 1 + 2 * 3;");
        assert_eq!(print_ok("const x = 1 - (2 - 3);"), "const x = 1 - (2 - 3);");
    }

    #[test]
    fn member_and_call() {
        assert_eq!(print_ok("foo.bar.baz();"), "foo.bar.baz();");
        assert_eq!(print_ok("a(b, c, d);"), "a(b, c, d);");
        assert_eq!(print_ok("obj['key'];"), "obj['key'];");
        assert_eq!(print_ok("a?.b?.();"), "a?.b?.();");
    }

    #[test]
    fn unary_and_conditional() {
        assert_eq!(print_ok("const x = typeof y;"), "const x = typeof y;");
        assert_eq!(print_ok("const x = !y;"), "const x = !y;");
        assert_eq!(print_ok("const x = a ? b : c;"), "const x = a ? b : c;");
    }

    #[test]
    fn object_and_array() {
        assert_eq!(print_ok("const x = { a: 1, b };"), "const x = { a: 1, b };");
        assert_eq!(print_ok("const x = {};"), "const x = {};");
        assert_eq!(print_ok("const x = [1, 2, 3];"), "const x = [1, 2, 3];");
    }

    #[test]
    fn string_raw_preserved() {
        assert_eq!(print_ok("const x = \"hi\";"), "const x = \"hi\";");
        assert_eq!(print_ok("const x = 'hi';"), "const x = 'hi';");
    }

    #[test]
    fn leading_object_statement_parenthesised() {
        assert_eq!(print_ok("({ a: 1 });"), "({ a: 1 });");
    }

    #[test]
    fn block_layout() {
        // `return` outside a function won't parse in mjs, so exercise the block
        // layout with an expression statement instead.
        assert_eq!(print_ok("{ a; }"), "{\n\ta;\n}");
        assert_eq!(print_ok("{}"), "{}");
    }
}
