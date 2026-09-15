//! `{@html expr}` lowers to `$.html(node, () => expr)`. Upstream builds that
//! thunk with `b.thunk`, so the arrow itself carries no `loc` while the
//! expression it wraps keeps the one it had in source. esrap runs an arrow's
//! parameter sequence `until` the body's start, so a comment still pending from
//! the instance script is claimed by the **empty parameter list** — official
//! emits `$.html(node, (// x` / `) => c);`.
//!
//! rsvelte built the thunk with no anchor at all, so the located pass had no
//! site before the end of the component body and wrote the comment there. The
//! `{#key}` sibling of this defect already lands correctly, but through the
//! recovery pass (`print_split`'s second print), which only runs when the first
//! pass **drops** a comment — a misplaced one leaves it disarmed.
//!
//! Every expected string is official Svelte 5.57.0's own output for the same
//! source (`submodules/svelte`, pin `7bc0a70fe`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .unwrap_or_else(|error| format!("COMPILE_ERROR: {error:?}"))
}

const LINE: &str = "<script>\n\tlet c = 1;\n\t// x\n</script>\n\n{@html c}\n";
const BLOCK: &str = "<script>\n\tlet c = 1;\n\t/* x */\n</script>\n\n{@html c}\n";
const NONE: &str = "<script>\n\tlet c = 1;\n</script>\n\n{@html c}\n";
const BINARY: &str = "<script>\n\tlet c = 1;\n\t// x\n</script>\n\n{@html c + 1}\n";

/// The reported cell.
#[test]
fn the_comment_is_claimed_by_the_thunks_parameter_list() {
    let out = client(LINE, false);
    assert!(out.contains("\t$.html(node, (// x\n\t) => c);"), "{out}");
}

/// The wrong placement it replaces: after the whole statement, at the end of
/// the component body.
#[test]
fn it_is_not_deferred_past_the_statement() {
    let out = client(LINE, false);
    assert!(!out.contains("$.html(node, () => c);"), "{out}");
    assert!(
        !out.contains("$.append($$anchor, fragment);\n\t// x"),
        "{out}"
    );
}

#[test]
fn the_comment_survives_exactly_once() {
    let out = client(LINE, false);
    assert_eq!(out.matches("// x").count(), 1, "{out}");
}

#[test]
fn a_block_comment_reaches_the_same_place() {
    let out = client(BLOCK, false);
    assert!(out.contains("\t$.html(node, (/* x */\n\t) => c);"), "{out}");
}

#[test]
fn the_dev_target_reaches_the_same_place() {
    let out = client(LINE, true);
    assert!(out.contains("\t$.html(node, (// x\n\t) => c);"), "{out}");
}

/// A live control: the same template with no pending comment keeps the
/// one-line call, so the anchor does not change layout on its own.
#[test]
fn no_pending_comment_leaves_the_call_unchanged() {
    let out = client(NONE, false);
    assert!(out.contains("\t$.html(node, () => c);"), "{out}");
    assert!(!out.contains("(\n"), "{out}");
}

/// The anchor is the expression's own start, not the tag's, so a compound
/// expression lands the same way.
#[test]
fn a_compound_expression_lands_the_same_way() {
    let out = client(BINARY, false);
    assert!(
        out.contains("\t$.html(node, (// x\n\t) => c + 1);"),
        "{out}"
    );
}
