//! Issue #2351 (re-reported as #2443): a `}` / `)` inside a comment in a `$:`
//! block body crashed the client compiler.
//!
//! The three ordinary-comment cases below no longer reach the scan they were
//! written for: `strip_reactive_statement_comments` now deletes a `$:` body's
//! comments before phase 3 sees them, so they pass even with the fix reverted.
//! That pass keeps `svelte-ignore` comments, which is why the variants carrying
//! one are the cases that still exercise the scan end to end. The unit tests on
//! `find_assignment_position` and `extract_destructure_targets` pin the two
//! load-bearing behaviours directly, independent of what runs upstream of them.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

fn client(src: &str) -> String {
    compile_client(src, false)
}

/// The official compiler emits this for every variant below; before the fix the
/// process aborted instead.
const EXPECTED_EFFECT: &str = "$.legacy_pre_effect(() => {}, () => {";

fn assert_matches_official(out: &str) {
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(EXPECTED_EFFECT), "{out}");
    assert!(out.contains("$.set(bar, []);"), "{out}");
}

#[test]
fn block_comment_with_brace_in_reactive_block() {
    assert_matches_official(&client(
        "<script>\n\tlet bar\n\t$: {\n\t\t/* } c */\n\t\tbar = []\n\t}\n</script>",
    ));
}

#[test]
fn line_comment_with_brace_in_reactive_block() {
    assert_matches_official(&client(
        "<script>\n\tlet bar\n\t$: {\n\t\t// } c\n\t\tbar = []\n\t}\n</script>",
    ));
}

#[test]
fn block_comment_with_paren_in_reactive_block() {
    assert_matches_official(&client(
        "<script>\n\tlet bar\n\t$: {\n\t\t/* ) c */\n\t\tbar = []\n\t}\n</script>",
    ));
}

/// A `svelte-ignore` comment survives the reactive-statement comment stripper,
/// so these are the end-to-end inputs that still reach the scan. `dev` is
/// covered too: the crash was reported on both client targets.
#[test]
fn svelte_ignore_comment_with_delimiter_in_reactive_block() {
    for comment in [
        "// svelte-ignore } c",
        "// svelte-ignore ) c",
        "/* svelte-ignore } c */",
        "/* svelte-ignore ) c */",
    ] {
        let src =
            format!("<script>\n\tlet bar\n\t$: {{\n\t\t{comment}\n\t\tbar = []\n\t}}\n</script>");
        for dev in [false, true] {
            assert_matches_official(&compile_client(&src, dev));
        }
    }
}

/// A `=` inside a string literal is not an assignment either — the same scan
/// now skips literals, not only comments.
#[test]
fn equals_inside_a_string_is_not_an_assignment() {
    let out = client("<script>\n\tlet bar\n\t$: {\n\t\tbar = ['a=b'];\n\t}\n</script>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("$.set(bar, ['a=b'])"), "{out}");
}
