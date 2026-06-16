//! AST-based rewrite of prop and reactive-state `UpdateExpression`s.
//!
//! Replaces `transform_prop_update_expressions` and
//! `transform_state_update_expressions` in `reactive_transforms.rs`.
//! The text versions call `replace_with_word_boundary` four times
//! per variable per pass — quadratic in `prop_vars * state_vars`
//! and fragile under string / template / regex contents. The AST
//! visits each `UpdateExpression` once and dispatches on the
//! identifier name.
//!
//! Mappings (per text version, preserved exactly):
//!
//! | Source / classification           | Replacement                |
//! |-----------------------------------|----------------------------|
//! | `x++` (prop)                      | `$.update_prop(x)`         |
//! | `x--` (prop)                      | `$.update_prop(x, -1)`     |
//! | `++x` (prop)                      | `$.update_pre_prop(x)`     |
//! | `--x` (prop)                      | `$.update_pre_prop(x, -1)` |
//! | `x++` (reactive state)            | `$.update(x)`              |
//! | `x--` (reactive state)            | `$.update(x, -1)`          |
//! | `++x` (reactive state)            | `$.update_pre(x)`          |
//! | `--x` (reactive state)            | `$.update_pre(x, -1)`      |
//!
//! Reactive state = `state_vars \ non_reactive_state_vars`. Prop
//! classification takes precedence — matching the text passes,
//! which run prop first then state on the partially-rewritten text.
//!
//! Member updates (`obj.x++`, `obj[0]++`) are left alone — they
//! go through different code paths
//! (`transform_state_member_mutations`, etc.).

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::SourceType;
use oxc_syntax::operator::UpdateOperator;

thread_local! {
    static MODULE_REACTIVE_UPDATE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `x++` / `x--` / `++x` / `--x` for prop and
/// reactive-state variables. Returns `None` when there's nothing
/// to rewrite or the source fails to parse.
pub fn transform_reactive_update_ast(
    source: &str,
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
) -> Option<String> {
    if prop_vars.is_empty() && state_vars.is_empty() {
        return None;
    }

    // Fast probe — if no `++` or `--` token appears, nothing to do.
    let bytes = source.as_bytes();
    if memchr::memmem::find(bytes, b"++").is_none() && memchr::memmem::find(bytes, b"--").is_none()
    {
        return None;
    }

    MODULE_REACTIVE_UPDATE_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs()).parse();
        if !parser_ret.diagnostics.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = ReactiveUpdateCollector {
            prop_vars,
            state_vars,
            non_reactive_state_vars,
            replacements: Vec::new(),
        };
        collector.visit_program(&parser_ret.program);
        let mut replacements = collector.replacements;

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

struct ReactiveUpdateCollector<'a> {
    prop_vars: &'a [String],
    state_vars: &'a [String],
    non_reactive_state_vars: &'a [String],
    replacements: Vec<(u32, u32, String)>,
}

#[derive(Clone, Copy)]
enum Kind {
    Prop,
    State,
}

impl<'a> ReactiveUpdateCollector<'a> {
    fn classify(&self, name: &str) -> Option<Kind> {
        if self.prop_vars.iter().any(|p| p == name) {
            Some(Kind::Prop)
        } else if self.state_vars.iter().any(|s| s == name)
            && !self.non_reactive_state_vars.iter().any(|s| s == name)
        {
            Some(Kind::State)
        } else {
            None
        }
    }
}

