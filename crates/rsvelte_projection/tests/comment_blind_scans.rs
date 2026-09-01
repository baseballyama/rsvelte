//! A raw-text scan in `svelte2tsx` reading code out of a comment or a literal.
//!
//! Upstream needs no such rule: `findNextVerbatimElement` opens its regex with a
//! `(<!--[^]*?-->)` arm and skips any match that starts with it, `ComponentEvents`
//! walks the TypeScript AST, and `Stores` is fed by the Svelte AST walk. Three
//! scans here answered from bytes instead, so a commented-out `<script>`, a
//! `dispatch(…)` inside a comment, and a `$name` inside a template expression's
//! comment or literal all reached the output.
//!
//! Every expectation is **official `svelte2tsx`'s own output** for the same
//! source (`data/svelte2tsx_comment_blind_scans.json`); regenerate it with the
//! official tool rather than editing it by hand. One test per case, because a
//! single "all cases agree" assertion is satisfied by the other fifteen.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn check(name: &str) {
    let fixture: serde_json::Value =
        serde_json::from_str(include_str!("data/svelte2tsx_comment_blind_scans.json"))
            .expect("fixture parses");
    let case = fixture["cases"]
        .as_array()
        .expect("cases array")
        .iter()
        .find(|case| case["name"].as_str() == Some(name))
        .unwrap_or_else(|| panic!("fixture has no case named `{name}`"));
    let mut options = fixture["options"].clone();
    options["filename"] = serde_json::Value::String(format!("{name}.svelte"));
    let result = svelte2tsx(
        case["source"].as_str().expect("source"),
        Svelte2TsxOptions::from_json(&options),
    )
    .expect("projection succeeds");
    let expected = case["expected"].as_str().expect("expected");
    assert_eq!(
        result.code, expected,
        "`{name}` diverges from official svelte2tsx"
    );
}

#[test]
fn html_comment_script_with_instance() {
    check("html-comment-script-with-instance");
}

#[test]
fn html_comment_script_no_instance() {
    check("html-comment-script-no-instance");
}

#[test]
fn html_comment_script_uppercase() {
    check("html-comment-script-uppercase");
}

#[test]
fn module_script_is_not_a_comment() {
    check("module-script-is-not-a-comment");
}

#[test]
fn dispatch_line_comment() {
    check("dispatch-line-comment");
}

#[test]
fn dispatch_block_comment() {
    check("dispatch-block-comment");
}

#[test]
fn dispatch_jsdoc_comment() {
    check("dispatch-jsdoc-comment");
}

#[test]
fn dispatch_string_literal() {
    check("dispatch-string-literal");
}

#[test]
fn dispatch_template_literal() {
    check("dispatch-template-literal");
}

#[test]
fn dispatch_in_html_comment() {
    check("dispatch-in-html-comment");
}

#[test]
fn dispatch_in_template_expression_comment() {
    check("dispatch-in-template-expression-comment");
}

#[test]
fn dispatch_live_call_is_collected() {
    check("dispatch-live-call-is-collected");
}

#[test]
fn store_in_template_expression_line_comment() {
    check("store-in-template-expression-line-comment");
}

#[test]
fn store_in_template_expression_block_comment() {
    check("store-in-template-expression-block-comment");
}

#[test]
fn store_in_template_expression_template_literal() {
    check("store-in-template-expression-template-literal");
}

// A regex literal carrying an odd number of quotes desynchronizes a quote-pairing
// scan of a template expression, so the run swallows the markup after it.
#[test]
fn store_after_regex_with_quotes_in_const_tag() {
    check("store-after-regex-with-quotes-in-const-tag");
}

#[test]
fn store_after_plain_call_in_const_tag() {
    check("store-after-plain-call-in-const-tag");
}

#[test]
fn store_live_read_is_collected() {
    check("store-live-read-is-collected");
}
