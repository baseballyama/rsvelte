//! A comment the instance script leaves pending is flushed at the first node
//! **in print order** that carries a position. Where the enclosing statement has
//! none — `$.event('resize', $.window, () => c)` is synthesized — upstream's
//! flush falls to the source arrow in argument position, and rsvelte deferred it
//! past the whole statement instead (#4481).
//!
//! Two things decide this and both are pinned below: the arrow has to carry the
//! source span at all (it is converted from source, so it has one), and the
//! claim has to happen in print order — a statement prints before anything
//! inside it, so an enclosing statement that wants the anchor must take it
//! first.
//!
//! No corpus gate observes this: `ast_equiv_batch` runs with
//! `CommentPolicy::Ignore`, so a comment-only divergence scores `match` on every
//! target.
//!
//! Every expected string here is official Svelte 5.57.0's own output for the
//! same source (`submodules/svelte`, pin `7bc0a70fe`), not a neighbouring cell's.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .unwrap_or_else(|error| format!("COMPILE_ERROR: {error:?}"))
}

const EVENT_CALL: &str = "\t$.event(\n\t\t'resize',\n\t\t$.window,\n\t\t// x\n\t\t() => c\n\t);";

/// The reported cell. The comment forces the call multiline, which is why one
/// comment moves eight to ten lines in the issue's table.
#[test]
fn a_window_handler_takes_the_comment_into_the_call() {
    let out = client(
        "<script>\n\tlet c = 1;\n\t// x\n</script>\n\n<svelte:window onresize={() => c} />\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(EVENT_CALL), "{out}");
}

/// The same lowering reached through a different host, so the fix is not keyed
/// on `svelte:window`.
#[test]
fn a_document_handler_takes_the_comment_into_the_call() {
    let out = client(
        "<script>\n\tlet c = 1;\n\t// x\n</script>\n\n<svelte:document onclick={() => c} />\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\t$.event(\n\t\t'click',\n\t\t$.document,\n\t\t// x\n\t\t() => c\n\t);"),
        "{out}"
    );
}

/// A block comment reaches the same place, so the rule is not "a line comment
/// swallows the rest of the line".
#[test]
fn a_block_comment_reaches_the_same_argument() {
    let out = client(
        "<script>\n\tlet c = 1;\n\t/* x */\n</script>\n\n<svelte:window onresize={() => c} />\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\t\t/* x */\n\t\t() => c\n\t);"), "{out}");
}

/// The cell that says the claim happens in **print** order: the component call
/// statement has a position of its own (#4529), and it prints before the arrow
/// it contains, so the comment stays on the statement. Claiming inside the
/// expression first — which is the order the conversion used to run in — puts it
/// on the `onclick` property instead.
#[test]
fn an_enclosing_statement_with_a_position_keeps_the_comment() {
    let out = client("<script>\n\tlet c = 1;\n\t// x\n</script>\n<X onclick={() => c} />\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\t// x\n\tX($$anchor, { onclick: () => c });"),
        "{out}"
    );
    assert_eq!(out.matches("// x").count(), 1, "{out}");
}

/// Print order and source order disagree here: `<X>` comes first in the source,
/// `$.event` first in the output. The comment goes to the arrow, which is what
/// says the anchor follows the printed program and not the template's order.
#[test]
fn print_order_decides_when_it_disagrees_with_source_order() {
    let out = client(
        "<script>\n\tlet c = $state(1);\n\t// x\n</script>\n<X {c} /><svelte:window onresize={() => c} />\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(EVENT_CALL), "{out}");
    assert!(out.contains("\tX($$anchor, { c });"), "{out}");
    assert_eq!(out.matches("// x").count(), 1, "{out}");
}

/// The negative: the same template with no comment must be byte-identical to
/// what it was, so a change that merely reformatted the call would fail here.
#[test]
fn a_handler_with_no_pending_comment_is_unchanged() {
    let out = client("<script>\n\tlet c = 1;\n</script>\n\n<svelte:window onresize={() => c} />\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\t$.event('resize', $.window, () => c);"),
        "{out}"
    );
}

/// A live control from the issue's own table: this shape carries the comment
/// through on both sides before and after, so it says the arms differ only
/// where the issue says they do.
#[test]
fn an_element_template_still_places_the_comment_on_the_declarator() {
    let out = client("<script>\n\tlet c = 1;\n\t// x\n</script>\n\n<b>{c}</b>\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\tvar // x\n\tb = root();"), "{out}");
}
