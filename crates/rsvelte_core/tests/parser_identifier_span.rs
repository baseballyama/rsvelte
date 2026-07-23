//! Regression test for issue #916.
//!
//! The identifier in a `switch (X)` discriminant (and a do-while test) was
//! spanned one code unit to the left — it started on the `(` instead of on the
//! identifier — because the program-context statement converter routed those
//! expressions through `convert_expression` (which subtracts the synthetic
//! paren offset) instead of `convert_expression_for_program`. A sibling
//! off-by-one hit the `$bindable` callee in `let { open = $bindable(false) }`
//! (the `AssignmentPattern` default ran through the same `-1` path).
//!
//! The invariant asserted here is simple and general: for an ASCII source,
//! every `Identifier` node must satisfy `source[start..end] == name`.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};

fn ast_json(src: &str) -> serde_json::Value {
    let ast = parse(
        src,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse");
    let s = with_serialize_arena(&ast.arena, || serde_json::to_string(&ast).unwrap());
    serde_json::from_str(&s).unwrap()
}

/// Visit every node; for each `Identifier` with a name + span, run `f`.
fn for_each_identifier(
    value: &serde_json::Value,
    src: &str,
    f: &mut impl FnMut(&str, usize, usize),
) {
    match value {
        serde_json::Value::Object(map) => {
            if map.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                && let Some(name) = map.get("name").and_then(|n| n.as_str())
                && let Some(start) = map.get("start").and_then(|s| s.as_u64())
                && let Some(end) = map.get("end").and_then(|e| e.as_u64())
            {
                let _ = src; // src used by caller
                f(name, start as usize, end as usize);
            }
            for v in map.values() {
                for_each_identifier(v, src, f);
            }
        }
        serde_json::Value::Array(items) => {
            for it in items {
                for_each_identifier(it, src, f);
            }
        }
        _ => {}
    }
}

fn assert_all_identifiers_slice_to_name(src: &str) -> usize {
    let json = ast_json(src);
    let mut count = 0usize;
    for_each_identifier(&json, src, &mut |name, start, end| {
        assert!(
            end <= src.len() && src.is_char_boundary(start) && src.is_char_boundary(end),
            "identifier {name:?} has an out-of-bounds span {start}..{end} (src len {})",
            src.len()
        );
        assert_eq!(
            &src[start..end],
            name,
            "identifier {name:?} span {start}..{end} slices to {:?}",
            &src[start..end]
        );
        count += 1;
    });
    count
}

#[test]
fn switch_discriminant_identifier_span_is_exact() {
    let src = "<script>\n  let x = 1;\n  switch (x) { case 1: break; }\n</script>";
    let n = assert_all_identifiers_slice_to_name(src);
    assert!(n > 0, "expected identifiers in the script");
    // Make sure the discriminant identifier was actually present.
    let json = ast_json(src);
    let mut saw_x = false;
    for_each_identifier(&json, src, &mut |name, start, end| {
        if name == "x" && &src[start..end] == "x" {
            saw_x = true;
        }
    });
    assert!(saw_x, "switch discriminant identifier `x` not found");
}

#[test]
fn switch_case_test_and_do_while_spans_are_exact() {
    let src = "<script>\n  let x = 1;\n  switch (x) { case x: break; }\n  do { x; } while (x);\n</script>";
    assert_all_identifiers_slice_to_name(src);
}

#[test]
fn bindable_callee_span_is_exact() {
    let src = "<script>\n  let { open = $bindable(false) } = $props();\n</script>";
    assert_all_identifiers_slice_to_name(src);
    let json = ast_json(src);
    let mut saw_bindable = false;
    for_each_identifier(&json, src, &mut |name, start, end| {
        if name == "$bindable" && &src[start..end] == "$bindable" {
            saw_bindable = true;
        }
    });
    assert!(
        saw_bindable,
        "`$bindable` callee identifier not found / mis-spanned"
    );
}
