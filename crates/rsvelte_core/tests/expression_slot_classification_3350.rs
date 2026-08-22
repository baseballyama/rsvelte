//! Issue #3350: which of `expected_token` and `js_parse_error` a template slot
//! reports was decided per slot.
//!
//! Upstream decides it once: `read_expression` parses ONE maximal expression
//! with acorn, whatever is left over is `expected_token` at the leftover token,
//! and everything else is `js_parse_error` at `err.pos`. Five rsvelte slots
//! never ran that classification at all — the `{#await}` head, `{@debug}`,
//! `{@const}`, `{@render}` and the `read_pattern` positions (`{#each … as p}`,
//! its index, and `{:then}` / `{:catch}`) — so a header with a typo compiled
//! with the extra token silently dropped, or reported the JS failure as a
//! later-phase semantic error.
//!
//! Every one of the 35 expectations below was re-derived by running the pinned
//! oracle — `submodules/svelte/packages/svelte/src/compiler/index.js` at
//! `20b341f10048`, which reports `VERSION === '5.56.9'` — on the same source,
//! and all 35 reproduce. That is the tree every gate reads; `node_modules/svelte`
//! resolves to 5.56.10 and is a different oracle.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn outcome(src: &str) -> Result<(), (String, usize)> {
    match compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    ) {
        Ok(_) => Ok(()),
        Err(e) => {
            let d = e.diagnostic();
            let start = d.span.map_or(usize::MAX, |(s, _)| s as usize);
            Err((d.code.unwrap_or_default(), start))
        }
    }
}

#[track_caller]
fn assert_error(src: &str, code: &str, column: usize) {
    match outcome(src) {
        Ok(()) => panic!("expected `{code}` at {column} for {src:?}, but it compiled"),
        Err((got_code, got_column)) => {
            assert_eq!(got_code, code, "code for {src:?}");
            assert_eq!(got_column, column, "position for {src:?}");
        }
    }
}

#[track_caller]
fn assert_compiles(src: &str) {
    if let Err((code, _)) = outcome(src) {
        panic!("expected {src:?} to compile, got `{code}`");
    }
}

/// The `{#await}` head swallowed every parse failure, so a typo changed what
/// the block awaits with no diagnostic at all.
#[test]
fn await_head_reports_its_parse_failure() {
    assert_error("{#await a b}x{/await}", "expected_token", 10);
    assert_error("{#await a +}x{/await}", "js_parse_error", 11);
    assert_error("{#await a b then v}x{/await}", "expected_token", 10);
}

/// `read_pattern` reads ONE pattern; a second token is a missing `}`.
#[test]
fn a_pattern_slot_rejects_a_second_token() {
    assert_error("{#each a as b c}x{/each}", "expected_token", 14);
    assert_error("{#each a as b, i j}x{/each}", "expected_token", 17);
    assert_error("{#await p}a{:then v w}b{/await}", "expected_token", 20);
    assert_error("{#await p}a{:catch e f}b{/await}", "expected_token", 21);
    assert_error("{#await p then v w}b{/await}", "expected_token", 17);
}

/// Destructuring, a type annotation and the `,` / `(` continuations must not be
/// read as a second token — the control that could have moved.
#[test]
fn a_pattern_slot_still_accepts_every_legal_shape() {
    assert_compiles("{#each a as { b, c }}x{/each}");
    assert_compiles("{#each a as [b, c]}x{/each}");
    assert_compiles("{#each a as { b = 1 }}x{/each}");
    assert_compiles("{#each a as b, i}{i}{/each}");
    assert_compiles("{#each a as b (b.id)}x{/each}");
    assert_compiles("{#each a as b, i (b.id)}{i}{/each}");
    assert_compiles("{#await p}a{:then { b, c }}x{/await}");
    assert_compiles("{#await p}a{:catch [e]}x{/await}");
    assert_compiles("{#await p then { b }}x{/await}");
    assert_compiles("{#await p}x{/await}");
}

/// `{@debug}`'s identifier test runs before the leftover is seen, exactly as
/// upstream orders them — so a non-identifier argument still wins.
#[test]
fn debug_tag_classifies_its_failure() {
    assert_error("{@debug a b}", "expected_token", 10);
    assert_error("{@debug a +}", "js_parse_error", 11);
    assert_error("{@debug a.b c}", "debug_tag_invalid_arguments", 8);
    assert_compiles("<script>let a = 1, b = 2;</script>{@debug a, b}{a}{b}");
    assert_compiles("{@debug}");
}

/// `{@const}` reported the *placement* rule for a syntax error — in a later
/// phase and, for two of the three, with no span.
#[test]
fn const_tag_classifies_its_failure() {
    assert_error("{#if q}{@const a}{/if}", "expected_token", 16);
    assert_error("{#if q}{@const a = a1 b}{/if}", "expected_token", 22);
    assert_error("{#if q}{@const a = a1 +}{/if}", "js_parse_error", 23);
    assert_error("{#if q}{@const a = }{/if}", "js_parse_error", 19);
    assert_compiles("{#if q}{@const a = 1}{a}{/if}");
    assert_compiles("{#if q}{@const a = (1, 2)}{a}{/if}");
    assert_compiles("{#if q}{@const { a, b } = o}{a}{b}{/if}");
}

/// `{@render}`'s call test runs on the maximal leading expression, so a JS
/// failure inside the tag is a `js_parse_error` rather than the placeholder the
/// call test would report as a semantic error.
#[test]
fn render_tag_classifies_its_failure() {
    assert_error("{@render a b}", "render_tag_invalid_expression", 9);
    assert_error("{@render a +}", "js_parse_error", 12);
    assert_error("{@render a}", "render_tag_invalid_expression", 9);
    assert_compiles("{#snippet s(x)}{x}{/snippet}{@render s(1)}");
    assert_compiles("{#snippet s()}x{/snippet}{@render s?.()}");
}
