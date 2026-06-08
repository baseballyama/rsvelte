//! Regression tests for #791: inline TS type annotations must serialize to a
//! real type tree (TSTypeLiteral -> members[TSPropertySignature], unions,
//! references, …) rather than a members-less `TSUnknownKeyword` stub.
//!
//! The inputs are ASCII-only, so byte offsets and UTF-16 offsets coincide —
//! these assertions are independent of the #793 offset remap.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};
use serde_json::Value;

/// Parse a Svelte source in modern mode and return the serialized AST as JSON.
fn parse_to_json(source: &str) -> Value {
    let ast = parse(
        source,
        ParseOptions {
            modern: true,
            ..Default::default()
        },
    )
    .expect("parse should succeed");
    let json = with_serialize_arena(&ast.arena, || serde_json::to_string(&ast).unwrap());
    serde_json::from_str(&json).unwrap()
}

/// Depth-first search for the first node of the given `type`.
fn find_node<'a>(value: &'a Value, type_name: &str) -> Option<&'a Value> {
    match value {
        Value::Object(map) => {
            if map.get("type").and_then(|t| t.as_str()) == Some(type_name) {
                return Some(value);
            }
            for (_, v) in map.iter() {
                if let Some(found) = find_node(v, type_name) {
                    return Some(found);
                }
            }
            None
        }
        Value::Array(arr) => arr.iter().find_map(|v| find_node(v, type_name)),
        _ => None,
    }
}

fn type_of(node: &Value) -> Option<&str> {
    node.get("type").and_then(|t| t.as_str())
}

#[test]
fn props_object_type_literal_emits_members() {
    // The exact repro from #791.
    let src = "<script lang=\"ts\">\n  let { hasIcon = false }: { hasIcon: boolean; label: string } = $props();\n</script>";
    let ast = parse_to_json(src);

    // Before the fix this collapsed to `{ "type": "TSUnknownKeyword" }`.
    let lit = find_node(&ast, "TSTypeLiteral").expect("TSTypeLiteral must be present (not a stub)");

    // It must carry its span.
    assert!(
        lit.get("start").is_some(),
        "TSTypeLiteral must have a start"
    );
    assert!(lit.get("end").is_some(), "TSTypeLiteral must have an end");

    let members = lit
        .get("members")
        .and_then(|m| m.as_array())
        .expect("TSTypeLiteral must have a members array");
    assert_eq!(members.len(), 2, "two property signatures expected");

    // member 0: hasIcon: boolean
    let m0 = &members[0];
    assert_eq!(type_of(m0), Some("TSPropertySignature"));
    assert_eq!(m0.get("computed"), Some(&Value::Bool(false)));
    assert_eq!(
        m0.pointer("/key/name").and_then(|v| v.as_str()),
        Some("hasIcon")
    );
    assert_eq!(
        m0.pointer("/typeAnnotation/typeAnnotation/type")
            .and_then(|v| v.as_str()),
        Some("TSBooleanKeyword")
    );

    // member 1: label: string
    let m1 = &members[1];
    assert_eq!(
        m1.pointer("/key/name").and_then(|v| v.as_str()),
        Some("label")
    );
    assert_eq!(
        m1.pointer("/typeAnnotation/typeAnnotation/type")
            .and_then(|v| v.as_str()),
        Some("TSStringKeyword")
    );

    // svelte/compiler omits `optional`/`readonly` when false.
    assert!(m0.get("optional").is_none());
    assert!(m0.get("readonly").is_none());
}

#[test]
fn union_type_emits_types_array() {
    let src = "<script lang=\"ts\">\n  let x: string | number = y;\n</script>";
    let ast = parse_to_json(src);
    let union = find_node(&ast, "TSUnionType").expect("TSUnionType must be present");
    let types = union
        .get("types")
        .and_then(|t| t.as_array())
        .expect("union must have a types array");
    let kinds: Vec<_> = types.iter().filter_map(type_of).collect();
    assert_eq!(kinds, vec!["TSStringKeyword", "TSNumberKeyword"]);
}

#[test]
fn type_reference_with_arguments_emits_type_arguments() {
    let src = "<script lang=\"ts\">\n  let x: Array<string> = y;\n</script>";
    let ast = parse_to_json(src);
    let r = find_node(&ast, "TSTypeReference").expect("TSTypeReference must be present");
    assert_eq!(
        r.pointer("/typeName/name").and_then(|v| v.as_str()),
        Some("Array")
    );
    let params = r
        .pointer("/typeArguments/params")
        .and_then(|p| p.as_array())
        .expect("typeArguments.params must be present");
    assert_eq!(params.first().and_then(type_of), Some("TSStringKeyword"));
}

#[test]
fn array_type_emits_element_type() {
    let src = "<script lang=\"ts\">\n  let x: string[] = y;\n</script>";
    let ast = parse_to_json(src);
    let arr = find_node(&ast, "TSArrayType").expect("TSArrayType must be present");
    assert_eq!(
        arr.pointer("/elementType/type").and_then(|v| v.as_str()),
        Some("TSStringKeyword")
    );
}

#[test]
fn no_typescript_unknown_stub_for_modelled_types() {
    // None of these well-known shapes should degrade to a TSUnknownKeyword.
    for src in [
        "<script lang=\"ts\">\n  let x: { a: number } = y;\n</script>",
        "<script lang=\"ts\">\n  let x: string | number = y;\n</script>",
        "<script lang=\"ts\">\n  let x: string[] = y;\n</script>",
    ] {
        let ast = parse_to_json(src);
        assert!(
            find_node(&ast, "TSUnknownKeyword").is_none(),
            "no TSUnknownKeyword stub expected for: {src}"
        );
    }
}
