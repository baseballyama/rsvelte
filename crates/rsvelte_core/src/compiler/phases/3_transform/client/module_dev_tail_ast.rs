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
//!
//! All four share a source type (`ts().with_module(true)` / `mjs()`) and
//! `ParseOptions::default()`, and target lexically disjoint syntax
//! (call callees / binary operators / console calls / declarator inits),
//! so one parse per fixed-point iteration can feed every collector and a
//! single innermost-first splice apply the union of their edits.
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

use super::ast_rewrite;

thread_local! {
    static MODULE_DEV_TAIL_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Lower the module script's `$effect` runes and, in dev mode, its
/// `strict_equals` / `console` / declarator-`tag` passes in a single
/// batched parse. `dev` gates the three dev-only collectors exactly as
/// the sequential call sites did. Returns `None` when nothing matched
/// (no eligible marker, parse failure, or no edit actually landed), so
/// the caller keeps its existing `String`.
pub fn transform_module_dev_tail_ast(source: &str, dev: bool, is_ts: bool) -> Option<String> {
    let bytes = source.as_bytes();

    // Per-collector fast probes, mirroring each standalone pass's own
    // early-out. A collector whose marker is absent from the source can
    // never match — none of the passes introduce another's marker — so
    // probing the original source is sound across fixed-point iterations.
    let has_effect = memchr::memmem::find(bytes, b"$effect").is_some();
    let has_strict = dev
        && (memchr::memmem::find(bytes, b"===").is_some()
            || memchr::memmem::find(bytes, b"!==").is_some());
    let has_console = dev && memchr::memmem::find(bytes, b"console.").is_some();
    let has_tag = dev
        && (memchr::memmem::find(bytes, b"$.state").is_some()
            || memchr::memmem::find(bytes, b"$.derived").is_some()
            || memchr::memmem::find(bytes, b"$.proxy").is_some());

    if !has_effect && !has_strict && !has_console && !has_tag {
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
                edits.extend(super::console_dev_ast::collect_console_edits(program, src));
            }
            if has_tag {
                edits.extend(super::tag_declarator_ast::collect_tag_declarator_edits(
                    program, src,
                ));
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
        assert!(transform_module_dev_tail_ast("let x = 1;", true, false).is_none());
    }

    #[test]
    fn effect_runs_without_dev() {
        let out = transform_module_dev_tail_ast("$effect(() => {});", false, false).unwrap();
        assert_eq!(out, "$.user_effect(() => {});");
    }

    #[test]
    fn dev_only_passes_skipped_without_dev() {
        // `===` / `console.` / `$.state` only rewrite in dev mode.
        assert!(transform_module_dev_tail_ast("a === b;", false, false).is_none());
        assert!(transform_module_dev_tail_ast("console.log(x);", false, false).is_none());
        assert!(transform_module_dev_tail_ast("let x = $.state(0);", false, false).is_none());
    }

    #[test]
    fn mixed_disjoint_passes_all_apply_in_one_batch() {
        let src = "$effect(() => {});\na === b;\nconsole.log(x);\nlet s = $.state(0);";
        let out = transform_module_dev_tail_ast(src, true, false).unwrap();
        assert!(out.contains("$.user_effect(() => {});"), "got: {out}");
        assert!(out.contains("$.strict_equals(a, b);"), "got: {out}");
        assert!(
            out.contains("console.log(...$.log_if_contains_state(\"log\", x));"),
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
        let out = transform_module_dev_tail_ast("let s = $.state(a === b);", true, false).unwrap();
        assert_eq!(out, "let s = $.tag($.state($.strict_equals(a, b)), 's');");
    }

    #[test]
    fn console_wrapping_uses_strict_rewritten_args() {
        let out = transform_module_dev_tail_ast("console.log(a === b);", true, false).unwrap();
        assert_eq!(
            out,
            "console.log(...$.log_if_contains_state(\"log\", $.strict_equals(a, b)));"
        );
    }

    #[test]
    fn rune_shaped_bytes_in_string_left_alone() {
        assert!(transform_module_dev_tail_ast(r#"let s = "$effect(x)";"#, true, false).is_none());
    }
}
