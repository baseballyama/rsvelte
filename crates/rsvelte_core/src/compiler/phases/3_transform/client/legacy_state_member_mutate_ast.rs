//! AST-based rewrite of legacy-mode state member-expression
//! assignments.
//!
//! Replaces `destructure_transforms.rs::transform_member_mutations`
//! (lines 1958+). This function is only called in legacy/non-runes
//! mode, where state vars haven't been `$.state()`-wrapped — the
//! LHS member chain is written through verbatim, just enclosed in
//! a `$.mutate(var, ...)` call.
//!
//! Mappings (preserved exactly):
//!
//! | Source                  | Replacement                                  |
//! |-------------------------|----------------------------------------------|
//! | `obj.prop = rhs`        | `$.mutate(obj, obj.prop = rhs)`              |
//! | `obj[i] = rhs`          | `$.mutate(obj, obj[i] = rhs)`                |
//! | `obj.prop += rhs`       | `$.mutate(obj, obj.prop += rhs)`             |
//! | `obj.a.b = rhs`         | `$.mutate(obj, obj.a.b = rhs)`               |
//!
//! Where `obj` ∈ `state_vars \ non_reactive_state_vars \
//! raw_state_vars`.
//!
//! Differs from the runes-mode variant
//! (`state_member_mutate_ast`, PR #200) which wraps the root with
//! `$.get(state)`:
//!
//! - Runes: `$.mutate(state, $.get(state).prop = rhs)`
//! - Legacy (this PR): `$.mutate(obj, obj.prop = rhs)` — no
//!   `$.get` wrapping since the state binding isn't a signal yet.
//!
//! ## Idempotency
//!
//! Once wrapped, the LHS root is still a bare `obj` identifier —
//! a naive visitor would re-wrap. The visitor instead detects the
//! `$.mutate(var, <assignment>)` shape via `visit_call_expression`
//! and records the inner assignment's span as "skip". On
//! subsequent passes, `visit_assignment_expression` bails on that
//! span.
//!
//! `UpdateExpression`s on members (`obj.x++`) are intentionally
//! NOT in this PR — the text version doesn't handle them either.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::SourceType;
use oxc_span::Span;

thread_local! {
    static MODULE_LEGACY_STATE_MEMBER_MUTATE_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

const MAX_FIXED_POINT_ITERS: usize = 16;

/// AST-based rewrite of `obj.prop = rhs` / `obj[i] = rhs` etc. for
/// legacy-mode state variables (skipping `non_reactive_state_vars`
/// and `raw_state_vars`). Returns `None` when there's nothing to
/// rewrite or the source fails to parse.
pub fn transform_legacy_state_member_mutate_ast(
    source: &str,
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    raw_state_vars: &[String],
) -> Option<String> {
    if state_vars.is_empty() {
        return None;
    }
    memchr::memchr(b'=', source.as_bytes())?;
    if !state_vars
        .iter()
        .filter(|v| !non_reactive_state_vars.iter().any(|nr| nr == *v))
        .filter(|v| !raw_state_vars.iter().any(|r| r == *v))
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return None;
    }

    let mut current = source.to_string();
    let mut any_changed = false;
    for _ in 0..MAX_FIXED_POINT_ITERS {
        match single_pass(
            &current,
            state_vars,
            non_reactive_state_vars,
            raw_state_vars,
        ) {
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
    non_reactive_state_vars: &[String],
    raw_state_vars: &[String],
) -> Option<String> {
    MODULE_LEGACY_STATE_MEMBER_MUTATE_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs()).parse();
        if !parser_ret.diagnostics.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = LegacyStateMemberMutateCollector {
            source,
            state_vars,
            non_reactive_state_vars,
            raw_state_vars,
            replacements: Vec::new(),
            skip_assignment_spans: Vec::new(),
        };
        collector.visit_program(&parser_ret.program);
        let mut replacements = collector.replacements;

        if replacements.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        // Innermost-only per pass — defer outer when its span
        // strictly contains an inner.
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

struct LegacyStateMemberMutateCollector<'a> {
    source: &'a str,
    state_vars: &'a [String],
    non_reactive_state_vars: &'a [String],
    raw_state_vars: &'a [String],
    replacements: Vec<(u32, u32, String)>,
    /// Spans of `AssignmentExpression`s that are the second arg of a
    /// `$.mutate(var, <assignment>)` wrap call. Skipping these is what
    /// makes the rewrite idempotent.
    skip_assignment_spans: Vec<(u32, u32)>,
}

impl<'a> LegacyStateMemberMutateCollector<'a> {
    /// Walk the `object` chain of a member expression down to the
    /// leftmost identifier.
    fn walk_object_chain_to_root<'e>(expr: &'e Expression<'_>) -> Option<(&'e str, Span)> {
        let mut cur = expr;
        loop {
            match cur {
                Expression::Identifier(id) => return Some((id.name.as_str(), id.span)),
                Expression::StaticMemberExpression(m) => cur = &m.object,
                Expression::ComputedMemberExpression(m) => cur = &m.object,
                _ => return None,
            }
        }
    }

    fn root_of_assignment_target<'e>(target: &'e AssignmentTarget<'_>) -> Option<(&'e str, Span)> {
        let object = match target {
            AssignmentTarget::StaticMemberExpression(m) => &m.object,
            AssignmentTarget::ComputedMemberExpression(m) => &m.object,
            _ => return None,
        };
        Self::walk_object_chain_to_root(object)
    }

    fn is_eligible(&self, name: &str) -> bool {
        self.state_vars.iter().any(|s| s == name)
            && !self.non_reactive_state_vars.iter().any(|nr| nr == name)
            && !self.raw_state_vars.iter().any(|r| r == name)
    }
}

