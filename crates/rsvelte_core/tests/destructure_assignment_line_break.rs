//! A destructuring assignment written without a terminating semicolon must end
//! at the line break, not run on into the statements that follow it.
//!
//! The client lowers `[a] = rhs` into an IIFE, and located the end of `rhs` by
//! scanning for `;`, `,` or an unbalanced closer. Semicolon-free source has none
//! of those after the RHS, so the scan swallowed every following statement and
//! the emitted `(($$value) => {…})(rhs` was never closed — output no JS parser
//! accepts. The server path lowers the same assignment without this scan and was
//! already correct, so it is the control: a fix that regressed it cannot pass.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
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

/// A compiler may emit output we would call wrong; it may never emit output that
/// is not JavaScript.
fn assert_parses(code: &str) {
    let allocator = Allocator::default();
    let ret = Parser::new(&allocator, code, SourceType::mjs()).parse();
    assert!(
        !ret.panicked && ret.diagnostics.is_empty(),
        "generated module is not parseable JavaScript: {:?}\n{code}",
        ret.diagnostics
    );
}

const SEMICOLON_FREE: &str = "<script>\n  export let selected\n\n  function pick (result) {\n    ;[selected] = result\n    done = true\n  }\n\n  let done = false\n</script>\n\n<button onclick={() => pick([1])}>{selected}{done}</button>\n";

#[test]
fn client_ends_the_destructure_rhs_at_the_line_break() {
    let out = compile_to(SEMICOLON_FREE, GenerateMode::Client);
    assert_parses(&out);
    assert!(
        out.contains("})(result)"),
        "the RHS did not end at the line break:\n{out}"
    );
    assert!(
        !out.contains("done = true)"),
        "the following statement was swallowed into the IIFE call:\n{out}"
    );
    // The same line break also makes this an expression *statement*, so the IIFE
    // has no value to hand back. Both halves are needed for the output to equal
    // the official compiler's, not merely to parse.
    assert!(
        !out.contains("return result;"),
        "a statement-position destructure returned its value:\n{out}"
    );
}

/// Control for the second half: a destructure whose value *is* used must still
/// return it. A fix that called every destructure standalone would break this,
/// while still passing every assertion above.
#[test]
fn a_destructure_whose_value_is_used_still_returns_it() {
    let source = "<script>\n  export let selected\n  let out = null\n\n  function pick (result) {\n    out = ([selected] = result)\n  }\n</script>\n\n<button onclick={() => pick([1])}>{selected}{out}</button>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert_parses(&out);
    assert!(
        out.contains("return result;"),
        "the IIFE dropped the value the assignment is used for:\n{out}"
    );
}

/// The control that was already right. Asserting only the client would let a fix
/// that broke the server's lowering through.
#[test]
fn server_lowers_the_same_assignment_unchanged() {
    let out = compile_to(SEMICOLON_FREE, GenerateMode::Server);
    assert_parses(&out);
    assert!(
        out.contains("[selected] = result;"),
        "server lowering changed:\n{out}"
    );
}

/// Control for the obvious wrong fix — "end the RHS at the first newline". The
/// line break here is inside the call's parentheses, so it continues the RHS.
#[test]
fn a_line_break_inside_the_rhs_is_not_the_end_of_it() {
    let source = "<script>\n  let rows = []\n\n  function load (result) {\n    ;[rows] = result.map(\n      (r) => r\n    )\n    done = true\n  }\n\n  let done = false\n</script>\n\n<button onclick={() => load([1])}>{rows.length}{done}</button>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert_parses(&out);
    assert!(
        out.contains("(r) => r"),
        "the multi-line RHS was truncated:\n{out}"
    );
    assert!(
        !out.contains("done = true)"),
        "the following statement was swallowed into the IIFE call:\n{out}"
    );
}

/// Second control for the same wrong fix: a method chain continued on the next
/// line. ASI does not end the statement before a leading `.`, so neither may the
/// RHS scan — cutting here would silently drop `.filter(Boolean)` from the value
/// while still emitting parseable JavaScript.
#[test]
fn a_leading_dot_on_the_next_line_continues_the_rhs() {
    let source = "<script>\n  let rows = []\n\n  function load (result) {\n    ;[rows] = result\n      .filter(Boolean)\n    done = true\n  }\n\n  let done = false\n</script>\n\n<button onclick={() => load([1])}>{rows.length}{done}</button>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert_parses(&out);
    assert!(
        out.contains(".filter(Boolean))"),
        "the chained call was cut off the RHS:\n{out}"
    );
    assert!(
        !out.contains("done = true)"),
        "the following statement was swallowed into the IIFE call:\n{out}"
    );
}
