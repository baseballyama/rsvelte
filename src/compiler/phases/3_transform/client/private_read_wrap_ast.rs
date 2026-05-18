//! AST-based rewrite of standalone class private-field reads:
//! `this.#count` → `$.get(this.#count)`.
//!
//! Replaces `class_transforms.rs::wrap_standalone_private_reads`
//! (lines 1261+). The text version uses `line.find(qualified)`
//! and hand-checks the surrounding bytes to distinguish reads
//! from assignments / member chains / increments / equality.
//! The AST visitor walks `PrivateFieldExpression`s directly and
//! consults parent-position info to decide whether the field is
//! in a read position.
//!
//! Skip cases (preserved from the text version):
//!
//! - Already inside `$.get(`, `$.set(`, `$.update(`,
//!   `$.update_pre(` — detected by a `visit_call_expression`
//!   check on the callee + arg position.
//! - LHS of an `AssignmentExpression` — `expr.left` is a
//!   `SimpleAssignmentTarget::PrivateFieldExpression`.
//! - Argument of an `UpdateExpression` (`this.#count++`,
//!   `--this.#count`).
//! - `.object` of an enclosing `StaticMemberExpression` /
//!   `ComputedMemberExpression` (i.e. `this.#count.foo` —
//!   the read is the deeper chain, not the bare field).
//!
//! `==` / `===` are NOT skipped — they are reads.
//!
//! The `qualified` argument (e.g. `"this.#count"` or
//! `"instance.#count"`) is matched against the source text at the
//! `PrivateFieldExpression` span. Matching by source text covers
//! both `this`-prefixed and arbitrary-identifier-prefixed forms
//! the same way the text version's literal `.find` does.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::{ParseOptions, Parser};
use oxc_span::SourceType;

thread_local! {
    static MODULE_PRIVATE_READ_WRAP_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

const MAX_FIXED_POINT_ITERS: usize = 16;

/// AST-based rewrite of `qualified` reads (where `qualified` is
/// the source-text of a private-field access like `this.#count`)
/// to `$.get(qualified)`. Returns `None` when there's nothing to
/// rewrite or the source fails to parse.
pub fn transform_private_read_wrap_ast(source: &str, qualified: &str) -> Option<String> {
    if qualified.is_empty() {
        return None;
    }
    // Fast probe — bail if `qualified` doesn't appear at all.
    memchr::memmem::find(source.as_bytes(), qualified.as_bytes())?;

    let mut current = source.to_string();
    let mut any_changed = false;
    for _ in 0..MAX_FIXED_POINT_ITERS {
        match single_pass(&current, qualified) {
            Some(next) => {
                current = next;
                any_changed = true;
            }
            None => break,
        }
    }

    if any_changed { Some(current) } else { None }
}

fn single_pass(source: &str, qualified: &str) -> Option<String> {
    MODULE_PRIVATE_READ_WRAP_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        // Callers (class method bodies) often pass fragments with
        // bare `return` statements at the top level — allow it.
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs())
            .with_options(ParseOptions {
                allow_return_outside_function: true,
                ..ParseOptions::default()
            })
            .parse();
        if !parser_ret.errors.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = PrivateReadWrapCollector {
            source,
            qualified,
            replacements: Vec::new(),
            skip_spans: Vec::new(),
        };
        collector.visit_program(&parser_ret.program);
        let mut replacements = collector.replacements;
        let skip = collector.skip_spans;
        replacements.retain(|(s, e, _)| !skip.iter().any(|(s2, e2)| *s2 == *s && *e2 == *e));

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

struct PrivateReadWrapCollector<'a> {
    source: &'a str,
    qualified: &'a str,
    replacements: Vec<(u32, u32, String)>,
    /// Spans of `PrivateFieldExpression`s that should NOT be
    /// rewritten (assignment LHS, update target, deeper-member
    /// object, $.get/$.set/$.update/$.update_pre argument).
    skip_spans: Vec<(u32, u32)>,
}

