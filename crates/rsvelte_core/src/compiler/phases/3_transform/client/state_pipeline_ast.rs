//! Combined AST pipeline for state-var assignments + reads.
//!
//! Previously these were two separate AST passes:
//! `state_assigns_combined_ast` (which wraps `x = expr` /
//! `x += expr` / `x++` etc.) and `state_reads_ast` (which wraps
//! bare `x` reads with `$.get(x)`). Each did its own parse +
//! `SemanticBuilder` + visit. Run sequentially at the same call
//! site, that's two parse cycles per script.
//!
//! This module runs both in a single parse + `SemanticBuilder`
//! per fixed-point iteration. The visitor walks the AST once,
//! collecting BOTH read-wrap replacements (innermost first via
//! the walk order) AND assignment-wrap replacements. When an
//! assignment-wrap replacement subsumes inner read-wrap
//! replacements, the inner replacements are incorporated into
//! the wrap's RHS text and the inner spans are dropped from the
//! final list.
//!
//! ## Mapping (preserves both `state_assigns_combined_ast` and
//! `state_reads_ast` outputs exactly)
//!
//! | Source                  | Replacement                                            |
//! |-------------------------|--------------------------------------------------------|
//! | `count`                 | `$.get(count)` (read, unshadowed)                      |
//! | `count = 5`             | `$.set(count, 5)`                                      |
//! | `count = other_state`   | `$.set(count, $.get(other_state))`                     |
//! | `total += count`        | `$.set(total, $.get(total) + $.get(count))`            |
//! | `count++`               | `$.update(count)`                                      |
//! | `obj.count`             | unchanged (property side)                              |
//! | `{ count }`             | `{ count: $.get(count) }` (shorthand expand)           |
//! | `function f(count) { count = 1; count }` | unchanged (shadow)                  |
//!
//! Falls back to the input source when nothing matched or parse
//! fails — returns `None` so callers can keep the original
//! string.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::ParseOptions;
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::{GetSpan, SourceType};
use oxc_syntax::operator::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator, UpdateOperator,
};
use oxc_syntax::symbol::{SymbolFlags, SymbolId};

use crate::compiler::phases::phase3_transform::shared::js_scan::contains_identifier;
use rustc_hash::{FxHashMap, FxHashSet};

use super::ast_rewrite::{self, Edit};
use super::expression_utils::{
    expression_needs_proxy_with_scope, needs_compound_assignment_parens,
};
use super::scope_analysis::{find_state_var_symbols, is_state_var_reference_or_unresolved};

