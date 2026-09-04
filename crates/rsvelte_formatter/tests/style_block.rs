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
    let opts =
        FormatOptions::default().with_style_formatter(Arc::new(move |_body, _lang, _width| {
            Ok(css_out.to_string())
        }));
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
    let opts = FormatOptions::default().with_style_formatter(Arc::new(
        |body: &str, _lang: &str, _width: usize| Ok(format!("{}\n", body.trim())),
    ));
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

/// Format `src` with a style callback that returns its input unchanged — the
/// shape of the real fallback for a body the CSS engine rejects, and the only
/// double that exercises what `dedent` hands the callback.
fn fmt_verbatim_css(src: &str) -> String {
    let opts = FormatOptions::default().with_style_formatter(Arc::new(
        |body: &str, _lang: &str, _width: usize| Ok(body.to_string()),
    ));
    format(src, &opts).expect("format ok")
}

fn mixed_indent_lines(s: &str) -> Vec<&str> {
    s.lines()
        .filter(|l| {
            let ws = &l[..l.len() - l.trim_start_matches([' ', '\t']).len()];
            ws.contains(' ') && ws.contains('\t')
        })
        .collect()
}

#[test]
fn a_tab_indented_body_never_mixes_tabs_into_the_block_indent() {
    // The block indent is spaces under the default `useTabs: false`, and the
    // body's own levels are tabs. Prepending one to the other left `  \tcolor`.
    let src = "<div></div>\n\n<style>\n\t.a >> .b {\n\t\tcolor: green;\n\t}\n</style>\n";
    let out = fmt_verbatim_css(src);
    assert_eq!(
        mixed_indent_lines(&out),
        Vec::<&str>::new(),
        "tabs survived into a space-indented block:\n{out}"
    );
    // Every level is the configured unit, and the body sits one level under the
    // tag. (The double returns the body verbatim, leading newline included, so
    // the block opens with a blank line — an artefact of the double, not of the
    // indentation under test.)
    assert!(
        out.contains("\n  .a >> .b {\n    color: green;\n  }\n"),
        "body not re-indented with the configured unit:\n{out}"
    );
}

#[test]
fn tab_and_space_indented_bodies_format_identically() {
    // The property, not a transcribed expectation: the indent character a source
    // happens to use is not an input to the formatted result.
    let with = |unit: &str| {
        format!(
            "<div></div>\n\n<style>\n{u}.a >> .b {{\n{u}{u}color: green;\n{u}}}\n</style>\n",
            u = unit
        )
    };
    let tabs = fmt_verbatim_css(&with("\t"));
    let spaces = fmt_verbatim_css(&with("  "));
    assert_eq!(tabs, spaces, "tab-indented source formatted differently");
    // A formatter that emitted nothing would satisfy the equality above.
    assert!(
        tabs.contains("color: green;"),
        "no CSS in the output:\n{tabs}"
    );
}
