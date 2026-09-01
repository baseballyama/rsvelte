//! Expanding `s += <rhs>` to `$.set(s, $.get(s) + <rhs>)` needs the right-hand
//! side parenthesized whenever it is itself a binary expression, and the
//! difference is a value rather than a spelling: `1 + (2 + '3')` is `'123'` and
//! `1 + 2 + '3'` is `'33'`.
//!
//! The predicate deciding that was a character scan with a "starts and ends with
//! a quote, so it is a string literal" early return, which `'a' + x + 'b'` and
//! `` `a${x}` + x + `b${x}` `` also satisfy. The rows below that keep no parens
//! are the controls: a single literal, an escaped quote inside one, and a bare
//! identifier still have to come out unparenthesized.
//!
//! Every expected fragment was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn set_line(script: &str) -> String {
    let src = format!("<script>\n{script}\n</script>\n<p>{{s}}</p>\n");
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .filter(|l| l.contains("$.set(s"))
        .map(str::trim)
        .collect::<Vec<_>>()
        .join(" ")
}

#[test]
fn a_binary_rhs_that_begins_and_ends_with_a_quote_is_parenthesized() {
    assert_eq!(
        set_line("let s = $state(''); function f(x){ s += 'a' + x + 'b'; }"),
        "$.set(s, $.get(s) + ('a' + x + 'b'));"
    );
    assert_eq!(
        set_line("let s = $state(''); function f(x){ s += `a${x}` + x + `b${x}`; }"),
        "$.set(s, $.get(s) + (`a${x}` + x + `b${x}`));"
    );
}

#[test]
fn a_binary_rhs_that_only_begins_with_a_quote_was_already_parenthesized() {
    assert_eq!(
        set_line("let s = $state(''); function f(x){ s += 'a' + x; }"),
        "$.set(s, $.get(s) + ('a' + x));"
    );
    assert_eq!(
        set_line("let s = $state(0); function f(x){ s -= 1 + x; }"),
        "$.set(s, $.get(s) - (1 + x));"
    );
}

/// A right-hand side that really is one literal must stay unparenthesized — the
/// control a fix that simply deleted the early return would fail.
#[test]
fn a_single_literal_rhs_keeps_no_parentheses() {
    assert_eq!(
        set_line("let s = $state(''); function f(x){ s += 'a'; }"),
        "$.set(s, $.get(s) + 'a');"
    );
    assert_eq!(
        set_line("let s = $state(''); function f(x){ s += `a${x}b`; }"),
        "$.set(s, $.get(s) + `a${x}b`);"
    );
    assert_eq!(
        set_line("let s = $state(''); function f(x){ s += 'a\\'b'; }"),
        "$.set(s, $.get(s) + 'a\\'b');"
    );
    assert_eq!(
        set_line("let s = $state(''); function f(x){ s += x; }"),
        "$.set(s, $.get(s) + x);"
    );
}
