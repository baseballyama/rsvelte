//! Regression test: a *bare* ARIA attribute (no value) must surface a
//! type-specific `a11y_incorrect_aria_attribute_type[_<kind>]` warning, not be
//! silently accepted as `true` (issue #454, H-078).
//!
//! Bug: `get_static_value` returned `Some("true")` for `AttributeValue::True`,
//! and the boolean branch of `validate_aria_attribute_value` short-circuited
//! `"true"` as valid — so `<div aria-hidden>` compiled with zero warnings while
//! upstream emits `a11y_incorrect_aria_attribute_type_boolean`. Likewise
//! `aria-checked` (tristate). Distinguish the bare-attribute case and route it
//! through the per-type warning.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn warnings(src: &str) -> Vec<String> {
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
    .map(|w| w.code.clone())
    .collect()
}

#[test]
fn bare_aria_hidden_emits_boolean_type_warning() {
    let w = warnings(r#"<div aria-hidden>x</div>"#);
    assert!(
        w.contains(&"a11y_incorrect_aria_attribute_type_boolean".to_string()),
        "got: {w:?}"
    );
}

#[test]
fn bare_aria_checked_emits_tristate_type_warning() {
    let w = warnings(r#"<div role="checkbox" tabindex="0" aria-checked>x</div>"#);
    assert!(
        w.contains(&"a11y_incorrect_aria_attribute_type_tristate".to_string()),
        "got: {w:?}"
    );
}

#[test]
fn explicit_true_is_accepted() {
    let w = warnings(r#"<div aria-hidden="true">x</div>"#);
    assert!(
        !w.iter()
            .any(|c| c.starts_with("a11y_incorrect_aria_attribute_type")),
        "got: {w:?}"
    );
}

#[test]
fn explicit_false_is_accepted() {
    let w = warnings(r#"<div aria-hidden="false">x</div>"#);
    assert!(
        !w.iter()
            .any(|c| c.starts_with("a11y_incorrect_aria_attribute_type")),
        "got: {w:?}"
    );
}

#[test]
fn dynamic_value_is_skipped() {
    let w = warnings(r#"<script>let x = $state(true);</script><div aria-hidden={x}>x</div>"#);
    assert!(
        !w.iter()
            .any(|c| c.starts_with("a11y_incorrect_aria_attribute_type")),
        "got: {w:?}"
    );
}
