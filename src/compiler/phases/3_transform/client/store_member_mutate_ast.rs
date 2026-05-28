//! AST-based rewrite of store-subscription member-mutation
//! expressions.
//!
//! Covers any mutation whose target is a member expression rooted
//! at a store-subscription identifier:
//!
//! | Source                | Replacement                                                  |
//! |-----------------------|--------------------------------------------------------------|
//! | `$store.prop++`       | `$.store_mutate(store, $.untrack($store).prop++, $.untrack($store))` |
//! | `$store[0].value = x` | `$.store_mutate(store, $.untrack($store)[0].value = x, $.untrack($store))` |
//! | `$store.items[0] += x`| `$.store_mutate(store, $.untrack($store).items[0] += x, $.untrack($store))` |
//!
//! The root identifier of the member chain (`$store`) is wrapped
//! in `$.untrack(...)` so the mutation reads the *current* value
//! out of band, then `$.store_mutate` re-publishes through the
//! subscription with the second `$.untrack($store)` argument.
//!
//! Replaces the text loop in
//! `store_transforms.rs::transform_store_member_mutations` (lines
//! 600–657). The text version hand-rolled a member-chain walker
//! (`is_mutation_expression`, `find_store_member_mutation`,
//! `extract_store_mutation`, `is_inside_store_mutate`) totalling
//! ~250 lines — the AST visitor drops all of that.
//!
//! Re-wrap protection comes from the leftmost-identifier root
//! check: once a mutation has been wrapped in `$.store_mutate`,
//! the LHS root is `$.untrack($store)` (a `CallExpression`), not
//! a bare `$store` identifier, so the next pass skips it. The
//! caller-side `result.contains("$.store_mutate(<name>,")` guard
//! becomes unnecessary.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::SourceType;
use oxc_span::Span;

thread_local! {
    static MODULE_STORE_MEMBER_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

const MAX_FIXED_POINT_ITERS: usize = 16;

/// AST-based rewrite of `$store.prop = x` / `$store[i]++` etc. for
/// the bindings in `store_subs`. Returns `None` when there's
/// nothing to rewrite or the source fails to parse.
pub fn transform_store_member_mutate_ast(source: &str, store_subs: &[String]) -> Option<String> {
    transform_store_member_mutate_ast_with_props(source, store_subs, &[])
}

/// Like [`transform_store_member_mutate_ast`], but `prop_store_names` lists the
/// underlying store source names (without the `$` prefix) that are bound to a
/// **prop**. For those, the first `$.store_mutate(...)` argument is the prop
/// getter call (`store()`) rather than the bare name, matching the official
/// compiler's `get_store()` (= `context.visit(b.id(name.slice(1)))`): reading a
/// prop binding yields a getter call, so the store source must be read the same
/// way. Without this a `$prop.x = …` mutation passed the subscription view
/// instead of the prop's current value.
pub fn transform_store_member_mutate_ast_with_props(
    source: &str,
    store_subs: &[String],
    prop_store_names: &[String],
) -> Option<String> {
    if store_subs.is_empty() {
        return None;
    }
    if !store_subs
        .iter()
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return None;
    }

    let mut current = source.to_string();
    let mut any_changed = false;
    for _ in 0..MAX_FIXED_POINT_ITERS {
        match single_pass(&current, store_subs, prop_store_names) {
            Some(next) => {
                current = next;
                any_changed = true;
            }
            None => break,
        }
    }

    if any_changed { Some(current) } else { None }
}

fn single_pass(source: &str, store_subs: &[String], prop_store_names: &[String]) -> Option<String> {
    MODULE_STORE_MEMBER_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs()).parse();
        if !parser_ret.errors.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = MemberMutateCollector {
            source,
            store_subs,
            prop_store_names,
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
        // outer once its child has been rewritten.
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

struct MemberMutateCollector<'a> {
    source: &'a str,
    store_subs: &'a [String],
    prop_store_names: &'a [String],
    replacements: Vec<(u32, u32, String)>,
}

impl<'a> MemberMutateCollector<'a> {
    /// Walk the `object` chain of a member expression down to the
    /// leftmost identifier. Returns `None` if the leftmost atom is
    /// a call, parenthesised expression, `this`, etc. — those aren't
    /// store-rooted.
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

