//! Guard against oxc's formatter dropping parentheses a brand check needs.
//!
//! `oxc_formatter`'s `binary_like_needs_parens` treats only `BinaryExpression`
//! and `LogicalExpression` as binary-like parents, so a `PrivateInExpression` —
//! oxc's own node for `#x in o` — falls to its `_ => return false` arm and both
//! sides of the check lose required parentheses:
//! `#x in (o || {})` prints as `#x in o || {}`, and `(#x in o) * 2` prints as
//! `#x in o * 2`. Both are different programs. See
//! `upstream_issues/3451-oxc-private-in-parens.md`.
//!
//! The guard verifies rather than predicts: it records the kind of every brand
//! check's right operand before and after formatting, and the caller keeps the
//! input when the two disagree. A program with no brand check produces an empty
//! record and never re-parses anything.

use oxc_ast::ast::{Expression, PrivateInExpression, Program};
use oxc_ast_visit::Visit;

/// A coarse class for the right operand of a brand check. Only the distinction
/// matters: both directions of the defect move the operand between classes
/// (a parenthesised `o || {}` collapses to a bare identifier; a bare `o` grows
/// into `o * 2` or `o.toString()`).
fn right_kind(expression: &Expression) -> u8 {
    match expression {
        Expression::LogicalExpression(_) => 1,
        Expression::BinaryExpression(_) => 2,
        Expression::ConditionalExpression(_) => 3,
        Expression::AssignmentExpression(_) => 4,
        Expression::SequenceExpression(_) => 5,
        Expression::StaticMemberExpression(_)
        | Expression::ComputedMemberExpression(_)
        | Expression::PrivateFieldExpression(_) => 6,
        Expression::CallExpression(_) => 7,
        Expression::PrivateInExpression(_) => 8,
        Expression::ChainExpression(_) => 9,
        Expression::TSAsExpression(_) | Expression::TSSatisfiesExpression(_) => 10,
        Expression::AwaitExpression(_) => 11,
        Expression::TaggedTemplateExpression(_) => 12,
        _ => 0,
    }
}

#[derive(Default)]
struct BrandChecks(Vec<u8>);

impl<'a> Visit<'a> for BrandChecks {
    fn visit_private_in_expression(&mut self, it: &PrivateInExpression<'a>) {
        self.0.push(right_kind(&it.right));
        oxc_ast_visit::walk::walk_private_in_expression(self, it);
    }
}

/// The right-operand class of every brand check in `program`, in source order.
/// Empty when the program has none, which is the overwhelmingly common case.
pub(crate) fn brand_check_shapes(program: &Program) -> Vec<u8> {
    let mut visitor = BrandChecks::default();
    visitor.visit_program(program);
    visitor.0
}
