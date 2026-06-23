//! AST-based rewrite of `this.#count` → `this.#count.v` for
//! standalone reads of class state-source fields in constructor
//! bodies.
//!
//! Replaces both branches of
//! `class_transforms.rs::transform_constructor_private_reads`
//! (lines 300+). The text version uses `line.find(private_ref)`
//! and hand-checks surrounding bytes for skip conditions.
//!
//! Mapping (preserved exactly):
//!
//! | Source        | Replacement      |
//! |---------------|------------------|
//! | `this.#count` | `this.#count.v`  |
//!
//! Where the `PrivateFieldExpression` source-text matches one of
//! the `qualified_names` passed by the caller.
//!
//! ## Skip cases (preserved from text version)
//!
//! - Already inside `$.get(`, `$.set(`, `$.state(`, `$.update(`,
//!   `$.update_pre(` first-arg.
//! - Assignment LHS (`this.#count = ...`).
//! - Argument of an UpdateExpression (`this.#count++`).
//! - `.object` of an enclosing member chain (`this.#count.foo`).
//!
//! `==` / `===` ARE wrapped (reads), matching text behaviour.
//!
//! ## Idempotency
//!
//! After wrap, the bare `this.#count` is now the `.object` of an
//! enclosing `StaticMemberExpression` (`...v`). The visitor's
//! `visit_static_member_expression` skip detection bails on the
//! next pass.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::SourceType;

use super::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_PRIVATE_V_SUFFIX_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// AST-based rewrite of standalone `qualified` reads to
/// `qualified.v`. Returns `None` when there's nothing to rewrite
/// or the source fails to parse.
pub fn transform_private_v_suffix_ast(source: &str, qualified_names: &[String]) -> Option<String> {
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
            &MODULE_PRIVATE_V_SUFFIX_ALLOC,
            src,
            SourceType::mjs(),
            ParseOptions {
                allow_return_outside_function: true,
                ..ParseOptions::default()
            },
            true,
            |program| {
                let mut collector = PrivateVSuffixCollector {
                    source: src,
                    qualified_names,
                    replacements: Vec::new(),
                    skip_spans: Vec::new(),
                    fn_depth: 0,
                };
                collector.visit_program(program);
                let skip = collector.skip_spans;
                let mut replacements = collector.replacements;
                replacements
                    .retain(|(s, e, _)| !skip.iter().any(|(s2, e2)| *s2 == *s && *e2 == *e));
                replacements
            },
        )
    })
}

struct PrivateVSuffixCollector<'a> {
    source: &'a str,
    qualified_names: &'a [String],
    replacements: Vec<Edit>,
    skip_spans: Vec<(u32, u32)>,
    /// Nesting depth of enclosing functions/arrows relative to the constructor
    /// body root (which is parsed at depth 0). Reads at depth 0 execute
    /// synchronously during construction and use the direct `.v` source access;
    /// reads inside a nested function/arrow execute *after* construction, so
    /// they must read through the signal with `$.get(...)` — mirroring upstream's
    /// `state.in_constructor` flag, which is cleared when entering a nested
    /// function in the ClassBody visitor.
    fn_depth: u32,
}

impl<'a> PrivateVSuffixCollector<'a> {
    /// Match `$.get` / `$.set` / `$.state` / `$.update` /
    /// `$.update_pre` as a wrap-callee.
    fn is_wrap_callee(callee: &Expression<'_>) -> bool {
        let Expression::StaticMemberExpression(m) = callee else {
            return false;
        };
        let Expression::Identifier(id) = &m.object else {
            return false;
        };
        if id.name.as_str() != "$" {
            return false;
        }
        matches!(
            m.property.name.as_str(),
            "get" | "set" | "state" | "derived" | "update" | "update_pre"
        )
    }

    fn push_skip<S: oxc_span::GetSpan>(&mut self, node: &S) {
        let s = node.span();
        self.skip_spans.push((s.start, s.end));
    }
}

impl<'a, 'ast> Visit<'ast> for PrivateVSuffixCollector<'a> {
    fn visit_private_field_expression(&mut self, expr: &PrivateFieldExpression<'ast>) {
        walk::walk_private_field_expression(self, expr);
        let span_text = &self.source[expr.span.start as usize..expr.span.end as usize];
        if self.qualified_names.iter().any(|q| q.as_str() == span_text) {
            // Direct constructor-body reads (depth 0) use the `.v` source access;
            // reads inside a nested function/arrow run post-construction and must
            // go through `$.get(...)`.
            let rewrite = if self.fn_depth == 0 {
                format!("{}.v", span_text)
            } else {
                format!("$.get({})", span_text)
            };
            self.replacements
                .push((expr.span.start, expr.span.end, rewrite));
        }
    }

    fn visit_function(&mut self, func: &Function<'ast>, flags: oxc_syntax::scope::ScopeFlags) {
        self.fn_depth += 1;
        walk::walk_function(self, func, flags);
        self.fn_depth -= 1;
    }

