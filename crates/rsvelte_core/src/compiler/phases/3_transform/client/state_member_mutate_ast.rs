//! AST-based rewrite of reactive-state member-expression
//! assignments.
//!
//! Replaces `transform_state_member_mutations` in
//! `reactive_transforms.rs` (lines 1302+). The text version
//! hand-rolled a comment / string-literal / member-chain walker
//! with a forward `=` scanner (skipping `==`, `!=`, `<=`, `>=`)
//! totalling ~300 lines. The AST visitor drops all of that.
//!
//! Mappings (preserved exactly):
//!
//! | Source                  | Replacement                                       |
//! |-------------------------|---------------------------------------------------|
//! | `state.prop = rhs`      | `$.mutate(state, $.get(state).prop = rhs)`        |
//! | `state[i] = rhs`        | `$.mutate(state, $.get(state)[i] = rhs)`          |
//! | `state.prop += rhs`     | `$.mutate(state, $.get(state).prop += rhs)`       |
//! | `state.a.b = rhs`       | `$.mutate(state, $.get(state).a.b = rhs)`         |
//!
//! Where `state` ∈ `state_vars \ non_reactive_vars`. The root
//! identifier of the LHS member chain is wrapped in `$.get(...)`
//! so the read is reactive; `$.mutate` then notifies the
//! subscription.
//!
//! `UpdateExpression`s on members (`state.x++`) are intentionally
//! **not** in this PR — the text version doesn't handle them
//! either (it only scans for `=`), so they fall through.
//!
//! Re-wrap protection: once a mutation is wrapped, the LHS root
//! is `$.get(state)` (a `CallExpression`), not a bare `state`
//! identifier — the AST visitor bails on the next pass. The text
//! loop's `$.get(` / `$.mutate(` / `$.set(` prefix checks then
//! short-circuit.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::SourceType;
use oxc_span::Span;

