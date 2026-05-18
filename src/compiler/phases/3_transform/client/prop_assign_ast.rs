//! AST-based rewrite of prop-variable `AssignmentExpression`s.
//!
//! Replaces the compound + simple assignment text loops in
//! `state_transforms.rs::transform_prop_assignments`
//! (lines 2389–2492). The member-mutation branch (line 2494+)
//! stays on the text path — different shape, depends on bindable
//! vs non-bindable prop classification, and a follow-up nibble.
//!
//! Mappings (preserved exactly from the text version):
//!
//! | Source                | Replacement                       |
//! |-----------------------|-----------------------------------|
//! | `name = expr`         | `name(expr)`                      |
//! | `name += expr`        | `name(name() + (expr))`           |
//! | `name -= expr`        | `name(name() - (expr))`           |
//! | `name *= expr`        | `name(name() * (expr))`           |
//! | `name /= expr`        | `name(name() / (expr))`           |
//! | `name %= expr`        | `name(name() % (expr))`           |
//! | `name **= expr`       | `name(name() ** (expr))`          |
//! | `name ??= expr`       | `name(name() ?? (expr))`          |
//! | `name &&= expr`       | `name(name() && (expr))`          |
//! | `name \|\|= expr`     | `name(name() \|\| (expr))`        |
//!
//! What the AST drops on the floor (vs. text loops):
//!
//! - Hand-rolled `==` / `===` / `obj.x` / preceding-identifier
//!   boundary checks — AST naturally separates assignment from
//!   comparison / property access / declaration.
//! - The text version's "skip whole line if it contains
//!   `$.prop(` or `$.rest_props(`" guard — those lines are
//!   `VariableDeclarator`s, not `AssignmentExpression`s, so the
//!   AST visitor skips them by construction.
//! - The `let / const / var` declaration check — same reason.
//! - The `find_statement_end_client` expression-end finder — the
//!   RHS span is exact.
//!
//! Nested assignment chains (`a = b = 5`) resolve via fixed-point:
//! inner pass 1, outer pass 2. Same approach as `store_assign_ast`.
//!
//! Unsupported operators (`<<=`, `>>=`, `>>>=`, `&=`, `|=`, `^=`)
//! are left for the text path — they aren't in the text version's
//! allowlist either.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::GetSpan;
use oxc_span::SourceType;
use oxc_syntax::operator::AssignmentOperator;

thread_local! {
    static MODULE_PROP_ASSIGN_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

const MAX_FIXED_POINT_ITERS: usize = 16;

/// AST-based rewrite of `name = expr` / `name <op>= expr` for
/// the bindings in `prop_vars`. Returns `None` when there's
/// nothing to rewrite or the source fails to parse.
pub fn transform_prop_assign_ast(source: &str, prop_vars: &[String]) -> Option<String> {
    if prop_vars.is_empty() {
        return None;
    }
    if !prop_vars
        .iter()
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return None;
    }

    let mut current = source.to_string();
    let mut any_changed = false;
    for _ in 0..MAX_FIXED_POINT_ITERS {
        match single_pass(&current, prop_vars) {
            Some(next) => {
                current = next;
                any_changed = true;
            }
            None => break,
        }
    }

    if any_changed { Some(current) } else { None }
}

fn single_pass(source: &str, prop_vars: &[String]) -> Option<String> {
    MODULE_PROP_ASSIGN_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs()).parse();
        if !parser_ret.errors.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = PropAssignCollector {
            source,
            prop_vars,
            replacements: Vec::new(),
        };
        collector.visit_program(&parser_ret.program);
        let mut replacements = collector.replacements;

        if replacements.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        // Innermost-only per pass — defer outer when its span
        // strictly contains an inner. Next iteration picks up the
        // outer once its RHS has been rewritten.
        let spans: Vec<(u32, u32)> = replacements.iter().map(|r| (r.0, r.1)).collect();
        replacements.retain(|(s, e, _)| {
            !spans
                .iter()
                .any(|(s2, e2)| (*s2 > *s && *e2 <= *e) || (*s2 >= *s && *e2 < *e))
        });

        if replacements.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        replacements.sort_by_key(|r| std::cmp::Reverse(r.0));
        let mut out = source.to_string();
        for (start, end, rewrite) in &replacements {
            out.replace_range(*start as usize..*end as usize, rewrite);
        }

        *cell.borrow_mut() = allocator;
        Some(out)
    })
}

struct PropAssignCollector<'a> {
    source: &'a str,
    prop_vars: &'a [String],
    replacements: Vec<(u32, u32, String)>,
}

