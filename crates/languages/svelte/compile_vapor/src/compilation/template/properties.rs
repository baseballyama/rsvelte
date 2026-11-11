use oxc_ast::ast::{BinaryOperator, Expression, FunctionBody, LogicalOperator, UnaryOperator};
use oxc_ast_visit::Visit;
use oxc_syntax::scope::ScopeFlags;

use super::{Attribute, AttributeValue};

/// The event a binding's listener waits for.
pub(super) fn binding_event(property: &str) -> &'static str {
    match property {
        "value" => "input",
        "checked" | "group" => "change",
        _ => "",
    }
}

/// The `type` written as static text; `Some("text")` without one, `None` for a dynamic one.
pub(super) fn static_type<'a>(source_text: &str, attributes: &'a [Attribute]) -> Option<&'a str> {
    let mut ty = Some("text");
    for a in attributes {
        if a.name.text(source_text) == "type" {
            ty = match &a.value {
                AttributeValue::Static(v) => Some(&**v),
                _ => None,
            };
        }
    }
    ty
}

/// Whether a function body reads `this`, outside the nested functions that rebind it.
pub(super) fn reads_this(body: &FunctionBody<'_>) -> bool {
    struct This(bool);
    impl<'a> Visit<'a> for This {
        fn visit_this_expression(&mut self, _: &oxc_ast::ast::ThisExpression) {
            self.0 = true;
        }

        fn visit_function(&mut self, _: &oxc_ast::ast::Function<'a>, _: ScopeFlags) {}
    }
    let mut v = This(false);
    v.visit_function_body(body);
    v.0
}

/// An expression whose value is a boolean by construction.
pub(super) fn is_boolean(e: &Expression<'_>) -> bool {
    match e.get_inner_expression() {
        Expression::BooleanLiteral(_) => true,
        Expression::UnaryExpression(u) => u.operator == UnaryOperator::LogicalNot,
        Expression::BinaryExpression(b) => matches!(
            b.operator,
            BinaryOperator::Equality
                | BinaryOperator::Inequality
                | BinaryOperator::StrictEquality
                | BinaryOperator::StrictInequality
                | BinaryOperator::LessThan
                | BinaryOperator::LessEqualThan
                | BinaryOperator::GreaterThan
                | BinaryOperator::GreaterEqualThan
                | BinaryOperator::In
                | BinaryOperator::Instanceof
        ),
        Expression::LogicalExpression(l) => {
            matches!(l.operator, LogicalOperator::And | LogicalOperator::Or)
                && is_boolean(&l.left)
                && is_boolean(&l.right)
        }
        Expression::ConditionalExpression(c) => {
            is_boolean(&c.consequent) && is_boolean(&c.alternate)
        }
        _ => false,
    }
}

/// An expression whose value is a string, number or boolean by construction. Arithmetic is not:
/// it can be a `bigint`, which Vue's server drops from an attribute and Svelte's prints.
pub(super) fn is_primitive(e: &Expression<'_>) -> bool {
    let is_string = |e: &Expression<'_>| {
        matches!(
            e.get_inner_expression(),
            Expression::StringLiteral(_) | Expression::TemplateLiteral(_)
        )
    };
    match e.get_inner_expression() {
        Expression::StringLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::TemplateLiteral(_) => true,
        Expression::UnaryExpression(u) => {
            matches!(u.operator, UnaryOperator::UnaryPlus | UnaryOperator::Typeof) || is_boolean(e)
        }
        Expression::BinaryExpression(b) if b.operator == BinaryOperator::Addition => {
            is_string(&b.left) || is_string(&b.right)
        }
        Expression::LogicalExpression(l) => is_primitive(&l.left) && is_primitive(&l.right),
        Expression::ConditionalExpression(c) => {
            is_primitive(&c.consequent) && is_primitive(&c.alternate)
        }
        _ => is_boolean(e),
    }
}
