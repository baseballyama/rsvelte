//! Regression test for issue #3349: a duplicate `{:then}` / `{:catch}` inside
//! `{#await}` must be rejected with `block_duplicate_clause`.
//!
//! Bug: rsvelte's await continuation loop overwrote `then_fragment` /
//! `catch_fragment` on every clause, so a second `{:catch}` silently replaced
//! the first and the earlier branch's content vanished from the output with no
//! diagnostic. Upstream raises `block_duplicate_clause` from
//! `phases/1-parse/state/tag.js` (`if (block.then) e.block_duplicate_clause(...)`,
//! likewise for `catch`) anchored at the `:` of the continuation marker.
//!
//! Expected values were read off the official compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`, Svelte 5.56.10)
//! on the same sources; both `client` and `server` agree, so this is one parse
//! rule rather than a target-specific gap.

use rsvelte_core::error::ParseError;
use rsvelte_core::{ParseOptions, parse};

fn parse_error(source: &str) -> Option<(String, String, (usize, usize))> {
    match parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    ) {
        Ok(_) => None,
        Err(ParseError::SvelteError {
            code,
            message,
            span,
        }) => Some((code, message, span)),
        Err(other) => panic!("expected a SvelteError, got {other:?} for:\n{source}"),
    }
}

#[track_caller]
fn assert_duplicate(source: &str, clause: &str, colon: usize) {
    let Some((code, message, span)) = parse_error(source) else {
        panic!("expected `block_duplicate_clause` for {source:?}, but it parsed");
    };
    assert_eq!(code, "block_duplicate_clause", "for {source:?}");
    assert_eq!(
        message,
        format!("{clause} cannot appear more than once within a block"),
        "for {source:?}"
    );
    // Upstream's `start` is `parser.index - 1` after `{` + whitespace + `:`,
    // i.e. the `:` byte; the error is a point, so `end` equals it.
    assert_eq!(span, (colon, colon), "for {source:?}");
}

#[track_caller]
fn assert_parses(source: &str) {
    if let Some((code, _, _)) = parse_error(source) {
        panic!("expected {source:?} to parse, got `{code}`");
    }
}

#[test]
fn duplicate_catch_is_rejected() {
    //                       0         1         2         3
    //                       0123456789012345678901234567890123
    assert_duplicate(
        "{#await p}a{:then v}b{:catch e}c{:catch f}d{/await}",
        "{:catch}",
        33,
    );
    assert_duplicate("{#await p}a{:catch}b{:catch}c{/await}", "{:catch}", 21);
    // The third clause is caught by the same test as the second.
    assert_duplicate(
        "{#await p}a{:catch e}b{:catch f}c{:catch g}d{/await}",
        "{:catch}",
        23,
    );
}

#[test]
fn duplicate_then_is_rejected() {
    assert_duplicate("{#await p}a{:then v}b{:then w}c{/await}", "{:then}", 22);
    assert_duplicate("{#await p}a{:then}b{:then}c{/await}", "{:then}", 20);
    // A `{:catch}` between the two does not reset the `{:then}` slot.
    assert_duplicate(
        "{#await p}a{:then v}b{:catch e}c{:then w}d{/await}",
        "{:then}",
        33,
    );
}

#[test]
fn a_header_clause_occupies_the_slot() {
    // `{#await p then v}` fills `block.then`, so a later `{:then}` is a
    // duplicate even though only one continuation marker appears.
    assert_duplicate("{#await p then v}a{:then w}b{/await}", "{:then}", 19);
    assert_duplicate("{#await p catch e}a{:catch f}b{/await}", "{:catch}", 20);
}

#[test]
fn whitespace_before_the_colon_does_not_move_the_anchor() {
    assert_duplicate(
        "{#await p}a{:catch e}c{  :catch f}d{/await}",
        "{:catch}",
        25,
    );
}

#[test]
fn distinct_clauses_still_parse() {
    // The control that could have moved: one of each, in either order, and a
    // header clause paired with the other one.
    assert_parses("{#await p}a{:then v}b{:catch e}c{/await}");
    assert_parses("{#await p}a{:catch e}b{:then v}c{/await}");
    assert_parses("{#await p}a{:then v}b{/await}");
    assert_parses("{#await p}a{:catch e}b{/await}");
    assert_parses("{#await p then v}a{:catch e}b{/await}");
    assert_parses("{#await p}a{/await}");
}
