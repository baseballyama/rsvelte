//! A numeric key in a `$props()` destructuring is a NUMBER to upstream
//! (`b.literal(key.value)`), not the text between the braces (issue #3229).
//! rsvelte quoted every key, so `let { 0: a } = $props()` emitted
//! `$.prop($$props, '0', …)`, and the key's *value* was truncated with an
//! `as i64` cast, so `0.5` reached `$$props['0']`. Every expectation here is
//! the official compiler's output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("must compile")
    .js
    .code
}

fn mutated(pattern: &str) -> String {
    format!(
        "<script>\n\tlet {pattern} = $props();\n</script>\n\n<button onclick={{() => (a = 2)}}>x</button>\n"
    )
}

#[test]
fn a_numeric_key_reaches_prop_as_a_number() {
    for dev in [false, true] {
        let out = client(&mutated("{ 0: a }"), dev);
        assert!(
            out.contains("$.prop($$props, 0, 7)"),
            "dev={dev}: numeric key must stay a number, got:\n{out}"
        );
    }
}

#[test]
fn a_numeric_key_carries_its_value_not_its_spelling() {
    for (pattern, expected) in [
        ("{ 0x10: a }", "$.prop($$props, 16, 7)"),
        ("{ 1e3: a }", "$.prop($$props, 1000, 7)"),
        ("{ 0.5: a }", "$.prop($$props, 0.5, 7)"),
    ] {
        let out = client(&mutated(pattern), false);
        assert!(
            out.contains(expected),
            "`{pattern}` must emit `{expected}`, got:\n{out}"
        );
    }
}

#[test]
fn a_quoted_numeric_key_stays_a_string() {
    let out = client(&mutated("{ '0': a }"), false);
    assert!(
        out.contains("$.prop($$props, '0', 7)"),
        "a string key keeps its quotes, got:\n{out}"
    );
}

#[test]
fn a_numeric_key_is_excluded_from_rest_props_as_a_number() {
    let out = client(
        "<script>\n\tlet { 1: a, x: b, ...rest } = $props();\n</script>\n\n<button onclick={() => (a = 2)}>{b}{rest.z}</button>\n",
        false,
    );
    assert!(
        out.contains("new Set(['$$slots', '$$events', '$$legacy', 1, 'x'])"),
        "rest exclusions carry the key's literal spelling, got:\n{out}"
    );
}

#[test]
fn a_fractional_read_only_key_is_not_truncated() {
    let out = client(
        "<script>\n\tlet { 0.5: a } = $props();\n</script>\n\n{a}\n",
        false,
    );
    assert!(
        out.contains("$$props['0.5']"),
        "a read-only numeric prop keeps its whole key, got:\n{out}"
    );
}
