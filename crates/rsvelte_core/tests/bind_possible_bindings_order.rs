//! Regression test: the `Possible bindings for <…> are …` enumeration must be
//! byte-identical to upstream (issue #1771).
//!
//! Upstream `BindDirective.js` builds the list with `Object.entries(...).sort()`,
//! so the names are lexicographically sorted. rsvelte used to enumerate an
//! `FxHashMap`, which produced an arbitrary order that silently drifts whenever
//! the table is rebuilt or reordered.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_error_message(src: &str) -> String {
    let err = compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect_err("should error");

    format!("{err}")
        .trim_start_matches("Analysis error: ")
        .trim_start_matches("bind_invalid_name: ")
        .lines()
        .next()
        .unwrap_or_default()
        .to_string()
}

/// Expected text copied from
/// `packages/svelte/tests/validator/samples/window-binding-invalid-dimensions/errors.json`.
#[test]
fn window_possible_bindings_match_upstream() {
    let message = compile_error_message(
        "<script>\n\tlet foo;\n</script>\n\n<svelte:window bind:clientWidth={foo} />",
    );
    assert_eq!(
        message,
        "`bind:clientWidth` is not a valid binding. Possible bindings for <svelte:window> are \
         devicePixelRatio, focused, innerHeight, innerWidth, online, outerHeight, outerWidth, \
         scrollX, scrollY, this"
    );
}

/// Expected text copied from
/// `packages/svelte/tests/validator/samples/document-binding-invalid-dimensions/errors.json`.
#[test]
fn document_possible_bindings_match_upstream() {
    let message = compile_error_message(
        "<script>\n\tlet foo;\n</script>\n\n<svelte:document bind:clientWidth={foo} />",
    );
    assert_eq!(
        message,
        "`bind:clientWidth` is not a valid binding. Possible bindings for <svelte:document> are \
         activeElement, focused, fullscreenElement, pointerLockElement, this, visibilityState"
    );
}

/// The enumeration must not vary between calls within one process either.
#[test]
fn possible_bindings_are_stable_across_calls() {
    let src = "<script>\n\tlet foo;\n</script>\n\n<svelte:window bind:clientWidth={foo} />";
    let first = compile_error_message(src);
    for _ in 0..20 {
        assert_eq!(compile_error_message(src), first);
    }
}

/// Fuzzy suggestions read the same ordered table, so `Did you mean …` is pinned too.
#[test]
fn fuzzy_suggestion_matches_upstream() {
    let message = compile_error_message(
        "<script>\n\tlet foo;\n</script>\n\n<svelte:window bind:innerwidth={foo} />",
    );
    assert_eq!(
        message,
        "`bind:innerwidth` is not a valid binding. Did you mean 'innerWidth'?"
    );
}
