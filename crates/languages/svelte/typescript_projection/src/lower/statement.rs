//! A template expression as svelte2tsx writes it: a statement of its own.

use oxc_ast::ast::{AssignmentTarget, ChainElement, Expression};
use oxc_span::GetSpan;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{Builder, Node, source_expression};

impl Builder<'_> {
    /// An expression as svelte2tsx writes it for a template: a bare statement, so TypeScript
    /// reads a leading `accessor` or `using` as the start of one. A `{text}` that opens with `{`
    /// is parenthesized, as svelte2tsx does, and one that opens with `function` or `class` keeps
    /// its parentheses here, so the projection stays valid TypeScript.
    pub(super) fn expression_statement(
        &mut self,
        expression: ExpressionIdentifier,
        end: Option<u32>,
        text: bool,
    ) -> Node {
        let e = self.expression(expression);
        let value = source_expression(e.span(), end);
        let parenthesized = match head(e) {
            Expression::ObjectExpression(_) => text,
            Expression::AssignmentExpression(x) => {
                text && matches!(x.left, AssignmentTarget::ObjectAssignmentTarget(_))
            }
            Expression::FunctionExpression(_) | Expression::ClassExpression(_) => true,
            _ => false,
        };
        if !parenthesized {
            return Node::Expression(value);
        }
        let value = self.tree.push(Node::Source(value));
        Node::Statement(self.tree.push(Node::Parenthesized(value)))
    }
}

/// The expression whose text starts `e`'s.
fn head<'e>(mut e: &'e Expression<'e>) -> &'e Expression<'e> {
    loop {
        e = match e {
            Expression::StaticMemberExpression(m) => &m.object,
            Expression::ComputedMemberExpression(m) => &m.object,
            Expression::PrivateFieldExpression(m) => &m.object,
            Expression::CallExpression(c) => &c.callee,
            Expression::TaggedTemplateExpression(t) => &t.tag,
            Expression::ChainExpression(c) => match &c.expression {
                ChainElement::CallExpression(c) => &c.callee,
                ChainElement::TSNonNullExpression(n) => &n.expression,
                ChainElement::StaticMemberExpression(m) => &m.object,
                ChainElement::ComputedMemberExpression(m) => &m.object,
                ChainElement::PrivateFieldExpression(m) => &m.object,
            },
            Expression::TSAsExpression(x) => &x.expression,
            Expression::TSSatisfiesExpression(x) => &x.expression,
            Expression::TSNonNullExpression(x) => &x.expression,
            Expression::TSInstantiationExpression(x) => &x.expression,
            Expression::BinaryExpression(x) => &x.left,
            Expression::LogicalExpression(x) => &x.left,
            Expression::ConditionalExpression(x) => &x.test,
            Expression::SequenceExpression(x) => match x.expressions.first() {
                Some(first) => first,
                None => return e,
            },
            _ => return e,
        };
    }
}
