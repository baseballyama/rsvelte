//! Regression test: server module `$effect` stripping must be JS-lexical-aware
//! (issue #447, H-029). `strip_effects_from_source` matched `$effect.root(` /
//! `$effect.pre(` / `$effect(` as raw byte patterns and rewrote them even inside
//! string / template literals and comments, corrupting their contents.

use svelte_compiler_rust::{GenerateMode, compile_module, compiler::ModuleCompileOptions};

fn server_module(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("x.svelte.js".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile_module")
    .js
    .code
}

#[test]
fn effect_text_in_string_is_preserved() {
    let out = server_module(r#"export const code = "$effect.root(() => {})";"#);
    assert!(
        out.contains(r#"export const code = "$effect.root(() => {})";"#),
        "effect-shaped text in a string literal must survive, got:\n{out}"
    );
}

#[test]
fn effect_text_in_comment_is_preserved() {
    let out = server_module(r#"/* $effect.pre(() => {}) */ export const a = 1;"#);
    assert!(
        out.contains("/* $effect.pre(() => {}) */"),
        "effect-shaped text in a comment must survive, got:\n{out}"
    );
}

#[test]
fn effect_text_in_template_is_preserved() {
    let out = server_module(r#"export const t = `x $effect(() => {}) y`;"#);
    assert!(
        out.contains("`x $effect(() => {}) y`"),
        "effect-shaped text in a template literal must survive, got:\n{out}"
    );
}

#[test]
fn real_effect_call_is_still_stripped() {
    // A genuine `$effect.root(...)` call (effects don't run on the server) is
    // still replaced with a no-op cleanup function.
    let out = server_module(r#"export function f(){ $effect.root(() => { g(); }); }"#);
    assert!(!out.contains("$effect.root"), "got:\n{out}");
    assert!(out.contains("() => {}"), "got:\n{out}");
}
