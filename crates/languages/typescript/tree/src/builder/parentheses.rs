//! The parentheses of a snippet's parameters, which upstream's parser keeps there alone.

use oxc_allocator::{Allocator, TakeIn};
use oxc_ast::ast::Expression;
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::GetSpan;

/// Removes every parenthesized expression from `expression`, and records how many pairs wrapped
/// each node that had any, at its span `shift` bytes later.
pub(super) fn strip<'a>(
    allocator: &'a Allocator,
    expression: &mut Expression<'a>,
    shift: u32,
    recorded: &mut Vec<(oxc_span::Span, u8)>,
) {
    Strip {
        allocator,
        shift,
        recorded,
    }
    .visit_expression(expression);
}

struct Strip<'a, 'r> {
    allocator: &'a Allocator,
    shift: u32,
    recorded: &'r mut Vec<(oxc_span::Span, u8)>,
}

impl<'a> VisitMut<'a> for Strip<'a, '_> {
    fn visit_expression(&mut self, it: &mut Expression<'a>) {
        let mut pairs: u8 = 0;
        while let Expression::ParenthesizedExpression(parenthesized) = it {
            *it = parenthesized.expression.take_in(&self.allocator);
            pairs = pairs.saturating_add(1);
        }
        if pairs > 0 {
            let span = it.span();
            let shifted = oxc_span::Span::new(span.start + self.shift, span.end + self.shift);
            self.recorded.push((shifted, pairs));
        }
        walk_mut::walk_expression(self, it);
    }
}
