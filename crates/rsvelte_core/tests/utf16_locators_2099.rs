//! Regression tests for issue #2099 — every dev-mode instrumentation site that
//! reports a source location must count columns in UTF-16 code units, because
//! official derives them from `locate-character`, which indexes the source as a
//! JS string. A surrogate-pair character (emoji) therefore advances the column
//! by 2, not 1.
//!
//! Each case compiles the same component twice: once with an astral character
//! (`🎉`) and once with a BMP character (`あ`) of identical code-point length.
//! The astral column must be exactly one greater — code-point counting would
//! make the two equal.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_dev(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Probe.svelte".to_string()),
            generate,
            dev: true,
            ..Default::default()
        },
    )
    .expect("component should compile")
    .js
    .code
}

/// Compile both spellings of `template` (with `{CH}` replaced by an astral and a
/// BMP character) and return the two outputs.
fn compile_pair(template: &str, generate: GenerateMode) -> (String, String) {
    (
        compile_dev(&template.replace("{CH}", "🎉"), generate),
        compile_dev(&template.replace("{CH}", "あ"), generate),
    )
}

#[track_caller]
fn assert_contains(code: &str, needle: &str) {
    assert!(code.contains(needle), "expected {needle:?} in:\n{code}");
}

/// `$.add_locations` — `client/transform_template/index.rs`.
#[test]
fn add_locations_columns_are_utf16_code_units() {
    let (astral, bmp) = compile_pair("<p>{CH}</p><b>x</b>", GenerateMode::Client);
    assert_contains(&astral, "[[1, 0], [1, 9]]");
    assert_contains(&bmp, "[[1, 0], [1, 8]]");
}

/// `$.push_element` — `server/ast/visitors/element.rs`.
#[test]
fn push_element_columns_are_utf16_code_units() {
    let (astral, bmp) = compile_pair("<p>{CH}</p><b>x</b>", GenerateMode::Server);
    assert_contains(&astral, "$.push_element($$renderer, 'b', 1, 9)");
    assert_contains(&bmp, "$.push_element($$renderer, 'b', 1, 8)");
}

/// `$.apply` — the event-handler location built in `client/visitors/attribute.rs`.
#[test]
fn apply_event_handler_columns_are_utf16_code_units() {
    let template = concat!(
        "<script>let { handler } = $props();</script>\n",
        "<p>{CH}</p><button onclick={handler}>x</button>"
    );
    let (astral, bmp) = compile_pair(template, GenerateMode::Client);
    assert_contains(
        &astral,
        "$.apply(() => $$props.handler, this, $$args, Probe, [2, 26])",
    );
    assert_contains(
        &bmp,
        "$.apply(() => $$props.handler, this, $$args, Probe, [2, 25])",
    );
}

/// `$.add_svelte_meta` — block locations, also via `client/visitors/attribute.rs`.
#[test]
fn add_svelte_meta_columns_are_utf16_code_units() {
    let (astral, bmp) = compile_pair("<p>{CH}</p>{#if x}<i>a</i>{/if}", GenerateMode::Client);
    assert_contains(&astral, "'if',\n\t\t\tProbe,\n\t\t\t1,\n\t\t\t9\n");
    assert_contains(&bmp, "'if',\n\t\t\tProbe,\n\t\t\t1,\n\t\t\t8\n");
}

/// `$$ownership_validator.mutation` — `client/visitors/bind_directive.rs`.
#[test]
fn ownership_mutation_columns_are_utf16_code_units() {
    let template = concat!(
        "<script>let { obj } = $props();</script>",
        "<p>{CH}</p><input bind:value={obj.foo} />"
    );
    let (astral, bmp) = compile_pair(template, GenerateMode::Client);
    assert_contains(
        &astral,
        "$$ownership_validator.mutation('obj', ['obj', 'foo'], obj().foo = $$value, 1, 68)",
    );
    assert_contains(
        &bmp,
        "$$ownership_validator.mutation('obj', ['obj', 'foo'], obj().foo = $$value, 1, 67)",
    );
}
