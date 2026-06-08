//! A `<script>` body is formatted at indent 0 then re-indented one level under
//! `<script>`. The re-indent scanner tracks string / comment / template context
//! so it doesn't misread a quote or `${` that sits inside one. Regex literals
//! aren't lexed, so quotes inside a regex (`/["']x/`) used to desync the string
//! tracker: the spuriously-open string swallowed every following newline and
//! the rest of the body collapsed to column 0. The scanner now recovers at the
//! newline (a real string never spans a line), so the body stays indented.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

#[test]
fn script_body_stays_indented_after_regex_with_quotes() {
    let src = concat!(
        "<script>\n",
        "  function check(s) {\n",
        "    return /[\"']a/.test(s) && /b['\"]/.test(s);\n",
        "  }\n",
        "  const after = check;\n",
        "</script>\n",
        "<p>{after}</p>\n",
    );
    let out = fmt(src);
    // The statements after the regex line keep their indent (regression: they
    // collapsed to column 0).
    assert!(
        out.contains("\n  }\n  const after = check;\n"),
        "script body de-indented after a quote-containing regex:\n{out}"
    );
    // Nothing in the body sits at column 0 (every line is nested one level).
    for line in out.lines() {
        if line.starts_with("const ")
            || line.starts_with("function ")
            || line.starts_with("return ")
        {
            panic!("script statement reached column 0:\n{out}");
        }
    }
}

#[test]
fn script_regex_reindent_is_idempotent() {
    let src = concat!(
        "<script>\n",
        "  const re = /['\"]quote['\"]/;\n",
        "  const tail = re;\n",
        "</script>\n",
        "<p>{tail}</p>\n",
    );
    let once = fmt(src);
    let twice = fmt(&once);
    assert_eq!(
        once, twice,
        "regex script re-indent not idempotent:\n{once}"
    );
}
