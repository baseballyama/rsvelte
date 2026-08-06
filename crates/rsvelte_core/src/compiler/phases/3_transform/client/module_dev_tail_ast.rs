//! Batched module-script (`.svelte.js` / `.svelte.ts`) rune/dev-mode
//! tail passes.
//!
//! After the `$state*` runes are lowered, the module path ran a run of
//! consecutive AST passes that each re-parsed the whole script through
//! `ast_rewrite::rewrite_once`:
//!
//!   * `$effect.*(...)` callee lowering (always)
//!   * `===` / `!==` → `$.strict_equals(...)` (dev)
//!   * `console.METHOD(...)` → `...$.log_if_contains_state(...)` wrap (dev)
//!   * `$.state` / `$.derived` / `$.proxy` declarator `$.tag(...)` wrap (dev)
//!   * `await X` → `(await $.track_reactivity_loss(X))()` (dev)
//!
//! All of them share a source type (`ts().with_module(true)` / `mjs()`) and
//! `ParseOptions::default()`, and target lexically disjoint syntax
//! (call callees / binary operators / console calls / declarator inits /
//! awaits), so one parse per fixed-point iteration can feed every collector
//! and a single innermost-first splice apply the union of their edits.
//!
//! The strict-equals and console collectors are "leaf only" (they defer
//! a node whose operands / arguments still hold an unrewritten inner
//! occurrence); driving them through the batched fixed point reproduces
//! their standalone single-pass loops. The (legal but rare) case of one
//! pass's target nested inside another's — e.g. `console.log(a === b)` or
//! `let x = $.state(a === b)` — settles exactly as the equivalent
//! sequential per-pass application did: the inner edit lands first, the
//! next iteration re-parses and re-collects the settled outer node.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_parser::ParseOptions;
use oxc_span::SourceType;

use crate::compiler::phases::phase2_analyze::ComponentAnalysis;

use super::ast_rewrite;

