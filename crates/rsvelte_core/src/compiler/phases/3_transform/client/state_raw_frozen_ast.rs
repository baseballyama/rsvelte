//! AST-based rewrite of `$state.raw(value)` and `$state.frozen(value)`
//! call expressions in module scripts (`.svelte.js` / `.svelte.ts`).
//!
//! These two runes behave identically at the runtime layer — both
//! emit a raw (un-proxied) value. The wrapper depends on whether
//! the *enclosing* binding is reassigned somewhere in the module:
//!
//! * If the binding *is* reassigned (the common case) the value
//!   has to live in a runtime `$.state(...)` cell so the writes
//!   trigger reactivity.
//! * If the binding is `const` or simply never reassigned, the
//!   call collapses to the raw value — no cell, no `.get()` reads.
//!
//! The caller (`transform_module_script_runes`) pre-computes the
//! "non-reactive" set and passes it in.
//!
//! Replaces the text-based pass that scanned the source for
//! `$state.raw(` / `$state.frozen(`, found the closing paren via
//! a custom brace tracker, then walked backwards to find the
//! enclosing `let X = ` to extract the binding name. The AST
//! visitor gets all of that for free: the OXC parser knows about
//! strings / regexes / templates so the rewrite can't be tripped by
//! the same-shaped bytes inside a string literal, and `BindingPattern`
//! gives us the variable name directly.

use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_span::GetSpan;

use super::ast_rewrite::Edit;

/// Collect the `$state.raw(x)` / `$state.frozen(x)` rewrite edits for an
/// already-parsed program. Shared with the batched module-rune driver so the
/// raw/frozen rewrite can ride along on a single parse. `source` must be the
/// exact text `program` was parsed from (spans index into it).
pub(super) fn collect_raw_frozen_edits(
    program: &Program<'_>,
    source: &str,
    non_reactive_vars: &[String],
) -> Vec<Edit> {
    let mut collector = StateRawFrozenCollector {
        source,
        non_reactive_vars,
        current_var: None,
        replacements: Vec::new(),
    };
    collector.visit_program(program);
    collector.replacements
}

/// Stateful visitor — `current_var` tracks the binding being
/// initialised so the call-expression rewrite knows which name to
/// look up in `non_reactive_vars`. Only the plain `let x = …`
/// shape sets the name; destructuring / class fields / assignment
/// expressions leave `current_var` empty, which (mirroring the text
/// version's `extract_var_name_before_rune` behaviour) falls into
/// the reactive branch — never emit a bare value for those.
struct StateRawFrozenCollector<'a, 'src> {
    source: &'src str,
    non_reactive_vars: &'a [String],
    current_var: Option<String>,
    replacements: Vec<Edit>,
}

impl<'a, 'src, 'ast> Visit<'ast> for StateRawFrozenCollector<'a, 'src> {
    fn visit_variable_declarator(&mut self, decl: &VariableDeclarator<'ast>) {
        let saved = self.current_var.take();
        // Only single binding identifiers — destructuring patterns
        // don't have a single name to forward, so we leave
        // `current_var` empty and fall through to the reactive branch.
        if let BindingPattern::BindingIdentifier(id) = &decl.id {
            self.current_var = Some(id.name.to_string());
        }
        walk::walk_variable_declarator(self, decl);
        self.current_var = saved;
    }

    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        // Walk children first so a nested `$state.raw($state.raw(x))`
        // (unlikely but legal) still emits both rewrites.
        walk::walk_call_expression(self, call);

        let Expression::StaticMemberExpression(member) = &call.callee else {
            return;
        };
        let Expression::Identifier(obj) = &member.object else {
            return;
        };
        if obj.name != "$state" {
            return;
        }
        let prop = member.property.name.as_str();
        if prop != "raw" && prop != "frozen" {
            return;
        }

        // The replacement text is the raw arg expression, or the
        // literal `void 0` when the call has no argument.
        let value_text = if let Some(arg) = call.arguments.first() {
            let span = arg.span();
            self.source[span.start as usize..span.end as usize].to_string()
        } else {
            "void 0".to_string()
        };

        let is_non_reactive = self
            .current_var
            .as_deref()
            .is_some_and(|name| self.non_reactive_vars.iter().any(|v| v == name));

        let rewrite = if is_non_reactive {
            value_text
        } else {
            format!("$.state({})", value_text)
        };

        self.replacements
            .push((call.span.start, call.span.end, rewrite));
    }
}

#[cfg(test)]
mod tests {
    use std::cell::RefCell;

    use oxc_allocator::Allocator;
    use oxc_parser::ParseOptions;
    use oxc_span::SourceType;

    use super::super::ast_rewrite;
    use super::*;

    thread_local! {
        static TEST_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
    }

