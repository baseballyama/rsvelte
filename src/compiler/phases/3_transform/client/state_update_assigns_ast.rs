//! AST-based rewrite of state-var update expressions
//! (`x++` / `x--` / `++x` / `--x`).
//!
//! Covers the UPDATE-EXPRESSION branch of
//! `state_transforms::transform_state_assignments` (lines
//! 1840–1880). The text predecessor uses
//! `replace_with_word_boundary_scoped(..., Some(var))` which
//! performs a hand-rolled scope check around each match.
//!
//! `oxc_semantic` (via `scope_analysis::is_locally_shadowed`)
//! replaces the scope check precisely — function params,
//! for-loop vars, nested block-scoped lets are all detected
//! without byte scanning.
//!
//! ## Mapping (preserved exactly vs text version)
//!
//! | Source | Replacement              |
//! |--------|--------------------------|
//! | `x++`  | `$.update(x)`            |
//! | `x--`  | `$.update(x, -1)`        |
//! | `++x`  | `$.update_pre(x)`        |
//! | `--x`  | `$.update_pre(x, -1)`    |
//!
//! Member-target updates (`obj.x++`, `obj[i]++`) are out of
//! scope — they go through `transform_state_member_mutations`.
//! Declaration / destructure / private-field targets are also
//! out of scope (different `SimpleAssignmentTarget` kinds).
//!
//! ## Return shape
//!
//! Returns `Some(rewritten)` when at least one position was
//! wrapped. Returns `None` on empty inputs, no-match, or parse
//! error — callers fall through to the text predecessor.
//!
//! ## Idempotency
//!
//! After wrap, the UpdateExpression becomes a `$.update(...)` /
//! `$.update_pre(...)` CallExpression. Visitor no longer matches
//! that shape. Text branches in `transform_state_assignments`
//! scan for literal `var++` / `++var` patterns; those byte
//! sequences disappear after wrap so the text branches no-op.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::{ParseOptions, Parser};
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::SourceType;
use oxc_syntax::operator::UpdateOperator;

use super::scope_analysis::is_locally_shadowed;

