//! AST-based equality instrumentation for module scripts (`.svelte.js` /
//! `.svelte.ts`) in dev mode: `===` / `!==` become `$.strict_equals(...)`
//! and `==` / `!=` become `$.equals(...)`, the negated forms carrying a
//! trailing `false` argument.
//!
//! Mirrors the rewrite performed inside the component instance script
//! visitor (`ast_state_transform::try_rewrite_strict_equals_binary`).
//! That visitor needs heavy infrastructure (drain inner replacements,
//! interact with state-var rewrites) which module scripts don't —
//! they have no `$state`, no per-binding tracking. So we get a much
//! smaller standalone walker here that just does the equality rewrite.
//!
//! Replaces the legacy text-based `rune_transforms::transform_strict_equals`
//! whose heuristics for "skip if inside a string" (counting quotes)
//! were fragile under escaped quotes, regex literals, line comments,
//! and template-literal `${...}` interpolation. The OXC parser knows
//! about all of those — incorrect rewrites just can't happen.

use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_span::GetSpan;
use oxc_syntax::operator::BinaryOperator;

use super::ast_rewrite::Edit;

/// Cheap byte probe gating entry into the AST pass. Every one of `===`, `!==`,
/// `==` and `!=` contains `==` or `!=`, while `<=` / `>=` / `=>` contain
/// neither, so this is a tight superset of what the rewrite can act on.
pub(super) fn source_has_equality_op(s: &str) -> bool {
    memchr::memmem::find(s.as_bytes(), b"==").is_some()
        || memchr::memmem::find(s.as_bytes(), b"!=").is_some()
}

/// The instrumented helper and whether the operator is the negated form,
/// for the four equality operators the dev rewrite covers.
fn equality_helper(op: BinaryOperator) -> Option<(&'static str, bool)> {
    match op {
        BinaryOperator::StrictEquality => Some(("$.strict_equals", false)),
        BinaryOperator::StrictInequality => Some(("$.strict_equals", true)),
        BinaryOperator::Equality => Some(("$.equals", false)),
        BinaryOperator::Inequality => Some(("$.equals", true)),
        _ => None,
    }
}

/// True when the subtree still holds an equality expression this pass would
/// rewrite. Deciding this on the AST rather than by scanning the operand text
/// keeps `==` from matching inside `===` (and `!=` inside `!==`, `<=`, `=>`).
fn contains_equality_expr<'a>(expr: &Expression<'a>) -> bool {
    struct Finder {
        found: bool,
    }
    impl<'a> Visit<'a> for Finder {
        fn visit_binary_expression(&mut self, expr: &BinaryExpression<'a>) {
            if equality_helper(expr.operator).is_some() {
                self.found = true;
                return;
            }
            walk::walk_binary_expression(self, expr);
        }
    }
    let mut finder = Finder { found: false };
    finder.visit_expression(expr);
    finder.found
}

/// Collect leaf equality rewrites (those whose operands don't themselves
/// contain an equality operator) from a single parse. Nested cases resolve
/// across fixed-point iterations — the batched module dev-tail driver drives
/// that loop.
pub(super) fn collect_strict_equals_edits(program: &Program<'_>, source: &str) -> Vec<Edit> {
    let mut collector = StrictEqualsCollector {
        source,
        replacements: Vec::new(),
    };
    collector.visit_program(program);
    collector.replacements
}

/// Per-call AST visitor: collects `(start, end, replacement_string)`
/// triples for every equality BinaryExpression *whose operands are leaf*
/// (don't themselves contain another equality operator). Nested cases are
/// handled by the fixed-point iteration in the caller.
struct StrictEqualsCollector<'src> {
    source: &'src str,
    replacements: Vec<Edit>,
}

impl<'a, 'src> Visit<'a> for StrictEqualsCollector<'src> {
    fn visit_binary_expression(&mut self, expr: &BinaryExpression<'a>) {
        // Walk children first so other binary expressions deeper in
        // the tree get a chance to record themselves.
        walk::walk_binary_expression(self, expr);

        let Some((helper, negated)) = equality_helper(expr.operator) else {
            return;
        };

        // Defer: if either operand still has an equality operator, leave this
        // node for the next fixed-point pass to pick up after the inner
        // rewrites have landed — the replacement copies operand text verbatim.
        if contains_equality_expr(&expr.left) || contains_equality_expr(&expr.right) {
            return;
        }

        let left_span = expr.left.span();
        let right_span = expr.right.span();
        let left_text = &self.source[left_span.start as usize..left_span.end as usize];
        let right_text = &self.source[right_span.start as usize..right_span.end as usize];

        let rewrite = format!(
            "{}({}, {}{})",
            helper,
            left_text.trim(),
            right_text.trim(),
            if negated { ", false" } else { "" }
        );

        self.replacements
            .push((expr.span.start, expr.span.end, rewrite));
    }
}

#[cfg(test)]
mod tests {
    use std::cell::RefCell;

    use oxc_allocator::Allocator;
    use oxc_parser::ParseOptions;
    use oxc_span::SourceType;

    use super::super::ast_rewrite;
    use super::*;

    thread_local! {
        static TEST_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
    }