thread_local! {
    static STATE_PIPELINE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Run the combined assigns + reads pipeline on `source`. Returns
/// `Some(rewritten)` when any change was made, `None` otherwise.
pub fn transform_state_pipeline_ast(
    source: &str,
    state_vars: &[String],
    raw_state_vars: &[String],
    is_runes: bool,
    non_proxy_vars: &[String],
    non_reactive_vars: &[String],
) -> Option<String> {
    if state_vars.is_empty() {
        return None;
    }
    crate::compiler::phases::phase3_transform::profile::record_sp_call();
    if !state_vars.iter().any(|v| contains_identifier(source, v)) {
        crate::compiler::phases::phase3_transform::profile::record_sp_bail(state_vars.len() as u64);
        return None;
    }
    // Pre-filter: anything in non_reactive_vars is excluded from reads.
    let effective_read_names: Vec<String> = state_vars
        .iter()
        .filter(|v| !non_reactive_vars.iter().any(|n| n == *v))
        .cloned()
        .collect();
    if memchr::memchr(b'=', source.as_bytes()).is_none()
        && memchr::memmem::find(source.as_bytes(), b"++").is_none()
        && memchr::memmem::find(source.as_bytes(), b"--").is_none()
        && !effective_read_names
            .iter()
            .any(|v| contains_identifier(source, v))
    {
        return None;
    }

    let spliced = || {
        ast_rewrite::fixed_point(source, |src| {
            single_pass(
                src,
                state_vars,
                raw_state_vars,
                is_runes,
                non_proxy_vars,
                &effective_read_names,
            )
        })
    };

    ast_rewrite::dual_run::resolve("state_pipeline_ast:inplace", source, spliced, || {
        transform_state_pipeline_in_place(
            source,
            state_vars,
            raw_state_vars,
            is_runes,
            non_proxy_vars,
            &effective_read_names,
        )
    })
}

fn single_pass(
    source: &str,
    state_vars: &[String],
    raw_state_vars: &[String],
    is_runes: bool,
    non_proxy_vars: &[String],
    effective_read_names: &[String],
) -> Option<String> {
    ast_rewrite::with_program(
        &STATE_PIPELINE_ALLOC,
        source,
        SourceType::ts().with_module(true),
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        |program| {
            let semantic_ret = super::super::profile::semantic_build(
                super::super::profile::SEM_STATE_PIPELINE,
                program.source_text.len(),
                || SemanticBuilder::new().with_build_nodes(true).build(program),
            );
            let semantic = &semantic_ret.semantic;
            let state_var_symbols = find_state_var_symbols(semantic, state_vars);

            let mut visitor = PipelineVisitor {
                source,
                semantic,
                state_vars,
                raw_state_vars,
                is_runes,
                non_proxy_vars,
                effective_read_names,
                state_var_symbols,
                read_replacements: Vec::new(),
                assigns_replacements: Vec::new(),
                skip_spans: FxHashSet::default(),
                in_place: false,
                sites: Sites::default(),
            };
            visitor.visit_program(program);

            // Final replacements: assigns spans take precedence — reads
            // that fall within an assigns span have already been
            // incorporated into the assigns rewrite, drop them.
            let assigns = visitor.assigns_replacements;
            let reads: Vec<Edit> = visitor
                .read_replacements
                .into_iter()
                .filter(|(s, e, _)| {
                    !assigns
                        .iter()
                        .any(|(as_s, as_e, _)| *s >= *as_s && *e <= *as_e)
                })
                .collect();

            let all: Vec<Edit> = assigns.into_iter().chain(reads).collect();
            ast_rewrite::splice(source, all, true)
        },
    )
}

struct PipelineVisitor<'a, 'sem> {
    source: &'a str,
    semantic: &'sem Semantic<'sem>,
    state_vars: &'a [String],
    raw_state_vars: &'a [String],
    is_runes: bool,
    non_proxy_vars: &'a [String],
    effective_read_names: &'a [String],
    state_var_symbols: FxHashSet<SymbolId>,
    /// Reads-wrap replacements `(span_start, span_end, rewrite)`.
    /// Collected as the visitor walks; filtered post-walk to drop
    /// any that fall within an assigns span (those are
    /// incorporated into the assigns rewrite directly).
    read_replacements: Vec<Edit>,
    /// Assignment / update wraps.
    assigns_replacements: Vec<Edit>,
    /// Identifier spans claimed by a parent handler — used so the
    /// `visit_identifier_reference` bare-read path doesn't fire on
    /// LHS of assignments, update targets, first arg of $.set /
    /// $.update / $.update_pre / $.mutate, shorthand-property
    /// value position.
    skip_spans: FxHashSet<u32>,
    /// Whether this walk feeds the in-place rewriter rather than the
    /// splice pipeline. Gates both `sites` collection and the wider
    /// rhs fold, so the splice path stays byte-for-byte unchanged.
    in_place: bool,
    sites: Sites,
}

/// The rewrite sites the in-place pass needs, keyed by `(start, end)`
/// span. Operator, `prefix` and proxy-ness are re-read off the AST, so
/// only the decision itself crosses from the walk to the rewriter.
#[derive(Default)]
struct Sites {
    reads: FxHashSet<(u32, u32)>,
    safe_reads: FxHashSet<(u32, u32)>,
    shorthands: FxHashSet<(u32, u32)>,
    safe_shorthands: FxHashSet<(u32, u32)>,
    /// Assignment span -> (needs proxy, compound read needs `$.safe_get`).
    assigns: FxHashMap<(u32, u32), (bool, bool)>,
    updates: FxHashSet<(u32, u32)>,
}

impl Sites {
    fn is_empty(&self) -> bool {
        self.reads.is_empty()
            && self.shorthands.is_empty()
            && self.assigns.is_empty()
            && self.updates.is_empty()
    }
}

impl<'a, 'sem> PipelineVisitor<'a, 'sem> {
    fn is_read_target(&self, name: &str) -> bool {
        self.effective_read_names.iter().any(|s| s.as_str() == name)
    }

    fn is_state_var(&self, name: &str) -> bool {
        self.state_vars.iter().any(|s| s.as_str() == name)
    }

    fn is_state_var_ref(&self, ident: &IdentifierReference) -> bool {
        is_state_var_reference_or_unresolved(
            self.semantic,
            ident,
            &self.state_var_symbols,
            self.state_vars,
        )
    }

    /// `var` rune declarations are function-scoped and may be read before
    /// initialization. Resolve the reference's own symbol instead of reducing
    /// this decision to a name: a same-named `let`/`const` in another scope
    /// must continue to use `$.get`.
    fn reference_needs_safe_get(&self, ident: &IdentifierReference) -> bool {
        let Some(reference_id) = ident.reference_id.get() else {
            return false;
        };
        let scoping = self.semantic.scoping();
        let Some(symbol_id) = scoping.get_reference(reference_id).symbol_id() else {
            return false;
        };
        scoping
            .symbol_flags(symbol_id)
            .contains(SymbolFlags::FunctionScopedVariable)
    }

    fn getter_for_reference(&self, ident: &IdentifierReference) -> &'static str {
        if self.reference_needs_safe_get(ident) {
            "$.safe_get"
        } else {
            "$.get"
        }
    }

    fn skip(&mut self, ident: &IdentifierReference) {
        self.skip_spans.insert(ident.span.start);
    }

    /// Build the rhs text for an assignment wrap, applying any
    /// already-collected read replacements that fall within
    /// `rhs_span` to the original rhs slice.
    fn rhs_text_with_inner_reads(&self, rhs_span: oxc_span::Span) -> String {
        let rhs_start = rhs_span.start as usize;
        let rhs_end = rhs_span.end as usize;
        let original = &self.source[rhs_start..rhs_end];
        // Find inner read replacements (sorted right-to-left for
        // splicing).
        let mut inner: Vec<&(u32, u32, String)> = self
            .read_replacements
            .iter()
            .filter(|(s, e, _)| *s >= rhs_span.start && *e <= rhs_span.end)
            .collect();
        if inner.is_empty() {
            return original.to_string();
        }
        inner.sort_by_key(|r| std::cmp::Reverse(r.0));
        let mut out = original.to_string();
        for (s, e, rewrite) in &inner {
            let local_s = (*s as usize) - rhs_start;
            let local_e = (*e as usize) - rhs_start;
            out.replace_range(local_s..local_e, rewrite);
        }
        out
    }

    /// The rhs text as the splice pipeline would see it on its *last*
    /// fixed-point iteration: inner assignments and updates are already
    /// rewritten there, and `expression_needs_proxy_with_scope` reads
    /// that text. The in-place path runs once, so it folds them here.
    fn rhs_text_with_inner_edits(&self, rhs_span: oxc_span::Span) -> String {
        let rhs_start = rhs_span.start as usize;
        let original = &self.source[rhs_start..rhs_span.end as usize];
        let mut inner: Vec<&Edit> = self
            .read_replacements
            .iter()
            .chain(self.assigns_replacements.iter())
            .filter(|(s, e, _)| *s >= rhs_span.start && *e <= rhs_span.end)
            .collect();
        if inner.is_empty() {
            return original.to_string();
        }
        // Outermost-only: AST spans nest rather than partially overlap,
        // and an inner edit's text is already folded into the enclosing
        // one (children are pushed first).
        inner.sort_by_key(|(s, e, _)| (*s, std::cmp::Reverse(*e)));
        let mut kept: Vec<&Edit> = Vec::new();
        for edit in inner {
            if kept.last().is_some_and(|last| edit.1 <= last.1) {
                continue;
            }
            kept.push(edit);
        }
        kept.sort_by_key(|r| std::cmp::Reverse(r.0));
        let mut out = original.to_string();
        for (s, e, rewrite) in kept {
            out.replace_range(
                (*s as usize) - rhs_start..(*e as usize) - rhs_start,
                rewrite,
            );
        }
        out
    }
}

