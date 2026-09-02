//! Whether an attribute can go in the template string is asked of the RAW name.
//!
//! Upstream `RegularElement.js:234-256` computes `name = get_attribute_name(...)`
//! and then uses it only for the branch selectors (`class`, `style`,
//! `autofocus`); both `cannot_be_set_statically` and `template.set_prop` take
//! `attribute.name`. rsvelte passed the normalized name to both, so a case
//! variant of one of the four non-static properties matched the list and its
//! attribute was dropped from the template with nothing emitted in its place.
//!
//! The grid crosses the name's spelling with the namespace, because
//! `get_attribute_name` is the identity outside `html` — an svg row cannot tell
//! the raw name from the normalized one and would report the fix as a no-op.
//! Every expectation is the official compiler's own output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn template(src: &str) -> String {
    let out = compile(
        src,
        CompileOptions {
            filename: Some("P.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let picked: Vec<&str> = out
        .lines()
        .map(str::trim)
        .filter(|l| l.contains("$.from_") || l.contains("$.autofocus("))
        .collect();
    if picked.is_empty() {
        panic!("no template line in:\n{out}");
    }
    picked.join(" | ")
}

fn check(cells: &[(&str, String, &str)]) {
    let mut bad = Vec::new();
    for (label, src, want) in cells {
        let got = template(src);
        if !got.contains(want) {
            bad.push(format!("{label}\n  want: {want}\n  got:  {got}"));
        }
    }
    assert!(bad.is_empty(), "{}", bad.join("\n\n"));
}

/// A case variant of a non-static property is an ordinary attribute upstream,
/// and the html serializer lowercases the key it stored.
#[test]
fn a_case_variant_of_a_non_static_property_stays_in_the_template() {
    check(&[
        (
            "autoFocus, valueless",
            "<input autoFocus />\n".to_string(),
            "$.from_html(`<input autofocus=\"\"/>`)",
        ),
        (
            "autoFocus, static value",
            "<input autoFocus=\"x\" />\n".to_string(),
            "$.from_html(`<input autofocus=\"x\"/>`)",
        ),
        (
            "Muted",
            "<input Muted />\n".to_string(),
            "$.from_html(`<input muted=\"\"/>`)",
        ),
        (
            "MUTED",
            "<input MUTED />\n".to_string(),
            "$.from_html(`<input muted=\"\"/>`)",
        ),
        (
            "DefaultValue — the list spells it `defaultValue`",
            "<input DefaultValue=\"x\" />\n".to_string(),
            "$.from_html(`<input defaultvalue=\"x\"/>`)",
        ),
        (
            "defaultchecked — normalization maps it INTO the list, the raw name is not in it",
            "<input defaultchecked />\n".to_string(),
            "$.from_html(`<input defaultchecked=\"\"/>`)",
        ),
    ]);
}

/// The controls: the exact spellings the list holds still leave the template,
/// and `autofocus` still gets its call.
#[test]
fn the_listed_spellings_still_leave_the_template() {
    check(&[
        (
            "autofocus keeps its call",
            "<input autofocus />\n".to_string(),
            "$.autofocus(input, true)",
        ),
        (
            "autofocus is not in the template",
            "<input autofocus />\n".to_string(),
            "$.from_html(`<input/>`)",
        ),
        (
            "muted",
            "<input muted />\n".to_string(),
            "$.from_html(`<input/>`)",
        ),
        (
            "defaultValue",
            "<input defaultValue=\"x\" />\n".to_string(),
            "$.from_html(`<input/>`)",
        ),
        (
            "defaultChecked",
            "<input defaultChecked />\n".to_string(),
            "$.from_html(`<input/>`)",
        ),
    ]);
}

/// Outside `html`, `get_attribute_name` is the identity — so these rows are the
/// ones that move if the fix is spelled as "lowercase the raw name" instead.
#[test]
fn an_svg_attribute_keeps_the_source_spelling() {
    check(&[
        (
            "autoFocus in svg",
            "<svg><rect autoFocus /></svg>\n".to_string(),
            "$.from_svg(`<svg><rect autoFocus=\"\"></rect></svg>`)",
        ),
        (
            "Muted in svg",
            "<svg><rect Muted=\"x\" /></svg>\n".to_string(),
            "$.from_svg(`<svg><rect Muted=\"x\"></rect></svg>`)",
        ),
        (
            "MUTED in svg",
            "<svg><rect MUTED /></svg>\n".to_string(),
            "$.from_svg(`<svg><rect MUTED=\"\"></rect></svg>`)",
        ),
        (
            "autofocus in svg still gets its call",
            "<svg><rect autofocus /></svg>\n".to_string(),
            "$.autofocus(rect, true)",
        ),
        (
            "muted in svg leaves the template",
            "<svg><rect muted /></svg>\n".to_string(),
            "$.from_svg(`<svg><rect></rect></svg>`)",
        ),
    ]);
}
