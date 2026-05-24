//! rsvelte_compile_module — Svelte `.svelte.js` module compilation.

mod common;

use common::{compile_module, ok_result};

#[test]
fn module_compile_emits_js_object() {
    let env = compile_module(
        "export function add(a, b) { return a + b; }",
        r#"{"filename":"util.svelte.js"}"#,
    );
    let result = ok_result(&env);
    assert!(result["js"]["code"].is_string());
}

#[test]
fn module_compile_supports_runes() {
    let env = compile_module(
        "export const counter = $state(0);",
        r#"{"filename":"counter.svelte.js"}"#,
    );
    let result = ok_result(&env);
    let code = result["js"]["code"].as_str().unwrap_or("");
    assert!(!code.is_empty(), "module compile produced no code");
}

#[test]
fn module_compile_server_generate() {
    let env = compile_module(
        "export const x = 1;",
        r#"{"filename":"x.svelte.js","generate":"server"}"#,
    );
    assert_eq!(env["ok"], serde_json::Value::Bool(true));
}

#[test]
fn module_compile_handles_malformed_options() {
    let env = compile_module("export const x = 1;", "{nope");
    assert_eq!(env["ok"], serde_json::Value::Bool(false));
    assert!(env["error"]["message"]
        .as_str()
        .unwrap()
        .contains("options_json"));
}