    /// Drives `collect_strict_equals_edits` to a fixed point over its own
    /// parse — mirrors how the batched module dev-tail driver folds it, but
    /// for the strict-equals rewrite alone so these assertions stay scoped
    /// to this pass. Each iteration rewrites only leaf binaries; the loop
    /// re-parses so an outer `(a === b) === c` sees its rewritten operands.
    fn transform_strict_equals_module_ast(source: &str, is_ts: bool) -> Option<String> {
        if !source_has_equality_op(source) {
            return None;
        }
        let source_type = if is_ts {
            SourceType::ts().with_module(true)
        } else {
            SourceType::mjs()
        };
        let mut current: Option<String> = None;
        loop {
            let src = current.as_deref().unwrap_or(source);
            if !source_has_equality_op(src) {
                break;
            }
            match ast_rewrite::rewrite_once(
                &TEST_ALLOC,
                src,
                source_type,
                ParseOptions::default(),
                false,
                |program| collect_strict_equals_edits(program, src),
            ) {
                None => break,
                Some(rewritten) => current = Some(rewritten),
            }
        }
        current
    }

    #[test]
    fn rewrites_strict_equality() {
        let out = transform_strict_equals_module_ast("a === b", false).unwrap();
        assert_eq!(out, "$.strict_equals(a, b)");
    }

    #[test]
    fn rewrites_strict_inequality() {
        let out = transform_strict_equals_module_ast("a !== b", false).unwrap();
        assert_eq!(out, "$.strict_equals(a, b, false)");
    }

    #[test]
    fn rewrites_loose_equality() {
        let out = transform_strict_equals_module_ast("a == b", false).unwrap();
        assert_eq!(out, "$.equals(a, b)");
    }

    #[test]
    fn rewrites_loose_inequality() {
        let out = transform_strict_equals_module_ast("a != b", false).unwrap();
        assert_eq!(out, "$.equals(a, b, false)");
    }

    #[test]
    fn leaves_relational_operators_alone() {
        // `<=` / `>=` contain neither `==` nor `!=`, so they never enter the pass.
        assert!(transform_strict_equals_module_ast("a <= b", false).is_none());
        assert!(transform_strict_equals_module_ast("a >= b", false).is_none());
        assert!(transform_strict_equals_module_ast("(x) => x", false).is_none());
    }

    #[test]
    fn relational_operators_survive_a_run_of_the_pass() {
        // The probe only decides whether to enter; once inside, the visitor has
        // to leave the non-equality operators untouched.
        let src = "let f = (x) => x >= 1; let ok = a <= b && c === d;";
        let out = transform_strict_equals_module_ast(src, false).unwrap();
        assert_eq!(
            out,
            "let f = (x) => x >= 1; let ok = a <= b && $.strict_equals(c, d);"
        );
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        // The text-based version had to count quotes; the AST never
        // descends into string literal "contents" so this is safe.
        let src = r#"let s = "a === b";"#;
        assert!(transform_strict_equals_module_ast(src, false).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_template_literal_static() {
        let src = "let s = `a === b`;";
        assert!(transform_strict_equals_module_ast(src, false).is_none());
    }

    #[test]
    fn rewrites_inside_template_literal_expression() {
        let src = "let s = `result: ${a === b}`;";
        let out = transform_strict_equals_module_ast(src, false).unwrap();
        assert_eq!(out, "let s = `result: ${$.strict_equals(a, b)}`;");
    }

    #[test]
    fn nested_strict_equals_both_rewritten() {
        let src = "(a === b) === (c === d)";
        let out = transform_strict_equals_module_ast(src, false).unwrap();
        // Outer wraps the two inner rewrites
        assert_eq!(
            out,
            "$.strict_equals(($.strict_equals(a, b)), ($.strict_equals(c, d)))"
        );
    }

    #[test]
    fn nested_mixed_equality_both_rewritten() {
        let src = "(a === b) != (c == d)";
        let out = transform_strict_equals_module_ast(src, false).unwrap();
        // Known divergence: replacements copy operand text, so the source's
        // parens survive. The official compiler reprints from the AST and emits
        // `$.equals($.strict_equals(a, b), $.equals(c, d), false)`.
        assert_eq!(
            out,
            "$.equals(($.strict_equals(a, b)), ($.equals(c, d)), false)"
        );
    }

    #[test]
    fn no_op_when_no_operators() {
        assert!(transform_strict_equals_module_ast("let x = 1;", false).is_none());
    }

    #[test]
    fn preserves_complex_operands() {
        let src = "obj.foo() === arr[0]";
        let out = transform_strict_equals_module_ast(src, false).unwrap();
        assert_eq!(out, "$.strict_equals(obj.foo(), arr[0])");
    }

    #[test]
    fn ts_source_type_works() {
        let src = "let x: number = 1; x === 2";
        let out = transform_strict_equals_module_ast(src, true).unwrap();
        assert!(out.contains("$.strict_equals(x, 2)"));
    }

    #[test]
    fn parse_error_returns_none() {
        // `Allocator::reset` path: malformed source returns None
        // without mutating the input.
        let src = "let x = ;"; // syntax error
        assert!(transform_strict_equals_module_ast(src, false).is_none());
    }
}
