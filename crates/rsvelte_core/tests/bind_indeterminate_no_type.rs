//! Regression test: `bind:indeterminate` on a type-less `<input>` must compile
//! (issue #468, H-036).
//!
//! Bug: rsvelte rejected `bind:indeterminate` with `bind_invalid_target` when the
//! input had no `type` attribute. The official compiler only type-validates
//! `bind:checked` and `bind:files`; `indeterminate` / `group` are never
//! type-checked, so binding them to a type-less input is accepted.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn try_compile(src: &str) -> Result<(), String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .map(|_| ())
    .map_err(|e| format!("{e:?}"))
}

#[test]
fn bind_indeterminate_without_type_compiles() {
    let src = r#"<script>let x = $state(false);</script><input bind:indeterminate={x} />"#;
    assert!(
        try_compile(src).is_ok(),
        "bind:indeterminate on a type-less input should compile"
    );
}

#[test]
fn bind_indeterminate_with_text_type_compiles() {
    let src =
        r#"<script>let x = $state(false);</script><input type="text" bind:indeterminate={x} />"#;
    assert!(try_compile(src).is_ok());
}

#[test]
fn bind_checked_without_type_still_errors() {
    // The genuine type constraint (`checked` requires a checkbox) must remain.
    let src = r#"<script>let x = $state(false);</script><input bind:checked={x} />"#;
    assert!(
        try_compile(src).is_err(),
        "bind:checked on a non-checkbox input should still be rejected"
    );
}