impl<'a> PrivateReadWrapCollector<'a> {
    fn callee_is_dollar_member(callee: &Expression<'_>) -> Option<&'static str> {
        let Expression::StaticMemberExpression(m) = callee else {
            return None;
        };
        let Expression::Identifier(id) = &m.object else {
            return None;
        };
        if id.name.as_str() != "$" {
            return None;
        }
        match m.property.name.as_str() {
            "get" => Some("get"),
            "set" => Some("set"),
            "update" => Some("update"),
            "update_pre" => Some("update_pre"),
            _ => None,
        }
    }

    fn push_skip<S: oxc_span::GetSpan>(&mut self, node: &S) {
        let s = node.span();
        self.skip_spans.push((s.start, s.end));
    }
}

impl<'a, 'ast> Visit<'ast> for PrivateReadWrapCollector<'a> {
    fn visit_private_field_expression(&mut self, expr: &PrivateFieldExpression<'ast>) {
        walk::walk_private_field_expression(self, expr);
        let span_text = &self.source[expr.span.start as usize..expr.span.end as usize];
        if span_text == self.qualified {
            let rewrite = format!("$.get({})", self.qualified);
            self.replacements
                .push((expr.span.start, expr.span.end, rewrite));
        }
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
        // `$.get(<pf>)` / `$.set(<pf>, ...)` / `$.update(<pf>, ...)` /
        // `$.update_pre(<pf>, ...)` — skip the FIRST arg's PrivateField.
        if Self::callee_is_dollar_member(&call.callee).is_some()
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

    #[test]
    fn standalone_read_wrapped() {
        let src = "let x = this.#count;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "let x = $.get(this.#count);");
    }

    #[test]
    fn read_in_expression_wrapped() {
        let src = "return this.#count + 1;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "return $.get(this.#count) + 1;");
    }

    #[test]
    fn read_in_call_arg_wrapped() {
        let src = "foo(this.#count, other);";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "foo($.get(this.#count), other);");
    }

    #[test]
    fn read_in_arrow_body_wrapped() {
        let src = "() => this.#count + 1;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "() => $.get(this.#count) + 1;");
    }

    #[test]
    fn equality_check_wrapped() {
        // `==` / `===` are reads — text version explicitly wraps.
        let src = "if (this.#count == 5) {}";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "if ($.get(this.#count) == 5) {}");
    }

    #[test]
    fn strict_equality_wrapped() {
        let src = "if (this.#count === 5) {}";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "if ($.get(this.#count) === 5) {}");
    }

    #[test]
    fn assignment_lhs_left_alone() {
        let src = "this.#count = 5;";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn compound_assignment_lhs_left_alone() {
        let src = "this.#count += 5;";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn update_postfix_left_alone() {
        let src = "this.#count++;";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn update_prefix_left_alone() {
        let src = "++this.#count;";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn deeper_member_chain_left_alone() {
        // `this.#count.foo` — the bare `this.#count` is the .object
        // of the outer member; the read is `this.#count.foo`.
        let src = "let x = this.#count.foo;";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn deeper_computed_chain_left_alone() {
        let src = "let x = this.#count[0];";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn already_inside_get_left_alone() {
        let src = "$.get(this.#count);";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn already_inside_set_left_alone() {
        let src = "$.set(this.#count, 5);";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn already_inside_update_left_alone() {
        let src = "$.update(this.#count);";
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn instance_prefix_works() {
        let src = "return instance.#count;";
        let out = transform_private_read_wrap_ast(src, "instance.#count").unwrap();
        assert_eq!(out, "return $.get(instance.#count);");
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "this.#count";"#;
        assert!(transform_private_read_wrap_ast(src, "this.#count").is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${this.#count}`;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "let s = `${$.get(this.#count)}`;");
    }

    #[test]
    fn read_inside_function_arg_call_pattern() {
        // `someFunc(this.#count)` — read inside a non-$.get call
        // should still be wrapped.
        let src = "foo(this.#count);";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "foo($.get(this.#count));");
    }

    #[test]
    fn different_field_left_alone() {
        // qualified = `this.#count`, source has `this.#other`.
        assert!(transform_private_read_wrap_ast("let x = this.#other;", "this.#count").is_none());
    }

    #[test]
    fn empty_qualified_no_op() {
        assert!(transform_private_read_wrap_ast("this.#count;", "").is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_private_read_wrap_ast("this.#count = (", "this.#count").is_none());
    }

    #[test]
    fn no_op_without_qualified_in_source() {
        assert!(transform_private_read_wrap_ast("let x = 1;", "this.#count").is_none());
    }

    #[test]
    fn multiple_reads_all_wrapped() {
        let src = "return this.#count + this.#count;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "return $.get(this.#count) + $.get(this.#count);");
    }

    #[test]
    fn mixed_read_and_write_only_read_wrapped() {
        let src = "this.#count = this.#count + 1;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        // LHS untouched; RHS read wrapped.
        assert_eq!(out, "this.#count = $.get(this.#count) + 1;");
    }

    #[test]
    fn ternary_test_wrapped() {
        let src = "let x = this.#count > 0 ? a : b;";
        let out = transform_private_read_wrap_ast(src, "this.#count").unwrap();
        assert_eq!(out, "let x = $.get(this.#count) > 0 ? a : b;");
    }
}
