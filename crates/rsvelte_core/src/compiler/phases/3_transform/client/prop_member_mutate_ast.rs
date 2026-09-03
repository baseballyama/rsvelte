//! AST-based rewrite of prop-variable member-expression
//! assignments.
//!
//! Replaces the member-mutation branch in
//! `state_transforms.rs::transform_prop_assignments`
//! (lines 2501+ — `if !non_bindable_prop_vars.contains(var) { ... }`).
//!
//! Only **bindable** props get this wrap — non-bindable props
//! (kind === 'prop') just get read transforms applied elsewhere.
//! The text version's `if !non_bindable_prop_vars.contains(var)`
//! guard becomes a single early-return in the visitor.
//!
//! Mappings (preserved exactly):
//!
//! | Source                | Replacement                                |
//! |-----------------------|--------------------------------------------|
//! | `prop.foo = x`        | `prop(prop().foo = x, true)`               |
//! | `prop().foo = x`      | `prop(prop().foo = x, true)` (idempotent)  |
//! | `prop.a.b = x`        | `prop(prop().a.b = x, true)`               |
//! | `prop[i] = x`         | `prop(prop()[i] = x, true)`                |
//! | `prop.foo += x`       | `prop(prop().foo += x, true)`              |
//! | `prop.foo ??= x`      | `prop(prop().foo ??= x, true)`             |
//!
//! Both `prop.foo` (bare Identifier root) and `prop().foo`
//! (CallExpression root with no args) collapse to the same output.
//!
//! What the AST drops on the floor:
//!
//! - The text version's hand-rolled string-literal / template
//!   state tracker, depth scanner, and operator detector
//!   (~250 lines).
//! - The `!= == != => <= >=` exclusions — `AssignmentExpression`
//!   only matches `=`-family operators.
//! - The `prop({rest}().` already-wrapped check — once wrapped,
//!   the LHS root is the outer CallExpression call's first arg,
//!   not a bare `prop` identifier or `prop()` call — wait, it
//!   actually IS still a CallExpression with callee=prop. The
//!   "Skip if already wrapped" comes via fixed-point exhaustion:
//!   after wrap, the outer `prop(...)` is a CallExpression, not
//!   an AssignmentExpression — its inner argument IS still an
//!   AssignmentExpression that matches, but the LHS member's
//!   root is `prop()` (the inner `prop()` we just generated).
//!   That `prop()` is still recognized as a prop-rooted root, so
//!   it WOULD re-wrap. We avoid that by checking whether the
//!   AssignmentExpression's parent is `prop(<assignment>, true)`
//!   — i.e. the immediate enclosing CallExpression has callee
//!   = same prop identifier and the assignment is the first arg
//!   with `true` as the second arg.
//!
//! Fixed-point still applies for genuinely nested assignments
//! across different props.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::SourceType;
use oxc_span::Span;
use rustc_hash::FxHashSet;

use super::ast_rewrite::{self, Edit};
use super::scope_analysis::{is_locally_shadowed, shadowed_reference_starts};

