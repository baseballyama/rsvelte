//! AST-based rewrite of `rest_var.foo` → `$$props.foo`.
//!
//! Replaces `props_transforms.rs::transform_rest_prop_member_access`
//! (lines 2285+). The text version uses regex `\b{var}\.` then
//! hand-rolls bookkeeping about whether the access is computed
//! (`rest_var[...]`), a direct single-level assignment LHS
//! (`rest_var.foo = X`), or a deeper access (`rest_var.foo.bar`).
//!
//! Mappings (preserved exactly):
//!
//! | Source                  | Replacement                  |
//! |-------------------------|------------------------------|
//! | `rest_var.foo`          | `$$props.foo`                |
//! | `rest_var.foo.bar`      | `$$props.foo.bar`            |
//! | `rest_var.foo[i]`       | `$$props.foo[i]`             |
//! | `rest_var[i]`           | unchanged (computed access)  |
//! | `rest_var.foo = value`  | unchanged (single-level LHS) |
//!
//! "Single-level LHS" means: the `rest_var.foo` MemberExpression
//! is itself the direct LHS of an AssignmentExpression. A deeper
//! chain (`rest_var.foo.bar = value`) where `rest_var.foo` is the
//! INNER object of a parent member is rewritten — only the outer
//! `rest_var.foo.bar` is the LHS, and that's a different node.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::SourceType;

use super::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_REST_PROP_MEMBER_ACCESS_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// AST-based rewrite of `rest_var.<prop>` → `$$props.<prop>` for
/// the bindings in `rest_prop_vars`. Returns `None` when there's
/// nothing to rewrite or the source fails to parse.
pub fn transform_rest_prop_member_access_ast(
    source: &str,
    rest_prop_vars: &[String],
) -> Option<String> {
    if rest_prop_vars.is_empty() {
        return None;
    }
    if !rest_prop_vars
        .iter()
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return None;
    }

    ast_rewrite::rewrite_once(
        &MODULE_REST_PROP_MEMBER_ACCESS_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions::default(),
        true,
        |program| {
            let mut collector = RestPropCollector {
                rest_prop_vars,
                replacements: Vec::new(),
                skip_member_spans: Vec::new(),
            };
            collector.visit_program(program);
            let mut replacements = collector.replacements;
            let skip = collector.skip_member_spans;

            // Drop replacements for skipped (single-level-LHS) members.
            replacements.retain(|(s, e, _)| !skip.iter().any(|(s2, e2)| *s2 == *s && *e2 == *e));
            replacements
        },
    )
}

struct RestPropCollector<'a> {
    rest_prop_vars: &'a [String],
    /// Replacements: (start, end, new_text). The span here is the
    /// `rest_var` identifier's span, NOT the whole member chain.
    replacements: Vec<Edit>,
    /// Spans of `rest_var` identifiers whose immediate parent is a
    /// `StaticMemberExpression` that is itself the LHS of an
    /// `AssignmentExpression`. These match the text version's
    /// "single-level direct assignment" exclusion.
    skip_member_spans: Vec<(u32, u32)>,
}

impl<'a> RestPropCollector<'a> {
    fn is_rest_var(&self, name: &str) -> bool {
        self.rest_prop_vars.iter().any(|v| v == name)
    }
}

