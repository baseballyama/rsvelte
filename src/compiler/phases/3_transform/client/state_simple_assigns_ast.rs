//! AST-based rewrite of simple state-var assignments
//! (`x = expr` → `$.set(x, expr [, true])`).
//!
//! Covers the SIMPLE-ASSIGNMENT branch of
//! `state_transforms::transform_state_assignments` (lines 1982+).
//! The text predecessor walks the input byte-by-byte tracking
//! string / template / comment state, multi-line head + body
//! continuations, and a dozen guard predicates
//! (`is_in_function_param_or_shadowed`,
//! `is_shadowed_by_for_loop_var`, declaration vs assignment in the
//! same statement, default-param value detection, ternary RHS
//! handling, etc.). The AST visitor drops most of that: an
//! `AssignmentExpression` with `Assign` operator and a plain
//! `AssignmentTargetIdentifier` LHS matches exactly the target
//! shape, and `oxc_semantic` (via
//! `scope_analysis::is_locally_shadowed`) answers the shadowing
//! question precisely.
//!
//! ## Mapping (preserved exactly vs text version)
//!
//! | Source                | Replacement                  | Notes                       |
//! |-----------------------|------------------------------|-----------------------------|
//! | `x = expr`            | `$.set(x, expr)`             | non-runes / raw / non-proxy |
//! | `x = expr`            | `$.set(x, expr, true)`       | runes + needs proxy         |
//! | `x.foo = expr`        | unchanged                    | member target → other path  |
//! | `let x = expr`        | unchanged                    | declaration, not assignment |
//! | `function f(x) { x = 1 }` | unchanged                | param shadow                |
//! | `for (let x of …) { x = 1 }` | unchanged             | for-loop var shadow         |
//! | `x += expr`           | unchanged                    | compound → other branch     |
//! | `x++`                 | unchanged                    | update → other branch       |
//!
//! ## Return shape
//!
//! Returns `Some(rewritten)` when at least one position was
//! wrapped. Returns `None` if `state_vars` is empty, the source
//! contains no relevant `state_var` substring, the source fails to
//! parse, or nothing matched. Callers fall through to the legacy
//! text scanner on `None`, so parse failures preserve current
//! behavior.
//!
//! ## Idempotency
//!
//! After wrap, the AssignmentExpression becomes a `$.set(...)`
//! CallExpression — visitor no longer matches. Text branches in
//! `transform_state_assignments` scan for `var = ` / `var +=` /
//! `var++` literal patterns; those byte sequences disappear after
//! wrap, so the text branches no-op naturally.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::{ParseOptions, Parser};
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::{GetSpan, SourceType};
use oxc_syntax::operator::AssignmentOperator;

use rustc_hash::FxHashSet;

use super::expression_utils::expression_needs_proxy_with_scope;
use super::scope_analysis::{find_state_var_symbols, is_state_var_reference_or_unresolved};
use oxc_syntax::symbol::SymbolId;

