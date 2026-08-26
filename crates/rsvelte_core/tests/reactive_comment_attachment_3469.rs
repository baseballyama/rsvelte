//! Issue #3469 — a line comment between a surviving declaration and the last
//! legacy `$:` statement follows esrap's comment cursor, not source ownership.
//!
//! LF and CRLF let the declaration flush the comment as trailing trivia. With a
//! lone CR or U+2028/U+2029, upstream leaves it pending; the synthesized,
//! location-less `legacy_pre_effect` then kills the cursor and the client drops
//! it. The server's hoisted reactive declarator is located, so it flushes the
//! comment for every spelling.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(source: &str, generate: GenerateMode) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

fn source(terminator: &str) -> String {
    format!(
        "<script>\nlet a = 1; // c{t}$: b = a + 1;\n</script>\n<p>{{b}}</p>\n",
        t = terminator
    )
}

#[test]
fn client_drops_the_comment_for_the_three_exotic_line_endings() {
    for terminator in ["\r", "\u{2028}", "\u{2029}"] {
        let output = compile_to(&source(terminator), GenerateMode::Client);
        assert!(
            !output.contains("// c"),
            "terminator {terminator:?} must follow upstream's dead cursor:\n{output}"
        );
        assert!(
            output.contains("$.set(b, a + 1);"),
            "the comment fix must not lose the reactive effect:\n{output}"
        );
    }
}

#[test]
fn client_keeps_the_lf_and_crlf_controls() {
    for terminator in ["\n", "\r\n"] {
        let output = compile_to(&source(terminator), GenerateMode::Client);
        assert!(
            output.contains("// c"),
            "terminator {terminator:?} must keep the declaration's trailing comment:\n{output}"
        );
    }
}

#[test]
fn server_flushes_the_comment_at_the_hoisted_declarator_for_every_terminator() {
    for terminator in ["\n", "\r\n", "\r", "\u{2028}", "\u{2029}"] {
        let output = compile_to(&source(terminator), GenerateMode::Server);
        assert!(
            output.contains("let // c\n\tb;"),
            "terminator {terminator:?} must flush at the located hoist:\n{output}"
        );
        assert_eq!(
            output.matches("// c").count(),
            1,
            "terminator {terminator:?} must print the comment once:\n{output}"
        );
    }
}
