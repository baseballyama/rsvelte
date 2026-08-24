//! #3255: the padding in front of a standalone `{#snippet}`'s `const` is the
//! number of non-empty gaps between the ranges upstream's `transform()` keeps,
//! not the width of the region after the last one. Everything svelte2tsx emits
//! is one MagicString, so one missing space shifts every later mapping.
//!
//! Expectations were measured against the official `svelte2tsx` from
//! `submodules/language-tools` on the same sources.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(header: &str) -> String {
    let src = format!("<script lang=\"ts\"></script>\n{{#snippet {header}}}x{{/snippet}}\n");
    let opts = Svelte2TsxOptions {
        filename: "Probe.svelte".to_string(),
        ..Default::default()
    };
    svelte2tsx(&src, opts).expect("svelte2tsx ok").code
}

fn pad_width(code: &str) -> usize {
    let at = code.find("const s").expect("snippet declaration");
    code[..at].len() - code[..at].trim_end_matches(' ').len()
}

/// One space when the parameter range starts flush against the name range —
/// i.e. only the `(` separates them, and `transform`'s widening consumed it.
#[test]
fn a_flush_parameter_list_gets_one_space() {
    for header in ["s(a)", "s(a, b)", "s(a , b)"] {
        assert_eq!(pad_width(&convert(header)), 1, "header {header:?}");
    }
}

/// Two spaces once anything sits between the name and the first parameter —
/// a space, a tab, a type parameter list, or a line break. rsvelte measured the
/// tail instead, so every one of these was one space short.
#[test]
fn a_gap_before_the_first_parameter_adds_a_space() {
    for header in [
        "s (a)",
        "s  (a)",
        "s( a)",
        "s(  a)",
        "s\t(a)",
        "s<T>(a)",
        "s<T,U>(a)",
        "s<T extends string>(a)",
        "s<T,>(a)",
    ] {
        assert_eq!(pad_width(&convert(header)), 2, "header {header:?}");
    }
}

/// A parameterless snippet keeps its single kept range, and the tail collapses
/// into the second space — unchanged by the fix.
#[test]
fn a_parameterless_snippet_is_unaffected() {
    for header in ["s()", "s( )", "s<T>()"] {
        assert_eq!(pad_width(&convert(header)), 2, "header {header:?}");
    }
}

/// A formatted multi-line parameter list opens a gap *and* leaves a tail, so it
/// takes three spaces.
#[test]
fn a_multi_line_parameter_list_counts_both_gaps_and_the_tail() {
    assert_eq!(pad_width(&convert("s(\n\ta\n)")), 3);
    assert_eq!(pad_width(&convert("s (\n\ta\n)")), 3);
}

/// Padding is emitted before `const`, so a missing space shifts the offset of
/// everything downstream of it in the generated text.
#[test]
fn the_pad_shifts_every_later_offset() {
    let flush = convert("s(a)");
    let gapped = convert("s (a)");
    assert_eq!(
        gapped.find("const s").unwrap(),
        flush.find("const s").unwrap() + 1,
        "the extra gap must move the declaration by exactly one character"
    );
}