impl<'a, 'sem, 'ast> Visit<'ast> for PipelineVisitor<'a, 'sem> {
    fn visit_identifier_reference(&mut self, ident: &IdentifierReference<'ast>) {
        if self.skip_spans.contains(&ident.span.start) {
            return;
        }
        let name = ident.name.as_str();
        if !self.is_read_target(name) {
            return;
        }
        if !self.is_state_var_ref(ident) {
            return;
        }
        let getter = self.getter_for_reference(ident);
        self.read_replacements.push((
            ident.span.start,
            ident.span.end,
            format!("{}({})", getter, name),
        ));
        if self.in_place {
            self.sites.reads.insert((ident.span.start, ident.span.end));
            if getter == "$.safe_get" {
                self.sites
                    .safe_reads
                    .insert((ident.span.start, ident.span.end));
            }
        }
    }

    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        // Mark LHS of assignment so the bare-read branch doesn't
        // fire on it (mirrors `state_reads_ast`).
        if let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left {
            self.skip(id);
        }
        // Walk children FIRST so read replacements within RHS are
        // collected before we emit the assigns rewrite.
        walk::walk_assignment_expression(self, expr);

        // Assignment wrap (mirrors `state_assigns_combined_ast`).
        let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left else {
            return;
        };
        let name = id.name.as_str();
        if !self.is_state_var(name) {
            return;
        }
        let ident_ref: &IdentifierReference = id;
        if !self.is_state_var_ref(ident_ref) {
            return;
        }
        let safe_get = self.reference_needs_safe_get(ident_ref);

