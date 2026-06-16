//! AST-based rewrite of private-field assignment expressions
//! (simple + compound).
//!
//! Replaces the assignment branches in
//! `class_transforms.rs::transform_class_methods_non_this`
//! (lines 1357–1404). The text version uses
//! `result.find(format!("{} {} ", qualified, op))` then a
//! `.find(';')` cliff to extract the RHS — which breaks on
//! multi-line RHS or RHS containing semicolons inside string
//! literals. The AST visitor walks `AssignmentExpression`s with
//! `PrivateFieldExpression` LHS directly.
//!
//! Mappings (preserved exactly):
//!
//! | Source              | Replacement                                  |
//! |---------------------|----------------------------------------------|
//! | `q = expr`          | `$.set(q, expr)`                             |
//! | `q += expr`         | `$.set(q, $.get(q) + expr)`                  |
//! | `q -= expr`         | `$.set(q, $.get(q) - expr)`                  |
//! | `q *= expr`         | `$.set(q, $.get(q) * expr)`                  |
//! | `q /= expr`         | `$.set(q, $.get(q) / expr)`                  |
//! | `q %= expr`         | `$.set(q, $.get(q) % expr)`                  |
//! | `q **= expr`        | `$.set(q, $.get(q) ** expr)`                 |
//!
//! Where `q` is one of the qualified names passed by the caller
//! (e.g. `"instance.#count"`). Match is by source-text equality
//! at the LHS PrivateField span — same convention as
//! `private_read_wrap_ast`.
//!
//! Update expressions on private-field arguments
//! (`q++`, `++q`, `q--`, `--q`) are also rewritten to
//! `$.update(q)` / `$.update(q, -1)` / `$.update_pre(q)` /
//! `$.update_pre(q, -1)` — same shape as
//! `private_class_assign_ast` (the with-`this` variant), minus
//! the `$state` proxy-flag (which doesn't apply to updates).
//!
//! Member reads (`q.foo`) and standalone reads remain on the
//! text path / other helpers.
//!
//! Logical compound (`??=`, `&&=`, `||=`) intentionally NOT
//! supported — the text version's `compound_ops` allowlist
//! doesn't include them either.
//!
//! ## Idempotency
//!
//! After wrap, the AssignmentExpression is replaced by a
//! `$.set(q, ...)` CallExpression. There's no more
//! AssignmentExpression at that span, so the visitor doesn't
//! re-trigger. The inner `q` references inside `$.set(q, ...)` /
//! `$.get(q)` aren't LHS of any AssignmentExpression, so they're
//! safe.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::GetSpan;
use oxc_span::SourceType;
use oxc_syntax::operator::{AssignmentOperator, UpdateOperator};

use super::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_PRIVATE_FIELD_ASSIGN_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// AST-based rewrite of `q = expr` / `q <op>= expr` where `q` is a
/// private-field expression whose source text matches one of
/// `qualified_names`. Returns `None` when there's nothing to
/// rewrite or the source fails to parse.
pub fn transform_private_field_assign_ast(
    source: &str,
    qualified_names: &[String],
) -> Option<String> {
    if qualified_names.is_empty() {
        return None;
    }
    if !qualified_names
        .iter()
        .any(|q| memchr::memmem::find(source.as_bytes(), q.as_bytes()).is_some())
    {
        return None;
    }

    ast_rewrite::fixed_point(source, |src| {
        ast_rewrite::rewrite_once(
            &MODULE_PRIVATE_FIELD_ASSIGN_ALLOC,
            src,
            SourceType::mjs(),
            ParseOptions {
                allow_return_outside_function: true,
                ..ParseOptions::default()
            },
            true,
            |program| {
                let mut collector = PrivateFieldAssignCollector {
                    source: src,
                    qualified_names,
                    replacements: Vec::new(),
                };
                collector.visit_program(program);
                collector.replacements
            },
        )
    })
}

struct PrivateFieldAssignCollector<'a> {
    source: &'a str,
    qualified_names: &'a [String],
    replacements: Vec<Edit>,
}

