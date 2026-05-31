//! Regression test pin for the `{@const}` cluster (issue #458, H-131..H-134, M-085).
//!
//! All Critical / High items in this cluster were addressed by earlier work
//! (PR #519 for the H-131 char-vs-byte index fix; the destructuring + scope
//! plumbing has been hardened in adjacent passes). Pin the cases the issue
//! cites so future drift surfaces.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn server(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn h132_pattern_default_is_preserved() {
    // `{@const { x = 5 } = {} }` must keep the `= 5` default in the lowered code.
    let out = client(r#"{#if true}{@const { x = 5 } = { } }{x}{/if}"#);
    assert!(out.contains("const { x = 5 }"), "got:\n{out}");
}

#[test]
fn h133_object_rest_binding_is_destructured() {
    let out = client(r#"{#if true}{@const { a, ...rest } = { a: 1, b: 2 } }{a}-{rest.b}{/if}"#);
    assert!(out.contains("const { a, ...rest } ="), "got:\n{out}");
    // The rest binding must reach template-reference resolution.
    assert!(out.contains(".rest.b"), "got:\n{out}");
}

#[test]
fn h134_computed_key_does_not_shadow_outer_binding_ssr() {
    // SSR: `{@const { [key]: value } = obj}` must not re-declare `key`.
    let out = server(
        r#"<script>let key = "a";</script>{#if true}{@const { [key]: value } = { a: 1 } }{value}{/if}"#,
    );
    // The outer `key` is preserved (used as the computed-property lookup).
    assert!(out.contains("[key]: value"), "got:\n{out}");
    // The template emits `value`, not `key`.
    assert!(out.contains("$.escape(value)"), "got:\n{out}");
}

#[test]
fn h131_const_with_multibyte_default_compiles() {
    // The pre-merged H-131 fix moved the `{@const}` splitters from char-index
    // to byte-index. Pin a multi-byte default value so a future regression is
    // caught immediately.
    let out = client(r#"{#if true}{@const x = "日本語" }{x}{/if}"#);
    assert!(out.contains("\"日本語\""), "got:\n{out}");
}
