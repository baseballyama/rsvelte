//! A warning frame quotes five lines, and it used to find them by splitting the
//! whole source into a `Vec<&str>` — once per warning, so a file with many
//! spanned warnings paid O(source × warnings). It now reads those five lines
//! out of the line index the position conversion already builds.
//!
//! Slicing by byte offset and `split('\n')` agree on ordinary input, so the
//! cases below are the ones where they can drift: a `\r` that belongs to the
//! line rather than to the terminator, multi-byte characters that move byte
//! offsets away from column offsets, the first and last line, an empty line,
//! and the phantom final line a trailing newline produces.

use rsvelte_core::{CompileOptions, GenerateMode, Warning, compile};

fn warnings(src: &str) -> Vec<Warning> {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
}

/// The frame of the first warning, which every case here arranges to exist.
fn frame(src: &str) -> String {
    let ws = warnings(src);
    let w = ws
        .first()
        .unwrap_or_else(|| panic!("no warning for {src:?}"));
    w.frame
        .clone()
        .unwrap_or_else(|| panic!("`{}` has no frame", w.code))
}

/// Warns `a11y_missing_attribute` on the element, so each case below only has
/// to place it where the line lookup is interesting.
const WARN: &str = "<img src=\"a\">";

#[test]
fn a_warning_on_the_only_line_quotes_that_line() {
    assert_eq!(frame(WARN), "1: <img src=\"a\">\n                ^");
}

#[test]
fn a_warning_on_the_last_line_without_a_trailing_newline_quotes_it() {
    let src = format!("<p>a</p>\n<p>b</p>\n{WARN}");
    assert_eq!(
        frame(&src),
        "1: <p>a</p>\n2: <p>b</p>\n3: <img src=\"a\">\n                ^"
    );
}

/// A trailing newline makes `split('\n')` yield a final empty line, and the
/// frame's upper bound is clamped to that count, so the index has to report the
/// same number of lines.
#[test]
fn a_trailing_newline_adds_an_empty_last_line() {
    let src = format!("{WARN}\n<p>a</p>\n");
    assert_eq!(
        frame(&src),
        "1: <img src=\"a\">\n                ^\n2: <p>a</p>\n3: "
    );
}

/// CRLF: `split('\n')` leaves the `\r` on the end of each line, so the slice
/// has to stop at the `\n` and not at the `\r`.
#[test]
fn crlf_leaves_the_carriage_return_on_the_line() {
    let src = format!("<p>a</p>\r\n{WARN}\r\n<p>b</p>");
    assert_eq!(
        frame(&src),
        "1: <p>a</p>\r\n2: <img src=\"a\">\r\n                ^\n3: <p>b</p>"
    );
}

/// Multi-byte characters ahead of the warning move the byte offsets away from
/// the character offsets. The quoted line is still the whole line, and slicing
/// it must land on a character boundary rather than panic.
#[test]
fn multibyte_lines_before_the_warning_do_not_shift_the_slice() {
    let src = format!("<p>日本語のテキスト</p>\n<p>🎉🎉🎉</p>\n{WARN}");
    assert_eq!(
        frame(&src),
        "1: <p>日本語のテキスト</p>\n2: <p>🎉🎉🎉</p>\n3: <img src=\"a\">\n                ^"
    );
}

/// Leading tabs are rendered as two spaces each and the caret shifts to match,
/// so the slice must keep the tabs rather than the line's trimmed text.
#[test]
fn leading_tabs_are_still_expanded_in_the_quoted_line() {
    let src = format!("<p>a</p>\n\t\t{WARN}");
    assert_eq!(
        frame(&src),
        "1: <p>a</p>\n2:     <img src=\"a\">\n                    ^"
    );
}

/// Two lines of context on each side, so the window is neither clamped end.
#[test]
fn a_warning_in_the_middle_quotes_two_lines_on_each_side() {
    let src = format!("<p>a</p>\n<p>b</p>\n<p>c</p>\n{WARN}\n<p>d</p>\n<p>e</p>\n<p>f</p>");
    assert_eq!(
        frame(&src),
        "2: <p>b</p>\n3: <p>c</p>\n4: <img src=\"a\">\n                ^\n5: <p>d</p>\n6: <p>e</p>"
    );
}

/// Empty lines are zero-length slices between adjacent line starts.
#[test]
fn empty_context_lines_are_quoted_as_empty() {
    let src = format!("\n\n{WARN}\n\n");
    assert_eq!(
        frame(&src),
        "1: \n2: \n3: <img src=\"a\">\n                ^\n4: \n5: "
    );
}
