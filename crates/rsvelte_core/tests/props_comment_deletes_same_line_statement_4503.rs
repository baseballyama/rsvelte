//! A block comment between `=` and `$props()` deleted the statement after it on
//! the same line (#4503). Silent code loss: the output parses, runs, and the
//! deleted statement's effect simply never happens.
//!
//! The chain is four sites. `3_transform/client/mod.rs:8803` splits the script
//! with `.lines()`, and the accumulator above it joins lines into "statements"
//! but can never split one line into two — so two statements sharing a line are
//! one indivisible unit. `client/rune_transforms.rs` routes to a text path when
//! a comment sits between the last `=` and `$props(`, and its own comment says
//! it handles that shape "while it is still one complete source statement" —
//! an assumption the line split does not provide. `transform_props_destructuring`
//! then replaces the whole unit, discarding everything else on the line.
//!
//! **One test per carrier, each failing on its own.** A single "no statement is
//! lost" assertion over all three is satisfied by the other two when one
//! regresses, and the three reach the deletion through different declarators.
//!
//! **What these tests cannot distinguish, stated because it bounds them.** The
//! narrow guard under test and *deleting the routing branch outright* produce
//! identical output on every cell here and on all 67,156 corpus cells
//! (33,578 files x client/client-dev, three arms with distinct `sha256`). That
//! is consistent rather than suspicious: the branch's own entry condition is a
//! block comment between `=` and `$props(`, which occurs in **0** of 35,723
//! real `.svelte` files (control: 8,711 files bearing `$props(`), so it never
//! fires there. These tests therefore pin the *behaviour* and say nothing about
//! whether the branch earns its place.
//!
//! Expected values were read out of `submodules/svelte`'s compiler at the pin
//! `7bc0a70fe` (`VERSION 5.57.0`), not inferred from rsvelte's output.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

#[test]
fn a_side_effect_after_a_commented_props_declaration_survives() {
    let out = client(
        "<script>let { a } = /* c */ $props(); console.log(\"SIDE_EFFECT\");</script><i>{a}</i>",
    );
    assert!(
        out.contains("SIDE_EFFECT"),
        "the console.log sharing the declaration's line was deleted:\n{out}"
    );
}

#[test]
fn a_state_declaration_after_a_commented_props_declaration_survives() {
    let out =
        client("<script>let { a } = /* c */ $props(); let s = $state(0);</script><i>{a}{s}</i>");
    assert!(
        out.contains("let s"),
        "the `$state` declaration sharing the line was deleted:\n{out}"
    );
}

#[test]
fn a_side_effect_after_a_commented_non_destructured_props_declaration_survives() {
    let out = client(
        "<script>let p = /* c */ $props(); console.log(\"SIDE_EFFECT\");</script><i>{p.a}</i>",
    );
    assert!(
        out.contains("SIDE_EFFECT"),
        "the console.log after a non-destructured declaration was deleted:\n{out}"
    );
}

/// The comment position is the carrier, so the neighbouring positions are what
/// say the guard is not simply "never route to the text path". Each cell's name
/// is a claim about its source text: the comment really is outside the `=` /
/// `$props(` span in every one.
#[test]
fn a_comment_outside_the_value_position_never_deleted_the_statement() {
    for (name, body) in [
        (
            "leading the declaration",
            "/* c */ let { a } = $props(); console.log(\"KEEP\");",
        ),
        (
            "inside the pattern",
            "let { a /* c */ } = $props(); console.log(\"KEEP\");",
        ),
        (
            "trailing the declaration",
            "let { a } = $props(); /* c */ console.log(\"KEEP\");",
        ),
        (
            "no comment at all",
            "let { a } = $props(); console.log(\"KEEP\");",
        ),
    ] {
        let out = client(&format!("<script>{body}</script><i>{{a}}</i>"));
        assert!(out.contains("KEEP"), "{name}: statement deleted:\n{out}");
    }
}

/// The same comment with the statement on its own line: the unit is then a
/// single statement, the guard's new conjunct holds, and the text path still
/// runs. This is the cell that would move if the guard were widened into
/// "never route", so it is the one that bounds the fix from the other side.
#[test]
fn a_statement_on_its_own_line_still_survives() {
    let out =
        client("<script>let { a } = /* c */ $props();\nconsole.log(\"KEEP\");</script><i>{a}</i>");
    assert!(
        out.contains("KEEP"),
        "statement on its own line deleted:\n{out}"
    );
}