thread_local! {
    static MODULE_STATE_MEMBER_MUTATE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

const MAX_FIXED_POINT_ITERS: usize = 16;

/// AST-based rewrite of `state.prop = rhs` / `state[i] = rhs` etc.
/// for the bindings in `state_vars` (excluding `non_reactive_vars`).
/// Returns `None` when there's nothing to rewrite or the source
/// fails to parse.
pub fn transform_state_member_mutate_ast(
    source: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> Option<String> {
    if state_vars.is_empty() {
        return None;
    }
    // Fast probe — no `=` at all means no AssignmentExpression.
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
    MODULE_STATE_MEMBER_MUTATE_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs()).parse();
        if !parser_ret.errors.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = StateMemberMutateCollector {
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

struct StateMemberMutateCollector<'a> {
    source: &'a str,
    state_vars: &'a [String],
    non_reactive_vars: &'a [String],
    replacements: Vec<(u32, u32, String)>,
}

impl<'a> StateMemberMutateCollector<'a> {
    /// Walk the `object` chain of a member expression down to the
    /// leftmost identifier. Returns `None` if the leftmost atom is
    /// a call, parenthesised expression, `this`, etc.
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
}

impl<'a, 'ast> Visit<'ast> for StateMemberMutateCollector<'a> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        let Some((root_name, root_span)) = Self::root_of_assignment_target(&expr.left) else {
            return;
        };
        if !self.state_vars.iter().any(|s| s == root_name) {
            return;
        }
        if self.non_reactive_vars.iter().any(|s| s == root_name) {
            return;
        }
        let state_var = root_name;

        let outer_text = &self.source[expr.span.start as usize..expr.span.end as usize];
        let rs = (root_span.start - expr.span.start) as usize;
        let re = (root_span.end - expr.span.start) as usize;

        let mut wrapped = String::with_capacity(outer_text.len() + 10);
        wrapped.push_str(&outer_text[..rs]);
        wrapped.push_str("$.get(");
        wrapped.push_str(state_var);
        wrapped.push(')');
        wrapped.push_str(&outer_text[re..]);

        let rewrite = format!("$.mutate({}, {})", state_var, wrapped);
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
            transform_state_member_mutate_ast("state.prop = 5;", &ssv(&["state"]), &[]).unwrap();
        assert_eq!(out, "$.mutate(state, $.get(state).prop = 5);");
    }

    #[test]
    fn computed_member_assignment() {
        let out =
            transform_state_member_mutate_ast("state[0] = 5;", &ssv(&["state"]), &[]).unwrap();
        assert_eq!(out, "$.mutate(state, $.get(state)[0] = 5);");
    }

    #[test]
    fn compound_assignment_on_member() {
        let out =
            transform_state_member_mutate_ast("state.prop += 3;", &ssv(&["state"]), &[]).unwrap();
        assert_eq!(out, "$.mutate(state, $.get(state).prop += 3);");
    }

    #[test]
    fn chained_member_chain() {
        let out =
            transform_state_member_mutate_ast("state.a.b.c = 5;", &ssv(&["state"]), &[]).unwrap();
        assert_eq!(out, "$.mutate(state, $.get(state).a.b.c = 5);");
    }

    #[test]
    fn mixed_static_and_computed() {
        let out = transform_state_member_mutate_ast("state.items[0] = x;", &ssv(&["state"]), &[])
            .unwrap();
        assert_eq!(out, "$.mutate(state, $.get(state).items[0] = x);");
    }

    #[test]
    fn only_root_is_wrapped() {
        // `state.idx` deep in a computed key must NOT also be wrapped.
        let out =
            transform_state_member_mutate_ast("state.items[state.idx] = y;", &ssv(&["state"]), &[])
                .unwrap();
        assert!(out.contains("$.get(state).items[state.idx] = y"));
        assert!(out.starts_with("$.mutate(state, "));
    }

    #[test]
    fn non_reactive_state_left_alone() {
        assert!(
            transform_state_member_mutate_ast(
                "state.prop = 5;",
                &ssv(&["state"]),
                &ssv(&["state"])
            )
            .is_none()
        );
    }

    #[test]
    fn leaves_already_wrapped_alone() {
        // Once wrapped, LHS root is `$.get(state)` — a
        // CallExpression — so the visitor bails on the next pass.
        let already = "$.mutate(state, $.get(state).prop = 5);";
        assert!(transform_state_member_mutate_ast(already, &ssv(&["state"]), &[]).is_none());
    }

    #[test]
    fn leaves_non_state_member_alone() {
        assert!(
            transform_state_member_mutate_ast("obj.prop = 5;", &ssv(&["state"]), &[]).is_none()
        );
    }

    #[test]
    fn leaves_bare_state_assignment_alone() {
        // `state = 5` is handled by transform_state_set_in_reactive,
        // not here. LHS is identifier, not member.
        assert!(transform_state_member_mutate_ast("state = 5;", &ssv(&["state"]), &[]).is_none());
    }

    #[test]
    fn leaves_update_expression_alone() {
        // `state.x++` is NOT handled by the text version either.
        assert!(transform_state_member_mutate_ast("state.x++;", &ssv(&["state"]), &[]).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "state.prop = 5";"#;
        assert!(transform_state_member_mutate_ast(src, &ssv(&["state"]), &[]).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_comment() {
        let src = "// state.prop = 5\nfoo();";
        assert!(transform_state_member_mutate_ast(src, &ssv(&["state"]), &[]).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${state.prop = 5}`;";
        let out = transform_state_member_mutate_ast(src, &ssv(&["state"]), &[]).unwrap();
        assert_eq!(out, "let s = `${$.mutate(state, $.get(state).prop = 5)}`;");
    }

    #[test]
    fn rewrites_inside_callback() {
        let src = "items.forEach(it => { state.x = it; });";
        let out = transform_state_member_mutate_ast(src, &ssv(&["state"]), &[]).unwrap();
        assert_eq!(
            out,
            "items.forEach(it => { $.mutate(state, $.get(state).x = it); });"
        );
    }

    #[test]
    fn multiple_states_in_one_source() {
        let out =
            transform_state_member_mutate_ast("a.x = 1; b.y = 2;", &ssv(&["a", "b"]), &[]).unwrap();
        assert_eq!(
            out,
            "$.mutate(a, $.get(a).x = 1); $.mutate(b, $.get(b).y = 2);"
        );
    }

    #[test]
    fn nested_mutation_in_rhs_fixed_point() {
        // `a.x = b.y++` — wait, ++ isn't handled.
        // Try `a.x = (b.y = 5)` — inner b.y=5 picked up first
        let out =
            transform_state_member_mutate_ast("a.x = (b.y = 5);", &ssv(&["a", "b"]), &[]).unwrap();
        assert_eq!(
            out,
            "$.mutate(a, $.get(a).x = ($.mutate(b, $.get(b).y = 5)));"
        );
    }

    #[test]
    fn function_call_on_member_is_not_a_mutation() {
        // `state.foo()` is a CallExpression, not a mutation.
        assert!(transform_state_member_mutate_ast("state.foo();", &ssv(&["state"]), &[]).is_none());
    }

    #[test]
    fn empty_state_vars_is_no_op() {
        assert!(transform_state_member_mutate_ast("state.prop = 5;", &[], &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_state_member_mutate_ast("state.prop = (", &ssv(&["state"]), &[]).is_none()
        );
    }

    #[test]
    fn no_op_without_equals() {
        assert!(transform_state_member_mutate_ast("foo(state);", &ssv(&["state"]), &[]).is_none());
    }

    #[test]
    fn no_op_without_state_name() {
        assert!(transform_state_member_mutate_ast("let x = 1;", &ssv(&["state"]), &[]).is_none());
    }
}