    fn root_of_simple_target<'e>(
        target: &'e SimpleAssignmentTarget<'_>,
    ) -> Option<(&'e str, Span)> {
        let object = match target {
            SimpleAssignmentTarget::StaticMemberExpression(m) => &m.object,
            SimpleAssignmentTarget::ComputedMemberExpression(m) => &m.object,
            _ => return None,
        };
        Self::walk_object_chain_to_root(object)
    }

    fn root_of_assignment_target<'e>(target: &'e AssignmentTarget<'_>) -> Option<(&'e str, Span)> {
        let object = match target {
            AssignmentTarget::StaticMemberExpression(m) => &m.object,
            AssignmentTarget::ComputedMemberExpression(m) => &m.object,
            _ => return None,
        };
        Self::walk_object_chain_to_root(object)
    }

    fn emit_rewrite(&mut self, outer_span: Span, root_name: &str, root_span: Span) {
        if !self.store_subs.iter().any(|s| s == root_name) {
            return;
        }
        let store_sub = root_name;
        let store_name = &root_name[1..];
        // The store source is read like any other reference to its binding.
        // For a prop binding that means the getter call `store()`; for plain /
        // state / reactive-import stores the bare name is correct.
        let store_access = if self.prop_store_names.iter().any(|n| n == store_name) {
            format!("{}()", store_name)
        } else {
            store_name.to_string()
        };

        let outer_text = &self.source[outer_span.start as usize..outer_span.end as usize];
        let rs = (root_span.start - outer_span.start) as usize;
        let re = (root_span.end - outer_span.start) as usize;

        let mut wrapped = String::with_capacity(outer_text.len() + 12);
        wrapped.push_str(&outer_text[..rs]);
        wrapped.push_str("$.untrack(");
        wrapped.push_str(store_sub);
        wrapped.push(')');
        wrapped.push_str(&outer_text[re..]);

        let rewrite = format!(
            "$.store_mutate({}, {}, $.untrack({}))",
            store_access, wrapped, store_sub
        );
        self.replacements
            .push((outer_span.start, outer_span.end, rewrite));
    }
}

