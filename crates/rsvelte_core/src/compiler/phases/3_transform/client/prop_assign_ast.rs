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
use oxc_parser::ParseOptions;
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::GetSpan;
use oxc_span::SourceType;
use oxc_syntax::operator::AssignmentOperator;
use oxc_syntax::operator::BinaryOperator;

use crate::compiler::phases::phase3_transform::shared::js_scan::contains_identifier;

use super::ast_rewrite::{self, Edit};
use super::scope_analysis::is_locally_shadowed;

thread_local! {
    static MODULE_PROP_ASSIGN_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `name = expr` / `name <op>= expr` for
/// the bindings in `prop_vars`. Returns `None` when there's
/// nothing to rewrite or the source fails to parse.
pub fn transform_prop_assign_ast(source: &str, prop_vars: &[String]) -> Option<String> {
    let spliced = || transform_prop_assign_spliced(source, prop_vars);
    ast_rewrite::dual_run::resolve("prop_assign_ast:inplace", source, spliced, || {
        transform_prop_assign_in_place(source, prop_vars)
    })
}

fn transform_prop_assign_spliced(source: &str, prop_vars: &[String]) -> Option<String> {
    if prop_vars.is_empty() {
        return None;
    }
    if !prop_vars.iter().any(|v| contains_identifier(source, v)) {
        return None;
    }

    ast_rewrite::fixed_point(source, |src| {
        ast_rewrite::rewrite_once(
            &MODULE_PROP_ASSIGN_ALLOC,
            src,
            SourceType::mjs(),
            ParseOptions::default(),
            true,
            |program| {
                let semantic_ret = super::super::profile::semantic_build(
                    super::super::profile::SEM_PROP_ASSIGN,
                    program.source_text.len(),
                    || SemanticBuilder::new().with_build_nodes(true).build(program),
                );
                let semantic = &semantic_ret.semantic;
                let mut collector = PropAssignCollector {
                    source: src,
                    prop_vars,
                    semantic,
                    replacements: Vec::new(),
                };
                collector.visit_program(program);
                collector.replacements
            },
        )
    })
}

struct PropAssignCollector<'a, 'sem> {
    source: &'a str,
    prop_vars: &'a [String],
    semantic: &'sem Semantic<'sem>,
    replacements: Vec<Edit>,
}

impl<'a, 'sem, 'ast> Visit<'ast> for PropAssignCollector<'a, 'sem> {
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
        // Skip a write whose LHS resolves to a binding shadowing the prop in a
        // nested scope (e.g. a local `let timeout` inside a function). Mirrors
        // the prop-source-reads pass, which already skips shadowed reads — so a
        // local write stays bare instead of becoming a prop-setter call.
        if is_locally_shadowed(self.semantic, id) {
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
        assert_eq!(out, "x(x() + 3);");
    }

    #[test]
    fn compound_subtraction() {
        let out = transform_prop_assign_ast("x -= 3;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() - 3);");
    }

    #[test]
    fn compound_multiplication() {
        let out = transform_prop_assign_ast("x *= 2;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() * 2);");
    }

    #[test]
    fn compound_division() {
        let out = transform_prop_assign_ast("x /= 2;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() / 2);");
    }

    #[test]
    fn compound_remainder() {
        let out = transform_prop_assign_ast("x %= 2;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() % 2);");
    }

    #[test]
    fn compound_exponential() {
        let out = transform_prop_assign_ast("x **= 2;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "x(x() ** 2);");
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
        assert_eq!(out, "a(1);\nb(b() + 2);");
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

// ── in-place port ──────────────────────────────────────────────────────

thread_local! {
    static MODULE_PROP_ASSIGN_IN_PLACE_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// In-place equivalent of [`transform_prop_assign_ast`].
///
/// Two traversals over one parse rather than one: `is_locally_shadowed` needs a
/// [`Semantic`], which borrows the program immutably, so the eligible
/// assignments are identified first and rewritten second. Their spans stay
/// valid across the rewrite — replacing a child leaves its ancestors' spans
/// alone — and the rewrite is still post-order, so an inner assignment is
/// wrapped before the one enclosing it.
pub(crate) fn transform_prop_assign_in_place(
    source: &str,
    prop_vars: &[String],
) -> ast_rewrite::Rewrite {
    if prop_vars.is_empty() {
        return ast_rewrite::Rewrite::Unchanged;
    }
    if !prop_vars.iter().any(|v| contains_identifier(source, v)) {
        return ast_rewrite::Rewrite::Unchanged;
    }

    // A logical compound assignment has no `BinaryOperator`, so this pass leaves
    // the whole source to the text path rather than rewriting the rest of it.
    let bailed = std::cell::Cell::new(false);
    let rewrite = ast_rewrite::with_program_mut(
        &MODULE_PROP_ASSIGN_IN_PLACE_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions::default(),
        |allocator, program| {
            let targets = {
                let semantic_ret = super::super::profile::semantic_build(
                    super::super::profile::SEM_PROP_ASSIGN_IN_PLACE,
                    program.source_text.len(),
                    || SemanticBuilder::new().with_build_nodes(true).build(program),
                );
                let mut finder = PropAssignFinder {
                    prop_vars,
                    semantic: &semantic_ret.semantic,
                    targets: Vec::new(),
                    bailed: false,
                };
                finder.visit_program(program);
                bailed.set(finder.bailed);
                finder.targets
            };
            if bailed.get() || targets.is_empty() {
                return false;
            }
            let mut rewriter = PropAssignRewriter {
                b: crate::compiler::phases::phase3_transform::builders::B::new(allocator),
                targets,
                changed: false,
            };
            oxc_ast_visit::VisitMut::visit_program(&mut rewriter, program);
            rewriter.changed
        },
    );
    if bailed.get() && matches!(rewrite, ast_rewrite::Rewrite::Unchanged) {
        return ast_rewrite::Rewrite::Undecided;
    }
    rewrite
}

/// The operators the text path rewrites. Bitwise and shift compound
/// assignments are deliberately absent from both paths.
fn prop_assign_operator(op: AssignmentOperator) -> Option<Option<BinaryOperator>> {
    Some(match op {
        AssignmentOperator::Assign => None,
        AssignmentOperator::Addition => Some(BinaryOperator::Addition),
        AssignmentOperator::Subtraction => Some(BinaryOperator::Subtraction),
        AssignmentOperator::Multiplication => Some(BinaryOperator::Multiplication),
        AssignmentOperator::Division => Some(BinaryOperator::Division),
        AssignmentOperator::Remainder => Some(BinaryOperator::Remainder),
        AssignmentOperator::Exponential => Some(BinaryOperator::Exponential),
        _ => return None,
    })
}

struct PropAssignFinder<'a, 'sem> {
    prop_vars: &'a [String],
    semantic: &'sem Semantic<'sem>,
    /// `(span, prop name)` of each assignment to rewrite.
    targets: Vec<(oxc_span::Span, String)>,
    /// An assignment this pass matches but cannot express in place.
    bailed: bool,
}

impl<'a, 'sem, 'ast> Visit<'ast> for PropAssignFinder<'a, 'sem> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left else {
            return;
        };
        let name = id.name.as_str();
        if !self.prop_vars.iter().any(|p| p == name) {
            return;
        }
        if is_locally_shadowed(self.semantic, id) {
            return;
        }
        // Logical compound assignments (`&&=`, `||=`, `??=`) are in the text
        // path's allowlist but have no `BinaryOperator`; they are handled by
        // the splice path until the logical form is ported.
        if prop_assign_operator(expr.operator).is_none() {
            self.bailed = true;
            return;
        }
        self.targets.push((expr.span, name.to_string()));
    }
}

struct PropAssignRewriter<'a> {
    b: crate::compiler::phases::phase3_transform::builders::B<'a>,
    targets: Vec<(oxc_span::Span, String)>,
    changed: bool,
}

impl<'a> oxc_ast_visit::VisitMut<'a> for PropAssignRewriter<'a> {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        oxc_ast_visit::walk_mut::walk_expression(self, expr);

        let Expression::AssignmentExpression(assign) = &*expr else {
            return;
        };
        let Some((_, name)) = self
            .targets
            .iter()
            .find(|(span, _)| *span == assign.span)
            .cloned()
        else {
            return;
        };
        let Some(op) = prop_assign_operator(assign.operator) else {
            return;
        };

        let taken = std::mem::replace(expr, self.b.void0());
        let Expression::AssignmentExpression(assign) = taken else {
            unreachable!("checked above")
        };
        let rhs = assign.unbox().right;
        let arg =
            match op {
                None => rhs,
                // Mirrors the shape the text path builds; the printed parens come
                // from the printer's precedence rules, which unwrap this node.
                Some(op) => {
                    let parens = Expression::ParenthesizedExpression(
                        ParenthesizedExpression::boxed(oxc_span::SPAN, rhs, &self.b.ab()),
                    );
                    self.b
                        .binary(op, self.b.call(name.as_str(), vec![]), parens)
                }
            };
        *expr = self.b.call(name.as_str(), vec![arg]);
        self.changed = true;
    }
}
