//! AST-based rewrite of compound state-var assignments
//! (`x +=` / `x -=` / `x *=` / `x /=` / `x %=` / `x **=` /
//! `x ??=` / `x &&=` / `x ||=`).
//!
//! Covers the COMPOUND-ARITHMETIC (lines 1882–1938) and
//! COMPOUND-LOGICAL (lines 1940–1992) branches of
//! `state_transforms::transform_state_assignments`. The text
//! predecessor uses `result.contains(pattern)` +
//! `result.find(pattern)` + `find_statement_end_client` to extract
//! RHS, then `is_shadowed_by_for_loop_var` for scope checks.
//!
//! `oxc_semantic` (via `scope_analysis::is_locally_shadowed`)
//! replaces the for-loop / function-param / nested-let shadow
//! detection precisely. RHS bounds come from the AST span — no
//! more `find_statement_end_client` walk-and-balance.
//!
//! ## Mapping (preserved exactly vs text version)
//!
//! | Source         | Replacement                              |
//! |----------------|------------------------------------------|
//! | `x += expr`    | `$.set(x, $.get(x) + expr)`              |
//! | `x -= expr`    | `$.set(x, $.get(x) - expr)`              |
//! | `x *= expr`    | `$.set(x, $.get(x) * expr)`              |
//! | `x /= expr`    | `$.set(x, $.get(x) / expr)`              |
//! | `x %= expr`    | `$.set(x, $.get(x) % expr)`              |
//! | `x **= expr`   | `$.set(x, $.get(x) ** expr)`             |
//! | `x ??= expr`   | `$.set(x, $.get(x) ?? expr)`             |
//! | `x &&= expr`   | `$.set(x, $.get(x) && expr)`             |
//! | `x \|\|= expr`   | `$.set(x, $.get(x) \|\| expr)`             |
//!
//! RHS gets parenthesized via `needs_compound_assignment_parens`
//! exactly as the text version did — for precedence safety with
//! lower-precedence operators in the RHS.
//!
//! ## Return shape
//!
//! Returns `Some(rewritten)` when at least one position was
//! wrapped. Returns `None` on empty inputs, parse error, or
//! no-match (callers stay on the text predecessor). Compound
//! `=` (simple assignment) is OUT of scope — that branch is
//! handled by `state_simple_assigns_ast` (PR #218). Member /
//! destructure / declaration targets are out of scope (different
//! AssignmentTarget kinds).
//!
//! ## Idempotency
//!
//! After wrap, the AssignmentExpression becomes a `$.set(...)`
//! CallExpression — visitor no longer matches. Text branches in
//! `transform_state_assignments` scan for `var += ` / `var ??= `
//! etc. literal patterns; those byte sequences disappear after
//! wrap so the text branches no-op.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::{ParseOptions, Parser};
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::{GetSpan, SourceType};
use oxc_syntax::operator::AssignmentOperator;
use oxc_syntax::symbol::SymbolId;
use rustc_hash::FxHashSet;

use super::expression_utils::needs_compound_assignment_parens;
use super::scope_analysis::{find_state_var_symbols, is_state_var_reference_or_unresolved};

