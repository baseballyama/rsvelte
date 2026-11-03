//! A repeated `{:…}` clause in one block is `block_duplicate_clause` for every
//! clause kind (svelte 5.57.3 extended it from `{#await}` to `{:else}` in
//! `{#if}` / `{#each}`).
//!
//! Every expectation is the official Svelte compiler's verdict for the same
//! source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn try_compile(markup: &str) -> Result<String, (String, String)> {
    let source = format!("<script>\n\tlet arr = [], p, c;\n</script>\n{markup}");
    compile(
        &source,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .map_err(|error| {
        let text = format!("{error:?}");
        let code = text
            .split("code: \"")
            .nth(1)
            .and_then(|rest| rest.split('"').next())
            .unwrap_or("<no code>")
            .to_string();
        (code, text)
    })
}

#[track_caller]
fn assert_accepted(markup: &str) {
    if let Err((code, text)) = try_compile(markup) {
        panic!("official accepts `{markup}`; rsvelte raised {code}\n{text}");
    }
}

#[track_caller]
fn assert_rejected(markup: &str, expected: &str) {
    match try_compile(markup) {
        Ok(code) => {
            panic!("official rejects `{markup}` with {expected}; rsvelte compiled it:\n{code}")
        }
        Err((actual, text)) => {
            assert_eq!(actual, expected, "wrong code for `{markup}`\n{text}");
        }
    }
}

/// The hosts a block can sit in. A per-arm rule drifts per host, so the table is
/// checked in all of them rather than at the root only.
const HOSTS: [&str; 5] = [
    "{BLOCK}",
    "<div>{BLOCK}</div>",
    "{#if c}{BLOCK}{/if}",
    "{#each arr as _}{BLOCK}{/each}",
    "{#snippet s()}{BLOCK}{/snippet}",
];

fn in_every_host(block: &str, mut check: impl FnMut(&str)) {
    for host in HOSTS {
        check(&host.replace("{BLOCK}", block));
    }
}

#[test]
fn a_repeated_else_is_rejected_in_an_if_block() {
    for block in [
        "{#if c}a{:else}b{:else}d{/if}",
        "{#if c}a{:else}b{:else if p}d{/if}",
        "{#if c}a{:else if p}b{:else}e{:else}f{/if}",
    ] {
        in_every_host(block, |source| {
            assert_rejected(source, "block_duplicate_clause");
        });
    }
}

#[test]
fn a_repeated_else_is_rejected_in_an_each_block() {
    for block in [
        "{#each arr as v}{v}{:else}b{:else}d{/each}",
        "{#each arr}x{:else}b{:else}d{/each}",
    ] {
        in_every_host(block, |source| {
            assert_rejected(source, "block_duplicate_clause");
        });
    }
}

#[test]
fn an_else_if_before_an_else_is_still_accepted() {
    in_every_host("{#if c}a{:else if p}b{:else}e{/if}", assert_accepted);
}

// ---------------------------------------------------------------------------
// Neighbours the table must not disturb
// ---------------------------------------------------------------------------

#[test]
fn a_single_clause_of_each_kind_is_accepted() {
    for block in [
        "{#if c}a{:else}b{/if}",
        "{#each arr as v}{v}{:else}b{/each}",
        "{#await p}w{:then v}{v}{:catch e}{e}{/await}",
        "{#await p}w{:catch e}{e}{:then v}{v}{/await}",
        "{#await p then v}{v}{/await}",
        "{#await p catch e}{e}{/await}",
        "{#await p}w{:then}done{/await}",
    ] {
        in_every_host(block, assert_accepted);
    }
}

// ---------------------------------------------------------------------------
// A misplaced clause is not a duplicate — it keeps its own diagnostic
// ---------------------------------------------------------------------------

#[test]
fn an_else_in_an_await_block_is_still_expected_token() {
    in_every_host("{#await p}w{:else}z{/await}", |source| {
        assert_rejected(source, "expected_token");
    });
}
