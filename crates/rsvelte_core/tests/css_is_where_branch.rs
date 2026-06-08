//! Regression test for issue #722.
//!
//! `:is()` / `:where()` is an OR-set: it matches when **any** argument branch
//! matches. The unused-CSS-selector check must therefore (a) treat a compound
//! containing `:is(...)` as *used* whenever one branch is reachable — including
//! across sibling combinators — and (b) report only the genuinely-unreachable
//! individual branch, not the whole compound.
//!
//! Note: the original issue report expected **0 warnings** for these cases, but
//! the official Svelte compiler in fact reports the unused *branch* (e.g. `.b`).
//! The real bug was that rsvelte over-reported the whole `:is(.a, .b) + .c`
//! compound instead of just `.b`. These assertions match the official compiler
//! (verified against `submodules/svelte`, v5.56.0).

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
fn is_with_adjacent_sibling_reports_only_unused_branch() {
    // `.a` and `.c` are present and adjacent → the compound is used;
    // only the unreachable `.b` branch is reported (not the whole selector).
    let src = "<div class=\"a\"></div><div class=\"c\"></div>\n\
               <style>:is(.a, .b) + .c { color: red }</style>";
    assert_eq!(css_unused(src), unused(".b"));
}

#[test]
fn is_alone_reports_only_unused_branch() {
    let src = "<div class=\"a\"></div>\n<style>:is(.a, .b) { color: red }</style>";
    assert_eq!(css_unused(src), unused(".b"));
}

#[test]
fn where_alone_reports_only_unused_branch() {
    let src = "<div class=\"a\"></div>\n<style>:where(.a, .b) { color: red }</style>";
    assert_eq!(css_unused(src), unused(".b"));
}

#[test]
fn is_descendant_no_match_reports_whole() {
    // No descendant of `div` matches `.a`/`.b` → whole selector unused.
    let src = "<div class=\"a\"></div>\n<style>div :is(.a, .b) { color: red }</style>";
    assert_eq!(css_unused(src), unused("div :is(.a, .b)"));
}

#[test]
fn is_sibling_no_branch_present_reports_whole() {
    // Neither branch is present → whole compound unused.
    let src = "<style>:is(.x, .y) + .c { color: red }</style>";
    assert_eq!(css_unused(src), unused(":is(.x, .y) + .c"));
}

#[test]
fn is_adjacent_sibling_not_adjacent_reports_whole() {
    // `.a` present but not adjacent to `.c` (a `<span>` sits between) → the `+`
    // relationship fails, so the whole compound is unused.
    let src = "<div class=\"a\"></div><span></span><div class=\"c\"></div>\n\
               <style>:is(.a, .b) + .c { color: red }</style>";
    assert_eq!(css_unused(src), unused(":is(.a, .b) + .c"));
}

#[test]
fn is_general_sibling_reports_only_unused_branch() {
    // `~` allows a non-adjacent previous sibling, so the compound is used; only
    // the unreachable `.b` is reported.
    let src = "<div class=\"a\"></div><span></span><div class=\"c\"></div>\n\
               <style>:is(.a, .b) ~ .c { color: red }</style>";
    assert_eq!(css_unused(src), unused(".b"));
}

#[test]
fn is_with_multipart_branch_is_used() {
    // A multi-part branch (`.a .nope`) is treated conservatively as matching, so
    // the compound is used; only the simple unreachable `.b` is reported.
    let src = "<div class=\"a\"></div><div class=\"c\"></div>\n\
               <style>:is(.a .nope, .b) + .c { color: red }</style>";
    assert_eq!(css_unused(src), unused(".b"));
}
