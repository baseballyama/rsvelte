//! A script-tail comment is split off so the appended `$:` effects land before
//! it, and the split takes the newline that separated it from the last
//! statement. Without restoring one the effects fuse with a semicolon-free
//! declaration and the output stops being JavaScript.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const SEMI_FREE_REACTIVE_TAIL: &str = concat!(
    "<script>\n",
    "\tlet a = []\n",
    "\t$: q(v, (res) => {\n",
    "\t\ta = res\n",
    "\t})\n",
    "\t// c\n",
    "</script>\n",
    "{a}\n"
);

#[test]
fn a_tail_comment_does_not_fuse_a_semicolon_free_declaration_with_the_effects() {
    let out = client(SEMI_FREE_REACTIVE_TAIL);
    assert!(
        !out.contains(")$.legacy_pre_effect("),
        "declaration fused with the appended effect:\n{out}"
    );
}

/// This one passes with the fix ablated — it guards the SPLIT's purpose, not
/// the missing separator, so that "stop splitting" is not an available repair.
#[test]
fn the_tail_comment_still_ends_up_past_the_effects() {
    let out = client(SEMI_FREE_REACTIVE_TAIL);
    let effect = out.find("$.legacy_pre_effect(").expect("effect emitted");
    let comment = out.rfind("// c").expect("tail comment kept");
    assert!(
        comment > effect,
        "comment did not outlive the effects:\n{out}"
    );
}

/// A terminated declaration was never affected — it is the control that says
/// the axis is the missing separator, not the comment.
#[test]
fn a_terminated_declaration_was_never_affected() {
    let out = client(&SEMI_FREE_REACTIVE_TAIL.replace("let a = []\n", "let a = [];\n"));
    assert!(!out.contains(")$.legacy_pre_effect("), "{out}");
    assert!(out.contains("$.legacy_pre_effect("), "{out}");
}

/// Without a `$:` there is nothing appended, so the split never runs.
#[test]
fn no_reactive_statement_means_no_split() {
    let out = client("<script>\n\tlet a = []\n\t// c\n</script>\n{a}\n");
    assert!(!out.contains("$.legacy_pre_effect("), "{out}");
}
