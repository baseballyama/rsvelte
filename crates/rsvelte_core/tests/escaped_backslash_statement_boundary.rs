//! A `\\` escape inside a string literal must not leave the client instance-script
//! line accumulator "inside a string".
//!
//! `update_expression_depths` decided a quote was escaped with
//! `bytes[i - 1] != b'\\'`, which is a different question from "is this quote
//! escaped": in `'\\'` the closing quote follows a COMPLETE `\\` escape. The
//! scanner therefore never closed the string, `is_expression_incomplete` stayed
//! true, and every following line was accumulated into the same statement — so
//! the next `export` declaration was never rewritten and the component body
//! contained a bare `export const`, which is not parseable JavaScript.
//!
//! The server path does not share this accumulator and was already correct, so it
//! is the control: a fix that regressed it could not pass. The escaped-quote case
//! is the second control — "ignore escapes entirely" fixes `'\\'` and breaks
//! `'\''` in exactly the same way.

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

/// `export` is only legal at the top level of a module; the component body is a
/// function, so this substring appearing at all means the output cannot parse.
fn assert_no_export_in_body(out: &str) {
    let body = out
        .split_once("export default function")
        .expect("no component function in output")
        .1;
    assert!(
        !body.contains("export "),
        "an `export` survived into the component body:\n{out}"
    );
}

const ESCAPED_BACKSLASH: &str =
    "<script>\n\tconst a = '\\\\';\n\texport const f = () => {};\n</script>\n\n<p>{a}</p>\n";

#[test]
fn escaped_backslash_does_not_swallow_the_next_export() {
    assert_no_export_in_body(&compile_to(ESCAPED_BACKSLASH, GenerateMode::Client));
}

#[test]
fn escaped_backslash_does_not_swallow_the_next_export_let() {
    let source = "<script>\n\tconst a = '\\\\';\n\texport let b = 1;\n</script>\n\n<p>{a}{b}</p>\n";
    assert_no_export_in_body(&compile_to(source, GenerateMode::Client));
}

/// The control that was already correct: a fix that reworked the shared scanner
/// and regressed SSR could not pass.
#[test]
fn the_server_path_is_unaffected() {
    let out = compile_to(ESCAPED_BACKSLASH, GenerateMode::Server);
    assert!(
        !out.contains("export const f"),
        "SSR emitted a raw export:\n{out}"
    );
}

/// The control that a wrong-but-plausible fix breaks: dropping the escape check
/// altogether makes `'\\'` work and `'\''` fail the same way it used to.
#[test]
fn an_escaped_quote_still_closes_its_string() {
    let source =
        "<script>\n\tconst a = '\\'';\n\texport const f = () => {};\n</script>\n\n<p>{a}</p>\n";
    assert_no_export_in_body(&compile_to(source, GenerateMode::Client));
}

/// The same lookback guards `${` inside a template literal, and had the same
/// defect: after a complete `\\` escape the `${` is a REAL interpolation, and
/// reading it as escaped leaves the scanner "inside a template literal" for the
/// interpolation's contents. A quote there then toggles the wrong string state.
///
/// The contrivance is load-bearing. `` `x\\${b}` `` does not discriminate: under
/// either model the line ends balanced, so it would pass before the fix and read
/// as coverage it does not have.
#[test]
fn a_real_interpolation_after_an_escaped_backslash_is_still_an_interpolation() {
    let source = "<script>\n\tconst a = `x\\\\${ \"a`b\" }`;\n\texport const f = () => {};\n</script>\n\n<p>{a}</p>\n";
    assert_no_export_in_body(&compile_to(source, GenerateMode::Client));
}

/// …while an escaped `\${` is still NOT an interpolation. This one passes before
/// the fix too — it is the control against the "ignore escapes entirely" fix,
/// not a witness for the bug.
#[test]
fn an_escaped_dollar_brace_is_not_an_interpolation() {
    let source =
        "<script>\n\tconst a = `x\\${b}`;\n\texport const f = () => {};\n</script>\n\n<p>{a}</p>\n";
    assert_no_export_in_body(&compile_to(source, GenerateMode::Client));
}
