//! Combined AST pass for state-var assignments — simple
//! (`x = expr`), compound (`x += expr` / `x ||= expr` / …), and
//! update (`x++`, `--x`). Replaces three previously-separate
//! helpers with a single visitor + a single fixed-point loop.
//!
//! Previously, each operator family had its own helper:
//! `state_simple_assigns_ast`, `state_compound_assigns_ast`,
//! `state_update_assigns_ast`. Each one did its own
//! parse + `SemanticBuilder::build` + visitor walk + fixed-point
//! (up to 16 iterations). For state-var-heavy scripts that
//! amounted to up to ~48 parse cycles per script just for these
//! three concerns.
//!
//! This module merges all three into one visitor sharing a single
//! Semantic per fixed-point iteration. The original three helpers
//! are kept as thin wrappers so their unit-test coverage stays
//! intact.
//!
//! ## Mapping (preserved exactly)
//!
//! | Source              | Replacement                                |
//! |---------------------|--------------------------------------------|
//! | `x = expr`          | `$.set(x, expr)` (or `…, true)` in runes + proxy) |
//! | `x += expr`         | `$.set(x, $.get(x) + expr)`                |
//! | `x -= expr`         | `$.set(x, $.get(x) - expr)`                |
//! | `x *= expr`         | `$.set(x, $.get(x) * expr)`                |
//! | `x /= expr`         | `$.set(x, $.get(x) / expr)`                |
//! | `x %= expr`         | `$.set(x, $.get(x) % expr)`                |
//! | `x **= expr`        | `$.set(x, $.get(x) ** expr)`               |
//! | `x ??= expr`        | `$.set(x, $.get(x) ?? expr)`               |
//! | `x &&= expr`        | `$.set(x, $.get(x) && expr)`               |
//! | `x \|\|= expr`        | `$.set(x, $.get(x) \|\| expr)`               |
//! | `x++`               | `$.update(x)`                              |
//! | `x--`               | `$.update(x, -1)`                          |
//! | `++x`               | `$.update_pre(x)`                          |
//! | `--x`               | `$.update_pre(x, -1)`                      |
//!
//! Shadow detection uses `find_state_var_symbols` +
//! `is_state_var_reference_or_unresolved` from `scope_analysis` —
//! function params / for-loop vars / nested-let shadows resolve
//! to different SymbolIds and are skipped.

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
    static STATE_ASSIGNS_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Run the combined simple + compound + update assignment pass on
/// `source`. Returns `Some(rewritten)` if anything changed, `None`
/// otherwise. Internal fixed-point handles nested assignments
/// (e.g. `outer = (inner = 1)`).
pub fn transform_state_assigns_ast(
    source: &str,
    state_vars: &[String],
    raw_state_vars: &[String],
    is_runes: bool,
    non_proxy_vars: &[String],
) -> Option<String> {
    if state_vars.is_empty() {
        return None;
    }
    if !state_vars
        .iter()
        .any(|v| memchr::memmem::find(source.as_bytes(), v.as_bytes()).is_some())
    {
        return None;
    }
    // Cheapest probe — at least one `=` or `++`/`--` token.
    if memchr::memchr(b'=', source.as_bytes()).is_none()
        && memchr::memmem::find(source.as_bytes(), b"++").is_none()
        && memchr::memmem::find(source.as_bytes(), b"--").is_none()
    {
        return None;
    }

    ast_rewrite::fixed_point(source, |src| {
        single_pass(src, state_vars, raw_state_vars, is_runes, non_proxy_vars)
    })
}

fn single_pass(
    source: &str,
    state_vars: &[String],
    raw_state_vars: &[String],
    is_runes: bool,
    non_proxy_vars: &[String],
) -> Option<String> {
    ast_rewrite::with_program(
        &STATE_ASSIGNS_ALLOC,
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

            let mut collector = CombinedCollector {
                source,
                semantic,
                state_vars,
                raw_state_vars,
                is_runes,
                non_proxy_vars,
                state_var_symbols,
                replacements: Vec::new(),
            };
            collector.visit_program(program);

            ast_rewrite::splice(source, collector.replacements, true)
        },
    )
}

struct CombinedCollector<'a, 'sem> {
    source: &'a str,
    semantic: &'sem Semantic<'sem>,
    state_vars: &'a [String],
    raw_state_vars: &'a [String],
    is_runes: bool,
    non_proxy_vars: &'a [String],
    state_var_symbols: FxHashSet<SymbolId>,
    replacements: Vec<Edit>,
}

