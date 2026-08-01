//! Dev-mode instance-script instrumentation for **legacy (non-runes)**
//! components: `===` / `!==` → `$.strict_equals(...)`, `==` / `!=` →
//! `$.equals(...)`, and `await X` → `(await $.track_reactivity_loss(X))()`.
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
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::GetSpan;
use oxc_span::SourceType;

use super::ast_rewrite::{self, Edit};

thread_local! {
    static INSTANCE_DEV_TAIL_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Cheap byte probe: `await` is a keyword, so a script without those bytes
/// cannot hold an `AwaitExpression`.
fn source_has_await(source: &str) -> bool {
    memchr::memmem::find(source.as_bytes(), b"await").is_some()
}

/// The dev wrapper upstream builds in `visitors/AwaitExpression.js`.
fn track_reactivity_loss_wrap(argument_text: &str) -> String {
    format!("(await $.track_reactivity_loss({argument_text}))()")
}

/// The wrapper keeps an `await` of its own, so the fixed-point loop would wrap
/// it again on the next iteration; recognising the marker is what makes this
/// pass idempotent.
fn is_track_reactivity_loss_call(expr: &Expression<'_>) -> bool {
    let Expression::CallExpression(call) = expr.without_parentheses() else {
        return false;
    };
    let Expression::StaticMemberExpression(member) = &call.callee else {
        return false;
    };
    member.property.name == "track_reactivity_loss"
        && matches!(&member.object, Expression::Identifier(id) if id.name == "$")
}

/// True when the statement enclosing `offset` is preceded by a `svelte-ignore`
/// comment naming `await_reactivity_loss`. Upstream reads this off the
/// analysis-phase ignore stack; these passes rewrite source spans, so they read
/// the same comment back out of the script text.
pub(super) fn await_reactivity_loss_ignored(source: &str, offset: u32, is_runes: bool) -> bool {
    // Start from the top of the await's own line: the statement text to its
    // left is not a comment and would end the scan immediately.
    let offset = source[..offset as usize].rfind('\n').map_or(0, |nl| nl + 1);
    let before = &source[..offset];
    for line in before.lines().rev() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        let Some(comment) = line
            .strip_prefix("//")
            .or_else(|| line.strip_prefix("/*").map(|c| c.trim_end_matches("*/")))
        else {
            // The first non-comment line above is the start of the
            // statement itself; anything earlier cannot annotate it.
            return false;
        };
        // A run of comments can carry several `svelte-ignore` lines, so keep
        // looking when this one names other codes.
        if crate::compiler::phases::phase2_analyze::utils::extract_svelte_ignore(comment, is_runes)
            .iter()
            .any(|c| c == "await_reactivity_loss")
        {
            return true;
        }
    }
    false
}

/// Collect the `await X` → `(await $.track_reactivity_loss(X))()` edits from a
/// single parse. Nested awaits settle across fixed-point iterations: the outer
/// edit's span strictly contains the inner one, so the innermost-first splice
/// defers it and the next iteration re-collects it over the rewritten argument.
fn collect_await_reactivity_loss_edits(program: &Program<'_>, source: &str) -> Vec<Edit> {
    let mut collector = AwaitCollector {
        source,
        edits: Vec::new(),
    };
    collector.visit_program(program);
    collector.edits
}

struct AwaitCollector<'src> {
    source: &'src str,
    edits: Vec<Edit>,
}

impl<'a, 'src> Visit<'a> for AwaitCollector<'src> {
    fn visit_await_expression(&mut self, expr: &AwaitExpression<'a>) {
        walk::walk_await_expression(self, expr);

        // `false`: this collector only ever runs over a legacy script, where
        // `extract_svelte_ignore` also accepts the hyphenated code spellings.
        if is_track_reactivity_loss_call(&expr.argument)
            || await_reactivity_loss_ignored(self.source, expr.span.start, false)
        {
            return;
        }

        let arg_span = expr.argument.span();
        let arg_text = self.source[arg_span.start as usize..arg_span.end as usize].trim();
        self.edits.push((
            expr.span.start,
            expr.span.end,
            track_reactivity_loss_wrap(arg_text),
        ));
    }
}

/// Instrument a settled **legacy** instance script for dev mode. Returns `None`
/// when neither rewrite has anything to do, when the script fails to parse
/// (a malformed intermediate is not this pass's to surface), or when no edit
/// actually landed — the caller then keeps its existing `String`.
pub(super) fn transform_legacy_instance_dev_tail_ast(source: &str) -> Option<String> {
    // Per-collector probes mirroring each pass's own early-out. Neither pass
    // introduces the other's marker, so probing the original source stays sound
    // across fixed-point iterations.
    let has_equality = super::strict_equals_ast::source_has_equality_op(source);
    let has_await = source_has_await(source);
    if !has_equality && !has_await {
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
                edits.extend(collect_await_reactivity_loss_edits(program, src));
            }
            edits
        },
    )
}

#[cfg(test)]
mod tests {
    use super::*;

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
