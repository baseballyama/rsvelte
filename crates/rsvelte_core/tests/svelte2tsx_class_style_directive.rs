//! Regression test for issue #750.
//!
//! `class:NAME` and `style:PROP` are **directives**, not attributes, so
//! svelte2tsx must not emit them as keys in the element's `createElement`
//! props object (typed as `HTMLProps<tag, …>`, which has no `class:` /
//! `style:` keys — they would trip the excess-property check). Upstream
//! svelte2tsx lowers them to statements appended *after* the
//! `createElement(...)` call:
//!   `class:xx={yyy}` → `yyy;`
//!   `style:xx={yy}`  → `__sveltets_2_ensureType(String, Number, yy);`

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "T.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

#[test]
fn class_and_style_directives_are_not_props_keys() {
    let out = to_tsx(
        "<script lang=\"ts\">\n  let on = $state(true);\n  let z = 5;\n</script>\n\
         <div class:checked={on} style:z-index={z}>hi</div>",
    );

    // The directive keys must NOT appear in the typed props object.
    assert!(
        !out.contains("\"class:checked\""),
        "class: directive leaked into props object:\n{out}"
    );
    assert!(
        !out.contains("\"style:z-index\""),
        "style: directive leaked into props object:\n{out}"
    );

    // The props object is empty for this element.
    assert!(
        out.contains("svelteHTML.createElement(\"div\", { });"),
        "expected empty props object, got:\n{out}"
    );

    // class: lowers to a bare expression statement; style: to ensureType.
    assert!(
        out.contains("); on;"),
        "class: expr statement missing:\n{out}"
    );
    assert!(
        out.contains("__sveltets_2_ensureType(String, Number, z);"),
        "style: ensureType statement missing:\n{out}"
    );
}

#[test]
fn class_shorthand_directive_is_not_props_key() {
    // `class:active` shorthand → `active;` (implicit `={active}`).
    let out = to_tsx(
        "<script lang=\"ts\">\n  let active = $state(true);\n</script>\n\
         <div class:active>hi</div>",
    );
    assert!(
        !out.contains("\"class:active\""),
        "class: shorthand leaked into props:\n{out}"
    );
    assert!(
        out.contains("); active;"),
        "class: shorthand statement missing:\n{out}"
    );
}

#[test]
fn style_shorthand_directive_uses_ensure_type() {
    // `style:color` shorthand → `__sveltets_2_ensureType(String, Number, color);`
    let out = to_tsx(
        "<script lang=\"ts\">\n  let color = 'red';\n</script>\n\
         <div style:color>hi</div>",
    );
    assert!(
        !out.contains("\"style:color\""),
        "style: shorthand leaked into props:\n{out}"
    );
    assert!(
        out.contains("__sveltets_2_ensureType(String, Number, color);"),
        "style: shorthand ensureType missing:\n{out}"
    );
}

#[test]
fn class_style_alongside_real_attributes() {
    // A real attribute stays in props; the directive does not.
    let out = to_tsx(
        "<script lang=\"ts\">\n  let on = $state(true);\n</script>\n\
         <div id=\"x\" class:checked={on}>hi</div>",
    );
    assert!(out.contains("\"id\":"), "real attribute dropped:\n{out}");
    assert!(
        !out.contains("\"class:checked\""),
        "class: directive leaked into props:\n{out}"
    );
    assert!(
        out.contains("); on;"),
        "class: expr statement missing:\n{out}"
    );
}
