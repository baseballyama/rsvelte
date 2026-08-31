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
use oxc_parser::ParseOptions;
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::GetSpan;
use oxc_span::SourceType;
use oxc_syntax::operator::AssignmentOperator;
use rustc_hash::FxHashSet;

use super::ast_rewrite::{self, Edit};
use super::scope_analysis::{is_locally_shadowed, shadowed_reference_starts};

thread_local! {
    static MODULE_STATE_SET_REACTIVE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `name = expr` for reactive state variables
/// (excluding `non_reactive_vars`). Returns `None` when there's
/// nothing to rewrite or the source fails to parse.
pub fn transform_state_set_reactive_ast(
    source: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> Option<String> {
    let spliced = || transform_state_set_reactive_spliced(source, state_vars, non_reactive_vars);
    ast_rewrite::dual_run::resolve("state_set_reactive_ast:inplace", source, spliced, || {
        transform_state_set_reactive_in_place(source, state_vars, non_reactive_vars)
    })
}

fn transform_state_set_reactive_spliced(
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

    // Innermost-only per pass — defer an outer assignment when its span
    // strictly contains an inner one (`a = b = 1`); the next fixed-point
    // iteration picks up the outer once its RHS has been rewritten.
    ast_rewrite::fixed_point(source, |src| {
        ast_rewrite::rewrite_once(
            &MODULE_STATE_SET_REACTIVE_ALLOC,
            src,
            SourceType::mjs(),
            ParseOptions::default(),
            true,
            |program| {
                let semantic_ret = SemanticBuilder::new().with_build_nodes(true).build(program);
                let mut collector = StateSetCollector {
                    source: src,
                    state_vars,
                    non_reactive_vars,
                    semantic: &semantic_ret.semantic,
                    replacements: Vec::new(),
                };
                collector.visit_program(program);
                collector.replacements
            },
        )
    })
}

struct StateSetCollector<'a, 'sem> {
    source: &'a str,
    state_vars: &'a [String],
    non_reactive_vars: &'a [String],
    /// A reactive body arrives without the component-level declarations, so the
    /// state variable reads as unresolved and a binding that *does* resolve
    /// inside the body is a shadow. Upstream reaches the binding through
    /// `scope.get` and writes nothing for a shadow.
    semantic: &'sem Semantic<'sem>,
    replacements: Vec<Edit>,
}

impl<'a, 'sem, 'ast> Visit<'ast> for StateSetCollector<'a, 'sem> {
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
        if is_locally_shadowed(self.semantic, id) {
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

    /// How many statements `fragment` is once a call follows it.
    fn statements_when_followed_by_a_call(fragment: &str) -> usize {
        let source = format!("{fragment}\n(c)");
        let allocator = Allocator::default();
        let parsed = oxc_parser::Parser::new(&allocator, &source, SourceType::mjs()).parse();
        assert!(parsed.diagnostics.is_empty(), "did not parse: {source}");
        parsed.program.body.len()
    }

    /// A rewritten fragment has to bind the text that follows it the way the
    /// source did. `x = {}` ends a statement; `$.set(x, {})` does not, so a
    /// following `(c)` becomes its argument list instead — still valid
    /// JavaScript, so no parse gate can see it.
    #[test]
    fn a_rewrite_binds_the_following_text_the_way_the_source_did() {
        let src = "x = {}";
        let out = transform_state_set_reactive_ast(src, &ssv(&["x"]), &[]).unwrap();
        assert_eq!(
            statements_when_followed_by_a_call(src),
            statements_when_followed_by_a_call(&out),
            "rewrote {src:?} to {out:?}"
        );
    }

    /// The reactive body arrives without the component-level declarations, so a
    /// reference that resolves inside it is a binding declared there — never the
    /// state variable upstream reaches through `scope.get`.
    #[test]
    fn a_shadowing_binding_is_not_the_state_var() {
        for input in [
            "xs.forEach((x) => { x = 5; });",
            "function f(x) { x = 5; }",
            "{ let x; x = 5; }",
        ] {
            assert!(
                transform_state_set_reactive_ast(input, &ssv(&["x"]), &[]).is_none(),
                "{input}"
            );
        }
    }

    /// The control: the unresolved reference — the state variable itself — still
    /// rewrites from the same body.
    #[test]
    fn an_unshadowed_assignment_still_rewrites() {
        let out = transform_state_set_reactive_ast("if (c) { x = 5; }", &ssv(&["x"]), &[]).unwrap();
        assert!(out.contains("$.set(x, 5)"), "{out}");
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
        assert_eq!(out, "if (cond) {\n\t$.set(x, 5);\n}");
    }

    #[test]
    fn rewrites_inside_callback() {
        let src = "items.forEach(it => { x = it; });";
        let out = transform_state_set_reactive_ast(src, &ssv(&["x"]), &[]).unwrap();
        assert_eq!(out, "items.forEach((it) => {\n\t$.set(x, it);\n});");
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
        assert_eq!(out, "$.set(x, a + b);");
    }

    #[test]
    fn multiple_assignments_in_one_source() {
        let out =
            transform_state_set_reactive_ast("a = 1; b = 2;", &ssv(&["a", "b"]), &[]).unwrap();
        assert_eq!(out, "$.set(a, 1);\n$.set(b, 2);");
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

// ── in-place port ──────────────────────────────────────────────────────

thread_local! {
    static MODULE_STATE_SET_REACTIVE_IN_PLACE_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// In-place equivalent of [`transform_state_set_reactive_ast`].
pub(crate) fn transform_state_set_reactive_in_place(
    source: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> ast_rewrite::Rewrite {
    if state_vars.is_empty() {
        return ast_rewrite::Rewrite::Unchanged;
    }
    if memchr::memchr(b'=', source.as_bytes()).is_none() {
        return ast_rewrite::Rewrite::Unchanged;
    }
    if !state_vars
        .iter()
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return ast_rewrite::Rewrite::Unchanged;
    }

    ast_rewrite::with_program_mut(
        &MODULE_STATE_SET_REACTIVE_IN_PLACE_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions::default(),
        |allocator, program| {
            let shadowed = {
                let built = SemanticBuilder::new().with_build_nodes(true).build(program);
                shadowed_reference_starts(program, &built.semantic, state_vars)
            };
            let mut rewriter = StateSetRewriter {
                b: crate::compiler::phases::phase3_transform::builders::B::new(allocator),
                state_vars,
                non_reactive_vars,
                shadowed,
                changed: false,
            };
            oxc_ast_visit::VisitMut::visit_program(&mut rewriter, program);
            rewriter.changed
        },
    )
}

struct StateSetRewriter<'a, 'b> {
    b: crate::compiler::phases::phase3_transform::builders::B<'a>,
    state_vars: &'b [String],
    non_reactive_vars: &'b [String],
    shadowed: FxHashSet<u32>,
    changed: bool,
}

impl<'a, 'b> oxc_ast_visit::VisitMut<'a> for StateSetRewriter<'a, 'b> {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        oxc_ast_visit::walk_mut::walk_expression(self, expr);

        let Expression::AssignmentExpression(assign) = &*expr else {
            return;
        };
        if !matches!(assign.operator, AssignmentOperator::Assign) {
            return;
        }
        let AssignmentTarget::AssignmentTargetIdentifier(id) = &assign.left else {
            return;
        };
        let name = id.name.as_str();
        if !self.state_vars.iter().any(|s| s == name) {
            return;
        }
        if self.non_reactive_vars.iter().any(|s| s == name) {
            return;
        }
        if self.shadowed.contains(&id.span.start) {
            return;
        }
        let name = name.to_string();

        let taken = std::mem::replace(expr, self.b.void0());
        let Expression::AssignmentExpression(assign) = taken else {
            unreachable!("checked above")
        };
        let rhs = assign.unbox().right;
        *expr = self.b.call("$.set", vec![self.b.id(&name), rhs]);
        self.changed = true;
    }
}