impl<'a, 'sem, 'ast> Visit<'ast> for CombinedCollector<'a, 'sem> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left else {
            return;
        };
        let name = id.name.as_str();
        if !self.state_vars.iter().any(|s| s.as_str() == name) {
            return;
        }
        let ident_ref: &IdentifierReference = id;
        if !is_state_var_reference_or_unresolved(
            self.semantic,
            ident_ref,
            &self.state_var_symbols,
            self.state_vars,
        ) {
            return;
        }

        let rhs_span = expr.right.span();
        let rhs_text = &self.source[rhs_span.start as usize..rhs_span.end as usize];

        match expr.operator {
            AssignmentOperator::Assign => {
                // Simple assignment.
                let is_raw_state = self.raw_state_vars.iter().any(|s| s.as_str() == name);
                let needs_proxy = self.is_runes
                    && !is_raw_state
                    && expression_needs_proxy_with_scope(rhs_text.trim(), self.non_proxy_vars);
                let rewrite = if needs_proxy {
                    format!("$.set({}, {}, true)", name, rhs_text)
                } else {
                    format!("$.set({}, {})", name, rhs_text)
                };
                self.replacements
                    .push((expr.span.start, expr.span.end, rewrite));
            }
            op => {
                // Compound (arithmetic + logical). Bitwise compound
                // (`&=`, `|=`, etc.) is intentionally NOT in the
                // mapping — matches the text predecessor's allowlist.
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
                self.replacements
                    .push((expr.span.start, expr.span.end, rewrite));
            }
        }
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);

        let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &expr.argument else {
            return;
        };
        let name = id.name.as_str();
        if !self.state_vars.iter().any(|s| s.as_str() == name) {
            return;
        }
        let ident_ref: &IdentifierReference = id;
        if !is_state_var_reference_or_unresolved(
            self.semantic,
            ident_ref,
            &self.state_var_symbols,
            self.state_vars,
        ) {
            return;
        }

        let rewrite = match (expr.operator, expr.prefix) {
            (UpdateOperator::Increment, false) => format!("$.update({})", name),
            (UpdateOperator::Decrement, false) => format!("$.update({}, -1)", name),
            (UpdateOperator::Increment, true) => format!("$.update_pre({})", name),
            (UpdateOperator::Decrement, true) => format!("$.update_pre({}, -1)", name),
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

    #[test]
    fn simple_assignment() {
        let out =
            transform_state_assigns_ast("let x; x = 5;", &ssv(&["x"]), &[], false, &[]).unwrap();
        assert_eq!(out, "let x; $.set(x, 5);");
    }

    #[test]
    fn compound_addition() {
        let out =
            transform_state_assigns_ast("let x; x += 5;", &ssv(&["x"]), &[], false, &[]).unwrap();
        assert_eq!(out, "let x; $.set(x, $.get(x) + 5);");
    }

    #[test]
    fn update_post_increment() {
        let out =
            transform_state_assigns_ast("let x; x++;", &ssv(&["x"]), &[], false, &[]).unwrap();
        assert_eq!(out, "let x; $.update(x);");
    }

    #[test]
    fn all_three_kinds_in_one_body() {
        // Combined pass handles all three operator families
        // without re-parsing between them.
        let out = transform_state_assigns_ast(
            "let x; let y; let z; x = 1; y += 2; z++;",
            &ssv(&["x", "y", "z"]),
            &[],
            false,
            &[],
        )
        .unwrap();
        assert_eq!(
            out,
            "let x; let y; let z; $.set(x, 1); $.set(y, $.get(y) + 2); $.update(z);"
        );
    }

    #[test]
    fn nested_assignment_wraps_both() {
        // `outer = (inner = 1)` — fixed-point iteration handles
        // the outer wrap after the inner is rewritten.
        let out = transform_state_assigns_ast(
            "let outer; let inner; outer = (inner = 1);",
            &ssv(&["outer", "inner"]),
            &[],
            false,
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
        let out = transform_state_assigns_ast("let x; x = { a: 1 };", &ssv(&["x"]), &[], true, &[])
            .unwrap();
        assert_eq!(out, "let x; $.set(x, { a: 1 }, true);");
    }

    #[test]
    fn raw_state_no_proxy() {
        let out = transform_state_assigns_ast(
            "let x; x = { a: 1 };",
            &ssv(&["x"]),
            &ssv(&["x"]),
            true,
            &[],
        )
        .unwrap();
        assert_eq!(out, "let x; $.set(x, { a: 1 });");
    }

    #[test]
    fn skips_function_param_shadow() {
        assert!(
            transform_state_assigns_ast(
                "let x; function f(x) { x = 1; x += 2; x++; }",
                &ssv(&["x"]),
                &[],
                false,
                &[]
            )
            .is_none()
        );
    }

    #[test]
    fn skips_member_target() {
        assert!(
            transform_state_assigns_ast("let x; obj.x = 5;", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
        assert!(
            transform_state_assigns_ast("let x; x.prop += 5;", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
    }

    #[test]
    fn skips_declaration() {
        assert!(transform_state_assigns_ast("let x = 5;", &ssv(&["x"]), &[], false, &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_state_assigns_ast("function f( {", &ssv(&["x"]), &[], false, &[]).is_none()
        );
    }

    #[test]
    fn empty_state_vars_returns_none() {
        assert!(transform_state_assigns_ast("x = 5;", &[], &[], false, &[]).is_none());
    }
}
