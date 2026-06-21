//! AST-based collapse of `$.derived(() => NAME())` to `$.derived(NAME)` when
//! `NAME` is a derived binding (Svelte 5.55.5 upstream `b771df3`).
//!
//! Replaces the byte scanner `unthunk_bare_derived_arg`, which matched the
//! literal prefix `$.derived(() => ` and required the exact tail `NAME())`. The
//! input here has already been through `wrap_derived_reads_in_script` (so a bare
//! derived read is `NAME()`), and `$.derived(() => NAME())` is valid JS, so it
//! re-parses cleanly. oxc gives the shape structurally: a `$.derived(...)` call
//! with a single parameterless expression-bodied arrow whose body is a 0-arg,
//! non-optional call of a derived identifier. Output is byte-identical to the
//! scanner; the caller falls back to it on a parse failure.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType};
use rustc_hash::FxHashSet;

use super::super::shared::ast_rewrite;

thread_local! {
    static UNTHUNK_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Collapse `$.derived(() => NAME())` → `$.derived(NAME)` for every derived
/// `NAME`. Returns `Some(rewritten)` when at least one call collapsed, `None`
/// on a parse failure or when nothing matched (caller falls back to the byte
/// scanner).
pub(crate) fn unthunk_bare_derived_arg_ast(
    script: &str,
    derived_names: &FxHashSet<String>,
) -> Option<String> {
    if derived_names.is_empty() {
        return None;
    }
    ast_rewrite::rewrite_once(
        &UNTHUNK_ALLOC,
        script,
        SourceType::mjs(),
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        // The replacement (arrow span → bare name) never contains another edit's
        // span, so no innermost-only deferral is needed.
        false,
        |program| {
            let mut collector = UnthunkCollector {
                derived_names,
                edits: Vec::new(),
            };
            collector.visit_program(program);
            collector.edits
        },
    )
}

struct UnthunkCollector<'a> {
    derived_names: &'a FxHashSet<String>,
    edits: Vec<ast_rewrite::Edit>,
}

impl<'a> UnthunkCollector<'a> {
    /// If `expr` is a parameterless expression-bodied arrow `() => NAME()` whose
    /// body is a 0-arg non-optional call of a derived identifier, return that
    /// derived name.
    fn derived_thunk_name<'ast>(&self, expr: &Expression<'ast>) -> Option<&'ast str> {
        let Expression::ArrowFunctionExpression(arrow) = expr else {
            return None;
        };
        if !arrow.expression || !arrow.params.items.is_empty() || arrow.params.rest.is_some() {
            return None;
        }
        // An expression-bodied arrow stores its value as the single statement.
        let [Statement::ExpressionStatement(stmt)] = arrow.body.statements.as_slice() else {
            return None;
        };
        let Expression::CallExpression(call) = &stmt.expression else {
            return None;
        };
        if call.optional || !call.arguments.is_empty() {
            return None;
        }
        let Expression::Identifier(callee) = &call.callee else {
            return None;
        };
        self.derived_names
            .contains(callee.name.as_str())
            .then_some(callee.name.as_str())
    }
}

impl<'a, 'ast> Visit<'ast> for UnthunkCollector<'a> {
    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        // Match `$.derived(<single arg>)`.
        if let Expression::StaticMemberExpression(member) = &call.callee
            && !member.optional
            && member.property.name == "derived"
            && matches!(&member.object, Expression::Identifier(obj) if obj.name == "$")
            && call.arguments.len() == 1
            && let Some(arg) = call.arguments[0].as_expression()
            && let Some(name) = self.derived_thunk_name(arg)
        {
            // Replace the whole arrow argument with the bare derived name.
            let span = arg.span();
            self.edits.push((span.start, span.end, name.to_string()));
        }
        walk::walk_call_expression(self, call);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn names(v: &[&str]) -> FxHashSet<String> {
        v.iter().map(|s| s.to_string()).collect()
    }

    fn unthunk(script: &str, derived: &[&str]) -> Option<String> {
        unthunk_bare_derived_arg_ast(script, &names(derived))
    }

    #[test]
    fn collapses_bare_derived_thunk() {
        assert_eq!(
            unthunk("let d = $.derived(() => visible());", &["visible"]).unwrap(),
            "let d = $.derived(visible);"
        );
    }

    #[test]
    fn leaves_non_derived_thunk() {
        // `other` is not a derived — a genuine thunk body, left alone.
        assert!(unthunk("let d = $.derived(() => other());", &["visible"]).is_none());
    }

    #[test]
    fn leaves_thunk_with_args() {
        assert!(unthunk("let d = $.derived(() => visible(x));", &["visible"]).is_none());
    }

    #[test]
    fn leaves_non_thunk_body() {
        // `() => a + b` is a real computation, not a bare derived read.
        assert!(unthunk("let d = $.derived(() => a + b);", &["a"]).is_none());
    }

    #[test]
    fn leaves_parameterized_arrow() {
        assert!(unthunk("let d = $.derived((x) => visible());", &["visible"]).is_none());
    }
}
