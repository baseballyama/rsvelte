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

// ---------------------------------------------------------------------------
// #1645: TypeScript assertion expressions must be preserved in the parse AST
// (svelte/compiler keeps them; the compiler strips them before transform).
// ---------------------------------------------------------------------------

/// Ordered keys of an object node (serde_json `preserve_order` is enabled, so
/// this reflects serialization order — i.e. the field order svelte emits).
fn keys_of(node: &Value) -> Vec<&str> {
    node.as_object()
        .map(|m| m.keys().map(String::as_str).collect())
        .unwrap_or_default()
}

#[test]
fn ts_as_const_preserved_in_script_declaration() {
    let src = "<script lang=\"ts\">const x = 'chips' as const;</script>";
    let ast = parse_to_json(src);
    let as_expr = find_node(&ast, "TSAsExpression").expect("TSAsExpression must be preserved");

    // expression is the inner literal `'chips'`.
    assert_eq!(
        as_expr.pointer("/expression/type").and_then(Value::as_str),
        Some("Literal")
    );
    assert_eq!(
        as_expr.pointer("/expression/value").and_then(Value::as_str),
        Some("chips")
    );
    // typeAnnotation is `TSTypeReference` naming `const`.
    assert_eq!(
        as_expr
            .pointer("/typeAnnotation/type")
            .and_then(Value::as_str),
        Some("TSTypeReference")
    );
    assert_eq!(
        as_expr
            .pointer("/typeAnnotation/typeName/name")
            .and_then(Value::as_str),
        Some("const")
    );
}

#[test]
fn ts_as_const_preserved_in_inline_expression_tag() {
    let src = "<script lang=\"ts\"></script><Child p={'chips' as const} />";
    let ast = parse_to_json(src);
    let as_expr = find_node(&ast, "TSAsExpression").expect("TSAsExpression must be preserved");
    assert_eq!(
        as_expr.pointer("/expression/type").and_then(Value::as_str),
        Some("Literal")
    );
    assert_eq!(
        as_expr.pointer("/expression/value").and_then(Value::as_str),
        Some("chips")
    );
    assert_eq!(
        as_expr
            .pointer("/typeAnnotation/typeName/name")
            .and_then(Value::as_str),
        Some("const")
    );
}

#[test]
fn ts_satisfies_expression_preserved() {
    let src = "<script lang=\"ts\">const z = obj satisfies Foo;</script>";
    let ast = parse_to_json(src);
    let n =
        find_node(&ast, "TSSatisfiesExpression").expect("TSSatisfiesExpression must be preserved");
    assert_eq!(
        n.pointer("/expression/name").and_then(Value::as_str),
        Some("obj")
    );
    assert_eq!(
        n.pointer("/typeAnnotation/typeName/name")
            .and_then(Value::as_str),
        Some("Foo")
    );
}

#[test]
fn ts_non_null_expression_preserved_as_member_object() {
    // `obj!.prop` — the MemberExpression object is a TSNonNullExpression.
    let src = "<script lang=\"ts\">let v = obj!.prop;</script>";
    let ast = parse_to_json(src);
    let member = find_node(&ast, "MemberExpression").expect("MemberExpression");
    assert_eq!(
        member.pointer("/object/type").and_then(Value::as_str),
        Some("TSNonNullExpression")
    );
    assert_eq!(
        member
            .pointer("/object/expression/name")
            .and_then(Value::as_str),
        Some("obj")
    );
    // No typeAnnotation on a non-null assertion.
    let nn = member.get("object").unwrap();
    assert!(!keys_of(nn).contains(&"typeAnnotation"));
}

#[test]
fn ts_type_assertion_emits_type_annotation_before_expression() {
    // `<Foo>d` — svelte/compiler emits `typeAnnotation` BEFORE `expression`.
    let src = "<script lang=\"ts\">let c = (<Foo>d);</script>";
    let ast = parse_to_json(src);
    let n = find_node(&ast, "TSTypeAssertion").expect("TSTypeAssertion must be preserved");
    assert_eq!(
        n.pointer("/expression/name").and_then(Value::as_str),
        Some("d")
    );
    assert_eq!(
        n.pointer("/typeAnnotation/typeName/name")
            .and_then(Value::as_str),
        Some("Foo")
    );
    let keys = keys_of(n);
    let ta = keys
        .iter()
        .position(|k| *k == "typeAnnotation")
        .expect("has typeAnnotation");
    let ex = keys
        .iter()
        .position(|k| *k == "expression")
        .expect("has expression");
    assert!(
        ta < ex,
        "typeAnnotation must be serialized before expression, keys: {keys:?}"
    );
}

#[test]
fn ts_instantiation_expression_preserved() {
    let src = "<script lang=\"ts\">const e = f<number>;</script>";
    let ast = parse_to_json(src);
    let n = find_node(&ast, "TSInstantiationExpression")
        .expect("TSInstantiationExpression must be preserved");
    assert_eq!(
        n.pointer("/expression/name").and_then(Value::as_str),
        Some("f")
    );
    assert_eq!(
        n.pointer("/typeArguments/type").and_then(Value::as_str),
        Some("TSTypeParameterInstantiation")
    );
}

#[test]
fn arrow_handler_parameters_have_real_spans() {
    // Fast-path mustache/attribute arrow parameters must carry real spans
    // (svelte/compiler assigns them; rsvelte previously used `Identifier[0,0]`).
    let src = "<button onclick={(color, e) => handle(color, e)}>x</button>";
    let ast = parse_to_json(src);
    let arrow = find_node(&ast, "ArrowFunctionExpression").expect("arrow");
    let params = arrow
        .get("params")
        .and_then(Value::as_array)
        .expect("params");
    assert_eq!(params.len(), 2);
    // `color` occupies columns 18..23, `e` columns 25..26 (matches svelte/compiler).
    assert_eq!(params[0].get("name").and_then(Value::as_str), Some("color"));
    assert_eq!(params[0].get("start").and_then(Value::as_u64), Some(18));
    assert_eq!(params[0].get("end").and_then(Value::as_u64), Some(23));
    assert_eq!(params[1].get("name").and_then(Value::as_str), Some("e"));
    assert_eq!(params[1].get("start").and_then(Value::as_u64), Some(25));
    assert_eq!(params[1].get("end").and_then(Value::as_u64), Some(26));
}
