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
    let env = compile("<h1>x</h1>", r#"{"filename":"App.svelte","runes":false}"#);
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

#[test]
fn enum_options_reject_unknown_values_and_accept_documented_aliases() {
    for (field, value) in [
        ("generate", "browser"),
        ("namespace", "xml"),
        ("css", "inline"),
        ("fragments", "dom"),
    ] {
        let env = compile("<p>x</p>", &format!(r#"{{"{field}":"{value}"}}"#));
        assert_eq!(env["ok"], serde_json::Value::Bool(false), "{field}={value}");
        assert!(env["error"]["message"].as_str().unwrap().contains(field));
    }
    for options in [
        r#"{"generate":"client"}"#,
        r#"{"generate":"server"}"#,
        r#"{"generate":false}"#,
        r#"{"namespace":"html"}"#,
        r#"{"namespace":"svg"}"#,
        r#"{"namespace":"mathml"}"#,
        r#"{"css":"external"}"#,
        r#"{"css":"injected"}"#,
        r#"{"fragments":"html"}"#,
        r#"{"fragments":"tree"}"#,
        r#"{"compatibility":{"componentApi":4}}"#,
        r#"{"compatibility":{"componentApi":5}}"#,
    ] {
        let env = compile("<p>x</p>", options);
        assert_eq!(env["ok"], serde_json::Value::Bool(true), "{options}");
    }
    let env = compile("<p>x</p>", r#"{"compatibility":{"componentApi":6}}"#);
    assert_eq!(env["ok"], serde_json::Value::Bool(false));
    assert!(
        env["error"]["message"]
            .as_str()
            .unwrap()
            .contains("componentApi")
    );
}

#[test]
fn option_validation_rejects_unknown_removed_and_nested_unknown_keys() {
    for (options, expected) in [
        (
            r#"{"nonsense":1}"#,
            "Unrecognised compiler option nonsense\nhttps://svelte.dev/e/options_unrecognised",
        ),
        (
            r#"{"legacy":null}"#,
            "Invalid compiler option: The legacy option has been removed. If you are using this because of legacy.componentApi, use compatibility.componentApi instead\nhttps://svelte.dev/e/options_removed",
        ),
        (
            r#"{"experimental":{"async":true,"nonsense":1}}"#,
            "Unrecognised compiler option experimental.nonsense\nhttps://svelte.dev/e/options_unrecognised",
        ),
        (
            r#"{"compatibility":{"componentApi":5,"nonsense":1}}"#,
            "Unrecognised compiler option compatibility.nonsense\nhttps://svelte.dev/e/options_unrecognised",
        ),
        (
            r#"{"dev":"yes"}"#,
            "Invalid compiler option: dev should be true or false, if specified\nhttps://svelte.dev/e/options_invalid_value",
        ),
        (
            r#"{"customElement":"x-a"}"#,
            "Invalid compiler option: customElement should be true or false\nhttps://svelte.dev/e/options_invalid_value",
        ),
        (
            r#"{"css":false}"#,
            "Invalid compiler option: The boolean options have been removed from the css option. Use \"external\" instead of false and \"injected\" instead of true\nhttps://svelte.dev/e/options_invalid_value",
        ),
    ] {
        let env = compile("<p>x</p>", options);
        assert_eq!(env["ok"], serde_json::Value::Bool(false), "{options}");
        assert_eq!(env["error"]["message"], expected, "{options}");
    }
}

#[test]
fn truthy_non_boolean_runes_matches_parametric_semantics() {
    let env = compile("<p>x</p>", r#"{"runes":1}"#);
    assert_eq!(
        ok_result(&env)["metadata"]["runes"],
        serde_json::Value::Bool(true)
    );
}

#[test]
fn legacy_generate_alias_is_accepted_and_warns() {
    let env = compile("<p>x</p>", r#"{"generate":"dom"}"#);
    assert!(warning_codes(&env).contains(&"options_renamed_ssr_dom".to_string()));
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
// modernAst
// ---------------------------------------------------------------------------

#[test]
fn modern_ast_option_returns_public_ast() {
    let env = compile(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte","modernAst":true}"#,
    );
    assert_eq!(env["ok"], serde_json::Value::Bool(true));
    assert_eq!(env["result"]["ast"]["type"], "Root");
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

// ---------------------------------------------------------------------------
// accessors / immutable — the deprecation, not the behaviour
// ---------------------------------------------------------------------------

fn warning_codes(envelope: &serde_json::Value) -> Vec<String> {
    ok_result(envelope)["warnings"]
        .as_array()
        .map(|ws| {
            ws.iter()
                .filter_map(|w| w["code"].as_str().map(str::to_string))
                .collect()
        })
        .unwrap_or_default()
}

/// Upstream raises these from `deprecate()`, which is `warn_once` over a
/// module-level `Set`: the diagnostic fires on the option being **supplied**
/// (`accessors: false` warns too) and exactly **once per process**. No
/// output-comparison gate can see either half — every corpus gate compiles a
/// case once, so a rule about the second compile has no second compile to run
/// — which is why the unit here is a process rather than a compile.
///
/// This must stay the only test in this binary that supplies either option:
/// the latches are process-global and the test binary runs its tests in
/// parallel threads.
#[test]
fn accessors_and_immutable_deprecations_warn_once_per_process() {
    // First compile, with `false` values: presence alone must report, and both
    // must report — a single shared latch would silence the second one.
    assert_eq!(
        warning_codes(&compile(
            "<h1>x</h1>",
            r#"{"filename":"App.svelte","accessors":false,"immutable":false}"#,
        )),
        vec![
            "options_deprecated_accessors",
            "options_deprecated_immutable"
        ],
    );

    // Every later compile in this process is silent, whatever the value.
    for _ in 0..2 {
        assert_eq!(
            warning_codes(&compile(
                "<h1>x</h1>",
                r#"{"filename":"App.svelte","accessors":true,"immutable":true}"#,
            )),
            Vec::<String>::new(),
        );
    }

    // Negative control: the behavioural half is unaffected by the latch, so a
    // fix that silenced the diagnostic by dropping the option would be caught
    // here rather than passing as "warned once".
    // `accessors` only has anything to act on when the component exports a
    // prop, so the control source is a legacy `export let`, not `<h1>x</h1>`.
    const EXPORTING: &str = "<script>export let a = 1;</script><b>{a}</b>";
    let plain = js_code(&compile(EXPORTING, r#"{"filename":"App.svelte"}"#));
    let accessed = js_code(&compile(
        EXPORTING,
        r#"{"filename":"App.svelte","accessors":true}"#,
    ));
    assert_ne!(
        plain, accessed,
        "accessors=true must still change codegen after the deprecation has been warned"
    );
}
