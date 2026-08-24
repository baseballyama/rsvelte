//! `css.map` for a rule that nests, and for an at-rule (issue #3505).
//!
//! `css.code` is byte-identical to official on every source here, so no gate
//! that compares generated text can see the difference — the nested-rule and
//! at-rule emitters wrote their output with `push_str`, which MagicString
//! models as an *insertion* and never maps, instead of copying it out of the
//! source. Every `mappings` string below is the official compiler's verbatim
//! output at the pinned Svelte revision; the flat rule is the control that was
//! already correct.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css(source: &str) -> (String, String) {
    let result = compile(
        source,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compiles");
    let css = result.css.expect("external css");
    let map: serde_json::Value =
        serde_json::from_str(&css.map.expect("css map")).expect("css map is JSON");
    (
        css.code,
        map["mappings"].as_str().expect("mappings").to_string(),
    )
}

fn component(style: &str) -> String {
    format!("<b class=\"a\"><i class=\"b\">x</i></b>\n<style>\n\t{style}\n</style>\n")
}

#[test]
fn a_flat_rule_is_unchanged() {
    let (code, mappings) = css(&component(".a { color: red }"));
    assert_eq!(code, "\n\t.a.svelte-70s02x { color: red }\n");
    assert_eq!(mappings, ";AAEA,CAAC,gBAAE,CAAC,EAAE,WAAW;");
}

#[test]
fn an_ampersand_block_keeps_the_declarations_before_it() {
    let (code, mappings) = css(&component(".a { color: red; &:hover { color: blue } }"));
    assert_eq!(
        code,
        "\n\t.a.svelte-70s02x { color: red; &:hover { color: blue } }\n"
    );
    assert_eq!(
        mappings,
        ";AAEA,CAAC,gBAAE,CAAC,EAAE,UAAU,EAAE,CAAC,MAAM,CAAC,EAAE,YAAY,CAAC;"
    );
}

#[test]
fn a_nested_at_rule_is_mapped() {
    let (code, mappings) = css(&component(
        ".a { color: red; @media (min-width: 1px) { color: blue } }",
    ));
    assert_eq!(
        code,
        "\n\t.a.svelte-70s02x { color: red; @media (min-width: 1px) { color: blue } }\n"
    );
    assert_eq!(
        mappings,
        ";AAEA,CAAC,gBAAE,CAAC,EAAE,UAAU,EAAE,wBAAwB,EAAE,YAAY,CAAC;"
    );
}

#[test]
fn a_top_level_at_rule_maps_its_own_prelude() {
    let (code, mappings) = css(&component("@media (min-width: 1px) { .a { color: red } }"));
    assert_eq!(
        code,
        "\n\t@media (min-width: 1px) { .a.svelte-70s02x { color: red } }\n"
    );
    assert_eq!(
        mappings,
        ";AAEA,CAAC,wBAAwB,EAAE,gBAAE,CAAC,EAAE,WAAW,CAAC;"
    );

    let (code, mappings) = css(&component("@supports (color: red) { .a { color: red } }"));
    assert_eq!(
        code,
        "\n\t@supports (color: red) { .a.svelte-70s02x { color: red } }\n"
    );
    assert_eq!(
        mappings,
        ";AAEA,CAAC,uBAAuB,EAAE,gBAAE,CAAC,EAAE,WAAW,CAAC;"
    );
}

#[test]
fn two_levels_of_nesting_and_a_combinator_are_mapped() {
    let (code, mappings) = css(&component(
        ".a { color: red; & .b { color: blue; &:focus { color: lime } } }",
    ));
    assert_eq!(
        code,
        "\n\t.a.svelte-70s02x { color: red; & .b:where(.svelte-70s02x) { color: blue; &:focus { color: lime } } }\n"
    );
    assert_eq!(
        mappings,
        ";AAEA,CAAC,gBAAE,CAAC,EAAE,UAAU,EAAE,CAAC,CAAC,wBAAE,CAAC,EAAE,WAAW,EAAE,CAAC,MAAM,CAAC,EAAE,YAAY,CAAC,EAAE;"
    );

    let (code, mappings) = css(&component(".a { color: red; & > .b { margin: 0 } }"));
    assert_eq!(
        code,
        "\n\t.a.svelte-70s02x { color: red; & > .b:where(.svelte-70s02x) { margin: 0 } }\n"
    );
    assert_eq!(
        mappings,
        ";AAEA,CAAC,gBAAE,CAAC,EAAE,UAAU,EAAE,CAAC,CAAC,CAAC,CAAC,wBAAE,CAAC,EAAE,UAAU,CAAC;"
    );
}
