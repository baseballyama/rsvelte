//! Upstream raises `bidirectional_control_characters` from three visitors —
//! `Text`, `Literal` and `TemplateElement` — and zimmerframe reaches all three
//! everywhere in the AST. rsvelte ran `Text` on fragment text only and never ran
//! `Literal` / `TemplateElement` over a *template* expression, so every
//! attribute value and every string inside `{...}` was silent.
//!
//! Every expectation here was read off the official compiler
//! (`submodules/svelte`), one input per process — the upstream regex carries the
//! `g` flag and `.test()` advances its `lastIndex`, so a multi-case run in one
//! process reports a different answer than a real compile does.

use rsvelte_core::{CompileOptions, GenerateMode, Warning, compile};

/// U+202E RIGHT-TO-LEFT OVERRIDE.
const RLO: &str = "\u{202e}";

fn warnings(src: &str) -> Vec<Warning> {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
}

/// `line:column` of every bidi warning, in emission order.
fn bidi(src: &str) -> Vec<String> {
    warnings(src)
        .iter()
        .filter(|w| w.code == "bidirectional_control_characters")
        .map(|w| {
            let pos = w.start.as_ref().expect("warning has a start position");
            format!("{}:{}", pos.line, pos.column)
        })
        .collect()
}

#[test]
fn an_attribute_value_is_walked() {
    assert_eq!(bidi(&format!("<b title=\"a{RLO}b\">x</b>")), ["1:11"]);
    assert_eq!(bidi(&format!("<b title='a{RLO}b'>x</b>")), ["1:11"]);
    assert_eq!(bidi(&format!("<b title=a{RLO}b>x</b>")), ["1:10"]);
    // The offset is into the *decoded* data, so an entity ahead of the match
    // shifts the reported column.
    assert_eq!(bidi(&format!("<b title=\"&amp;a{RLO}b\">x</b>")), ["1:12"]);
}

#[test]
fn every_attribute_host_is_walked() {
    // A component, a `<svelte:element>` and a `<slot>` reach the same `Text`
    // visitor upstream, so the host must not decide whether the rule runs.
    assert_eq!(
        bidi(&format!(
            "<script>import C from './C.svelte';</script><C title=\"a{RLO}b\" />"
        )),
        ["1:55"]
    );
    assert_eq!(
        bidi(&format!(
            "<svelte:element this=\"div\" title=\"a{RLO}b\">x</svelte:element>"
        )),
        ["1:35"]
    );
    assert_eq!(bidi(&format!("<slot name=\"a{RLO}b\" />")), ["1:13"]);
    // A `style:` directive's value is a `Text` node too.
    assert_eq!(bidi(&format!("<b style:color=\"a{RLO}b\">x</b>")), ["1:17"]);
}

#[test]
fn a_template_expression_literal_is_walked() {
    assert_eq!(bidi(&format!("<b>{{\"a{RLO}b\"}}</b>")), ["1:4"]);
    assert_eq!(bidi(&format!("<b title={{\"a{RLO}b\"}}>x</b>")), ["1:10"]);
    assert_eq!(bidi(&format!("<b class:x={{\"a{RLO}b\"}}>y</b>")), ["1:12"]);
    assert_eq!(
        bidi(&format!("{{#each [\"a{RLO}b\"] as v}}{{v}}{{/each}}")),
        ["1:8"]
    );
    assert_eq!(bidi(&format!("{{@html \"a{RLO}b\"}}")), ["1:7"]);
    assert_eq!(bidi(&format!("{{#if \"a{RLO}b\"}}x{{/if}}")), ["1:5"]);
}

#[test]
fn a_template_literal_quasi_is_walked() {
    assert_eq!(bidi(&format!("<b>{{`a{RLO}b`}}</b>")), ["1:5"]);
    assert_eq!(bidi(&format!("<b title={{`a{RLO}b`}}>x</b>")), ["1:11"]);
}

#[test]
fn the_slots_upstream_does_not_walk_stay_silent() {
    // Comments are not `Text` / `Literal` nodes in any of the three positions.
    assert!(bidi(&format!("<script>// a{RLO}b\nlet s = 1;</script>")).is_empty());
    assert!(bidi(&format!("<!-- a{RLO}b -->")).is_empty());
    assert!(
        bidi(&format!(
            "<style>/* a{RLO}b */ b{{color:red}}</style><b>x</b>"
        ))
        .is_empty()
    );
}

#[test]
fn a_script_literal_still_warns() {
    // The over-fire reported in #3227 is not one: official warns here too. This
    // is the control that keeps the fix from being "delete the script arm".
    assert_eq!(
        bidi(&format!(
            "<script>let s = \"a{RLO}b\";</script>\n<b>{{s}}</b>"
        )),
        ["1:16"]
    );
    assert_eq!(
        bidi(&format!("<script module>let s = \"a{RLO}b\";</script>")),
        ["1:23"]
    );
}

#[test]
fn svelte_ignore_still_suppresses_the_new_slots() {
    assert!(
        bidi(&format!(
            "<!-- svelte-ignore bidirectional_control_characters -->\n<b title=\"a{RLO}b\">x</b>"
        ))
        .is_empty()
    );
    assert!(
        bidi(&format!(
            "<!-- svelte-ignore bidirectional_control_characters -->\n<b>{{\"a{RLO}b\"}}</b>"
        ))
        .is_empty()
    );
}

#[test]
fn an_attribute_and_an_expression_both_report() {
    assert_eq!(
        bidi(&format!("<b title=\"a{RLO}b\">{{\"c{RLO}d\"}}</b>")),
        ["1:11", "1:16"]
    );
    assert_eq!(
        bidi(&format!("<b>{{\"c{RLO}d\"}}</b><i title=\"a{RLO}b\">y</i>")),
        ["1:4", "1:25"]
    );
}
