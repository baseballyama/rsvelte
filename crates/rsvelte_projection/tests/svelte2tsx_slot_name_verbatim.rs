//! `<slot name={expr}>` must key `__sveltets_createSlot(...)` with the verbatim
//! source text of the value node (braces and inner whitespace included), the
//! same way official svelte2tsx's `surroundWith(str, [slotName.start,
//! slotName.end], '"', '"')` does in `htmlxtojsx_v2/nodes/Element.ts`. Only
//! re-serializing the expression (dropping the braces / normalizing
//! whitespace) is a divergence (#2046).

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn create_slot_call(source: &str) -> String {
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).expect("project");
    let start = result
        .code
        .find("__sveltets_createSlot(")
        .expect("createSlot call");
    let rest = &result.code[start..];
    let end = rest.find(");").map(|i| i + 2).unwrap_or(rest.len());
    rest[..end].to_string()
}

#[test]
fn dynamic_identifier_name_keeps_braces() {
    assert_eq!(
        create_slot_call("<slot name={n}></slot>"),
        "__sveltets_createSlot(\"{n}\", { });"
    );
}

#[test]
fn member_expression_name_keeps_braces() {
    assert_eq!(
        create_slot_call("<slot name={expr.complex}></slot>"),
        "__sveltets_createSlot(\"{expr.complex}\", { });"
    );
}

#[test]
fn binary_expression_name_keeps_braces() {
    assert_eq!(
        create_slot_call("<slot name={n + 1}></slot>"),
        "__sveltets_createSlot(\"{n + 1}\", { });"
    );
}

#[test]
fn inner_whitespace_is_preserved_verbatim() {
    assert_eq!(
        create_slot_call("<slot name={ n }></slot>"),
        "__sveltets_createSlot(\"{ n }\", { });"
    );
}

#[test]
fn static_string_name_is_unquoted() {
    assert_eq!(
        create_slot_call("<slot name=\"static\"></slot>"),
        "__sveltets_createSlot(\"static\", { });"
    );
}

#[test]
fn quoted_mustache_name_matches_dynamic_form() {
    assert_eq!(
        create_slot_call("<slot name=\"{n}\"></slot>"),
        "__sveltets_createSlot(\"{n}\", { });"
    );
}

#[test]
fn mixed_text_and_expression_only_uses_the_first_value_part() {
    // Official only ever reads `value[0]` — a later ExpressionTag/Text part in
    // the same attribute is not concatenated in, even though it's dropped.
    assert_eq!(
        create_slot_call("<slot name=\"a{b}c\"></slot>"),
        "__sveltets_createSlot(\"a\", {  });"
    );
    assert_eq!(
        create_slot_call("<slot name=\"{b}c\"></slot>"),
        "__sveltets_createSlot(\"{b}\", { });"
    );
}
