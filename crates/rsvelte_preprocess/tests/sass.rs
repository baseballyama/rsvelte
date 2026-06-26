//! Port of the upstream `svelte-preprocess-sass` test suite
//! (`submodules/svelte-preprocess-sass/test/index.js`).

#![cfg(feature = "sass")]

use rsvelte_core::compiler::preprocess::types::{AttributeValue, PreprocessAttributeMap as Map};
use rsvelte_preprocess::filter::FilterOptions;
use rsvelte_preprocess::sass::{SassOptions, preprocess_sass, sass};

const SAMPLE_SCSS: &str = "$color: red;\nb {\n  color: $color\n}";
const SAMPLE_SASS: &str = "$primary: red\nb\n  color: $primary";
const EXPECTED: &str = "b {\n  color: red;\n}";

fn attrs(pairs: &[(&str, &str)]) -> Map<String, AttributeValue> {
    let mut m = Map::default();
    for (k, v) in pairs {
        m.insert(k.to_string(), AttributeValue::String(v.to_string()));
    }
    m
}

/// Mirror of the upstream `preprocess(attributes, styles, sassOptions, filterOptions)` helper.
fn preprocess(
    attributes: &[(&str, &str)],
    styles: &str,
    sass_options: SassOptions,
    filter_options: FilterOptions,
) -> String {
    preprocess_sass(
        &sass_options,
        &filter_options,
        Some("./src/components/App.html"),
        styles,
        &attrs(attributes),
    )
    .expect("compiles")
    .expect("not filtered out")
    .code
}

#[test]
fn filters_non_sass_styles() {
    let out = preprocess_sass(
        &SassOptions::default(),
        &FilterOptions::default(),
        None,
        "",
        &Map::default(),
    )
    .unwrap();
    assert!(out.is_none());
}

#[test]
fn returns_preprocessed_styles() {
    assert_eq!(
        preprocess(
            &[("lang", "scss")],
            SAMPLE_SCSS,
            SassOptions::default(),
            FilterOptions::default()
        ),
        EXPECTED
    );
    assert_eq!(
        preprocess(
            &[("type", "text/scss")],
            SAMPLE_SCSS,
            SassOptions::default(),
            FilterOptions::default()
        ),
        EXPECTED
    );
}

#[test]
fn sass_returns_a_preprocessor() {
    assert!(
        sass(SassOptions::default(), FilterOptions::default())
            .style
            .is_some()
    );
}

#[test]
fn uses_indented_syntax_for_lang_sass() {
    assert_eq!(
        preprocess(
            &[("lang", "sass")],
            SAMPLE_SASS,
            SassOptions::default(),
            FilterOptions::default()
        ),
        EXPECTED
    );
    assert_eq!(
        preprocess(
            &[("type", "text/sass")],
            SAMPLE_SASS,
            SassOptions::default(),
            FilterOptions::default()
        ),
        EXPECTED
    );
}

#[test]
fn uses_indented_syntax_from_sass_options() {
    let opts = || SassOptions {
        indented_syntax: Some(true),
        ..Default::default()
    };
    assert_eq!(
        preprocess(
            &[("lang", "scss")],
            SAMPLE_SASS,
            opts(),
            FilterOptions::default()
        ),
        EXPECTED
    );
    assert_eq!(
        preprocess(
            &[("type", "text/scss")],
            SAMPLE_SASS,
            opts(),
            FilterOptions::default()
        ),
        EXPECTED
    );
}

#[test]
fn does_not_detect_sass_with_filter_options() {
    let scss_filter = || FilterOptions::named("scss");
    assert!(
        preprocess_sass(
            &SassOptions::default(),
            &scss_filter(),
            None,
            SAMPLE_SASS,
            &attrs(&[("lang", "sass")]),
        )
        .unwrap()
        .is_none()
    );
    assert!(
        preprocess_sass(
            &SassOptions::default(),
            &scss_filter(),
            None,
            SAMPLE_SASS,
            &attrs(&[("type", "text/sass")]),
        )
        .unwrap()
        .is_none()
    );
}