    fn visit_arrow_function_expression(&mut self, arrow: &ArrowFunctionExpression<'ast>) {
        self.fn_depth += 1;
        walk::walk_arrow_function_expression(self, arrow);
        self.fn_depth -= 1;
    }

    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        if let AssignmentTarget::PrivateFieldExpression(pf) = &expr.left {
            self.push_skip(pf.as_ref());
        }
        walk::walk_assignment_expression(self, expr);
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        if let SimpleAssignmentTarget::PrivateFieldExpression(pf) = &expr.argument {
            self.push_skip(pf.as_ref());
        }
        walk::walk_update_expression(self, expr);
    }

    fn visit_static_member_expression(&mut self, member: &StaticMemberExpression<'ast>) {
        if let Expression::PrivateFieldExpression(pf) = &member.object {
            self.push_skip(pf.as_ref());
        }
        walk::walk_static_member_expression(self, member);
    }

    fn visit_computed_member_expression(&mut self, member: &ComputedMemberExpression<'ast>) {
        if let Expression::PrivateFieldExpression(pf) = &member.object {
            self.push_skip(pf.as_ref());
        }
        walk::walk_computed_member_expression(self, member);
    }

    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        if Self::is_wrap_callee(&call.callee)
            && let Some(Argument::PrivateFieldExpression(pf)) = call.arguments.first()
        {
            self.push_skip(pf.as_ref());
        }
        walk::walk_call_expression(self, call);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn standalone_read_appends_v() {
        let src = "let x = this.#count;";
        let out = transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).unwrap();
        assert_eq!(out, "let x = this.#count.v;");
    }

    #[test]
    fn nested_function_read_uses_get_not_v() {
        // A read inside a nested arrow (executes post-construction) must read
        // through the signal with `$.get(...)`, not the direct `.v` access.
        let src = "rAF(() => { if (!this.#count) {} });";
        let out = transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).unwrap();
        assert_eq!(out, "rAF(() => { if (!$.get(this.#count)) {} });");
    }

    #[test]
    fn top_level_read_still_v_with_nested_function_present() {
        let src = "let x = this.#count;\nrAF(() => this.#count);";
        let out = transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).unwrap();
        assert_eq!(
            out,
            "let x = this.#count.v;\nrAF(() => $.get(this.#count));"
        );
    }

    #[test]
    fn read_in_expression_appends_v() {
        let src = "return this.#count + 1;";
        let out = transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).unwrap();
        assert_eq!(out, "return this.#count.v + 1;");
    }

    #[test]
    fn equality_check_appends_v() {
        let src = "if (this.#count == 5) {}";
        let out = transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).unwrap();
        assert_eq!(out, "if (this.#count.v == 5) {}");
    }

    #[test]
    fn strict_equality_appends_v() {
        let src = "if (this.#count === 5) {}";
        let out = transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).unwrap();
        assert_eq!(out, "if (this.#count.v === 5) {}");
    }

    #[test]
    fn assignment_lhs_left_alone() {
        let src = "this.#count = 5;";
        assert!(transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn compound_assignment_lhs_left_alone() {
        let src = "this.#count += 5;";
        assert!(transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn update_postfix_left_alone() {
        let src = "this.#count++;";
        assert!(transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn deeper_member_chain_left_alone() {
        let src = "let x = this.#count.foo;";
        assert!(transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn already_suffixed_idempotent() {
        // After wrap, `this.#count` is the .object of `.v` —
        // visit_static_member skip handles it.
        let src = "let x = this.#count.v;";
        assert!(transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn double_application_stable() {
        let first =
            transform_private_v_suffix_ast("let x = this.#count;", &ssv(&["this.#count"])).unwrap();
        let second = transform_private_v_suffix_ast(&first, &ssv(&["this.#count"]));
        assert!(second.is_none(), "expected None, got: {:?}", second);
    }

    #[test]
    fn already_inside_get_left_alone() {
        let src = "$.get(this.#count);";
        assert!(transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn already_inside_state_left_alone() {
        let src = "$.state(this.#count);";
        assert!(transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "this.#count";"#;
        assert!(transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${this.#count}`;";
        let out = transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).unwrap();
        assert_eq!(out, "let s = `${this.#count.v}`;");
    }

    #[test]
    fn different_field_left_alone() {
        assert!(
            transform_private_v_suffix_ast("let x = this.#other;", &ssv(&["this.#count"]))
                .is_none()
        );
    }

    #[test]
    fn rewrites_in_call_arg() {
        let src = "foo(this.#count);";
        let out = transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).unwrap();
        assert_eq!(out, "foo(this.#count.v);");
    }

    #[test]
    fn multiple_reads_all_rewritten() {
        let src = "return this.#a + this.#b;";
        let out = transform_private_v_suffix_ast(src, &ssv(&["this.#a", "this.#b"])).unwrap();
        assert_eq!(out, "return this.#a.v + this.#b.v;");
    }

    #[test]
    fn mixed_read_and_write_only_read_rewritten() {
        let src = "this.#count = this.#count + 1;";
        let out = transform_private_v_suffix_ast(src, &ssv(&["this.#count"])).unwrap();
        assert_eq!(out, "this.#count = this.#count.v + 1;");
    }

    #[test]
    fn empty_qualified_no_op() {
        assert!(transform_private_v_suffix_ast("this.#count;", &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_private_v_suffix_ast("this.#count = (", &ssv(&["this.#count"])).is_none()
        );
    }

    #[test]
    fn no_op_when_qualified_absent() {
        assert!(transform_private_v_suffix_ast("let x = 1;", &ssv(&["this.#count"])).is_none());
    }
}
