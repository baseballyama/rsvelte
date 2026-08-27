//! A legacy `export let` whose default is an arrow function with the body on the
//! next line must keep the body.
//!
//! The client instance-script loop accumulates source lines until the statement
//! looks complete, and its continuation test read a trailing `=>` as an ending.
//! `export let fmt = (n) =>` then closed the declaration, the body became a
//! separate top-level statement, and the emitted `$.prop(..., (n) =>)` was not
//! parseable JavaScript. The server path already treated `=>` as a continuation,
//! so it is the control here: both targets must keep the body, and asserting only
//! the client would let a fix that regressed the server pass.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const SOURCE: &str =
    "<script>\n  export let fmt = (n) =>\n    `${n} items`;\n</script>\n\n<p>{fmt(1)}</p>\n";

fn compile_to(generate: GenerateMode) -> String {
    compile(
        SOURCE,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

#[test]
fn client_keeps_the_arrow_body() {
    let out = compile_to(GenerateMode::Client);
    assert!(
        out.contains("$.prop($$props, 'fmt', 8, (n) => `${n} items`)"),
        "arrow body was severed from its `=>`:\n{out}"
    );
}

#[test]
fn server_keeps_the_arrow_body() {
    let out = compile_to(GenerateMode::Server);
    assert!(
        out.contains("$.fallback($$props['fmt'], (n) => `${n} items`)"),
        "arrow body was severed from its `=>`:\n{out}"
    );
}

/// A line ending in `=>` inside a string literal is not a continuation. Without
/// this, "treat every trailing `=>` as a continuation" would swallow the next
/// statement, and the two tests above would not notice.
#[test]
fn a_trailing_arrow_inside_a_string_is_not_a_continuation() {
    let source = "<script>\n  export let label = \"a =>\";\n  export let other = 1;\n</script>\n\n<p>{label}{other}</p>\n";
    let out = compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code;
    assert!(
        out.contains("$.prop($$props, 'label', 8, \"a =>\")")
            && out.contains("$.prop($$props, 'other', 8, 1)"),
        "the two declarations were merged:\n{out}"
    );
}

#[test]
fn a_jsdoc_before_a_simple_initializer_survives_prop_lowering() {
    let source = "<script>\n  export let onSave = /** @param {any} value */ async (value) => {};\n</script>\n";
    for dev in [false, true] {
        let out = compile(
            source,
            CompileOptions {
                filename: Some("A.svelte".to_string()),
                generate: GenerateMode::Client,
                dev,
                ..Default::default()
            },
        )
        .expect("compile failed")
        .js
        .code;
        assert!(
            out.contains(
                "$.prop($$props, 'onSave', 8, /** @param {any} value */ async (value) => {})"
            ),
            "the initializer JSDoc was lost:\n{out}"
        );
    }
}
