//! Ergonomic oxc-AST builders — the Rust port of upstream Svelte's
//! `src/compiler/utils/builders.js` (`b.*`).
//!
//! Phase-3 visitors build an `oxc_ast::ast::Program` directly (no intermediate
//! string codegen and no custom IR), then print it once with
//! [`rsvelte_esrap::print`]. This module is the equivalent of upstream's `b.*`
//! helper namespace: every function returns a real oxc AST node allocated in
//! the arena behind the [`AstBuilder`], so a visitor port reads almost
//! 1:1 with the upstream JavaScript visitor.
//!
//! All construction patterns here are lifted verbatim from the proven
//! `js_ast::to_oxc` converter (which is variant-complete against oxc 0.136), so
//! the nodes they produce print byte-identically through esrap.
//!
//! Spans are always the dummy [`oxc_span::SPAN`]: esrap formats structurally,
//! so spans do not affect comment-free output.

use oxc_allocator::Vec as ArenaVec;
use oxc_ast::AstBuilder;
use oxc_ast::ast::{
    Argument, ArrayExpressionElement, BindingPattern, BindingRestElement, Expression,
    FormalParameterKind, FormalParameters, FunctionBody, FunctionType, IdentifierName,
    MemberExpression, ObjectPropertyKind, PropertyKey, PropertyKind, Statement,
    TemplateElementValue, VariableDeclarationKind,
};
use oxc_span::SPAN;
pub use oxc_syntax::number::NumberBase;
pub use oxc_syntax::operator::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator, UpdateOperator,
};

/// A `Copy` wrapper over [`AstBuilder`] exposing the upstream `b.*` helpers.
///
/// Construct once per program with [`B::new`] and pass it by value (it is
/// `Copy`, holding only a reference to the allocator).
#[derive(Clone, Copy)]
pub struct B<'a> {
    pub ab: AstBuilder<'a>,
}

/// Anything that can be coerced to an [`Expression`] in callee / object
/// position. A `&str` becomes an identifier (so `b.call("$.derived", …)` works
/// like the upstream `b.call('$.derived', …)`), mirroring esrap's
/// print-the-name-verbatim behaviour.
pub trait IntoExpr<'a> {
    fn into_expr(self, b: B<'a>) -> Expression<'a>;
}
impl<'a> IntoExpr<'a> for Expression<'a> {
    #[inline]
    fn into_expr(self, _b: B<'a>) -> Expression<'a> {
        self
    }
}
impl<'a> IntoExpr<'a> for &str {
    #[inline]
    fn into_expr(self, b: B<'a>) -> Expression<'a> {
        b.id(self)
    }
}
impl<'a> IntoExpr<'a> for &String {
    #[inline]
    fn into_expr(self, b: B<'a>) -> Expression<'a> {
        b.id(self)
    }
}

impl<'a> B<'a> {
    #[inline]
    pub fn new(allocator: &'a oxc_allocator::Allocator) -> Self {
        B {
            ab: AstBuilder::new(allocator),
        }
    }

    /// Allocate `s` into the oxc arena, yielding an `&'a str` (which satisfies
    /// the `Into<Atom<'a>>` bounds the builder methods take).
    #[inline]
    pub fn str(self, s: &str) -> &'a str {
        self.ab.allocator.alloc_str(s)
    }

    // -- identifiers & literals --------------------------------------------

    /// `name` — an identifier expression. The name is printed verbatim, so
    /// dotted "identifiers" like `"$.derived"` are valid (matching upstream).
    #[inline]
    pub fn id(self, name: &str) -> Expression<'a> {
        self.ab.expression_identifier(SPAN, self.str(name))
    }

