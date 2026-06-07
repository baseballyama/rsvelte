//! Regression test for issue #720.
//!
//! A nested `&.CLASS` selector must not be reported as an unused CSS selector
//! when `CLASS` is applied via a `class:CLASS={...}` directive (rather than a
//! static `class="..."` attribute). `&.active` expands to `.box.active`, and
//! the element can carry `active` at runtime through the directive, so the
//! selector is reachable. The official Svelte compiler emits no warning here.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css_unused(src: &str) -> Vec<String> {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
    .iter()
    .filter(|w| w.code == "css_unused_selector")
    .map(|w| w.message.lines().next().unwrap_or("").to_string())
    .collect()
}

#[test]
fn nesting_compound_with_class_directive_is_used() {
    // `&.active` reachable via `class:active` directive — no warning.
    let src = "<script>let on = true;</script>\n\
               <div class=\"box\" class:active={on}></div>\n\
               <style>.box { color: red; &.active { color: blue; } }</style>";
    assert_eq!(css_unused(src), Vec::<String>::new());
}

#[test]
fn nesting_compound_with_static_class_is_used() {
    // Control: the static-class form was already correct.
    let src = "<div class=\"box active\"></div>\n\
               <style>.box { color: red; &.active { color: blue; } }</style>";
    assert_eq!(css_unused(src), Vec::<String>::new());
}

#[test]
fn nesting_compound_truly_unused_still_warns() {
    // `&.missing` is genuinely unreachable (no static class, no directive) — must warn.
    let src = "<div class=\"box\"></div>\n\
               <style>.box { color: red; &.missing { color: blue; } }</style>";
    assert_eq!(
        css_unused(src),
        vec!["Unused CSS selector \"&.missing\"".to_string()]
    );
}
