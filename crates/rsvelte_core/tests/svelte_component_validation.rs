//! Regression test: `<svelte:component>` analyzer must mirror the shared
//! component-attribute validation (issue #453, H-046 / H-047).
//!
//! Bug: the parser left `component.expression` as a JSON-null expression when
//! the `this` attribute was missing, and the analyzer's attribute match had a
//! catch-all `_ => {}` that silently accepted every directive type. As a result
//! `<svelte:component foo="bar"/>` and `<svelte:component this={X} animate:foo/>`
//! both compiled successfully while upstream errors with
//! `svelte_component_missing_this` and `component_invalid_directive`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn try_compile(src: &str) -> Result<(), String> {
    match compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    ) {
        Ok(_) => Ok(()),
        Err(e) => {
            let s = format!("{e:?}");
            let code = s
                .split("code: \"")
                .nth(1)
                .and_then(|t| t.split('"').next())
                .unwrap_or("")
                .to_string();
            Err(code)
        }
    }
}

#[test]
fn h046_missing_this_errors() {
    let err = try_compile(r#"<svelte:component foo="bar"/>"#).expect_err("should error");
    assert_eq!(err, "svelte_component_missing_this", "got `{err}`");
}

#[test]
fn h046_valid_this_compiles() {
    try_compile(r#"<script>let X;</script><svelte:component this={X}/>"#).expect("should compile");
}

#[test]
fn h047_animate_directive_errors() {
    let err = try_compile(r#"<script>let X;</script><svelte:component this={X} animate:foo/>"#)
        .expect_err("should error");
    assert_eq!(err, "component_invalid_directive", "got `{err}`");
}

#[test]
fn h047_transition_directive_errors() {
    let err = try_compile(r#"<script>let X;</script><svelte:component this={X} transition:fade/>"#)
        .expect_err("should error");
    assert_eq!(err, "component_invalid_directive", "got `{err}`");
}

#[test]
fn h047_use_directive_errors() {
    let err = try_compile(
        r#"<script>let X; function f(){return v=>{}}</script><svelte:component this={X} use:f/>"#,
    )
    .expect_err("should error");
    assert_eq!(err, "component_invalid_directive", "got `{err}`");
}

#[test]
fn h047_bind_directive_still_works() {
    try_compile(
        r#"<script>let X; let v = $state("");</script><svelte:component this={X} bind:value={v}/>"#,
    )
    .expect("bind on svelte:component should compile");
}

#[test]
fn h053_special_element_event_capture_excludes_pointercapture() {
    // Pinned: the special-element event-attribute path uses the shared
    // `is_capture_event` helper which excludes `gotpointercapture` /
    // `lostpointercapture`, so those names are treated as regular event names.
    // The compile must not error / strip the `capture` suffix.
    let out = compile(
        r#"<svelte:window ongotpointercapture={() => {}} onlostpointercapture={() => {}}/>"#,
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
    .code;
    assert!(
        out.contains("gotpointercapture") && out.contains("lostpointercapture"),
        "got:\n{out}"
    );
}