    /// An [`IdentifierName`] (for static member property / meta-property keys).
    #[inline]
    pub fn id_name(self, name: &str) -> IdentifierName<'a> {
        self.ab.identifier_name(SPAN, self.str(name))
    }

    /// A string literal expression with the default (printer-chosen) quoting.
    #[inline]
    pub fn string(self, value: &str) -> Expression<'a> {
        self.ab
            .expression_string_literal(SPAN, self.str(value), None)
    }

    /// A numeric literal expression (decimal).
    #[inline]
    pub fn number(self, value: f64) -> Expression<'a> {
        self.ab
            .expression_numeric_literal(SPAN, value, None, NumberBase::Decimal)
    }

    /// A boolean literal expression.
    #[inline]
    pub fn bool(self, value: bool) -> Expression<'a> {
        self.ab.expression_boolean_literal(SPAN, value)
    }

    /// `null`.
    #[inline]
    pub fn null(self) -> Expression<'a> {
        self.ab.expression_null_literal(SPAN)
    }

    /// `this`.
    #[inline]
    pub fn this(self) -> Expression<'a> {
        self.ab.expression_this(SPAN)
    }

    /// `void 0`.
    #[inline]
    pub fn void0(self) -> Expression<'a> {
        self.ab
            .expression_unary(SPAN, UnaryOperator::Void, self.number(0.0))
    }

    /// A property key: a bare identifier when `name` is a valid identifier,
    /// otherwise a string-literal key (upstream `b.key`).
    pub fn key(self, name: &str) -> PropertyKey<'a> {
        if is_valid_identifier(name) {
            self.ab.property_key_static_identifier(SPAN, self.str(name))
        } else {
            PropertyKey::from(self.string(name))
        }
    }

    // -- member access ------------------------------------------------------

    /// `object.property` (static, non-optional).
    #[inline]
    pub fn member(self, object: impl IntoExpr<'a>, property: &str) -> Expression<'a> {
        let object = object.into_expr(self);
        let property = self.id_name(property);
        Expression::from(
            self.ab
                .member_expression_static(SPAN, object, property, false),
        )
    }

    /// `object[property]` (computed, non-optional).
    #[inline]
    pub fn member_computed(
        self,
        object: Expression<'a>,
        property: Expression<'a>,
    ) -> Expression<'a> {
        Expression::from(
            self.ab
                .member_expression_computed(SPAN, object, property, false),
        )
    }

    /// Build a static [`MemberExpression`] node (not wrapped as `Expression`),
    /// for callers needing the member form directly.
    #[inline]
    pub fn member_node(self, object: Expression<'a>, property: &str) -> MemberExpression<'a> {
        let property = self.id_name(property);
        self.ab
            .member_expression_static(SPAN, object, property, false)
    }

    /// `a.b.c` from a dotted path (upstream `b.member_id`).
    pub fn member_id(self, path: &str) -> Expression<'a> {
        let mut parts = path.split('.');
        let mut expr = self.id(parts.next().unwrap_or(""));
        for part in parts {
            expr = self.member(expr, part);
        }
        expr
    }

    // -- calls --------------------------------------------------------------

    /// `callee(args…)` with plain (non-spread) expression arguments.
    pub fn call(self, callee: impl IntoExpr<'a>, args: Vec<Expression<'a>>) -> Expression<'a> {
        let callee = callee.into_expr(self);
        let args = self.args(args);
        self.ab
            .expression_call(SPAN, callee, oxc_ast::NONE, args, false)
    }

    /// `callee(args…)` taking pre-built [`Argument`]s (for spreads).
    pub fn call_args(
        self,
        callee: impl IntoExpr<'a>,
        args: ArenaVec<'a, Argument<'a>>,
    ) -> Expression<'a> {
        let callee = callee.into_expr(self);
        self.ab
            .expression_call(SPAN, callee, oxc_ast::NONE, args, false)
    }

    /// Upstream `b.call(callee, ...args)` semantics with optional arguments:
    /// trailing `None`s are dropped, interior `None`s become `void 0`.
    pub fn call_opt(
        self,
        callee: impl IntoExpr<'a>,
        mut args: Vec<Option<Expression<'a>>>,
    ) -> Expression<'a> {
        while matches!(args.last(), Some(None)) {
            args.pop();
        }
        let args: Vec<Expression<'a>> = args
            .into_iter()
            .map(|a| a.unwrap_or_else(|| self.void0()))
            .collect();
        self.call(callee, args)
    }

    /// `new callee(args…)`.
    pub fn new_expr(self, callee: impl IntoExpr<'a>, args: Vec<Expression<'a>>) -> Expression<'a> {
        let callee = callee.into_expr(self);
        let args = self.args(args);
        self.ab.expression_new(SPAN, callee, oxc_ast::NONE, args)
    }

    /// Convert a `Vec<Expression>` into an arena `Vec<Argument>`.
    pub fn args(self, exprs: Vec<Expression<'a>>) -> ArenaVec<'a, Argument<'a>> {
        let mut out = self.ab.vec_with_capacity(exprs.len());
        for e in exprs {
            out.push(Argument::from(e));
        }
        out
    }

    /// A spread argument `...expr` (for use with [`B::call_args`]).
    #[inline]
    pub fn spread_arg(self, expr: Expression<'a>) -> Argument<'a> {
        self.ab.argument_spread_element(SPAN, expr)
    }

    // -- operators ----------------------------------------------------------

    #[inline]
    pub fn binary(
        self,
        op: BinaryOperator,
        left: Expression<'a>,
        right: Expression<'a>,
    ) -> Expression<'a> {
        self.ab.expression_binary(SPAN, left, op, right)
    }

    #[inline]
    pub fn logical(
        self,
        op: LogicalOperator,
        left: Expression<'a>,
        right: Expression<'a>,
    ) -> Expression<'a> {
        self.ab.expression_logical(SPAN, left, op, right)
    }

    #[inline]
    pub fn unary(self, op: UnaryOperator, argument: Expression<'a>) -> Expression<'a> {
        self.ab.expression_unary(SPAN, op, argument)
    }

    #[inline]
    pub fn conditional(
        self,
        test: Expression<'a>,
        consequent: Expression<'a>,
        alternate: Expression<'a>,
    ) -> Expression<'a> {
        self.ab
            .expression_conditional(SPAN, test, consequent, alternate)
    }

    #[inline]
    pub fn await_expr(self, argument: Expression<'a>) -> Expression<'a> {
        self.ab.expression_await(SPAN, argument)
    }

    pub fn sequence(self, expressions: Vec<Expression<'a>>) -> Expression<'a> {
        let mut out = self.ab.vec_with_capacity(expressions.len());
        for e in expressions {
            out.push(e);
        }
        self.ab.expression_sequence(SPAN, out)
    }

    // -- array & object -----------------------------------------------------

    /// `[elements…]`. `None` entries become elisions (holes).
    pub fn array(self, elements: Vec<Option<Expression<'a>>>) -> Expression<'a> {
        let mut out = self.ab.vec_with_capacity(elements.len());
        for el in elements {
            match el {
                None => out.push(self.ab.array_expression_element_elision(SPAN)),
                Some(e) => out.push(ArrayExpressionElement::from(e)),
            }
        }
        self.ab.expression_array(SPAN, out)
    }

    /// `{ properties… }`.
    pub fn object(self, properties: Vec<ObjectPropertyKind<'a>>) -> Expression<'a> {
        let mut out = self.ab.vec_with_capacity(properties.len());
        for p in properties {
            out.push(p);
        }
        self.ab.expression_object(SPAN, out)
    }

    /// `name: value` object property (upstream `b.init`).
    pub fn init(self, name: &str, value: Expression<'a>) -> ObjectPropertyKind<'a> {
        let key = self.key(name);
        ObjectPropertyKind::ObjectProperty(self.ab.alloc_object_property(
            SPAN,
            PropertyKind::Init,
            key,
            value,
            false,
            false,
            false,
        ))
    }

    /// A general property with explicit kind / method / shorthand / computed.
    #[allow(clippy::too_many_arguments)]
    pub fn prop(
        self,
        kind: PropertyKind,
        key: PropertyKey<'a>,
        value: Expression<'a>,
        method: bool,
        shorthand: bool,
        computed: bool,
    ) -> ObjectPropertyKind<'a> {
        ObjectPropertyKind::ObjectProperty(
            self.ab
                .alloc_object_property(SPAN, kind, key, value, method, shorthand, computed),
        )
    }

    /// `...expr` spread property.
    pub fn spread(self, argument: Expression<'a>) -> ObjectPropertyKind<'a> {
        ObjectPropertyKind::SpreadProperty(self.ab.alloc_spread_element(SPAN, argument))
    }

    /// `get name() { body }` (upstream `b.get`).
    pub fn get(self, name: &str, body: Vec<Statement<'a>>) -> ObjectPropertyKind<'a> {
        let key = self.key(name);
        let value = self.function_expr(None, self.empty_params(), self.body(body), false);
        ObjectPropertyKind::ObjectProperty(self.ab.alloc_object_property(
            SPAN,
            PropertyKind::Get,
            key,
            value,
            false,
            false,
            false,
        ))
    }

    /// `set name($$value) { body }` (upstream `b.set`).
    pub fn set(self, name: &str, body: Vec<Statement<'a>>) -> ObjectPropertyKind<'a> {
        let key = self.key(name);
        let params = self.params(vec![self.id_pat("$$value")], None);
        let value = self.function_expr(None, params, self.body(body), false);
        ObjectPropertyKind::ObjectProperty(self.ab.alloc_object_property(
            SPAN,
            PropertyKind::Set,
            key,
            value,
            false,
            false,
            false,
        ))
    }

    // -- functions & params -------------------------------------------------

    /// A simple identifier binding pattern.
    #[inline]
    pub fn id_pat(self, name: &str) -> BindingPattern<'a> {
        self.ab
            .binding_pattern_binding_identifier(SPAN, self.str(name))
    }

    /// Empty formal parameter list.
    #[inline]
    pub fn empty_params(self) -> FormalParameters<'a> {
        self.params(vec![], None)
    }

    /// Build a [`FormalParameters`] from binding patterns + optional rest.
    pub fn params(
        self,
        patterns: Vec<BindingPattern<'a>>,
        rest: Option<BindingPattern<'a>>,
    ) -> FormalParameters<'a> {
        let mut items = self.ab.vec_with_capacity(patterns.len());
        for pat in patterns {
            items.push(self.ab.formal_parameter(
                SPAN,
                self.ab.vec(),
                pat,
                oxc_ast::NONE,
                oxc_ast::NONE,
                false,
                None,
                false,
                false,
            ));
        }
        let rest: Option<oxc_allocator::Box<'a, oxc_ast::ast::FormalParameterRest<'a>>> =
            rest.map(|pat| {
                let rest_el: BindingRestElement<'a> = self.ab.binding_rest_element(SPAN, pat);
                self.ab
                    .alloc_formal_parameter_rest(SPAN, self.ab.vec(), rest_el, oxc_ast::NONE)
            });
        self.ab.formal_parameters(
            SPAN,
            FormalParameterKind::ArrowFormalParameters,
            items,
            rest,
        )
    }

    /// Build a [`FunctionBody`] from a list of statements.
    pub fn body(self, statements: Vec<Statement<'a>>) -> FunctionBody<'a> {
        let stmts = self.ab.vec_from_iter(statements);
        self.ab.function_body(SPAN, self.ab.vec(), stmts)
    }

    /// `(params) => body` / `async (params) => body`. `body_is_expression`
    /// distinguishes a concise expression body from a block body.
    pub fn arrow(
        self,
        params: FormalParameters<'a>,
        body: FunctionBody<'a>,
        body_is_expression: bool,
        is_async: bool,
    ) -> Expression<'a> {
        self.ab.expression_arrow_function(
            SPAN,
            body_is_expression,
            is_async,
            oxc_ast::NONE,
            params,
            oxc_ast::NONE,
            body,
        )
    }

    /// `(params) => expr` — concise-body arrow.
    pub fn arrow_expr(
        self,
        params: FormalParameters<'a>,
        expr: Expression<'a>,
        is_async: bool,
    ) -> Expression<'a> {
        let stmt = self.ab.statement_expression(SPAN, expr);
        let body = self.body(vec![stmt]);
        self.arrow(params, body, true, is_async)
    }

    /// `() => expr`, collapsing `() => f()` to `f` (upstream `b.thunk` +
    /// `unthunk` for the zero-parameter case).
    pub fn thunk(self, expr: Expression<'a>, is_async: bool) -> Expression<'a> {
        if !is_async {
            if let Expression::CallExpression(call) = &expr {
                if !call.optional && call.arguments.is_empty() {
                    if let Expression::Identifier(idref) = &call.callee {
                        // `() => f()` collapses to `f`.
                        return self.id(idref.name.as_str());
                    }
                }
            }
        }
        self.arrow_expr(self.empty_params(), expr, is_async)
    }

    /// `() => { body }` — zero-param block-bodied arrow.
    pub fn thunk_block(self, body: Vec<Statement<'a>>, is_async: bool) -> Expression<'a> {
        let body = self.body(body);
        self.arrow(self.empty_params(), body, false, is_async)
    }

    /// A [`FunctionExpression`] (used as object get/set value and elsewhere).
    pub fn function_expr(
        self,
        id: Option<&str>,
        params: FormalParameters<'a>,
        body: FunctionBody<'a>,
        is_async: bool,
    ) -> Expression<'a> {
        let id = id.map(|n| self.ab.binding_identifier(SPAN, self.str(n)));
        let func = self.ab.alloc_function(
            SPAN,
            FunctionType::FunctionExpression,
            id,
            false,
            is_async,
            false,
            oxc_ast::NONE,
            oxc_ast::NONE,
            params,
            oxc_ast::NONE,
            Some(body),
        );
        Expression::FunctionExpression(func)
    }

    /// `function name(params) { body }` declaration statement.
    pub fn function_declaration(
        self,
        name: &str,
        params: FormalParameters<'a>,
        body: FunctionBody<'a>,
        is_async: bool,
    ) -> Statement<'a> {
        let id = Some(self.ab.binding_identifier(SPAN, self.str(name)));
        let func = self.ab.alloc_function(
            SPAN,
            FunctionType::FunctionDeclaration,
            id,
            false,
            is_async,
            false,
            oxc_ast::NONE,
            oxc_ast::NONE,
            params,
            oxc_ast::NONE,
            Some(body),
        );
        Statement::from(oxc_ast::ast::Declaration::FunctionDeclaration(func))
    }

    // -- declarations -------------------------------------------------------

    /// `const pattern = init;` (or no init).
    pub fn const_decl(
        self,
        pattern: BindingPattern<'a>,
        init: Option<Expression<'a>>,
    ) -> Statement<'a> {
        self.declaration(VariableDeclarationKind::Const, pattern, init)
    }

    /// `let pattern = init;`.
    pub fn let_decl(
        self,
        pattern: BindingPattern<'a>,
        init: Option<Expression<'a>>,
    ) -> Statement<'a> {
        self.declaration(VariableDeclarationKind::Let, pattern, init)
    }

    /// `var pattern = init;`.
    pub fn var_decl(
        self,
        pattern: BindingPattern<'a>,
        init: Option<Expression<'a>>,
    ) -> Statement<'a> {
        self.declaration(VariableDeclarationKind::Var, pattern, init)
    }

    /// `const x = init;` convenience (identifier binding).
    pub fn const_id(self, name: &str, init: Expression<'a>) -> Statement<'a> {
        let pat = self.id_pat(name);
        self.const_decl(pat, Some(init))
    }

    /// `let x = init;` convenience (identifier binding).
    pub fn let_id(self, name: &str, init: Option<Expression<'a>>) -> Statement<'a> {
        let pat = self.id_pat(name);
        self.let_decl(pat, init)
    }

    fn declaration(
        self,
        kind: VariableDeclarationKind,
        pattern: BindingPattern<'a>,
        init: Option<Expression<'a>>,
    ) -> Statement<'a> {
        let declarator =
            self.ab
                .variable_declarator(SPAN, kind, pattern, oxc_ast::NONE, init, false);
        let decls = self.ab.vec1(declarator);
        let decl = self.ab.alloc_variable_declaration(SPAN, kind, decls, false);
        Statement::VariableDeclaration(decl)
    }

    // -- statements ---------------------------------------------------------

    /// `expr;` — expression statement.
    #[inline]
    pub fn stmt(self, expr: Expression<'a>) -> Statement<'a> {
        self.ab.statement_expression(SPAN, expr)
    }

    /// `return expr;` / `return;`.
    #[inline]
    pub fn return_stmt(self, argument: Option<Expression<'a>>) -> Statement<'a> {
        self.ab.statement_return(SPAN, argument)
    }

    /// `{ body }` block statement.
    pub fn block(self, body: Vec<Statement<'a>>) -> Statement<'a> {
        let stmts = self.ab.vec_from_iter(body);
        self.ab.statement_block(SPAN, stmts)
    }

    /// `if (test) consequent else alternate`.
    pub fn if_stmt(
        self,
        test: Expression<'a>,
        consequent: Statement<'a>,
        alternate: Option<Statement<'a>>,
    ) -> Statement<'a> {
        self.ab.statement_if(SPAN, test, consequent, alternate)
    }

    /// `;` empty statement.
    #[inline]
    pub fn empty(self) -> Statement<'a> {
        self.ab.statement_empty(SPAN)
    }

    /// `throw new Error("…")` (upstream `b.throw_error`).
    pub fn throw_error(self, message: &str) -> Statement<'a> {
        let err = self.new_expr("Error", vec![self.string(message)]);
        self.ab.statement_throw(SPAN, err)
    }

    /// Assemble a module [`Program`](oxc_ast::ast::Program) from top-level
    /// statements, ready for [`rsvelte_esrap::print`].
    pub fn program(self, body: Vec<Statement<'a>>) -> oxc_ast::ast::Program<'a> {
        let body = self.ab.vec_from_iter(body);
        self.ab.program(
            SPAN,
            oxc_span::SourceType::mjs(),
            "",
            self.ab.vec(),
            None,
            self.ab.vec(),
            body,
        )
    }

    // -- template literals --------------------------------------------------

    /// Build a template literal from cooked quasi strings and interpolated
    /// expressions. `quasis.len()` must be `expressions.len() + 1`.
    pub fn template(self, quasis: Vec<&str>, expressions: Vec<Expression<'a>>) -> Expression<'a> {
        let n = quasis.len();
        let mut q = self.ab.vec_with_capacity(n);
        for (i, cooked) in quasis.iter().enumerate() {
            let raw = sanitize_template_string(cooked);
            let value = TemplateElementValue {
                raw: self.str(&raw).into(),
                cooked: Some(self.str(cooked).into()),
            };
            q.push(self.ab.template_element(SPAN, value, i == n - 1));
        }
        let mut e = self.ab.vec_with_capacity(expressions.len());
        for expr in expressions {
            e.push(expr);
        }
        Expression::TemplateLiteral(self.ab.alloc(self.ab.template_literal(SPAN, q, e)))
    }
}

/// Escape a cooked template string into its raw spelling (mirrors upstream
/// `sanitize_template_string`): backtick, backslash, and `${` are escaped.
fn sanitize_template_string(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let bytes = s.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i] as char;
        match c {
            '`' => out.push_str("\\`"),
            '\\' => out.push_str("\\\\"),
            '$' if i + 1 < bytes.len() && bytes[i + 1] == b'{' => out.push_str("\\$"),
            _ => out.push(c),
        }
        i += 1;
    }
    out
}