thread_local! {
    static MODULE_PROP_MEMBER_MUTATE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `prop.foo = x` / `prop().foo = x` etc. for
/// bindable prop variables (skipping `non_bindable_prop_vars`).
/// Returns `None` when there's nothing to rewrite or the source
/// fails to parse.
pub fn transform_prop_member_mutate_ast(
    source: &str,
    prop_vars: &[String],
    non_bindable_prop_vars: &[String],
    prop_invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> Option<String> {
    let spliced = || {
        transform_prop_member_mutate_spliced(
            source,
            prop_vars,
            non_bindable_prop_vars,
            prop_invalidate_bodies,
        )
    };
    ast_rewrite::dual_run::resolve("prop_member_mutate_ast:inplace", source, spliced, || {
        transform_prop_member_mutate_in_place(
            source,
            prop_vars,
            non_bindable_prop_vars,
            prop_invalidate_bodies,
        )
    })
}

fn transform_prop_member_mutate_spliced(
    source: &str,
    prop_vars: &[String],
    non_bindable_prop_vars: &[String],
    prop_invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> Option<String> {
    if prop_vars.is_empty() {
        return None;
    }
    if memchr::memchr(b'=', source.as_bytes()).is_none()
        && memchr::memmem::find(source.as_bytes(), b"++").is_none()
        && memchr::memmem::find(source.as_bytes(), b"--").is_none()
    {
        return None;
    }
    if !prop_vars
        .iter()
        .filter(|p| !non_bindable_prop_vars.iter().any(|nb| nb == *p))
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return None;
    }

    ast_rewrite::fixed_point(source, |src| {
        ast_rewrite::rewrite_once(
            &MODULE_PROP_MEMBER_MUTATE_ALLOC,
            src,
            SourceType::mjs(),
            ParseOptions::default(),
            true,
            |program| {
                let semantic_ret = SemanticBuilder::new().with_build_nodes(true).build(program);
                let mut collector = PropMemberMutateCollector {
                    source: src,
                    prop_vars,
                    non_bindable_prop_vars,
                    prop_invalidate_bodies,
                    semantic: &semantic_ret.semantic,
                    replacements: Vec::new(),
                    skip_assignment_spans: Vec::new(),
                    skip_update_spans: Vec::new(),
                };
                collector.visit_program(program);
                collector.replacements
            },
        )
    })
}

#[derive(Clone, Copy)]
enum Root {
    /// `prop.x = ...` — root is bare Identifier `prop`
    Direct(Span),
    /// `prop().x = ...` — root is CallExpression `prop()` with the
    /// callee Identifier. The `Span` is the full `prop()` span so
    /// we can replace it cleanly with the regenerated `prop()`.
    Call(Span),
}

impl Root {
    fn span(self) -> Span {
        match self {
            Root::Direct(s) | Root::Call(s) => s,
        }
    }
}

struct PropMemberMutateCollector<'a, 'sem> {
    source: &'a str,
    prop_vars: &'a [String],
    non_bindable_prop_vars: &'a [String],
    /// Prop name → precomputed `$.invalidate_inner_signals` body (read forms of
    /// the prop's `legacy_indirect_bindings`). Empty unless the prop backs a
    /// legacy `<select bind:value>` referencing other variables.
    prop_invalidate_bodies: &'a rustc_hash::FxHashMap<String, String>,
    /// Upstream resolves the mutation target through `scope.get`, so a local
    /// binding shadowing the prop is not a prop write.
    semantic: &'sem Semantic<'sem>,
    replacements: Vec<Edit>,
    /// Spans of `AssignmentExpression`s that are the first arg of a
    /// `prop(<assignment>, true)` wrap call. Skipping these is what
    /// makes the rewrite idempotent for the `prop().foo = x` case,
    /// where the inner assignment's LHS is already `prop()`-rooted.
    skip_assignment_spans: Vec<(u32, u32)>,
    /// Same, for `prop(<update>, true)` (`p(p().a++, true)`, #3048).
    skip_update_spans: Vec<(u32, u32)>,
}

impl<'a, 'sem> PropMemberMutateCollector<'a, 'sem> {
    /// Find the leftmost root of a member chain. Returns the
    /// identifier name and a [`Root`] tagged with the appropriate
    /// span. `None` if the root isn't a bare identifier or
    /// `name()`-style call on a bare identifier.
    fn walk_object_chain_to_root<'e, 'x>(
        expr: &'e Expression<'x>,
    ) -> Option<(&'e IdentifierReference<'x>, Root)> {
        let mut cur = expr;
        loop {
            match cur {
                Expression::Identifier(id) => {
                    return Some((id, Root::Direct(id.span)));
                }
                Expression::CallExpression(call) => {
                    if !call.arguments.is_empty() {
                        return None;
                    }
                    let Expression::Identifier(id) = &call.callee else {
                        return None;
                    };
                    return Some((id, Root::Call(call.span)));
                }
                Expression::StaticMemberExpression(m) => cur = &m.object,
                Expression::ComputedMemberExpression(m) => cur = &m.object,
                _ => return None,
            }
        }
    }

    fn root_of_assignment_target<'e, 'x>(
        target: &'e AssignmentTarget<'x>,
    ) -> Option<(&'e IdentifierReference<'x>, Root)> {
        let object = match target {
            AssignmentTarget::StaticMemberExpression(m) => &m.object,
            AssignmentTarget::ComputedMemberExpression(m) => &m.object,
            _ => return None,
        };
        Self::walk_object_chain_to_root(object)
    }
}

impl<'a, 'sem, 'ast> Visit<'ast> for PropMemberMutateCollector<'a, 'sem> {
    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        // Detect the wrap shape `prop(<assignment>, true)` we emit
        // for prop member mutations. If callee is a bare Identifier
        // matching one of our prop_vars (and bindable), arg[0] is an
        // AssignmentExpression, and arg[1] is `true`, mark arg[0] as
        // already-wrapped so visit_assignment_expression skips it.
        if call.arguments.len() == 2
            && let Expression::Identifier(callee_id) = &call.callee
            && self.prop_vars.iter().any(|p| p == callee_id.name.as_str())
            && !self
                .non_bindable_prop_vars
                .iter()
                .any(|nb| nb == callee_id.name.as_str())
            && let Argument::BooleanLiteral(b) = &call.arguments[1]
            && b.value
        {
            match &call.arguments[0] {
                Argument::AssignmentExpression(inner) => {
                    self.skip_assignment_spans
                        .push((inner.span.start, inner.span.end));
                }
                Argument::UpdateExpression(inner) => {
                    self.skip_update_spans
                        .push((inner.span.start, inner.span.end));
                }
                _ => {}
            }
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

        let Some((root_id, root)) = Self::root_of_assignment_target(&expr.left) else {
            return;
        };
        let root_name = root_id.name.as_str();
        if !self.prop_vars.iter().any(|p| p == root_name) {
            return;
        }
        if self.non_bindable_prop_vars.iter().any(|nb| nb == root_name) {
            return;
        }
        if is_locally_shadowed(self.semantic, root_id) {
            return;
        }

        let root_span = root.span();
        let outer_text = &self.source[expr.span.start as usize..expr.span.end as usize];

        // Extract "rest" — the member chain after the root, plus
        // the operator and RHS, all in source order. We slice from
        // the root's end through the assignment's end. That gives
        // `<rest_chain> <op> <rhs>` where `<rest_chain>` is the
        // post-root LHS member chain (`.foo[0].bar`, etc.) plus
        // whitespace, all as it appears in the source.
        let local_rest_start = (root_span.end - expr.span.start) as usize;
        let rest_and_assignment = &outer_text[local_rest_start..];

        // Build the wrapped mutation: `prop(prop()<rest_and_assignment>, true)`
        let mutation = format!(
            "{}({}(){}, true)",
            root_name, root_name, rest_and_assignment
        );

        // If the prop carries legacy indirect bindings (a `<select bind:value>`
        // referencing other variables), wrap the mutation in a sequence with
        // `$.invalidate_inner_signals(() => { … })` so those signals re-read.
        // Mirrors AssignmentExpression.js / the bind-directive setter path.
        let rewrite = match self.prop_invalidate_bodies.get(root_name) {
            Some(body) if !body.is_empty() => {
                format!(
                    "({}, $.invalidate_inner_signals(() => {{ {} }}))",
                    mutation, body
                )
            }
            _ => mutation,
        };

        self.replacements
            .push((expr.span.start, expr.span.end, rewrite));
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);

        if self
            .skip_update_spans
            .iter()
            .any(|(s, e)| *s == expr.span.start && *e == expr.span.end)
        {
            return;
        }

        let object = match &expr.argument {
            SimpleAssignmentTarget::StaticMemberExpression(m) => &m.object,
            SimpleAssignmentTarget::ComputedMemberExpression(m) => &m.object,
            _ => return,
        };
        let Some((root_id, root)) = Self::walk_object_chain_to_root(object) else {
            return;
        };
        let root_name = root_id.name.as_str();
        if is_locally_shadowed(self.semantic, root_id) {
            return;
        }
        if !self.prop_vars.iter().any(|p| p == root_name) {
            return;
        }
        if self.non_bindable_prop_vars.iter().any(|nb| nb == root_name) {
            return;
        }
        // Both root shapes wrap: `p.a++` from a runes script, `p().a++` after
        // the legacy prop-read rewrite. Our own wrap payload was skipped above.
        let root_span = root.span();

        // `p.a++` / `++p.a` → `p(p().a++, true)` / `p(++p().a, true)`: splice
        // `p()` over the root, keeping prefix/suffix text verbatim.
        let before = &self.source[expr.span.start as usize..root_span.start as usize];
        let after = &self.source[root_span.end as usize..expr.span.end as usize];
        let mutation = format!("{}({}{}(){}, true)", root_name, before, root_name, after);
        // `UpdateExpression.js` does not import `build_assignment`, so upstream
        // never grows the `$.invalidate_inner_signals` tail on a `++` / `--`.
        let rewrite = mutation;
        self.replacements
            .push((expr.span.start, expr.span.end, rewrite));
    }
}

// ── in-place port ──────────────────────────────────────────────────────

thread_local! {
    static MODULE_PROP_MEMBER_MUTATE_IN_PLACE_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// In-place equivalent of [`transform_prop_member_mutate_ast`].
pub(crate) fn transform_prop_member_mutate_in_place(
    source: &str,
    prop_vars: &[String],
    non_bindable_prop_vars: &[String],
    prop_invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> ast_rewrite::Rewrite {
    if prop_vars.is_empty() {
        return ast_rewrite::Rewrite::Unchanged;
    }
    if memchr::memchr(b'=', source.as_bytes()).is_none()
        && memchr::memmem::find(source.as_bytes(), b"++").is_none()
        && memchr::memmem::find(source.as_bytes(), b"--").is_none()
    {
        return ast_rewrite::Rewrite::Unchanged;
    }
    if !prop_vars
        .iter()
        .filter(|p| !non_bindable_prop_vars.iter().any(|nb| nb == *p))
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return ast_rewrite::Rewrite::Unchanged;
    }

    ast_rewrite::with_program_mut(
        &MODULE_PROP_MEMBER_MUTATE_IN_PLACE_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions::default(),
        |allocator, program| {
            // The shadowed positions are read off the untouched parse: the
            // rewrite below moves nodes, and `Semantic` borrows the program.
            let shadowed = {
                let built = SemanticBuilder::new().with_build_nodes(true).build(program);
                shadowed_reference_starts(program, &built.semantic, prop_vars)
            };
            let mut rewriter = PropMemberMutateRewriter {
                allocator,
                b: crate::compiler::phases::phase3_transform::builders::B::new(allocator),
                prop_vars,
                non_bindable_prop_vars,
                prop_invalidate_bodies,
                shadowed,
                skip_assignment_spans: Vec::new(),
                skip_update_spans: Vec::new(),
                changed: false,
            };
            oxc_ast_visit::VisitMut::visit_program(&mut rewriter, program);
            rewriter.changed
        },
    )
}

struct PropMemberMutateRewriter<'a, 'b> {
    allocator: &'a Allocator,
    b: crate::compiler::phases::phase3_transform::builders::B<'a>,
    prop_vars: &'b [String],
    non_bindable_prop_vars: &'b [String],
    prop_invalidate_bodies: &'b rustc_hash::FxHashMap<String, String>,
    shadowed: FxHashSet<u32>,
    skip_assignment_spans: Vec<(u32, u32)>,
    skip_update_spans: Vec<(u32, u32)>,
    changed: bool,
}

impl<'a> PropMemberMutateRewriter<'a, '_> {
    fn is_bindable_prop(&self, name: &str) -> bool {
        self.prop_vars.iter().any(|p| p == name)
            && !self.non_bindable_prop_vars.iter().any(|nb| nb == name)
    }

    /// The leftmost `prop` / `prop()` of a member chain — the only part of a
    /// mutation target that reads the prop itself.
    fn chain_root<'e>(expr: &'e mut Expression<'a>) -> Option<&'e mut Expression<'a>> {
        let mut cur = expr;
        loop {
            if matches!(
                cur,
                Expression::Identifier(_) | Expression::CallExpression(_)
            ) {
                return Some(cur);
            }
            cur = match cur {
                Expression::StaticMemberExpression(m) => &mut m.object,
                Expression::ComputedMemberExpression(m) => &mut m.object,
                _ => return None,
            };
        }
    }

    fn target_root<'e>(target: &'e mut AssignmentTarget<'a>) -> Option<&'e mut Expression<'a>> {
        match target {
            AssignmentTarget::StaticMemberExpression(m) => Self::chain_root(&mut m.object),
            AssignmentTarget::ComputedMemberExpression(m) => Self::chain_root(&mut m.object),
            _ => None,
        }
    }

    fn root_prop_name<'e>(root: &'e Expression<'a>) -> Option<&'e str> {
        match root {
            Expression::Identifier(id) => Some(id.name.as_str()),
            Expression::CallExpression(call) if call.arguments.is_empty() => match &call.callee {
                Expression::Identifier(id) => Some(id.name.as_str()),
                _ => None,
            },
            _ => None,
        }
    }

    fn root_is_shadowed(&self, root: &Expression<'a>) -> bool {
        let start = match root {
            Expression::Identifier(id) => id.span.start,
            Expression::CallExpression(call) => match &call.callee {
                Expression::Identifier(id) => id.span.start,
                _ => return false,
            },
            _ => return false,
        };
        self.shadowed.contains(&start)
    }

    /// `$.invalidate_inner_signals(() => { … })` for a prop carrying legacy
    /// indirect bindings. The body is generated read forms, so it is parsed
    /// into the same arena and its statements moved into the thunk.
    fn invalidate_call(&self, prop: &str) -> Option<Expression<'a>> {
        let body = self.prop_invalidate_bodies.get(prop)?;
        if body.is_empty() {
            return None;
        }
        let owned = self.allocator.alloc_str(body);
        ast_rewrite::dual_run::count_parse(ast_rewrite::dual_run::current_or(file!()), owned.len());
        let ret = oxc_parser::Parser::new(self.allocator, owned, SourceType::mjs()).parse();
        if !ret.diagnostics.is_empty() {
            return None;
        }
        let stmts: Vec<_> = ret.program.body.into_iter().collect();
        let mut call = self.b.call(
            "$.invalidate_inner_signals",
            vec![self.b.thunk_block(stmts, false)],
        );
        ast_rewrite::mark_synthesized_expression(&mut call);
        Some(call)
    }
}

