//! Regression test: attribute shorthand `{…}` must be a bare identifier
//! (issue #475, H-153). `{a.b}`, `{a + b}`, `{a()}` are `expected_token` errors
//! upstream; rsvelte previously accepted the whole expression text as the
//! attribute name.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn try_compile(src: &str) -> Result<(), String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|_| ())
    .map_err(|e| format!("{e:?}"))
}

#[test]
fn non_identifier_shorthand_is_rejected() {
    assert!(try_compile("<div {a.b}></div>").is_err());
    assert!(try_compile("<div {a + b}></div>").is_err());
    assert!(try_compile("<div {a()}></div>").is_err());
}

#[test]
fn bare_identifier_shorthand_compiles() {
    let src = r#"<script>let foo = 1;</script><div {foo}></div>"#;
    assert!(
        try_compile(src).is_ok(),
        "valid {{foo}} shorthand should compile"
    );
}
