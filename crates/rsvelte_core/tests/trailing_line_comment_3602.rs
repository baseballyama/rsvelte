//! Regression tests for #3602 — a template expression whose LAST token is a
//! `//` line comment, with the closing `}` on the following line.
//!
//! `find_matching_bracket` already located the right `}`; the slice was then
//! wrapped as `(<slice>)` — or `let <slice> = null` / `(<slice>) => {}` — with
//! the synthetic suffix appended on the comment's own line, so the comment ate
//! it and OXC reported "Unexpected end of file".
//!
//! The two halves need separate assertions because they fail differently: six
//! hosts surfaced the failure as a compile error, while five swallow a parse
//! failure into an empty identifier and so returned successfully with wrong
//! code. A test that only asserts "it compiles" cannot tell the second half
//! apart from a fix.
//!
//! These live here rather than in `compatibility/pattern-corpus` because the
//! fmt oracle deletes the trailing comment outright, so a corpus file would be
//! committed as the shape that already worked.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const HEAD: &str = "<script>\n\tlet flag = $state(true);\n\tlet rows = $state([1]);\n</script>\n\n";

fn server(body: &str) -> String {
    compile(
        &format!("{HEAD}{body}\n"),
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The loud half: these six raised `js_parse_error` (`{@render}` raised
/// `render_tag_invalid_expression`, because it swallows the parse failure and
/// then rejects the empty identifier for not being a call).
#[test]
fn every_rejecting_host_compiles() {
    for body in [
        "{#if flag // c\n}\n\t<b>a</b>\n{/if}",
        "{#if flag}\n\t<b>a</b>\n{:else if flag // c\n}\n\t<b>b</b>\n{/if}",
        "{#key flag // c\n}\n\t<b>a</b>\n{/key}",
        "<b>{flag // c\n}</b>",
        "<div data-a={flag // c\n}>a</div>",
        "{@html \"<i>x</i>\" // c\n}",
        "{#snippet body(n)}\n\t<b>{n}</b>\n{/snippet}\n\n{@render body(1) // c\n}",
    ] {
        assert!(!server(body).is_empty(), "empty output for:\n{body}");
    }
}

/// The quiet half — a swallowed parse failure produced `const x = undefined`.
#[test]
fn const_tag_initializer_survives() {
    let out = server("{#each rows as r (r)}\n\t{@const x = r * 2 // c\n\t}\n\t<b>{x}</b>\n{/each}");
    assert!(out.contains("const x = r * 2;"), "in:\n{out}");
}

/// Same, through `parse_destructuring_pattern`'s `let <slice> = null` wrap:
/// the pattern parsed but the initializer came out as `undefined`.
#[test]
fn const_tag_destructuring_initializer_survives() {
    let out = server(
        "{#each rows as r (r)}\n\t{@const { a } = { a: r } // c\n\t}\n\t<b>{a}</b>\n{/each}",
    );
    assert!(out.contains("const { a } = { a: r };"), "in:\n{out}");
}

/// The `{#await}` head is the one that produced output no JS parser accepts —
/// the empty identifier printed as a missing argument, `$.await($$renderer, ,`.
#[test]
fn await_head_expression_survives() {
    let out = server("{#await Promise.resolve(1) // c\nthen v}\n\t<b>{v}</b>\n{/await}");
    assert!(
        out.contains("$.await($$renderer, Promise.resolve(1), "),
        "in:\n{out}"
    );
}

/// A leading comment always worked; it is here so a fix that stops trimming
/// altogether — and thereby breaks the position mapping — still has to pass.
#[test]
fn a_leading_comment_still_works() {
    let out = server("{#if // c\nflag}\n\t<b>a</b>\n{/if}");
    assert!(out.contains("if (flag)"), "in:\n{out}");
}

/// `{#each rows as row // c\n}` is rejected by the official compiler with
/// `expected_token`, and must stay rejected.
#[test]
fn an_each_header_ending_in_a_comment_is_still_rejected() {
    let err = compile(
        &format!("{HEAD}{{#each rows as r // c\n}}\n\t<b>a</b>\n{{/each}}\n"),
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect_err("must be rejected");
    assert!(format!("{err:?}").contains("expected_token"), "{err:?}");
}
