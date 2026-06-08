//! Regression test for issue #754.
//!
//! For `:is(a, b) + .c`, an `:is()` branch must be evaluated **in the context
//! of the surrounding combinator**, not in isolation. If only one branch can
//! satisfy the combinator relationship, the other branch is unused even though
//! a bare element matching it exists. The official Svelte compiler reports the
//! unreachable branch; rsvelte previously missed it (false negative). Verified
//! against `submodules/svelte` (v5.56.0).

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

fn unused(s: &str) -> Vec<String> {
    vec![format!("Unused CSS selector \"{s}\"")]
}

#[test]
fn adjacent_unreachable_branch_is_flagged() {
    // Order a,b,c → `.c` follows `.b` (`.b + .c` matches) but never `.a`.
    let src = "<div class=\"a\"></div><div class=\"b\"></div><div class=\"c\"></div>\n\
               <style>:is(.a, .b) + .c { color: red }</style>";
    assert_eq!(css_unused(src), unused(".a"));
}

#[test]
fn adjacent_unreachable_branch_reverse_order() {
    // Order b,a,c → now `.a + .c` matches, `.b + .c` is unreachable.
    let src = "<div class=\"b\"></div><div class=\"a\"></div><div class=\"c\"></div>\n\
               <style>:is(.a, .b) + .c { color: red }</style>";
    assert_eq!(css_unused(src), unused(".b"));
}

#[test]
fn general_sibling_both_branches_reachable() {
    // `~` allows any previous sibling, so both `.a ~ .c` and `.b ~ .c` match.
    let src = "<div class=\"a\"></div><div class=\"b\"></div><div class=\"c\"></div>\n\
               <style>:is(.a, .b) ~ .c { color: red }</style>";
    assert_eq!(css_unused(src), Vec::<String>::new());
}

#[test]
fn both_branches_adjacent_no_warning() {
    // Layout a,c,b,c → both `.a + .c` and `.b + .c` are satisfiable.
    let src = "<div class=\"a\"></div><div class=\"c\"></div><div class=\"b\"></div><div class=\"c\"></div>\n\
               <style>:is(.a, .b) + .c { color: red }</style>";
    assert_eq!(css_unused(src), Vec::<String>::new());
}

#[test]
fn is_alone_still_reports_absent_branch() {
    // Regression guard for #722: `:is(.a, .b)` with only `.a` → flag `.b`.
    let src = "<div class=\"a\"></div>\n<style>:is(.a, .b) { color: red }</style>";
    assert_eq!(css_unused(src), unused(".b"));
}
