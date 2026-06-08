//! `<style>` body re-embedding. The style callback (in production, `oxfmt`)
//! formats the CSS as a standalone file: base indent 0, no surrounding
//! newlines. Inside `<style>…</style>` that body must be re-indented one
//! level under the tag and sit on its own lines — never glued to the open
//! tag as `<style>.foo {`.

use std::sync::Arc;

use rsvelte_formatter::{FormatOptions, format};

/// Format `src` with a fake style callback that always returns `css_out`,
/// mimicking `oxfmt`'s canonical base-0 output so the test exercises only the
/// re-embedding (indentation + surrounding newlines), not a real CSS engine.
fn fmt_with_css(src: &str, css_out: &'static str) -> String {
    let opts = FormatOptions::default()
        .with_style_formatter(Arc::new(move |_body, _lang| Ok(css_out.to_string())));
    format(src, &opts).expect("format ok")
}

#[test]
fn reindents_style_body_one_level_under_tag() {
    let src = "<div>x</div>\n\n<style>\n.a{color:red}\n</style>\n";
    let css = ".a {\n  color: red;\n}\n";
    let out = fmt_with_css(src, css);
    let want = "<div>x</div>\n\n<style>\n  .a {\n    color: red;\n  }\n</style>\n";
    assert_eq!(out, want, "style body not re-indented under the tag");
}

#[test]
fn style_body_not_glued_to_open_tag() {
    let src = "<style>\n.a{color:red}\n</style>\n";
    let css = ".a {\n  color: red;\n}\n";
    let out = fmt_with_css(src, css);
    assert!(
        !out.contains("<style>.a"),
        "style body glued to open tag:\n{out}"
    );
    assert!(
        out.contains("<style>\n  .a {\n    color: red;\n  }\n</style>"),
        "style body not placed on its own indented lines:\n{out}"
    );
}

#[test]
fn style_reindent_is_idempotent() {
    let src = "<style>\n.a{color:red}\n</style>\n";
    let css = ".a {\n  color: red;\n}\n";
    let once = fmt_with_css(src, css);
    let twice = fmt_with_css(&once, css);
    assert_eq!(once, twice, "style re-indent is not idempotent:\n{once}");
}

#[test]
fn empty_style_body_untouched() {
    let src = "<style>\n</style>\n";
    let css = "SHOULD_NOT_BE_USED";
    // Whitespace-only body short-circuits before the callback runs.
    let out = fmt_with_css(src, css);
    assert!(
        !out.contains("SHOULD_NOT_BE_USED"),
        "empty body was formatted:\n{out}"
    );
}

/// Format `src` with a callback that trims and echoes the body — modelling
/// oxfmt's normalization of already-canonical CSS: base indent 0, a single
/// trailing newline, and no surrounding blank lines. This exercises the
/// dedent-before / reindent-after round-trip directly.
fn fmt_passthrough(src: &str) -> String {
    let opts =
        FormatOptions::default().with_style_formatter(Arc::new(|body: &str, _lang: &str| {
            Ok(format!("{}\n", body.trim()))
        }));
    format(src, &opts).expect("format ok")
}

#[test]
fn reindent_round_trip_is_idempotent() {
    // The body is dedented before formatting and re-indented after; a second
    // pass must not accumulate another indent level.
    let src = "<style>\n  .a {\n    color: red;\n  }\n</style>\n";
    let once = fmt_passthrough(src);
    let twice = fmt_passthrough(&once);
    assert_eq!(once, twice, "reindent round-trip not idempotent:\n{once}");
}

#[test]
fn multiline_comment_interior_does_not_accumulate_indent() {
    // oxfmt keeps the interior of a multi-line block comment verbatim. Without
    // dedenting first, each pass would push the continuation line right by one
    // more level. Dedent-before makes the formatter input stable across runs.
    let src = "<style>\n  /* line one\n     line two */\n  .x {\n    color: red;\n  }\n</style>\n";
    let once = fmt_passthrough(src);
    let twice = fmt_passthrough(&once);
    assert_eq!(
        once, twice,
        "multi-line comment indentation accumulates across passes:\n{once}"
    );
}
