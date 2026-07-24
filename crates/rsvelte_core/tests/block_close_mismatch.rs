//! Regression tests for block close-tag handling (correctness review C-006).
//!
//! Bugs: rsvelte's block-close handlers consumed `{/` and then treated the
//! keyword and `}` as optional, so a mismatched close (`{#if}` closed by
//! `{/each}`) was silently accepted and the wrong block popped, and the
//! `{#await}` handler popped its stack entry even when the keyword did not
//! match. A stray `{/if}` at root was also accepted without error.
//!
//! Fix: a strict `expect_block_close(keyword)` requires the exact `{/keyword}`
//! (erroring in strict mode on a mismatch), and `parse()` reports
//! `block_unexpected_close` for a leftover `{/...}` at root.

use rsvelte_core::error::ParseError;
use rsvelte_core::{ParseOptions, parse};

fn error_code(source: &str) -> String {
    match parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    ) {
        Ok(_) => panic!("expected a parse error for:\n{source}"),
        Err(ParseError::SvelteError { code, .. }) => code,
        Err(other) => panic!("expected a SvelteError, got {other:?} for:\n{source}"),
    }
}

#[test]
fn mismatched_if_close_is_an_error() {
    // `{#if}` closed by `{/each}` must error rather than silently pop the
    // if-block and parse `each}` as text.
    assert_eq!(error_code("{#if ok}{/each}"), "expected_token");
}

#[test]
fn mismatched_await_close_is_an_error() {
    // `{#await}` closed by `{/if}` must error rather than pop the await stack
    // entry unconditionally.
    assert_eq!(error_code("{#await p}{/if}"), "expected_token");
}

#[test]
fn mismatched_each_close_is_an_error() {
    assert_eq!(error_code("{#each xs as x}{/if}"), "expected_token");
}

#[test]
fn mismatched_key_close_is_an_error() {
    assert_eq!(error_code("{#key k}{/each}"), "expected_token");
}

#[test]
fn mismatched_snippet_close_is_an_error() {
    assert_eq!(error_code("{#snippet foo()}{/if}"), "expected_token");
}

#[test]
fn stray_block_close_at_root_is_an_error() {
    assert_eq!(error_code("{/if}"), "block_unexpected_close");
    assert_eq!(error_code("<p>hi</p>\n{/each}"), "block_unexpected_close");
}

#[test]
fn matching_block_closes_still_parse() {
    // Valid blocks must continue to parse without error.
    for source in [
        "{#if ok}<p>a</p>{/if}",
        "{#if ok}<p>a</p>{:else}<p>b</p>{/if}",
        "{#each xs as x}{x}{/each}",
        "{#each xs as x, i (x.id)}{x}{/each}",
        "{#key k}<p>a</p>{/key}",
        "{#await p}<p>loading</p>{:then v}{v}{:catch e}{e}{/await}",
        "{#snippet foo()}<p>a</p>{/snippet}",
        // Whitespace inside the close tag is allowed: `{/if }`.
        "{#if ok}<p>a</p>{/if }",
    ] {
        assert!(
            parse(
                source,
                &oxc_allocator::Allocator::default(),
                ParseOptions::default()
            )
            .is_ok(),
            "expected a clean parse for:\n{source}"
        );
    }
}