    /// Drives `collect_raw_frozen_edits` in isolation over its own parse —
    /// mirrors how the batched module-rune driver runs it, but for the
    /// raw/frozen rewrite alone so these assertions stay scoped to this pass.
    fn transform_state_raw_frozen_ast(
        source: &str,
        non_reactive_vars: &[String],
        is_ts: bool,
    ) -> Option<String> {
        if memchr::memmem::find(source.as_bytes(), b"$state.raw").is_none()
            && memchr::memmem::find(source.as_bytes(), b"$state.frozen").is_none()
        {
            return None;
        }
        ast_rewrite::rewrite_once(
            &TEST_ALLOC,
            source,
            if is_ts {
                SourceType::ts().with_module(true)
            } else {
                SourceType::mjs()
            },
            ParseOptions::default(),
            false,
            |program| collect_raw_frozen_edits(program, source, non_reactive_vars),
        )
    }

    fn nrv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn raw_reactive_wraps_in_state() {
        let out = transform_state_raw_frozen_ast("let x = $state.raw(0);", &[], false).unwrap();
        assert_eq!(out, "let x = $.state(0);");
    }

    #[test]
    fn frozen_reactive_wraps_in_state() {
        let out =
            transform_state_raw_frozen_ast("let x = $state.frozen({a: 1});", &[], false).unwrap();
        assert_eq!(out, "let x = $.state({a: 1});");
    }

    #[test]
    fn raw_non_reactive_emits_value() {
        let nrv = nrv(&["x"]);
        let out = transform_state_raw_frozen_ast("let x = $state.raw(42);", &nrv, false).unwrap();
        assert_eq!(out, "let x = 42;");
    }

    #[test]
    fn frozen_non_reactive_emits_value() {
        let nrv = nrv(&["x"]);
        let out =
            transform_state_raw_frozen_ast("let x = $state.frozen({a: 1});", &nrv, false).unwrap();
        assert_eq!(out, "let x = {a: 1};");
    }

    #[test]
    fn empty_call_uses_void_zero() {
        // `$state.raw()` with no arg → `$.state(void 0)`
        let out = transform_state_raw_frozen_ast("let x = $state.raw();", &[], false).unwrap();
        assert_eq!(out, "let x = $.state(void 0);");

        // Non-reactive case: bare `void 0`.
        let nrv = nrv(&["x"]);
        let out2 = transform_state_raw_frozen_ast("let x = $state.raw();", &nrv, false).unwrap();
        assert_eq!(out2, "let x = void 0;");
    }

    #[test]
    fn multiple_calls_mixed_reactivity() {
        let nrv = nrv(&["frozen"]);
        let src = "let a = $state.raw(1); let frozen = $state.frozen(2);";
        let out = transform_state_raw_frozen_ast(src, &nrv, false).unwrap();
        assert_eq!(out, "let a = $.state(1); let frozen = 2;");
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        // The whole point of the AST migration — the text version
        // would have rewritten the bytes inside this string.
        let src = r#"let s = "$state.raw(x)";"#;
        assert!(transform_state_raw_frozen_ast(src, &[], false).is_none());
    }

    #[test]
    fn does_not_rewrite_static_template() {
        let src = "let s = `$state.raw(x)`;";
        assert!(transform_state_raw_frozen_ast(src, &[], false).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${$state.raw(1)}`;";
        let out = transform_state_raw_frozen_ast(src, &[], false).unwrap();
        assert_eq!(out, "let s = `${$.state(1)}`;");
    }

    #[test]
    fn destructuring_pattern_falls_to_reactive_branch() {
        // The text version's `extract_var_name_before_rune` couldn't
        // pull a single name from destructuring; mirror that here by
        // leaving `current_var = None` (reactive branch) for
        // destructured declarators.
        let src = "let { a } = $state.raw(obj);";
        let nrv = nrv(&["a"]);
        let out = transform_state_raw_frozen_ast(src, &nrv, false).unwrap();
        // `a` would be the destructured key, not the declarator's
        // binding name. We don't know which AST shape the source
        // uses, so the safe answer is the reactive `$.state(...)`
        // wrap.
        assert_eq!(out, "let { a } = $.state(obj);");
    }

    #[test]
    fn bare_call_without_assignment_is_reactive() {
        // `$state.raw(x)` standalone — no enclosing declarator means
        // `current_var = None`, so the reactive branch fires.
        let src = "fn($state.raw(value));";
        let out = transform_state_raw_frozen_ast(src, &[], false).unwrap();
        assert_eq!(out, "fn($.state(value));");
    }

    #[test]
    fn leaves_other_state_methods_alone() {
        for src in ["$state(x)", "$state.snapshot(x)", "$state.bogus(x)"] {
            assert!(
                transform_state_raw_frozen_ast(src, &[], false).is_none(),
                "should not rewrite: {src}"
            );
        }
    }

    #[test]
    fn ts_source_works() {
        let src = "let x: number = $state.raw(1);";
        let nrv = nrv(&["x"]);
        let out = transform_state_raw_frozen_ast(src, &nrv, true).unwrap();
        assert!(out.contains("let x: number = 1;"));
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_state_raw_frozen_ast("let x = $state.raw(", &[], false).is_none());
    }

    #[test]
    fn no_op_without_keyword() {
        assert!(transform_state_raw_frozen_ast("let x = 1;", &[], false).is_none());
    }
}