impl<'a> oxc_ast_visit::VisitMut<'a> for PropMemberMutateRewriter<'a, '_> {
    fn visit_call_expression(&mut self, call: &mut CallExpression<'a>) {
        // Recorded pre-order so the walk reaches the inner assignment already
        // knowing it is the payload of a wrap this pass emitted.
        if call.arguments.len() == 2
            && let Expression::Identifier(callee_id) = &call.callee
            && self.is_bindable_prop(callee_id.name.as_str())
            && let Argument::BooleanLiteral(lit) = &call.arguments[1]
            && lit.value
        {
            match &call.arguments[0] {
                Argument::AssignmentExpression(inner) => {
                    self.skip_assignment_spans
                        .push((inner.span.start, inner.span.end));
                }
                Argument::UpdateExpression(inner) => {
                    self.skip_update_spans
                        .push((inner.span.start, inner.span.end));
                }
                _ => {}
            }
        }

        oxc_ast_visit::walk_mut::walk_call_expression(self, call);
    }

    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        oxc_ast_visit::walk_mut::walk_expression(self, expr);

        if let Expression::UpdateExpression(update) = expr {
            let span = update.span;
            if self
                .skip_update_spans
                .iter()
                .any(|(s, e)| *s == span.start && *e == span.end)
            {
                return;
            }
            let root = match &mut update.argument {
                SimpleAssignmentTarget::StaticMemberExpression(m) => {
                    Self::chain_root(&mut m.object)
                }
                SimpleAssignmentTarget::ComputedMemberExpression(m) => {
                    Self::chain_root(&mut m.object)
                }
                _ => None,
            };
            let Some(root) = root else {
                return;
            };
            if self.root_is_shadowed(root) {
                return;
            }
            let Some(prop) = Self::root_prop_name(root) else {
                return;
            };
            let prop = prop.to_string();
            if !self.is_bindable_prop(&prop) {
                return;
            }
            if matches!(root, Expression::Identifier(_)) {
                *root = self.b.call(prop.as_str(), vec![]);
            }
            let mutation = std::mem::replace(expr, self.b.void0());
            let wrapped = self
                .b
                .call(prop.as_str(), vec![mutation, self.b.bool(true)]);
            // `UpdateExpression.js` does not import `build_assignment`, so upstream
            // never grows the `$.invalidate_inner_signals` tail on a `++` / `--`.
            *expr = wrapped;
            self.changed = true;
            return;
        }

