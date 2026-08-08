//! A regex literal in a legacy instance script must survive the text passes.
//!
//! Those passes scan the script with hand-written tokenizers that knew strings,
//! templates and comments but not regex literals. In `/^https?:\/\//` the slash
//! closing the second escape and the slash closing the regex sit next to each
//! other, so each scanner read `//` as a line comment and stopped seeing code
//! from there to the end of the line.
//!
//! The server target does not run these passes and was already correct, so it is
//! the control: a fix that made the client whole by disturbing the shared
//! `skip_opaque` scanner would show up there.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(source: &str, generate: GenerateMode) -> String {
    compile(
        source,
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

/// The comment stripper for `$:` statements deleted the rest of the line, so the
/// emitted regex was unterminated and the module was not parseable JavaScript.
const TRUNCATED: &str = "<script>\n  export let src;\n  $: isUrl = typeof src === 'string' && /^(https?:)?\\/\\//i.test(src);\n</script>\n\n<p>{isUrl}</p>\n";

#[test]
fn client_keeps_the_whole_regex() {
    let out = compile_to(TRUNCATED, GenerateMode::Client);
    assert!(
        out.contains("/^(https?:)?\\/\\//i"),
        "the regex was truncated at its escaped slashes:\n{out}"
    );
}

#[test]
fn server_keeps_the_whole_regex() {
    let out = compile_to(TRUNCATED, GenerateMode::Server);
    assert!(
        out.contains("/^(https?:)?\\/\\//i"),
        "the regex was truncated at its escaped slashes:\n{out}"
    );
}

/// The prop-read rewriter copied everything after the regex verbatim, so `src`
/// was emitted uncalled — output that parses and is silently wrong at runtime.
#[test]
fn a_prop_read_after_a_regex_is_still_called() {
    let out = compile_to(TRUNCATED, GenerateMode::Client);
    assert!(
        out.contains(".test(src())"),
        "the prop read after the regex was left uncalled:\n{out}"
    );
}

/// The statement accumulator asks `find_line_comment_position` where the code on
/// a line ends before testing it for a trailing operator. With the regex read as
/// a comment the line no longer ended in `||`, so the statement was closed early
/// and `$.set(label, … ||)` was emitted.
#[test]
fn a_trailing_operator_after_a_regex_still_continues_the_statement() {
    let source = "<script>\n  export let a;\n  export let b;\n  $: label =\n    a?.replace(/^https?:\\/\\//, '') ||\n    b;\n</script>\n\n<p>{label}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert!(
        out.contains("|| b())"),
        "the statement was closed after the trailing `||`:\n{out}"
    );
}

/// A `/` that divides must stay a division: reading every `/` as a regex opener
/// would swallow the `//` that follows, and the tests above would not notice.
#[test]
fn a_division_does_not_hide_the_comment_after_it() {
    let source = "<script>\n  export let total;\n  $: half = total / 2; // halve it\n</script>\n\n<p>{half}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert!(
        out.contains("total() / 2") && !out.contains("halve it"),
        "the division was read as a regex, so its trailing comment survived:\n{out}"
    );
}
