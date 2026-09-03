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
use oxc_parser::ParseOptions;
use oxc_span::SourceType;
use oxc_span::Span;

use super::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_STORE_MEMBER_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `$store.prop = x` / `$store[i]++` etc. for
/// the bindings in `store_subs`. Returns `None` when there's
/// nothing to rewrite or the source fails to parse.
///
/// The first `$.store_mutate(...)` argument is the store source read the way
/// `build_getter` reads any reference to its binding, which
/// `store_transforms::store_source_read` decides from the three name lists: a
/// prop is `store()`, a reassigned legacy `let` is `$.get(store)`, anything
/// else is the bare name. Pass `&[]` for a list that does not apply.
pub fn transform_store_member_mutate_ast_with_props(
    source: &str,
    store_subs: &[String],
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> Option<String> {
    let spliced = || {
        transform_store_member_mutate_spliced(
            source,
            store_subs,
            prop_vars,
            state_vars,
            non_reactive_state_vars,
            invalidate_bodies,
        )
    };
    ast_rewrite::dual_run::resolve("store_member_mutate_ast:inplace", source, spliced, || {
        transform_store_member_mutate_in_place(
            source,
            store_subs,
            prop_vars,
            state_vars,
            non_reactive_state_vars,
            invalidate_bodies,
        )
    })
}

fn transform_store_member_mutate_spliced(
    source: &str,
    store_subs: &[String],
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
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

    ast_rewrite::fixed_point(source, |src| {
        ast_rewrite::rewrite_once(
            &MODULE_STORE_MEMBER_ALLOC,
            src,
            SourceType::mjs(),
            ParseOptions::default(),
            true,
            |program| {
                let mut collector = MemberMutateCollector {
                    source: src,
                    store_subs,
                    prop_vars,
                    state_vars,
                    non_reactive_state_vars,
                    invalidate_bodies,
                    replacements: Vec::new(),
                };
                collector.visit_program(program);
                collector.replacements
            },
        )
    })
}

struct MemberMutateCollector<'a> {
    source: &'a str,
    store_subs: &'a [String],
    prop_vars: &'a [String],
    state_vars: &'a [String],
    non_reactive_state_vars: &'a [String],
    invalidate_bodies: &'a rustc_hash::FxHashMap<String, String>,
    replacements: Vec<Edit>,
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

    fn emit_rewrite(
        &mut self,
        outer_span: Span,
        root_name: &str,
        root_span: Span,
        is_update: bool,
    ) {
        if !self.store_subs.iter().any(|s| s == root_name) {
            return;
        }
        let store_sub = root_name;
        let store_name = &root_name[1..];
        let store_access = match super::store_transforms::store_source_read(
            store_name,
            self.prop_vars,
            self.state_vars,
            self.non_reactive_state_vars,
        ) {
            super::store_transforms::StoreSourceRead::Getter => format!("{}()", store_name),
            super::store_transforms::StoreSourceRead::Signal => format!("$.get({})", store_name),
            super::store_transforms::StoreSourceRead::Bare => store_name.to_string(),
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

        let mutate = format!(
            "$.store_mutate({}, {}, $.untrack({}))",
            store_access, wrapped, store_sub
        );
        // `AssignmentExpression.js:164` appends the tail on the MUTATE arm with no
        // condition on the binding's kind, and a `$store` is a `store_sub` binding
        // upstream — so a store member write invalidates the same indirect bindings
        // a state member write does.
        // `UpdateExpression.js` does not import `build_assignment`, so upstream
        // never grows the tail on a `++` / `--`.
        let rewrite = match self.invalidate_bodies.get(store_sub) {
            Some(body) if !body.is_empty() && !is_update => {
                format!(
                    "({}, $.invalidate_inner_signals(() => {{ {} }}))",
                    mutate, body
                )
            }
            _ => mutate,
        };
        self.replacements
            .push((outer_span.start, outer_span.end, rewrite));
    }
}

impl<'a, 'ast> Visit<'ast> for MemberMutateCollector<'a> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);
        if let Some((root_name, root_span)) = Self::root_of_assignment_target(&expr.left) {
            self.emit_rewrite(expr.span, root_name, root_span, false);
        }
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);
        if let Some((root_name, root_span)) = Self::root_of_simple_target(&expr.argument) {
            self.emit_rewrite(expr.span, root_name, root_span, true);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    /// Test helper: the non-prop case (no prop-backed store sources).
    fn transform_store_member_mutate_ast(source: &str, store_subs: &[String]) -> Option<String> {
        transform_store_member_mutate_ast_with_props(
            source,
            store_subs,
            &[],
            &[],
            &[],
            &rustc_hash::FxHashMap::default(),
        )
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
            &[],
            &[],
            &rustc_hash::FxHashMap::default(),
        )
        .unwrap();
        assert_eq!(
            out,
            "$.store_mutate(store(), $.untrack($store).prop = 5, $.untrack($store));"
        );
    }

    #[test]
    fn reactive_local_store_source_reads_through_get() {
        // A legacy `let` that is reassigned is a signal, so every reference to
        // it — including the store source of a member mutation — reads as
        // `$.get(name)`. The assign and update rewriters already did this.
        let out = transform_store_member_mutate_ast_with_props(
            "$store.prop = 5;",
            &ssv(&["$store"]),
            &[],
            &ssv(&["store"]),
            &[],
            &rustc_hash::FxHashMap::default(),
        )
        .unwrap();
        assert_eq!(
            out,
            "$.store_mutate($.get(store), $.untrack($store).prop = 5, $.untrack($store));"
        );
    }

    #[test]
    fn a_prop_wins_over_a_state_source() {
        // Both sets are name-keyed, so the order of the arms is observable, and
        // the assign port picks the prop form for the same input.
        let out = transform_store_member_mutate_ast_with_props(
            "$store.prop = 5;",
            &ssv(&["$store"]),
            &ssv(&["store"]),
            &ssv(&["store"]),
            &[],
            &rustc_hash::FxHashMap::default(),
        )
        .unwrap();
        assert_eq!(
            out,
            "$.store_mutate(store(), $.untrack($store).prop = 5, $.untrack($store));"
        );
    }

    #[test]
    fn non_reactive_state_store_source_stays_bare() {
        let out = transform_store_member_mutate_ast_with_props(
            "$store.prop = 5;",
            &ssv(&["$store"]),
            &[],
            &ssv(&["store"]),
            &ssv(&["store"]),
            &rustc_hash::FxHashMap::default(),
        )
        .unwrap();
        assert_eq!(
            out,
            "$.store_mutate(store, $.untrack($store).prop = 5, $.untrack($store));"
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
            "$.store_mutate(a, $.untrack($a).x = 1, $.untrack($a));\n$.store_mutate(b, $.untrack($b).y++, $.untrack($b));"
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

// ── in-place port ──────────────────────────────────────────────────────

thread_local! {
    static MODULE_STORE_MEMBER_IN_PLACE_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// In-place equivalent of [`transform_store_member_mutate_ast_with_props`].
pub(crate) fn transform_store_member_mutate_in_place(
    source: &str,
    store_subs: &[String],
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> ast_rewrite::Rewrite {
    if store_subs.is_empty() {
        return ast_rewrite::Rewrite::Unchanged;
    }
    if !store_subs
        .iter()
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return ast_rewrite::Rewrite::Unchanged;
    }
    ast_rewrite::with_program_mut(
        &MODULE_STORE_MEMBER_IN_PLACE_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions::default(),
        |allocator, program| {
            let mut rewriter = MemberMutateRewriter {
                b: crate::compiler::phases::phase3_transform::builders::B::new(allocator),
                allocator,
                store_subs,
                prop_vars,
                state_vars,
                non_reactive_state_vars,
                invalidate_bodies,
                changed: false,
            };
            oxc_ast_visit::VisitMut::visit_program(&mut rewriter, program);
            rewriter.changed
        },
    )
}

struct MemberMutateRewriter<'a, 'b> {
    b: crate::compiler::phases::phase3_transform::builders::B<'a>,
    allocator: &'a oxc_allocator::Allocator,
    store_subs: &'b [String],
    prop_vars: &'b [String],
    state_vars: &'b [String],
    non_reactive_state_vars: &'b [String],
    invalidate_bodies: &'b rustc_hash::FxHashMap<String, String>,
    changed: bool,
}

impl<'a> MemberMutateRewriter<'a, '_> {
    /// `$.invalidate_inner_signals(() => { <body> })`, parsed from the precomputed
    /// text body. `None` when the body does not parse, in which case the mutation is
    /// emitted unwrapped rather than wrongly.
    fn invalidate_call(&self, body: &str) -> Option<Expression<'a>> {
        let owned = self.allocator.alloc_str(body);
        let parsed = oxc_parser::Parser::new(self.allocator, owned, SourceType::mjs()).parse();
        if !parsed.diagnostics.is_empty() {
            return None;
        }
        let stmts: Vec<Statement<'a>> = parsed.program.body.into_iter().collect();
        let mut call = self.b.call(
            "$.invalidate_inner_signals",
            vec![self.b.thunk_block(stmts, false)],
        );
        ast_rewrite::mark_synthesized_expression(&mut call);
        Some(call)
    }

    /// The leftmost identifier of a member chain — the only part of a mutation
    /// target that is itself a store read.
    fn chain_root<'e>(expr: &'e mut Expression<'a>) -> Option<&'e mut Expression<'a>> {
        let mut cur = expr;
        loop {
            if matches!(cur, Expression::Identifier(_)) {
                return Some(cur);
            }
            cur = match cur {
                Expression::StaticMemberExpression(m) => &mut m.object,
                Expression::ComputedMemberExpression(m) => &mut m.object,
                _ => return None,
            };
        }
    }

    fn simple_target_root<'e>(
        target: &'e mut SimpleAssignmentTarget<'a>,
    ) -> Option<&'e mut Expression<'a>> {
        match target {
            SimpleAssignmentTarget::StaticMemberExpression(m) => Self::chain_root(&mut m.object),
            SimpleAssignmentTarget::ComputedMemberExpression(m) => Self::chain_root(&mut m.object),
            _ => None,
        }
    }

    fn assignment_target_root<'e>(
        target: &'e mut AssignmentTarget<'a>,
    ) -> Option<&'e mut Expression<'a>> {
        match target {
            AssignmentTarget::StaticMemberExpression(m) => Self::chain_root(&mut m.object),
            AssignmentTarget::ComputedMemberExpression(m) => Self::chain_root(&mut m.object),
            _ => None,
        }
    }

    fn mutation_root<'e>(expr: &'e mut Expression<'a>) -> Option<&'e mut Expression<'a>> {
        match expr {
            Expression::AssignmentExpression(a) => Self::assignment_target_root(&mut a.left),
            Expression::UpdateExpression(u) => Self::simple_target_root(&mut u.argument),
            _ => None,
        }
    }
}

