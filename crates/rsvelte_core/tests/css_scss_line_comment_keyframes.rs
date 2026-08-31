//! `//` is not a CSS comment, so upstream's `read_declaration` takes it as the
//! property and everything through the `;` as the value. `Declaration` in
//! `3-transform/css/index.js` then tests `property === 'animation'`, which is
//! false, and the `animation` on the *next* line is never renamed — while the
//! `@keyframes` it points at is. The emitted stylesheet references a keyframe
//! that does not exist; see
//! `upstream_issues/svelte-scss-line-comment-hides-an-animation-name-from-keyframe-scoping.md`.
//!
//! rsvelte scanned the emitted text for `animation`, skipping only `/* … */`,
//! so it renamed the reference and diverged. Byte equality is the goal, so the
//! upstream output is what is pinned here — every expectation below is
//! `svelte.compile`'s own (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css(body: &str) -> String {
    let source = format!("<p class=\"a\">x</p>\n\n<style lang=\"scss\">{body}</style>\n");
    let out = compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{body}: {err:?}"))
    .css
    .map(|c| c.code)
    .unwrap_or_default();
    let Some(start) = out.find("svelte-") else {
        return out;
    };
    let len = out[start..]
        .char_indices()
        .find(|(i, c)| *i > 0 && !c.is_ascii_alphanumeric() && *c != '-')
        .map_or(out.len() - start, |(i, _)| i);
    out.replace(&out[start..start + len], "HASH")
}

const TAIL: &str = "\n\n\t@keyframes spin {\n\t\tfrom { opacity: 0 }\n\t}\n";

#[test]
fn a_line_comment_before_the_declaration_leaves_the_reference_unscoped() {
    let out = css(&format!(
        "\n\t.a {{\n\t\t// draw it\n\t\tanimation: spin 1s;\n\t}}{TAIL}"
    ));
    assert!(out.contains("animation: spin 1s;"), "{out}");
    assert!(out.contains("@keyframes HASH-spin"), "{out}");
}

#[test]
fn a_block_comment_or_no_comment_still_scopes_the_reference() {
    // The controls. Only the `//` shape reaches the property-position quirk, so
    // "skip a line comment" must not be read as "stop renaming references".
    for body in [
        format!("\n\t.a {{\n\t\t/* draw it */\n\t\tanimation: spin 1s;\n\t}}{TAIL}"),
        format!("\n\t.a {{\n\t\tanimation: spin 1s;\n\t}}{TAIL}"),
    ] {
        let out = css(&body);
        assert!(out.contains("animation: HASH-spin 1s;"), "{out}");
        assert!(out.contains("@keyframes HASH-spin"), "{out}");
    }
}
