//! Issue #3509 — a `<textarea>` whose closing tag never arrives.
//!
//! `<textarea>` is escapable raw text, so upstream reads its body with
//! `read_sequence` (`1-parse/state/element.js:401-411`), and `read_sequence`
//! raises `unexpected_eof` at the **trimmed** end of the template when its
//! `done()` predicate never matches. rsvelte's `parse_raw_text_content` instead
//! returned whatever it had consumed, `found_closing_tag` stayed false, and the
//! generic unclosed-element path reported at the opening tag — a different
//! diagnosis pointing at a different construct.
//!
//! Every expectation was measured against the official compiler on the same
//! source. `<title>` and `<div>` are the controls: neither is a raw-text element
//! in Svelte, so both must keep `element_unclosed` at the opening tag.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `(code, start, end)` of the parse error, or `None` when the source compiles.
fn diagnose(source: &str) -> Option<(String, usize, usize)> {
    match compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    ) {
        Ok(_) => None,
        Err(err) => {
            let text = format!("{err:?}");
            let code = text
                .split("code: \"")
                .nth(1)
                .and_then(|rest| rest.split('"').next())
                .unwrap_or_default()
                .to_string();
            let mut span = text
                .split("span: (")
                .nth(1)
                .unwrap_or_default()
                .split(')')
                .next()
                .unwrap_or_default()
                .split(',')
                .filter_map(|n| n.trim().parse::<usize>().ok());
            let start = span.next().unwrap_or(usize::MAX);
            let end = span.next().unwrap_or(usize::MAX);
            Some((code, start, end))
        }
    }
}

/// The point official reports is the end of the *right-trimmed* template.
fn trimmed_end(source: &str) -> usize {
    source.trim_end().len()
}

#[track_caller]
fn assert_eof_at_trimmed_end(source: &str) {
    match diagnose(source) {
        None => panic!("{source:?} compiled; official rejects it"),
        Some((code, start, end)) => {
            assert_eq!(code, "unexpected_eof", "wrong code for {source:?}");
            let at = trimmed_end(source);
            assert_eq!((start, end), (at, at), "wrong point for {source:?}");
        }
    }
}

#[test]
fn an_unclosed_textarea_is_end_of_input() {
    for source in [
        "<textarea>abc",
        "<textarea>",
        "<textarea>a{b}c",
        "<textarea>abc</textarea",
        "<textarea>abc</div>",
        "<div><textarea>abc",
        "<textarea rows=\"2\">abc",
    ] {
        assert_eof_at_trimmed_end(source);
    }
}

/// Trailing whitespace is not part of the template upstream measures.
#[test]
fn the_point_is_the_trimmed_end_not_the_files_end() {
    let source = "<textarea>abc   ";
    assert_eof_at_trimmed_end(source);
    let (_, start, _) = diagnose(source).expect("rejected");
    assert_eq!(start, 13, "the file ends at 16; the template ends at 13");
}

/// The controls: not raw-text elements, so they keep the generic diagnosis.
#[test]
fn a_non_raw_text_element_still_reports_element_unclosed() {
    for source in ["<title>abc", "<div>abc"] {
        let (code, start, end) = diagnose(source).expect("official rejects these too");
        assert_eq!(code, "element_unclosed", "wrong code for {source:?}");
        assert_eq!((start, end), (0, 1), "wrong point for {source:?}");
    }
}

/// The controls that compile on both sides.
#[test]
fn a_closed_textarea_still_compiles() {
    for source in [
        "<textarea>abc</textarea>",
        "<textarea>a{b}c</textarea>",
        "<textarea></textarea>",
    ] {
        assert!(diagnose(source).is_none(), "{source:?} was rejected");
    }
}
