//! Batched `$state*` rune lowering for module scripts (`.svelte.js` /
//! `.svelte.ts`).
//!
//! The `$state.snapshot(...)`, `$state.raw(...)` / `$state.frozen(...)`, and
//! bare `$state(...)` rewrites used to run as three sequential AST passes, each
//! re-parsing the whole module script. Their targets are lexically disjoint
//! (`$state.snapshot` callee / `$state.raw|frozen` calls / bare `$state(` calls),
//! so a single parse can feed all three collectors and one splice apply the
//! union of their edits.
//!
//! The batched driver folds to a fixed point with innermost-first splicing, so
//! the (pathological but legal) case of one rune nested inside another — e.g.
//! `$state($state.snapshot(x))` — still resolves exactly as the equivalent
//! sequential per-pass application: the inner edit lands first, the next
//! iteration re-parses and re-collects the settled outer node.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_parser::ParseOptions;
use oxc_span::SourceType;

use super::ast_rewrite;

thread_local! {
    static MODULE_STATE_RUNES_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Rewrite every `$state*` rune in a module script in a single parse per
/// fixed-point iteration. `non_reactive_vars` / `non_proxy_vars` are the
/// caller-computed classification sets consulted by the raw/frozen and bare-call
/// rewrites. Returns `None` when nothing changed (no rune present, parse
/// failure, or no matched call actually rewrote).
pub fn transform_module_state_runes_ast(
    source: &str,
    non_reactive_vars: &[String],
    non_proxy_vars: &[String],
    is_ts: bool,
) -> Option<String> {
    // Fast probe — skip the parse entirely for scripts with no `$state` at all.
    memchr::memmem::find(source.as_bytes(), b"$state")?;

    let source_type = if is_ts {
        SourceType::ts().with_module(true)
    } else {
        SourceType::mjs()
    };

    ast_rewrite::rewrite_batched(
        &MODULE_STATE_RUNES_ALLOC,
        source,
        source_type,
        ParseOptions::default(),
        |program, src| {
            let mut edits = super::state_snapshot_ast::collect_snapshot_edits(program);
            edits.extend(super::state_raw_frozen_ast::collect_raw_frozen_edits(
                program,
                src,
                non_reactive_vars,
            ));
            edits.extend(super::state_call_ast::collect_state_call_edits(
                program,
                src,
                non_reactive_vars,
                non_proxy_vars,
            ));
            edits
        },
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mixed_disjoint_runes_all_lower_in_one_pass() {
        let src = "let a = $state.snapshot(x);\nlet b = $state.raw(0);\nlet c = $state(1);";
        let out = transform_module_state_runes_ast(src, &[], &[], false).unwrap();
        assert_eq!(
            out,
            "let a = $.snapshot(x);\nlet b = $.state(0);\nlet c = $.state(1);"
        );
    }

    #[test]
    fn no_rune_is_none() {
        assert!(transform_module_state_runes_ast("let x = 1;", &[], &[], false).is_none());
    }

    #[test]
    fn rune_shaped_bytes_in_string_literal_are_left_alone() {
        // Every rewrite descends only into expression positions, so the same
        // bytes inside a string literal must not be touched.
        assert!(
            transform_module_state_runes_ast(r#"let s = "$state(x)";"#, &[], &[], false).is_none()
        );
    }

    #[test]
    fn nested_cross_rune_fully_lowers() {
        // Pathological but legal: a snapshot call nested inside a bare `$state(...)`.
        // The batched fixed point must fully lower both — no rune bytes may remain
        // and the inner snapshot must have been rewritten — matching what three
        // sequential passes would have produced.
        let out = transform_module_state_runes_ast(
            "let a = $state($state.snapshot(x));",
            &[],
            &[],
            false,
        )
        .unwrap();
        assert!(out.starts_with("let a = $.state("), "got: {out}");
        assert!(out.contains("$.snapshot(x)"), "got: {out}");
        assert!(!out.contains("$state"), "rune bytes remained: {out}");
    }
}
