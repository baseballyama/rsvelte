//! Regression tests for `$props()` written with non-standard whitespace
//! (correctness review C-008).
//!
//! Bug: the AST-level `$props()` detector accepts any spacing, but the
//! text-level lowering only matched the exact bytes `= $props()` /
//! `$props()`. A spaced `$props ()` call was therefore detected but never
//! lowered, so the raw `$props ()` survived into the generated client/SSR
//! output as a reference to the undefined global `$props`.
//!
//! Fix: `canonicalize_props_call` normalises `= $props ()` → `= $props()`
//! before the text matchers run, in both the client and server transforms.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn compile_code(src: &str, mode: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: mode,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile must not panic")
    .js
    .code
}

/// The spaced form must produce exactly the same output as the no-space form.
fn assert_spacing_equivalent(no_space: &str, spaced: &str, mode: GenerateMode) {
    let expected = compile_code(no_space, mode);
    let actual = compile_code(spaced, mode);
    assert_eq!(
        actual, expected,
        "spaced `$props ()` should compile identically to `$props()` ({mode:?})\n\
         --- spaced ---\n{actual}\n--- no-space ---\n{expected}"
    );
    // The raw rune name must never survive into output.
    assert!(
        !actual.contains("$props ("),
        "raw `$props (` leaked into output ({mode:?}):\n{actual}"
    );
    assert!(
        !actual.contains("= $props()") && !actual.contains("$props()"),
        "raw `$props()` call should be lowered away ({mode:?}):\n{actual}"
    );
}

const DESTRUCTURE_NO_SPACE: &str = r#"<script>
    let { x } = $props();
</script>
<p>{x}</p>"#;

const DESTRUCTURE_SPACED: &str = r#"<script>
    let { x } = $props ();
</script>
<p>{x}</p>"#;

const IDENTIFIER_NO_SPACE: &str = r#"<script>
    let props = $props();
</script>
<p>{props.x}</p>"#;

const IDENTIFIER_SPACED: &str = r#"<script>
    let props = $props ();
</script>
<p>{props.x}</p>"#;

#[test]
fn destructure_props_extra_space_client() {
    assert_spacing_equivalent(
        DESTRUCTURE_NO_SPACE,
        DESTRUCTURE_SPACED,
        GenerateMode::Client,
    );
}

#[test]
fn destructure_props_extra_space_server() {
    assert_spacing_equivalent(
        DESTRUCTURE_NO_SPACE,
        DESTRUCTURE_SPACED,
        GenerateMode::Server,
    );
}

#[test]
fn identifier_props_extra_space_client() {
    assert_spacing_equivalent(IDENTIFIER_NO_SPACE, IDENTIFIER_SPACED, GenerateMode::Client);
}

#[test]
fn identifier_props_extra_space_server() {
    assert_spacing_equivalent(IDENTIFIER_NO_SPACE, IDENTIFIER_SPACED, GenerateMode::Server);
}
