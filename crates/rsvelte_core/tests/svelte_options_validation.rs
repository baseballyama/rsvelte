//! Regression test: `<svelte:options>` validation + public option enforcement
//! (issue #449).
//!
//! Bug: duplicate `<svelte:options>` was silently accepted (the second one
//! overwrote the first). Upstream errors with `svelte_meta_duplicate`. rsvelte
//! never emitted a SvelteOptions AST node, so the analyzer-side check that
//! upstream relies on (`A component can only have one <svelte:options> element`)
//! never fired. Detect the duplicate at the parser layer where the option store
//! happens.
//!
//! The other findings in the cluster (H-087 disclose_version, H-088 name, H-114
//! runes={false}, H-115 customElement={null}) already work correctly; this test
//! pins their behaviour so regressions surface.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn try_compile(src: &str, opts: CompileOptions) -> Result<String, String> {
    match compile(src, opts) {
        Ok(r) => Ok(r.js.code),
        Err(e) => Err(format!("{e:?}")),
    }
}

fn default_opts() -> CompileOptions {
    CompileOptions {
        filename: Some("T.svelte".to_string()),
        generate: GenerateMode::Client,
        dev: false,
        css: CssMode::External,
        runes: None,
        ..Default::default()
    }
}

#[test]
fn h113_duplicate_svelte_options_errors() {
    let err = try_compile(
        r#"<svelte:options runes/><svelte:options runes={false}/><p>x</p>"#,
        default_opts(),
    )
    .expect_err("should error");
    assert!(
        err.contains("svelte_meta_duplicate"),
        "expected `svelte_meta_duplicate`, got:\n{err}"
    );
}

#[test]
fn h113_single_svelte_options_compiles() {
    try_compile(r#"<svelte:options runes/><p>x</p>"#, default_opts())
        .expect("single options should compile");
}

#[test]
fn h114_runes_false_disables_runes_mode() {
    // Using $state in runes={false} mode must error.
    let err = try_compile(
        r#"<svelte:options runes={false}/><script>let x = $state(1);</script>{x}"#,
        default_opts(),
    )
    .expect_err("should error");
    assert!(
        err.contains("rune_invalid_usage"),
        "expected `rune_invalid_usage`, got:\n{err}"
    );
}

#[test]
fn h115_custom_element_null_does_not_enable_custom_element() {
    let out = try_compile(
        r#"<svelte:options customElement={null}/><p>x</p>"#,
        default_opts(),
    )
    .expect("compile");
    assert!(
        !out.contains("customElements.define"),
        "customElement={{null}} must not enable CE, got:\n{out}"
    );
}

#[test]
fn h088_name_option_overrides_export_name() {
    let out = try_compile(
        "<p>x</p>",
        CompileOptions {
            name: Some("Foo".to_string()),
            ..default_opts()
        },
    )
    .expect("compile");
    assert!(
        out.contains("export default function Foo("),
        "name option should rename the export, got:\n{out}"
    );
}

#[test]
fn h087_disclose_version_false_drops_import() {
    let out = try_compile(
        "<p>x</p>",
        CompileOptions {
            disclose_version: false,
            ..default_opts()
        },
    )
    .expect("compile");
    assert!(
        !out.contains("svelte/internal/disclose-version"),
        "disclose_version=false should drop the import, got:\n{out}"
    );
}

#[test]
fn h087_disclose_version_true_keeps_import() {
    let out = try_compile(
        "<p>x</p>",
        CompileOptions {
            disclose_version: true,
            ..default_opts()
        },
    )
    .expect("compile");
    assert!(
        out.contains("svelte/internal/disclose-version"),
        "disclose_version=true should keep the import, got:\n{out}"
    );
}

#[test]
fn h116_namespace_svg_emits_from_svg() {
    let out = try_compile(
        r#"<svelte:options namespace="svg"/><circle cx="50" cy="50" r="40"/>"#,
        default_opts(),
    )
    .expect("compile");
    assert!(
        out.contains("$.from_svg"),
        "namespace=svg should classify root elements as SVG, got:\n{out}"
    );
}
