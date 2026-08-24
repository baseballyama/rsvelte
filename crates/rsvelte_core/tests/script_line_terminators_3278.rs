//! Issue #3278 — CR, U+2028 and U+2029 are ECMAScript line terminators.
//!
//! Two places read "line" as `\n`-delimited text. The client instance-script
//! pipeline splits statements with `str::lines`, so a `$:` alone on a
//! CR / U+2028 / U+2029 separated line reached it glued to its neighbour and
//! lost its `legacy_pre_effect` wrapper. And the printer decided whether a
//! comment and the node after it share a line by looking for `\n`, so a `//`
//! comment terminated by U+2028 was emitted with the following statement
//! appended to it — the declaration became comment text and disappeared from
//! the output.
//!
//! Expectations were measured against the official compiler on the same
//! sources; the LF spelling of each case is the control and was byte-identical
//! throughout.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

fn reactive_source(terminator: &str) -> String {
    format!(
        "<script>{t}let a = 1;{t}$: b = a + 1;{t}</script>{t}<p>{{b}}</p>\n",
        t = terminator
    )
}

fn line_comment_source(terminator: &str) -> String {
    format!("<script>\n// c{terminator}const a = 1;\n</script>\n<p>{{a}}</p>\n")
}

#[test]
fn a_reactive_statement_on_a_cr_or_separator_line_keeps_its_effect() {
    for terminator in ["\r", "\u{2028}", "\u{2029}"] {
        let out = compile_to(&reactive_source(terminator));
        assert!(
            out.contains("$.legacy_pre_effect(() => {}, () => {"),
            "terminator {terminator:?} lost the reactive wrapper:\n{out}"
        );
        assert!(
            !out.contains("$: $.set(b,"),
            "terminator {terminator:?} left a bare `$:` label:\n{out}"
        );
    }
}

#[test]
fn a_line_comment_ends_at_a_separator() {
    for terminator in ["\r", "\u{2028}", "\u{2029}"] {
        let out = compile_to(&line_comment_source(terminator));
        assert!(
            out.contains("// c\n"),
            "terminator {terminator:?} did not end the comment:\n{out}"
        );
        assert!(
            out.contains("const a = 1;"),
            "terminator {terminator:?} swallowed the declaration:\n{out}"
        );
    }
}

/// The control: LF spells the same two shapes and was already correct.
#[test]
fn the_lf_spelling_is_unchanged() {
    let out = compile_to(&reactive_source("\n"));
    assert!(
        out.contains("$.legacy_pre_effect(() => {}, () => {"),
        "{out}"
    );

    let out = compile_to(&line_comment_source("\n"));
    assert!(out.contains("// c\n"), "{out}");
    assert!(out.contains("const a = 1;"), "{out}");
}
