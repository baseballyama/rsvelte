//! `<select bind:value={get, set}>` must render the getter's *result* on the
//! server, not the get/set sequence (issue #3265).
//!
//! `build_spread_object` — the `<select>` / `<option>` special path — emitted
//! the whole `SequenceExpression` as the select's `value`. A sequence evaluates
//! to its last operand, so `value` was the setter function and no `<option>` was
//! ever selected. Upstream emits `b.call(expression.expressions[0])`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_server(markup: &str) -> String {
    let src = format!("<script>\n\tlet v = $state('a');\n</script>\n{markup}\n");
    compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn select_get_set_pair_calls_the_getter() {
    let out = compile_server(
        "<select bind:value={() => v, (nv) => (v = nv)}>\n\t<option value=\"a\">a</option>\n</select>",
    );
    assert!(
        out.contains("value: (() => v)()"),
        "expected the getter to be called, got: {out}"
    );
    assert!(
        !out.contains("(nv) => v = nv)"),
        "the setter must not reach the rendered value, got: {out}"
    );
}

#[test]
fn multiple_select_get_set_pair_calls_the_getter() {
    let out = compile_server(
        "<select multiple bind:value={() => v, (nv) => (v = nv)}>\n\t<option value=\"a\">a</option>\n</select>",
    );
    assert!(
        out.contains("multiple: true, value: (() => v)()"),
        "expected the getter to be called, got: {out}"
    );
}

/// The control: the plain form is unchanged.
#[test]
fn select_plain_bind_value_is_unchanged() {
    let out =
        compile_server("<select bind:value={v}>\n\t<option value=\"a\">a</option>\n</select>");
    assert!(
        out.contains("value: v"),
        "expected the bound value verbatim, got: {out}"
    );
}
