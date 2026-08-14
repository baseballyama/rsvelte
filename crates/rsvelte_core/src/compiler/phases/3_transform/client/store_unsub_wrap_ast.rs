//! AST-based rewrite of `$.set(state_var, ...)` →
//! `$.store_unsub($.set(state_var, ...), '$state_var', $$stores)`.
//!
//! Replaces `state_transforms.rs::wrap_store_unsub_for_state_sets`
//! (lines 2227+). The text version manually finds the matching
//! closing paren of `$.set(`, navigating string-literal and
//! template-literal escapes. The AST visitor walks the
//! `CallExpression` directly.
//!
//! Mapping (preserved exactly):
//!
//! | Source                  | Replacement                                                |
//! |-------------------------|------------------------------------------------------------|
//! | `$.set(var, expr)`      | `$.store_unsub($.set(var, expr), '$var', $$stores)`        |
//! | `$.set(var, expr, true)`| `$.store_unsub($.set(var, expr, true), '$var', $$stores)`  |
//!
//! Where `var` is a state variable AND `$var` (the store-sub form)
//! is in `store_sub_vars`.
//!
//! ## Idempotency
//!
//! Once wrapped, the outer call is `$.store_unsub(...)`. Its first
//! argument is the inner `$.set(...)` CallExpression. A naive
//! visitor would re-wrap the inner. We detect the wrap shape via
//! `visit_call_expression`: when callee is `$.store_unsub` and
//! arg[0] is a `$.set(<id>, ...)` matching one of our state_vars,
//! mark that inner call's span as "skip".

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::SourceType;
use oxc_span::Span;

use super::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_STORE_UNSUB_WRAP_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// AST-based rewrite of `$.set(var, expr[, true])` wraps for
/// state vars that have a corresponding store-sub binding.
/// Returns `None` when there's nothing to rewrite or the source
/// fails to parse.
pub fn transform_store_unsub_wrap_ast(
    source: &str,
    state_vars: &[String],
    store_sub_vars: &[String],
) -> Option<String> {
    let spliced = || transform_store_unsub_wrap_spliced(source, state_vars, store_sub_vars);
    ast_rewrite::dual_run::resolve("store_unsub_wrap_ast:inplace", source, spliced, || {
        transform_store_unsub_wrap_in_place(source, state_vars, store_sub_vars)
    })
}

fn transform_store_unsub_wrap_spliced(
    source: &str,
    state_vars: &[String],
    store_sub_vars: &[String],
) -> Option<String> {
    if state_vars.is_empty() || store_sub_vars.is_empty() {
        return None;
    }
    // Fast probe — bail if no `$.set(` appears at all.
    memchr::memmem::find(source.as_bytes(), b"$.set(")?;

    ast_rewrite::fixed_point(source, |src| {
        ast_rewrite::rewrite_once(
            &MODULE_STORE_UNSUB_WRAP_ALLOC,
            src,
            SourceType::mjs(),
            ParseOptions::default(),
            true,
            |program| {
                let mut collector = StoreUnsubWrapCollector {
                    source: src,
                    state_vars,
                    store_sub_vars,
                    replacements: Vec::new(),
                    skip_set_spans: Vec::new(),
                };
                collector.visit_program(program);
                let mut replacements = collector.replacements;
                let skip = collector.skip_set_spans;
                replacements
                    .retain(|(s, e, _)| !skip.iter().any(|(s2, e2)| *s2 == *s && *e2 == *e));
                replacements
            },
        )
    })
}

struct StoreUnsubWrapCollector<'a> {
    source: &'a str,
    state_vars: &'a [String],
    store_sub_vars: &'a [String],
    replacements: Vec<Edit>,
    /// Spans of `$.set(...)` calls already wrapped in
    /// `$.store_unsub`.
    skip_set_spans: Vec<(u32, u32)>,
}

impl<'a> StoreUnsubWrapCollector<'a> {
    fn callee_is_dollar_member(callee: &Expression<'_>, member: &str) -> bool {
        let Expression::StaticMemberExpression(m) = callee else {
            return false;
        };
        if m.property.name.as_str() != member {
            return false;
        }
        let Expression::Identifier(id) = &m.object else {
            return false;
        };
        id.name.as_str() == "$"
    }
}

impl<'a, 'ast> Visit<'ast> for StoreUnsubWrapCollector<'a> {
    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        // Detect wrap shape: `$.store_unsub($.set(<id>, ...), '$var',
        // $$stores)`. If found, mark the inner `$.set(...)`
        // CallExpression's span as already-wrapped.
        if call.arguments.len() == 3
            && Self::callee_is_dollar_member(&call.callee, "store_unsub")
            && let Argument::CallExpression(inner_set) = &call.arguments[0]
            && Self::callee_is_dollar_member(&inner_set.callee, "set")
            && let Some(Argument::Identifier(arg0)) = inner_set.arguments.first()
            && self.state_vars.iter().any(|s| s == arg0.name.as_str())
        {
            self.skip_set_spans
                .push((inner_set.span.start, inner_set.span.end));
        }

