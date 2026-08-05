//! Regression test for issue #2111 — `svelte_self_invalid_placement`'s message
//! text had drifted from the official compiler's wording (`{#if}, {#each},
//! {#snippet} blocks or component `children` snippets` instead of the official
//! `` `{#if}` blocks, `{#each}` blocks, `{#snippet}` blocks or slots passed to
//! components ``). Mirrors `packages/svelte/src/compiler/errors.js` /
//! `tests/compiler-errors/samples/self-reference/_config.js` in the Svelte
//! submodule.

use rsvelte_core::compiler::AnalysisError;
use rsvelte_core::{CompileError, CompileOptions, GenerateMode, compile};

const EXPECTED_MESSAGE: &str = "`<svelte:self>` components can only exist inside `{#if}` blocks, `{#each}` blocks, `{#snippet}` blocks or slots passed to components\nhttps://svelte.dev/e/svelte_self_invalid_placement";

#[test]
fn message_matches_official_wording() {
    let result = compile(
        "<svelte:self/>",
        CompileOptions {
            filename: Some("main.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    );

    let err = result.expect_err("top-level <svelte:self> must be rejected");
    match err {
        CompileError::Analysis(AnalysisError::ValidationWithCode { code, message, .. }) => {
            assert_eq!(code, "svelte_self_invalid_placement");
            assert_eq!(message, EXPECTED_MESSAGE);
        }
        other => panic!("expected an AnalysisError::ValidationWithCode, got: {other:?}"),
    }
}
