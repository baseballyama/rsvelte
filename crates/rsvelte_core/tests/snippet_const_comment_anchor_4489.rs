//! A top-level `{#snippet}` is hoisted above the instance statements, so its
//! `const` is the first thing printed in the component body. Upstream declares
//! it with the snippet's own name Identifier (`b.const(node.expression, …)`),
//! which carries a source location, so a comment still pending at the end of
//! the instance script flushes between `const` and the name. rsvelte built the
//! declaration from a bare name, so nothing in that chunk offered an offset and
//! the comment was **dropped** — not moved.
//!
//! Every expected string is official Svelte 5.57.0's own output for the same
//! source (`submodules/svelte`, pin `7bc0a70fe`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("input.svelte".into()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .unwrap_or_else(|error| format!("COMPILE_ERROR: {error:?}"))
}

const TOP_LEVEL: &str = "<script>\n\tlet c = 1;\n\tlet p = Promise.resolve(1);\n\t// x\n</script>\n{#snippet s()}<b>{c}</b>{/snippet}\n";

#[test]
fn the_comment_precedes_the_hoisted_snippet_name() {
    let out = client(TOP_LEVEL, false);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\tconst // x\n\ts = ($$anchor) => {"), "{out}");
}

/// The defect was a drop, so count the comment as well as place it — a fix that
/// emitted it twice would satisfy the placement assertion alone.
#[test]
fn the_comment_survives_exactly_once() {
    for dev in [false, true] {
        let out = client(TOP_LEVEL, dev);
        assert_eq!(out.matches("// x").count(), 1, "dev={dev}\n{out}");
    }
}

#[test]
fn the_dev_target_reaches_the_same_place() {
    let out = client(TOP_LEVEL, true);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\tconst // x\n\ts = $.wrap_snippet(Input, function ($$anchor) {"),
        "{out}"
    );
}

/// A block comment is recovered too — it was dropped alongside the line comment.
/// Only its position relative to `const` is pinned: official puts it on its own
/// line here and rsvelte pads instead, which is the second carrier of #4500's
/// newline decision and not something this change claims to fix.
#[test]
fn a_block_comment_is_recovered_too() {
    let out = client(
        "<script>\n\tlet c = 1;\n\tlet p = Promise.resolve(1);\n\t/* x */\n</script>\n{#snippet s()}<b>{c}</b>{/snippet}\n",
        false,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert_eq!(out.matches("/* x */").count(), 1, "{out}");
    assert!(out.contains("\tconst /* x */"), "{out}");
}

/// The negative: with nothing pending, the declaration stays on one line.
#[test]
fn a_snippet_with_no_pending_comment_is_unchanged() {
    let out = client(
        "<script>\n\tlet c = 1;\n\tlet p = Promise.resolve(1);\n</script>\n{#snippet s()}<b>{c}</b>{/snippet}\n",
        false,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\tconst s = ($$anchor) => {"), "{out}");
}

/// A snippet inside an element is not hoisted, so an earlier node claims the
/// comment — the declaration must NOT take it. This is the cell that says the
/// anchor is offered rather than forced.
#[test]
fn a_nested_snippet_leaves_the_comment_to_the_element() {
    let out = client(
        "<script>\n\tlet c = 1;\n\t// x\n</script>\n<div>{#snippet s()}<b>{c}</b>{/snippet}</div>\n",
        false,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\tvar // x\n\tdiv = root_1();"), "{out}");
    assert!(out.contains("\t\tconst s = ($$anchor) => {"), "{out}");
    assert_eq!(out.matches("// x").count(), 1, "{out}");
}