        walk::walk_call_expression(self, call);

        // Match `$.set(<id>, ...)` calls and emit the wrap.
        if !Self::callee_is_dollar_member(&call.callee, "set") {
            return;
        }
        let Some(Argument::Identifier(state_id)) = call.arguments.first() else {
            return;
        };
        let state_name = state_id.name.as_str();
        if !self.state_vars.iter().any(|s| s == state_name) {
            return;
        }
        // Verify $state_name is in store_sub_vars
        let store_sub_name = format!("${}", state_name);
        if !self.store_sub_vars.iter().any(|s| s == &store_sub_name) {
            return;
        }

        let set_text = &self.source[call.span.start as usize..call.span.end as usize];
        let rewrite = format!(
            "$.store_unsub({}, '{}', $$stores)",
            set_text, store_sub_name
        );
        self.replacements
            .push((call.span.start, call.span.end, rewrite));
    }
}

// ── in-place port ──────────────────────────────────────────────────────

thread_local! {
    static MODULE_STORE_UNSUB_WRAP_IN_PLACE_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// In-place equivalent of [`transform_store_unsub_wrap_ast`].
pub(crate) fn transform_store_unsub_wrap_in_place(
    source: &str,
    state_vars: &[String],
    store_sub_vars: &[String],
) -> ast_rewrite::Rewrite {
    if state_vars.is_empty() || store_sub_vars.is_empty() {
        return ast_rewrite::Rewrite::Unchanged;
    }
    if memchr::memmem::find(source.as_bytes(), b"$.set(").is_none() {
        return ast_rewrite::Rewrite::Unchanged;
    }

    ast_rewrite::with_program_mut(
        &MODULE_STORE_UNSUB_WRAP_IN_PLACE_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions::default(),
        |allocator, program| {
            let mut rewriter = StoreUnsubWrapRewriter {
                b: crate::compiler::phases::phase3_transform::builders::B::new(allocator),
                state_vars,
                store_sub_vars,
                skip_set_spans: Vec::new(),
                changed: false,
            };
            oxc_ast_visit::VisitMut::visit_program(&mut rewriter, program);
            rewriter.changed
        },
    )
}

struct StoreUnsubWrapRewriter<'a, 'b> {
    b: crate::compiler::phases::phase3_transform::builders::B<'a>,
    state_vars: &'b [String],
    store_sub_vars: &'b [String],
    skip_set_spans: Vec<Span>,
    changed: bool,
}

impl<'a, 'b> StoreUnsubWrapRewriter<'a, 'b> {
    fn note_existing_wrap(&mut self, expr: &Expression<'a>) {
        if let Expression::CallExpression(call) = expr
            && call.arguments.len() == 3
            && StoreUnsubWrapCollector::callee_is_dollar_member(&call.callee, "store_unsub")
            && let Argument::CallExpression(inner_set) = &call.arguments[0]
            && StoreUnsubWrapCollector::callee_is_dollar_member(&inner_set.callee, "set")
            && let Some(Argument::Identifier(arg0)) = inner_set.arguments.first()
            && self.state_vars.iter().any(|s| s == arg0.name.as_str())
        {
            self.skip_set_spans.push(inner_set.span);
        }
    }

    /// The `$var` store-sub name for a `$.set` target, when one exists.
    fn store_sub_of(&self, state_name: &str) -> Option<String> {
        if !self.state_vars.iter().any(|s| s == state_name) {
            return None;
        }
        let store_sub_name = format!("${}", state_name);
        self.store_sub_vars
            .iter()
            .any(|s| s == &store_sub_name)
            .then_some(store_sub_name)
    }
}

impl<'a, 'b> oxc_ast_visit::VisitMut<'a> for StoreUnsubWrapRewriter<'a, 'b> {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        self.note_existing_wrap(expr);
        // Children first, so a nested `$.set` is wrapped before its enclosing
        // one — what the splice path's fixed-point loop was reaching for.
        oxc_ast_visit::walk_mut::walk_expression(self, expr);

        let Expression::CallExpression(call) = &*expr else {
            return;
        };
        if self.skip_set_spans.contains(&call.span)
            || !StoreUnsubWrapCollector::callee_is_dollar_member(&call.callee, "set")
        {
            return;
        }
        let Some(Argument::Identifier(state_id)) = call.arguments.first() else {
            return;
        };
        let Some(store_sub_name) = self.store_sub_of(state_id.name.as_str()) else {
            return;
        };

        let taken = std::mem::replace(expr, self.b.void0());
        *expr = self.b.call(
            "$.store_unsub",
            vec![taken, self.b.string(&store_sub_name), self.b.id("$$stores")],
        );
        self.changed = true;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn simple_set_wrapped() {
        let out = transform_store_unsub_wrap_ast(
            "$.set(foo, writable(42));",
            &ssv(&["foo"]),
            &ssv(&["$foo"]),
        )
        .unwrap();
        assert_eq!(
            out,
            "$.store_unsub($.set(foo, writable(42)), '$foo', $$stores);"
        );
    }

    #[test]
    fn set_with_true_flag_wrapped() {
        let out = transform_store_unsub_wrap_ast(
            "$.set(foo, value, true);",
            &ssv(&["foo"]),
            &ssv(&["$foo"]),
        )
        .unwrap();
        assert_eq!(
            out,
            "$.store_unsub($.set(foo, value, true), '$foo', $$stores);"
        );
    }

    #[test]
    fn state_without_store_sub_left_alone() {
        // `foo` is in state_vars but `$foo` is NOT in store_sub_vars.
        assert!(
            transform_store_unsub_wrap_ast("$.set(foo, value);", &ssv(&["foo"]), &ssv(&["$other"]))
                .is_none()
        );
    }

    #[test]
    fn unknown_state_left_alone() {
        assert!(
            transform_store_unsub_wrap_ast(
                "$.set(unknown, value);",
                &ssv(&["foo"]),
                &ssv(&["$foo"])
            )
            .is_none()
        );
    }

    #[test]
    fn already_wrapped_is_idempotent() {
        let src = "$.store_unsub($.set(foo, value), '$foo', $$stores);";
        assert!(transform_store_unsub_wrap_ast(src, &ssv(&["foo"]), &ssv(&["$foo"])).is_none());
    }

    #[test]
    fn double_application_is_stable() {
        let first =
            transform_store_unsub_wrap_ast("$.set(foo, 5);", &ssv(&["foo"]), &ssv(&["$foo"]))
                .unwrap();
        let second = transform_store_unsub_wrap_ast(&first, &ssv(&["foo"]), &ssv(&["$foo"]));
        assert!(second.is_none(), "expected None, got: {:?}", second);
    }

    #[test]
    fn rhs_with_nested_set_for_different_var() {
        // `$.set(a, $.set(b, 5))` — outer wraps for $a, inner stays
        // as-is (until b is processed in a separate state_var pass,
        // but here state_vars=["a","b"]).
        let out = transform_store_unsub_wrap_ast(
            "$.set(a, $.set(b, 5));",
            &ssv(&["a", "b"]),
            &ssv(&["$a", "$b"]),
        )
        .unwrap();
        // Inner first, then outer (fixed-point).
        assert_eq!(
            out,
            "$.store_unsub($.set(a, $.store_unsub($.set(b, 5), '$b', $$stores)), '$a', $$stores);"
        );
    }

    #[test]
    fn set_with_string_literal_in_rhs() {
        // String literals shouldn't fool the AST helper (text
        // version had elaborate string-state tracking).
        let out = transform_store_unsub_wrap_ast(
            r#"$.set(foo, "hello)world");"#,
            &ssv(&["foo"]),
            &ssv(&["$foo"]),
        )
        .unwrap();
        assert_eq!(
            out,
            "$.store_unsub($.set(foo, 'hello)world'), '$foo', $$stores);"
        );
    }

    #[test]
    fn empty_state_vars_no_op() {
        assert!(transform_store_unsub_wrap_ast("$.set(foo, 5);", &[], &ssv(&["$foo"])).is_none());
    }

    #[test]
    fn empty_store_sub_vars_no_op() {
        assert!(transform_store_unsub_wrap_ast("$.set(foo, 5);", &ssv(&["foo"]), &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_store_unsub_wrap_ast("$.set(foo, (", &ssv(&["foo"]), &ssv(&["$foo"]))
                .is_none()
        );
    }

    #[test]
    fn fast_path_no_set_in_source() {
        assert!(
            transform_store_unsub_wrap_ast("let x = 5;", &ssv(&["foo"]), &ssv(&["$foo"])).is_none()
        );
    }

    #[test]
    fn set_with_complex_rhs_function_call() {
        let out = transform_store_unsub_wrap_ast(
            "$.set(foo, makeWritable(initial, opts));",
            &ssv(&["foo"]),
            &ssv(&["$foo"]),
        )
        .unwrap();
        assert_eq!(
            out,
            "$.store_unsub($.set(foo, makeWritable(initial, opts)), '$foo', $$stores);"
        );
    }
}
