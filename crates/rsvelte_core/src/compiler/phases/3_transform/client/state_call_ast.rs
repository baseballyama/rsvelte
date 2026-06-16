//! AST-based rewrite of `$state(value)` call expressions in module
//! scripts (`.svelte.js` / `.svelte.ts`).
//!
//! Output depends on three axes:
//!
//! * Whether the enclosing binding is reassigned somewhere
//!   (computed by the caller and passed in via `non_reactive_vars`).
//! * Whether the argument value needs `$.proxy(...)` wrapping
//!   (object / array / await — delegated to the existing
//!   `expression_utils::expression_needs_proxy` helper, which
//!   operates on the source text of the argument expression).
//! * Whether the argument list is empty.
//!
//! Combined truth table (mirrors the text predecessor):
//!
//! | reactive | needs_proxy | empty | rewrite                          |
//! |----------|-------------|-------|----------------------------------|
//! | yes      | yes         | n/a   | `$.state($.proxy(value))`        |
//! | yes      | no          | no    | `$.state(value)`                 |
//! | yes      | n/a         | yes   | `$.state(void 0)`                |
//! | no       | yes         | n/a   | `$.proxy(value)`                 |
//! | no       | no          | no    | `value` (raw, no wrapper)        |
//! | no       | n/a         | yes   | `void 0`                         |
//!
//! Replaces the text-based pass that scanned for `$state(`, found
//! the matching close-paren via a custom brace tracker, then walked
//! backwards through the source to discover the declarator name.
//! Same fragility class as the previous state-rune migrations:
//! string / template / regex contents could confuse the heuristic.
//! The AST visitor descends only into expression positions and
//! reads the binding name straight off the `BindingIdentifier`.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};

use super::expression_utils::{collapse_to_single_line, expression_needs_proxy_with_scope};