        let rhs_span = expr.right.span();
        let rhs_text = if self.in_place {
            self.rhs_text_with_inner_edits(rhs_span)
        } else {
            self.rhs_text_with_inner_reads(rhs_span)
        };

        match expr.operator {
            AssignmentOperator::Assign => {
                let is_raw_state = self.raw_state_vars.iter().any(|s| s.as_str() == name);
                // A bare-identifier RHS declared inside this statement resolves
                // per-site (upstream should_proxy consults the scope at the
                // assignment); the name-list fallback cannot distinguish two
                // same-named inner bindings with different proxy-ness.
                let site_decision = match expr.right.get_inner_expression() {
                    Expression::Identifier(rhs_id) => {
                        super::state_assigns_combined_ast::ident_rhs_needs_proxy(
                            self.semantic,
                            rhs_id,
                        )
                    }
                    _ => None,
                };
                let needs_proxy = self.is_runes
                    && !is_raw_state
                    && site_decision.unwrap_or_else(|| {
                        expression_needs_proxy_with_scope(rhs_text.trim(), self.non_proxy_vars)
                    });
                let rewrite = if needs_proxy {
                    format!("$.set({}, {}, true)", name, rhs_text)
                } else {
                    format!("$.set({}, {})", name, rhs_text)
                };
                self.assigns_replacements
                    .push((expr.span.start, expr.span.end, rewrite));
                if self.in_place {
                    self.sites
                        .assigns
                        .insert((expr.span.start, expr.span.end), (needs_proxy, safe_get));
                }
            }
            op => {
                let op_str: &str = match op {
                    AssignmentOperator::Addition => "+",
                    AssignmentOperator::Subtraction => "-",
                    AssignmentOperator::Multiplication => "*",
                    AssignmentOperator::Division => "/",
                    AssignmentOperator::Remainder => "%",
                    AssignmentOperator::Exponential => "**",
                    AssignmentOperator::LogicalNullish => "??",
                    AssignmentOperator::LogicalAnd => "&&",
                    AssignmentOperator::LogicalOr => "||",
                    _ => return,
                };
                let rhs_trimmed = rhs_text.trim();
                let rhs_for_output = if needs_compound_assignment_parens(rhs_trimmed, op_str) {
                    format!("({})", rhs_trimmed)
                } else {
                    rhs_trimmed.to_string()
                };
                let rewrite = format!(
                    "$.set({}, {}({}) {} {})",
                    name,
                    if safe_get { "$.safe_get" } else { "$.get" },
                    name,
                    op_str,
                    rhs_for_output
                );
                self.assigns_replacements
                    .push((expr.span.start, expr.span.end, rewrite));
                if self.in_place {
                    self.sites
                        .assigns
                        .insert((expr.span.start, expr.span.end), (false, safe_get));
                }
            }
        }
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &expr.argument {
            self.skip_spans.insert(id.span.start);
        }
        walk::walk_update_expression(self, expr);

