//! Regression test: whitespace / gap accounting around a `<svelte:options>`
//! opening tag (issue #2191).
//!
//! Every expectation is the byte-exact `async () => { … };` body official
//! svelte2tsx (submodules/language-tools) emits for the same source.
//! `<svelte:options>` used to compute its own opener spacing by hand instead
//! of going through the shared `opener_spacing` helper (the same bug class
//! already fixed for `<svelte:boundary>`), leaving it one space short
//! whenever it had a bare boolean attribute.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

/// The `async () => { … };` template body, which is where the divergences show.
fn template_body(source: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Input.svelte".to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    let code = svelte2tsx(source, opts).expect("svelte2tsx").code;
    let start = code.find("async () => {").expect("template body");
    let end = code.find("\nreturn { props:").expect("template body end");
    code[start..end].to_string()
}

#[test]
fn bare_boolean_attribute_keeps_the_full_opener_gap() {
    assert_eq!(
        template_body("<svelte:options runes />"),
        "async () => {  { svelteHTML.createElement(\"svelte:options\", {\"runes\":true,});}};"
    );
}

#[test]
fn expression_attribute_moves_the_gap_into_the_attribute_object() {
    assert_eq!(
        template_body("<svelte:options runes={true} />"),
        "async () => { { svelteHTML.createElement(\"svelte:options\", {  \"runes\":true,});}};"
    );
}

#[test]
fn string_attribute_moves_the_gap_into_the_attribute_object() {
    assert_eq!(
        template_body("<svelte:options customElement=\"my-el\" />"),
        concat!(
            "async () => { { svelteHTML.createElement(\"svelte:options\", ",
            "{  \"customElement\":`my-el`,});}};"
        )
    );
}

#[test]
fn mixed_bare_and_string_attributes_move_the_gap_into_the_attribute_object() {
    assert_eq!(
        template_body("<svelte:options runes customElement=\"my-el\" />"),
        concat!(
            "async () => { { svelteHTML.createElement(\"svelte:options\", ",
            "{  \"runes\":true,\"customElement\":`my-el`,});}};"
        )
    );
}

#[test]
fn no_attributes_keeps_the_default_single_space_gap() {
    assert_eq!(
        template_body("<svelte:options />"),
        "async () => { { svelteHTML.createElement(\"svelte:options\", {});}};"
    );
}
