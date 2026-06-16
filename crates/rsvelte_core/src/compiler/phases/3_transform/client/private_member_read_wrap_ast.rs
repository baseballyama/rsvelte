//! AST-based rewrite of `q.foo` / `q?.foo` / `q[i]` → wrap `q`
//! with `$.get(q)` when `q` is a private-field-access at the
//! root of a member chain (or chain expression).
//!
//! Replaces the `result.replace(format!("{}.", q), ...)` and
//! `result.replace(format!("{}?.", q), ...)` lines in
//! `class_transforms.rs::transform_class_methods` (~lines
//! 1373–1381). These are unguarded substring replacements — they
//! would mangle string-literal / template contents that happen to
//! match the qualified name. The AST visitor only fires on real
//! `PrivateFieldExpression` nodes in member-chain root position.
//!
//! Mapping (preserved exactly):
//!
//! | Source         | Replacement              |
//! |----------------|--------------------------|
//! | `q.foo`        | `$.get(q).foo`           |
//! | `q?.foo`       | `$.get(q)?.foo`          |
//! | `q[i]`         | `$.get(q)[i]`            |
//! | `q.a.b`        | `$.get(q).a.b`           |
//!
//! Where `q` matches one of the qualified names. The rewrite
//! replaces just the `q` span; the surrounding member-chain text
//! is preserved verbatim.
//!
//! ## Skip cases
//!
//! - Already inside `$.get(`, `$.set(`, `$.state(`, `$.derived(`,
//!   `$.update(`, `$.update_pre(` first-arg.
//! - Assignment LHS (handled by `private_class_assign_ast`).
//! - Argument of UpdateExpression (handled there too).
//!
//! Standalone reads (no member chain at all) are handled by
//! `private_read_wrap_ast` (PR #206) — this helper only fires when
//! the PrivateField is the `.object` of an enclosing
//! StaticMember/ComputedMember/ChainExpression.
//!
//! ## Idempotency
//!
//! After wrap, the PrivateField becomes the argument of a
//! `$.get(...)` CallExpression. `visit_call_expression` skip
//! detection ensures the visitor doesn't re-wrap.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::{ParseOptions, Parser};
use oxc_span::SourceType;

thread_local! {
    static MODULE_PRIVATE_MEMBER_READ_WRAP_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

const MAX_FIXED_POINT_ITERS: usize = 16;

/// AST-based rewrite of `q.foo` / `q[i]` reads. Returns `None`
/// when there's nothing to rewrite or the source fails to parse.
pub fn transform_private_member_read_wrap_ast(
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

    let mut current = source.to_string();
    let mut any_changed = false;
    for _ in 0..MAX_FIXED_POINT_ITERS {
        match single_pass(&current, qualified_names) {
            Some(next) => {
                current = next;
                any_changed = true;
            }
            None => break,
        }
    }

    if any_changed { Some(current) } else { None }
}

fn single_pass(source: &str, qualified_names: &[String]) -> Option<String> {
    MODULE_PRIVATE_MEMBER_READ_WRAP_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs())
            .with_options(ParseOptions {
                allow_return_outside_function: true,
                ..ParseOptions::default()
            })
            .parse();
        if !parser_ret.diagnostics.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = PrivateMemberReadWrapCollector {
            source,
            qualified_names,
            wrap_spans: Vec::new(),
            skip_spans: Vec::new(),
        };
        collector.visit_program(&parser_ret.program);
        let skip = collector.skip_spans;
        let mut wraps = collector.wrap_spans;
        wraps.retain(|(s, e)| !skip.iter().any(|(s2, e2)| *s2 == *s && *e2 == *e));

        if wraps.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        // Build replacements end-to-start.
        wraps.sort_by_key(|r| std::cmp::Reverse(r.0));
        let mut out = source.to_string();
        for (start, end) in &wraps {
            let qualified = &source[*start as usize..*end as usize];
            let rewrite = format!("$.get({})", qualified);
            out.replace_range(*start as usize..*end as usize, &rewrite);
        }

        *cell.borrow_mut() = allocator;
        Some(out)
    })
}

struct PrivateMemberReadWrapCollector<'a> {
    source: &'a str,
    qualified_names: &'a [String],
    /// PrivateField spans that are the `.object` of an enclosing
    /// static/computed member expression and match a qualified name.
    wrap_spans: Vec<(u32, u32)>,
    /// PrivateField spans to skip (assignment LHS, update target,
    /// $.get/$.set/etc first-arg).
    skip_spans: Vec<(u32, u32)>,
}

impl<'a> PrivateMemberReadWrapCollector<'a> {
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

    fn consider_wrap(&mut self, expr: &Expression<'_>) {
        let Expression::PrivateFieldExpression(pf) = expr else {
            return;
        };
        let text = &self.source[pf.span.start as usize..pf.span.end as usize];
        if self.qualified_names.iter().any(|q| q.as_str() == text) {
            self.wrap_spans.push((pf.span.start, pf.span.end));
        }
    }
}

impl<'a, 'ast> Visit<'ast> for PrivateMemberReadWrapCollector<'a> {
    fn visit_static_member_expression(&mut self, member: &StaticMemberExpression<'ast>) {
        self.consider_wrap(&member.object);
        walk::walk_static_member_expression(self, member);
    }

