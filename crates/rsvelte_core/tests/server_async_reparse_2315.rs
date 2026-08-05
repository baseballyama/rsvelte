//! Issue #2315: statement shapes that the text-based async-body split used to
//! emit as unparseable thunks. The reparse rejection silently degraded to an
//! un-split instance body; now it is a hard compile error, and none of these
//! shapes reject any more.

use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

fn ssr_async(tail: &str) -> String {
    let src =
        format!("<script>\nlet a = await fetch('x');\nlet n = 0;\n{tail}\n</script>\n{{a}}{{n}}");
    compile(
        &src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            dev: false,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// The generated thunk array must itself be valid JS — assert the shape survived
/// into the run array rather than falling back to an un-split body.
fn assert_split(tail: &str, needle: &str) {
    let out = ssr_async(tail);
    assert!(!out.contains("COMPILE_ERROR"), "{tail}\n{out}");
    assert!(out.contains("$$renderer.run("), "not split:\n{out}");
    assert!(out.contains(needle), "missing `{needle}`:\n{out}");
}

#[test]
fn do_while_keeps_its_while_clause() {
    assert_split("do { n++; } while (n < 3);", "while (n < 3)");
}

#[test]
fn labeled_statement_is_thunked_as_a_block() {
    assert_split("outer: for (const q of [1]) { n += q; }", "outer:");
}

#[test]
fn debugger_statement_is_thunked_as_a_block() {
    assert_split("debugger;", "debugger");
}

#[test]
fn bare_block_is_thunked_as_a_block() {
    assert_split("{ n = 1; }", "n = 1");
}

#[test]
fn braceless_if_else_stays_one_statement() {
    assert_split("if (a) n = 1; else n = 2;", "else n = 2");
}
