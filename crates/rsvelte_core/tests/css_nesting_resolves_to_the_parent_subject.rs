//! `&` stands for the parent selector, and the element it names is the parent's
//! SUBJECT — its last relative selector. The phase-3 sibling prune resolved `&`
//! only when the parent prelude held a SINGLE relative selector, so under
//! `.a + .b { & + .c { … } }` the `&` stayed unresolved, the sibling test had
//! nothing to match on, and a rule the official compiler keeps was commented
//! out as `/* (unused) */`.
//!
//! This is the phase-3 half of a decision upstream makes once, in
//! `2-analyze/css/css-prune.js`; `2_analyze/css_scoping.rs` is the other port
//! and expands `&` correctly. Every expectation below is the official
//! compiler's own output (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const MARKUP: &str = "<label>\n  <input class=\"checkbox\" />\n  <div class=\"checkbox-element\"></div>\n  <div class=\"checkbox-label\"></div>\n</label>\n";

fn css(body: &str) -> String {
    let source = format!("{MARKUP}\n<style>{body}</style>\n");
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
    .unwrap_or_else(|err| panic!("{body}: {err:?}"))
    .css
    .map(|c| c.code)
    .unwrap_or_default()
}

#[test]
fn a_sibling_under_a_two_relative_parent_is_used() {
    let out = css(
        "\n\t.checkbox {\n\t\t& + .checkbox-element {\n\t\t\tcolor: red;\n\n\t\t\t& + .checkbox-label {\n\t\t\t\tcolor: blue;\n\t\t\t}\n\t\t}\n\t}\n",
    );
    assert!(out.contains("& + .checkbox-label:where("), "{out}");
    assert!(!out.contains("(unused)"), "{out}");
}

#[test]
fn a_sibling_that_really_has_no_match_is_still_pruned() {
    // The control for the over-prune fix: resolving `&` must not make every
    // nested sibling rule "used".
    let out = css(
        "\n\t.checkbox {\n\t\t& + .checkbox-element {\n\t\t\tcolor: red;\n\n\t\t\t& + .missing {\n\t\t\t\tcolor: blue;\n\t\t\t}\n\t\t}\n\t}\n",
    );
    assert!(out.contains("/* (unused) & + .missing {"), "{out}");
}

#[test]
fn a_single_relative_parent_still_resolves_the_same_way() {
    // The shape that already worked. `.checkbox + .checkbox-label` is not
    // adjacent in the markup, so the whole rule ends up empty — which is a
    // different verdict from `(unused)` and pins that the two do not swap.
    let out = css("\n\t.checkbox {\n\t\t& + .checkbox-label {\n\t\t\tcolor: blue;\n\t\t}\n\t}\n");
    assert!(out.contains("/* (empty) .checkbox {"), "{out}");
}
