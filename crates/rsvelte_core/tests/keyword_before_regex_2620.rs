//! A regex literal that follows a keyword must not be scanned as a division.
//!
//! The text passes in the client instance-script pipeline decide whether a `/`
//! opens a regex from the byte before it, and an identifier-looking byte reads
//! as "an operand ended here". The `n` of `return` is identifier-looking, so
//! `return /re/` was read as a division and the regex body was left exposed as
//! code — including the `//` inside a character class, which then read as a line
//! comment and ended the line.
//!
//! The server target does not run these passes, so it is the control.

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

/// `/[//]/` is a legal regex — a character class holding two slashes. Read as a
/// division, its `//` is the start of a line comment.
const SLASH_IN_CLASS: &str = "<script>\n  export let v;\n  let k;\n  $: k = typeof /[//]/.exec(String(v));\n</script>\n\n<p>{k}</p>\n";

#[test]
fn client_keeps_a_regex_after_typeof() {
    let out = compile_to(SLASH_IN_CLASS, GenerateMode::Client);
    assert!(
        out.contains("typeof (/[//]/).exec(String(v()))"),
        "the regex after `typeof` was read as a division:\n{out}"
    );
}

#[test]
fn server_keeps_a_regex_after_typeof() {
    let out = compile_to(SLASH_IN_CLASS, GenerateMode::Server);
    assert!(
        out.contains("typeof (/[//]/).exec(String(v))"),
        "the regex after `typeof` was read as a division:\n{out}"
    );
}

/// The delimiters the surrounding scans hunt for, inside a regex after `return`.
#[test]
fn client_keeps_a_regex_after_return() {
    let source = "<script>\n  export let v;\n  let k;\n  $: k = (() => { return /[;{})(]/.test(String(v)); })();\n</script>\n\n<p>{k}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert!(
        out.contains("(/[;{})(]/).test(String(v()))"),
        "the regex after `return` was read as a division:\n{out}"
    );
}

/// The counterpart polarity: a `/` that divides must stay a division, or the
/// scan swallows the rest of the line as a regex body.
#[test]
fn a_division_chain_is_still_two_divisions() {
    let source =
        "<script>\n  export let v;\n  let k;\n  $: k = v / 2 / 4;\n</script>\n\n<p>{k}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert!(
        out.contains("v() / 2 / 4"),
        "the division chain was read as a regex:\n{out}"
    );
}

/// `n++ /` is a postfix update followed by a division; the byte before the slash
/// is `+`, which the byte test reads as "an operator, so a regex follows".
#[test]
fn a_postfix_update_before_a_slash_is_still_a_division() {
    let source = "<script>\n  export let v;\n  let k;\n  $: k = (() => { let n = Number(v); return n++ / 2 / 4; })();\n</script>\n\n<p>{k}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert!(
        out.contains("n++ / 2 / 4"),
        "the postfix update's division was read as a regex:\n{out}"
    );
}

/// An identifier whose tail spells a keyword is not that keyword.
#[test]
fn an_identifier_ending_in_a_keyword_still_divides() {
    let source = "<script>\n  export let v;\n  let k;\n  $: k = (() => { const preturn = Number(v); return preturn / 2 / 4; })();\n</script>\n\n<p>{k}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert!(
        out.contains("preturn / 2 / 4"),
        "an identifier ending in `return` opened a regex:\n{out}"
    );
}