        let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &expr.argument else {
            return;
        };
        let name = id.name.as_str();
        if !self.is_state_var(name) {
            return;
        }
        let ident_ref: &IdentifierReference = id;
        if !self.is_state_var_ref(ident_ref) {
            return;
        }
        let rewrite = match (expr.operator, expr.prefix) {
            (UpdateOperator::Increment, false) => format!("$.update({})", name),
            (UpdateOperator::Decrement, false) => format!("$.update({}, -1)", name),
            (UpdateOperator::Increment, true) => format!("$.update_pre({})", name),
            (UpdateOperator::Decrement, true) => format!("$.update_pre({}, -1)", name),
        };
        self.assigns_replacements
            .push((expr.span.start, expr.span.end, rewrite));
        if self.in_place {
            self.sites.updates.insert((expr.span.start, expr.span.end));
        }
    }

    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        // Skip first-arg `count` in `$.set(count, …)`, etc. — they're
        // either the target of an already-emitted wrap or an
        // already-wrapped read.
        if let Expression::StaticMemberExpression(member) = &call.callee
            && let Expression::Identifier(obj) = &member.object
            && obj.name == "$"
        {
            let prop = member.property.name.as_str();
            if matches!(
                prop,
                "set" | "update" | "update_pre" | "mutate" | "get" | "safe_get"
            ) && let Some(Argument::Identifier(id)) = call.arguments.first()
            {
                self.skip(id);
            }
        }
        walk::walk_call_expression(self, call);
    }

    fn visit_object_property(&mut self, prop: &ObjectProperty<'ast>) {
        // Shorthand `{ count }` → `{ count: $.get(count) }`.
        // Only fires when the value side is a state-var reference.
        let shorthand_eligible = prop.shorthand
            && matches!(&prop.key, PropertyKey::StaticIdentifier(k) if self.is_read_target(&k.name));
        if shorthand_eligible
            && let PropertyKey::StaticIdentifier(key) = &prop.key
            && let Expression::Identifier(value_ident) = &prop.value
            && self.is_state_var_ref(value_ident)
        {
            let name = key.name.as_str();
            let safe_get = self.reference_needs_safe_get(value_ident);
            self.read_replacements.push((
                prop.span.start,
                prop.span.end,
                format!(
                    "{}: {}({})",
                    name,
                    if safe_get { "$.safe_get" } else { "$.get" },
                    name
                ),
            ));
            if self.in_place {
                self.sites
                    .shorthands
                    .insert((prop.span.start, prop.span.end));
                if safe_get {
                    self.sites
                        .safe_shorthands
                        .insert((prop.span.start, prop.span.end));
                }
            }
            self.skip(value_ident);
            walk::walk_object_property(self, prop);
            return;
        }
        walk::walk_object_property(self, prop);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn simple_assign_with_rhs_state_var_read() {
        // The RHS `count` should be wrapped INSIDE the $.set wrap.
        let out = transform_state_pipeline_ast(
            "let count; let total; total = count;",
            &ssv(&["count", "total"]),
            &[],
            false,
            &[],
            &[],
        )
        .unwrap();
        assert_eq!(out, "let count;\nlet total;\n\n$.set(total, $.get(count));");
    }

    #[test]
    fn compound_with_rhs_state_var_read() {
        let out = transform_state_pipeline_ast(
            "let count; let total; total += count;",
            &ssv(&["count", "total"]),
            &[],
            false,
            &[],
            &[],
        )
        .unwrap();
        assert_eq!(
            out,
            "let count;\nlet total;\n\n$.set(total, $.get(total) + $.get(count));"
        );
    }

    #[test]
    fn standalone_read() {
        let out = transform_state_pipeline_ast(
            "let count; let r = count + 1;",
            &ssv(&["count"]),
            &[],
            false,
            &[],
            &[],
        )
        .unwrap();
        assert_eq!(out, "let count;\nlet r = $.get(count) + 1;");
    }

    #[test]
    fn var_reads_use_safe_get_per_resolved_binding() {
        let out = transform_state_pipeline_ast(
            "const value = $.derived(() => 1); function f() { var value = $.derived(() => 2); return value; } value;",
            &ssv(&["value"]),
            &[],
            false,
            &[],
            &[],
        )
        .unwrap();
        assert!(out.contains("return $.safe_get(value);"));
        assert!(out.ends_with("$.get(value);"));
    }

    #[test]
    fn update_expression() {
        let out = transform_state_pipeline_ast(
            "let count; count++;",
            &ssv(&["count"]),
            &[],
            false,
            &[],
            &[],
        )
        .unwrap();
        assert_eq!(out, "let count;\n\n$.update(count);");
    }

    #[test]
    fn shorthand_expansion() {
        let out = transform_state_pipeline_ast(
            "let count; let o = { count };",
            &ssv(&["count"]),
            &[],
            false,
            &[],
            &[],
        )
        .unwrap();
        assert_eq!(out, "let count;\nlet o = { count: $.get(count) };");
    }

    #[test]
    fn shadow_skipped() {
        assert!(
            transform_state_pipeline_ast(
                "let count; function f(count) { count = 5; count + 1; }",
                &ssv(&["count"]),
                &[],
                false,
                &[],
                &[]
            )
            .is_none()
        );
    }

    #[test]
    fn non_reactive_excluded() {
        // `count` is in state_vars but also non_reactive → no
        // read wrap. But assigns still wrap.
        let out = transform_state_pipeline_ast(
            "let count; count = 5;",
            &ssv(&["count"]),
            &[],
            false,
            &[],
            &ssv(&["count"]),
        )
        .unwrap();
        assert_eq!(out, "let count;\n\n$.set(count, 5);");
    }

    #[test]
    fn nested_assignment_outer_and_inner() {
        let out = transform_state_pipeline_ast(
            "let outer; let inner; outer = (inner = 1);",
            &ssv(&["outer", "inner"]),
            &[],
            false,
            &[],
            &[],
        )
        .unwrap();
        assert_eq!(
            out,
            "let outer;\nlet inner;\n\n$.set(outer, $.set(inner, 1));"
        );
    }

    #[test]
    fn proxy_flag_in_runes() {
        let out =
            transform_state_pipeline_ast("let x; x = { a: 1 };", &ssv(&["x"]), &[], true, &[], &[])
                .unwrap();
        assert_eq!(out, "let x;\n\n$.set(x, { a: 1 }, true);");
    }

    #[test]
    fn typescript_parameter_rhs_is_proxied() {
        let out = transform_state_pipeline_ast(
            "let active_heading; function update(heading: Heading) { active_heading = heading; }",
            &ssv(&["active_heading"]),
            &[],
            true,
            &[],
            &[],
        )
        .unwrap();
        assert!(
            out.contains("$.set(active_heading, heading, true)"),
            "{out}"
        );
    }

    #[test]
    fn raw_state_no_proxy() {
        let out = transform_state_pipeline_ast(
            "let x; x = { a: 1 };",
            &ssv(&["x"]),
            &ssv(&["x"]),
            true,
            &[],
            &[],
        )
        .unwrap();
        assert_eq!(out, "let x;\n\n$.set(x, { a: 1 });");
    }

    #[test]
    fn member_assignment_unchanged() {
        assert!(
            transform_state_pipeline_ast("let x; obj.x = 5;", &ssv(&["x"]), &[], false, &[], &[])
                .is_none()
        );
    }

    #[test]
    fn already_wrapped_first_arg_skipped() {
        assert!(
            transform_state_pipeline_ast("let x; $.get(x);", &ssv(&["x"]), &[], false, &[], &[])
                .is_none()
        );
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_state_pipeline_ast("function f( {", &ssv(&["x"]), &[], false, &[], &[])
                .is_none()
        );
    }

    #[test]
    fn complex_smoke() {
        let src = r#"
            let count;
            let total;
            let items;
            count = 1;
            total += count;
            count++;
            items = [count, total];
            function inner(count) { count = 99; }
        "#;
        let out = transform_state_pipeline_ast(
            src,
            &ssv(&["count", "total", "items"]),
            &[],
            false,
            &[],
            &[],
        )
        .unwrap();
        // Simple assign + RHS state-var read in same expression
        assert!(out.contains("$.set(count, 1);"));
        // Compound assign with state-var RHS read
        assert!(out.contains("$.set(total, $.get(total) + $.get(count));"));
        // Update expression
        assert!(out.contains("$.update(count);"));
        // Array literal with multiple state-var reads
        assert!(out.contains("$.set(items, [$.get(count), $.get(total)]"));
        // Shadow preserved — the assignment inside `inner` is left alone, whatever
        // line the printer puts it on.
        assert!(out.contains("count = 99;"));
        assert!(!out.contains("$.set(count, 99)"));
    }
}

