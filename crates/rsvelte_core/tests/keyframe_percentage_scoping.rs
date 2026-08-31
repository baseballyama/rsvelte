//! A `@keyframes` percentage step scopes elements through the normal selector
//! walk, not by a whole-component flag.
//!
//! Upstream's prune skips a `Percentage` selector inside
//! `relative_selector_might_apply_to_node` (`css-prune.js:509` — a `continue`,
//! not a short circuit), so the step's rule still has to satisfy its parent
//! rule chain. A step nested in a rule that matches nothing scopes nothing, and
//! a step nested in a rule that matches one element does not reach that
//! element's siblings.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// The scope class is hashed per component, so compare the SHAPE of the class
/// attributes rather than the hash.
fn scoped_classes(source: &str) -> Vec<String> {
    let js = compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;

    let mut out = Vec::new();
    let mut rest = js.as_str();
    while let Some(at) = rest.find("class=\"") {
        rest = &rest[at + 7..];
        let Some(end) = rest.find('"') else { break };
        let value = &rest[..end];
        if value.contains("svelte-") {
            let normalized: Vec<&str> = value
                .split_whitespace()
                .map(|token| {
                    if token.starts_with("svelte-") {
                        "S"
                    } else {
                        token
                    }
                })
                .collect();
            out.push(normalized.join(" "));
        }
        rest = &rest[end..];
    }
    out
}

const TEMPLATE: &str = "<div class=\"wrapper\"></div>\n<p></p>\n";

fn with_style(style: &str) -> String {
    format!("{TEMPLATE}\n<style>\n{style}\n</style>\n")
}

const STEP: &str = "@keyframes k {\n\t\t\t0% { opacity: 0 }\n\t\t}";

/// A step under a rule that matches nothing must scope nothing.
#[test]
fn a_step_under_an_unmatched_rule_scopes_nothing() {
    let out = scoped_classes(&with_style(&format!("\t.n1 {{\n\t\t{STEP}\n\t}}")));
    assert!(out.is_empty(), "{out:?}");
}

/// The discriminating case: the sibling `<p>` is NOT under `.wrapper`, so the
/// step cannot reach it. A rule keyed on "is the rule used" would scope both.
#[test]
fn a_step_under_a_matched_rule_does_not_reach_a_sibling() {
    let out = scoped_classes(&with_style(&format!("\t.wrapper {{\n\t\t{STEP}\n\t}}")));
    assert_eq!(out, vec!["wrapper S".to_string()]);
}

/// With no parent rule there is nothing to satisfy, so every element matches.
#[test]
fn a_top_level_step_scopes_every_element() {
    let out = scoped_classes(&with_style("\t@keyframes k {\n\t\t0% { opacity: 0 }\n\t}"));
    assert_eq!(out, vec!["wrapper S".to_string(), "S".to_string()]);
}

/// An at-rule is not a rule, so it constrains nothing either.
#[test]
fn a_step_under_an_at_rule_scopes_every_element() {
    let out = scoped_classes(&with_style(&format!(
        "\t@media screen {{\n\t\t{STEP}\n\t}}"
    )));
    assert_eq!(out, vec!["wrapper S".to_string(), "S".to_string()]);
}

/// `from` / `to` are type selectors, so they match no element anywhere — the
/// control that says the axis is the percentage, not the `@keyframes`.
#[test]
fn from_and_to_steps_scope_nothing() {
    let nested = scoped_classes(&with_style(
        "\t.n1 {\n\t\t@keyframes k {\n\t\t\tfrom { opacity: 0 }\n\t\t}\n\t}",
    ));
    assert!(nested.is_empty(), "{nested:?}");
    let top = scoped_classes(&with_style(
        "\t@keyframes k {\n\t\tfrom { opacity: 0 }\n\t}",
    ));
    assert!(top.is_empty(), "{top:?}");
}

/// Ordinary scoping is unchanged — without this the tests above are satisfied
/// by a build that scopes nothing at all.
#[test]
fn an_ordinary_matching_rule_still_scopes() {
    let out = scoped_classes(&with_style("\t.wrapper { color: red }"));
    assert_eq!(out, vec!["wrapper S".to_string()]);
}
