//! Trailing whitespace-only text nodes are dropped by `trim_end()` when the
//! parser sets `content_end`, not by the fragment-level trim that follows it.
//!
//! That trim carried a `b >= 0x80 && (b as char).is_whitespace()` arm which
//! could never decide anything: the predicate runs under `all()`, and the lead
//! byte of every multi-byte character (`C2..=F4`) casts to a non-whitespace
//! Latin-1 char, so `all()` fails before the arm matters. These tests pin the
//! behaviour the arm appeared — but failed — to provide, so that deleting it is
//! visibly a no-op and a future "Unicode support" repair has something to fail
//! against.

use rsvelte_core::{Allocator, ParseOptions, parse};

fn trailing_node_count(trailer: &str) -> usize {
    let src = format!("<script>\n</script>\n{trailer}");
    let allocator = Allocator::default();
    parse(&src, &allocator, ParseOptions::default())
        .expect("component should parse")
        .fragment
        .nodes
        .len()
}

/// Every non-ASCII character with the Unicode `White_Space` property — the
/// arm's entire intended domain. All are already dropped upstream.
///
/// One of them, `U+0085`, is dropped where official Svelte keeps it: JS trims
/// by `WhiteSpace + LineTerminator`, which excludes `U+0085` and includes
/// `U+FEFF`, the exact opposite of Rust's `White_Space` on both. That is a
/// `trim_end()` question, tracked separately; this test pins today's behaviour
/// so the divergence cannot move without a failure.
#[test]
fn every_non_ascii_whitespace_trailer_is_already_dropped() {
    let ws: Vec<char> = (0u32..=0x10FFFF)
        .filter_map(char::from_u32)
        .filter(|c| c.is_whitespace() && !c.is_ascii())
        .collect();
    assert_eq!(ws.len(), 19, "the White_Space domain changed");

    for c in ws {
        assert_eq!(
            trailing_node_count(&c.to_string()),
            0,
            "U+{:04X} survived as a trailing text node",
            c as u32
        );
    }
}

/// The ASCII half of the same trim, which is the part the byte scan really
/// decides. Over-deleting from the predicate fails here.
#[test]
fn ascii_whitespace_trailers_are_dropped() {
    for trailer in [" ", "\t", "\n", "\r", " \t\r\n  "] {
        assert_eq!(
            trailing_node_count(trailer),
            0,
            "ASCII whitespace trailer {trailer:?} survived"
        );
    }
}

/// The other side: a trailer that is not whitespace must be kept, so a
/// predicate that accepted everything would fail.
#[test]
fn a_non_whitespace_trailer_is_kept() {
    assert_eq!(trailing_node_count("x"), 1);
    assert_eq!(trailing_node_count("\u{540d}"), 1);
}
