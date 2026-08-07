//! Pins CSS scoping for descendant and child combinators, and the pruning of a
//! selector no element matches.
//!
//! This replaces two `#[cfg(test)]` tests in `3_transform/css.rs` that built a
//! `CssContext` by hand with an empty `used_elements` set. Every selector was
//! therefore pruned as `(unused)`, so the combinator-scoping path the tests were
//! named for was never reached — and neither asserted on the output it printed.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css(src: &str) -> String {
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
    .css
    .map(|c| c.code)
    .unwrap_or_default()
}

/// The scoping hash is content-derived, so normalise it and pin the exact
/// selector shape rather than merely "a hash appears somewhere".
fn norm(out: &str) -> String {
    let mut s = String::with_capacity(out.len());
    let mut rest = out;
    while let Some(i) = rest.find("svelte-") {
        s.push_str(&rest[..i]);
        s.push_str("svelte-H");
        rest = &rest[i + "svelte-".len()..];
        let end = rest
            .find(|c: char| !c.is_ascii_alphanumeric())
            .unwrap_or(rest.len());
        rest = &rest[end..];
    }
    s.push_str(rest);
    s
}

#[test]
fn a_matched_element_selector_is_scoped_not_pruned() {
    let out = css("<div>red</div>\n\n<style>\n\tdiv {\n\t\tcolor: red;\n\t}\n</style>");
    assert!(
        !out.contains("(unused)"),
        "`div` is present in the markup, so the rule must be kept:\n{out}"
    );
    assert!(
        norm(&out).contains("div.svelte-H"),
        "the kept rule must carry the scoping class:\n{out}"
    );
}

#[test]
fn descendant_and_child_combinators_are_both_scoped() {
    let out = css("<main><div><button>Blue</button></div></main>\n\n\
         <style>\n\
         \tmain button {\n\t\tbackground-color: red;\n\t}\n\
         \tmain div > button {\n\t\tbackground-color: blue;\n\t}\n\
         </style>");
    assert!(
        !out.contains("(unused)"),
        "both rules match the markup, so neither may be pruned:\n{out}"
    );
    let out = norm(&out);
    assert!(
        out.contains("main.svelte-H button:where(.svelte-H)"),
        "the descendant-combinator rule must scope both compounds:\n{out}"
    );
    assert!(
        out.contains("main.svelte-H div:where(.svelte-H) > button:where(.svelte-H)"),
        "the child combinator must survive with every compound scoped:\n{out}"
    );
}

/// Negative control: without this, an implementation that kept and scoped
/// everything unconditionally would satisfy both tests above.
#[test]
fn a_selector_no_element_matches_is_pruned() {
    let out = css("<div>red</div>\n\n<style>\n\tsection {\n\t\tcolor: red;\n\t}\n</style>");
    assert!(
        out.contains("(unused)"),
        "no `section` element exists, so the rule must be pruned:\n{out}"
    );
}
