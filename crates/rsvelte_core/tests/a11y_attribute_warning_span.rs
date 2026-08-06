//! Upstream attaches an attribute-scoped a11y warning to the **attribute**
//! (`2-analyze/visitors/shared/a11y/index.js` passes `attribute` as the warn
//! target); rsvelte stamped the enclosing element's span on every a11y warning
//! that arrived without one, so the line was right and the column pointed at
//! `<tag` instead of at the offending attribute.

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

/// Column of the first warning with `code`, and the source text it points at.
fn at<'a>(src: &'a str, ws: &[Warning], code: &str) -> (usize, &'a str) {
    let w = ws.iter().find(|w| w.code == code).unwrap_or_else(|| {
        panic!(
            "no `{code}` warning in {:?}",
            ws.iter().map(|w| &w.code).collect::<Vec<_>>()
        )
    });
    let pos = w
        .start
        .as_ref()
        .unwrap_or_else(|| panic!("`{code}` has no start"));
    let line = src.lines().nth(pos.line - 1).unwrap_or("");
    (pos.column, &line[pos.column.min(line.len())..])
}

#[test]
fn incorrect_aria_attribute_type_points_at_the_attribute() {
    let src = "<li class=\"opacity-50\" aria-hidden>x</li>\n";
    let ws = warnings(src);
    let (col, text) = at(src, &ws, "a11y_incorrect_aria_attribute_type_boolean");
    assert!(
        text.starts_with("aria-hidden"),
        "expected the attribute, got column {col} -> {text:?}"
    );
}

#[test]
fn no_abstract_role_points_at_the_role_attribute() {
    let src = "<div class=\"x\" role=\"command\">y</div>\n";
    let ws = warnings(src);
    let (col, text) = at(src, &ws, "a11y_no_abstract_role");
    assert!(
        text.starts_with("role="),
        "expected the attribute, got column {col} -> {text:?}"
    );
}

#[test]
fn role_supports_aria_props_points_at_the_aria_attribute() {
    let src = "<div role=\"link\" aria-multiline=\"true\">y</div>\n";
    let ws = warnings(src);
    let (col, text) = at(src, &ws, "a11y_role_supports_aria_props");
    assert!(
        text.starts_with("aria-multiline"),
        "expected the attribute, got column {col} -> {text:?}"
    );
}

#[test]
fn invalid_attribute_points_at_the_href() {
    let src = "<a class=\"opacity-60\" href=\"#\">Blog</a>\n";
    let ws = warnings(src);
    let (col, text) = at(src, &ws, "a11y_invalid_attribute");
    assert!(
        text.starts_with("href="),
        "expected the attribute, got column {col} -> {text:?}"
    );
}

#[test]
fn autofocus_points_at_the_attribute() {
    let src = "<input class=\"a\" autofocus />\n";
    let ws = warnings(src);
    let (col, text) = at(src, &ws, "a11y_autofocus");
    assert!(
        text.starts_with("autofocus"),
        "expected the attribute, got column {col} -> {text:?}"
    );
}

/// Pin: an element-scoped warning must keep pointing at the element. This is
/// the half of the fallback that stays.
#[test]
fn element_scoped_warning_still_points_at_the_element() {
    let src = "<div onclick={() => {}}>y</div>\n";
    let ws = warnings(src);
    let (col, text) = at(src, &ws, "a11y_no_static_element_interactions");
    assert!(
        text.starts_with("<div"),
        "expected the element, got column {col} -> {text:?}"
    );
}
