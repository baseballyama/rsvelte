//! The parentheses of TypeScript's emit (6.0.3 at 050880ce59).
//!
//! Those are the source's, except around a type assertion, plus the ones its factory adds where an
//! operand whose pair was dropped would start a statement, an arrow's body or a default export with
//! what may not start it.

use oxc_allocator::{Allocator, TakeIn};
use oxc_ast::ast::{
    ArrowFunctionExpression, AssignmentTarget, ChainElement, ExportDefaultDeclarationKind,
    Expression, ExpressionStatement, MemberExpression, SimpleAssignmentTarget,
};
use oxc_ast::builder::AstBuilder;
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::GetSpan;

/// Drops each pair TypeScript's `visitParenthesizedExpression` drops.
///
/// That is one whose expression, through more pairs, is an `as`, a `<T>` or a `satisfies`
/// (`src/compiler/transformers/ts.ts:1691-1720`). It runs before the types go, as it reads them.
pub struct AroundAssertions<'a> {
    allocator: &'a Allocator,
}

impl<'a> AroundAssertions<'a> {
    #[must_use]
    pub const fn new(allocator: &'a Allocator) -> Self {
        Self { allocator }
    }
}

impl std::fmt::Debug for AroundAssertions<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("AroundAssertions").finish_non_exhaustive()
    }
}

impl<'a> VisitMut<'a> for AroundAssertions<'a> {
    fn visit_expression(&mut self, it: &mut Expression<'a>) {
        while let Expression::ParenthesizedExpression(parenthesized) = it
            && is_assertion(parenthesized.expression.without_parentheses())
        {
            *it = parenthesized.expression.take_in(&self.allocator);
        }
        walk_mut::walk_expression(self, it);
    }
}

const fn is_assertion(expression: &Expression<'_>) -> bool {
    matches!(
        expression,
        Expression::TSAsExpression(_)
            | Expression::TSTypeAssertion(_)
            | Expression::TSSatisfiesExpression(_)
    )
}

/// Adds the pairs TypeScript's factory adds once the types are gone.
///
/// Those are `parenthesizeExpressionOfExpressionStatement` (435-457),
/// `parenthesizeConciseBodyOfArrowFunction` (461-469) and `parenthesizeExpressionOfExportDefault`
/// (355-366) in `src/compiler/factory/parenthesizerRules.ts`. The source cannot start any of the
/// three with what they wrap, so each one fires only where a dropped pair left it there.
pub struct Factory<'a> {
    allocator: &'a Allocator,
}

impl<'a> Factory<'a> {
    #[must_use]
    pub const fn new(allocator: &'a Allocator) -> Self {
        Self { allocator }
    }

    fn wrap(&self, expression: &mut Expression<'a>) {
        let inner = expression.take_in(&self.allocator);
        let builder = AstBuilder::new(self.allocator);
        *expression = Expression::new_parenthesized_expression(inner.span(), inner, &builder);
    }
}

impl std::fmt::Debug for Factory<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Factory").finish_non_exhaustive()
    }
}

impl<'a> VisitMut<'a> for Factory<'a> {
    fn visit_expression_statement(&mut self, it: &mut ExpressionStatement<'a>) {
        walk_mut::walk_expression_statement(self, it);
        // An optional call is a call to TypeScript too.
        let call = match &mut it.expression {
            Expression::CallExpression(call) => Some(call),
            Expression::ChainExpression(chain) => match &mut chain.expression {
                ChainElement::CallExpression(call) => Some(call),
                _ => None,
            },
            _ => None,
        };
        if let Some(call) = call
            && matches!(
                call.callee,
                Expression::FunctionExpression(_) | Expression::ArrowFunctionExpression(_)
            )
        {
            self.wrap(&mut call.callee);
        } else if matches!(
            leftmost(&it.expression),
            Expression::ObjectExpression(_) | Expression::FunctionExpression(_)
        ) {
            self.wrap(&mut it.expression);
        }
    }

    fn visit_arrow_function_expression(&mut self, it: &mut ArrowFunctionExpression<'a>) {
        walk_mut::walk_arrow_function_expression(self, it);
        if let Some(body) = it.body.as_expression_mut()
            && (matches!(body, Expression::SequenceExpression(_))
                || matches!(leftmost(body), Expression::ObjectExpression(_)))
        {
            self.wrap(body);
        }
    }

    fn visit_export_default_declaration_kind(&mut self, it: &mut ExportDefaultDeclarationKind<'a>) {
        walk_mut::walk_export_default_declaration_kind(self, it);
        if let Some(expression) = it.as_expression_mut()
            && (matches!(expression, Expression::SequenceExpression(_))
                || matches!(
                    leftmost(expression),
                    Expression::ClassExpression(_) | Expression::FunctionExpression(_)
                ))
        {
            self.wrap(expression);
        }
    }
}

/// TypeScript's `getLeftmostExpression` without stopping at calls
/// (`src/compiler/utilities.ts:8420-8456`). A pair of parentheses stops it.
fn leftmost<'b, 'a>(mut expression: &'b Expression<'a>) -> &'b Expression<'a> {
    loop {
        expression = match expression {
            Expression::UpdateExpression(update) if !update.prefix => {
                match target_object(&update.argument) {
                    Some(object) => object,
                    None => return expression,
                }
            }
            Expression::BinaryExpression(binary) => &binary.left,
            Expression::LogicalExpression(logical) => &logical.left,
            Expression::SequenceExpression(sequence) => &sequence.expressions[0],
            Expression::AssignmentExpression(assignment) => {
                match assignment_target_object(&assignment.left) {
                    Some(object) => object,
                    None => return expression,
                }
            }
            Expression::ConditionalExpression(conditional) => &conditional.test,
            Expression::TaggedTemplateExpression(tagged) => &tagged.tag,
            Expression::CallExpression(call) => &call.callee,
            Expression::ChainExpression(chain) => match &chain.expression {
                ChainElement::CallExpression(call) => &call.callee,
                ChainElement::TSNonNullExpression(non_null) => &non_null.expression,
                element => match element.as_member_expression() {
                    Some(member) => member.object(),
                    None => return expression,
                },
            },
            Expression::TSAsExpression(e) => &e.expression,
            Expression::TSSatisfiesExpression(e) => &e.expression,
            Expression::TSNonNullExpression(e) => &e.expression,
            e => match e.as_member_expression() {
                Some(member) => member.object(),
                None => return expression,
            },
        };
    }
}

fn target_object<'b, 'a>(target: &'b SimpleAssignmentTarget<'a>) -> Option<&'b Expression<'a>> {
    target.as_member_expression().map(MemberExpression::object)
}

fn assignment_target_object<'b, 'a>(
    target: &'b AssignmentTarget<'a>,
) -> Option<&'b Expression<'a>> {
    target.as_member_expression().map(MemberExpression::object)
}

/// `inner`, or the expression inside a pair of parentheses: an assignment target or a chain keeps
/// none, so those inside one of its types go with it.
pub(crate) fn inner_or_parenthesized<'a>(
    e: &mut Expression<'a>,
    allocator: &'a Allocator,
    inner: fn(&mut Expression<'a>, &'a Allocator) -> Option<Expression<'a>>,
) -> Option<Expression<'a>> {
    match e {
        Expression::ParenthesizedExpression(e) => Some(e.expression.take_in(&allocator)),
        e => inner(e, allocator),
    }
}
