//! Regression test for issue #723.
//!
//! A `#id` CSS selector must not be reported as unused when the matching
//! element's `id` is set dynamically (`<div {id}>` shorthand or `id={expr}`).
//! Because the value is unknown at compile time it could equal any id, so the
//! selector must be treated as potentially-matching. The official Svelte
//! compiler emits no warning in these cases. Only a static `id="..."` should
//! be matched literally.

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
fn dynamic_id_shorthand_suppresses_unused() {
    let src = "<script>let id = 'editor';</script>\n\
               <div {id}></div>\n\
               <style>#editor { color: red }</style>";
    assert_eq!(css_unused(src), Vec::<String>::new());
}

#[test]
fn dynamic_id_expression_suppresses_unused() {
    let src = "<script>let x = 'editor';</script>\n\
               <div id={x}></div>\n\
               <style>#editor { color: red }</style>";
    assert_eq!(css_unused(src), Vec::<String>::new());
}

#[test]
fn interpolated_id_suppresses_unused() {
    let src = "<script>let x = 'tor';</script>\n\
               <div id=\"edi{x}\"></div>\n\
               <style>#editor { color: red }</style>";
    assert_eq!(css_unused(src), Vec::<String>::new());
}

#[test]
fn static_id_match_still_no_warning() {
    let src = "<div id=\"editor\"></div>\n<style>#editor { color: red }</style>";
    assert_eq!(css_unused(src), Vec::<String>::new());
}

#[test]
fn static_id_mismatch_still_warns() {
    // No dynamic id anywhere → a genuinely-unmatched #id must still warn.
    let src = "<div id=\"editor\"></div>\n<style>#missing { color: red }</style>";
    assert_eq!(
        css_unused(src),
        vec!["Unused CSS selector \"#missing\"".to_string()]
    );
}