// ── in-place port ──────────────────────────────────────────────────────

thread_local! {
    static STATE_PIPELINE_IN_PLACE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// In-place equivalent of [`transform_state_pipeline_ast`].
///
/// The splice path needs a fixed point because a wrap emitted for an outer
/// assignment hides the inner ones behind `innermost_only`; post-order
/// mutation composes instead, so one walk suffices. Deciding a site still
/// needs a [`Semantic`], which borrows the program immutably, hence the
/// collect-then-rewrite split.
fn transform_state_pipeline_in_place(
    source: &str,
    state_vars: &[String],
    raw_state_vars: &[String],
    is_runes: bool,
    non_proxy_vars: &[String],
    effective_read_names: &[String],
) -> ast_rewrite::Rewrite {
    ast_rewrite::with_program_mut(
        &STATE_PIPELINE_IN_PLACE_ALLOC,
        source,
        SourceType::ts().with_module(true),
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        |allocator, program| {
            let sites = {
                let semantic_ret = super::super::profile::semantic_build(
                    super::super::profile::SEM_STATE_PIPELINE_IN_PLACE,
                    program.source_text.len(),
                    || SemanticBuilder::new().with_build_nodes(true).build(program),
                );
                let semantic = &semantic_ret.semantic;
                let state_var_symbols = find_state_var_symbols(semantic, state_vars);
                let mut visitor = PipelineVisitor {
                    source,
                    semantic,
                    state_vars,
                    raw_state_vars,
                    is_runes,
                    non_proxy_vars,
                    effective_read_names,
                    state_var_symbols,
                    read_replacements: Vec::new(),
                    assigns_replacements: Vec::new(),
                    skip_spans: FxHashSet::default(),
                    in_place: true,
                    sites: Sites::default(),
                };
                visitor.visit_program(program);
                visitor.sites
            };
            if sites.is_empty() {
                return false;
            }
            let mut rewriter = PipelineRewriter {
                b: crate::compiler::phases::phase3_transform::builders::B::new(allocator),
                sites,
                changed: false,
            };
            oxc_ast_visit::VisitMut::visit_program(&mut rewriter, program);
            rewriter.changed
        },
    )
}

enum CompoundOp {
    Binary(BinaryOperator),
    Logical(LogicalOperator),
}

/// The compound operators this pass rewrites — narrower than the shared
/// helper, which also covers bitwise and shift forms the text path leaves
/// alone. `None` covers plain `=` as well as anything unsupported; the
/// site map decided eligibility already, so both are safe here.
fn compound_op(op: AssignmentOperator) -> Option<CompoundOp> {
    Some(match op {
        AssignmentOperator::Addition => CompoundOp::Binary(BinaryOperator::Addition),
        AssignmentOperator::Subtraction => CompoundOp::Binary(BinaryOperator::Subtraction),
        AssignmentOperator::Multiplication => CompoundOp::Binary(BinaryOperator::Multiplication),
        AssignmentOperator::Division => CompoundOp::Binary(BinaryOperator::Division),
        AssignmentOperator::Remainder => CompoundOp::Binary(BinaryOperator::Remainder),
        AssignmentOperator::Exponential => CompoundOp::Binary(BinaryOperator::Exponential),
        AssignmentOperator::LogicalNullish => CompoundOp::Logical(LogicalOperator::Coalesce),
        AssignmentOperator::LogicalAnd => CompoundOp::Logical(LogicalOperator::And),
        AssignmentOperator::LogicalOr => CompoundOp::Logical(LogicalOperator::Or),
        _ => return None,
    })
}

struct PipelineRewriter<'a> {
    b: crate::compiler::phases::phase3_transform::builders::B<'a>,
    sites: Sites,
    changed: bool,
}

