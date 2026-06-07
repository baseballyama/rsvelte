//! Regression test for issue #753.
//!
//! An `{#await}` block whose `{:catch}` clause has no error variable must
//! generate balanced, valid TSX. Previously the variable-less catch emitted
//! one extra `}` (closing the outer block before `catch`), and the
//! pending+then+catch shape omitted the `try {` entirely, so `--tsgo`
//! reported `'catch' or 'finally' expected` and flagged the overlay invalid
//! (which then suppressed all real type errors program-wide). Mirrors upstream
//! `handleAwait`, which always emits `try { … } catch($$_e) { … }` gated on the
//! same `error || !catch.skip` condition.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "T.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

/// Curly-brace depth of the whole generated overlay must return to zero.
fn braces_balanced(s: &str) -> bool {
    let mut depth: i32 = 0;
    let mut in_str: Option<char> = None;
    let mut prev = '\0';
    for c in s.chars() {
        match in_str {
            Some(q) => {
                if c == q && prev != '\\' {
                    in_str = None;
                }
            }
            None => match c {
                '"' | '\'' | '`' => in_str = Some(c),
                '{' => depth += 1,
                '}' => depth -= 1,
                _ => {}
            },
        }
        if depth < 0 {
            return false;
        }
        prev = c;
    }
    depth == 0
}

const PRELUDE: &str = "<script lang=\"ts\">const p = Promise.resolve(true);</script>\n";

fn check(body: &str) -> String {
    let out = to_tsx(&format!("{PRELUDE}{body}"));
    assert!(
        braces_balanced(&out),
        "unbalanced braces for `{body}`:\n{out}"
    );
    out
}

#[test]
fn inline_then_variable_less_catch_is_balanced() {
    let out = check("{#await p then v}{v}{:catch}err{/await}");
    assert!(out.contains("try {"), "missing try:\n{out}");
    assert!(
        out.contains("} catch($$_e) {"),
        "missing balanced catch:\n{out}"
    );
}

#[test]
fn pending_then_variable_less_catch_is_balanced() {
    let out = check("{#await p}wait{:then v}{v}{:catch}err{/await}");
    assert!(out.contains("try {"), "pending path missing try:\n{out}");
    assert!(
        out.contains("} catch($$_e) {"),
        "missing balanced catch:\n{out}"
    );
}

#[test]
fn catch_with_variable_still_balanced() {
    let out = check("{#await p then v}{v}{:catch e}{e}{/await}");
    assert!(
        out.contains("const e = __sveltets_2_any();"),
        "catch var lost:\n{out}"
    );
}

#[test]
fn pending_then_catch_with_variable_balanced() {
    // Previously also broken (pending path had no `try`), now fixed.
    let out = check("{#await p}wait{:then v}{v}{:catch e}{e}{/await}");
    assert!(out.contains("try {"), "pending path missing try:\n{out}");
}

#[test]
fn catch_only_variable_less_balanced() {
    let out = check("{#await p catch}err{/await}");
    assert!(
        out.contains("} catch($$_e) {"),
        "missing balanced catch:\n{out}"
    );
}

#[test]
fn plain_then_without_catch_unaffected() {
    // No-catch await blocks must stay balanced — the `try {` wrapper is only
    // added when a catch is present, so these are untouched by the fix.
    check("{#await p then v}{v}{/await}");
    check("{#await p}wait{:then v}{v}{/await}");
}