thread_local! {
    static STATE_SIMPLE_ASSIGN_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

const MAX_FIXED_POINT_ITERS: usize = 16;

/// AST-based rewrite of `name = expr` for state vars. See module
/// docs for the precise contract.
///
/// Uses fixed-point iteration so nested AssignmentExpressions
/// (e.g. `outer = (inner = 1)`) are all wrapped: pass 1 wraps the
/// innermost; pass 2 picks up the now-outermost; and so on.
///
/// Shadow detection uses [`find_state_var_symbols`] +
/// [`is_state_var_reference`]: a reference is "to the state var"
/// iff it resolves to the outermost-scope SymbolId for its name.
/// This correctly handles function-local state vars (the binding
/// itself, not a shadow) and rejects function-param / for-loop /
/// nested-let shadows.
pub fn transform_state_simple_assigns_ast(
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
    memchr::memchr(b'=', source.as_bytes())?;

    let mut current = source.to_string();
    let mut any_changed = false;
    for _ in 0..MAX_FIXED_POINT_ITERS {
        match single_pass(
            &current,
            state_vars,
            raw_state_vars,
            is_runes,
            non_proxy_vars,
        ) {
            Some(next) => {
                current = next;
                any_changed = true;
            }
            None => break,
        }
    }
    if any_changed { Some(current) } else { None }
}

fn single_pass(
    source: &str,
    state_vars: &[String],
    raw_state_vars: &[String],
    is_runes: bool,
    non_proxy_vars: &[String],
) -> Option<String> {
    STATE_SIMPLE_ASSIGN_ALLOC.with(|cell| {
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

        let mut collector = StateSimpleAssignCollector {
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

struct StateSimpleAssignCollector<'a, 'sem> {
    source: &'a str,
    semantic: &'sem Semantic<'sem>,
    state_vars: &'a [String],
    raw_state_vars: &'a [String],
    is_runes: bool,
    non_proxy_vars: &'a [String],
    /// Symbols whose name matches a state_var AND whose declaration
    /// is the OUTERMOST one for that name. References resolving to
    /// these symbols are to "the state var"; references resolving to
    /// other symbols of the same name are shadows.
    state_var_symbols: FxHashSet<SymbolId>,
    replacements: Vec<(u32, u32, String)>,
}

impl<'a, 'sem, 'ast> Visit<'ast> for StateSimpleAssignCollector<'a, 'sem> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        // Only simple `=` — compound (`+=`, `||=`, etc.) and
        // update (`++`, `--`) are out of scope; the text version's
        // dedicated branches handle them.
        if !matches!(expr.operator, AssignmentOperator::Assign) {
            return;
        }
        // Only bare identifier LHS — `obj.x = 5` / `x.prop = 5`
        // go through `transform_state_member_mutations`.
        let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left else {
            return;
        };
        let name = id.name.as_str();
        if !self.state_vars.iter().any(|s| s.as_str() == name) {
            return;
        }
        // Symbol-identity check: when at least one declaration for
        // this name exists in the source, match by the outermost
        // SymbolId. Function-param / for-loop / nested-let shadows
        // resolve to a *different* SymbolId, so they're skipped.
        //
        // When no declaration is found (only happens in unit tests
        // or trivially short fragments), fall back to the broader
        // shadow check.
        // The AssignmentTargetIdentifier struct *is* an
        // IdentifierReference in oxc's AST, so we borrow `id` as
        // one.
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

        // Proxy logic mirrors the text version's branch:
        //   needs_proxy = is_runes
        //              && !is_raw_state
        //              && expression_needs_proxy_with_scope(rhs, non_proxy_vars)
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
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn simple_assign_non_runes() {
        let out =
            transform_state_simple_assigns_ast("x = 5;", &ssv(&["x"]), &[], false, &[]).unwrap();
        assert_eq!(out, "$.set(x, 5);");
    }

    #[test]
    fn simple_assign_runes_no_proxy_needed_for_literal() {
        // `x = 5` — literal RHS, expression_needs_proxy_with_scope
        // returns false (no object/array/etc.).
        let out =
            transform_state_simple_assigns_ast("x = 5;", &ssv(&["x"]), &[], true, &[]).unwrap();
        assert_eq!(out, "$.set(x, 5);");
    }

    #[test]
    fn simple_assign_runes_proxy_for_object_literal() {
        // `x = { a: 1 }` — object literal needs proxy in runes mode.
        let out = transform_state_simple_assigns_ast("x = { a: 1 };", &ssv(&["x"]), &[], true, &[])
            .unwrap();
        assert_eq!(out, "$.set(x, { a: 1 }, true);");
    }

    #[test]
    fn simple_assign_runes_no_proxy_for_raw_state() {
        // `x` is a raw state var → never proxy.
        let out = transform_state_simple_assigns_ast(
            "x = { a: 1 };",
            &ssv(&["x"]),
            &ssv(&["x"]),
            true,
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.set(x, { a: 1 });");
    }

    #[test]
    fn skips_compound_assignment() {
        // Compound goes through the compound-arithmetic branch.
        assert!(
            transform_state_simple_assigns_ast("x += 5;", &ssv(&["x"]), &[], false, &[]).is_none()
        );
        assert!(
            transform_state_simple_assigns_ast("x ??= 5;", &ssv(&["x"]), &[], false, &[]).is_none()
        );
    }

    #[test]
    fn skips_update_expression() {
        // `x++` etc. go through the update branch.
        assert!(
            transform_state_simple_assigns_ast("x++;", &ssv(&["x"]), &[], false, &[]).is_none()
        );
    }

    #[test]
    fn skips_equality() {
        // `==` / `===` are BinaryExpression, not AssignmentExpression.
        assert!(
            transform_state_simple_assigns_ast("if (x == 5) {}", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
        assert!(
            transform_state_simple_assigns_ast("if (x === 5) {}", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
    }

    #[test]
    fn skips_member_assignment() {
        // `obj.x = 5` / `x.prop = 5` go through the member-mutation
        // path — LHS is a member expression, not a bare identifier.
        assert!(
            transform_state_simple_assigns_ast("obj.x = 5;", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
        assert!(
            transform_state_simple_assigns_ast("x.prop = 5;", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
    }

    #[test]
    fn skips_declaration() {
        // `let x = 5` is a VariableDeclarator, not an
        // AssignmentExpression.
        assert!(
            transform_state_simple_assigns_ast("let x = 5;", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
        assert!(
            transform_state_simple_assigns_ast("const x = 5;", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
        assert!(
            transform_state_simple_assigns_ast("var x = 5;", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
    }

    #[test]
    fn skips_destructuring() {
        // Array / object destructure are different AssignmentTarget
        // kinds.
        assert!(
            transform_state_simple_assigns_ast("[x] = arr;", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
        assert!(
            transform_state_simple_assigns_ast("({x} = obj);", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
    }

    #[test]
    fn skips_function_param_shadow() {
        // Inner `x = 1` is shadowed by the function param.
        // (Need an outer `let x` so the symbol-identity check has
        // an outermost binding to compare against.)
        let out = transform_state_simple_assigns_ast(
            "let x; function f(x) { x = 1; }",
            &ssv(&["x"]),
            &[],
            false,
            &[],
        );
        // Outer assignment to x? None. Inner is shadowed → no wrap.
        assert!(out.is_none(), "got {:?}", out);
    }

    #[test]
    fn skips_arrow_param_shadow() {
        let out = transform_state_simple_assigns_ast(
            "let x; const f = (x) => { x = 1; };",
            &ssv(&["x"]),
            &[],
            false,
            &[],
        );
        assert!(out.is_none(), "got {:?}", out);
    }

    #[test]
    fn skips_for_loop_var_shadow() {
        let out = transform_state_simple_assigns_ast(
            "let x; for (let x of items) { x = 5; }",
            &ssv(&["x"]),
            &[],
            false,
            &[],
        );
        assert!(out.is_none(), "got {:?}", out);
        let out2 = transform_state_simple_assigns_ast(
            "let x; for (let x in obj) { x = 5; }",
            &ssv(&["x"]),
            &[],
            false,
            &[],
        );
        assert!(out2.is_none(), "got {:?}", out2);
    }

    #[test]
    fn skips_nested_let_shadow() {
        // Outer `let x` declares in root scope (not shadowed for
        // root-scope reassign), but the inner block-scoped `let x`
        // shadows the inner assignment.
        let out = transform_state_simple_assigns_ast(
            "let x; x = 1; { let x = 0; x = 2; } x = 3;",
            &ssv(&["x"]),
            &[],
            false,
            &[],
        )
        .unwrap();
        // Two root-scope assignments wrapped, one inner-block
        // shadowed assignment left alone.
        assert!(out.contains("$.set(x, 1);"));
        assert!(out.contains("$.set(x, 3);"));
        assert!(out.contains("{ let x = 0; x = 2; }"));
    }

    #[test]
    fn rewrites_inside_if_block() {
        let out = transform_state_simple_assigns_ast(
            "if (cond) { x = 5; }",
            &ssv(&["x"]),
            &[],
            false,
            &[],
        )
        .unwrap();
        assert_eq!(out, "if (cond) { $.set(x, 5); }");
    }

    #[test]
    fn rewrites_inside_callback() {
        let out = transform_state_simple_assigns_ast(
            "items.forEach(it => { x = it; });",
            &ssv(&["x"]),
            &[],
            false,
            &[],
        )
        .unwrap();
        assert_eq!(out, "items.forEach(it => { $.set(x, it); });");
    }

    #[test]
    fn rewrites_multiline_rhs() {
        // Text version needed special multi-line normalization;
        // AST gets the full RHS span naturally.
        let out =
            transform_state_simple_assigns_ast("x =\n  5 + 1;", &ssv(&["x"]), &[], false, &[])
                .unwrap();
        assert_eq!(out, "$.set(x, 5 + 1);");
    }

    #[test]
    fn skips_inside_string_literal() {
        let src = r#"let s = "x = 5";"#;
        assert!(transform_state_simple_assigns_ast(src, &ssv(&["x"]), &[], false, &[]).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${x = 5}`;";
        let out = transform_state_simple_assigns_ast(src, &ssv(&["x"]), &[], false, &[]).unwrap();
        assert_eq!(out, "let s = `${$.set(x, 5)}`;");
    }

    #[test]
    fn rewrites_inside_ternary() {
        // Text version had special is_inside_ternary_expression
        // handling. AST gets the span right naturally.
        let src = "let v = cond ? (x = 1) : (x = 2);";
        let out = transform_state_simple_assigns_ast(src, &ssv(&["x"]), &[], false, &[]).unwrap();
        assert_eq!(out, "let v = cond ? ($.set(x, 1)) : ($.set(x, 2));");
    }

    #[test]
    fn handles_multiple_state_vars_in_one_line() {
        let out = transform_state_simple_assigns_ast(
            "a = 1; b = 2; c = 3;",
            &ssv(&["a", "b", "c"]),
            &[],
            false,
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.set(a, 1); $.set(b, 2); $.set(c, 3);");
    }

    #[test]
    fn skips_var_not_in_state_vars() {
        assert!(
            transform_state_simple_assigns_ast("y = 5;", &ssv(&["x"]), &[], false, &[]).is_none()
        );
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_state_simple_assigns_ast("function f( {", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
    }

    #[test]
    fn empty_state_vars_returns_none() {
        assert!(transform_state_simple_assigns_ast("x = 5;", &[], &[], false, &[]).is_none());
    }

    #[test]
    fn already_set_call_natural_skip() {
        // `$.set(x, 5)` is a CallExpression, not an
        // AssignmentExpression — visitor naturally doesn't fire.
        assert!(
            transform_state_simple_assigns_ast("$.set(x, 5);", &ssv(&["x"]), &[], false, &[])
                .is_none()
        );
    }

    #[test]
    fn proxy_needed_for_array_literal_in_runes() {
        let out = transform_state_simple_assigns_ast("x = [1, 2];", &ssv(&["x"]), &[], true, &[])
            .unwrap();
        assert_eq!(out, "$.set(x, [1, 2], true);");
    }

    #[test]
    fn proxy_not_needed_for_string_in_runes() {
        let out =
            transform_state_simple_assigns_ast(r#"x = "hello";"#, &ssv(&["x"]), &[], true, &[])
                .unwrap();
        assert_eq!(out, r#"$.set(x, "hello");"#);
    }

    /// Smoke: complex realistic body. Need an outer `let count`
    /// so the symbol-identity check sees a real outermost binding.
    #[test]
    fn smoke_complex_body() {
        let src = r#"
            let count;
            count = 1;
            function inner(count) { count = 99; }
            for (let count of items) { count = 0; }
            obj.count = 5;
            count++;
            count += 2;
        "#;
        let out =
            transform_state_simple_assigns_ast(src, &ssv(&["count"]), &[], false, &[]).unwrap();
        // Top-level `count = 1` is wrapped.
        assert!(out.contains("$.set(count, 1);"));
        // All shadow / member / compound / update cases preserved.
        assert!(out.contains("function inner(count) { count = 99; }"));
        assert!(out.contains("for (let count of items) { count = 0; }"));
        assert!(out.contains("obj.count = 5;"));
        assert!(out.contains("count++;"));
        assert!(out.contains("count += 2;"));
    }
}