impl<'a, 'ast> Visit<'ast> for RestPropCollector<'a> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        // If the LHS is a static member expression whose object is a
        // rest_var Identifier, mark that Identifier's span as
        // "skip". The text version's check: `rest_var.foo = X`
        // with `X` not preceded by `.` keeps the original. AST
        // equivalent: assignment LHS is a single-level static member
        // expression rooted at a bare rest_var identifier.
        if let AssignmentTarget::StaticMemberExpression(m) = &expr.left
            && let Expression::Identifier(id) = &m.object
            && self.is_rest_var(id.name.as_str())
        {
            self.skip_member_spans.push((id.span.start, id.span.end));
        }
        walk::walk_assignment_expression(self, expr);
    }

    fn visit_static_member_expression(&mut self, member: &StaticMemberExpression<'ast>) {
        // If this is `rest_var.<prop>`, rewrite `rest_var` →
        // `$$props`. We replace just the identifier span so that
        // any chained accesses (e.g. `rest_var.foo.bar`) work
        // naturally: each layer is a separate
        // StaticMemberExpression, but only the innermost is rooted
        // at the bare identifier.
        if let Expression::Identifier(id) = &member.object
            && self.is_rest_var(id.name.as_str())
        {
            self.replacements
                .push((id.span.start, id.span.end, "$$props".to_string()));
        }
        walk::walk_static_member_expression(self, member);
    }

    fn visit_computed_member_expression(&mut self, member: &ComputedMemberExpression<'ast>) {
        // `rest_var[i]` is intentionally left alone by the text
        // version. We don't rewrite the identifier here — just
        // descend into the expression and the index.
        walk::walk_computed_member_expression(self, member);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn static_member_access_rewritten() {
        let out = transform_rest_prop_member_access_ast("rest.foo;", &ssv(&["rest"])).unwrap();
        assert_eq!(out, "$$props.foo;");
    }

    #[test]
    fn chained_static_member_access_rewritten() {
        let out = transform_rest_prop_member_access_ast("rest.foo.bar;", &ssv(&["rest"])).unwrap();
        assert_eq!(out, "$$props.foo.bar;");
    }

    #[test]
    fn computed_member_access_left_alone() {
        // The text version's `if after_match.starts_with('[')`
        // check skips computed access.
        assert!(transform_rest_prop_member_access_ast("rest[0];", &ssv(&["rest"])).is_none());
    }

    #[test]
    fn computed_with_index_left_alone() {
        // `rest[i]` only — neither `rest` nor inner expressions are
        // rewritten.
        assert!(transform_rest_prop_member_access_ast("rest[i];", &ssv(&["rest"])).is_none());
    }

    #[test]
    fn single_level_direct_assignment_left_alone() {
        // `rest.foo = value` — the text version's
        // `is_direct_assignment && !has_deeper_access` exclusion.
        assert!(transform_rest_prop_member_access_ast("rest.foo = 5;", &ssv(&["rest"])).is_none());
    }

    #[test]
    fn deeper_access_in_assignment_still_rewritten() {
        // `rest.foo.bar = value` — outer LHS is `rest.foo.bar`,
        // inner is `rest.foo` (the object of outer's member). Only
        // the outer LHS member is skipped from rewrite (because its
        // object is `rest.foo`, NOT a bare `rest` identifier). The
        // inner `rest.foo` IS rewritten.
        //
        // Text version's regex pass would match `rest.` and check
        // is_direct_assignment by looking at `foo = value`. Since
        // `foo` is followed by `.bar`, `has_deeper_access` is true,
        // so it DOES rewrite.
        let out =
            transform_rest_prop_member_access_ast("rest.foo.bar = 5;", &ssv(&["rest"])).unwrap();
        assert_eq!(out, "$$props.foo.bar = 5;");
    }

    #[test]
    fn computed_access_after_prop_still_rewritten() {
        // `rest.foo[0]` — text version checks `has_deeper_access` based
        // on the char after the prop name; in this case it's `[`, which
        // is NOT counted as "deeper" (only `.` counts) — and there's no
        // `=` either, so the rewrite happens normally.
        let out = transform_rest_prop_member_access_ast("rest.foo[0];", &ssv(&["rest"])).unwrap();
        assert_eq!(out, "$$props.foo[0];");
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "rest.foo";"#;
        assert!(transform_rest_prop_member_access_ast(src, &ssv(&["rest"])).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${rest.foo}`;";
        let out = transform_rest_prop_member_access_ast(src, &ssv(&["rest"])).unwrap();
        assert_eq!(out, "let s = `${$$props.foo}`;");
    }

    #[test]
    fn multiple_rest_vars_in_one_source() {
        let out = transform_rest_prop_member_access_ast("a.x; b.y;", &ssv(&["a", "b"])).unwrap();
        assert_eq!(out, "$$props.x; $$props.y;");
    }

    #[test]
    fn unrelated_member_access_left_alone() {
        // `other.foo` where `other` is not a rest_prop_var.
        assert!(transform_rest_prop_member_access_ast("other.foo;", &ssv(&["rest"])).is_none());
    }

    #[test]
    fn nested_object_with_rest_var_name_left_alone() {
        // `obj.rest.foo` — `rest` is a property of `obj`, not a
        // standalone identifier. Should NOT be rewritten.
        assert!(transform_rest_prop_member_access_ast("obj.rest.foo;", &ssv(&["rest"])).is_none());
    }

    #[test]
    fn rest_var_as_function_arg_rewritten() {
        // `foo(rest.x)` — `rest.x` is a static member access in
        // call-arg position. Rewrite normally.
        let out = transform_rest_prop_member_access_ast("foo(rest.x);", &ssv(&["rest"])).unwrap();
        assert_eq!(out, "foo($$props.x);");
    }

    #[test]
    fn empty_rest_prop_vars_is_no_op() {
        assert!(transform_rest_prop_member_access_ast("rest.foo;", &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_rest_prop_member_access_ast("rest.foo (", &ssv(&["rest"])).is_none());
    }

    #[test]
    fn no_op_when_var_absent() {
        assert!(transform_rest_prop_member_access_ast("foo;", &ssv(&["rest"])).is_none());
    }
}
