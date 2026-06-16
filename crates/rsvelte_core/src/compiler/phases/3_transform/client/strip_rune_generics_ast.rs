//! AST-based stripping of TypeScript generic parameters from
//! `$state<...>()` / `$derived<...>()` calls in module scripts
//! (`.svelte.js` / `.svelte.ts`).
//!
//! The rune calls accept type arguments for IDE type narrowing
//! (`$state<ReturnType<typeof autoUpdate>>()`), but those are purely
//! type-level — the runtime needs `$state()` / `$derived()` without
//! the angle-bracketed payload.
//!
//! Replaces the text-based `expression_utils::strip_rune_generic_params`,
//! a ~70 LOC char-by-char scanner that tracked angle-bracket depth
//! while also paying attention to string literals (to skip `<` / `>`
//! inside them) and the `=>` arrow operator (which it must not
//! mistake for a closing `>`). All of that complexity is replaced by
//! one OXC parse + targeted visitor: the parser knows about strings,
//! arrows, and nested generics, so the visitor just asks "does this
//! `CallExpression` have type arguments?".
//!
//! Only `$state` and `$derived` qualify — other generic call
//! expressions (`fn<T>(...)`) are left untouched so the text remains
//! valid TypeScript downstream.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType};

use super::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_STRIP_GENERICS_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `$state<...>()` / `$derived<...>()` →
/// `$state()` / `$derived()`. Returns `None` when nothing changed
/// (no `$state` / `$derived` in source, no generics on those calls,
/// or parse failure).
pub fn strip_rune_generic_params_ast(source: &str, is_ts: bool) -> Option<String> {
    // Generic arguments are TS-only syntax — if the file is plain JS,
    // there's nothing to strip. (Even in `.svelte.js` files, anyone
    // writing `$state<T>` is mistaken; we leave it to whatever
    // downstream pass yells about it.)
    if !is_ts {
        return None;
    }
    // Fast probe — most module scripts don't use either rune.
    if memchr::memmem::find(source.as_bytes(), b"$state").is_none()
        && memchr::memmem::find(source.as_bytes(), b"$derived").is_none()
    {
        return None;
    }

    ast_rewrite::rewrite_once(
        &MODULE_STRIP_GENERICS_ALLOC,
        source,
        SourceType::ts().with_module(true),
        ParseOptions::default(),
        false,
        |program| {
            let mut collector = StripGenericsCollector {
                spans_to_strip: Vec::new(),
            };
            collector.visit_program(program);
            collector
                .spans_to_strip
                .into_iter()
                .map(|(start, end)| (start, end, String::new()))
                .collect::<Vec<Edit>>()
        },
    )
}

struct StripGenericsCollector {
    /// `(start, end)` byte offsets of `<...>` regions to delete.
    spans_to_strip: Vec<(u32, u32)>,
}

impl<'a> Visit<'a> for StripGenericsCollector {
    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        walk::walk_call_expression(self, call);

        let Some(type_args) = &call.type_arguments else {
            return;
        };
        // Match `$state` or `$derived` (bare identifier callee only;
        // member expressions like `$state.raw<T>(...)` aren't a thing
        // the runtime accepts but if they appear leave them be).
        let Expression::Identifier(id) = &call.callee else {
            return;
        };
        if id.name != "$state" && id.name != "$derived" {
            return;
        }
        self.spans_to_strip
            .push((type_args.span().start, type_args.span().end));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strips_state_generic() {
        let out = strip_rune_generic_params_ast("let x = $state<number>(0);", true).unwrap();
        assert_eq!(out, "let x = $state(0);");
    }

    #[test]
    fn strips_derived_generic() {
        let out =
            strip_rune_generic_params_ast("let y = $derived<string>(x.toString());", true).unwrap();
        assert_eq!(out, "let y = $derived(x.toString());");
    }

    #[test]
    fn strips_nested_generic() {
        let out = strip_rune_generic_params_ast(
            "let z = $state<ReturnType<typeof setup>>(setup());",
            true,
        )
        .unwrap();
        assert_eq!(out, "let z = $state(setup());");
    }

    #[test]
    fn leaves_non_rune_generic_alone() {
        // `fn<T>()` is unrelated — only $state / $derived are stripped.
        let src = "fn<number>(0)";
        assert!(strip_rune_generic_params_ast(src, true).is_none());
    }

    #[test]
    fn leaves_state_without_generic_alone() {
        assert!(strip_rune_generic_params_ast("let x = $state(0);", true).is_none());
    }

    #[test]
    fn skips_js_source_type() {
        // No-op for plain JS — generics aren't legal there.
        assert!(strip_rune_generic_params_ast("let x = $state<T>(0);", false).is_none());
    }

    #[test]
    fn leaves_string_literal_alone() {
        // Text-version specifically had to handle this; AST descends
        // only into expressions, so the string is untouched
        // automatically. The whole source has no rune to strip, so
        // the function returns None.
        let src = r#"let s = "$state<T>(x)";"#;
        assert!(strip_rune_generic_params_ast(src, true).is_none());
    }

    #[test]
    fn leaves_arrow_operator_alone() {
        // The text version tracked `=>` to avoid mistaking the `>`
        // for a closing angle bracket. AST has no such concern —
        // arrow expressions are their own AST node.
        let src = "let cb = () => $state<T>(0);";
        let out = strip_rune_generic_params_ast(src, true).unwrap();
        assert_eq!(out, "let cb = () => $state(0);");
    }

    #[test]
    fn multiple_calls_in_one_file() {
        let src = r#"
let a = $state<number>(1);
let b = $derived<string>(a.toString());
let c = $state(2);
        "#;
        let out = strip_rune_generic_params_ast(src, true).unwrap();
        assert!(out.contains("let a = $state(1);"));
        assert!(out.contains("let b = $derived(a.toString());"));
        assert!(out.contains("let c = $state(2);"));
        // The original generic bytes are gone:
        assert!(!out.contains("<number>"));
        assert!(!out.contains("<string>"));
    }

    #[test]
    fn parse_error_returns_none() {
        // Falls through cleanly without mutation.
        assert!(strip_rune_generic_params_ast("let x = $state<T>(", true).is_none());
    }

    #[test]
    fn no_op_without_runes() {
        assert!(strip_rune_generic_params_ast("let x = 1;", true).is_none());
    }
}