impl<'a, 'ast> Visit<'ast> for PrivateFieldAssignCollector<'a> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        let AssignmentTarget::PrivateFieldExpression(pf) = &expr.left else {
            return;
        };
        let pf_text = &self.source[pf.span.start as usize..pf.span.end as usize];
        let qualified = match self.qualified_names.iter().find(|q| q.as_str() == pf_text) {
            Some(q) => q.as_str(),
            None => return,
        };

        let op_str = match expr.operator {
            AssignmentOperator::Assign => None,
            AssignmentOperator::Addition => Some("+"),
            AssignmentOperator::Subtraction => Some("-"),
            AssignmentOperator::Multiplication => Some("*"),
            AssignmentOperator::Division => Some("/"),
            AssignmentOperator::Remainder => Some("%"),
            AssignmentOperator::Exponential => Some("**"),
            // Logical compound (`??=`, `&&=`, `||=`) and bitwise
            // (`&=`, `|=`, `^=`, `<<=`, etc.) aren't in the text
            // version's allowlist — leave them.
            _ => return,
        };

        let rhs_span = expr.right.span();
        let rhs_text = &self.source[rhs_span.start as usize..rhs_span.end as usize];

        let rewrite = match op_str {
            None => format!("$.set({}, {})", qualified, rhs_text),
            Some(op) => format!(
                "$.set({}, $.get({}) {} {})",
                qualified, qualified, op, rhs_text
            ),
        };

        self.replacements
            .push((expr.span.start, expr.span.end, rewrite));
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);

        let SimpleAssignmentTarget::PrivateFieldExpression(pf) = &expr.argument else {
            return;
        };
        let pf_text = &self.source[pf.span.start as usize..pf.span.end as usize];
        let qualified = match self.qualified_names.iter().find(|q| q.as_str() == pf_text) {
            Some(q) => q.as_str(),
            None => return,
        };

        // Mapping (no $state proxy-flag — UpdateExpressions don't
        // take a third arg in either text or with-`this` AST):
        //   q++  → $.update(q)
        //   q--  → $.update(q, -1)
        //   ++q  → $.update_pre(q)
        //   --q  → $.update_pre(q, -1)
        let rewrite = match (expr.operator, expr.prefix) {
            (UpdateOperator::Increment, false) => format!("$.update({})", qualified),
            (UpdateOperator::Decrement, false) => format!("$.update({}, -1)", qualified),
            (UpdateOperator::Increment, true) => format!("$.update_pre({})", qualified),
            (UpdateOperator::Decrement, true) => format!("$.update_pre({}, -1)", qualified),
        };

        self.replacements
            .push((expr.span.start, expr.span.end, rewrite));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn simple_assignment_this() {
        let out =
            transform_private_field_assign_ast("this.#count = 5;", &ssv(&["this.#count"])).unwrap();
        assert_eq!(out, "$.set(this.#count, 5);");
    }

    #[test]
    fn simple_assignment_instance() {
        let out =
            transform_private_field_assign_ast("instance.#count = 5;", &ssv(&["instance.#count"]))
                .unwrap();
        assert_eq!(out, "$.set(instance.#count, 5);");
    }

    #[test]
    fn compound_addition() {
        let out = transform_private_field_assign_ast("this.#count += 3;", &ssv(&["this.#count"]))
            .unwrap();
        assert_eq!(out, "$.set(this.#count, $.get(this.#count) + 3);");
    }

    #[test]
    fn compound_subtraction() {
        let out = transform_private_field_assign_ast("this.#count -= 3;", &ssv(&["this.#count"]))
            .unwrap();
        assert_eq!(out, "$.set(this.#count, $.get(this.#count) - 3);");
    }

    #[test]
    fn compound_multiplication() {
        let out = transform_private_field_assign_ast("this.#count *= 2;", &ssv(&["this.#count"]))
            .unwrap();
        assert_eq!(out, "$.set(this.#count, $.get(this.#count) * 2);");
    }

    #[test]
    fn compound_exponential() {
        let out = transform_private_field_assign_ast("this.#count **= 2;", &ssv(&["this.#count"]))
            .unwrap();
        assert_eq!(out, "$.set(this.#count, $.get(this.#count) ** 2);");
    }

    #[test]
    fn rhs_with_complex_expression() {
        let out = transform_private_field_assign_ast(
            "this.#count = foo(1, 2) + bar;",
            &ssv(&["this.#count"]),
        )
        .unwrap();
        assert_eq!(out, "$.set(this.#count, foo(1, 2) + bar);");
    }

    #[test]
    fn multiline_rhs() {
        // Text version uses `.find(';')` to find RHS end which
        // breaks on multi-line; AST has exact span.
        let out =
            transform_private_field_assign_ast("this.#count = a\n  + b;", &ssv(&["this.#count"]))
                .unwrap();
        assert_eq!(out, "$.set(this.#count, a\n  + b);");
    }

    #[test]
    fn leaves_unsupported_compound_alone() {
        // ??=, &&=, ||=, &=, etc. not in text version's allowlist
        assert!(
            transform_private_field_assign_ast("this.#count ??= 5;", &ssv(&["this.#count"]))
                .is_none()
        );
        assert!(
            transform_private_field_assign_ast("this.#count &&= 5;", &ssv(&["this.#count"]))
                .is_none()
        );
        assert!(
            transform_private_field_assign_ast("this.#count |= 5;", &ssv(&["this.#count"]))
                .is_none()
        );
    }

    #[test]
    fn update_post_increment() {
        let out =
            transform_private_field_assign_ast("instance.#count++;", &ssv(&["instance.#count"]))
                .unwrap();
        assert_eq!(out, "$.update(instance.#count);");
    }

    #[test]
    fn update_post_decrement() {
        let out =
            transform_private_field_assign_ast("instance.#count--;", &ssv(&["instance.#count"]))
                .unwrap();
        assert_eq!(out, "$.update(instance.#count, -1);");
    }

    #[test]
    fn update_pre_increment() {
        let out =
            transform_private_field_assign_ast("++instance.#count;", &ssv(&["instance.#count"]))
                .unwrap();
        assert_eq!(out, "$.update_pre(instance.#count);");
    }

    #[test]
    fn update_pre_decrement() {
        let out =
            transform_private_field_assign_ast("--instance.#count;", &ssv(&["instance.#count"]))
                .unwrap();
        assert_eq!(out, "$.update_pre(instance.#count, -1);");
    }

    #[test]
    fn update_leaves_unqualified_alone() {
        // PrivateField text doesn't match a qualified name.
        assert!(
            transform_private_field_assign_ast("other.#count++;", &ssv(&["instance.#count"]))
                .is_none()
        );
    }

    #[test]
    fn update_leaves_non_private_alone() {
        // `count++` where argument is a bare Identifier, not a
        // PrivateField — visitor's SimpleAssignmentTarget guard
        // returns early.
        assert!(
            transform_private_field_assign_ast("count++;", &ssv(&["instance.#count"])).is_none()
        );
    }

    #[test]
    fn leaves_member_chain_alone() {
        // `this.#count.foo = 5` — LHS is StaticMember, not bare
        // PrivateField. Left for other passes.
        assert!(
            transform_private_field_assign_ast("this.#count.foo = 5;", &ssv(&["this.#count"]))
                .is_none()
        );
    }

    #[test]
    fn leaves_non_matching_field_alone() {
        assert!(
            transform_private_field_assign_ast("this.#other = 5;", &ssv(&["this.#count"]))
                .is_none()
        );
    }

    #[test]
    fn already_wrapped_set_is_idempotent() {
        // After wrap, the AssignmentExpression is gone. Source has a
        // CallExpression `$.set(this.#count, 5)`. No AssignmentExpression
        // means visit_assignment_expression doesn't fire.
        let src = "$.set(this.#count, 5);";
        assert!(transform_private_field_assign_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn double_application_is_stable() {
        let first =
            transform_private_field_assign_ast("this.#count = 5;", &ssv(&["this.#count"])).unwrap();
        let second = transform_private_field_assign_ast(&first, &ssv(&["this.#count"]));
        assert!(second.is_none(), "expected None, got: {:?}", second);
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "this.#count = 5";"#;
        assert!(transform_private_field_assign_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${this.#count = 5}`;";
        let out = transform_private_field_assign_ast(src, &ssv(&["this.#count"])).unwrap();
        assert_eq!(out, "let s = `${$.set(this.#count, 5)}`;");
    }

    #[test]
    fn multiple_fields_in_one_source() {
        let out = transform_private_field_assign_ast(
            "this.#a = 1; this.#b += 2;",
            &ssv(&["this.#a", "this.#b"]),
        )
        .unwrap();
        assert_eq!(
            out,
            "$.set(this.#a, 1); $.set(this.#b, $.get(this.#b) + 2);"
        );
    }

    #[test]
    fn rewrites_inside_return() {
        // class-method bodies often have bare `return`
        let src = "return this.#count = 5;";
        let out = transform_private_field_assign_ast(src, &ssv(&["this.#count"])).unwrap();
        assert_eq!(out, "return $.set(this.#count, 5);");
    }

    #[test]
    fn empty_qualified_names_no_op() {
        assert!(transform_private_field_assign_ast("this.#count = 5;", &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_private_field_assign_ast("this.#count = (", &ssv(&["this.#count"])).is_none()
        );
    }

    #[test]
    fn no_op_without_qualified_in_source() {
        assert!(transform_private_field_assign_ast("let x = 1;", &ssv(&["this.#count"])).is_none());
    }
}