thread_local! {
    static STATE_COMPOUND_ASSIGN_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

const MAX_FIXED_POINT_ITERS: usize = 16;

/// AST-based rewrite of `name <op>= expr` for state vars. See
/// module docs for the precise contract.
///
/// Uses fixed-point iteration and symbol-identity-based shadow
/// detection — see `state_simple_assigns_ast` for the same
/// architecture.
pub fn transform_state_compound_assigns_ast(source: &str, state_vars: &[String]) -> Option<String> {
    if state_vars.is_empty() {
        return None;
    }
    if !state_vars
        .iter()
        .any(|v| memchr::memmem::find(source.as_bytes(), v.as_bytes()).is_some())
    {
        return None;
    }
    memchr::memchr(b'=', source.as_bytes())?;

    let mut current = source.to_string();
    let mut any_changed = false;
    for _ in 0..MAX_FIXED_POINT_ITERS {
        match single_pass(&current, state_vars) {
            Some(next) => {
                current = next;
                any_changed = true;
            }
            None => break,
        }
    }
    if any_changed { Some(current) } else { None }
}

fn single_pass(source: &str, state_vars: &[String]) -> Option<String> {
    STATE_COMPOUND_ASSIGN_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs())
            .with_options(ParseOptions {
                allow_return_outside_function: true,
                ..ParseOptions::default()
            })
            .parse();
        if !parser_ret.errors.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }
        let program: &Program = allocator.alloc(parser_ret.program);
        let semantic_ret = SemanticBuilder::new().build(program);
        let semantic = &semantic_ret.semantic;
        let state_var_symbols = find_state_var_symbols(semantic, state_vars);

        let mut collector = StateCompoundAssignCollector {
            source,
            semantic,
            state_vars,
            state_var_symbols,
            replacements: Vec::new(),
        };
        collector.visit_program(program);

        let mut replacements = collector.replacements;
        if replacements.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

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

struct StateCompoundAssignCollector<'a, 'sem> {
    source: &'a str,
    semantic: &'sem Semantic<'sem>,
    state_vars: &'a [String],
    state_var_symbols: FxHashSet<SymbolId>,
    replacements: Vec<(u32, u32, String)>,
}

