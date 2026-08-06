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

/// The carve-out itself. These three codes are the only ones upstream raises
/// *inside* the attribute loop while passing `node` rather than `attribute`, so
/// they are the only ones `ELEMENT_SCOPED_CODES` exists for. Emptying that list
/// must fail here — the element-scoped pin below cannot detect it, because its
/// warning is raised outside the loop and never reaches `stamp_attribute`.
#[test]
fn codes_upstream_scopes_to_the_element_inside_the_attribute_loop() {
    for (src, code) in [
        (
            "<h1 class=\"x\" role=\"button\">y</h1>\n",
            "a11y_no_noninteractive_element_to_interactive_role",
        ),
        (
            "<button class=\"x\" role=\"presentation\">y</button>\n",
            "a11y_no_interactive_element_to_noninteractive_role",
        ),
        (
            "<div class=\"x\" role=\"button\" on:click={f}>y</div>\n",
            "a11y_interactive_supports_focus",
        ),
    ] {
        let ws = warnings(src);
        let (col, text) = at(src, &ws, code);
        assert_eq!(
            col, 0,
            "`{code}` must span the element, got column {col} -> {text:?}"
        );
    }
}

/// Pin: an element-scoped warning raised *outside* the attribute loop keeps
/// pointing at the element. Guards the fallback, not the carve-out.
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
