//! Regression tests for #3595 — two CSS-pruning defects that run in opposite
//! directions, both about an attribute selector whose expected value is `""`.
//!
//! * A **valueless** attribute is `true` upstream, not `""`
//!   (`css-prune.js`: `if (attribute.value === true) return operator === null`),
//!   so `[f=""]`, `[f^=""]` and `[f*=""]` cannot match `<a data-flag>`. rsvelte
//!   compared against `""` and matched all three — an under-prune, so dead CSS
//!   shipped.
//! * `[f~=""]` DOES match an empty value, because upstream implements `~=` as
//!   `value.split(/\s/).includes(expected)` and `"".split(/\s/)` is `[""]`.
//!   rsvelte used `split_whitespace`, which yields nothing for `""` — an
//!   over-prune, which is the dangerous direction: a rule the author wrote and
//!   official ships was deleted.
//!
//! The `data-flag={v}` row is the control: with an unknown value every cell is
//! kept on both sides, so neither cause is "rsvelte gives up differently on a
//! dynamic value". Both matchers are ported twice — `2_analyze/css_scoping.rs`
//! and `3_transform/css.rs` — and no gate compares the two ports to each other.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `(css, warning codes)` for an `<a>` carrying `attr` and a rule on `selector`.
fn prune(attr: &str, selector: &str) -> (String, Vec<String>) {
    let src = format!(
        "<script>\n\tlet v = \"x\";\n</script>\n\n<a href=\"#\" {attr}>a</a>\n\n<style>\n\ta{selector} {{ color: red; }}\n</style>\n"
    );
    let r = compile(
        &src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile");
    (
        r.css.map(|c| c.code).unwrap_or_default(),
        r.warnings.into_iter().map(|w| w.code).collect(),
    )
}

fn assert_pruned(attr: &str, selector: &str) {
    let (css, warnings) = prune(attr, selector);
    assert!(css.contains("(unused)"), "{attr} / {selector}\nin:\n{css}");
    assert!(
        warnings.iter().any(|c| c == "css_unused_selector"),
        "{attr} / {selector}: {warnings:?}"
    );
}

fn assert_kept(attr: &str, selector: &str) {
    let (css, warnings) = prune(attr, selector);
    assert!(!css.contains("(unused)"), "{attr} / {selector}\nin:\n{css}");
    assert!(
        !warnings.iter().any(|c| c == "css_unused_selector"),
        "{attr} / {selector}: {warnings:?}"
    );
}

/// A valueless attribute is `true`: only the bare `[f]` form matches it.
#[test]
fn a_valueless_attribute_matches_no_operator() {
    assert_kept("data-flag", "[data-flag]");
    for selector in [
        "[data-flag=\"\"]",
        "[data-flag^=\"\"]",
        "[data-flag*=\"\"]",
        "[data-flag$=\"\"]",
        "[data-flag|=\"\"]",
        "[data-flag~=\"\"]",
    ] {
        assert_pruned("data-flag", selector);
    }
}

/// `data-flag={true}` is the row that proves the rule is about the VALUE being
/// `true` rather than about the attribute being written without one: official's
/// verdicts are identical across the two spellings.
#[test]
fn an_explicit_true_behaves_like_a_valueless_attribute() {
    assert_kept("data-flag={true}", "[data-flag]");
    assert_pruned("data-flag={true}", "[data-flag=\"\"]");
    assert_pruned("data-flag={true}", "[data-flag~=\"\"]");
}

/// The opposite direction: an EMPTY value is matched by `~=""`, because
/// upstream splits on `/\s/` and keeps the empty piece.
#[test]
fn an_empty_value_is_matched_by_tilde_equals_empty() {
    for attr in ["data-flag=\"\"", "data-flag={\"\"}"] {
        assert_kept(attr, "[data-flag~=\"\"]");
        assert_kept(attr, "[data-flag=\"\"]");
        assert_kept(attr, "[data-flag^=\"\"]");
    }
}

/// `~=` on a real value must still split, and must still miss.
#[test]
fn tilde_equals_still_splits_a_real_value() {
    assert_kept("data-flag=\"a b\"", "[data-flag~=\"a\"]");
    assert_kept("data-flag=\"a b\"", "[data-flag~=\"b\"]");
    assert_pruned("data-flag=\"a b\"", "[data-flag~=\"c\"]");
    assert_pruned("data-flag=\"x\"", "[data-flag~=\"\"]");
}

/// The control: an unknown value keeps every cell on both sides, so neither
/// fix can be explained by rsvelte giving up differently on a dynamic value.
#[test]
fn a_dynamic_value_keeps_everything() {
    for selector in [
        "[data-flag]",
        "[data-flag=\"\"]",
        "[data-flag^=\"\"]",
        "[data-flag*=\"\"]",
        "[data-flag~=\"\"]",
    ] {
        assert_kept("data-flag={v}", selector);
    }
}
