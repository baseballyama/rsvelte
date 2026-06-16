//! AST-based rewrite of `var = expr` → `$.set(var, expr, true)`
//! for shadowed-state local variables.
//!
//! Replaces `mod.rs::transform_local_assignment` (lines 4955+).
//! Single-`=` only; the text version explicitly does not handle
//! compound or update operators here.
//!
//! Mapping (preserved exactly):
//!
//! | Source           | Replacement                        |
//! |------------------|------------------------------------|
//! | `var = expr`     | `$.set(var, expr, true)`           |
//!
//! Behaviour parity with the text version:
//!
//! - Only the FIRST occurrence per source is rewritten. The text
//!   version uses `line.find(...)` which returns the first byte
//!   position. The AST visitor naturally collects all
//!   `AssignmentExpression`s; we keep only the lexically first
//!   (smallest `span.start`) to match.
//! - Member targets (`obj.var = ...`, `var.prop = ...`) are
//!   left alone — the text version's `before` byte check
//!   excludes `.`-preceded identifiers.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::GetSpan;
use oxc_span::SourceType;
use oxc_syntax::operator::AssignmentOperator;

use super::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_LOCAL_ASSIGN_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `var = expr` for a single shadowed-state
/// local variable. Returns `None` when there's nothing to rewrite
/// or the source fails to parse.
pub fn transform_local_assign_ast(source: &str, var_name: &str) -> Option<String> {
    if var_name.is_empty() {
        return None;
    }
    memchr::memchr(b'=', source.as_bytes())?;
    memchr::memmem::find(source.as_bytes(), var_name.as_bytes())?;

    ast_rewrite::rewrite_once(
        &MODULE_LOCAL_ASSIGN_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions::default(),
        false,
        |program| {
            let mut collector = LocalAssignCollector {
                source,
                var_name,
                matches: Vec::new(),
            };
            collector.visit_program(program);
            // Match the text version: only the FIRST occurrence (smallest start).
            collector.matches.sort_by_key(|r| r.0);
            collector.matches.into_iter().take(1).collect()
        },
    )
}

struct LocalAssignCollector<'a> {
    source: &'a str,
    var_name: &'a str,
    matches: Vec<Edit>,
}

impl<'a, 'ast> Visit<'ast> for LocalAssignCollector<'a> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        if !matches!(expr.operator, AssignmentOperator::Assign) {
            return;
        }
        let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left else {
            return;
        };
        if id.name.as_str() != self.var_name {
            return;
        }

        let rhs_span = expr.right.span();
        let rhs_text = &self.source[rhs_span.start as usize..rhs_span.end as usize];
        let rewrite = format!("$.set({}, {}, true)", self.var_name, rhs_text);
        self.matches.push((expr.span.start, expr.span.end, rewrite));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn simple_assignment() {
        let out = transform_local_assign_ast("x = 5;", "x").unwrap();
        assert_eq!(out, "$.set(x, 5, true);");
    }

    #[test]
    fn rhs_with_complex_expression() {
        let out = transform_local_assign_ast("x = foo() + 1;", "x").unwrap();
        assert_eq!(out, "$.set(x, foo() + 1, true);");
    }

    #[test]
    fn only_first_occurrence_in_for_loop() {
        // Matches the text version's `line.find` behaviour.
        let src = "for (x = 0; x < 10; x = x + 1) {}";
        let out = transform_local_assign_ast(src, "x").unwrap();
        // First assignment (init) rewritten; later ones in cond/step left
        // for subsequent calls.
        assert_eq!(out, "for ($.set(x, 0, true); x < 10; x = x + 1) {}");
    }

    #[test]
    fn leaves_compound_assignment_alone() {
        assert!(transform_local_assign_ast("x += 5;", "x").is_none());
        assert!(transform_local_assign_ast("x ??= 5;", "x").is_none());
    }

    #[test]
    fn leaves_member_target_alone() {
        assert!(transform_local_assign_ast("obj.x = 5;", "x").is_none());
        assert!(transform_local_assign_ast("x.prop = 5;", "x").is_none());
    }

    #[test]
    fn leaves_other_var_alone() {
        assert!(transform_local_assign_ast("y = 5;", "x").is_none());
    }

    #[test]
    fn leaves_declaration_alone() {
        assert!(transform_local_assign_ast("let x = 5;", "x").is_none());
        assert!(transform_local_assign_ast("const x = 5;", "x").is_none());
        assert!(transform_local_assign_ast("var x = 5;", "x").is_none());
    }

    #[test]
    fn leaves_destructuring_alone() {
        assert!(transform_local_assign_ast("[x] = arr;", "x").is_none());
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "x = 5";"#;
        assert!(transform_local_assign_ast(src, "x").is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${x = 5}`;";
        let out = transform_local_assign_ast(src, "x").unwrap();
        assert_eq!(out, "let s = `${$.set(x, 5, true)}`;");
    }

    #[test]
    fn already_set_wrapped_is_not_double_wrapped() {
        // After wrap, the LHS is no longer an `x = ...` AssignmentExpression
        // (it's a CallExpression). So no re-wrap.
        let src = "$.set(x, 5, true);";
        assert!(transform_local_assign_ast(src, "x").is_none());
    }

    #[test]
    fn empty_var_name_is_no_op() {
        assert!(transform_local_assign_ast("x = 5;", "").is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_local_assign_ast("x = (", "x").is_none());
    }

    #[test]
    fn no_op_without_equals() {
        assert!(transform_local_assign_ast("foo(x);", "x").is_none());
    }

    #[test]
    fn no_op_when_var_name_absent_from_source() {
        // Fast-path probe: var name doesn't appear at all.
        assert!(transform_local_assign_ast("foo(y);", "x").is_none());
    }

    #[test]
    fn trailing_semicolon_preserved() {
        let out = transform_local_assign_ast("x = 5;", "x").unwrap();
        assert!(out.ends_with(";"));
    }

    #[test]
    fn no_trailing_semicolon_preserved() {
        let out = transform_local_assign_ast("x = 5", "x").unwrap();
        assert_eq!(out, "$.set(x, 5, true)");
    }
}
