//! Dev-mode instance-script instrumentation for **legacy (non-runes)**
//! components: `===` / `!==` → `$.strict_equals(...)`, `==` / `!=` →
//! `$.equals(...)`, `await X` → `(await $.track_reactivity_loss(X))()`, and the
//! `console.METHOD(...)` wrap.
//!
//! Upstream has no legacy/runes split here — `visitors/BinaryExpression.js`
//! and `visitors/AwaitExpression.js` sit in the one client visitor map that
//! every instance script walks. rsvelte's runes instance scripts get both
//! rewrites from `ast_state_transform`, but that whole pass is gated on
//! `analysis.runes`, so legacy scripts used to emit bare operators and bare
//! `await`s. This module supplies the same two rewrites for the legacy path,
//! batched over one parse per fixed-point iteration exactly like the module
//! script's `module_dev_tail_ast`.
//!
//! It runs *after* the legacy text pipeline has settled, so the operands it
//! copies are already `$.get(...)` / `a()`-wrapped — the same operand text
//! upstream produces by visiting the operands before building the helper call.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_parser::ParseOptions;
use oxc_span::SourceType;

use crate::compiler::phases::phase2_analyze::ComponentAnalysis;

use super::ast_rewrite;

thread_local! {
    static INSTANCE_DEV_TAIL_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Instrument a settled **legacy** instance script for dev mode. Returns `None`
/// when neither rewrite has anything to do, when the script fails to parse
/// (a malformed intermediate is not this pass's to surface), or when no edit
/// actually landed — the caller then keeps its existing `String`.
pub(super) fn transform_legacy_instance_dev_tail_ast(
    source: &str,
    analysis: Option<&ComponentAnalysis>,
) -> Option<String> {
    // Per-collector probes mirroring each pass's own early-out. Neither pass
    // introduces the other's marker, so probing the original source stays sound
    // across fixed-point iterations.
    let has_equality = super::strict_equals_ast::source_has_equality_op(source);
    let has_await = super::await_reactivity_loss_ast::source_has_await(source);
    // The per-statement loop in `mod.rs` never sees a `$:` body — it is folded
    // into a `$.legacy_pre_effect(...)` call afterwards — so the console wrap
    // has to be re-collected over the settled script.
    let has_console = memchr::memmem::find(source.as_bytes(), b"console.").is_some();
    if !has_equality && !has_await && !has_console {
        return None;
    }

    ast_rewrite::rewrite_batched(
        &INSTANCE_DEV_TAIL_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions::default(),
        |program, src| {
            let mut edits = Vec::new();
            if has_equality {
                edits.extend(super::strict_equals_ast::collect_strict_equals_edits(
                    program, src,
                ));
            }
            if has_await {
                // `false`: this entry point only ever runs over a legacy
                // script, where `extract_svelte_ignore` also accepts the
                // hyphenated code spellings.
                edits.extend(
                    super::await_reactivity_loss_ast::collect_await_reactivity_loss_edits(
                        program, src, false,
                    ),
                );
            }
            if has_console {
                edits.extend(super::console_dev_ast::collect_console_edits(
                    program, src, analysis,
                ));
            }
            edits
        },
    )
}

#[cfg(test)]
mod tests {

    /// A standalone fragment carries no analysis, so identifiers stay
    /// unresolved — the conservative side of the console-wrap decision.
    fn transform_legacy_instance_dev_tail_ast(source: &str) -> Option<String> {
        super::transform_legacy_instance_dev_tail_ast(source, None)
    }

    #[test]
    fn no_marker_is_none() {
        assert!(transform_legacy_instance_dev_tail_ast("let x = 1;").is_none());
    }

    #[test]
    fn rewrites_every_equality_operator() {
        for (src, expected) in [
            ("let c = a() === b();", "let c = $.strict_equals(a(), b());"),
            (
                "let c = a() !== b();",
                "let c = $.strict_equals(a(), b(), false);",
            ),
            ("let c = a() == b();", "let c = $.equals(a(), b());"),
            ("let c = a() != b();", "let c = $.equals(a(), b(), false);"),
        ] {
            assert_eq!(
                transform_legacy_instance_dev_tail_ast(src).unwrap(),
                expected,
                "source: {src}"
            );
        }
    }

    #[test]
    fn rewrites_await_in_legacy_function_body() {
        let src = "async function load() {\n\tconst r = await fetch('/x');\n\treturn r;\n}";
        let out = transform_legacy_instance_dev_tail_ast(src).unwrap();
        assert!(
            out.contains("const r = (await $.track_reactivity_loss(fetch('/x')))();"),
            "got: {out}"
        );
    }

    #[test]
    fn instruments_reactive_statement_bodies() {
        // The legacy pipeline has already lowered `$: e = a !== b` by the time
        // this pass runs; the helper body still has to be instrumented.
        let src = "$.legacy_pre_effect(\n\t() => ($.deep_read_state(a()), $.deep_read_state(b())),\n\t() => {\n\t\t$.set(e, a() !== b());\n\t},\n);";
        let out = transform_legacy_instance_dev_tail_ast(src).unwrap();
        assert!(
            out.contains("$.set(e, $.strict_equals(a(), b(), false));"),
            "got: {out}"
        );
    }

    #[test]
    fn nested_await_settles_innermost_first() {
        let out =
            transform_legacy_instance_dev_tail_ast("async function f() { await g(await h()); }")
                .unwrap();
        assert!(
            out.contains(
                "(await $.track_reactivity_loss(g((await $.track_reactivity_loss(h()))())))()"
            ),
            "got: {out}"
        );
    }

    #[test]
    fn await_operand_of_equality_settles_both() {
        let out = transform_legacy_instance_dev_tail_ast(
            "async function f() { return (await g()) === 1; }",
        )
        .unwrap();
        assert!(
            out.contains("$.strict_equals((await $.track_reactivity_loss(g()))(), 1)"),
            "got: {out}"
        );
    }

    #[test]
    fn svelte_ignore_suppresses_the_await_wrap() {
        let src = "async function f() {\n\t// svelte-ignore await_reactivity_loss\n\tconst r = await g();\n}";
        assert!(transform_legacy_instance_dev_tail_ast(src).is_none());
    }

    #[test]
    fn svelte_ignore_naming_other_codes_does_not_suppress() {
        let src = "async function f() {\n\t// svelte-ignore a11y_missing_attribute\n\tconst r = await g();\n}";
        let out = transform_legacy_instance_dev_tail_ast(src).unwrap();
        assert!(out.contains("$.track_reactivity_loss(g())"), "got: {out}");
    }

    #[test]
    fn leaves_operators_in_strings_alone() {
        assert!(transform_legacy_instance_dev_tail_ast(r#"let s = "a === b";"#).is_none());
        assert!(transform_legacy_instance_dev_tail_ast(r#"let s = "await x";"#).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_legacy_instance_dev_tail_ast("let x = ; a === b;").is_none());
    }
}