        let Expression::AssignmentExpression(assign) = expr else {
            return;
        };
        let span = assign.span;
        if self
            .skip_assignment_spans
            .iter()
            .any(|(s, e)| *s == span.start && *e == span.end)
        {
            return;
        }
        let Some(root) = Self::target_root(&mut assign.left) else {
            return;
        };
        if self.root_is_shadowed(root) {
            return;
        }
        let Some(prop) = Self::root_prop_name(root) else {
            return;
        };
        let prop = prop.to_string();
        if !self.is_bindable_prop(&prop) {
            return;
        }
        if matches!(root, Expression::Identifier(_)) {
            *root = self.b.call(prop.as_str(), vec![]);
        }

        let mutation = std::mem::replace(expr, self.b.void0());
        let wrapped = self
            .b
            .call(prop.as_str(), vec![mutation, self.b.bool(true)]);
        *expr = match self.invalidate_call(&prop) {
            Some(invalidate) => self.b.sequence(vec![wrapped, invalidate]),
            None => wrapped,
        };
        self.changed = true;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    /// Empty `prop_invalidate_bodies` map for tests that don't exercise the
    /// `$.invalidate_inner_signals` wrapping.
    fn nm() -> rustc_hash::FxHashMap<String, String> {
        rustc_hash::FxHashMap::default()
    }

