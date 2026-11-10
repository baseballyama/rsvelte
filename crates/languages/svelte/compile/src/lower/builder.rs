//! Short constructors for the output tree, in the output's own arena. Every node they build is
//! synthetic: its span is empty, so the source map leaves it out.

use oxc_allocator::{Allocator, ArenaBox, ArenaVec, GetAllocator};
use oxc_ast::ast;
use oxc_ast::ast::{
    Argument, ArrayExpressionElement, ArrowFunctionBody, AssignmentOperator, AssignmentTarget,
    BinaryOperator, BindingPattern, Expression, FormalParameters, IdentifierName, LogicalOperator,
    ObjectPropertyKind, PropertyKey, PropertyKind, SimpleAssignmentTarget, Statement,
    TemplateElement, TemplateElementValue, UnaryOperator, VariableDeclarationKind,
    VariableDeclarator,
};
use oxc_ast::builder::{AstBuilder, GetAstBuilder};
use oxc_span::{SPAN, Span};
use oxc_syntax::number::NumberBase;

mod functions;

pub(crate) struct Builder<'o> {
    ast: AstBuilder<'o>,
}

impl<'o> GetAstBuilder<'o> for Builder<'o> {
    type Builder = AstBuilder<'o>;

    fn builder(&self) -> &AstBuilder<'o> {
        &self.ast
    }
}

impl<'o> GetAllocator<'o> for Builder<'o> {
    fn allocator(&self) -> &'o Allocator {
        self.ast.allocator()
    }
}

impl<'o> Builder<'o> {
    pub(crate) fn new(allocator: &'o Allocator) -> Self {
        Self {
            ast: AstBuilder::new(allocator),
        }
    }

