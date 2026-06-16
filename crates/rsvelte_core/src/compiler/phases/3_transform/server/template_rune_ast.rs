//! AST-based simplification of rune calls inside SSR template
//! expressions.
//!
//! Server-side rendering doesn't have a reactivity runtime, so the
//! rune calls that gate reactivity in the client collapse to
//! constant values:
//!
//! | Source                 | Replacement            |
//! |------------------------|------------------------|
//! | `$state.snapshot(x)`   | `$.snapshot(x)`        |
//! | `$state.eager(x)`      | `x` (unwrap)           |
//! | `$effect.tracking()`   | `false`                |
//! | `$effect.pending()`    | `0`                    |
//!
//! Replaces the text-based byte scanners in
//! `server::mod.rs::transform_rune_in_template_expr`
//! (`String::replace` for the static-output rewrites, and
//! `transform_rune_call_simple` — a brace tracker with quote-aware
//! skip — for `$state.eager(x)` unwrap). Same fragility class as
//! the client-side AST migrations: bare `String::replace` rewrites
//! byte patterns regardless of lexical context, so a string literal
//! containing `$state.snapshot(` would be (incorrectly) rewritten.
//! The AST visitor descends only into expression positions.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType};

use super::super::shared::ast_rewrite::{self, Edit};

thread_local! {
    static SSR_TEMPLATE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based simplification of `$state.snapshot` / `$state.eager` /
/// `$effect.tracking()` / `$effect.pending()` in an SSR template
/// expression. Returns `None` when there's nothing to rewrite.
pub fn transform_template_rune_ast(source: &str) -> Option<String> {
    // Fast probe — most expressions don't reference these runes.
    if memchr::memmem::find(source.as_bytes(), b"$state").is_none()
        && memchr::memmem::find(source.as_bytes(), b"$effect").is_none()
    {
        return None;
    }

    // Nested cases (`$state.snapshot($state.eager(x))`) need the outer
    // rewrite to use the *already-rewritten* inner text — the shared
    // fixed-point driver re-parses each pass's output. These rewrites
    // never nest spans, so no innermost-only deferral is needed.
    ast_rewrite::fixed_point(source, |src| {
        ast_rewrite::rewrite_once(
            &SSR_TEMPLATE_ALLOC,
            src,
            // Template expressions have no module-level import/export
            // syntax, but parsing as a Program is the shape OXC expects;
            // `mjs()` is permissive enough.
            SourceType::mjs(),
            ParseOptions::default(),
            false,
            |program| {
                let mut collector = TemplateRuneCollector {
                    source: src,
                    replacements: Vec::new(),
                };
                collector.visit_program(program);
                collector.replacements
            },
        )
    })
}

struct TemplateRuneCollector<'src> {
    source: &'src str,
    replacements: Vec<Edit>,
}

impl<'a, 'src> Visit<'a> for TemplateRuneCollector<'src> {
    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        walk::walk_call_expression(self, call);

        let Expression::StaticMemberExpression(member) = &call.callee else {
            return;
        };
        let Expression::Identifier(obj) = &member.object else {
            return;
        };

        let prop = member.property.name.as_str();
        match (obj.name.as_str(), prop) {
            // `$state.snapshot(x)` → `$.snapshot(x)` — callee swap.
            ("$state", "snapshot") => {
                self.replacements.push((
                    member.span().start,
                    member.span().end,
                    "$.snapshot".to_string(),
                ));
            }
            // `$state.eager(x)` → `x` — whole-call unwrap to the
            // single argument's source text.
            ("$state", "eager") => {
                let Some(arg) = call.arguments.first() else {
                    return;
                };
                let arg_span = arg.span();
                let arg_text = &self.source[arg_span.start as usize..arg_span.end as usize];
                self.replacements
                    .push((call.span.start, call.span.end, arg_text.to_string()));
            }
            // `$effect.tracking()` → `false` — SSR has no
            // reactivity, so the runtime-tracker call collapses to a
            // constant.
            ("$effect", "tracking") => {
                self.replacements
                    .push((call.span.start, call.span.end, "false".to_string()));
            }
            // `$effect.pending()` → `0` — matches the official
            // compiler's SSR behaviour.
            ("$effect", "pending") => {
                self.replacements
                    .push((call.span.start, call.span.end, "0".to_string()));
            }
            _ => {}
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rewrites_state_snapshot() {
        let out = transform_template_rune_ast("$state.snapshot(x)").unwrap();
        assert_eq!(out, "$.snapshot(x)");
    }

    #[test]
    fn unwraps_state_eager() {
        let out = transform_template_rune_ast("$state.eager(x.y)").unwrap();
        assert_eq!(out, "x.y");
    }

    #[test]
    fn unwraps_state_eager_with_complex_arg() {
        let out = transform_template_rune_ast("$state.eager(fn() + 1)").unwrap();
        assert_eq!(out, "fn() + 1");
    }

    #[test]
    fn rewrites_effect_tracking() {
        let out = transform_template_rune_ast("if ($effect.tracking()) {}").unwrap();
        assert_eq!(out, "if (false) {}");
    }

    #[test]
    fn rewrites_effect_pending() {
        let out = transform_template_rune_ast("let p = $effect.pending();").unwrap();
        assert_eq!(out, "let p = 0;");
    }

    #[test]
    fn handles_nested_eager_inside_snapshot() {
        // `$state.snapshot($state.eager(x))` — fixed-point iteration
        // first unwraps the inner eager, then the outer snapshot
        // operates on the unwrapped text.
        let out = transform_template_rune_ast("$state.snapshot($state.eager(x))").unwrap();
        assert_eq!(out, "$.snapshot(x)");
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        for src in [
            r#""$state.snapshot(x)""#,
            r#""$state.eager(x)""#,
            r#""$effect.tracking()""#,
            r#""$effect.pending()""#,
        ] {
            assert!(
                transform_template_rune_ast(src).is_none(),
                "should not rewrite inside string: {src}"
            );
        }
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "`result: ${$effect.tracking()}`";
        let out = transform_template_rune_ast(src).unwrap();
        assert_eq!(out, "`result: ${false}`");
    }

    #[test]
    fn leaves_other_state_methods_alone() {
        for src in ["$state(x)", "$state.raw(x)", "$state.frozen(x)"] {
            assert!(
                transform_template_rune_ast(src).is_none(),
                "should not rewrite: {src}"
            );
        }
    }

    #[test]
    fn leaves_other_effect_methods_alone() {
        for src in ["$effect(fn)", "$effect.pre(fn)", "$effect.root(fn)"] {
            assert!(
                transform_template_rune_ast(src).is_none(),
                "should not rewrite: {src}"
            );
        }
    }

    #[test]
    fn multiple_calls_in_one_expression() {
        let src = "[$state.snapshot(a), $effect.tracking(), $effect.pending()]";
        let out = transform_template_rune_ast(src).unwrap();
        assert_eq!(out, "[$.snapshot(a), false, 0]");
    }

    #[test]
    fn parse_error_returns_none() {
        // Malformed source falls through without mutation.
        assert!(transform_template_rune_ast("$state.snapshot(").is_none());
    }

    #[test]
    fn no_op_without_keyword() {
        assert!(transform_template_rune_ast("x + 1").is_none());
    }

    #[test]
    fn eager_with_no_args_left_alone() {
        // `$state.eager()` has no arg to unwrap to. Leave it alone
        // (the official compiler would have rejected this earlier
        // anyway).
        let src = "$state.eager()";
        assert!(transform_template_rune_ast(src).is_none());
    }
}
