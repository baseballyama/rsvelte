//! A block comment on the script's FIRST line keeps upstream's dedent.
//!
//! Upstream dedents a multi-line block comment by its opener line's
//! indentation (`onComment`, `1-parse/acorn.js`). The client formatter receives
//! the script slice with that first line's indentation already trimmed, so the
//! dedent measured nothing and the continuation lines carried the source indent
//! on top of the emitted one.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const SRC: &str = include_str!(
    "../../../compatibility/pattern-corpus/issues/leading-block-comment-loses-its-dedent.svelte"
);

fn client(dev: bool) -> String {
    compile(
        SRC,
        CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("Probe.svelte".to_string()),
            css: CssMode::External,
            dev,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

/// The defect: the comment opening on the script's first line.
#[test]
fn a_first_line_block_comment_is_dedented() {
    for dev in [false, true] {
        let out = client(dev);
        assert!(
            out.contains("\n\t * A block comment on the script's FIRST line."),
            "dev={dev}: the leading comment kept the source indent; got:\n{out}"
        );
    }
}

/// The control: a comment further down already had its opener's indentation, so
/// a fix that dedents unconditionally would strip one level too many here.
#[test]
fn a_later_block_comment_is_unchanged() {
    for dev in [false, true] {
        let out = client(dev);
        assert!(
            out.contains("\n\t * The control: an identical comment that is NOT on the first line."),
            "dev={dev}: the control comment moved; got:\n{out}"
        );
    }
}