    pub(crate) fn str(&self, s: &str) -> &'o str {
        self.allocator().alloc_str(s)
    }

    pub(crate) fn vec<T>(&self, items: impl IntoIterator<Item = T>) -> ArenaVec<'o, T> {
        ArenaVec::from_iter_in(items, self)
    }

    pub(crate) fn alloc<T>(&self, value: T) -> ArenaBox<'o, T> {
        ArenaBox::new_in(value, self)
    }

    pub(crate) fn id(&self, name: &str) -> Expression<'o> {
        Expression::new_identifier(SPAN, self.str(name), self)
    }

    /// An identifier read at `span`, which the source map points back to.
    pub(crate) fn id_at(&self, name: &str, span: Span) -> Expression<'o> {
        Expression::new_identifier(span, self.str(name), self)
    }

    pub(crate) fn string(&self, value: &str) -> Expression<'o> {
        Expression::new_string_literal(SPAN, self.str(value), None, self)
    }

    pub(crate) fn number(&self, value: f64) -> Expression<'o> {
        Expression::new_numeric_literal(SPAN, value, None, NumberBase::Decimal, self)
    }

    pub(crate) fn boolean(&self, value: bool) -> Expression<'o> {
        Expression::new_boolean_literal(SPAN, value, self)
    }

    pub(crate) fn null(&self) -> Expression<'o> {
        Expression::new_null_literal(SPAN, self)
    }

    /// `void 0`, upstream's `undefined`.
    pub(crate) fn void0(&self) -> Expression<'o> {
        self.unary(UnaryOperator::Void, self.number(0.0))
    }

    pub(crate) fn this(&self) -> Expression<'o> {
        Expression::new_this_expression(SPAN, self)
    }

    pub(crate) fn member(&self, object: Expression<'o>, property: &str) -> Expression<'o> {
        let property = IdentifierName::new(SPAN, self.str(property), self);
        Expression::new_static_member_expression(SPAN, object, property, false, self)
    }

    pub(crate) fn computed(
        &self,
        object: Expression<'o>,
        property: Expression<'o>,
    ) -> Expression<'o> {
        Expression::new_computed_member_expression(SPAN, object, property, false, self)
    }

    /// `object.name`, or `object["name"]` when `name` is no identifier.
    pub(crate) fn member_key(&self, object: Expression<'o>, name: &str) -> Expression<'o> {
        if is_valid_identifier(name) {
            self.member(object, name)
        } else {
            self.computed(object, self.string(name))
        }
    }

    pub(crate) fn call(
        &self,
        callee: Expression<'o>,
        arguments: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        let arguments = self.vec(arguments.into_iter().map(Argument::from));
        Expression::new_call_expression(SPAN, callee, None, arguments, false, self)
    }

    /// `$.method(…)`.
    pub(crate) fn runtime(
        &self,
        method: &str,
        arguments: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        self.call(self.member(self.id("$"), method), arguments)
    }

    /// `b.call`: trailing missing arguments are dropped, inner ones are `void 0`.
    pub(crate) fn call_some(
        &self,
        callee: Expression<'o>,
        mut arguments: Vec<Option<Expression<'o>>>,
    ) -> Expression<'o> {
        while matches!(arguments.last(), Some(None)) {
            arguments.pop();
        }
        self.call(
            callee,
            arguments
                .into_iter()
                .map(|a| a.unwrap_or_else(|| self.void0())),
        )
    }

    /// [`Builder::call_some`] on `$.method`.
    pub(crate) fn runtime_some(
        &self,
        method: &str,
        arguments: Vec<Option<Expression<'o>>>,
    ) -> Expression<'o> {
        self.call_some(self.member(self.id("$"), method), arguments)
    }

    pub(crate) fn new_(
        &self,
        callee: Expression<'o>,
        arguments: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        let arguments = self.vec(arguments.into_iter().map(Argument::from));
        Expression::new_new_expression(SPAN, callee, None, arguments, self)
    }

    pub(crate) fn array(
        &self,
        elements: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        let elements = self.vec(elements.into_iter().map(ArrayExpressionElement::from));
        Expression::new_array_expression(SPAN, elements, self)
    }

    pub(crate) fn object(
        &self,
        properties: impl IntoIterator<Item = ObjectPropertyKind<'o>>,
    ) -> Expression<'o> {
        Expression::new_object_expression(SPAN, self.vec(properties), self)
    }

    /// `b.key`: an identifier key when `name` is one, a string key otherwise.
    pub(crate) fn key(&self, name: &str) -> PropertyKey<'o> {
        if is_valid_identifier(name) {
            PropertyKey::new_static_identifier(SPAN, self.str(name), self)
        } else {
            PropertyKey::from(self.string(name))
        }
    }

    pub(crate) fn property(
        &self,
        key: PropertyKey<'o>,
        value: Expression<'o>,
        computed: bool,
    ) -> ObjectPropertyKind<'o> {
        ObjectPropertyKind::new_object_property(
            SPAN,
            PropertyKind::Init,
            key,
            value,
            false,
            false,
            computed,
            self,
        )
    }

    /// `b.init(name, value)`: `{ name }` when the value is that identifier.
    pub(crate) fn init(&self, name: &str, value: Expression<'o>) -> ObjectPropertyKind<'o> {
        let shorthand = matches!(&value, Expression::Identifier(v) if v.name == name)
            && is_valid_identifier(name);
        ObjectPropertyKind::new_object_property(
            SPAN,
            PropertyKind::Init,
            self.key(name),
            value,
            false,
            shorthand,
            false,
            self,
        )
    }

    pub(crate) fn spread_property(&self, argument: Expression<'o>) -> ObjectPropertyKind<'o> {
        ObjectPropertyKind::new_spread_property(SPAN, argument, self)
    }

    /// `get name() { … }` or `set name(…) { … }`, as `kind` says.
    pub(crate) fn accessor(
        &self,
        kind: PropertyKind,
        name: &str,
        parameters: ArenaBox<'o, FormalParameters<'o>>,
        body: impl IntoIterator<Item = Statement<'o>>,
    ) -> ObjectPropertyKind<'o> {
        let function = self.function_expression(None, parameters, body, false);
        ObjectPropertyKind::new_object_property(
            SPAN,
            kind,
            self.key(name),
            function,
            false,
            false,
            false,
            self,
        )
    }

    /// `get name() { return value; }`
    pub(crate) fn getter(&self, name: &str, value: Expression<'o>) -> ObjectPropertyKind<'o> {
        self.accessor(
            PropertyKind::Get,
            name,
            self.params([]),
            [self.return_(Some(value))],
        )
    }

    pub(crate) fn unary(
        &self,
        operator: UnaryOperator,
        argument: Expression<'o>,
    ) -> Expression<'o> {
        Expression::new_unary_expression(SPAN, operator, argument, self)
    }

    pub(crate) fn binary(
        &self,
        left: Expression<'o>,
        operator: BinaryOperator,
        right: Expression<'o>,
    ) -> Expression<'o> {
        Expression::new_binary_expression(SPAN, left, operator, right, self)
    }

    pub(crate) fn logical(
        &self,
        left: Expression<'o>,
        operator: LogicalOperator,
        right: Expression<'o>,
    ) -> Expression<'o> {
        Expression::new_logical_expression(SPAN, left, operator, right, self)
    }

    pub(crate) fn sequence(
        &self,
        expressions: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        Expression::new_sequence_expression(SPAN, self.vec(expressions), self)
    }

    pub(crate) fn assign(
        &self,
        operator: AssignmentOperator,
        target: AssignmentTarget<'o>,
        value: Expression<'o>,
    ) -> Expression<'o> {
        Expression::new_assignment_expression(SPAN, operator, target, value, self)
    }

    /// `name = value`.
    pub(crate) fn assign_name(&self, name: &str, value: Expression<'o>) -> Expression<'o> {
        let target =
            SimpleAssignmentTarget::new_assignment_target_identifier(SPAN, self.str(name), self);
        self.assign(AssignmentOperator::Assign, target.into(), value)
    }

    /// `object.property = value` for a member `target`.
    pub(crate) fn assign_member(
        &self,
        target: Expression<'o>,
        value: Expression<'o>,
    ) -> Expression<'o> {
        let target = SimpleAssignmentTarget::from(target.into_member_expression());
        self.assign(AssignmentOperator::Assign, target.into(), value)
    }

    /// A template literal of cooked `quasis` with `expressions` between them.
    pub(crate) fn template<'q>(
        &self,
        quasis: impl IntoIterator<Item = &'q str>,
        expressions: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        let mut quasis: Vec<TemplateElement<'o>> = quasis
            .into_iter()
            .map(|q| {
                let raw = self.str(&crate::lower::sanitize_template_string(q));
                let value = TemplateElementValue {
                    raw: raw.into(),
                    cooked: Some(self.str(q).into()),
                };
                TemplateElement::new(SPAN, value, false, self)
            })
            .collect();
        if let Some(last) = quasis.last_mut() {
            last.tail = true;
        }
        Expression::new_template_literal(SPAN, self.vec(quasis), self.vec(expressions), self)
    }

    pub(crate) fn stmt(&self, expression: Expression<'o>) -> Statement<'o> {
        Statement::new_expression_statement(SPAN, expression, self)
    }

    pub(crate) fn block(&self, body: impl IntoIterator<Item = Statement<'o>>) -> Statement<'o> {
        Statement::new_block_statement(SPAN, self.vec(body), self)
    }

    pub(crate) fn return_(&self, argument: Option<Expression<'o>>) -> Statement<'o> {
        Statement::new_return_statement(SPAN, argument, self)
    }

    pub(crate) fn if_(
        &self,
        test: Expression<'o>,
        consequent: Statement<'o>,
        alternate: Option<Statement<'o>>,
    ) -> Statement<'o> {
        Statement::new_if_statement(SPAN, test, consequent, alternate, self)
    }

    pub(crate) fn declarator(
        &self,
        pattern: BindingPattern<'o>,
        init: Option<Expression<'o>>,
    ) -> VariableDeclarator<'o> {
        VariableDeclarator::new(SPAN, pattern, None, init, false, self)
    }

    pub(crate) fn declaration(
        &self,
        kind: VariableDeclarationKind,
        declarators: impl IntoIterator<Item = VariableDeclarator<'o>>,
    ) -> Statement<'o> {
        Statement::new_variable_declaration(SPAN, kind, self.vec(declarators), false, self)
    }

    /// `kind name = init;`
    pub(crate) fn declare(
        &self,
        kind: VariableDeclarationKind,
        name: &str,
        init: Option<Expression<'o>>,
    ) -> Statement<'o> {
        self.declaration(kind, [self.declarator(self.binding(name), init)])
    }

    pub(crate) fn var(&self, name: &str, init: Expression<'o>) -> Statement<'o> {
        self.declare(VariableDeclarationKind::Var, name, Some(init))
    }

    pub(crate) fn let_(&self, name: &str, init: Option<Expression<'o>>) -> Statement<'o> {
        self.declare(VariableDeclarationKind::Let, name, init)
    }

    pub(crate) fn const_(&self, name: &str, init: Expression<'o>) -> Statement<'o> {
        self.declare(VariableDeclarationKind::Const, name, Some(init))
    }

    /// `callee?.(arguments)`.
    pub(crate) fn optional_call(
        &self,
        callee: Expression<'o>,
        arguments: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        let arguments = self.vec(arguments.into_iter().map(Argument::from));
        let call = ast::CallExpression::boxed(SPAN, callee, None, arguments, true, self);
        Expression::new_chain_expression(SPAN, ast::ChainElement::CallExpression(call), self)
    }

    /// `object?.method(arguments)`.
    pub(crate) fn optional_method_call(
        &self,
        object: Expression<'o>,
        method: &str,
        arguments: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        let property = IdentifierName::new(SPAN, self.str(method), self);
        let callee = Expression::new_static_member_expression(SPAN, object, property, true, self);
        let arguments = self.vec(arguments.into_iter().map(Argument::from));
        let call = ast::CallExpression::boxed(SPAN, callee, None, arguments, false, self);
        Expression::new_chain_expression(SPAN, ast::ChainElement::CallExpression(call), self)
    }

    /// `(e)`, kept where upstream's printer keeps the parentheses.
    pub(crate) fn parenthesized(&self, e: Expression<'o>) -> Expression<'o> {
        Expression::new_parenthesized_expression(SPAN, e, self)
    }
}

/// `b.unthunk`: `(a, b) => f(a, b)` is `f`.
pub(crate) fn unthunk(arrow: Expression<'_>) -> Expression<'_> {
    let Expression::ArrowFunctionExpression(function) = &arrow else {
        return arrow;
    };
    let ArrowFunctionBody::CallExpression(call) = &function.body else {
        return arrow;
    };
    if function.r#async || call.optional {
        return arrow;
    }
    // Upstream names a runtime function `$.name` as one identifier.
    let callee_is_name = match &call.callee {
        Expression::Identifier(_) => true,
        Expression::StaticMemberExpression(member) => {
            matches!(&member.object, Expression::Identifier(o) if o.name == "$")
        }
        _ => false,
    };
    let parameters = &function.params;
    let same = callee_is_name
        && parameters.rest.is_none()
        && parameters.items.len() == call.arguments.len()
        && parameters.items.iter().zip(&call.arguments).all(|(p, a)| {
            matches!((&p.pattern, a), (BindingPattern::BindingIdentifier(p), Argument::Identifier(a)) if p.name == a.name)
        });
    if !same {
        return arrow;
    }
    let Expression::ArrowFunctionExpression(function) = arrow else {
        unreachable!()
    };
    let function = function.unbox();
    let ArrowFunctionBody::CallExpression(call) = function.body else {
        unreachable!()
    };
    call.unbox().callee
}

/// Upstream `regex_is_valid_identifier`: `/^[a-zA-Z_$][a-zA-Z_$0-9]*$/`.
pub(crate) fn is_valid_identifier(name: &str) -> bool {
    let mut chars = name.chars();
    chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}