impl<'a> oxc_ast_visit::VisitMut<'a> for MemberMutateRewriter<'a, '_> {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        oxc_ast_visit::walk_mut::walk_expression(self, expr);

        let is_update = matches!(expr, Expression::UpdateExpression(_));
        let Some(root) = Self::mutation_root(expr) else {
            return;
        };
        let Expression::Identifier(id) = &*root else {
            return;
        };
        let store_sub = id.name.to_string();
        if !self.store_subs.contains(&store_sub) {
            return;
        }
        let store_name = &store_sub[1..];

        *root = self
            .b
            .call("$.untrack", vec![self.b.id(store_sub.as_str())]);

        let store_access = match super::store_transforms::store_source_read(
            store_name,
            self.prop_vars,
            self.state_vars,
            self.non_reactive_state_vars,
        ) {
            super::store_transforms::StoreSourceRead::Getter => self.b.call(store_name, vec![]),
            super::store_transforms::StoreSourceRead::Signal => {
                self.b.call("$.get", vec![self.b.id(store_name)])
            }
            super::store_transforms::StoreSourceRead::Bare => self.b.id(store_name),
        };
        let mutation = std::mem::replace(expr, self.b.void0());
        let published = self
            .b
            .call("$.untrack", vec![self.b.id(store_sub.as_str())]);
        let mutate = self
            .b
            .call("$.store_mutate", vec![store_access, mutation, published]);
        // `AssignmentExpression.js:164` appends the tail on the MUTATE arm with no
        // condition on the binding's kind, and a `$store` is a `store_sub` binding
        // upstream — so a store member write invalidates the same indirect bindings
        // a state member write does.
        // `UpdateExpression.js` does not import `build_assignment`, so upstream
        // never grows the tail on a `++` / `--`.
        *expr = match self.invalidate_bodies.get(store_sub.as_str()) {
            Some(body) if !body.is_empty() && !is_update => match self.invalidate_call(body) {
                Some(invalidate) => self.b.sequence(vec![mutate, invalidate]),
                None => mutate,
            },
            _ => mutate,
        };
        self.changed = true;
    }
}
