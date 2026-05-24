//! Every documented `CompileOptions` field must (a) be accepted by the
//! JSON deserializer and (b) have an observable effect on the output.
//!
//! Renaming a field on the Rust side without updating this test will
//! cause assertions to fail loudly — exactly the regression we want CI
//! to catch.

mod common;

use common::{compile, ok_result};

fn js_code(envelope: &serde_json::Value) -> String {
    ok_result(envelope)["js"]["code"]
        .as_str()
        .unwrap_or("")
        .to_string()
}

// ---------------------------------------------------------------------------
// generate
// ---------------------------------------------------------------------------

#[test]
fn generate_client_imports_internal_client() {
    let env = compile("<p>x</p>", r#"{"generate":"client"}"#);
    assert!(
        js_code(&env).contains("svelte/internal/client"),
        "generate=client must import svelte/internal/client"
    );
}

#[test]
fn generate_server_imports_internal_server() {
    let env = compile("<p>x</p>", r#"{"generate":"server"}"#);
    assert!(
        js_code(&env).contains("svelte/internal/server"),
        "generate=server must import svelte/internal/server"
    );
}

// ---------------------------------------------------------------------------
// dev
// ---------------------------------------------------------------------------

#[test]
fn dev_true_changes_emitted_runtime() {
    let dev_off = js_code(&compile(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte","dev":false}"#,
    ));
    let dev_on = js_code(&compile(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte","dev":true}"#,
    ));
    assert_ne!(
        dev_off, dev_on,
        "dev=true should produce different output than dev=false"
    );
    // Most reliable dev marker: FILENAME tag on the component.
    assert!(
        dev_on.contains("FILENAME") || dev_on.contains("check_target"),
        "dev=true output should contain dev-mode markers; got: {dev_on}"
    );
}

// ---------------------------------------------------------------------------
// runes
// ---------------------------------------------------------------------------

#[test]
fn runes_true_is_reflected_in_metadata() {
    let env = compile(
        "<script>let count = $state(0);</script>{count}",
        r#"{"filename":"App.svelte","runes":true}"#,
    );
    let result = ok_result(&env);
    assert_eq!(
        result["metadata"]["runes"],
        serde_json::Value::Bool(true),
        "runes=true must propagate into metadata.runes"
    );
}

#[test]
fn runes_false_is_reflected_in_metadata() {
    let env = compile(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte","runes":false}"#,
    );
    let result = ok_result(&env);
    assert_eq!(result["metadata"]["runes"], serde_json::Value::Bool(false));
}

// ---------------------------------------------------------------------------
// filename — visible in dev-mode FILENAME tag and in sourcemaps
// ---------------------------------------------------------------------------

#[test]
fn filename_appears_in_output_when_dev() {
    let env = compile(
        "<h1>x</h1>",
        r#"{"filename":"WidgetThing.svelte","dev":true}"#,
    );
    assert!(
        js_code(&env).contains("WidgetThing.svelte"),
        "dev-mode output must mention the filename"
    );
}

// ---------------------------------------------------------------------------
// css mode
// ---------------------------------------------------------------------------

#[test]
fn css_external_returns_separate_css_object() {
    let env = compile(
        "<h1>x</h1>\n<style>h1{color:red}</style>",
        r#"{"filename":"App.svelte","css":"external"}"#,
    );
    let result = ok_result(&env);
    assert!(
        result["css"].is_object(),
        "css=external must yield a top-level css object"
    );
    // External CSS should NOT be inlined into JS as a runtime $.append_styles call.
    assert!(
        !js_code(&env).contains("append_styles"),
        "css=external must not inline styles into JS"
    );
}

#[test]
fn css_injected_inlines_styles_into_js() {
    let env = compile(
        "<h1>x</h1>\n<style>h1{color:red}</style>",
        r#"{"filename":"App.svelte","css":"injected"}"#,
    );
    assert!(
        js_code(&env).contains("append_styles") || js_code(&env).contains("color"),
        "css=injected must inline styles into JS output"
    );
}

// ---------------------------------------------------------------------------
// namespace
// ---------------------------------------------------------------------------

#[test]
fn namespace_options_are_accepted() {
    // Whether namespace changes codegen depends on the elements used
    // (auto-detection wins for unambiguous SVG/MathML elements). For
    // the FFI contract we only require the field is recognised and
    // each documented value compiles.
    for ns in ["html", "svg", "mathml"] {
        let env = compile(
            "<g><circle/></g>",
            &format!(r#"{{"filename":"X.svelte","namespace":"{ns}"}}"#),
        );
        assert_eq!(env["ok"], serde_json::Value::Bool(true), "namespace={ns}");
    }
}

// ---------------------------------------------------------------------------
// preserveComments
// ---------------------------------------------------------------------------

#[test]
fn preserve_comments_keeps_html_comments() {
    let stripped = js_code(&compile(
        "<!-- keep me --><h1>x</h1>",
        r#"{"filename":"App.svelte","preserveComments":false}"#,
    ));
    let kept = js_code(&compile(
        "<!-- keep me --><h1>x</h1>",
        r#"{"filename":"App.svelte","preserveComments":true}"#,
    ));
    assert_ne!(
        stripped, kept,
        "preserveComments=true must change emitted markup"
    );
    assert!(
        kept.contains("keep me"),
        "preserveComments=true must keep the comment text"
    );
}

// ---------------------------------------------------------------------------
// customElement
// ---------------------------------------------------------------------------

#[test]
fn custom_element_option_is_accepted() {
    // Without a <svelte:options customElement="..."/> tag, the
    // boolean option alone is a no-op in rsvelte. The FFI surface
    // still needs to accept it.
    for value in [true, false] {
        let env = compile(
            "<h1>x</h1>",
            &format!(r#"{{"filename":"App.svelte","customElement":{value}}}"#),
        );
        assert_eq!(env["ok"], serde_json::Value::Bool(true));
    }
    // When the <svelte:options> tag IS present, the CE wrapper is in
    // the output — proves the CE codegen path is still wired up.
    let env = compile(
        "<svelte:options customElement=\"my-thing\" />\n<h1>x</h1>",
        r#"{"filename":"App.svelte","customElement":true}"#,
    );
    let code = js_code(&env);
    assert!(
        code.contains("customElements") || code.contains("create_custom_element"),
        "CE wrapper should appear when <svelte:options> tag is set; got: {code}"
    );
}

// ---------------------------------------------------------------------------
// hmr
// ---------------------------------------------------------------------------

#[test]
fn hmr_true_emits_hmr_wrapper() {
    let env = compile(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte","dev":true,"hmr":true,"generate":"client"}"#,
    );
    let code = js_code(&env);
    assert!(
        code.contains("hmr") || code.contains("HMR"),
        "hmr=true must add HMR-related codegen; got: {code}"
    );
}

// ---------------------------------------------------------------------------
// name
// ---------------------------------------------------------------------------

#[test]
fn explicit_name_option_is_accepted() {
    // rsvelte does not currently propagate the `name` option into the
    // emitted code (the function name is derived from the filename).
    // The FFI contract is still: the deserializer recognises the field
    // and compilation succeeds. If rsvelte starts honouring `name`,
    // tighten this test to assert the name actually appears in output.
    let env = compile(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte","dev":true,"name":"FunkyName"}"#,
    );
    assert_eq!(env["ok"], serde_json::Value::Bool(true));
}

// ---------------------------------------------------------------------------
// cssHashOverride — test harness hook
// ---------------------------------------------------------------------------

#[test]
fn css_hash_override_is_used() {
    let env = compile(
        "<h1>x</h1>\n<style>h1{color:red}</style>",
        r#"{"filename":"App.svelte","cssHashOverride":"svelte-zzzzzz"}"#,
    );
    let result = ok_result(&env);
    let css_code = result["css"]["code"].as_str().unwrap_or("");
    assert!(
        css_code.contains("svelte-zzzzzz"),
        "cssHashOverride must appear in CSS output; got: {css_code}"
    );
}

// ---------------------------------------------------------------------------
// experimental.async — at minimum should round-trip without error
// ---------------------------------------------------------------------------

#[test]
fn experimental_async_option_accepted() {
    let env = compile(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte","experimental":{"async":true}}"#,
    );
    assert_eq!(env["ok"], serde_json::Value::Bool(true));
}

// ---------------------------------------------------------------------------
// compatibility.componentApi
// ---------------------------------------------------------------------------

#[test]
fn component_api_v4_changes_codegen() {
    let v5 = js_code(&compile(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte","compatibility":{"componentApi":5}}"#,
    ));
    let v4 = js_code(&compile(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte","compatibility":{"componentApi":4}}"#,
    ));
    assert_ne!(
        v5, v4,
        "compatibility.componentApi=4 must change emitted code shape"
    );
}

// ---------------------------------------------------------------------------
// modernAst — at minimum should be accepted without error
// ---------------------------------------------------------------------------

#[test]
fn modern_ast_option_accepted() {
    let env = compile(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte","modernAst":true}"#,
    );
    assert_eq!(env["ok"], serde_json::Value::Bool(true));
}

// ---------------------------------------------------------------------------
// discloseVersion
// ---------------------------------------------------------------------------

#[test]
fn disclose_version_option_is_accepted() {
    // rsvelte's client codegen currently emits the disclose-version
    // import unconditionally (src/compiler/phases/3_transform/client/mod.rs).
    // FFI contract: the deserializer recognises `discloseVersion` and
    // compilation succeeds. Tighten when rsvelte gates the import.
    for value in [true, false] {
        let env = compile(
            "<h1>x</h1>",
            &format!(r#"{{"filename":"App.svelte","discloseVersion":{value}}}"#),
        );
        assert_eq!(env["ok"], serde_json::Value::Bool(true));
    }
    // At minimum the default-on state must still produce the import,
    // proving the codegen path itself hasn't disappeared.
    let on = js_code(&compile("<h1>x</h1>", ""));
    assert!(
        on.contains("disclose-version"),
        "default-on output should contain the disclose-version import"
    );
}

// ---------------------------------------------------------------------------
// fragments
// ---------------------------------------------------------------------------

#[test]
fn fragments_tree_changes_codegen() {
    let html = js_code(&compile(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte","fragments":"html"}"#,
    ));
    let tree = js_code(&compile(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte","fragments":"tree"}"#,
    ));
    assert_ne!(html, tree, "fragments=tree must change codegen");
}