impl<'a, 'ast> Visit<'ast> for MemberMutateCollector<'a> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);
        if let Some((root_name, root_span)) = Self::root_of_assignment_target(&expr.left) {
            self.emit_rewrite(expr.span, root_name, root_span);
        }
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);
        if let Some((root_name, root_span)) = Self::root_of_simple_target(&expr.argument) {
            self.emit_rewrite(expr.span, root_name, root_span);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn postfix_inc_static_member() {
        let out = transform_store_member_mutate_ast("$store.prop++;", &ssv(&["$store"])).unwrap();
        assert_eq!(
            out,
            "$.store_mutate(store, $.untrack($store).prop++, $.untrack($store));"
        );
    }

    #[test]
    fn prefix_inc_static_member() {
        let out = transform_store_member_mutate_ast("++$store.prop;", &ssv(&["$store"])).unwrap();
        assert_eq!(
            out,
            "$.store_mutate(store, ++$.untrack($store).prop, $.untrack($store));"
        );
    }

    #[test]
    fn prop_backed_store_uses_getter_for_source() {
        // When the store source is a prop, the first `$.store_mutate(...)`
        // argument is the prop getter call `store()`, not the bare name.
        let out = transform_store_member_mutate_ast_with_props(
            "$store.prop = 5;",
            &ssv(&["$store"]),
            &ssv(&["store"]),
        )
        .unwrap();
        assert_eq!(
            out,
            "$.store_mutate(store(), $.untrack($store).prop = 5, $.untrack($store));"
        );
    }

    #[test]
    fn assignment_static_member() {
        let out = transform_store_member_mutate_ast("$store.prop = 5;", &ssv(&["$store"])).unwrap();
        assert_eq!(
            out,
            "$.store_mutate(store, $.untrack($store).prop = 5, $.untrack($store));"
        );
    }

    #[test]
    fn compound_assignment_static_member() {
        let out =
            transform_store_member_mutate_ast("$store.prop += 3;", &ssv(&["$store"])).unwrap();
        assert_eq!(
            out,
            "$.store_mutate(store, $.untrack($store).prop += 3, $.untrack($store));"
        );
    }

    #[test]
    fn computed_member() {
        let out = transform_store_member_mutate_ast("$store[0] = 5;", &ssv(&["$store"])).unwrap();
        assert_eq!(
            out,
            "$.store_mutate(store, $.untrack($store)[0] = 5, $.untrack($store));"
        );
    }

    #[test]
    fn chained_member_chain() {
        let out = transform_store_member_mutate_ast("$store.a.b.c++;", &ssv(&["$store"])).unwrap();
        assert_eq!(
            out,
            "$.store_mutate(store, $.untrack($store).a.b.c++, $.untrack($store));"
        );
    }

    #[test]
    fn mixed_static_and_computed() {
        let out =
            transform_store_member_mutate_ast("$store.items[0] = x;", &ssv(&["$store"])).unwrap();
        assert_eq!(
            out,
            "$.store_mutate(store, $.untrack($store).items[0] = x, $.untrack($store));"
        );
    }

    #[test]
    fn only_root_is_wrapped() {
        // `$store.idx` deep in a computed key must NOT also be wrapped.
        // Only the leftmost root of the mutation target gets `$.untrack(...)`.
        let out =
            transform_store_member_mutate_ast("$store.items[$store.idx] = y;", &ssv(&["$store"]))
                .unwrap();
        // The text version's `replacen(.., 1)` semantics — only the
        // first occurrence is wrapped.
        assert!(out.contains("$.untrack($store).items[$store.idx] = y"));
        assert!(out.starts_with("$.store_mutate(store, "));
    }

    #[test]
    fn leaves_already_wrapped_mutation_alone() {
        // Once wrapped, the root of `$.untrack($store).prop` is a
        // CallExpression, not a bare Identifier — fixed-point exits.
        let already = "$.store_mutate(store, $.untrack($store).prop++, $.untrack($store));";
        assert!(transform_store_member_mutate_ast(already, &ssv(&["$store"])).is_none());
    }

    #[test]
    fn leaves_non_store_member_alone() {
        // `obj.prop++` where obj is not a store_sub
        assert!(transform_store_member_mutate_ast("obj.prop++;", &ssv(&["$store"])).is_none());
    }

    #[test]
    fn leaves_bare_store_assignment_alone() {
        // `$store = x` is handled by store_assign_ast, not here
        // (LHS is identifier, not member expression).
        assert!(transform_store_member_mutate_ast("$store = 5;", &ssv(&["$store"])).is_none());
    }

    #[test]
    fn leaves_bare_store_update_alone() {
        // `$store++` is store_update_ast's job.
        assert!(transform_store_member_mutate_ast("$store++;", &ssv(&["$store"])).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "$store.prop = 5";"#;
        assert!(transform_store_member_mutate_ast(src, &ssv(&["$store"])).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${$store.prop = 5}`;";
        let out = transform_store_member_mutate_ast(src, &ssv(&["$store"])).unwrap();
        assert_eq!(
            out,
            "let s = `${$.store_mutate(store, $.untrack($store).prop = 5, $.untrack($store))}`;"
        );
    }

    #[test]
    fn multiple_stores_in_one_source() {
        let out =
            transform_store_member_mutate_ast("$a.x = 1; $b.y++;", &ssv(&["$a", "$b"])).unwrap();
        assert_eq!(
            out,
            "$.store_mutate(a, $.untrack($a).x = 1, $.untrack($a)); $.store_mutate(b, $.untrack($b).y++, $.untrack($b));"
        );
    }

    #[test]
    fn nested_mutation_in_rhs_fixed_point() {
        // `$a.x = $b.y++` — inner fires first, outer next pass.
        let out = transform_store_member_mutate_ast("$a.x = $b.y++;", &ssv(&["$a", "$b"])).unwrap();
        assert_eq!(
            out,
            "$.store_mutate(a, $.untrack($a).x = $.store_mutate(b, $.untrack($b).y++, $.untrack($b)), $.untrack($a));"
        );
    }

    #[test]
    fn function_call_on_member_is_not_a_mutation() {
        // `$store.foo()` is a call, not a mutation
        assert!(transform_store_member_mutate_ast("$store.foo();", &ssv(&["$store"])).is_none());
    }

    #[test]
    fn empty_store_subs_is_no_op() {
        assert!(transform_store_member_mutate_ast("$store.prop = 5;", &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_store_member_mutate_ast("$store.prop = (", &ssv(&["$store"])).is_none());
    }

    #[test]
    fn no_op_without_store_name() {
        assert!(transform_store_member_mutate_ast("let x = 1;", &ssv(&["$store"])).is_none());
    }
}