    #[test]
    fn wraps_mutation_with_invalidate_inner_signals() {
        let mut map = nm();
        map.insert("field".to_string(), "a; b();".to_string());
        let out =
            transform_prop_member_mutate_ast("field.x = {};", &ssv(&["field"]), &[], &map).unwrap();
        assert_eq!(
            out,
            "(\n\tfield(field().x = {}, true),\n\t$.invalidate_inner_signals(() => {\n\t\ta;\n\t\tb();\n\t})\n);"
        );
    }

    #[test]
    fn no_invalidate_wrap_when_prop_absent_from_map() {
        let mut map = nm();
        map.insert("other".to_string(), "a;".to_string());
        let out =
            transform_prop_member_mutate_ast("field.x = {};", &ssv(&["field"]), &[], &map).unwrap();
        assert_eq!(out, "field(field().x = {}, true);");
    }

    /// Upstream resolves the target through `scope.get`, so a nested binding of
    /// the same name is not the prop. Values are the shapes two corpus
    /// components use: a `for…of` binding and a destructured arrow parameter.
    #[test]
    fn a_local_binding_shadowing_the_prop_is_not_a_prop_write() {
        for input in [
            "function f(xs) { for (const prop of xs) { prop.foo = 5; } }",
            "const g = ({ prop }) => { prop.foo = 5; };",
            "function f(prop) { prop.foo++; }",
        ] {
            assert_eq!(
                transform_prop_member_mutate_ast(input, &ssv(&["prop"]), &[], &nm()),
                None,
                "{input}"
            );
        }
    }

