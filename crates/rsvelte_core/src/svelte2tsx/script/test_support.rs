//! Shared helpers for the `script` submodule unit tests.

use super::super::svelte2tsx::{Svelte2TsxOptions, Svelte2TsxResult, svelte2tsx};

/// Helper to run svelte2tsx and return the result
pub(super) fn run_svelte2tsx(source: &str) -> Svelte2TsxResult {
    svelte2tsx(source, Svelte2TsxOptions::default()).expect("svelte2tsx should not fail")
}

/// Helper to run svelte2tsx with TS enabled
pub(super) fn run_svelte2tsx_ts(source: &str) -> Svelte2TsxResult {
    svelte2tsx(
        source,
        Svelte2TsxOptions {
            filename: "Component.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx should not fail")
}