thread_local! {
    static MODULE_STATE_CALL_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `$state(value)`.
///
/// `non_reactive_vars` lists module-level bindings that are known
/// never to be reassigned. Returns `None` when nothing changed.
pub fn transform_state_call_ast(
    source: &str,
    non_reactive_vars: &[String],
    non_proxy_vars: &[String],
    is_ts: bool,
) -> Option<String> {
    memchr::memmem::find(source.as_bytes(), b"$state")?;

    MODULE_STATE_CALL_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let source_type = if is_ts {
            SourceType::ts().with_module(true)
        } else {
            SourceType::mjs()
        };
        let parser_ret = Parser::new(&allocator, source, source_type).parse();
        if !parser_ret.diagnostics.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = StateCallCollector {
            source,
            non_reactive_vars,
            non_proxy_vars,
            current_var: None,
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

/// Stateful visitor — `current_var` tracks the binding name being
/// initialised so the call-expression rewrite knows which non-reactive
/// list to consult. Destructuring patterns leave `current_var` empty
/// (mirrors the text version), falling into the reactive branch.
struct StateCallCollector<'a, 'src> {
    source: &'src str,
    non_reactive_vars: &'a [String],
    non_proxy_vars: &'a [String],
    current_var: Option<String>,
    replacements: Vec<(u32, u32, String)>,
}

impl<'a, 'src, 'ast> Visit<'ast> for StateCallCollector<'a, 'src> {
    fn visit_variable_declarator(&mut self, decl: &VariableDeclarator<'ast>) {
        let saved = self.current_var.take();
        if let BindingPattern::BindingIdentifier(id) = &decl.id {
            self.current_var = Some(id.name.to_string());
        }
        walk::walk_variable_declarator(self, decl);
        self.current_var = saved;
    }

    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        walk::walk_call_expression(self, call);

        // Match callee == bare Identifier `$state` (not `$state.x`).
        let Expression::Identifier(id) = &call.callee else {
            return;
        };
        if id.name != "$state" {
            return;
        }

        // Pull arg text directly from source so any formatting the
        // user wrote (multiline objects, comments) round-trips
        // verbatim — same as the text predecessor.
        let (content, trimmed_is_empty) = if let Some(arg) = call.arguments.first() {
            let span = arg.span();
            let text = &self.source[span.start as usize..span.end as usize];
            (text.to_string(), text.trim().is_empty())
        } else {
            (String::new(), true)
        };
        let collapsed = collapse_to_single_line(&content);

        let is_non_reactive = self
            .current_var
            .as_deref()
            .is_some_and(|name| self.non_reactive_vars.iter().any(|v| v == name));
        let needs_proxy = !trimmed_is_empty
            && expression_needs_proxy_with_scope(content.trim(), self.non_proxy_vars);

        let rewrite = match (is_non_reactive, needs_proxy, trimmed_is_empty) {
            (true, true, _) => format!("$.proxy({})", collapsed),
            (true, false, true) => "void 0".to_string(),
            (true, false, false) => collapsed,
            (false, true, _) => format!("$.state($.proxy({}))", collapsed),
            (false, false, true) => "$.state(void 0)".to_string(),
            (false, false, false) => format!("$.state({})", collapsed),
        };

        self.replacements
            .push((call.span.start, call.span.end, rewrite));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn nrv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    // --- reactive cases (binding not in non_reactive_vars) ---

    #[test]
    fn reactive_primitive_wraps_in_state() {
        let out = transform_state_call_ast("let x = $state(0);", &[], &[], false).unwrap();
        assert_eq!(out, "let x = $.state(0);");
    }

    #[test]
    fn reactive_object_wraps_in_state_proxy() {
        let out = transform_state_call_ast("let x = $state({a: 1});", &[], &[], false).unwrap();
        assert_eq!(out, "let x = $.state($.proxy({a: 1}));");
    }

    #[test]
    fn reactive_array_wraps_in_state_proxy() {
        let out = transform_state_call_ast("let x = $state([1, 2, 3]);", &[], &[], false).unwrap();
        assert_eq!(out, "let x = $.state($.proxy([1, 2, 3]));");
    }

    #[test]
    fn reactive_empty_emits_state_void_zero() {
        let out = transform_state_call_ast("let x = $state();", &[], &[], false).unwrap();
        assert_eq!(out, "let x = $.state(void 0);");
    }

    // --- non-reactive cases (binding in non_reactive_vars) ---

    #[test]
    fn non_reactive_primitive_emits_value() {
        let nrv = nrv(&["x"]);
        let out = transform_state_call_ast("let x = $state(42);", &nrv, &[], false).unwrap();
        assert_eq!(out, "let x = 42;");
    }

    #[test]
    fn non_reactive_object_emits_proxy() {
        let nrv = nrv(&["x"]);
        let out = transform_state_call_ast("let x = $state({a: 1});", &nrv, &[], false).unwrap();
        assert_eq!(out, "let x = $.proxy({a: 1});");
    }

    #[test]
    fn non_reactive_array_emits_proxy() {
        let nrv = nrv(&["x"]);
        let out = transform_state_call_ast("let x = $state([1, 2]);", &nrv, &[], false).unwrap();
        assert_eq!(out, "let x = $.proxy([1, 2]);");
    }

    #[test]
    fn non_reactive_empty_emits_void_zero() {
        let nrv = nrv(&["x"]);
        let out = transform_state_call_ast("let x = $state();", &nrv, &[], false).unwrap();
        assert_eq!(out, "let x = void 0;");
    }

    // --- shape edge cases ---

    #[test]
    fn destructuring_falls_to_reactive_branch() {
        let nrv = nrv(&["x"]);
        let src = "let { x } = $state({a: 1});";
        let out = transform_state_call_ast(src, &nrv, &[], false).unwrap();
        // current_var is None for destructuring → reactive branch
        assert_eq!(out, "let { x } = $.state($.proxy({a: 1}));");
    }

    #[test]
    fn bare_call_without_declarator_is_reactive() {
        // No enclosing declarator → reactive branch. The arg
        // `value` is an Identifier, which `expression_needs_proxy`
        // treats as proxy-needing (identifiers can resolve to
        // objects/arrays at runtime), so the rewrite is the full
        // `$.state($.proxy(value))` shape.
        let src = "fn($state(value));";
        let out = transform_state_call_ast(src, &[], &[], false).unwrap();
        assert_eq!(out, "fn($.state($.proxy(value)));");
    }

    #[test]
    fn bare_call_with_literal_arg_is_reactive_primitive() {
        // Literal arg doesn't need a proxy, so the rewrite is the
        // primitive shape `$.state(0)`.
        let src = "fn($state(0));";
        let out = transform_state_call_ast(src, &[], &[], false).unwrap();
        assert_eq!(out, "fn($.state(0));");
    }

    #[test]
    fn leaves_state_member_calls_alone() {
        // $state.raw / $state.snapshot are not bare `$state(...)`.
        for src in ["$state.raw(x)", "$state.snapshot(x)", "$state.frozen(x)"] {
            assert!(
                transform_state_call_ast(src, &[], &[], false).is_none(),
                "should not rewrite: {src}"
            );
        }
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "$state(x)";"#;
        assert!(transform_state_call_ast(src, &[], &[], false).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${$state(0)}`;";
        let out = transform_state_call_ast(src, &[], &[], false).unwrap();
        assert_eq!(out, "let s = `${$.state(0)}`;");
    }

    #[test]
    fn ts_source_works() {
        let nrv = nrv(&["x"]);
        let src = "let x: number = $state(1);";
        let out = transform_state_call_ast(src, &nrv, &[], true).unwrap();
        assert!(out.contains("let x: number = 1;"));
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_state_call_ast("let x = $state(", &[], &[], false).is_none());
    }

    #[test]
    fn no_op_without_keyword() {
        assert!(transform_state_call_ast("let x = 1;", &[], &[], false).is_none());
    }
}
