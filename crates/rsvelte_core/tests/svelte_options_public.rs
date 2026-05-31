//! Issue #449: public/`<svelte:options>` options must actually be enforced —
//! explicit `runes={false}` (H-114), `customElement={null}` (H-115), the
//! `disclose_version` option (H-087), and the `name` option (H-088).

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn opts(name: Option<String>, disclose: bool) -> CompileOptions {
    CompileOptions {
        filename: Some("T.svelte".into()),
        generate: GenerateMode::Client,
        dev: false,
        name,
        disclose_version: disclose,
        ..Default::default()
    }
}

/// H-114: `<svelte:options runes={false} />` must keep runes mode off, so a
/// `$state` rune is rejected rather than silently re-enabling runes via
/// auto-detection.
#[test]
fn explicit_runes_false_is_not_undone_by_autodetection() {
    let src = "<svelte:options runes={false} />\n<script>let count = $state(0);</script>\n{count}";
    let err = compile(src, opts(None, true)).err();
    let msg = format!("{err:?}");
    assert!(
        msg.contains("rune_invalid_usage"),
        "runes={{false}} was undone by auto-detection: {msg}"
    );
}

/// H-115: `customElement={null}` must NOT enable the custom-element pipeline,
/// so no `options_missing_custom_element` warning is produced.
#[test]
fn custom_element_null_does_not_enable_pipeline() {
    let src = "<svelte:options customElement={null} />\n<script>let x = 0;</script>\n{x}";
    let result = compile(src, opts(None, true)).expect("should compile");
    assert!(
        !result
            .warnings
            .iter()
            .any(|w| w.code == "options_missing_custom_element"),
        "customElement={{null}} wrongly enabled the custom-element pipeline"
    );
    assert!(
        !result.js.code.contains("customElement"),
        "{}",
        result.js.code
    );
}

/// H-087: `disclose_version: false` must omit the disclose-version import.
#[test]
fn disclose_version_false_omits_import() {
    let src = "<script>let x = 0;</script>\n{x}";
    let with = compile(src, opts(None, true)).unwrap().js.code;
    let without = compile(src, opts(None, false)).unwrap().js.code;
    assert!(with.contains("svelte/internal/disclose-version"));
    assert!(
        !without.contains("svelte/internal/disclose-version"),
        "disclose_version=false still emitted the import: {without}"
    );
}

/// H-088: the public `name` option overrides the filename-derived component name.
#[test]
fn name_option_overrides_filename() {
    let src = "<script>let x = 0;</script>\n{x}";
    let code = compile(src, opts(Some("MyComp".into()), true))
        .unwrap()
        .js
        .code;
    assert!(
        code.contains("function MyComp("),
        "name option not applied: {code}"
    );
}
