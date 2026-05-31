//! Issue #455 H-160/H-161: generated template literals must escape backticks /
//! `${` in user text. The multi-node `<title>` path and the mixed client
//! attribute / style value paths now route through `sanitize_template_string`.

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

/// H-160: a backtick in multi-node `<title>` text must be escaped in the
/// generated template literal.
#[test]
fn title_text_backtick_is_escaped() {
    let out =
        client("<script>let x = 1;</script>\n<svelte:head><title>a`b {x}</title></svelte:head>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(r"a\`b"), "title backtick not escaped: {out}");
}

/// H-161: a backtick in a mixed attribute value must be escaped in the generated
/// template literal. A prop keeps the value dynamic so it stays a template
/// literal (a const would fold to a plain single-quoted string).
#[test]
fn attribute_value_backtick_is_escaped() {
    let out = client("<script>export let x;</script>\n<div data-x=\"a`b {x}\"></div>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains(r"a\`b"),
        "attribute backtick not escaped: {out}"
    );
}

/// H-161: a backtick in a mixed `style:` directive value must be escaped too.
#[test]
fn style_directive_value_backtick_is_escaped() {
    let out = client("<script>export let x;</script>\n<div style:color=\"a`b {x}\"></div>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains(r"a\`b"),
        "style directive backtick not escaped: {out}"
    );
}
