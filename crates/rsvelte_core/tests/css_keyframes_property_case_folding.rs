//! `animation` / `animation-name` is matched case-insensitively under the *Unicode*
//! mapping, because upstream reaches it through `node.property.toLowerCase()` and
//! its CSS parser reads a property with `read_until(REGEX_WHITESPACE_OR_COLON)` —
//! so a non-ASCII character can occupy the property name. U+212A KELVIN SIGN is
//! the only scalar that lowers to an ASCII letter one of these names contains
//! (`k`, in `-webkit-`), which an ASCII-only comparison would silently stop
//! matching.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css_for(property: &str) -> String {
    let source = format!(
        "<div class=\"a\"></div>\n\
         <style>\n\
         \t@keyframes fade {{ from {{ opacity: 0; }} to {{ opacity: 1; }} }}\n\
         \t.a {{ {property}: fade 1s; }}\n\
         </style>\n"
    );
    compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .css
    .map(|c| c.code)
    .unwrap_or_default()
}

/// The scoped keyframe name is `<hash>-fade`; assert the reference was rewritten
/// rather than pinning a hash this test does not own.
fn renamed(css: &str) -> bool {
    css.contains("-fade 1s")
}

#[test]
fn lowercase_animation_renames_the_keyframe_reference() {
    let css = css_for("animation");
    assert!(renamed(&css), "expected a rewritten reference, got:\n{css}");
}

#[test]
fn ascii_uppercase_animation_renames_the_keyframe_reference() {
    let css = css_for("ANIMATION");
    assert!(renamed(&css), "expected a rewritten reference, got:\n{css}");
}

#[test]
fn kelvin_sign_in_webkit_prefix_still_renames_the_keyframe_reference() {
    let css = css_for("-WEB\u{212A}IT-ANIMATION");
    assert!(
        renamed(&css),
        "U+212A lowers to `k`, so this is `-webkit-animation` to upstream; got:\n{css}"
    );
}

#[test]
fn a_longhand_that_merely_shares_the_prefix_is_not_an_animation_property() {
    let css = css_for("animation-duration");
    assert!(
        !renamed(&css),
        "`animation-duration` is neither `animation` nor `animation-name`; got:\n{css}"
    );
}