impl<'a> PipelineRewriter<'a> {
    fn state_read(&self, name: &str, safe: bool) -> Expression<'a> {
        self.b.call(
            if safe { "$.safe_get" } else { "$.get" },
            vec![self.b.id(name)],
        )
    }

    fn state_read_with_source_identifier(
        &self,
        identifier: Expression<'a>,
        safe: bool,
    ) -> Expression<'a> {
        // `SPAN` is a real location to rsvelte_esrap, whereas upstream's
        // builder-created wrapper has `loc: null`. Unlocate the synthesized
        // call first, then put the original located identifier back as its
        // argument so only that identifier advances the comment cursor.
        let mut call = self.b.call(
            if safe { "$.safe_get" } else { "$.get" },
            vec![self.b.void0()],
        );
        ast_rewrite::mark_synthesized_expression(&mut call);
        let Expression::CallExpression(call_expression) = &mut call else {
            unreachable!("B::call always creates a call expression")
        };
        call_expression.arguments[0] = Argument::from(identifier);
        call
    }

    fn rewrite_read(&mut self, expr: &mut Expression<'a>) {
        let Expression::Identifier(id) = &*expr else {
            return;
        };
        if !self.sites.reads.contains(&(id.span.start, id.span.end)) {
            return;
        }
        let span = (id.span.start, id.span.end);
        let safe = self.sites.safe_reads.contains(&span);
        let identifier = std::mem::replace(expr, self.b.void0());
        *expr = self.state_read_with_source_identifier(identifier, safe);
        self.changed = true;
    }

    fn rewrite_assignment(&mut self, expr: &mut Expression<'a>) {
        let (needs_proxy, safe_get, name, operator) = {
            let Expression::AssignmentExpression(assign) = &*expr else {
                return;
            };
            let Some(&(needs_proxy, safe_get)) = self
                .sites
                .assigns
                .get(&(assign.span.start, assign.span.end))
            else {
                return;
            };
            let AssignmentTarget::AssignmentTargetIdentifier(id) = &assign.left else {
                return;
            };
            (needs_proxy, safe_get, id.name, assign.operator)
        };

        let taken = std::mem::replace(expr, self.b.void0());
        let Expression::AssignmentExpression(assign) = taken else {
            unreachable!("checked above")
        };
        let right = assign.unbox().right;
        let value = match compound_op(operator) {
            None => right,
            Some(CompoundOp::Binary(op)) => {
                self.b
                    .binary(op, self.state_read(name.as_str(), safe_get), right)
            }
            Some(CompoundOp::Logical(op)) => {
                self.b
                    .logical(op, self.state_read(name.as_str(), safe_get), right)
            }
        };
        let mut args = vec![self.b.id(name.as_str()), value];
        if needs_proxy {
            args.push(self.b.bool(true));
        }
        *expr = self.b.call("$.set", args);
        self.changed = true;
    }

    fn rewrite_update(&mut self, expr: &mut Expression<'a>) {
        let (name, prefix, decrement) = {
            let Expression::UpdateExpression(update) = &*expr else {
                return;
            };
            if !self
                .sites
                .updates
                .contains(&(update.span.start, update.span.end))
            {
                return;
            }
            let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &update.argument else {
                return;
            };
            (
                id.name,
                update.prefix,
                update.operator == UpdateOperator::Decrement,
            )
        };

        let callee = if prefix { "$.update_pre" } else { "$.update" };
        let mut args = vec![self.b.id(name.as_str())];
        if decrement {
            args.push(
                self.b
                    .unary(UnaryOperator::UnaryNegation, self.b.number(1.0)),
            );
        }
        *expr = self.b.call(callee, args);
        self.changed = true;
    }
}

impl<'a> oxc_ast_visit::VisitMut<'a> for PipelineRewriter<'a> {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        oxc_ast_visit::walk_mut::walk_expression(self, expr);

        match &*expr {
            Expression::Identifier(_) => self.rewrite_read(expr),
            Expression::AssignmentExpression(_) => self.rewrite_assignment(expr),
            Expression::UpdateExpression(_) => self.rewrite_update(expr),
            _ => {}
        }
    }

    fn visit_object_property(&mut self, prop: &mut ObjectProperty<'a>) {
        oxc_ast_visit::walk_mut::walk_object_property(self, prop);

        if !self
            .sites
            .shorthands
            .contains(&(prop.span.start, prop.span.end))
        {
            return;
        }
        let PropertyKey::StaticIdentifier(key) = &prop.key else {
            return;
        };
        let name = key.name;
        let safe = self
            .sites
            .safe_shorthands
            .contains(&(prop.span.start, prop.span.end));
        // esrap re-derives shorthand from key/value identity, so the value
        // replacement is what expands the property.
        prop.shorthand = false;
        prop.value = self.state_read(name.as_str(), safe);
        self.changed = true;
    }
}
