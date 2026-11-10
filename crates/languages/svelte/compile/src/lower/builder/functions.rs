//! The builder's patterns, parameters and functions.

use oxc_allocator::ArenaBox;
use oxc_ast::ast;
use oxc_ast::ast::{
    ArrowFunctionBody, BindingPattern, Expression, FormalParameter, FormalParameterKind,
    FormalParameters, FunctionBody, FunctionType, Statement,
};
use oxc_span::{SPAN, Span};

use super::{Builder, unthunk};

impl<'o> Builder<'o> {
    pub(crate) fn binding(&self, name: &str) -> BindingPattern<'o> {
        BindingPattern::new_binding_identifier(SPAN, self.str(name), self)
    }

    /// A binding of `name` at `span`, which the source map points back to.
    pub(crate) fn binding_at(&self, name: &str, span: Span) -> BindingPattern<'o> {
        BindingPattern::new_binding_identifier(span, self.str(name), self)
    }

    pub(crate) fn parameter(&self, pattern: BindingPattern<'o>) -> FormalParameter<'o> {
        FormalParameter::new(
            SPAN,
            [],
            pattern,
            None,
            None,
            false,
            None,
            false,
            false,
            self,
        )
    }

    pub(crate) fn params<'n>(
        &self,
        names: impl IntoIterator<Item = &'n str>,
    ) -> ArenaBox<'o, FormalParameters<'o>> {
        self.formal_parameters(names.into_iter().map(|n| self.parameter(self.binding(n))))
    }

    pub(crate) fn formal_parameters(
        &self,
        items: impl IntoIterator<Item = FormalParameter<'o>>,
    ) -> ArenaBox<'o, FormalParameters<'o>> {
        FormalParameters::boxed(
            SPAN,
            FormalParameterKind::ArrowFormalParameters,
            self.vec(items),
            None,
            self,
        )
    }

    pub(crate) fn arrow(
        &self,
        parameters: ArenaBox<'o, FormalParameters<'o>>,
        body: Expression<'o>,
    ) -> Expression<'o> {
        Expression::new_arrow_function_expression(
            SPAN,
            false,
            None,
            parameters,
            None,
            ArrowFunctionBody::from(body),
            self,
        )
    }

    pub(crate) fn arrow_block(
        &self,
        parameters: ArenaBox<'o, FormalParameters<'o>>,
        body: impl IntoIterator<Item = Statement<'o>>,
        is_async: bool,
    ) -> Expression<'o> {
        let body = FunctionBody::boxed(SPAN, [], self.vec(body), self);
        Expression::new_arrow_function_expression(
            SPAN,
            is_async,
            None,
            parameters,
            None,
            ArrowFunctionBody::FunctionBody(body),
            self,
        )
    }

    /// `b.thunk`: `() => e`, or `f` for `() => f()`.
    pub(crate) fn thunk(&self, e: Expression<'o>) -> Expression<'o> {
        unthunk(self.arrow(self.params([]), e))
    }

    pub(crate) fn function_body(
        &self,
        body: impl IntoIterator<Item = Statement<'o>>,
    ) -> ArenaBox<'o, FunctionBody<'o>> {
        FunctionBody::boxed(SPAN, [], self.vec(body), self)
    }

    pub(crate) fn function_expression(
        &self,
        name: Option<&str>,
        parameters: ArenaBox<'o, FormalParameters<'o>>,
        body: impl IntoIterator<Item = Statement<'o>>,
        is_async: bool,
    ) -> Expression<'o> {
        Expression::new_function_expression(
            SPAN,
            FunctionType::FunctionExpression,
            name.map(|n| ast::BindingIdentifier::new(SPAN, self.str(n), self)),
            false,
            is_async,
            false,
            None,
            None,
            parameters,
            None,
            Some(self.function_body(body)),
            self,
        )
    }

    pub(crate) fn function_declaration(
        &self,
        name: &str,
        parameters: ArenaBox<'o, FormalParameters<'o>>,
        body: impl IntoIterator<Item = Statement<'o>>,
        is_async: bool,
    ) -> Statement<'o> {
        Statement::new_function_declaration(
            SPAN,
            FunctionType::FunctionDeclaration,
            Some(ast::BindingIdentifier::new(SPAN, self.str(name), self)),
            false,
            is_async,
            false,
            None,
            None,
            parameters,
            None,
            Some(self.function_body(body)),
            self,
        )
    }

    /// The parameter `name = value`.
    pub(crate) fn default_parameter(
        &self,
        name: &str,
        value: Expression<'o>,
    ) -> FormalParameter<'o> {
        let mut parameter = self.parameter(self.binding(name));
        parameter.initializer = Some(self.alloc(value));
        parameter
    }

    /// `function (...rest) { body }`.
    pub(crate) fn rest_function(
        &self,
        rest: &str,
        body: impl IntoIterator<Item = Statement<'o>>,
    ) -> Expression<'o> {
        let element = ast::BindingRestElement::new(SPAN, self.binding(rest), self);
        let rest = ast::FormalParameterRest::boxed(SPAN, [], element, None, self);
        let parameters = FormalParameters::boxed(
            SPAN,
            FormalParameterKind::FormalParameter,
            self.vec([]),
            Some(rest),
            self,
        );
        self.function_expression(None, parameters, body, false)
    }
}
