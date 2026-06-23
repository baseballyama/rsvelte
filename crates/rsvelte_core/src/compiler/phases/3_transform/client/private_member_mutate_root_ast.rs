//! AST-based rewrite of the ROOT of a private-`$state`-field member MUTATION:
//! `this.#x.prop = value` → `$.get(this.#x).prop = value` (and compound /
//! update forms). A member mutation writes THROUGH the reactive proxy, so the
//! base must read the proxy via `$.get(this.#x)` rather than the raw `.v`
//! source access the constructor read pass would otherwise apply.
//!
//! This is AST-precise (it fires only on a real assignment / update whose
//! target is a member expression rooted at a qualified `this.#x`), so unlike a
//! text heuristic it never mis-fires on a member READ, a method call, or a
//! compound expression that merely contains `this.#x.`.
//!
//! Run BEFORE the text constructor transform (`transform_constructor_assignment`):
//! once a mutation root is `$.get(this.#x)`, the text pass's
//! `this.#x.` → `this.#x.v.` member-read substitution no longer matches it (the
//! `this.#x` is now the argument of `$.get(...)`, not followed by `.`).
//!
//! Idempotent: after the rewrite the root is the `$.get(...)` CallExpression's
//! argument, no longer a bare `PrivateFieldExpression` at member-chain root, so
//! a second pass finds nothing to do.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::SourceType;

use super::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_PRIVATE_MEMBER_MUTATE_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// Rewrite the root of every `this.#x.<chain>` MUTATION target to
/// `$.get(this.#x)` for each `this.#x` in `state_qualified`. Returns `None` when
/// there is nothing to rewrite or the source fails to parse.
pub fn transform_private_member_mutate_root_ast(
    source: &str,
    state_qualified: &[String],
) -> Option<String> {
    if state_qualified.is_empty() {
        return None;
    }
    if !state_qualified
        .iter()
        .any(|q| memchr::memmem::find(source.as_bytes(), q.as_bytes()).is_some())
    {
        return None;
    }

    ast_rewrite::fixed_point(source, |src| {
        ast_rewrite::rewrite_once(
            &MODULE_PRIVATE_MEMBER_MUTATE_ALLOC,
            src,
            SourceType::mjs(),
            ParseOptions {
                allow_return_outside_function: true,
                ..ParseOptions::default()
            },
            true,
            |program| {
                let mut collector = PrivateMemberMutateCollector {
                    source: src,
                    state_qualified,
                    replacements: Vec::new(),
                    fn_depth: 0,
                };
                collector.visit_program(program);
                collector.replacements
            },
        )
    })
}

struct PrivateMemberMutateCollector<'a> {
    source: &'a str,
    state_qualified: &'a [String],
    replacements: Vec<Edit>,
    /// Function-nesting depth (constructor body root = 0). A mutation in the
    /// DIRECT constructor body (depth 0) runs synchronously during construction
    /// and uses the raw `.v` source access (left to the text member pass); a
    /// mutation inside a nested function/arrow (depth > 0) runs post-construction
    /// and must write through the proxy via `$.get(this.#x)`. Mirrors upstream's
    /// `state.in_constructor` (cleared on entering a nested function), exactly as
    /// the standalone-read `private_v_suffix_ast` pass does.
    fn_depth: u32,
}

impl<'a> PrivateMemberMutateCollector<'a> {
    /// If `root` (the object of an assignment-target member chain) bottoms out
    /// in a `PrivateFieldExpression` whose source text is one of the qualified
    /// `$state` fields, push a `$.get(this.#x)` replacement for that root span.
    fn wrap_member_root(&mut self, root: Option<(u32, u32)>) {
        // Only nested-function mutations (post-construction) read through the
        // proxy; a direct constructor-body mutation keeps the `.v` source access.
        if self.fn_depth == 0 {
            return;
        }
        if let Some((s, e)) = root {
            let span_text = &self.source[s as usize..e as usize];
            if self.state_qualified.iter().any(|q| q.as_str() == span_text) {
                self.replacements
                    .push((s, e, format!("$.get({})", span_text)));
            }
        }
    }
}

/// Walk an expression member chain to its root and return the root's span when
/// it is a `PrivateFieldExpression`.
fn expr_root_private_span(expr: &Expression<'_>) -> Option<(u32, u32)> {
    match expr {
        Expression::PrivateFieldExpression(pf) => Some((pf.span.start, pf.span.end)),
        Expression::StaticMemberExpression(m) => expr_root_private_span(&m.object),
        Expression::ComputedMemberExpression(m) => expr_root_private_span(&m.object),
        Expression::ParenthesizedExpression(p) => expr_root_private_span(&p.expression),
        _ => None,
    }
}