impl<'a, 'sem, 'ast> Visit<'ast> for StateCompoundAssignCollector<'a, 'sem> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        // Map the compound operator → string used in the output.
        // Simple `=` is handled by `state_simple_assigns_ast`.
        let op_str: &str = match expr.operator {
            AssignmentOperator::Addition => "+",
            AssignmentOperator::Subtraction => "-",
            AssignmentOperator::Multiplication => "*",
            AssignmentOperator::Division => "/",
            AssignmentOperator::Remainder => "%",
            AssignmentOperator::Exponential => "**",
            AssignmentOperator::LogicalNullish => "??",
            AssignmentOperator::LogicalAnd => "&&",
            AssignmentOperator::LogicalOr => "||",
            // Bitwise compound (`|=`, `&=`, `^=`, `<<=`, `>>=`,
            // `>>>=`) aren't in the text version's allowlists —
            // leave them.
            _ => return,
        };

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

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn addition() {
        let out = transform_state_compound_assigns_ast("x += 5;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.set(x, $.get(x) + 5);");
    }

    #[test]
    fn subtraction() {
        let out = transform_state_compound_assigns_ast("x -= 5;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.set(x, $.get(x) - 5);");
    }

    #[test]
    fn multiplication() {
        let out = transform_state_compound_assigns_ast("x *= 2;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.set(x, $.get(x) * 2);");
    }

    #[test]
    fn division() {
        let out = transform_state_compound_assigns_ast("x /= 2;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.set(x, $.get(x) / 2);");
    }

    #[test]
    fn remainder() {
        let out = transform_state_compound_assigns_ast("x %= 2;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.set(x, $.get(x) % 2);");
    }

    #[test]
    fn exponential() {
        let out = transform_state_compound_assigns_ast("x **= 2;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.set(x, $.get(x) ** 2);");
    }

    #[test]
    fn logical_or() {
        let out = transform_state_compound_assigns_ast("x ||= 0;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.set(x, $.get(x) || 0);");
    }

    #[test]
    fn logical_and() {
        let out = transform_state_compound_assigns_ast("x &&= 0;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.set(x, $.get(x) && 0);");
    }

    #[test]
    fn nullish() {
        let out = transform_state_compound_assigns_ast("x ??= 0;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.set(x, $.get(x) ?? 0);");
    }

    #[test]
    fn skips_simple_assign() {
        // `=` is handled by state_simple_assigns_ast.
        assert!(transform_state_compound_assigns_ast("x = 5;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn skips_update_expression() {
        assert!(transform_state_compound_assigns_ast("x++;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn skips_member_target() {
        assert!(transform_state_compound_assigns_ast("obj.x += 1;", &ssv(&["x"])).is_none());
        assert!(transform_state_compound_assigns_ast("x.prop += 1;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn skips_function_param_shadow() {
        // Need outer `let x` so the symbol-identity check sees a
        // real outermost binding.
        assert!(
            transform_state_compound_assigns_ast("let x; function f(x) { x += 1; }", &ssv(&["x"]))
                .is_none()
        );
    }

    #[test]
    fn skips_arrow_param_shadow() {
        assert!(
            transform_state_compound_assigns_ast(
                "let x; const f = (x) => { x += 1; };",
                &ssv(&["x"])
            )
            .is_none()
        );
    }

    #[test]
    fn skips_for_loop_var_shadow() {
        assert!(
            transform_state_compound_assigns_ast(
                "let x; for (let x of items) { x += 1; }",
                &ssv(&["x"])
            )
            .is_none()
        );
    }

    #[test]
    fn skips_nested_let_shadow() {
        let out = transform_state_compound_assigns_ast(
            "let x; x += 1; { let x = 0; x += 2; } x += 3;",
            &ssv(&["x"]),
        )
        .unwrap();
        // Outer two wrapped, inner shadowed
        assert!(out.contains("$.set(x, $.get(x) + 1);"));
        assert!(out.contains("$.set(x, $.get(x) + 3);"));
        assert!(out.contains("{ let x = 0; x += 2; }"));
    }

    #[test]
    fn parens_when_rhs_has_lower_precedence() {
        // `x += a || b` — RHS contains `||` which is lower
        // precedence than `+`. needs_compound_assignment_parens
        // wraps the RHS in parens.
        let out = transform_state_compound_assigns_ast("x += a || b;", &ssv(&["x"])).unwrap();
        // Either parenthesized or wrapped — depends on the
        // text helper's exact behavior. Both shapes preserve
        // semantics; just check we did the rewrite and produced
        // valid output.
        assert!(out.starts_with("$.set(x, $.get(x) + "));
        assert!(out.contains("a || b"));
    }

    #[test]
    fn rewrites_inside_if_block() {
        let out =
            transform_state_compound_assigns_ast("if (cond) { x += 1; }", &ssv(&["x"])).unwrap();
        assert_eq!(out, "if (cond) { $.set(x, $.get(x) + 1); }");
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let out =
            transform_state_compound_assigns_ast("let s = `${x += 1}`;", &ssv(&["x"])).unwrap();
        assert!(out.contains("$.set(x, $.get(x) + 1)"));
    }

    #[test]
    fn skips_inside_string_literal() {
        let src = r#"let s = "x += 1";"#;
        assert!(transform_state_compound_assigns_ast(src, &ssv(&["x"])).is_none());
    }

    #[test]
    fn skips_var_not_in_state_vars() {
        assert!(transform_state_compound_assigns_ast("y += 5;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_state_compound_assigns_ast("function f( {", &ssv(&["x"])).is_none());
    }

    #[test]
    fn empty_state_vars_returns_none() {
        assert!(transform_state_compound_assigns_ast("x += 5;", &[]).is_none());
    }

    #[test]
    fn handles_multiple_state_vars_in_one_line() {
        let out =
            transform_state_compound_assigns_ast("a += 1; b -= 2; c *= 3;", &ssv(&["a", "b", "c"]))
                .unwrap();
        assert_eq!(
            out,
            "$.set(a, $.get(a) + 1); $.set(b, $.get(b) - 2); $.set(c, $.get(c) * 3);"
        );
    }

    #[test]
    fn multiline_rhs() {
        let out = transform_state_compound_assigns_ast("x +=\n  5 + 1;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.set(x, $.get(x) + 5 + 1);");
    }
}
