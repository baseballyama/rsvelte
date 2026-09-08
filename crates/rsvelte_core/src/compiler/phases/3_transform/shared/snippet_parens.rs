//! The source parentheses a snippet parameter keeps.
//!
//! Upstream parses every template expression with `preserveParens: true` and
//! then calls `remove_parens` on it — except a snippet's parameter list
//! (`1-parse/state/tag.js` reads it with `parse_expression_at` alone), which is
//! spread verbatim into the emitted function, so esrap prints one `(…)` per
//! surviving node and `is_safe_identifier`'s member-chain walk stops at one.
//! rsvelte unwraps every `ParenthesizedExpression` at conversion, so both
//! answers have to be recovered from the source.

use oxc_allocator::Allocator;
use oxc_ast::ast::{Expression, MemberExpression};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};
use rustc_hash::FxHashMap;

/// How many source parentheses wrap the node at each absolute span.
pub type SnippetParens = FxHashMap<(u32, u32), usize>;

/// What one snippet parameter's own source says about parentheses.
#[derive(Default)]
pub struct ParameterParens {
    /// Keyed by the span of the node each pair wraps.
    pub parens: SnippetParens,
    /// A pair sits on a member expression's `object`, which stops upstream's
    /// `is_safe_identifier` walk before it reaches an identifier.
    pub member_object_parenthesized: bool,
}

/// The parentheses the source writes inside one snippet parameter. `start`/`end`
/// are the parameter's own absolute span; the pair the caller's own wrapper
/// contributes is excluded.
pub fn snippet_parameter_parens(source: &str, start: u32, end: u32) -> ParameterParens {
    let mut out = ParameterParens::default();
    let (from, to) = (start as usize, end as usize);
    if start == 0 || to <= from || to > source.len() || !source.is_char_boundary(from) {
        return out;
    }
    if !source.is_char_boundary(to) {
        return out;
    }
    let slice = &source[from..to];
    if !slice.contains('(') {
        return out;
    }
    // A parameter is a binding pattern, not a statement, so it is wrapped to
    // reach an expression position; `base` undoes the one byte that adds.
    let wrapped = format!("({slice})");
    let base = start - 1;
    let allocator = Allocator::default();
    for source_type in [SourceType::mjs(), SourceType::ts()] {
        let ret = Parser::new(&allocator, &wrapped, source_type).parse();
        if !ret.diagnostics.is_empty() {
            continue;
        }
        let mut collector = Collector {
            outer: wrapped.len() as u32,
            base,
            out: &mut out,
        };
        collector.visit_program(&ret.program);
        break;
    }
    out
}

struct Collector<'a> {
    /// Length of the wrapped text, so the wrapper's own pair is skipped.
    outer: u32,
    base: u32,
    out: &'a mut ParameterParens,
}

impl<'a> Visit<'a> for Collector<'_> {
    fn visit_expression(&mut self, expr: &Expression<'a>) {
        if let Expression::ParenthesizedExpression(paren) = expr {
            let span = paren.span();
            if !(span.start == 0 && span.end == self.outer) {
                let mut inner = &paren.expression;
                while let Expression::ParenthesizedExpression(next) = inner {
                    inner = &next.expression;
                }
                let inner_span = inner.span();
                *self
                    .out
                    .parens
                    .entry((self.base + inner_span.start, self.base + inner_span.end))
                    .or_default() += 1;
            }
        }
        walk::walk_expression(self, expr);
    }

    fn visit_member_expression(&mut self, member: &MemberExpression<'a>) {
        if matches!(member.object(), Expression::ParenthesizedExpression(_)) {
            self.out.member_object_parenthesized = true;
        }
        walk::walk_member_expression(self, member);
    }
}
