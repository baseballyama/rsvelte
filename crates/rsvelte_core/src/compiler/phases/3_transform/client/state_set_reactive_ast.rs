//! AST-based rewrite of `state_var = expr` → `$.set(state_var, expr)`
//! within reactive statement bodies.
//!
//! Replaces the text loop in
//! `reactive_transforms.rs::transform_state_set_in_reactive`
//! (lines 1111–1261). The text version hand-rolled a ternary-aware
//! RHS-end finder, depth tracking, string-literal escapes, and a
//! cluster of boundary checks (`==` / `===` exclusion, `let` /
//! `const` / `var` declaration exclusion, member-access exclusion,
//! already-wrapped `$.set(` exclusion). The AST visitor drops all
//! of that — `AssignmentExpression` with `Assign` operator and a
//! plain `AssignmentTargetIdentifier` LHS matches exactly the
//! target shape.
//!
//! Only simple `=` is in scope (matching the text version, which
//! explicitly *does not* transform compound assignments — those
//! go through `transform_state_assignments`).
//!
//! Mapping (preserved exactly):
//!
//! | Source        | Replacement                |
//! |---------------|----------------------------|
//! | `x = expr`    | `$.set(x, expr)`           |
//!
//! Where `x` ∈ `state_vars \ non_reactive_vars`. Member targets
//! (`obj.x = expr`, `x.prop = expr`) stay on
//! `transform_state_member_mutations`.

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
    static MODULE_STATE_SET_REACTIVE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

const MAX_FIXED_POINT_ITERS: usize = 16;

/// AST-based rewrite of `name = expr` for reactive state variables
/// (excluding `non_reactive_vars`). Returns `None` when there's
/// nothing to rewrite or the source fails to parse.
pub fn transform_state_set_reactive_ast(
    source: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> Option<String> {
    if state_vars.is_empty() {
        return None;
    }
    // Fast probe — bail before parsing if no `=` token appears at
    // all (declarations also use `=` but the AST visitor naturally
    // skips those, so this is a coarse early-out).
    memchr::memchr(b'=', source.as_bytes())?;
    if !state_vars
        .iter()
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return None;
    }

    let mut current = source.to_string();
    let mut any_changed = false;
    for _ in 0..MAX_FIXED_POINT_ITERS {
        match single_pass(&current, state_vars, non_reactive_vars) {
            Some(next) => {
                current = next;
                any_changed = true;
            }
            None => break,
        }
    }

    if any_changed { Some(current) } else { None }
}

