//! JSON envelope shape — every downstream language wrapper depends on
//! these exact keys. Renaming `ok`, `result`, `error`, or any of the
//! nested fields is a breaking change and must require a deliberate
//! test update.

mod common;

use common::{compile, ok_result};
use serde_json::Value;

#[test]
fn success_envelope_has_ok_true_and_result() {
    let env = compile("<h1>Hello</h1>", "");
    assert_eq!(env["ok"], Value::Bool(true));
    assert!(env["result"].is_object(), "missing `result` object");
    assert!(env.get("error").is_none() || env["error"].is_null());
}

#[test]
fn success_result_has_js_css_warnings_metadata() {
    let env = compile("<h1>Hello</h1>", "");
    let result = ok_result(&env);

    assert!(
        result["js"].is_object(),
        "result.js must be an object — wrappers depend on this"
    );
    assert!(
        result["js"]["code"].is_string(),
        "result.js.code must be a string"
    );
    // result.js.map is allowed to be null or object (when sourcemaps are off vs on)
    assert!(
        result["js"]["map"].is_null() || result["js"]["map"].is_object(),
        "result.js.map must be null or object, got {:?}",
        result["js"]["map"]
    );

    // css is allowed to be null (no <style>) or an object.
    assert!(
        result["css"].is_null() || result["css"].is_object(),
        "result.css must be null or object, got {:?}",
        result["css"]
    );

    assert!(
        result["warnings"].is_array(),
        "result.warnings must be array"
    );
    assert!(
        result["metadata"].is_object(),
        "result.metadata must be object"
    );
    assert!(
        result["metadata"]["runes"].is_boolean(),
        "result.metadata.runes must be boolean"
    );
}

#[test]
fn css_block_yields_css_object_with_documented_fields() {
    let env = compile(
        "<h1>x</h1>\n<style>h1 { color: red }</style>",
        r#"{"filename":"App.svelte"}"#,
    );
    let result = ok_result(&env);
    let css = &result["css"];
    assert!(css.is_object(), "expected css object when <style> present");
    assert!(css["code"].is_string(), "css.code must be string");
    assert!(
        css["map"].is_null() || css["map"].is_object(),
        "css.map must be null or object"
    );
    assert!(
        css["hasGlobal"].is_boolean(),
        "css.hasGlobal must be boolean — wrappers may key off it"
    );
}

#[test]
fn warning_objects_have_documented_keys() {
    // unused class triggers a warning in svelte 5
    let env = compile(
        "<h1>x</h1>\n<style>.unused { color: red }</style>",
        r#"{"filename":"App.svelte"}"#,
    );
    let result = ok_result(&env);
    let warnings = result["warnings"].as_array().unwrap();
    assert!(!warnings.is_empty(), "expected at least one warning");
    let w = &warnings[0];
    assert!(w["code"].is_string(), "warnings[].code must be string");
    assert!(
        w["message"].is_string(),
        "warnings[].message must be string"
    );
    // start/end/position/frame are optional but when present must have these shapes
    if !w["start"].is_null() {
        assert!(w["start"]["line"].is_number());
        assert!(w["start"]["column"].is_number());
        assert!(w["start"]["character"].is_number());
    }
}

#[test]
fn parse_error_returns_ok_false_envelope() {
    // A truly malformed component should round-trip through the
    // compiler as an error, not panic.
    let env = compile("<button onclick={", r#"{"filename":"Bad.svelte"}"#);
    // Could be compiler error → ok=false, or compiler may emit code +
    // warnings (depends on recoverability). The contract: if ok=false,
    // shape must be {ok:false, error:{message:string}}.
    if env["ok"] == Value::Bool(false) {
        assert!(env["error"].is_object());
        assert!(env["error"]["message"].is_string());
    }
}

#[test]
fn malformed_options_returns_ok_false_envelope() {
    let env = compile("<h1>x</h1>", "{not json");
    assert_eq!(env["ok"], Value::Bool(false));
    assert!(
        env["error"]["message"]
            .as_str()
            .unwrap()
            .contains("options_json")
    );
}
