//! Upstream's `get_static_value` yields `null | true | string` and its
//! `get_static_text_value` maps the `true` case back to `null`; rsvelte had a
//! single helper that stringified a valueless attribute into `"true"`, so
//! `<div role>` looked like `role="true"` (an unknown role) and `<div tabindex>`
//! could not be coerced to a number at all.
//!
//! Every expectation here was read off the official compiler
//! (`submodules/svelte`) one input per process.

use rsvelte_core::{CompileOptions, GenerateMode, Warning, compile};

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

/// `(code, line, column)` for every warning, in order.
fn shape(src: &str) -> Vec<(String, usize, usize)> {
    warnings(src)
        .iter()
        .map(|w| {
            let pos = w.start.as_ref().expect("warning has a start position");
            (w.code.clone(), pos.line, pos.column)
        })
        .collect()
}

fn codes(src: &str) -> Vec<String> {
    warnings(src).iter().map(|w| w.code.clone()).collect()
}

#[test]
fn valueless_role_is_not_an_unknown_role() {
    // `role` reads as the boolean `true`, and upstream's `typeof value !== 'string'`
    // bails before the role lookup.
    assert!(codes("<div role>x</div>").is_empty());
    // Controls: the two spellings that already agreed must keep agreeing.
    assert!(codes("<div role=\"\">x</div>").is_empty());
    assert!(codes("<div role=\"button\">x</div>").is_empty());
    // ... while a genuinely unknown role still warns.
    assert_eq!(
        codes("<div role=\"toooltip\">x</div>"),
        vec!["a11y_unknown_role"]
    );
}

#[test]
fn valueless_role_is_not_a_non_presentation_role() {
    // `role_static_value` is the *text* value, so a valueless `role` is `null`
    // and `(!role || is_non_presentation_role)` is false — no click warning.
    assert!(codes("<div role onclick={() => {}}>x</div>").is_empty());
    // Control: an explicit `role="true"` is a string, so the click rules do fire.
    assert_eq!(
        codes("<div role=\"true\" onclick={() => {}}>x</div>"),
        vec![
            "a11y_unknown_role",
            "a11y_click_events_have_key_events",
            "a11y_no_static_element_interactions",
        ]
    );
}

#[test]
fn valueless_tabindex_is_number_one() {
    // `Number(true)` is 1, so the positive-tabindex rule fires; the text value is
    // `null`, so the noninteractive rule fires too.
    assert_eq!(
        shape("<div tabindex>x</div>"),
        vec![
            ("a11y_positive_tabindex".to_string(), 1, 5),
            ("a11y_no_noninteractive_tabindex".to_string(), 1, 0),
        ]
    );
}

#[test]
fn empty_tabindex_is_number_zero() {
    // `Number('')` is 0: not positive, but `>= 0`, so only the noninteractive rule
    // fires. The two spellings are deliberately not interchangeable.
    assert_eq!(
        shape("<div tabindex=\"\">x</div>"),
        vec![("a11y_no_noninteractive_tabindex".to_string(), 1, 0)]
    );
}

#[test]
fn tabindex_is_coerced_with_js_number_rules() {
    // `parse::<i32>()` rejected everything that is not a bare integer; `Number()`
    // does not.
    for src in [
        "<div tabindex=\"1.5\">x</div>",
        "<div tabindex=\" 2 \">x</div>",
        "<div tabindex=\"0x2\">x</div>",
    ] {
        assert_eq!(
            codes(src),
            vec!["a11y_positive_tabindex", "a11y_no_noninteractive_tabindex"],
            "{src}"
        );
    }
    // Controls: the numeric spellings that already agreed.
    assert_eq!(
        codes("<div tabindex=\"0\">x</div>"),
        vec!["a11y_no_noninteractive_tabindex"]
    );
    assert!(codes("<div tabindex=\"-1\">x</div>").is_empty());
}

#[test]
fn a_valueless_attribute_is_not_the_string_true() {
    // `get_static_value(aria-hidden) === 'true'` is false for the boolean `true`,
    // so `<a aria-hidden>` is not "hidden" and still wants a label.
    assert_eq!(
        codes("<a href=\"/x\" aria-hidden></a>"),
        vec![
            "a11y_incorrect_aria_attribute_type_boolean",
            "a11y_consider_explicit_label",
        ]
    );
    // `inert` is read through `get_static_value(...) !== null`, so a dynamic value
    // does not suppress the label warning either.
    assert_eq!(
        codes("<a href=\"/x\" inert={x}></a>"),
        vec!["a11y_consider_explicit_label"]
    );
    // An empty `id` is falsy upstream, so `<a>` is still missing its `href` …
    assert_eq!(codes("<a id=\"\">x</a>"), vec!["a11y_missing_attribute"]);
    // … while a valueless `id` is `true`, which is truthy.
    assert!(codes("<a id>x</a>").is_empty());
}

#[test]
fn input_type_text_value_is_not_defaulted() {
    // Upstream reports `'...'` when the `type` is not statically known; rsvelte
    // substituted `text`.
    let ws = warnings("<input type={t} autocomplete=\"bogus\">");
    assert_eq!(ws.len(), 1);
    assert_eq!(ws[0].code, "a11y_autocomplete_valid");
    assert!(
        ws[0].message.contains("<input type=\"...\">"),
        "expected the unknown-type placeholder, got {:?}",
        ws[0].message
    );
}