    /// The control: the same write from an unshadowed position still wraps.
    #[test]
    fn an_unshadowed_prop_member_write_still_wraps() {
        let out = transform_prop_member_mutate_ast(
            "function f() { prop.foo = 5; }",
            &ssv(&["prop"]),
            &[],
            &nm(),
        )
        .unwrap();
        assert!(out.contains("prop(prop().foo = 5, true)"), "{out}");
    }

    #[test]
    fn static_member_assignment() {
        let out =
            transform_prop_member_mutate_ast("prop.foo = 5;", &ssv(&["prop"]), &[], &nm()).unwrap();
        assert_eq!(out, "prop(prop().foo = 5, true);");
    }

    #[test]
    fn call_then_static_member_assignment_is_idempotent_shape() {
        let out = transform_prop_member_mutate_ast("prop().foo = 5;", &ssv(&["prop"]), &[], &nm())
            .unwrap();
        assert_eq!(out, "prop(prop().foo = 5, true);");
    }

    #[test]
    fn computed_member_assignment() {
        let out =
            transform_prop_member_mutate_ast("prop[0] = 5;", &ssv(&["prop"]), &[], &nm()).unwrap();
        assert_eq!(out, "prop(prop()[0] = 5, true);");
    }

    #[test]
    fn compound_addition() {
        let out = transform_prop_member_mutate_ast("prop.foo += 3;", &ssv(&["prop"]), &[], &nm())
            .unwrap();
        assert_eq!(out, "prop(prop().foo += 3, true);");
    }

