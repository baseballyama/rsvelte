//! A comment leading a spread element must be flushed before the `...`, not
//! between the `...` and its operand.
//!
//! Upstream reaches the element through `visit`, whose leading flush happens at
//! the element's own start — before `...` is written. rsvelte wrote `...` first
//! and only flushed when it went on to print the operand, so the comment landed
//! inside the spread:
//!
//! ```text
//! official:  // ; c                rsvelte:  ...// ; c
//!            ...(cond ? [] : [x]),           (cond ? [] : [x]),
//! ```
//!
//! Both outputs parse and compute the same thing, so only output equality
//! reports it. This is the same missing-leading-flush shape as the member
//! property, one node over; unlike that one it diverged on the server too,
//! because both share the one printer.
//!
//! Every expectation is the official compiler's bytes (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn out(source: &str, generate: GenerateMode) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

const ARRAY_SPREAD: &str = "<script>\n\tlet a = [1];\n\tconst b = [\n\t\t// ; c\n\t\t...(a.length ? [] : [2]),\n\t];\n</script>\n<p>{b.length}</p>\n";

const CALL_SPREAD: &str = "<script>\n\tlet a = [1];\n\tconst b = f(\n\t\t// ; c\n\t\t...(a.length ? [] : [2]),\n\t);\n</script>\n<p>{b}</p>\n";

#[test]
fn an_array_spread_keeps_its_comment_outside() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = out(ARRAY_SPREAD, generate);
        assert!(
            !code.contains("...// ; c"),
            "the comment was written after the `...` in {generate:?}:\n{code}"
        );
        assert!(
            code.contains("// ; c"),
            "the comment must survive in {generate:?}:\n{code}"
        );
    }
}

#[test]
fn a_call_argument_spread_keeps_its_comment_outside() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = out(CALL_SPREAD, generate);
        assert!(
            !code.contains("...// ; c"),
            "the comment was written after the `...` in {generate:?}:\n{code}"
        );
        assert!(
            code.contains("// ; c"),
            "the comment must survive in {generate:?}:\n{code}"
        );
    }
}

#[test]
fn an_uncommented_spread_is_unchanged() {
    // CONTROL: nothing pending, so the added flush is a no-op.
    let source = "<script>\n\tlet a = [1];\n\tconst b = [...(a.length ? [] : [2])];\n</script>\n<p>{b.length}</p>\n";
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = out(source, generate);
        // The redundant parens are dropped by both compilers; this is
        // official's text, not an assumed shape.
        assert!(
            code.contains("[...a.length ? [] : [2]]"),
            "an uncommented spread must be unchanged in {generate:?}:\n{code}"
        );
    }
}

#[test]
fn a_comment_after_the_spread_token_stays_there() {
    // CONTROL: written after `...` in the source, it belongs to the operand and
    // must NOT be hoisted out by the new flush.
    let source = "<script>\n\tlet a = [1];\n\tconst b = [.../* c */ (a.length ? [] : [2])];\n</script>\n<p>{b.length}</p>\n";
    let code = out(source, GenerateMode::Client);
    assert!(
        code.contains("/* c */"),
        "the comment must survive:\n{code}"
    );
}
