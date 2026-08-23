//! Regression tests for #3647 — a store name spelled inside a **regex literal**
//! was rewritten to `$name()`, changing what the user's regex matches.
//!
//! The client store-read rewrite is a character scan. It already skipped string
//! literals and comments (`is_inside_string_literal`), and a regex body is the
//! third opaque kind — but telling `/re/` from a division needs the previous
//! significant code byte, which that scan does not track, so the regex arm is
//! its own predicate.
//!
//! `division-then-code` is the negative control for exactly that: a `/` after a
//! value divides, so a predicate that called every `/` a regex opener would
//! swallow the real store read that follows it.
//!
//! The output parses and runs either way, so no parse gate can see this; only
//! output equality can.
//!
//! Every expectation is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(expr: &str) -> String {
    let src = format!(
        "<script>\n\timport {{ readable }} from 'svelte/store';\n\tconst s = readable(1);\n\tlet re;\n\t$: re = {expr};\n</script>\n<b>{{$s}}{{re}}</b>\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// A regex body is text: the store name inside it is not a read.
#[test]
fn a_store_name_inside_a_regex_survives() {
    const CASES: [(&str, &str); 4] = [
        (r"/\$s/", r"$.set(re, /\$s/);"),
        (r"/\$s/gi", r"$.set(re, /\$s/gi);"),
        (r"/[\$s]/", r"$.set(re, /[\$s]/);"),
        (r"`${String(/\$s/)}`", r"$.set(re, `${String(/\$s/)}`);"),
    ];
    for (expr, expected) in CASES {
        let out = client(expr);
        assert!(
            out.contains(expected),
            "{expr}\nexpected: {expected}\nin:\n{out}"
        );
    }
}

/// The two controls that must not move. A store read spelled as CODE is still
/// rewritten, and a `/` that divides does not open a regex — so the read after
/// it is still reached.
#[test]
fn a_store_read_spelled_as_code_is_still_rewritten() {
    const CASES: [(&str, &str); 2] = [
        ("$s + 1", "$.set(re, $s() + 1);"),
        ("(1 / 2) + $s", "$.set(re, 1 / 2 + $s());"),
    ];
    for (expr, expected) in CASES {
        let out = client(expr);
        assert!(
            out.contains(expected),
            "{expr}\nexpected: {expected}\nin:\n{out}"
        );
    }
}

/// The string and comment halves were already right, and stay right.
#[test]
fn the_already_skipped_kinds_are_unchanged() {
    let out = client("'$s'");
    assert!(out.contains("$.set(re, '$s');"), "in:\n{out}");
}

/// A regex whose opener follows a keyword rather than a value: `return /re/` is
/// a regex, and the store name in it is still text.
#[test]
fn a_regex_after_a_keyword_is_still_a_regex() {
    let out = client(r"(() => { return /\$s/; })()");
    assert!(out.contains(r"return /\$s/;"), "in:\n{out}");
    assert!(!out.contains(r"/\$s()/"), "in:\n{out}");
}