/// Root private-field span of a member-expression ASSIGNMENT target
/// (`a.b = …`, `a[i] = …`). Returns `None` for a bare-identifier /
/// private-field target (a direct `this.#x = …`, handled elsewhere).
fn assignment_target_member_root(target: &AssignmentTarget<'_>) -> Option<(u32, u32)> {
    match target {
        AssignmentTarget::StaticMemberExpression(m) => expr_root_private_span(&m.object),
        AssignmentTarget::ComputedMemberExpression(m) => expr_root_private_span(&m.object),
        _ => None,
    }
}

/// Root private-field span of a member-expression UPDATE target
/// (`this.#x.n++`).
fn simple_target_member_root(target: &SimpleAssignmentTarget<'_>) -> Option<(u32, u32)> {
    match target {
        SimpleAssignmentTarget::StaticMemberExpression(m) => expr_root_private_span(&m.object),
        SimpleAssignmentTarget::ComputedMemberExpression(m) => expr_root_private_span(&m.object),
        _ => None,
    }
}

impl<'a, 'ast> Visit<'ast> for PrivateMemberMutateCollector<'a> {
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
        walk::walk_assignment_expression(self, expr);
        let root = assignment_target_member_root(&expr.left);
        self.wrap_member_root(root);
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);
        let root = simple_target_member_root(&expr.argument);
        self.wrap_member_root(root);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    // A nested-function (depth > 0) member mutation reads through the proxy.
    #[test]
    fn nested_static_member_mutation_wraps_root() {
        let out = transform_private_member_mutate_root_ast(
            "f(() => { this.#m.prev = [1, 2]; });",
            &ssv(&["this.#m"]),
        )
        .unwrap();
        assert_eq!(out, "f(() => { $.get(this.#m).prev = [1, 2]; });");
    }

    #[test]
    fn nested_member_mutation_wraps_only_root() {
        let out = transform_private_member_mutate_root_ast(
            "f(() => { this.#m.a.b = 1; });",
            &ssv(&["this.#m"]),
        )
        .unwrap();
        assert_eq!(out, "f(() => { $.get(this.#m).a.b = 1; });");
    }

    #[test]
    fn nested_compound_member_mutation_wraps_root() {
        let out = transform_private_member_mutate_root_ast(
            "f(() => { this.#m.n += 1; });",
            &ssv(&["this.#m"]),
        )
        .unwrap();
        assert_eq!(out, "f(() => { $.get(this.#m).n += 1; });");
    }

    #[test]
    fn nested_update_member_mutation_wraps_root() {
        let out = transform_private_member_mutate_root_ast(
            "f(() => { this.#m.n++; });",
            &ssv(&["this.#m"]),
        )
        .unwrap();
        assert_eq!(out, "f(() => { $.get(this.#m).n++; });");
    }

    // Direct constructor-body (depth 0) mutations keep `.v` (left to the text
    // member pass) — this pass does nothing.
    #[test]
    fn direct_body_member_mutation_untouched() {
        assert_eq!(
            transform_private_member_mutate_root_ast("this.#m.prev = [1, 2];", &ssv(&["this.#m"])),
            None
        );
    }

    #[test]
    fn nested_member_read_is_untouched() {
        // A READ (RHS / standalone) must not be wrapped here — only mutations.
        assert_eq!(
            transform_private_member_mutate_root_ast(
                "f(() => { const x = this.#m.prev; });",
                &ssv(&["this.#m"])
            ),
            None
        );
    }

    #[test]
    fn nested_direct_field_assignment_untouched() {
        // `this.#x = v` (not a member target) is handled by private_class_assign.
        assert_eq!(
            transform_private_member_mutate_root_ast(
                "f(() => { this.#m = 5; });",
                &ssv(&["this.#m"])
            ),
            None
        );
    }

    #[test]
    fn idempotent_after_wrap() {
        let once = transform_private_member_mutate_root_ast(
            "f(() => { this.#m.prev = 1; });",
            &ssv(&["this.#m"]),
        )
        .unwrap();
        assert_eq!(
            transform_private_member_mutate_root_ast(&once, &ssv(&["this.#m"])),
            None
        );
    }
}
