//! Regression tests for #3700 — a template `js_parse_error` was reported at the
//! offending token's END, where acorn reports its START.
//!
//! `check_js_parse_error_with_pos` computes `label.offset() + label.len()`,
//! which is right when OXC's label is *what it consumed* and wrong when the
//! label IS the offending token. Acorn stops at the token and reports there, so
//! the delta was exactly the token's length — `{break}` at the byte past
//! `break`, `{continue}` eight bytes late.
//!
//! Two message classes need the label's start: `Unexpected token` (OXC labels
//! the token it could not use) and `Expected X but found Y` (it labels the
//! found token). The default stays the label's end, because for the rest the
//! label is the consumed text.
//!
//! These positions did not exist before #3652: the programs were accepted, so
//! there was nothing to report. Closing that over-acceptance is what made this
//! axis observable.
//!
//! Every expectation is the byte-exact `start` of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::compiler::CompileError;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_err(src: &str) -> CompileError {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("must be rejected")
}

/// The byte offset rsvelte reports for the first error in `src`.
fn error_at(src: &str) -> usize {
    let err = compile_err(src);
    let CompileError::Parse(parse) = &err else {
        panic!("expected a parse error: {err:?}")
    };
    let text = format!("{parse:?}");
    assert!(text.contains("js_parse_error"), "{text}");
    parse.span().0
}

const HEAD: &str = "<script>\n\tconst obj = { a: 1 };\n</script>\n";

/// The expression starts at this byte in every case below: `HEAD` plus the `{`.
fn expr_start() -> usize {
    HEAD.len() + 1
}

/// A reserved word that cannot begin an expression is reported at the word, not
/// past it. The word's length is what the old rule added, so a word list of
/// differing lengths is what separates the two rules.
#[test]
fn a_reserved_word_head_is_reported_at_the_word() {
    // Chosen for differing lengths: the old rule put each one `len` bytes late.
    const WORDS: [&str; 6] = ["do", "case", "break", "default", "continue", "instanceof"];
    for word in WORDS {
        for shape in [word.to_string(), format!("{word}.x")] {
            let src = format!("{HEAD}{{{shape}}}\n");
            assert_eq!(error_at(&src), expr_start(), "{shape:?}");
        }
    }
}

/// `Expected X but found Y` labels the FOUND token, and acorn reports where
/// that token begins. `{class}` cannot separate the two rules — the found token
/// is the wrapper's own `)`, and the clamp puts both answers at the same byte —
/// so the discriminating case has to be `{class.x}`.
#[test]
fn an_expected_token_error_is_reported_at_the_found_token() {
    for (shape, offset) in [("class.x", 5usize), ("function.x", 8)] {
        let src = format!("{HEAD}{{{shape}}}\n");
        assert_eq!(error_at(&src), expr_start() + offset, "{shape:?}");
    }
}

/// The slot must not change the answer: three different readers reach the same
/// probe, and a fix in only one of them would move this.
#[test]
fn the_slot_does_not_change_the_position() {
    const SLOTS: [(&str, usize); 3] = [
        ("{break}", 1),
        ("<div title={break}></div>", 12),
        ("{#if true}{@const c = break}<span>{c}</span>{/if}", 22),
    ];
    for (markup, offset) in SLOTS {
        let src = format!("{HEAD}{markup}\n");
        assert_eq!(error_at(&src), HEAD.len() + offset, "{markup:?}");
    }
}

/// The control for the other direction: `Assigning to rvalue` already read the
/// label's start, and it must keep its rewritten message as well as its
/// position. A refactor that folded the two flags together would move this.
#[test]
fn the_assignment_error_keeps_its_start_and_its_message() {
    let src = format!("{HEAD}{{obj.a() = 1}}\n");
    let err = compile_err(&src);
    let CompileError::Parse(parse) = &err else {
        panic!("expected a parse error: {err:?}")
    };
    let text = format!("{parse:?}");
    assert!(text.contains("Assigning to rvalue"), "{text}");
    assert_eq!(parse.span().0, expr_start());
}
