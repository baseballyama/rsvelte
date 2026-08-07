//! A nested rule without an explicit `&` must match only where its enclosing
//! selectors match an *ancestor*.
//!
//! Upstream `get_relative_selectors` prepends an implicit `&` + descendant
//! combinator, so `.grand { .foo { … } }` resolves to `.grand .foo` and
//! `apply_selector` walks the real ancestor chain. rsvelte only asked whether
//! `.grand` matched *some* element in the component, so a `.grand` that exists
//! as a sibling kept the whole nest alive and its `css_unused_selector`
//! warnings were never emitted.
//!
//! Every expectation below is the official compiler's output for the same
//! source (Svelte 5.56.8, `{ generate: 'client', css: 'external' }`).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css_unused(src: &str) -> Vec<String> {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
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

fn warns(selectors: &[&str]) -> Vec<String> {
    selectors
        .iter()
        .map(|s| format!("Unused CSS selector \"{s}\""))
        .collect()
}

#[test]
fn outer_rule_of_unused_nest_warns() {
    // `.grand` exists, but as a sibling of `.foo` — the nest is unreachable.
    let src = "<div class=\"grand\"></div><div class=\"foo\"><div class=\"a\"></div><div class=\"a\"></div></div>\n\
               <style>\n\t.grand {\n\t\t.foo > .a { & + & { color: red; } }\n\t}\n</style>";
    assert_eq!(css_unused(src), warns(&[".foo > .a", "& + &"]));
}

#[test]
fn outer_rule_of_used_nest_does_not_warn() {
    // Positive control: the same stylesheet with `.grand` as a real ancestor.
    let src = "<div class=\"grand\"><div class=\"foo\"><div class=\"a\"></div><div class=\"a\"></div></div></div>\n\
               <style>\n\t.grand {\n\t\t.foo > .a { & + & { color: red; } }\n\t}\n</style>";
    assert_eq!(css_unused(src), Vec::<String>::new());
}

#[test]
fn nested_selector_needs_an_ancestor_not_just_an_occurrence() {
    let sibling = "<div class=\"grand\"></div><div class=\"foo\"></div>\n\
                   <style>.grand { .foo { color: red; } }</style>";
    assert_eq!(css_unused(sibling), warns(&[".foo"]));

    let ancestor = "<div class=\"grand\"><div class=\"foo\"></div></div>\n\
                    <style>.grand { .foo { color: red; } }</style>";
    assert_eq!(css_unused(ancestor), Vec::<String>::new());
}

#[test]
fn implicit_ancestor_link_is_a_descendant_not_a_child() {
    // `.grand .foo` matches through an intermediate element...
    let indirect = "<div class=\"grand\"><span><div class=\"foo\"></div></span></div>\n\
                    <style>.grand { .foo { color: red; } }</style>";
    assert_eq!(css_unused(indirect), Vec::<String>::new());

    // ...but an explicit `>` head keeps its own combinator.
    let child = "<div class=\"grand\"><span><div class=\"foo\"></div></span></div>\n\
                 <style>.grand { > .foo { color: red; } }</style>";
    assert_eq!(css_unused(child), warns(&["> .foo"]));
}

#[test]
fn every_unreachable_level_warns() {
    let src = "<div class=\"grand\"></div><div class=\"foo\"><div class=\"a\"></div></div>\n\
               <style>.grand { .foo { .a { color: red; } } }</style>";
    assert_eq!(css_unused(src), warns(&[".foo", ".a"]));
}

#[test]
fn comma_branches_are_ored_across_levels() {
    // `.a` is reachable through the `.foo` branch of the outer selector list.
    let src = "<div class=\"grand\"></div><div class=\"foo\"><div class=\"a\"></div></div>\n\
               <style>.grand, .foo { .a { color: red; } }</style>";
    assert_eq!(css_unused(src), Vec::<String>::new());
}

#[test]
fn an_at_rule_between_levels_keeps_the_ancestor_link() {
    let src = "<div class=\"grand\"></div><div class=\"foo\"></div>\n\
               <style>.grand { @media (min-width: 1px) { .foo { color: red; } } }</style>";
    assert_eq!(css_unused(src), warns(&[".foo"]));
}

#[test]
fn a_dynamic_class_on_a_non_ancestor_does_not_rescue_the_nest() {
    // `class={cls}` could be `grand`, but that element is still not an ancestor.
    let src = "<script>let cls = \"grand\";</script><div class={cls}></div><div class=\"foo\"></div>\n\
               <style>.grand { .foo { color: red; } }</style>";
    assert_eq!(css_unused(src), warns(&[".foo"]));
}

#[test]
fn an_unevaluable_enclosing_selector_stays_conservative() {
    // `:global(.grand)` can match outside the component: no ancestor claim.
    let src = "<div class=\"foo\"></div>\n\
               <style>:global(.grand) { .foo { color: red; } }</style>";
    assert_eq!(css_unused(src), Vec::<String>::new());
}