impl<'a, 'ast> Visit<'ast> for PropAssignCollector<'a> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        // LHS must be a bare identifier — member / destructuring
        // targets stay on the text member-mutation path.
        let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left else {
            return;
        };
        let name = id.name.as_str();
        if !self.prop_vars.iter().any(|p| p == name) {
            return;
        }

        let rhs_span = expr.right.span();
        let rhs_text = &self.source[rhs_span.start as usize..rhs_span.end as usize];

        let op_str = match expr.operator {
            AssignmentOperator::Assign => None,
            AssignmentOperator::Addition => Some("+"),
            AssignmentOperator::Subtraction => Some("-"),
            AssignmentOperator::Multiplication => Some("*"),
            AssignmentOperator::Division => Some("/"),
            AssignmentOperator::Remainder => Some("%"),
            AssignmentOperator::Exponential => Some("**"),
            AssignmentOperator::LogicalNullish => Some("??"),
            AssignmentOperator::LogicalAnd => Some("&&"),
            AssignmentOperator::LogicalOr => Some("||"),
            // Bitwise + shift compound assignments aren't in the
            // text version's allowlist — leave for the text path.
            _ => return,
        };

        let rewrite = match op_str {
            None => format!("{}({})", name, rhs_text),
            Some(op) => format!("{}({}() {} ({}))", name, name, op, rhs_text),
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
    fn simple_assignment() {
        let out = transform_prop_assign_ast("x = 5;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(5);");
    }

    #[test]
    fn compound_addition() {
        let out = transform_prop_assign_ast("x += 3;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() + (3));");
    }

    #[test]
    fn compound_subtraction() {
        let out = transform_prop_assign_ast("x -= 3;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() - (3));");
    }

    #[test]
    fn compound_multiplication() {
        let out = transform_prop_assign_ast("x *= 2;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() * (2));");
    }

    #[test]
    fn compound_division() {
        let out = transform_prop_assign_ast("x /= 2;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() / (2));");
    }

    #[test]
    fn compound_remainder() {
        let out = transform_prop_assign_ast("x %= 2;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() % (2));");
    }

    #[test]
    fn compound_exponential() {
        let out = transform_prop_assign_ast("x **= 2;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() ** (2));");
    }

    #[test]
    fn compound_nullish() {
        let out = transform_prop_assign_ast("x ??= 5;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() ?? (5));");
    }

    #[test]
    fn compound_logical_and() {
        let out = transform_prop_assign_ast("x &&= 5;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() && (5));");
    }

    #[test]
    fn compound_logical_or() {
        let out = transform_prop_assign_ast("x ||= 5;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() || (5));");
    }

    #[test]
    fn leaves_equality_alone() {
        assert!(transform_prop_assign_ast("if (x == 5) {}", &ssv(&["x"])).is_none());
        assert!(transform_prop_assign_ast("if (x === 5) {}", &ssv(&["x"])).is_none());
    }

    #[test]
    fn leaves_member_assignment_alone() {
        // `obj.x = 5` — member target, stays on text member-mutation path
        assert!(transform_prop_assign_ast("obj.x = 5;", &ssv(&["x"])).is_none());
        assert!(transform_prop_assign_ast("x.prop = 5;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn leaves_declaration_alone() {
        // `let x = 5` is a VariableDeclarator, not AssignmentExpression
        assert!(transform_prop_assign_ast("let x = 5;", &ssv(&["x"])).is_none());
        assert!(transform_prop_assign_ast("const x = 5;", &ssv(&["x"])).is_none());
        assert!(transform_prop_assign_ast("var x = 5;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn leaves_destructuring_alone() {
        assert!(transform_prop_assign_ast("[x] = arr;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "x = 5";"#;
        assert!(transform_prop_assign_ast(src, &ssv(&["x"])).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${x = 5}`;";
        let out = transform_prop_assign_ast(src, &ssv(&["x"])).unwrap();
        assert_eq!(out, "let s = `${x(5)}`;");
    }

    #[test]
    fn rewrites_for_loop_init() {
        // Not a declaration — bare `x = 0` in for-init position
        let src = "for (x = 0; cond; step()) {}";
        let out = transform_prop_assign_ast(src, &ssv(&["x"])).unwrap();
        assert_eq!(out, "for (x(0); cond; step()) {}");
    }

    #[test]
    fn multiple_assignments_in_one_source() {
        let out = transform_prop_assign_ast("a = 1; b += 2;", &ssv(&["a", "b"])).unwrap();
        assert_eq!(out, "a(1); b(b() + (2));");
    }

    #[test]
    fn nested_assignment_chain() {
        // `a = b = 5` — inner picked up first, outer next pass.
        let out = transform_prop_assign_ast("a = b = 5;", &ssv(&["a", "b"])).unwrap();
        assert_eq!(out, "a(b(5));");
    }

    #[test]
    fn rhs_with_complex_expression() {
        let out = transform_prop_assign_ast("x = foo(1, 2) + bar.baz;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(foo(1, 2) + bar.baz);");
    }

    #[test]
    fn skips_prop_decl_via_ast() {
        // `let foo = $.prop(...)` and similar — VariableDeclarator,
        // not AssignmentExpression. No "$.prop(" string check
        // needed.
        let src = "let foo = $.prop(\"foo\");";
        assert!(transform_prop_assign_ast(src, &ssv(&["foo"])).is_none());
    }

    #[test]
    fn skips_multi_declarator_prop_decl() {
        // The text version's bug-prone case: `let foo = $.prop(...),\n\tbar = $.prop(...);`
        // The AST sees both as VariableDeclarators, not AssignmentExpressions.
        let src = "let foo = $.prop(\"foo\"),\n\tbar = $.prop(\"bar\");";
        assert!(transform_prop_assign_ast(src, &ssv(&["foo", "bar"])).is_none());
    }

    #[test]
    fn empty_prop_vars_is_no_op() {
        assert!(transform_prop_assign_ast("x = 5;", &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_prop_assign_ast("x = (", &ssv(&["x"])).is_none());
    }

    #[test]
    fn no_op_without_prop_name() {
        assert!(transform_prop_assign_ast("let z = 1;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn leaves_unsupported_operator_alone() {
        // `<<=`, `>>=`, `>>>=`, `&=`, `|=`, `^=` not in the text
        // version's allowlist either.
        assert!(transform_prop_assign_ast("x <<= 2;", &ssv(&["x"])).is_none());
        assert!(transform_prop_assign_ast("x &= 7;", &ssv(&["x"])).is_none());
    }
}
