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

use oxc_allocator::{Box as ArenaBox, Vec as ArenaVec};
use oxc_ast::AstBuilder;
use oxc_ast::ast::*;
use oxc_span::{SPAN, Span};
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
        Expression::new_identifier(SPAN, self.str(name), &self.ab)
    }

    /// An [`IdentifierName`] (for static member property / meta-property keys).
    #[inline]
    pub fn id_name(self, name: &str) -> IdentifierName<'a> {
        IdentifierName::new(SPAN, self.str(name), &self.ab)
    }

    /// A string literal expression with the default (printer-chosen) quoting.
    #[inline]
    pub fn string(self, value: &str) -> Expression<'a> {
        Expression::new_string_literal(SPAN, self.str(value), None, &self.ab)
    }

    /// A numeric literal expression (decimal).
    #[inline]
    pub fn number(self, value: f64) -> Expression<'a> {
        Expression::new_numeric_literal(SPAN, value, None, NumberBase::Decimal, &self.ab)
    }

    /// A boolean literal expression.
    #[inline]
    pub fn bool(self, value: bool) -> Expression<'a> {
        Expression::new_boolean_literal(SPAN, value, &self.ab)
    }

    /// `null`.
    #[inline]
    pub fn null(self) -> Expression<'a> {
        Expression::new_null_literal(SPAN, &self.ab)
    }

    /// `this`.
    #[inline]
    pub fn this(self) -> Expression<'a> {
        Expression::ThisExpression(ThisExpression::boxed(SPAN, &self.ab))
    }

    /// `void 0`.
    #[inline]
    pub fn void0(self) -> Expression<'a> {
        Expression::UnaryExpression(UnaryExpression::boxed(
            SPAN,
            UnaryOperator::Void,
            self.number(0.0),
            &self.ab,
        ))
    }

    /// A property key: a bare identifier when `name` is a valid identifier,
    /// otherwise a string-literal key (upstream `b.key`).
    pub fn key(self, name: &str) -> PropertyKey<'a> {
        if is_valid_identifier(name) {
            PropertyKey::new_static_identifier(SPAN, self.str(name), &self.ab)
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
        Expression::from(MemberExpression::StaticMemberExpression(
            StaticMemberExpression::boxed(SPAN, object, property, false, &self.ab),
        ))
    }

    /// `object[property]` (computed, non-optional).
    #[inline]
    pub fn member_computed(
        self,
        object: Expression<'a>,
        property: Expression<'a>,
    ) -> Expression<'a> {
        Expression::from(MemberExpression::ComputedMemberExpression(
            ComputedMemberExpression::boxed(SPAN, object, property, false, &self.ab),
        ))
    }

    /// Build a static [`MemberExpression`] node (not wrapped as `Expression`),
    /// for callers needing the member form directly.
    #[inline]
    pub fn member_node(self, object: Expression<'a>, property: &str) -> MemberExpression<'a> {
        let property = self.id_name(property);
        MemberExpression::StaticMemberExpression(StaticMemberExpression::boxed(
            SPAN, object, property, false, &self.ab,
        ))
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
        Expression::CallExpression(CallExpression::boxed(
            SPAN,
            callee,
            oxc_ast::NONE,
            args,
            false,
            &self.ab,
        ))
    }

    /// `callee(args…)` taking pre-built [`Argument`]s (for spreads).
    pub fn call_args(
        self,
        callee: impl IntoExpr<'a>,
        args: ArenaVec<'a, Argument<'a>>,
    ) -> Expression<'a> {
        let callee = callee.into_expr(self);
        Expression::CallExpression(CallExpression::boxed(
            SPAN,
            callee,
            oxc_ast::NONE,
            args,
            false,
            &self.ab,
        ))
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

    /// `callee?.(args…)` — an optional call expression (upstream `b.maybe_call`'s
    /// `?.()` form). Used by the RenderTag optional-chain path.
    pub fn optional_call(
        self,
        callee: impl IntoExpr<'a>,
        args: Vec<Expression<'a>>,
    ) -> Expression<'a> {
        use oxc_ast::ast::ChainElement;
        let callee = callee.into_expr(self);
        let args = self.args(args);
        let call = CallExpression::boxed(SPAN, callee, oxc_ast::NONE, args, true, &self.ab);
        // Wrap in a ChainExpression so esrap prints the `?.()` chain form.
        Expression::ChainExpression(ChainExpression::boxed(
            SPAN,
            ChainElement::CallExpression(call),
            &self.ab,
        ))
    }

    /// `new callee(args…)`.
    pub fn new_expr(self, callee: impl IntoExpr<'a>, args: Vec<Expression<'a>>) -> Expression<'a> {
        let callee = callee.into_expr(self);
        let args = self.args(args);
        Expression::NewExpression(NewExpression::boxed(
            SPAN,
            callee,
            oxc_ast::NONE,
            args,
            &self.ab,
        ))
    }

    /// Convert a `Vec<Expression>` into an arena `Vec<Argument>`.
    pub fn args(self, exprs: Vec<Expression<'a>>) -> ArenaVec<'a, Argument<'a>> {
        let mut out = ArenaVec::with_capacity_in(exprs.len(), &self.ab);
        for e in exprs {
            out.push(Argument::from(e));
        }
        out
    }

    /// A spread argument `...expr` (for use with [`B::call_args`]).
    #[inline]
    pub fn spread_arg(self, expr: Expression<'a>) -> Argument<'a> {
        Argument::new_spread_element(SPAN, expr, &self.ab)
    }

    // -- operators ----------------------------------------------------------

    #[inline]
    pub fn binary(
        self,
        op: BinaryOperator,
        left: Expression<'a>,
        right: Expression<'a>,
    ) -> Expression<'a> {
        Expression::BinaryExpression(BinaryExpression::boxed(SPAN, left, op, right, &self.ab))
    }

    #[inline]
    pub fn logical(
        self,
        op: LogicalOperator,
        left: Expression<'a>,
        right: Expression<'a>,
    ) -> Expression<'a> {
        Expression::LogicalExpression(LogicalExpression::boxed(SPAN, left, op, right, &self.ab))
    }

    #[inline]
    pub fn unary(self, op: UnaryOperator, argument: Expression<'a>) -> Expression<'a> {
        Expression::UnaryExpression(UnaryExpression::boxed(SPAN, op, argument, &self.ab))
    }

    #[inline]
    pub fn conditional(
        self,
        test: Expression<'a>,
        consequent: Expression<'a>,
        alternate: Expression<'a>,
    ) -> Expression<'a> {
        Expression::ConditionalExpression(ConditionalExpression::boxed(
            SPAN, test, consequent, alternate, &self.ab,
        ))
    }

    #[inline]
    pub fn await_expr(self, argument: Expression<'a>) -> Expression<'a> {
        Expression::AwaitExpression(AwaitExpression::boxed(SPAN, argument, &self.ab))
    }

    pub fn sequence(self, expressions: Vec<Expression<'a>>) -> Expression<'a> {
        let mut out = ArenaVec::with_capacity_in(expressions.len(), &self.ab);
        for e in expressions {
            out.push(e);
        }
        Expression::SequenceExpression(SequenceExpression::boxed(SPAN, out, &self.ab))
    }

    // -- array & object -----------------------------------------------------

    /// `[elements…]`. `None` entries become elisions (holes).
    pub fn array(self, elements: Vec<Option<Expression<'a>>>) -> Expression<'a> {
        let mut out = ArenaVec::with_capacity_in(elements.len(), &self.ab);
        for el in elements {
            match el {
                None => out.push(ArrayExpressionElement::new_elision(SPAN, &self.ab)),
                Some(e) => out.push(ArrayExpressionElement::from(e)),
            }
        }
        Expression::ArrayExpression(ArrayExpression::boxed(SPAN, out, &self.ab))
    }

    /// `{ properties… }`.
    pub fn object(self, properties: Vec<ObjectPropertyKind<'a>>) -> Expression<'a> {
        let mut out = ArenaVec::with_capacity_in(properties.len(), &self.ab);
        for p in properties {
            out.push(p);
        }
        Expression::ObjectExpression(ObjectExpression::boxed(SPAN, out, &self.ab))
    }

    /// `name: value` object property (upstream `b.init`).
    pub fn init(self, name: &str, value: Expression<'a>) -> ObjectPropertyKind<'a> {
        let key = self.key(name);
        ObjectPropertyKind::ObjectProperty(ObjectProperty::boxed(
            SPAN,
            PropertyKind::Init,
            key,
            value,
            false,
            false,
            false,
            &self.ab,
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
        ObjectPropertyKind::ObjectProperty(ObjectProperty::boxed(
            SPAN, kind, key, value, method, shorthand, computed, &self.ab,
        ))
    }

    /// `...expr` spread property.
    pub fn spread(self, argument: Expression<'a>) -> ObjectPropertyKind<'a> {
        ObjectPropertyKind::SpreadProperty(SpreadElement::boxed(SPAN, argument, &self.ab))
    }

    /// `get name() { body }` (upstream `b.get`).
    pub fn get(self, name: &str, body: Vec<Statement<'a>>) -> ObjectPropertyKind<'a> {
        let key = self.key(name);
        let value = self.function_expr(None, self.empty_params(), self.body(body), false);
        ObjectPropertyKind::ObjectProperty(ObjectProperty::boxed(
            SPAN,
            PropertyKind::Get,
            key,
            value,
            false,
            false,
            false,
            &self.ab,
        ))
    }

    /// `set name($$value) { body }` (upstream `b.set`).
    pub fn set(self, name: &str, body: Vec<Statement<'a>>) -> ObjectPropertyKind<'a> {
        let key = self.key(name);
        let params = self.params(vec![self.id_pat("$$value")], None);
        let value = self.function_expr(None, params, self.body(body), false);
        ObjectPropertyKind::ObjectProperty(ObjectProperty::boxed(
            SPAN,
            PropertyKind::Set,
            key,
            value,
            false,
            false,
            false,
            &self.ab,
        ))
    }

    // -- functions & params -------------------------------------------------

    /// A simple identifier binding pattern.
    #[inline]
    pub fn id_pat(self, name: &str) -> BindingPattern<'a> {
        BindingPattern::new_binding_identifier(SPAN, self.str(name), &self.ab)
    }

    /// `{ name: value }` — a single-property object **binding pattern**
    /// (`b.object_pattern` / `b.init` for patterns). Used to lower `let:`
    /// directives into a destructured slot-function parameter.
    pub fn object_pattern(
        self,
        properties: Vec<(String, BindingPattern<'a>)>,
    ) -> BindingPattern<'a> {
        let mut props = ArenaVec::with_capacity_in(properties.len(), &self.ab);
        for (name, value) in properties {
            let key = PropertyKey::new_static_identifier(SPAN, self.str(&name), &self.ab);
            // `shorthand` is purely cosmetic for esrap output; mark it true when
            // the value is the same identifier as the key so `{ x }` prints
            // shorthand rather than `{ x: x }`.
            let shorthand = matches!(
                &value,
                BindingPattern::BindingIdentifier(id) if id.name.as_str() == name
            );
            props.push(BindingProperty::new(
                SPAN, key, value, shorthand, false, &self.ab,
            ));
        }
        BindingPattern::new_object_pattern(SPAN, props, oxc_ast::NONE, &self.ab)
    }

    /// Reinterpret an `Expression` as a `BindingPattern`, mirroring upstream's
    /// `@ts-expect-error` casts of an `ObjectExpression`/`ArrayExpression` parsed
    /// from a `let:`-directive value back into a destructuring pattern.
    ///
    /// - `ObjectExpression` → object pattern (recursing into property values),
    /// - `ArrayExpression` → array pattern (with holes / rest),
    /// - `Identifier` → binding identifier,
    /// - anything else → falls back to a binding identifier over its printed text
    ///   only when it is an identifier; otherwise the caller's `default_name`.
    pub fn expr_to_pattern(self, expr: Expression<'a>, default_name: &str) -> BindingPattern<'a> {
        use oxc_ast::ast::{ArrayExpressionElement, ObjectPropertyKind as OPK};
        match expr {
            Expression::Identifier(id) => self.id_pat(id.name.as_str()),
            Expression::ObjectExpression(obj) => {
                let props_vec = obj.unbox().properties;
                let mut props = ArenaVec::with_capacity_in(props_vec.len(), &self.ab);
                let mut rest = None;
                for member in props_vec {
                    match member {
                        OPK::ObjectProperty(p) => {
                            let p = p.unbox();
                            // The property key from an `ObjectExpression` is
                            // already a valid `PropertyKey` — reuse it as-is.
                            let key = p.key;
                            let value = self.expr_to_pattern(p.value, "undefined");
                            let shorthand = p.shorthand;
                            props.push(BindingProperty::new(
                                SPAN, key, value, shorthand, p.computed, &self.ab,
                            ));
                        }
                        OPK::SpreadProperty(s) => {
                            let inner = self.expr_to_pattern(s.unbox().argument, "undefined");
                            rest = Some(BindingRestElement::boxed(SPAN, inner, &self.ab));
                        }
                    }
                }
                BindingPattern::new_object_pattern(SPAN, props, rest, &self.ab)
            }
            Expression::ArrayExpression(arr) => {
                let elements = arr.unbox().elements;
                let mut out = ArenaVec::with_capacity_in(elements.len(), &self.ab);
                let mut rest = None;
                for el in elements {
                    match el {
                        ArrayExpressionElement::Elision(_) => out.push(None),
                        ArrayExpressionElement::SpreadElement(s) => {
                            let inner = self.expr_to_pattern(s.unbox().argument, "undefined");
                            rest = Some(BindingRestElement::boxed(SPAN, inner, &self.ab));
                        }
                        other => {
                            let e = Expression::try_from(other)
                                .unwrap_or_else(|_| self.id(default_name));
                            out.push(Some(self.expr_to_pattern(e, "undefined")));
                        }
                    }
                }
                BindingPattern::new_array_pattern(SPAN, out, rest, &self.ab)
            }
            Expression::AssignmentExpression(_) => self.id_pat(default_name),
            _ => self.id_pat(default_name),
        }
    }

    /// Empty formal parameter list.
    #[inline]
    pub fn empty_params(self) -> FormalParameters<'a> {
        self.params(vec![], None)
    }

    /// Build a `FormalParameters` from binding patterns + optional rest.
    pub fn params(
        self,
        patterns: Vec<BindingPattern<'a>>,
        rest: Option<BindingPattern<'a>>,
    ) -> FormalParameters<'a> {
        let mut items = ArenaVec::with_capacity_in(patterns.len(), &self.ab);
        for pat in patterns {
            items.push(FormalParameter::new(
                SPAN,
                ArenaVec::new_in(&self.ab),
                pat,
                oxc_ast::NONE,
                oxc_ast::NONE,
                false,
                None,
                false,
                false,
                &self.ab,
            ));
        }
        let rest: Option<oxc_allocator::Box<'a, oxc_ast::ast::FormalParameterRest<'a>>> =
            rest.map(|pat| {
                let rest_el: BindingRestElement<'a> = BindingRestElement::new(SPAN, pat, &self.ab);
                FormalParameterRest::boxed(
                    SPAN,
                    ArenaVec::new_in(&self.ab),
                    rest_el,
                    oxc_ast::NONE,
                    &self.ab,
                )
            });
        FormalParameters::new(
            SPAN,
            FormalParameterKind::ArrowFormalParameters,
            items,
            rest,
            &self.ab,
        )
    }

    /// Build a [`FunctionBody`] from a list of statements.
    pub fn body(self, statements: Vec<Statement<'a>>) -> FunctionBody<'a> {
        let stmts = ArenaVec::from_iter_in(statements, &self.ab);
        FunctionBody::new(SPAN, ArenaVec::new_in(&self.ab), stmts, &self.ab)
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
        Expression::ArrowFunctionExpression(ArrowFunctionExpression::boxed(
            SPAN,
            body_is_expression,
            is_async,
            oxc_ast::NONE,
            params,
            oxc_ast::NONE,
            body,
            &self.ab,
        ))
    }

    /// `(params) => expr` — concise-body arrow.
    pub fn arrow_expr(
        self,
        params: FormalParameters<'a>,
        expr: Expression<'a>,
        is_async: bool,
    ) -> Expression<'a> {
        let stmt = Statement::ExpressionStatement(ExpressionStatement::boxed(SPAN, expr, &self.ab));
        let body = self.body(vec![stmt]);
        self.arrow(params, body, true, is_async)
    }

    /// `() => expr`, collapsing `() => f()` to `f` (upstream `b.thunk` +
    /// `unthunk` for the zero-parameter case).
    pub fn thunk(self, expr: Expression<'a>, is_async: bool) -> Expression<'a> {
        if !is_async
            && let Expression::CallExpression(call) = &expr
            && !call.optional
            && call.arguments.is_empty()
            && let Expression::Identifier(idref) = &call.callee
        {
            // `() => f()` collapses to `f`.
            return self.id(idref.name.as_str());
        }
        self.arrow_expr(self.empty_params(), expr, is_async)
    }

    /// `() => { body }` — zero-param block-bodied arrow.
    pub fn thunk_block(self, body: Vec<Statement<'a>>, is_async: bool) -> Expression<'a> {
        let body = self.body(body);
        self.arrow(self.empty_params(), body, false, is_async)
    }

    /// A `FunctionExpression` (used as object get/set value and elsewhere).
    pub fn function_expr(
        self,
        id: Option<&str>,
        params: FormalParameters<'a>,
        body: FunctionBody<'a>,
        is_async: bool,
    ) -> Expression<'a> {
        let id = id.map(|n| BindingIdentifier::new(SPAN, self.str(n), &self.ab));
        let func = Function::boxed(
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
            &self.ab,
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
        let id = Some(BindingIdentifier::new(SPAN, self.str(name), &self.ab));
        let func = Function::boxed(
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
            &self.ab,
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

    /// Build a (possibly multi-declarator) variable declaration STATEMENT from
    /// `(pattern, init)` pairs sharing one `kind` — the general form used by the
    /// script transform when re-assembling a lowered declaration.
    pub fn var_decl_from_pairs(
        self,
        kind: VariableDeclarationKind,
        pairs: Vec<(BindingPattern<'a>, Option<Expression<'a>>)>,
    ) -> Statement<'a> {
        let mut declarators = ArenaVec::with_capacity_in(pairs.len(), &self.ab);
        for (pat, init) in pairs {
            declarators.push(VariableDeclarator::new(
                SPAN,
                kind,
                pat,
                oxc_ast::NONE,
                init,
                false,
                &self.ab,
            ));
        }
        let decl = VariableDeclaration::boxed(SPAN, kind, declarators, false, &self.ab);
        Statement::VariableDeclaration(decl)
    }

    /// Like `var_decl_from_pairs` but emits ONE `VariableDeclaration`
    /// statement per declarator pair (写经 the server text-oracle's
    /// `split_comma_separated_declarations`: the official compiler prints each
    /// top-level declarator as its own statement). A single pair yields one
    /// statement, identical to `var_decl_from_pairs` with one element.
    pub fn var_decls_split(
        self,
        kind: VariableDeclarationKind,
        pairs: Vec<(BindingPattern<'a>, Option<Expression<'a>>)>,
    ) -> Vec<Statement<'a>> {
        pairs
            .into_iter()
            .map(|(pat, init)| self.declaration(kind, pat, init))
            .collect()
    }

    fn declaration(
        self,
        kind: VariableDeclarationKind,
        pattern: BindingPattern<'a>,
        init: Option<Expression<'a>>,
    ) -> Statement<'a> {
        let declarator =
            VariableDeclarator::new(SPAN, kind, pattern, oxc_ast::NONE, init, false, &self.ab);
        let decls = ArenaVec::from_value_in(declarator, &self.ab);
        let decl = VariableDeclaration::boxed(SPAN, kind, decls, false, &self.ab);
        Statement::VariableDeclaration(decl)
    }

    // -- statements ---------------------------------------------------------

    /// `expr;` — expression statement.
    #[inline]
    pub fn stmt(self, expr: Expression<'a>) -> Statement<'a> {
        Statement::ExpressionStatement(ExpressionStatement::boxed(SPAN, expr, &self.ab))
    }

    /// `return expr;` / `return;`.
    #[inline]
    pub fn return_stmt(self, argument: Option<Expression<'a>>) -> Statement<'a> {
        Statement::ReturnStatement(ReturnStatement::boxed(SPAN, argument, &self.ab))
    }

    /// `{ body }` block statement.
    pub fn block(self, body: Vec<Statement<'a>>) -> Statement<'a> {
        let stmts = ArenaVec::from_iter_in(body, &self.ab);
        Statement::BlockStatement(BlockStatement::boxed(SPAN, stmts, &self.ab))
    }

    /// `if (test) consequent else alternate`.
    pub fn if_stmt(
        self,
        test: Expression<'a>,
        consequent: Statement<'a>,
        alternate: Option<Statement<'a>>,
    ) -> Statement<'a> {
        Statement::IfStatement(IfStatement::boxed(
            SPAN, test, consequent, alternate, &self.ab,
        ))
    }

    /// `do body while (test);` (upstream `b.do_while`).
    pub fn do_while(self, test: Expression<'a>, body: Statement<'a>) -> Statement<'a> {
        Statement::DoWhileStatement(DoWhileStatement::boxed(SPAN, body, test, &self.ab))
    }

    /// `!argument` — logical-NOT unary (upstream `b.unary('!', ...)`).
    #[inline]
    pub fn unary_not(self, argument: Expression<'a>) -> Expression<'a> {
        self.unary(UnaryOperator::LogicalNot, argument)
    }

    /// `;` empty statement.
    #[inline]
    pub fn empty(self) -> Statement<'a> {
        Statement::EmptyStatement(EmptyStatement::boxed(SPAN, &self.ab))
    }

    /// A *kept* `;` empty statement — one the esrap printer must NOT elide.
    ///
    /// esrap (faithful to upstream) drops bare `EmptyStatement`s from a body
    /// sequence, so a plain [`empty`](Self::empty) prints nothing. Some server
    /// outputs, however, must preserve a literal `;` per removed node — e.g. a
    /// non-dev top-level `$inspect(...)` / `$inspect(...).with(...)` whose
    /// CallExpression visitor returns `b.empty` as the *expression* of an
    /// `ExpressionStatement`, printing `;;` (the empty-as-expression `;` plus the
    /// statement's own `;`). We can't build an `ExpressionStatement` wrapping an
    /// `EmptyStatement` in oxc's typed AST, so we emit two of these sentinel
    /// empties instead; together they canonicalize to the same `;;`.
    ///
    /// The sentinel is `span.end == u32::MAX`; the printer keys on that to keep
    /// the statement. `start` must be distinct per emitted sentinel so the
    /// body-sequence comment-resync logic treats them as separate nodes.
    #[inline]
    pub fn empty_kept(self, start: u32) -> Statement<'a> {
        Statement::EmptyStatement(EmptyStatement::boxed(Span::new(start, u32::MAX), &self.ab))
    }

    /// `debugger;` statement (upstream `b.debugger`).
    #[inline]
    pub fn debugger(self) -> Statement<'a> {
        Statement::DebuggerStatement(DebuggerStatement::boxed(SPAN, &self.ab))
    }

    /// `target++` / `target--` / `++target` / `--target` (upstream `b.update`).
    pub fn update(
        self,
        op: UpdateOperator,
        prefix: bool,
        target: Expression<'a>,
    ) -> Expression<'a> {
        use oxc_ast::ast::SimpleAssignmentTarget;
        let st: SimpleAssignmentTarget<'a> = match target {
            Expression::Identifier(id) => SimpleAssignmentTarget::new_assignment_target_identifier(
                SPAN,
                self.str(id.name.as_str()),
                &self.ab,
            ),
            other => match MemberExpression::try_from(other) {
                Ok(member) => SimpleAssignmentTarget::from(member),
                Err(_) => panic!("update target must be an identifier or member expression"),
            },
        };
        Expression::UpdateExpression(UpdateExpression::boxed(SPAN, op, prefix, st, &self.ab))
    }

    /// A multi-declarator variable declaration node (the boxed form, suitable as
    /// a `for` statement init). Each `(name, init)` pair is one declarator.
    pub fn var_decl_multi_node(
        self,
        kind: VariableDeclarationKind,
        decls: Vec<(&str, Option<Expression<'a>>)>,
    ) -> oxc_allocator::Box<'a, oxc_ast::ast::VariableDeclaration<'a>> {
        let mut declarators = ArenaVec::with_capacity_in(decls.len(), &self.ab);
        for (name, init) in decls {
            let pat = self.id_pat(name);
            declarators.push(VariableDeclarator::new(
                SPAN,
                kind,
                pat,
                oxc_ast::NONE,
                init,
                false,
                &self.ab,
            ));
        }
        VariableDeclaration::boxed(SPAN, kind, declarators, false, &self.ab)
    }

    /// `for (init; test; update) body` (upstream `b.for`).
    pub fn for_stmt(
        self,
        init: Option<oxc_allocator::Box<'a, oxc_ast::ast::VariableDeclaration<'a>>>,
        test: Option<Expression<'a>>,
        update: Option<Expression<'a>>,
        body: Statement<'a>,
    ) -> Statement<'a> {
        use oxc_ast::ast::ForStatementInit;
        let init = init.map(ForStatementInit::VariableDeclaration);
        Statement::ForStatement(ForStatement::boxed(
            SPAN, init, test, update, body, &self.ab,
        ))
    }

    /// `throw new Error("…")` (upstream `b.throw_error`).
    pub fn throw_error(self, message: &str) -> Statement<'a> {
        let err = self.new_expr("Error", vec![self.string(message)]);
        Statement::ThrowStatement(ThrowStatement::boxed(SPAN, err, &self.ab))
    }

    // -- imports & exports --------------------------------------------------

    /// `import * as <as_name> from '<source>';` (upstream `b.import_all`).
    ///
    /// The source string is emitted verbatim between single quotes (no
    /// escaping), matching the established `module_source` convention so esrap
    /// reproduces `'svelte/internal/server'` byte-for-byte.
    pub fn import_all(self, as_name: &str, source: &str) -> Statement<'a> {
        let local = BindingIdentifier::new(SPAN, self.str(as_name), &self.ab);
        let mut specs = ArenaVec::with_capacity_in(1, &self.ab);
        specs.push(ImportDeclarationSpecifier::new_import_namespace_specifier(
            SPAN, local, &self.ab,
        ));
        let decl = ModuleDeclaration::new_import_declaration(
            SPAN,
            Some(specs),
            self.module_source(source),
            None,
            oxc_ast::NONE,
            ImportOrExportKind::Value,
            &self.ab,
        );
        Statement::from(decl)
    }

    /// `import { a, b as c } from '<source>';` (upstream `b.imports`).
    ///
    /// Each `(imported, local)` pair becomes a named specifier. An empty
    /// `parts` list yields a side-effect import `import '<source>';`.
    pub fn imports(self, parts: Vec<(&str, &str)>, source: &str) -> Statement<'a> {
        let specifiers = if parts.is_empty() {
            None
        } else {
            let mut specs = ArenaVec::with_capacity_in(parts.len(), &self.ab);
            for (imported, local) in parts {
                let imported_name = self.module_export_name(imported);
                let local_id = BindingIdentifier::new(SPAN, self.str(local), &self.ab);
                specs.push(ImportDeclarationSpecifier::new_import_specifier(
                    SPAN,
                    imported_name,
                    local_id,
                    ImportOrExportKind::Value,
                    &self.ab,
                ));
            }
            Some(specs)
        };
        let decl = ModuleDeclaration::new_import_declaration(
            SPAN,
            specifiers,
            self.module_source(source),
            None,
            oxc_ast::NONE,
            ImportOrExportKind::Value,
            &self.ab,
        );
        Statement::from(decl)
    }

    /// `export default <decl>;` where `<decl>` is a function declaration
    /// statement (upstream `b.export_default` of a `FunctionDeclaration`).
    ///
    /// Accepts the [`Statement`] produced by [`B::function_declaration`] and
    /// re-wraps its inner `Function` as the default-export declaration.
    pub fn export_default_fn(self, fn_decl: Statement<'a>) -> Statement<'a> {
        let kind = match fn_decl {
            Statement::FunctionDeclaration(func) => {
                oxc_ast::ast::ExportDefaultDeclarationKind::FunctionDeclaration(func)
            }
            other => {
                // Not a function declaration: fall back to expression form by
                // wrapping as an identifier is not possible, so treat the
                // statement as an error-free passthrough is unsupported — only
                // function declarations are produced by the entry assembly.
                return other;
            }
        };
        let decl = ModuleDeclaration::new_export_default_declaration(SPAN, kind, &self.ab);
        Statement::from(decl)
    }

    /// `export default <expr>;` (upstream `b.export_default` of an expression).
    pub fn export_default_expr(self, expr: Expression<'a>) -> Statement<'a> {
        let kind = oxc_ast::ast::ExportDefaultDeclarationKind::from(expr);
        let decl = ModuleDeclaration::new_export_default_declaration(SPAN, kind, &self.ab);
        Statement::from(decl)
    }

    /// Build a module-source `StringLiteral` emitted verbatim between single
    /// quotes (mirrors `to_oxc.rs::module_source`).
    fn module_source(self, source: &str) -> oxc_ast::ast::StringLiteral<'a> {
        let raw = self.str(&format!("'{source}'"));
        StringLiteral::new(SPAN, self.str(source), Some(raw.into()), &self.ab)
    }

    /// Build a `ModuleExportName::IdentifierName` from a plain name.
    fn module_export_name(self, name: &str) -> oxc_ast::ast::ModuleExportName<'a> {
        ModuleExportName::new_identifier_name(SPAN, self.str(name), &self.ab)
    }

    /// `target <op> value` assignment expression (upstream `b.assignment`).
    ///
    /// `target` must be a simple assignment target — an identifier or a member
    /// expression (the only forms the entry assembly produces).
    pub fn assignment(
        self,
        op: AssignmentOperator,
        target: Expression<'a>,
        value: Expression<'a>,
    ) -> Expression<'a> {
        use oxc_ast::ast::AssignmentTarget;
        let lhs: AssignmentTarget<'a> = match target {
            Expression::Identifier(id) => {
                AssignmentTarget::from(SimpleAssignmentTarget::new_assignment_target_identifier(
                    SPAN,
                    self.str(id.name.as_str()),
                    &self.ab,
                ))
            }
            other => match MemberExpression::try_from(other) {
                Ok(member) => AssignmentTarget::from(member),
                Err(_) => panic!("assignment target must be an identifier or member expression"),
            },
        };
        Expression::AssignmentExpression(AssignmentExpression::boxed(
            SPAN, op, lhs, value, &self.ab,
        ))
    }

    /// Assemble a module [`Program`] from top-level
    /// statements, ready for [`rsvelte_esrap::print`].
    pub fn program(self, body: Vec<Statement<'a>>) -> oxc_ast::ast::Program<'a> {
        let body = ArenaVec::from_iter_in(body, &self.ab);
        Program::new(
            SPAN,
            oxc_span::SourceType::mjs(),
            "",
            ArenaVec::new_in(&self.ab),
            None,
            ArenaVec::new_in(&self.ab),
            body,
            &self.ab,
        )
    }

    // -- template literals --------------------------------------------------

    /// Build a template literal from cooked quasi strings and interpolated
    /// expressions. `quasis.len()` must be `expressions.len() + 1`.
    pub fn template(self, quasis: Vec<&str>, expressions: Vec<Expression<'a>>) -> Expression<'a> {
        let n = quasis.len();
        let mut q = ArenaVec::with_capacity_in(n, &self.ab);
        for (i, cooked) in quasis.iter().enumerate() {
            let raw = sanitize_template_string(cooked);
            let value = TemplateElementValue {
                raw: self.str(&raw).into(),
                cooked: Some(self.str(cooked).into()),
            };
            q.push(TemplateElement::new(SPAN, value, i == n - 1, &self.ab));
        }
        let mut e = ArenaVec::with_capacity_in(expressions.len(), &self.ab);
        for expr in expressions {
            e.push(expr);
        }
        Expression::TemplateLiteral(ArenaBox::new_in(
            TemplateLiteral::new(SPAN, q, e, &self.ab),
            &self.ab,
        ))
    }
}

/// Escape a cooked template string into its raw spelling (mirrors upstream
/// `sanitize_template_string`): backtick, backslash, and `${` are escaped.
fn sanitize_template_string(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        match c {
            '`' => out.push_str("\\`"),
            '\\' => out.push_str("\\\\"),
            '$' if chars.peek() == Some(&'{') => out.push_str("\\$"),
            _ => out.push(c),
        }
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
    fn optional_call_chain() {
        // foo?.($$renderer, a);
        let out =
            print(|b| vec![b.stmt(b.optional_call("foo", vec![b.id("$$renderer"), b.id("a")]))]);
        assert_eq!(out.trim(), "foo?.($$renderer, a);");
    }

    #[test]
    fn member_and_call() {
        // $.push($$props, true);
        let out = print(|b| vec![b.stmt(b.call("$.push", vec![b.id("$$props"), b.bool(true)]))]);
        assert_eq!(out.trim(), "$.push($$props, true);");
    }

    #[test]
    fn unary_not_expr() {
        // !$$settled;
        let out = print(|b| vec![b.stmt(b.unary_not(b.id("$$settled")))]);
        assert_eq!(out.trim(), "!$$settled;");
    }

    #[test]
    fn do_while_loop() {
        // do { x = true; } while (!x);
        let out = print(|b| {
            let body = b.block(vec![b.stmt(b.assignment(
                oxc_ast::ast::AssignmentOperator::Assign,
                b.id("x"),
                b.bool(true),
            ))]);
            vec![b.do_while(b.unary_not(b.id("x")), body)]
        });
        assert_eq!(out.trim(), "do {\n\tx = true;\n} while (!x);");
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

    #[test]
    fn import_all_namespace() {
        // import * as $ from "svelte/internal/server";
        let out = print(|b| vec![b.import_all("$", "svelte/internal/server")]);
        assert_eq!(out.trim(), "import * as $ from 'svelte/internal/server';");
    }

    #[test]
    fn imports_named_and_side_effect() {
        // import { render as $$_render } from "svelte/server";
        let out = print(|b| vec![b.imports(vec![("render", "$$_render")], "svelte/server")]);
        assert_eq!(
            out.trim(),
            "import { render as $$_render } from 'svelte/server';"
        );
        // side-effect import (empty parts)
        let out2 = print(|b| vec![b.imports(vec![], "svelte/internal/flags/async")]);
        assert_eq!(out2.trim(), "import 'svelte/internal/flags/async';");
    }

    #[test]
    fn for_loop_with_update() {
        // for (let i = 0, $$length = arr.length; i < $$length; i++) {}
        let out = print(|b| {
            let init = b.var_decl_multi_node(
                VariableDeclarationKind::Let,
                vec![
                    ("i", Some(b.number(0.0))),
                    ("$$length", Some(b.member("arr", "length"))),
                ],
            );
            let test = b.binary(BinaryOperator::LessThan, b.id("i"), b.id("$$length"));
            let update = b.update(UpdateOperator::Increment, false, b.id("i"));
            let for_stmt = b.for_stmt(Some(init), Some(test), Some(update), b.block(vec![]));
            vec![for_stmt]
        });
        assert_eq!(
            out.trim(),
            "for (let i = 0, $$length = arr.length; i < $$length; i++) {}"
        );
    }

    #[test]
    fn var_decl_from_pairs_multi() {
        // let a = 1, b = $.derived(() => 2);
        let out = print(|b| {
            let pairs = vec![
                (b.id_pat("a"), Some(b.number(1.0))),
                (
                    b.id_pat("b"),
                    Some(b.call("$.derived", vec![b.thunk(b.number(2.0), false)])),
                ),
            ];
            vec![b.var_decl_from_pairs(VariableDeclarationKind::Let, pairs)]
        });
        assert_eq!(out.trim(), "let a = 1, b = $.derived(() => 2);");
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
                    if let Some(Expression::CallExpression(call)) = &mut d.init
                        && let Expression::Identifier(id) = &call.callee
                        && id.name == "$state"
                    {
                        // In-place replacement of the callee node.
                        call.callee = b.id("$.state");
                    }
                }
            }
        }

        let out = rsvelte_esrap::print(&ret.program, src);
        assert_eq!(out.trim(), "const x = $.state(0);");
    }
}
