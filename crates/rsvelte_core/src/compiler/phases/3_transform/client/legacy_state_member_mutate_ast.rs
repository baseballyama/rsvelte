//! AST-based rewrite of legacy-mode state member-expression
//! assignments and updates.
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
//! | `obj.prop++`            | `$.mutate(obj, obj.prop++)`                  |
//! | `--obj[i]`              | `$.mutate(obj, --obj[i])`                    |
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
//! `$.mutate(var, <mutation>)` shape via `visit_call_expression`
//! and records the inner assignment/update span as "skip". On
//! subsequent passes, the corresponding visitor bails on that span.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::SourceType;
use oxc_span::Span;
use oxc_syntax::symbol::SymbolId;
use rustc_hash::FxHashSet;

use super::ast_rewrite::{self, Edit};
use super::scope_analysis::{find_state_var_symbols, is_state_var_reference_or_unresolved};

thread_local! {
    static MODULE_LEGACY_STATE_MEMBER_MUTATE_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

fn has_mutation_operator(source: &str) -> bool {
    let bytes = source.as_bytes();
    memchr::memchr(b'=', bytes).is_some()
        || memchr::memmem::find(bytes, b"++").is_some()
        || memchr::memmem::find(bytes, b"--").is_some()
}

/// AST-based rewrite of `obj.prop = rhs` / `obj[i]++` etc. for
/// legacy-mode state variables (skipping `non_reactive_state_vars`
/// and `raw_state_vars`). Returns `None` when there's nothing to
/// rewrite or the source fails to parse.
pub fn transform_legacy_state_member_mutate_ast(
    source: &str,
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    raw_state_vars: &[String],
    invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> Option<String> {
    let spliced = || {
        transform_legacy_state_member_mutate_spliced(
            source,
            state_vars,
            non_reactive_state_vars,
            raw_state_vars,
            invalidate_bodies,
        )
    };
    ast_rewrite::dual_run::resolve(
        "legacy_state_member_mutate_ast:inplace",
        source,
        spliced,
        || {
            transform_legacy_state_member_mutate_in_place(
                source,
                state_vars,
                non_reactive_state_vars,
                raw_state_vars,
                invalidate_bodies,
            )
        },
    )
}

fn transform_legacy_state_member_mutate_spliced(
    source: &str,
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    raw_state_vars: &[String],
    invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> Option<String> {
    if state_vars.is_empty() {
        return None;
    }
    if !has_mutation_operator(source) {
        return None;
    }
    if !state_vars
        .iter()
        .filter(|v| !non_reactive_state_vars.iter().any(|nr| nr == *v))
        .filter(|v| !raw_state_vars.iter().any(|r| r == *v))
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return None;
    }

    ast_rewrite::fixed_point(source, |src| {
        ast_rewrite::rewrite_once(
            &MODULE_LEGACY_STATE_MEMBER_MUTATE_ALLOC,
            src,
            SourceType::mjs(),
            ParseOptions::default(),
            true,
            |program| {
                let semantic_ret = super::super::profile::semantic_build(
                    super::super::profile::SEM_LEGACY_STATE_MEMBER_MUTATE,
                    program.source_text.len(),
                    || SemanticBuilder::new().with_build_nodes(true).build(program),
                );
                let semantic = &semantic_ret.semantic;
                let mut collector = LegacyStateMemberMutateCollector {
                    source: src,
                    state_vars,
                    non_reactive_state_vars,
                    raw_state_vars,
                    invalidate_bodies,
                    semantic,
                    state_var_symbols: find_state_var_symbols(semantic, state_vars),
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

struct LegacyStateMemberMutateCollector<'a, 'sem> {
    source: &'a str,
    state_vars: &'a [String],
    non_reactive_state_vars: &'a [String],
    raw_state_vars: &'a [String],
    invalidate_bodies: &'a rustc_hash::FxHashMap<String, String>,
    semantic: &'sem Semantic<'sem>,
    state_var_symbols: FxHashSet<SymbolId>,
    replacements: Vec<Edit>,
    /// Spans of `AssignmentExpression`s that are the second arg of a
    /// `$.mutate(var, <assignment>)` wrap call. Skipping these is what
    /// makes the rewrite idempotent.
    skip_assignment_spans: Vec<(u32, u32)>,
    /// Spans of `UpdateExpression`s that are already wrapped by `$.mutate`.
    skip_update_spans: Vec<(u32, u32)>,
}

impl LegacyStateMemberMutateCollector<'_, '_> {
    /// Walk the `object` chain of a member expression down to the
    /// leftmost identifier.
    fn walk_object_chain_to_root<'e, 'ast>(
        expr: &'e Expression<'ast>,
    ) -> Option<&'e IdentifierReference<'ast>> {
        let mut cur = expr;
        loop {
            match cur {
                Expression::Identifier(id) => return Some(id),
                Expression::StaticMemberExpression(m) => cur = &m.object,
                Expression::ComputedMemberExpression(m) => cur = &m.object,
                _ => return None,
            }
        }
    }

    fn root_of_assignment_target<'e, 'ast>(
        target: &'e AssignmentTarget<'ast>,
    ) -> Option<&'e IdentifierReference<'ast>> {
        let object = match target {
            AssignmentTarget::StaticMemberExpression(m) => &m.object,
            AssignmentTarget::ComputedMemberExpression(m) => &m.object,
            _ => return None,
        };
        Self::walk_object_chain_to_root(object)
    }

    fn root_of_simple_target<'e, 'ast>(
        target: &'e SimpleAssignmentTarget<'ast>,
    ) -> Option<&'e IdentifierReference<'ast>> {
        let object = match target {
            SimpleAssignmentTarget::StaticMemberExpression(m) => &m.object,
            SimpleAssignmentTarget::ComputedMemberExpression(m) => &m.object,
            _ => return None,
        };
        Self::walk_object_chain_to_root(object)
    }

    fn is_eligible(&self, name: &str) -> bool {
        self.state_vars.iter().any(|s| s == name)
            && !self.non_reactive_state_vars.iter().any(|nr| nr == name)
            && !self.raw_state_vars.iter().any(|r| r == name)
    }

    fn is_state_reference(&self, ident: &IdentifierReference<'_>) -> bool {
        is_state_var_reference_or_unresolved(
            self.semantic,
            ident,
            &self.state_var_symbols,
            self.state_vars,
        )
    }
}

impl<'ast> Visit<'ast> for LegacyStateMemberMutateCollector<'_, '_> {
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
        {
            match &call.arguments[1] {
                Argument::AssignmentExpression(inner) => self
                    .skip_assignment_spans
                    .push((inner.span.start, inner.span.end)),
                Argument::UpdateExpression(inner) => self
                    .skip_update_spans
                    .push((inner.span.start, inner.span.end)),
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

        let Some(root) = Self::root_of_assignment_target(&expr.left) else {
            return;
        };
        let root_name = root.name.as_str();
        if !self.is_eligible(root_name) {
            return;
        }
        if !self.is_state_reference(root) {
            return;
        }

        // Output uses the original assignment text verbatim, just
        // enclosed in `$.mutate(var, ...)`.
        let outer_text = &self.source[expr.span.start as usize..expr.span.end as usize];
        let mutate = format!("$.mutate({}, {})", root_name, outer_text);
        // If the mutated state backs a legacy `<select bind:value={state…}>`
        // referencing other scope variables, wrap in a sequence with
        // `$.invalidate_inner_signals(() => { … })` so those signals re-read.
        // Mirrors the prop-member-mutation path (`prop_member_mutate_ast`).
        let rewrite = match self.invalidate_bodies.get(root_name) {
            Some(body) if !body.is_empty() => {
                format!(
                    "({}, $.invalidate_inner_signals(() => {{ {} }}))",
                    mutate, body
                )
            }
            _ => mutate,
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

        let Some(root) = Self::root_of_simple_target(&expr.argument) else {
            return;
        };
        let root_name = root.name.as_str();
        if !self.is_eligible(root_name) || !self.is_state_reference(root) {
            return;
        }

        let outer_text = &self.source[expr.span.start as usize..expr.span.end as usize];
        let mutate = format!("$.mutate({}, {})", root_name, outer_text);
        let rewrite = match self.invalidate_bodies.get(root_name) {
            Some(body) if !body.is_empty() => {
                format!(
                    "({}, $.invalidate_inner_signals(() => {{ {} }}))",
                    mutate, body
                )
            }
            _ => mutate,
        };
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

    fn eb() -> rustc_hash::FxHashMap<String, String> {
        rustc_hash::FxHashMap::default()
    }

    #[test]
    fn static_member_assignment() {
        let out = transform_legacy_state_member_mutate_ast(
            "obj.prop = 5;",
            &ssv(&["obj"]),
            &[],
            &[],
            &eb(),
        )
        .unwrap();
        assert_eq!(out, "$.mutate(obj, obj.prop = 5);");
    }

    #[test]
    fn computed_member_assignment() {
        let out = transform_legacy_state_member_mutate_ast(
            "obj[0] = 5;",
            &ssv(&["obj"]),
            &[],
            &[],
            &eb(),
        )
        .unwrap();
        assert_eq!(out, "$.mutate(obj, obj[0] = 5);");
    }

    #[test]
    fn compound_assignment_on_member() {
        let out = transform_legacy_state_member_mutate_ast(
            "obj.prop += 3;",
            &ssv(&["obj"]),
            &[],
            &[],
            &eb(),
        )
        .unwrap();
        assert_eq!(out, "$.mutate(obj, obj.prop += 3);");
    }

    #[test]
    fn chained_member_chain() {
        let out = transform_legacy_state_member_mutate_ast(
            "obj.a.b.c = 5;",
            &ssv(&["obj"]),
            &[],
            &[],
            &eb(),
        )
        .unwrap();
        assert_eq!(out, "$.mutate(obj, obj.a.b.c = 5);");
    }

    #[test]
    fn mixed_static_and_computed() {
        let out = transform_legacy_state_member_mutate_ast(
            "obj.items[0] = x;",
            &ssv(&["obj"]),
            &[],
            &[],
            &eb(),
        )
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
                &[],
                &eb()
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
                &ssv(&["obj"]),
                &eb()
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
            transform_legacy_state_member_mutate_ast(already, &ssv(&["obj"]), &[], &[], &eb())
                .is_none()
        );
    }

    #[test]
    fn double_application_is_stable() {
        let first = transform_legacy_state_member_mutate_ast(
            "obj.prop = 5;",
            &ssv(&["obj"]),
            &[],
            &[],
            &eb(),
        )
        .unwrap();
        let second =
            transform_legacy_state_member_mutate_ast(&first, &ssv(&["obj"]), &[], &[], &eb());
        assert!(second.is_none(), "expected None, got: {:?}", second);
    }

    #[test]
    fn leaves_non_state_member_alone() {
        assert!(
            transform_legacy_state_member_mutate_ast(
                "other.prop = 5;",
                &ssv(&["obj"]),
                &[],
                &[],
                &eb()
            )
            .is_none()
        );
    }

    #[test]
    fn leaves_bare_state_assignment_alone() {
        // `obj = 5` is handled by other passes.
        assert!(
            transform_legacy_state_member_mutate_ast("obj = 5;", &ssv(&["obj"]), &[], &[], &eb())
                .is_none()
        );
    }

    #[test]
    fn wraps_postfix_computed_update() {
        let out = transform_legacy_state_member_mutate_ast(
            "obj[value]++;",
            &ssv(&["obj"]),
            &[],
            &[],
            &eb(),
        )
        .unwrap();
        assert_eq!(out, "$.mutate(obj, obj[value]++);");
    }

    #[test]
    fn wraps_prefix_static_update() {
        let out = transform_legacy_state_member_mutate_ast(
            "--obj.count;",
            &ssv(&["obj"]),
            &[],
            &[],
            &eb(),
        )
        .unwrap();
        assert_eq!(out, "$.mutate(obj, --obj.count);");
    }

    #[test]
    fn wrapped_update_is_idempotent() {
        let already = "$.mutate(obj, obj.count++);";
        assert!(
            transform_legacy_state_member_mutate_ast(already, &ssv(&["obj"]), &[], &[], &eb())
                .is_none()
        );
    }

    #[test]
    fn skips_local_update_but_rewrites_captured_state() {
        let src = "function local(obj) { obj.count++; } function captured() { obj.count++; }";
        let out =
            transform_legacy_state_member_mutate_ast(src, &ssv(&["obj"]), &[], &[], &eb()).unwrap();
        assert_eq!(
            out,
            "function local(obj) {\n\tobj.count++;\n}\n\nfunction captured() {\n\t$.mutate(obj, obj.count++);\n}"
        );
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "obj.prop = 5";"#;
        assert!(
            transform_legacy_state_member_mutate_ast(src, &ssv(&["obj"]), &[], &[], &eb())
                .is_none()
        );
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${obj.prop = 5}`;";
        let out =
            transform_legacy_state_member_mutate_ast(src, &ssv(&["obj"]), &[], &[], &eb()).unwrap();
        assert_eq!(out, "let s = `${$.mutate(obj, obj.prop = 5)}`;");
    }

    #[test]
    fn multiple_states_in_one_source() {
        let out = transform_legacy_state_member_mutate_ast(
            "a.x = 1; b.y = 2;",
            &ssv(&["a", "b"]),
            &[],
            &[],
            &eb(),
        )
        .unwrap();
        assert_eq!(out, "$.mutate(a, a.x = 1);\n$.mutate(b, b.y = 2);");
    }

    #[test]
    fn function_call_on_member_is_not_a_mutation() {
        assert!(
            transform_legacy_state_member_mutate_ast("obj.foo();", &ssv(&["obj"]), &[], &[], &eb())
                .is_none()
        );
    }

    #[test]
    fn empty_state_vars_is_no_op() {
        assert!(
            transform_legacy_state_member_mutate_ast("obj.prop = 5;", &[], &[], &[], &eb())
                .is_none()
        );
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_legacy_state_member_mutate_ast(
                "obj.prop = (",
                &ssv(&["obj"]),
                &[],
                &[],
                &eb()
            )
            .is_none()
        );
    }

    #[test]
    fn no_op_without_state_name() {
        assert!(
            transform_legacy_state_member_mutate_ast("let x = 1;", &ssv(&["obj"]), &[], &[], &eb())
                .is_none()
        );
    }

    #[test]
    fn skips_function_local_shadow() {
        let src = "function fit() { const obj = { prop: 0 }; obj.prop = 5; return obj; }";
        assert!(
            transform_legacy_state_member_mutate_ast(src, &ssv(&["obj"]), &[], &[], &eb())
                .is_none()
        );
    }

    #[test]
    fn skips_parameter_shadow_but_rewrites_captured_state() {
        let src = "function local(obj) { obj.prop = 1; } function captured() { obj.prop = 2; }";
        let out =
            transform_legacy_state_member_mutate_ast(src, &ssv(&["obj"]), &[], &[], &eb()).unwrap();
        assert_eq!(
            out,
            "function local(obj) {\n\tobj.prop = 1;\n}\n\nfunction captured() {\n\t$.mutate(obj, obj.prop = 2);\n}"
        );
    }
}

// ── in-place port ──────────────────────────────────────────────────────
//
// Same mapping, applied to the program instead of its text. The splice path
// above stays authoritative; this runs under `RSVELTE_AST_DUAL_RUN` so the two
// can be compared until the whole pipeline flips to a single parse.

thread_local! {
    static MODULE_LEGACY_STATE_MEMBER_MUTATE_IN_PLACE_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// In-place equivalent of [`transform_legacy_state_member_mutate_ast`].
pub(crate) fn transform_legacy_state_member_mutate_in_place(
    source: &str,
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    raw_state_vars: &[String],
    invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> ast_rewrite::Rewrite {
    if state_vars.is_empty() {
        return ast_rewrite::Rewrite::Unchanged;
    }
    if !has_mutation_operator(source) {
        return ast_rewrite::Rewrite::Unchanged;
    }
    if !state_vars
        .iter()
        .filter(|v| !non_reactive_state_vars.iter().any(|nr| nr == *v))
        .filter(|v| !raw_state_vars.iter().any(|r| r == *v))
        .any(|s| memchr::memmem::find(source.as_bytes(), s.as_bytes()).is_some())
    {
        return ast_rewrite::Rewrite::Unchanged;
    }

    ast_rewrite::with_program_mut(
        &MODULE_LEGACY_STATE_MEMBER_MUTATE_IN_PLACE_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions::default(),
        |allocator, program| {
            let targets = {
                let semantic_ret = super::super::profile::semantic_build(
                    super::super::profile::SEM_LEGACY_STATE_MEMBER_MUTATE_IN_PLACE,
                    program.source_text.len(),
                    || SemanticBuilder::new().with_build_nodes(true).build(program),
                );
                let semantic = &semantic_ret.semantic;
                let mut finder = LegacyStateMemberMutateFinder {
                    state_vars,
                    non_reactive_state_vars,
                    raw_state_vars,
                    semantic,
                    state_var_symbols: find_state_var_symbols(semantic, state_vars),
                    targets: Vec::new(),
                    skip_assignment_spans: Vec::new(),
                    skip_update_spans: Vec::new(),
                };
                finder.visit_program(program);
                finder.targets
            };
            if targets.is_empty() {
                return false;
            }
            let mut rewriter = LegacyStateMemberMutateRewriter {
                b: crate::compiler::phases::phase3_transform::builders::B::new(allocator),
                allocator,
                state_vars,
                non_reactive_state_vars,
                raw_state_vars,
                invalidate_bodies,
                targets,
                skip_assignment_spans: Vec::new(),
                skip_update_spans: Vec::new(),
                changed: false,
            };
            oxc_ast_visit::VisitMut::visit_program(&mut rewriter, program);
            rewriter.changed
        },
    )
}

struct LegacyStateMemberMutateRewriter<'a, 'b> {
    b: crate::compiler::phases::phase3_transform::builders::B<'a>,
    allocator: &'a oxc_allocator::Allocator,
    state_vars: &'b [String],
    non_reactive_state_vars: &'b [String],
    raw_state_vars: &'b [String],
    invalidate_bodies: &'b rustc_hash::FxHashMap<String, String>,
    targets: Vec<Span>,
    /// Assignments already enclosed in a `$.mutate(var, …)` wrap. Recorded on
    /// the way down so the assignment itself is left alone on the way up.
    skip_assignment_spans: Vec<Span>,
    skip_update_spans: Vec<Span>,
    changed: bool,
}

struct LegacyStateMemberMutateFinder<'a, 'sem> {
    state_vars: &'a [String],
    non_reactive_state_vars: &'a [String],
    raw_state_vars: &'a [String],
    semantic: &'sem Semantic<'sem>,
    state_var_symbols: FxHashSet<SymbolId>,
    targets: Vec<Span>,
    skip_assignment_spans: Vec<Span>,
    skip_update_spans: Vec<Span>,
}

impl LegacyStateMemberMutateFinder<'_, '_> {
    fn is_eligible(&self, name: &str) -> bool {
        self.state_vars.iter().any(|s| s == name)
            && !self.non_reactive_state_vars.iter().any(|nr| nr == name)
            && !self.raw_state_vars.iter().any(|r| r == name)
    }
}

impl<'ast> Visit<'ast> for LegacyStateMemberMutateFinder<'_, '_> {
    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        if call.arguments.len() == 2
            && let Expression::StaticMemberExpression(callee) = &call.callee
            && callee.property.name.as_str() == "mutate"
            && let Expression::Identifier(dollar) = &callee.object
            && dollar.name.as_str() == "$"
            && let Argument::Identifier(arg0) = &call.arguments[0]
            && self.is_eligible(arg0.name.as_str())
        {
            match &call.arguments[1] {
                Argument::AssignmentExpression(inner) => {
                    self.skip_assignment_spans.push(inner.span);
                }
                Argument::UpdateExpression(inner) => self.skip_update_spans.push(inner.span),
                _ => {}
            }
        }

        walk::walk_call_expression(self, call);
    }

    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        if self.skip_assignment_spans.contains(&expr.span) {
            return;
        }
        let Some(root) = LegacyStateMemberMutateCollector::root_of_assignment_target(&expr.left)
        else {
            return;
        };
        if !self.is_eligible(root.name.as_str())
            || !is_state_var_reference_or_unresolved(
                self.semantic,
                root,
                &self.state_var_symbols,
                self.state_vars,
            )
        {
            return;
        }
        self.targets.push(expr.span);
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);

        if self.skip_update_spans.contains(&expr.span) {
            return;
        }
        let Some(root) = LegacyStateMemberMutateCollector::root_of_simple_target(&expr.argument)
        else {
            return;
        };
        if !self.is_eligible(root.name.as_str())
            || !is_state_var_reference_or_unresolved(
                self.semantic,
                root,
                &self.state_var_symbols,
                self.state_vars,
            )
        {
            return;
        }
        self.targets.push(expr.span);
    }
}

impl<'a, 'b> LegacyStateMemberMutateRewriter<'a, 'b> {
    fn is_eligible(&self, name: &str) -> bool {
        self.state_vars.iter().any(|s| s == name)
            && !self.non_reactive_state_vars.iter().any(|nr| nr == name)
            && !self.raw_state_vars.iter().any(|r| r == name)
    }

    /// Record the inner assignment of a `$.mutate(var, <assignment>)` wrap.
    fn note_existing_wrap(&mut self, expr: &Expression<'a>) {
        if let Expression::CallExpression(call) = expr
            && call.arguments.len() == 2
            && let Expression::StaticMemberExpression(callee) = &call.callee
            && callee.property.name.as_str() == "mutate"
            && let Expression::Identifier(dollar) = &callee.object
            && dollar.name.as_str() == "$"
            && let Argument::Identifier(arg0) = &call.arguments[0]
            && self.is_eligible(arg0.name.as_str())
        {
            match &call.arguments[1] {
                Argument::AssignmentExpression(inner) => {
                    self.skip_assignment_spans.push(inner.span);
                }
                Argument::UpdateExpression(inner) => self.skip_update_spans.push(inner.span),
                _ => {}
            }
        }
    }

    /// `$.invalidate_inner_signals(() => { <body> })`, with `body` parsed into
    /// the program's own arena — it is caller-supplied source, not a subtree.
    fn invalidate_call(&self, body: &str) -> Option<Expression<'a>> {
        let owned = self.allocator.alloc_str(body);
        ast_rewrite::dual_run::count_parse(ast_rewrite::dual_run::current_or(file!()), owned.len());
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
}

impl<'a, 'b> oxc_ast_visit::VisitMut<'a> for LegacyStateMemberMutateRewriter<'a, 'b> {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        self.note_existing_wrap(expr);
        // Children first: an inner assignment is rewritten before the parent
        // that encloses it, which is what the splice path's `innermost_only`
        // plus fixed-point loop was reaching for.
        oxc_ast_visit::walk_mut::walk_expression(self, expr);

        if let Expression::UpdateExpression(update) = &*expr {
            if self.skip_update_spans.contains(&update.span) || !self.targets.contains(&update.span)
            {
                return;
            }
            let Some(root) =
                LegacyStateMemberMutateCollector::root_of_simple_target(&update.argument)
            else {
                return;
            };
            let root = root.name.as_str();
            if !self.is_eligible(root) {
                return;
            }
            let root = root.to_string();
            let taken = std::mem::replace(expr, self.b.void0());
            let mutate = self.b.call("$.mutate", vec![self.b.id(&root), taken]);
            *expr = match self.invalidate_bodies.get(&root) {
                Some(body) if !body.is_empty() => match self.invalidate_call(body) {
                    Some(invalidate) => self.b.sequence(vec![mutate, invalidate]),
                    None => mutate,
                },
                _ => mutate,
            };
            self.changed = true;
            return;
        }

        let Expression::AssignmentExpression(assign) = &*expr else {
            return;
        };
        if self.skip_assignment_spans.contains(&assign.span) {
            return;
        }
        if !self.targets.contains(&assign.span) {
            return;
        }
        let Some(root) = LegacyStateMemberMutateCollector::root_of_assignment_target(&assign.left)
        else {
            return;
        };
        let root = root.name.as_str();
        if !self.is_eligible(root) {
            return;
        }
        let root = root.to_string();

        let taken = std::mem::replace(expr, self.b.void0());
        let mutate = self.b.call("$.mutate", vec![self.b.id(&root), taken]);
        *expr = match self.invalidate_bodies.get(&root) {
            Some(body) if !body.is_empty() => match self.invalidate_call(body) {
                Some(invalidate) => self.b.sequence(vec![mutate, invalidate]),
                None => mutate,
            },
            _ => mutate,
        };
        self.changed = true;
    }
}