    #[test]
    fn compound_nullish() {
        let out = transform_prop_member_mutate_ast("prop.foo ??= 5;", &ssv(&["prop"]), &[], &nm())
            .unwrap();
        assert_eq!(out, "prop(prop().foo ??= 5, true);");
    }

    #[test]
    fn chained_member_chain() {
        let out = transform_prop_member_mutate_ast("prop.a.b.c = 5;", &ssv(&["prop"]), &[], &nm())
            .unwrap();
        assert_eq!(out, "prop(prop().a.b.c = 5, true);");
    }

    #[test]
    fn mixed_static_and_computed() {
        let out =
            transform_prop_member_mutate_ast("prop.items[0] = x;", &ssv(&["prop"]), &[], &nm())
                .unwrap();
        assert_eq!(out, "prop(prop().items[0] = x, true);");
    }

    #[test]
    fn non_bindable_prop_left_alone() {
        // prop is in prop_vars but flagged non-bindable → no rewrite
        assert!(
            transform_prop_member_mutate_ast(
                "prop.foo = 5;",
                &ssv(&["prop"]),
                &ssv(&["prop"]),
                &nm()
            )
            .is_none()
        );
    }

    #[test]
    fn non_prop_member_left_alone() {
        assert!(
            transform_prop_member_mutate_ast("obj.foo = 5;", &ssv(&["prop"]), &[], &nm()).is_none()
        );
    }

    #[test]
    fn bare_prop_assignment_left_alone() {
        // `prop = 5` is handled by prop_assign_ast (PR #198)
        assert!(
            transform_prop_member_mutate_ast("prop = 5;", &ssv(&["prop"]), &[], &nm()).is_none()
        );
    }

