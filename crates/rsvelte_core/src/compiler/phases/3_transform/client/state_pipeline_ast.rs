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
use oxc_syntax::operator::{AssignmentOperator, UpdateOperator};
use oxc_syntax::symbol::SymbolId;
use rustc_hash::FxHashSet;

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
    // Pre-filter: anything in non_reactive_vars is excluded from reads.
    let effective_read_names: Vec<String> = state_vars
        .iter()
        .filter(|v| !non_reactive_vars.iter().any(|n| n == *v))
        .cloned()
        .collect();
    if !state_vars
        .iter()
        .any(|v| memchr::memmem::find(source.as_bytes(), v.as_bytes()).is_some())
    {
        return None;
    }
    if memchr::memchr(b'=', source.as_bytes()).is_none()
        && memchr::memmem::find(source.as_bytes(), b"++").is_none()
        && memchr::memmem::find(source.as_bytes(), b"--").is_none()
        && !effective_read_names
            .iter()
            .any(|v| memchr::memmem::find(source.as_bytes(), v.as_bytes()).is_some())
    {
        return None;
    }

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
        SourceType::mjs(),
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        |program| {
            let semantic_ret = SemanticBuilder::new().with_build_nodes(true).build(program);
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
        self.read_replacements
            .push((ident.span.start, ident.span.end, format!("$.get({})", name)));
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

        let rhs_span = expr.right.span();
        let rhs_text = self.rhs_text_with_inner_reads(rhs_span);

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
                    "$.set({}, $.get({}) {} {})",
                    name, name, op_str, rhs_for_output
                );
                self.assigns_replacements
                    .push((expr.span.start, expr.span.end, rewrite));
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
            self.read_replacements.push((
                prop.span.start,
                prop.span.end,
                format!("{}: $.get({})", name, name),
            ));
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
        assert_eq!(out, "let count; let total; $.set(total, $.get(count));");
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
            "let count; let total; $.set(total, $.get(total) + $.get(count));"
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
        assert_eq!(out, "let count; let r = $.get(count) + 1;");
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
        assert_eq!(out, "let count; $.update(count);");
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
        assert_eq!(out, "let count; let o = { count: $.get(count) };");
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
        assert_eq!(out, "let count; $.set(count, 5);");
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
            "let outer; let inner; $.set(outer, ($.set(inner, 1)));"
        );
    }

    #[test]
    fn proxy_flag_in_runes() {
        let out =
            transform_state_pipeline_ast("let x; x = { a: 1 };", &ssv(&["x"]), &[], true, &[], &[])
                .unwrap();
        assert_eq!(out, "let x; $.set(x, { a: 1 }, true);");
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
        assert_eq!(out, "let x; $.set(x, { a: 1 });");
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
        // Shadow preserved
        assert!(out.contains("function inner(count) { count = 99; }"));
    }
}
