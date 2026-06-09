//! Regression test for issue #939.
//!
//! Numeric HTML attributes written as string literals (`tabindex="-1"`,
//! `colspan="2"`, `maxlength="5"`, …) are typed `number | undefined | null`
//! by `svelte/elements` — no `string`. Lowering the value as a backtick
//! string (`"tabindex":`-1``) makes `--tsgo` reject it with
//! `Type 'string' is not assignable to type 'number'`. svelte2tsx must instead
//! emit a bare number for these attributes when, and only when:
//!   - the host is a real element (not a component),
//!   - the attribute is in the `numberOnlyAttributes` set, and
//!   - the static value coerces to a number.
//!
//! Mirrors upstream svelte2tsx's `needsNumberConversion` in `Attribute.ts`.

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
fn numeric_element_attributes_lower_to_bare_numbers() {
    let out = to_tsx(
        "<div tabindex=\"-1\">a</div>\n\
         <input maxlength=\"5\" size=\"10\" />\n\
         <td colspan=\"2\" rowspan=\"3\">b</td>\n\
         <col span=\"2\" />",
    );

    for expect in [
        "\"tabindex\":-1,",
        "\"maxlength\":5,",
        "\"size\":10,",
        "\"colspan\":2,",
        "\"rowspan\":3,",
        "\"span\":2,",
    ] {
        assert!(
            out.contains(expect),
            "expected bare-number `{expect}`, got:\n{out}"
        );
    }

    // The old backtick-string form must be gone.
    assert!(
        !out.contains("\"tabindex\":`"),
        "tabindex still emitted as a string:\n{out}"
    );
}

#[test]
fn non_numeric_value_stays_a_string() {
    // A numberOnlyAttribute whose value doesn't coerce to a number keeps its
    // string form (so the real type error still surfaces, matching official).
    let out = to_tsx("<div tabindex=\"auto\">a</div>");
    assert!(
        out.contains("\"tabindex\":`auto`"),
        "non-numeric tabindex should stay a string:\n{out}"
    );
}

#[test]
fn non_number_only_attribute_stays_a_string() {
    // `role` is not in the numberOnlyAttributes set even though its value here
    // is text; a genuinely numeric-looking non-listed attribute must also keep
    // its string form (e.g. `data-*`).
    let out = to_tsx("<div role=\"none\" data-x=\"2\">a</div>");
    assert!(out.contains("\"role\":`none`"), "role changed:\n{out}");
    assert!(out.contains("\"data-x\":`2`"), "data-x changed:\n{out}");
}

#[test]
fn component_numeric_attribute_stays_a_string() {
    // On a component the value is a real prop, not a DOM attribute, so the
    // author's string is preserved (the prop type decides validity).
    let out = to_tsx(
        "<script lang=\"ts\">\n  import Foo from './Foo.svelte';\n</script>\n\
         <Foo tabindex=\"1\" />",
    );
    assert!(
        out.contains("\"tabindex\":`1`"),
        "component tabindex should stay a string:\n{out}"
    );
}