thread_local! {
    static STATE_UPDATE_ASSIGN_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `x++` / `x--` / `++x` / `--x` for state
/// vars. See module docs for the precise contract.
pub fn transform_state_update_assigns_ast(source: &str, state_vars: &[String]) -> Option<String> {
    if state_vars.is_empty() {
        return None;
    }
    if !state_vars
        .iter()
        .any(|v| memchr::memmem::find(source.as_bytes(), v.as_bytes()).is_some())
    {
        return None;
    }
    // Fast probe — at least one `++` or `--` token must appear.
    if memchr::memmem::find(source.as_bytes(), b"++").is_none()
        && memchr::memmem::find(source.as_bytes(), b"--").is_none()
    {
        return None;
    }

    STATE_UPDATE_ASSIGN_ALLOC.with(|cell| {
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

        let mut collector = StateUpdateCollector {
            semantic,
            state_vars,
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

struct StateUpdateCollector<'a, 'sem> {
    semantic: &'sem Semantic<'sem>,
    state_vars: &'a [String],
    replacements: Vec<(u32, u32, String)>,
}

impl<'a, 'sem, 'ast> Visit<'ast> for StateUpdateCollector<'a, 'sem> {
    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);

        // Only bare identifier targets — member / private-field
        // updates go through other code paths.
        let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &expr.argument else {
            return;
        };
        let name = id.name.as_str();
        if !self.state_vars.iter().any(|s| s.as_str() == name) {
            return;
        }
        let ident_ref: &IdentifierReference = id;
        if is_locally_shadowed(self.semantic, ident_ref) {
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
    fn post_increment() {
        let out = transform_state_update_assigns_ast("x++;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.update(x);");
    }

    #[test]
    fn post_decrement() {
        let out = transform_state_update_assigns_ast("x--;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.update(x, -1);");
    }

    #[test]
    fn pre_increment() {
        let out = transform_state_update_assigns_ast("++x;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.update_pre(x);");
    }

    #[test]
    fn pre_decrement() {
        let out = transform_state_update_assigns_ast("--x;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "$.update_pre(x, -1);");
    }

    #[test]
    fn skips_member_target() {
        // `obj.x++` / `x.prop++` — member-mutation path.
        assert!(transform_state_update_assigns_ast("obj.x++;", &ssv(&["x"])).is_none());
        assert!(transform_state_update_assigns_ast("x.prop++;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn skips_simple_assign() {
        assert!(transform_state_update_assigns_ast("x = 5;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn skips_compound_assign() {
        assert!(transform_state_update_assigns_ast("x += 5;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn skips_function_param_shadow() {
        assert!(
            transform_state_update_assigns_ast("function f(x) { x++; }", &ssv(&["x"])).is_none()
        );
    }

    #[test]
    fn skips_arrow_param_shadow() {
        assert!(
            transform_state_update_assigns_ast("const f = (x) => { x++; };", &ssv(&["x"]))
                .is_none()
        );
    }

    #[test]
    fn skips_for_loop_var_shadow() {
        assert!(
            transform_state_update_assigns_ast("for (let x of items) { x++; }", &ssv(&["x"]))
                .is_none()
        );
    }

    #[test]
    fn skips_nested_let_shadow() {
        let out = transform_state_update_assigns_ast("x++; { let x = 0; x++; } x--;", &ssv(&["x"]))
            .unwrap();
        assert!(out.contains("$.update(x);"));
        assert!(out.contains("$.update(x, -1);"));
        assert!(out.contains("{ let x = 0; x++; }"));
    }

    #[test]
    fn rewrites_inside_if_block() {
        let out = transform_state_update_assigns_ast("if (cond) { x++; }", &ssv(&["x"])).unwrap();
        assert_eq!(out, "if (cond) { $.update(x); }");
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let out = transform_state_update_assigns_ast("let s = `${x++}`;", &ssv(&["x"])).unwrap();
        assert_eq!(out, "let s = `${$.update(x)}`;");
    }

    #[test]
    fn skips_inside_string_literal() {
        let src = r#"let s = "x++";"#;
        assert!(transform_state_update_assigns_ast(src, &ssv(&["x"])).is_none());
    }

    #[test]
    fn skips_var_not_in_state_vars() {
        assert!(transform_state_update_assigns_ast("y++;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_state_update_assigns_ast("function f( {", &ssv(&["x"])).is_none());
    }

    #[test]
    fn empty_state_vars_returns_none() {
        assert!(transform_state_update_assigns_ast("x++;", &[]).is_none());
    }

    #[test]
    fn no_inc_dec_token_returns_none() {
        // Fast probe should bail before parsing.
        assert!(transform_state_update_assigns_ast("x = 5;", &ssv(&["x"])).is_none());
    }

    #[test]
    fn handles_multiple_state_vars() {
        let out =
            transform_state_update_assigns_ast("a++; b--; ++c; --d;", &ssv(&["a", "b", "c", "d"]))
                .unwrap();
        assert_eq!(
            out,
            "$.update(a); $.update(b, -1); $.update_pre(c); $.update_pre(d, -1);"
        );
    }

    #[test]
    fn rewrites_inside_callback() {
        let out =
            transform_state_update_assigns_ast("items.forEach(it => { x++; });", &ssv(&["x"]))
                .unwrap();
        assert_eq!(out, "items.forEach(it => { $.update(x); });");
    }

    /// Mixed: top-level wraps, inner shadow preserved, other vars unchanged.
    #[test]
    fn smoke_mixed_pattern() {
        let src = "x++; function inner(x) { x++; } y++;";
        let out = transform_state_update_assigns_ast(src, &ssv(&["x"])).unwrap();
        assert!(out.contains("$.update(x);"));
        assert!(out.contains("function inner(x) { x++; }"));
        assert!(out.contains("y++;"));
    }
}
