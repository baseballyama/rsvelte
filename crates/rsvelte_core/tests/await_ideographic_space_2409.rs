//! `{#await p　then v}` — a full-width space before `then` is ordinary in
//! CJK-formatted markup, and `U+3000` is JavaScript whitespace. The keyword scan
//! decided word boundaries from a raw byte, so the last byte of `U+3000` read as
//! `U+0080` and `then` was swallowed into the awaited expression.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_server(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn await_component(separator: &str) -> String {
    format!(
        "<script>\nlet p = Promise.resolve(1);\n</script>\n\n{{#await p{separator}then v}}\n  <p>{{v}}</p>\n{{/await}}"
    )
}

/// The awaited expression must survive. It used to be dropped entirely, leaving
/// an empty argument slot — output that does not parse.
#[test]
fn the_awaited_expression_is_not_dropped() {
    let out = compile_server(&await_component("\u{3000}"));

    assert!(
        !out.contains(",\n\t\t,") && !out.contains("$.await($$renderer, ,"),
        "empty argument slot in the emitted call: {out}"
    );
    assert!(
        out.contains("$.await($$renderer, p,"),
        "awaited expression missing: {out}"
    );
}

/// Separate from the argument itself: a fix that restores the expression while
/// leaving the branches in the wrong order must still fail.
#[test]
fn the_pending_and_then_branches_are_not_transposed() {
    let out = compile_server(&await_component("\u{3000}"));

    let then_body = out
        .find("$$renderer.push(`<p>${$.escape(v)}</p>`)")
        .expect("then body missing");
    let empty_pending = out.find("() => {}").expect("pending branch missing");

    assert!(
        empty_pending < then_body,
        "pending and then arguments are transposed: {out}"
    );
}

/// Isolates the defect to the decode: the ASCII separator must be unaffected,
/// and both forms must agree once the full-width space is read as whitespace.
#[test]
fn a_full_width_space_compiles_like_an_ascii_space() {
    let ascii = compile_server(&await_component(" "));
    let full_width = compile_server(&await_component("\u{3000}"));

    assert!(
        ascii.contains("$.await($$renderer, p, () => {}, (v) => {"),
        "ascii control changed shape: {ascii}"
    );
    assert_eq!(
        ascii, full_width,
        "full-width separator diverges from ascii"
    );
}