    fn visit_computed_member_expression(&mut self, member: &ComputedMemberExpression<'ast>) {
        self.consider_wrap(&member.object);
        walk::walk_computed_member_expression(self, member);
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
    fn static_member_read_wrapped() {
        let out = transform_private_member_read_wrap_ast(
            "let x = this.#count.foo;",
            &ssv(&["this.#count"]),
        )
        .unwrap();
        assert_eq!(out, "let x = $.get(this.#count).foo;");
    }

    #[test]
    fn computed_member_read_wrapped() {
        let out =
            transform_private_member_read_wrap_ast("let x = this.#list[0];", &ssv(&["this.#list"]))
                .unwrap();
        assert_eq!(out, "let x = $.get(this.#list)[0];");
    }

    #[test]
    fn deeper_static_chain_wrapped() {
        let out = transform_private_member_read_wrap_ast(
            "let x = this.#obj.a.b.c;",
            &ssv(&["this.#obj"]),
        )
        .unwrap();
        assert_eq!(out, "let x = $.get(this.#obj).a.b.c;");
    }

    #[test]
    fn mixed_static_computed_wrapped() {
        let out = transform_private_member_read_wrap_ast(
            "let x = this.#obj.items[0];",
            &ssv(&["this.#obj"]),
        )
        .unwrap();
        assert_eq!(out, "let x = $.get(this.#obj).items[0];");
    }

    #[test]
    fn standalone_read_left_alone() {
        // Standalone reads are handled by private_read_wrap_ast.
        assert!(
            transform_private_member_read_wrap_ast("let x = this.#count;", &ssv(&["this.#count"]))
                .is_none()
        );
    }

    #[test]
    fn assignment_lhs_left_alone() {
        // LHS write — different code path.
        assert!(
            transform_private_member_read_wrap_ast("this.#count = 5;", &ssv(&["this.#count"]))
                .is_none()
        );
    }

    #[test]
    fn member_assignment_lhs_left_alone() {
        // `this.#obj.foo = 5` — the .object IS this.#obj, but the
        // assignment LHS is the OUTER member. Hmm — for the
        // member-chain wrap path, the inner PrivateField is the
        // .object of the outer assignment target, so we DO want to
        // wrap it. This matches the text version's behaviour:
        // `result.replace("this.#obj.", "$.get(this.#obj).")` will
        // wrap regardless of whether the chain ends in assignment
        // or read.
        let out =
            transform_private_member_read_wrap_ast("this.#obj.foo = 5;", &ssv(&["this.#obj"]))
                .unwrap();
        assert_eq!(out, "$.get(this.#obj).foo = 5;");
    }

    #[test]
    fn update_member_chain_still_wrapped() {
        // `this.#obj.foo++` — outer is update on member, inner
        // PrivateField is .object of static member. Wrap inner.
        let out = transform_private_member_read_wrap_ast("this.#obj.foo++;", &ssv(&["this.#obj"]))
            .unwrap();
        assert_eq!(out, "$.get(this.#obj).foo++;");
    }

    #[test]
    fn already_in_get_left_alone() {
        let src = "$.get(this.#count).foo;";
        assert!(transform_private_member_read_wrap_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn already_in_set_left_alone() {
        let src = "$.set(this.#count, 5);";
        assert!(transform_private_member_read_wrap_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn double_application_stable() {
        let first =
            transform_private_member_read_wrap_ast("this.#count.foo;", &ssv(&["this.#count"]))
                .unwrap();
        let second = transform_private_member_read_wrap_ast(&first, &ssv(&["this.#count"]));
        assert!(second.is_none(), "expected None, got: {:?}", second);
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "this.#count.foo";"#;
        assert!(transform_private_member_read_wrap_ast(src, &ssv(&["this.#count"])).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${this.#count.foo}`;";
        let out = transform_private_member_read_wrap_ast(src, &ssv(&["this.#count"])).unwrap();
        assert_eq!(out, "let s = `${$.get(this.#count).foo}`;");
    }

    #[test]
    fn different_field_left_alone() {
        assert!(
            transform_private_member_read_wrap_ast(
                "let x = this.#other.foo;",
                &ssv(&["this.#count"])
            )
            .is_none()
        );
    }

    #[test]
    fn read_in_call_arg() {
        let out =
            transform_private_member_read_wrap_ast("foo(this.#count.bar);", &ssv(&["this.#count"]))
                .unwrap();
        assert_eq!(out, "foo($.get(this.#count).bar);");
    }

    #[test]
    fn multiple_chain_reads_all_wrapped() {
        let out = transform_private_member_read_wrap_ast(
            "let z = this.#a.x + this.#b.y;",
            &ssv(&["this.#a", "this.#b"]),
        )
        .unwrap();
        assert_eq!(out, "let z = $.get(this.#a).x + $.get(this.#b).y;");
    }

    #[test]
    fn instance_prefix() {
        let out = transform_private_member_read_wrap_ast(
            "return instance.#count.foo;",
            &ssv(&["instance.#count"]),
        )
        .unwrap();
        assert_eq!(out, "return $.get(instance.#count).foo;");
    }

    #[test]
    fn empty_qualified_no_op() {
        assert!(transform_private_member_read_wrap_ast("this.#count.foo;", &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_private_member_read_wrap_ast("this.#count.foo = (", &ssv(&["this.#count"]))
                .is_none()
        );
    }

    #[test]
    fn no_op_without_qualified_in_source() {
        assert!(
            transform_private_member_read_wrap_ast("let x = 1;", &ssv(&["this.#count"])).is_none()
        );
    }
}
