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

#[test]
fn block_comment_with_brace_in_reactive_block() {
    let out = client("<script>\n\tlet bar\n\t$: {\n\t\t/* } c */\n\t\tbar = []\n\t}\n</script>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("legacy_pre_effect"), "{out}");
}

#[test]
fn line_comment_with_brace_in_reactive_block() {
    let out = client("<script>\n\tlet bar\n\t$: {\n\t\t// } c\n\t\tbar = []\n\t}\n</script>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
}

#[test]
fn block_comment_with_paren_in_reactive_block() {
    let out = client("<script>\n\tlet bar\n\t$: {\n\t\t/* ) c */\n\t\tbar = []\n\t}\n</script>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
}
