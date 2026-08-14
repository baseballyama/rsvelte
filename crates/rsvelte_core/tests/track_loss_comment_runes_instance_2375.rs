//! A comment between `await` and its operand must survive the dev-mode
//! `(await $.track_reactivity_loss(X))()` wrap in a **runes** instance script.
//!
//! The runes script does not reach `await_reactivity_loss_ast`'s collector; it
//! is rewritten by `ast_state_transform::try_rewrite_await_reactivity_loss`,
//! which copied the operand from the argument's own span and so began past any
//! trivia the `await` keyword was separated from it by. Expectations are the
//! generated program's semantic comment placement.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn dev_client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn runes(body: &str) -> String {
    dev_client(&format!(
        "<script>\n{body}\tlet x = $state(1);\n</script>\n<p>{{x}}</p>"
    ))
}

#[test]
fn a_block_comment_before_the_operand_is_kept() {
    let out = runes("\tasync function f() {\n\t\treturn await /* hi */ load();\n\t}\n");
    assert!(out.contains("$.track_reactivity_loss("), "got: {out}");
    assert!(out.contains("/* hi */"), "got: {out}");
    assert!(out.contains("load()"), "got: {out}");
}

#[test]
fn every_comment_in_the_run_is_kept() {
    let out = runes("\tasync function f() {\n\t\treturn await /* a */ /* b */ load();\n\t}\n");
    assert!(out.contains("$.track_reactivity_loss("), "got: {out}");
    assert!(out.contains("/* a */"), "got: {out}");
    assert!(out.contains("/* b */"), "got: {out}");
    assert!(out.contains("load()"), "got: {out}");
}

#[test]
fn a_line_comment_survives() {
    let out = runes("\tasync function f() {\n\t\treturn await // hi\n\t\t\tload();\n\t}\n");
    assert!(
        out.contains("// hi"),
        "the line comment was dropped; got: {out}"
    );
}

/// Discriminates the `svelte-ignore` gate, not the copy bound: with the gate
/// removed this shape gains a wrap it must not have.
#[test]
fn an_ignored_await_is_left_alone() {
    let out = runes(
        "\tasync function f() {\n\t\t// svelte-ignore await_reactivity_loss\n\t\treturn await /* hi */ load();\n\t}\n",
    );
    assert!(
        !out.contains("track_reactivity_loss"),
        "the ignored await was wrapped; got: {out}"
    );
}