    #[test]
    fn update_expression_is_wrapped() {
        let out =
            transform_prop_member_mutate_ast("prop.x++;", &ssv(&["prop"]), &[], &nm()).unwrap();
        assert_eq!(out, "prop(prop().x++, true);");
        let out =
            transform_prop_member_mutate_ast("--prop.x;", &ssv(&["prop"]), &[], &nm()).unwrap();
        assert_eq!(out, "prop(--prop().x, true);");
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "prop.foo = 5";"#;
        assert!(transform_prop_member_mutate_ast(src, &ssv(&["prop"]), &[], &nm()).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${prop.foo = 5}`;";
        let out = transform_prop_member_mutate_ast(src, &ssv(&["prop"]), &[], &nm()).unwrap();
        assert_eq!(out, "let s = `${prop(prop().foo = 5, true)}`;");
    }

    #[test]
    fn multiple_props_in_one_source() {
        let out =
            transform_prop_member_mutate_ast("a.x = 1; b.y = 2;", &ssv(&["a", "b"]), &[], &nm())
                .unwrap();
        assert_eq!(out, "a(a().x = 1, true);\nb(b().y = 2, true);");
    }

    #[test]
    fn arrow_function_rhs_not_misclassified_as_eq() {
        // The text version had to specifically skip `=>` (arrow). The
        // AST naturally separates `=` (AssignmentExpression) from `=>`
        // (ArrowFunctionExpression).
        let out = transform_prop_member_mutate_ast(
            "prop.cb = (x) => x + 1;",
            &ssv(&["prop"]),
            &[],
            &nm(),
        )
        .unwrap();
        assert_eq!(out, "prop(prop().cb = (x) => x + 1, true);");
    }

    #[test]
    fn function_call_on_member_is_not_a_mutation() {
        // `prop.foo()` is a CallExpression, not a mutation.
        assert!(
            transform_prop_member_mutate_ast("prop.foo();", &ssv(&["prop"]), &[], &nm()).is_none()
        );
    }

    #[test]
    fn empty_prop_vars_is_no_op() {
        assert!(transform_prop_member_mutate_ast("prop.foo = 5;", &[], &[], &nm()).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_prop_member_mutate_ast("prop.foo = (", &ssv(&["prop"]), &[], &nm()).is_none()
        );
    }

    #[test]
    fn no_op_without_equals() {
        assert!(
            transform_prop_member_mutate_ast("foo(prop);", &ssv(&["prop"]), &[], &nm()).is_none()
        );
    }

    #[test]
    fn already_wrapped_is_idempotent() {
        // Once wrapped, the visitor's CallExpression detection
        // recognises the `prop(<assignment>, true)` shape and skips
        // the inner AssignmentExpression — fixed-point exits cleanly.
        let already = "prop(prop().foo = 5, true);";
        assert!(transform_prop_member_mutate_ast(already, &ssv(&["prop"]), &[], &nm()).is_none());
    }

    #[test]
    fn double_application_is_stable() {
        // Apply to the same source twice; the second call should
        // be a no-op (returns None).
        let first =
            transform_prop_member_mutate_ast("prop.foo = 5;", &ssv(&["prop"]), &[], &nm()).unwrap();
        let second = transform_prop_member_mutate_ast(&first, &ssv(&["prop"]), &[], &nm());
        assert!(second.is_none(), "expected None, got: {:?}", second);
    }

    #[test]
    fn parenthesized_assignment_in_call_arg() {
        // mutation-correct-return-value fixture: `console.log((a.b = true));`
        // The inner assignment is wrapped in parens. Verify output
        // matches the text version exactly.
        let src = "console.log((a.b = true));";
        let out = transform_prop_member_mutate_ast(src, &ssv(&["a"]), &[], &nm()).unwrap();
        assert_eq!(out, "console.log(a(a().b = true, true));");
    }

    #[test]
    fn fast_path_all_props_non_bindable() {
        // If every prop_var is in non_bindable_prop_vars, the
        // fast-path probe bails before parsing.
        assert!(
            transform_prop_member_mutate_ast(
                "prop.foo = 5;",
                &ssv(&["prop", "other"]),
                &ssv(&["prop", "other"]),
                &nm()
            )
            .is_none()
        );
    }
}
