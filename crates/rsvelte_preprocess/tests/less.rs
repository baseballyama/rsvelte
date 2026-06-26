//! Port of the upstream `svelte-preprocess-less` test suite
//! (`submodules/svelte-preprocess-less/test/index.js`).
//!
//! The Less port is a JS fallback (it shells out to the installed `less` over a
//! Node bridge), so the styled-output test asserts the live output of the
//! installed `less` (the drop-in contract from the plan §4.3). The
//! detection-filter and error-frame formatting are the package's own logic and
//! are asserted exactly. Tests that need the toolchain skip with a notice when
//! Node / `less` is unavailable.

#![cfg(feature = "less")]

use std::path::PathBuf;

use rsvelte_core::compiler::preprocess::types::{AttributeValue, PreprocessAttributeMap as Map};
use rsvelte_preprocess::filter::FilterOptions;
use rsvelte_preprocess::less::{LessError, LessOptions, Pos, less, preprocess_less};

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .canonicalize()
        .unwrap()
}

fn opts() -> LessOptions {
    LessOptions {
        resolve_dir: Some(repo_root()),
        ..Default::default()
    }
}

fn attrs(pairs: &[(&str, &str)]) -> Map<String, AttributeValue> {
    let mut m = Map::default();
    for (k, v) in pairs {
        m.insert(k.to_string(), AttributeValue::String(v.to_string()));
    }
    m
}

/// Returns `false` (with a printed notice) when Node / `less` isn't available.
fn toolchain_ready() -> bool {
    match preprocess_less(
        &opts(),
        &FilterOptions::default(),
        Some("./probe.html"),
        "a{b:1}",
        &attrs(&[("lang", "less")]),
    ) {
        Ok(_) => true,
        Err(LessError::Bridge(msg)) => {
            eprintln!("skipping: less toolchain unavailable: {msg}");
            false
        }
        // A render error still proves the toolchain runs.
        Err(LessError::Render { .. }) => true,
    }
}

#[test]
fn filters_non_less_styles() {
    let out = preprocess_less(
        &opts(),
        &FilterOptions::default(),
        None,
        "",
        &Map::default(),
    )
    .unwrap();
    assert!(out.is_none());
}

#[test]
fn less_returns_a_preprocessor() {
    assert!(
        less(LessOptions::default(), FilterOptions::default())
            .style
            .is_some()
    );
}

#[test]
fn returns_preprocessed_styles() {
    if !toolchain_ready() {
        return;
    }
    let result = preprocess_less(
        &opts(),
        &FilterOptions::default(),
        Some("./src/components/App.html"),
        "@color: red;\nb { color: @color }",
        &attrs(&[("lang", "less")]),
    )
    .expect("compiles")
    .expect("not filtered out");

    // The compiled CSS body matches the upstream fixture; the installed less@4
    // additionally inlines a sourceMappingURL comment (the upstream fixture
    // predates that behavior).
    assert!(
        result.code.starts_with("b {\n  color: red;\n}\n"),
        "unexpected css: {:?}",
        result.code
    );
}

#[test]
fn formats_errors_correctly() {
    if !toolchain_ready() {
        return;
    }
    let err = preprocess_less(
        &opts(),
        &FilterOptions::default(),
        Some("./src/components/App.html"),
        "b {\n  color: @color\n}",
        &attrs(&[("lang", "less")]),
    )
    .expect_err("should fail");

    match err {
        LessError::Render {
            frame, start, end, ..
        } => {
            assert_eq!(
                frame.as_deref(),
                Some("1:b {\n2:  color: @color\n           ^\n3:}")
            );
            let expected = Pos {
                line: 2,
                column: 9,
                character: 13,
            };
            assert_eq!(start, Some(expected));
            assert_eq!(end, Some(expected));
        }
        other => panic!("expected a render error, got {other:?}"),
    }
}
