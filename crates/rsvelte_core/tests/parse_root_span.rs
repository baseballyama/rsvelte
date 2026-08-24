//! `Root.start` / `Root.end` from the public AST (#3386).
//!
//! Upstream parses `template.trimEnd()` but sets `this.root.end = template.length`
//! on the untrimmed source (`phases/1-parse/index.js`), so the root span always
//! covers the whole file. rsvelte stopped at the last non-whitespace byte, which
//! is every `.svelte` file that ends with a newline.
//!
//! The upstream parser fixtures cannot see this: their harness does
//! `input.replace(/\s+$/, '')` before parsing, so every checked-in `output.json`
//! records the end of a *trimmed* input and agrees with the truncated value by
//! coincidence.

use rsvelte_core::{ParseOptions, parse};

fn root_span(source: &str) -> (u32, u32) {
    let allocator = oxc_allocator::Allocator::default();
    let ast = parse(
        source,
        &allocator,
        ParseOptions {
            modern: true,
            ..Default::default()
        },
    )
    .expect("source parses");
    (ast.start, ast.end)
}

#[test]
fn root_span_covers_the_whole_source() {
    // Every row of #3386's matrix, plus the three that already agreed — they are
    // the control: with no trailing whitespace the two answers coincide, so a
    // suite of only those rows measures nothing.
    for source in [
        "<b>x</b>",
        "<b>x</b>\n",
        "<b>x</b>\n\n",
        "<b>x</b>  ",
        "<b>x</b>\t\n",
        "<b>x</b>\r\n",
        "\n<b>x</b>",
        "\n<b>x</b>\n",
        "   \n",
        "",
        "hello\n",
        "<script>let a = 1;</script>\n",
        "<style>a{color:red}</style>\n",
        "<b>x</b>\u{a0}",
    ] {
        assert_eq!(
            root_span(source),
            (0, source.len() as u32),
            "root span of {source:?}"
        );
    }
}