fn single_pass(
    source: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> Option<String> {
    MODULE_STATE_SET_REACTIVE_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs()).parse();
        if !parser_ret.diagnostics.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = StateSetCollector {
            source,
            state_vars,
            non_reactive_vars,
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

struct StateSetCollector<'a> {
    source: &'a str,
    state_vars: &'a [String],
    non_reactive_vars: &'a [String],
    replacements: Vec<(u32, u32, String)>,
}

impl<'a, 'ast> Visit<'ast> for StateSetCollector<'a> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        // Only simple `=` — compound goes through transform_state_assignments.
        if !matches!(expr.operator, AssignmentOperator::Assign) {
            return;
        }
        // Only bare identifiers — member / destructuring targets
        // stay on the member-mutation path.
        let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left else {
            return;
        };
        let name = id.name.as_str();
        if !self.state_vars.iter().any(|s| s == name) {
            return;
        }
        if self.non_reactive_vars.iter().any(|s| s == name) {
            return;
        }

        let rhs_span = expr.right.span();
        let rhs_text = &self.source[rhs_span.start as usize..rhs_span.end as usize];
        let rewrite = format!("$.set({}, {})", name, rhs_text);

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
    fn simple_assignment_reactive_state() {
        let out = transform_state_set_reactive_ast("x = 5;", &ssv(&["x"]), &[]).unwrap();
        assert_eq!(out, "$.set(x, 5);");
    }

    #[test]
    fn non_reactive_state_left_alone() {
        // x is in state_vars but flagged non-reactive → no rewrite
        assert!(transform_state_set_reactive_ast("x = 5;", &ssv(&["x"]), &ssv(&["x"])).is_none());
    }

    #[test]
    fn unknown_var_left_alone() {
        assert!(transform_state_set_reactive_ast("y = 5;", &ssv(&["x"]), &[]).is_none());
    }

    #[test]
    fn compound_assignment_left_alone() {
        // Out of scope — `transform_state_assignments` handles compound.
        assert!(transform_state_set_reactive_ast("x += 5;", &ssv(&["x"]), &[]).is_none());
        assert!(transform_state_set_reactive_ast("x ??= 5;", &ssv(&["x"]), &[]).is_none());
    }

    #[test]
    fn leaves_equality_alone() {
        // `==` and `===` are BinaryExpression, not AssignmentExpression
        assert!(transform_state_set_reactive_ast("if (x == 5) {}", &ssv(&["x"]), &[]).is_none());
        assert!(transform_state_set_reactive_ast("if (x === 5) {}", &ssv(&["x"]), &[]).is_none());
    }

    #[test]
    fn leaves_member_assignment_alone() {
        // `obj.x = 5` and `x.prop = 5` → member-mutation path
        assert!(transform_state_set_reactive_ast("obj.x = 5;", &ssv(&["x"]), &[]).is_none());
        assert!(transform_state_set_reactive_ast("x.prop = 5;", &ssv(&["x"]), &[]).is_none());
    }

    #[test]
    fn leaves_declaration_alone() {
        assert!(transform_state_set_reactive_ast("let x = 5;", &ssv(&["x"]), &[]).is_none());
        assert!(transform_state_set_reactive_ast("const x = 5;", &ssv(&["x"]), &[]).is_none());
        assert!(transform_state_set_reactive_ast("var x = 5;", &ssv(&["x"]), &[]).is_none());
    }

    #[test]
    fn leaves_destructuring_alone() {
        assert!(transform_state_set_reactive_ast("[x] = arr;", &ssv(&["x"]), &[]).is_none());
        assert!(transform_state_set_reactive_ast("({x} = obj);", &ssv(&["x"]), &[]).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "x = 5";"#;
        assert!(transform_state_set_reactive_ast(src, &ssv(&["x"]), &[]).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${x = 5}`;";
        let out = transform_state_set_reactive_ast(src, &ssv(&["x"]), &[]).unwrap();
        assert_eq!(out, "let s = `${$.set(x, 5)}`;");
    }

    #[test]
    fn rewrites_inside_if_block() {
        let src = "if (cond) { x = 5; }";
        let out = transform_state_set_reactive_ast(src, &ssv(&["x"]), &[]).unwrap();
        assert_eq!(out, "if (cond) { $.set(x, 5); }");
    }

    #[test]
    fn rewrites_inside_callback() {
        let src = "items.forEach(it => { x = it; });";
        let out = transform_state_set_reactive_ast(src, &ssv(&["x"]), &[]).unwrap();
        assert_eq!(out, "items.forEach(it => { $.set(x, it); });");
    }

    #[test]
    fn rewrites_ternary_rhs() {
        // Text version's tricky case — ternary `:` shouldn't end
        // the RHS. With AST, the span is correct.
        let src = "x = cond ? a : b;";
        let out = transform_state_set_reactive_ast(src, &ssv(&["x"]), &[]).unwrap();
        assert_eq!(out, "$.set(x, cond ? a : b);");
    }

    #[test]
    fn rewrites_multiline_rhs() {
        let src = "x = a\n + b;";
        let out = transform_state_set_reactive_ast(src, &ssv(&["x"]), &[]).unwrap();
        assert_eq!(out, "$.set(x, a\n + b);");
    }

    #[test]
    fn multiple_assignments_in_one_source() {
        let out =
            transform_state_set_reactive_ast("a = 1; b = 2;", &ssv(&["a", "b"]), &[]).unwrap();
        assert_eq!(out, "$.set(a, 1); $.set(b, 2);");
    }

    #[test]
    fn nested_assignment_chain() {
        // `a = b = 5` — inner picked up first, outer next pass.
        let out = transform_state_set_reactive_ast("a = b = 5;", &ssv(&["a", "b"]), &[]).unwrap();
        assert_eq!(out, "$.set(a, $.set(b, 5));");
    }

    #[test]
    fn already_wrapped_set_left_alone() {
        // `$.set(x, 5)` is a CallExpression, not an AssignmentExpression
        let src = "$.set(x, 5);";
        assert!(transform_state_set_reactive_ast(src, &ssv(&["x"]), &[]).is_none());
    }

    #[test]
    fn rhs_with_object_literal() {
        let out =
            transform_state_set_reactive_ast("x = { a: 1, b: 2 };", &ssv(&["x"]), &[]).unwrap();
        assert_eq!(out, "$.set(x, { a: 1, b: 2 });");
    }

    #[test]
    fn rhs_with_array_literal() {
        let out = transform_state_set_reactive_ast("x = [1, 2, 3];", &ssv(&["x"]), &[]).unwrap();
        assert_eq!(out, "$.set(x, [1, 2, 3]);");
    }

    #[test]
    fn empty_state_vars_is_no_op() {
        assert!(transform_state_set_reactive_ast("x = 5;", &[], &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_state_set_reactive_ast("x = (", &ssv(&["x"]), &[]).is_none());
    }

    #[test]
    fn no_op_without_equals_token() {
        // Fast-path probe: no `=` in source → bail before parsing.
        assert!(transform_state_set_reactive_ast("foo(x);", &ssv(&["x"]), &[]).is_none());
    }
}
