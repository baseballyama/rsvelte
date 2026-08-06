//! Issue #2351: a `}` / `)` inside a comment in a `$:` block body crashed the
//! client compiler.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
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

/// A `=` inside a string literal is not an assignment either — the same scan
/// now skips literals, not only comments.
#[test]
fn equals_inside_a_string_is_not_an_assignment() {
    let out = client("<script>\n\tlet bar\n\t$: {\n\t\tbar = ['a=b'];\n\t}\n</script>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("$.set(bar, ['a=b'])"), "{out}");
}