impl<'a, 'ast> Visit<'ast> for ReactiveUpdateCollector<'a> {
    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);

        // Only bare identifiers — member targets stay on the
        // member-mutation path.
        let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &expr.argument else {
            return;
        };
        let name = id.name.as_str();
        let Some(kind) = self.classify(name) else {
            return;
        };

        let rewrite = match (kind, expr.operator, expr.prefix) {
            (Kind::Prop, UpdateOperator::Increment, false) => {
                format!("$.update_prop({})", name)
            }
            (Kind::Prop, UpdateOperator::Decrement, false) => {
                format!("$.update_prop({}, -1)", name)
            }
            (Kind::Prop, UpdateOperator::Increment, true) => {
                format!("$.update_pre_prop({})", name)
            }
            (Kind::Prop, UpdateOperator::Decrement, true) => {
                format!("$.update_pre_prop({}, -1)", name)
            }
            (Kind::State, UpdateOperator::Increment, false) => {
                format!("$.update({})", name)
            }
            (Kind::State, UpdateOperator::Decrement, false) => {
                format!("$.update({}, -1)", name)
            }
            (Kind::State, UpdateOperator::Increment, true) => {
                format!("$.update_pre({})", name)
            }
            (Kind::State, UpdateOperator::Decrement, true) => {
                format!("$.update_pre({}, -1)", name)
            }
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
    fn prop_postfix_inc() {
        let out = transform_reactive_update_ast("x++;", &ssv(&["x"]), &[], &[]).unwrap();
        assert_eq!(out, "$.update_prop(x);");
    }

    #[test]
    fn prop_postfix_dec() {
        let out = transform_reactive_update_ast("x--;", &ssv(&["x"]), &[], &[]).unwrap();
        assert_eq!(out, "$.update_prop(x, -1);");
    }

    #[test]
    fn prop_prefix_inc() {
        let out = transform_reactive_update_ast("++x;", &ssv(&["x"]), &[], &[]).unwrap();
        assert_eq!(out, "$.update_pre_prop(x);");
    }

    #[test]
    fn prop_prefix_dec() {
        let out = transform_reactive_update_ast("--x;", &ssv(&["x"]), &[], &[]).unwrap();
        assert_eq!(out, "$.update_pre_prop(x, -1);");
    }

    #[test]
    fn state_postfix_inc() {
        let out = transform_reactive_update_ast("count++;", &[], &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "$.update(count);");
    }

    #[test]
    fn state_postfix_dec() {
        let out = transform_reactive_update_ast("count--;", &[], &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "$.update(count, -1);");
    }

    #[test]
    fn state_prefix_inc() {
        let out = transform_reactive_update_ast("++count;", &[], &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "$.update_pre(count);");
    }

    #[test]
    fn state_prefix_dec() {
        let out = transform_reactive_update_ast("--count;", &[], &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "$.update_pre(count, -1);");
    }

    #[test]
    fn non_reactive_state_left_alone() {
        // state but flagged non-reactive → no rewrite
        assert!(
            transform_reactive_update_ast("count++;", &[], &ssv(&["count"]), &ssv(&["count"]))
                .is_none()
        );
    }

    #[test]
    fn prop_takes_precedence_over_state() {
        // If a name is in BOTH prop_vars and state_vars, prop wins
        // (matches the text version's two-pass order).
        let out = transform_reactive_update_ast("x++;", &ssv(&["x"]), &ssv(&["x"]), &[]).unwrap();
        assert_eq!(out, "$.update_prop(x);");
    }

    #[test]
    fn unknown_var_left_alone() {
        assert!(transform_reactive_update_ast("y++;", &ssv(&["x"]), &[], &[]).is_none());
    }

    #[test]
    fn member_update_left_alone() {
        // `obj.x++` is a member update, goes through a different path
        assert!(transform_reactive_update_ast("obj.x++;", &ssv(&["x"]), &[], &[]).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "x++";"#;
        assert!(transform_reactive_update_ast(src, &ssv(&["x"]), &[], &[]).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${x++}`;";
        let out = transform_reactive_update_ast(src, &ssv(&["x"]), &[], &[]).unwrap();
        assert_eq!(out, "let s = `${$.update_prop(x)}`;");
    }

    #[test]
    fn multiple_updates_in_one_source() {
        let out =
            transform_reactive_update_ast("a++; b--; ++c;", &ssv(&["a"]), &ssv(&["b", "c"]), &[])
                .unwrap();
        assert_eq!(out, "$.update_prop(a); $.update(b, -1); $.update_pre(c);");
    }

    #[test]
    fn empty_inputs_no_op() {
        assert!(transform_reactive_update_ast("x++;", &[], &[], &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_reactive_update_ast("x++ + (", &ssv(&["x"]), &[], &[]).is_none());
    }

    #[test]
    fn no_op_without_update_token() {
        // Fast-path probe: no `++` or `--` anywhere → bail before parsing.
        assert!(
            transform_reactive_update_ast("let x = 1; foo(x);", &ssv(&["x"]), &[], &[]).is_none()
        );
    }

    #[test]
    fn for_loop_step_update() {
        let out = transform_reactive_update_ast(
            "for (let i = 0; i < 10; i++) { x++; }",
            &ssv(&["x"]),
            &[],
            &[],
        )
        .unwrap();
        // The loop counter `i` is not a prop/state var → untouched.
        // `x++` in the body → rewritten.
        assert_eq!(out, "for (let i = 0; i < 10; i++) { $.update_prop(x); }");
    }

    #[test]
    fn nested_update_in_call() {
        let out = transform_reactive_update_ast("foo(x++, y--);", &ssv(&["x"]), &ssv(&["y"]), &[])
            .unwrap();
        assert_eq!(out, "foo($.update_prop(x), $.update(y, -1));");
    }
}