thread_local! {
    static MODULE_DEV_TAIL_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Lower the module script's `$effect` runes and, in dev mode, its
/// `strict_equals` / `console` / declarator-`tag` / `await` passes in a
/// single batched parse. `dev` gates the dev-only collectors exactly as
/// the sequential call sites did; `is_runes` only selects how strictly
/// `svelte-ignore` comment bodies are parsed. Returns `None` when nothing
/// matched (no eligible marker, parse failure, or no edit actually
/// landed), so the caller keeps its existing `String`.
pub(super) fn transform_module_dev_tail_ast(
    source: &str,
    dev: bool,
    is_ts: bool,
    is_runes: bool,
    analysis: Option<&ComponentAnalysis>,
) -> Option<String> {
    let bytes = source.as_bytes();

    // Per-collector fast probes, mirroring each standalone pass's own
    // early-out. A collector whose marker is absent from the source can
    // never match — none of the passes introduce another's marker — so
    // probing the original source is sound across fixed-point iterations.
    let has_effect = memchr::memmem::find(bytes, b"$effect").is_some();
    let has_strict = dev && super::strict_equals_ast::source_has_equality_op(source);
    let has_console = dev && memchr::memmem::find(bytes, b"console.").is_some();
    let has_tag = dev
        && (memchr::memmem::find(bytes, b"$.state").is_some()
            || memchr::memmem::find(bytes, b"$.derived").is_some()
            || memchr::memmem::find(bytes, b"$.proxy").is_some());

    let has_inspect = dev && super::inspect_rune_ast::source_has_inspect_rune(source);
    let has_await = dev && super::await_reactivity_loss_ast::source_has_await(source);
    let experimental_async = analysis.is_some_and(|a| a.experimental_async);

    if !has_effect && !has_strict && !has_console && !has_tag && !has_inspect && !has_await {
        return None;
    }

    let source_type = if is_ts {
        SourceType::ts().with_module(true)
    } else {
        SourceType::mjs()
    };

    ast_rewrite::rewrite_batched(
        &MODULE_DEV_TAIL_ALLOC,
        source,
        source_type,
        ParseOptions::default(),
        |program, src| {
            let mut edits = Vec::new();
            if has_effect {
                edits.extend(super::effect_rune_ast::collect_effect_rune_edits(program));
            }
            if has_strict {
                edits.extend(super::strict_equals_ast::collect_strict_equals_edits(
                    program, src,
                ));
            }
            if has_console {
                edits.extend(super::console_dev_ast::collect_console_edits(
                    program, src, analysis,
                ));
            }
            if has_tag {
                edits.extend(super::tag_declarator_ast::collect_tag_declarator_edits(
                    program, src,
                ));
            }
            if has_inspect {
                edits.extend(super::inspect_rune_ast::collect_inspect_rune_edits(
                    program, src,
                ));
            }
            if has_await {
                edits.extend(
                    super::await_reactivity_loss_ast::collect_await_reactivity_loss_edits(
                        program,
                        src,
                        is_runes,
                        experimental_async,
                    ),
                );
            }
            edits
        },
    )
}

#[cfg(test)]
mod tests {

    /// A standalone module fragment carries no analysis, so identifiers stay
    /// unresolved — the conservative side of the console-wrap decision.
    fn transform_module_dev_tail_ast(
        source: &str,
        dev: bool,
        is_ts: bool,
        is_runes: bool,
    ) -> Option<String> {
        super::transform_module_dev_tail_ast(source, dev, is_ts, is_runes, None)
    }

    /// Runes-mode dev batch — the shape `.svelte.(js|ts)` always compiles in.
    fn lower(source: &str) -> Option<String> {
        transform_module_dev_tail_ast(source, true, false, true)
    }

    #[test]
    fn no_marker_is_none() {
        assert!(lower("let x = 1;").is_none());
    }

    #[test]
    fn effect_runs_without_dev() {
        let out = transform_module_dev_tail_ast("$effect(() => {});", false, false, true).unwrap();
        assert_eq!(out, "$.user_effect(() => {});");
    }

    /// Through the production entry point, not the per-pass test loops: a
    /// module whose only comparison is loose has no `===` / `!==` bytes, so a
    /// probe written for the strict pair alone would skip the whole batch.
    #[test]
    fn loose_equality_alone_still_enters_the_batch() {
        let out = lower("a == b;").unwrap();
        assert_eq!(out, "$.equals(a, b);");

        let out = lower("a != b;").unwrap();
        assert_eq!(out, "$.equals(a, b, false);");
    }

    #[test]
    fn dev_only_passes_skipped_without_dev() {
        // `===` / `console.` / `$.state` / `await` only rewrite in dev mode.
        assert!(transform_module_dev_tail_ast("a === b;", false, false, true).is_none());
        assert!(transform_module_dev_tail_ast("console.log(x);", false, false, true).is_none());
        assert!(transform_module_dev_tail_ast("let x = $.state(0);", false, false, true).is_none());
        assert!(
            transform_module_dev_tail_ast("async function f() { await g(); }", false, false, true)
                .is_none()
        );
    }

    #[test]
    fn mixed_disjoint_passes_all_apply_in_one_batch() {
        let src = "$effect(() => {});\na === b;\nconsole.log(x);\nlet s = $.state(0);";
        let out = lower(src).unwrap();
        assert!(out.contains("$.user_effect(() => {});"), "got: {out}");
        assert!(out.contains("$.strict_equals(a, b);"), "got: {out}");
        assert!(
            out.contains("console.log(...$.log_if_contains_state('log', x));"),
            "got: {out}"
        );
        assert!(
            out.contains("let s = $.tag($.state(0), 's');"),
            "got: {out}"
        );
    }

    #[test]
    fn nested_cross_pass_fully_settles() {
        // strict-equals nested inside a console arg nested inside a state
        // init: the batch must lower all three exactly as the sequential
        // per-pass application did.
        let out = lower("let s = $.state(a === b);").unwrap();
        assert_eq!(out, "let s = $.tag($.state($.strict_equals(a, b)), 's');");
    }

    #[test]
    fn console_wrapping_uses_strict_rewritten_args() {
        // The equality rewrite still lands, but the wrap does not: upstream
        // evaluates the original `a === b` to `{true, false}`, never `UNKNOWN`.
        let out = lower("console.log(a === b);").unwrap();
        assert_eq!(out, "console.log($.strict_equals(a, b));");
    }

    #[test]
    fn rune_shaped_bytes_in_string_left_alone() {
        assert!(lower(r#"let s = "$effect(x)";"#).is_none());
    }

    #[test]
    fn wraps_await_in_module_scope() {
        let out =
            lower("export async function load() {\n\tconst r = await fetch('/x');\n}").unwrap();
        assert!(
            out.contains("const r = (await $.track_reactivity_loss(fetch('/x')))();"),
            "got: {out}"
        );
    }

    #[test]
    fn nested_await_settles_innermost_first() {
        let out = lower("async function f() { await g(await h()); }").unwrap();
        assert!(
            out.contains(
                "(await $.track_reactivity_loss(g((await $.track_reactivity_loss(h()))())))()"
            ),
            "got: {out}"
        );
    }

    #[test]
    fn await_operand_of_equality_settles_both() {
        let out = lower("async function f() { return (await g()) === 1; }").unwrap();
        assert!(
            out.contains("$.strict_equals((await $.track_reactivity_loss(g()))(), 1)"),
            "got: {out}"
        );
    }

    #[test]
    fn svelte_ignore_suppresses_the_await_wrap() {
        let src = "async function f() {\n\t// svelte-ignore await_reactivity_loss\n\tconst r = await g();\n}";
        assert!(lower(src).is_none());

        // The comma form pins the `extract_svelte_ignore` delegation: in runes
        // mode a code is only read past when a comma follows it.
        let src = "async function f() {\n\t/* svelte-ignore await_reactivity_loss, other */\n\tconst r = await g();\n}";
        assert!(lower(src).is_none());
    }

    #[test]
    fn svelte_ignore_naming_other_codes_does_not_suppress() {
        let src = "async function f() {\n\t// svelte-ignore a11y_missing_attribute\n\tconst r = await g();\n}";
        let out = lower(src).unwrap();
        assert!(out.contains("$.track_reactivity_loss(g())"), "got: {out}");
    }

    #[test]
    fn await_bytes_in_string_left_alone() {
        assert!(lower(r#"let s = "await x";"#).is_none());
    }

    #[test]
    fn typescript_module_awaits_are_wrapped() {
        let out = transform_module_dev_tail_ast(
            "export async function load(): Promise<number> {\n\treturn await fetch('/x');\n}",
            true,
            true,
            true,
        )
        .unwrap();
        assert!(
            out.contains("return (await $.track_reactivity_loss(fetch('/x')))();"),
            "got: {out}"
        );
    }
}