impl<'a, 'ast> Visit<'ast> for LegacyStateMemberMutateCollector<'a> {
    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        // Detect the wrap shape `$.mutate(var, <assignment>)` we
        // emit. If callee is `$.mutate` (StaticMember $ . mutate),
        // arg[0] is an Identifier matching one of our state_vars,
        // and arg[1] is an AssignmentExpression, mark arg[1] as
        // already-wrapped.
        if call.arguments.len() == 2
            && let Expression::StaticMemberExpression(callee) = &call.callee
            && callee.property.name.as_str() == "mutate"
            && let Expression::Identifier(dollar) = &callee.object
            && dollar.name.as_str() == "$"
            && let Argument::Identifier(arg0) = &call.arguments[0]
            && self.is_eligible(arg0.name.as_str())
            && let Argument::AssignmentExpression(inner) = &call.arguments[1]
        {
            self.skip_assignment_spans
                .push((inner.span.start, inner.span.end));
        }

        walk::walk_call_expression(self, call);
    }

    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        if self
            .skip_assignment_spans
            .iter()
            .any(|(s, e)| *s == expr.span.start && *e == expr.span.end)
        {
            return;
        }

        let Some((root_name, _root_span)) = Self::root_of_assignment_target(&expr.left) else {
            return;
        };
        if !self.is_eligible(root_name) {
            return;
        }

        // Output uses the original assignment text verbatim, just
        // enclosed in `$.mutate(var, ...)`.
        let outer_text = &self.source[expr.span.start as usize..expr.span.end as usize];
        let rewrite = format!("$.mutate({}, {})", root_name, outer_text);
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
    fn static_member_assignment() {
        let out =
            transform_legacy_state_member_mutate_ast("obj.prop = 5;", &ssv(&["obj"]), &[], &[])
                .unwrap();
        assert_eq!(out, "$.mutate(obj, obj.prop = 5);");
    }

    #[test]
    fn computed_member_assignment() {
        let out = transform_legacy_state_member_mutate_ast("obj[0] = 5;", &ssv(&["obj"]), &[], &[])
            .unwrap();
        assert_eq!(out, "$.mutate(obj, obj[0] = 5);");
    }

    #[test]
    fn compound_assignment_on_member() {
        let out =
            transform_legacy_state_member_mutate_ast("obj.prop += 3;", &ssv(&["obj"]), &[], &[])
                .unwrap();
        assert_eq!(out, "$.mutate(obj, obj.prop += 3);");
    }

    #[test]
    fn chained_member_chain() {
        let out =
            transform_legacy_state_member_mutate_ast("obj.a.b.c = 5;", &ssv(&["obj"]), &[], &[])
                .unwrap();
        assert_eq!(out, "$.mutate(obj, obj.a.b.c = 5);");
    }

    #[test]
    fn mixed_static_and_computed() {
        let out =
            transform_legacy_state_member_mutate_ast("obj.items[0] = x;", &ssv(&["obj"]), &[], &[])
                .unwrap();
        assert_eq!(out, "$.mutate(obj, obj.items[0] = x);");
    }

    #[test]
    fn non_reactive_state_left_alone() {
        assert!(
            transform_legacy_state_member_mutate_ast(
                "obj.prop = 5;",
                &ssv(&["obj"]),
                &ssv(&["obj"]),
                &[]
            )
            .is_none()
        );
    }

    #[test]
    fn raw_state_left_alone() {
        assert!(
            transform_legacy_state_member_mutate_ast(
                "obj.prop = 5;",
                &ssv(&["obj"]),
                &[],
                &ssv(&["obj"])
            )
            .is_none()
        );
    }

    #[test]
    fn already_wrapped_is_idempotent() {
        // The visitor's CallExpression detection recognises the
        // `$.mutate(obj, <assignment>)` shape and skips the inner.
        let already = "$.mutate(obj, obj.prop = 5);";
        assert!(
            transform_legacy_state_member_mutate_ast(already, &ssv(&["obj"]), &[], &[]).is_none()
        );
    }

    #[test]
    fn double_application_is_stable() {
        let first =
            transform_legacy_state_member_mutate_ast("obj.prop = 5;", &ssv(&["obj"]), &[], &[])
                .unwrap();
        let second = transform_legacy_state_member_mutate_ast(&first, &ssv(&["obj"]), &[], &[]);
        assert!(second.is_none(), "expected None, got: {:?}", second);
    }

    #[test]
    fn leaves_non_state_member_alone() {
        assert!(
            transform_legacy_state_member_mutate_ast("other.prop = 5;", &ssv(&["obj"]), &[], &[])
                .is_none()
        );
    }

    #[test]
    fn leaves_bare_state_assignment_alone() {
        // `obj = 5` is handled by other passes.
        assert!(
            transform_legacy_state_member_mutate_ast("obj = 5;", &ssv(&["obj"]), &[], &[])
                .is_none()
        );
    }

    #[test]
    fn leaves_update_expression_alone() {
        assert!(
            transform_legacy_state_member_mutate_ast("obj.x++;", &ssv(&["obj"]), &[], &[])
                .is_none()
        );
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "obj.prop = 5";"#;
        assert!(transform_legacy_state_member_mutate_ast(src, &ssv(&["obj"]), &[], &[]).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${obj.prop = 5}`;";
        let out = transform_legacy_state_member_mutate_ast(src, &ssv(&["obj"]), &[], &[]).unwrap();
        assert_eq!(out, "let s = `${$.mutate(obj, obj.prop = 5)}`;");
    }

    #[test]
    fn multiple_states_in_one_source() {
        let out = transform_legacy_state_member_mutate_ast(
            "a.x = 1; b.y = 2;",
            &ssv(&["a", "b"]),
            &[],
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.mutate(a, a.x = 1); $.mutate(b, b.y = 2);");
    }

    #[test]
    fn function_call_on_member_is_not_a_mutation() {
        assert!(
            transform_legacy_state_member_mutate_ast("obj.foo();", &ssv(&["obj"]), &[], &[])
                .is_none()
        );
    }

    #[test]
    fn empty_state_vars_is_no_op() {
        assert!(transform_legacy_state_member_mutate_ast("obj.prop = 5;", &[], &[], &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_legacy_state_member_mutate_ast("obj.prop = (", &ssv(&["obj"]), &[], &[])
                .is_none()
        );
    }

    #[test]
    fn no_op_without_state_name() {
        assert!(
            transform_legacy_state_member_mutate_ast("let x = 1;", &ssv(&["obj"]), &[], &[])
                .is_none()
        );
    }
}