/// Whether `name` is a valid JS identifier (so a property key can be emitted
/// bare rather than as a string literal). Conservative ASCII check.
fn is_valid_identifier(name: &str) -> bool {
    let mut chars = name.chars();
    match chars.next() {
        Some(c) if c == '_' || c == '$' || c.is_ascii_alphabetic() => {}
        _ => return false,
    }
    chars.all(|c| c == '_' || c == '$' || c.is_ascii_alphanumeric())
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Build a program with `B` and round-trip it through esrap, asserting the
    /// printed source. This validates that the `b.*` layer produces oxc nodes
    /// the printer renders exactly as upstream's builders would.
    fn print(build: impl for<'a> FnOnce(B<'a>) -> Vec<oxc_ast::ast::Statement<'a>>) -> String {
        let allocator = oxc_allocator::Allocator::default();
        let b = B::new(&allocator);
        let body = build(b);
        let program = b.program(body);
        rsvelte_esrap::print(&program, "")
    }

    #[test]
    fn const_state_call() {
        // const count = $.state(0);
        let out = print(|b| vec![b.const_id("count", b.call("$.state", vec![b.number(0.0)]))]);
        assert_eq!(out.trim(), "const count = $.state(0);");
    }

    #[test]
    fn member_and_call() {
        // $.push($$props, true);
        let out = print(|b| vec![b.stmt(b.call("$.push", vec![b.id("$$props"), b.bool(true)]))]);
        assert_eq!(out.trim(), "$.push($$props, true);");
    }

    #[test]
    fn thunk_collapses_zero_arg_call() {
        // $.derived(count) — thunk(() => count()) collapses to count.
        let out = print(|b| {
            let inner = b.call("count", vec![]);
            vec![b.stmt(b.call("$.derived", vec![b.thunk(inner, false)]))]
        });
        assert_eq!(out.trim(), "$.derived(count);");
    }

    #[test]
    fn thunk_keeps_non_collapsible() {
        // $.derived(() => a + b);
        let out = print(|b| {
            let sum = b.binary(BinaryOperator::Addition, b.id("a"), b.id("b"));
            vec![b.stmt(b.call("$.derived", vec![b.thunk(sum, false)]))]
        });
        assert_eq!(out.trim(), "$.derived(() => a + b);");
    }

    #[test]
    fn object_with_getter() {
        // ({ get x() { return 1; } });
        let out = print(|b| {
            let getter = b.get("x", vec![b.return_stmt(Some(b.number(1.0)))]);
            vec![b.stmt(b.object(vec![getter]))]
        });
        assert_eq!(out.trim(), "({\n\tget x() {\n\t\treturn 1;\n\t}\n});");
    }

    #[test]
    fn template_literal_with_interpolation() {
        // `a${x}b`
        let out = print(|b| vec![b.stmt(b.template(vec!["a", "b"], vec![b.id("x")]))]);
        assert_eq!(out.trim(), "`a${x}b`;");
    }

    #[test]
    fn member_id_path() {
        // import.meta — member_id builds a.b chains; use a plain path here.
        let out = print(|b| vec![b.stmt(b.member_id("a.b.c"))]);
        assert_eq!(out.trim(), "a.b.c;");
    }

    /// Architectural spike: prove an oxc 0.136 AST parsed from source can be
    /// MUTATED IN PLACE through `&mut` (no `VisitMut`, no text splicing) and
    /// re-printed with esrap. This is the core mechanism of the Phase-3 rewrite:
    /// parse JS faithfully with oxc, transform the oxc AST by hand-written
    /// mutable recursive descent, print once. Lowers `$state(0)` -> `$.state(0)`.
    #[test]
    fn spike_inplace_oxc_mutation() {
        use oxc_ast::ast::{Expression, Statement};
        let allocator = oxc_allocator::Allocator::default();
        let src = "const x = $state(0);";
        let mut ret = oxc_parser::Parser::new(&allocator, src, oxc_span::SourceType::mjs()).parse();
        assert!(
            ret.diagnostics.is_empty(),
            "parse errors: {:?}",
            ret.diagnostics
        );
        let b = B::new(&allocator);

        // Walk mutably: find the `$state(...)` call and replace its callee.
        for stmt in ret.program.body.iter_mut() {
            if let Statement::VariableDeclaration(vd) = stmt {
                for d in vd.declarations.iter_mut() {
                    if let Some(Expression::CallExpression(call)) = &mut d.init {
                        if let Expression::Identifier(id) = &call.callee {
                            if id.name == "$state" {
                                // In-place replacement of the callee node.
                                call.callee = b.id("$.state");
                            }
                        }
                    }
                }
            }
        }

        let out = rsvelte_esrap::print(&ret.program, src);
        assert_eq!(out.trim(), "const x = $.state(0);");
    }
}
