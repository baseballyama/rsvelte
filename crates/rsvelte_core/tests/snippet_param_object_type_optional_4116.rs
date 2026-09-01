//! An optional member inside a `{#snippet}` parameter's object type must not
//! swallow the whole parameter list.
//!
//! The type-annotation stripper looked for `?:` anywhere in the parameter's
//! source, so `b: { t?: string }` produced the name `b: { t`, the parameter list
//! failed to re-parse, and every parameter was dropped. Only the server consumes
//! that stripper, so the client rows are controls that must not move; the rows
//! whose object type has no optional member are controls on the other axis.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn declaration(params: &str, generate: GenerateMode) -> String {
    let source = format!(
        "<script lang=\"ts\"></script>\n{{#snippet s({params})}}<i>x</i>{{/snippet}}{{@render s()}}\n"
    );
    let out = compile(
        source.as_str(),
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    out.lines()
        .find(|line| line.contains("function s(") || line.contains("const s = ("))
        .unwrap_or_else(|| panic!("no declaration of `s` for `{params}` ({generate:?}):\n{out}"))
        .trim()
        .to_string()
}

const SERVER: &str = "function s($$renderer, a, b) {";
const CLIENT: &str = "const s = ($$anchor, a = $.noop, b = $.noop) => {";

#[test]
fn an_optional_member_in_an_object_type_keeps_every_parameter() {
    for params in [
        "a: boolean, b: { t?: string }",
        "a: boolean, b: { t: string; v?: string }",
        "a: boolean, b: { t: string\n\tv?: string }",
    ] {
        assert_eq!(
            declaration(params, GenerateMode::Server),
            SERVER,
            "{params}"
        );
        assert_eq!(
            declaration(params, GenerateMode::Client),
            CLIENT,
            "{params}"
        );
    }
}

#[test]
fn a_required_member_object_type_is_unchanged() {
    let params = "a: boolean, b: { t: string }";
    assert_eq!(declaration(params, GenerateMode::Server), SERVER);
    assert_eq!(declaration(params, GenerateMode::Client), CLIENT);
}

#[test]
fn a_top_level_optional_parameter_is_unchanged() {
    assert_eq!(
        declaration("a?: boolean, b: string", GenerateMode::Server),
        SERVER
    );
}
