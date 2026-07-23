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
    serde_json::from_str(&parse_to_string(source)).unwrap()
}

/// Parse a Svelte source in modern mode and return the raw serialized AST string
/// (preserving `serialize_entry` key order, which the `Value` round-trip drops).
fn parse_to_string(source: &str) -> String {
    let ast = parse(
        source,
        ParseOptions {
            modern: true,
            ..Default::default()
        },
    )
    .expect("parse should succeed");
    with_serialize_arena(&ast.arena, || serde_json::to_string(&ast).unwrap())
}

/// Assert that `a`, then `b`, then `c` appear in this order in `s`.
fn assert_key_order(s: &str, a: &str, b: &str, c: &str) {
    let ia = s.find(a).unwrap_or_else(|| panic!("missing {a}"));
    let ib = s[ia..]
        .find(b)
        .map(|x| x + ia)
        .unwrap_or_else(|| panic!("missing {b} after {a}"));
    let ic = s[ib..]
        .find(c)
        .map(|x| x + ib)
        .unwrap_or_else(|| panic!("missing {c} after {b}"));
    assert!(ia < ib && ib < ic, "expected order {a} < {b} < {c} in: {s}");
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
        "<script lang=\"ts\">\n  let x: string | (() => void);\n</script>",
        "<script lang=\"ts\">\n  let x: string & (() => void);\n</script>",
        "<script lang=\"ts\">\n  let x: new (a: string) => Foo;\n</script>",
        "<script lang=\"ts\">\n  let x = 1 as (() => void);\n</script>",
    ] {
        let ast = parse_to_json(src);
        assert!(
            find_node(&ast, "TSUnknownKeyword").is_none(),
            "no TSUnknownKeyword stub expected for: {src}"
        );
    }
}

// ---- #1660: TSFunctionType / TSConstructorType inside a type annotation ---

#[test]
fn function_type_inside_union_is_preserved() {
    // The exact repro from #1660: a TSFunctionType member of a union used to
    // collapse to a members-less `TSUnknownKeyword` stub.
    let src = "<script lang=\"ts\">\n  let x: string | (() => void);\n</script>";
    let ast = parse_to_json(src);
    let union = find_node(&ast, "TSUnionType").expect("TSUnionType must be present");
    let types = union
        .get("types")
        .and_then(|t| t.as_array())
        .expect("union must have a types array");
    assert_eq!(types.len(), 2);
    assert_eq!(type_of(&types[0]), Some("TSStringKeyword"));

    let paren = &types[1];
    assert_eq!(type_of(paren), Some("TSParenthesizedType"));
    let func = paren
        .get("typeAnnotation")
        .expect("TSParenthesizedType must carry typeAnnotation");
    assert_eq!(type_of(func), Some("TSFunctionType"));
    assert_eq!(
        func.get("parameters").and_then(|p| p.as_array()),
        Some(&vec![])
    );
    assert_eq!(
        func.pointer("/typeAnnotation/typeAnnotation/type")
            .and_then(|v| v.as_str()),
        Some("TSVoidKeyword")
    );
}

#[test]
fn function_type_inside_intersection_is_preserved() {
    let src = "<script lang=\"ts\">\n  let x: string & (() => void);\n</script>";
    let ast = parse_to_json(src);
    let inter = find_node(&ast, "TSIntersectionType").expect("TSIntersectionType must be present");
    let types = inter
        .get("types")
        .and_then(|t| t.as_array())
        .expect("intersection must have a types array");
    assert_eq!(
        types[1]
            .pointer("/typeAnnotation/type")
            .and_then(|v| v.as_str()),
        Some("TSFunctionType")
    );
}

#[test]
fn function_type_via_as_assertion_is_preserved() {
    // #1648 started preserving the `TSAsExpression` wrapper; its `typeAnnotation`
    // routes through the same `convert_ts_type` this fix touches.
    let src = "<script lang=\"ts\">\n  let x = 1 as (() => void);\n</script>";
    let ast = parse_to_json(src);
    let as_expr = find_node(&ast, "TSAsExpression").expect("TSAsExpression must be present");
    assert_eq!(
        as_expr
            .pointer("/typeAnnotation/typeAnnotation/type")
            .and_then(|v| v.as_str()),
        Some("TSFunctionType")
    );
}

#[test]
fn function_type_parameters_and_return_type() {
    let src = "<script lang=\"ts\">\n  let y: (a: string, b?: number) => void;\n</script>";
    let ast = parse_to_json(src);
    let func = find_node(&ast, "TSFunctionType").expect("TSFunctionType must be present");

    let params = func
        .get("parameters")
        .and_then(|p| p.as_array())
        .expect("parameters array must be present");
    assert_eq!(params.len(), 2);

    let a = &params[0];
    assert_eq!(a.pointer("/name").and_then(|v| v.as_str()), Some("a"));
    assert!(a.get("optional").is_none());
    assert_eq!(
        a.pointer("/typeAnnotation/typeAnnotation/type")
            .and_then(|v| v.as_str()),
        Some("TSStringKeyword")
    );

    let b = &params[1];
    assert_eq!(b.pointer("/name").and_then(|v| v.as_str()), Some("b"));
    // #1692: the `?` optional marker now round-trips (JsNode::Identifier carries
    // an `optional` field, emitted after `name` and only when true).
    assert_eq!(b.get("optional"), Some(&Value::Bool(true)));
    assert_eq!(
        b.pointer("/typeAnnotation/typeAnnotation/type")
            .and_then(|v| v.as_str()),
        Some("TSNumberKeyword")
    );

    assert_eq!(
        func.pointer("/typeAnnotation/typeAnnotation/type")
            .and_then(|v| v.as_str()),
        Some("TSVoidKeyword")
    );
}

#[test]
fn function_type_generics_and_rest_parameter() {
    let src = "<script lang=\"ts\">\n  let f: <T>(a: T, ...rest: T[]) => T;\n</script>";
    let ast = parse_to_json(src);
    let func = find_node(&ast, "TSFunctionType").expect("TSFunctionType must be present");

    assert_eq!(
        func.pointer("/typeParameters/type")
            .and_then(|v| v.as_str()),
        Some("TSTypeParameterDeclaration")
    );
    assert_eq!(
        func.pointer("/typeParameters/params/0/name")
            .and_then(|v| v.as_str()),
        Some("T")
    );

    let params = func
        .get("parameters")
        .and_then(|p| p.as_array())
        .expect("parameters array must be present");
    assert_eq!(params.len(), 2);
    assert_eq!(type_of(&params[0]), Some("Identifier"));

    let rest = &params[1];
    assert_eq!(type_of(rest), Some("RestElement"));
    assert_eq!(
        rest.pointer("/argument/name").and_then(|v| v.as_str()),
        Some("rest")
    );
    assert_eq!(
        rest.pointer("/typeAnnotation/typeAnnotation/type")
            .and_then(|v| v.as_str()),
        Some("TSArrayType")
    );
}

#[test]
fn function_type_this_parameter_is_prepended() {
    let src = "<script lang=\"ts\">\n  let h: (this: Foo, a: number) => void;\n</script>";
    let ast = parse_to_json(src);
    let func = find_node(&ast, "TSFunctionType").expect("TSFunctionType must be present");
    let params = func
        .get("parameters")
        .and_then(|p| p.as_array())
        .expect("parameters array must be present");
    assert_eq!(params.len(), 2);
    assert_eq!(
        params[0].pointer("/name").and_then(|v| v.as_str()),
        Some("this")
    );
    assert_eq!(
        params[0]
            .pointer("/typeAnnotation/typeAnnotation/typeName/name")
            .and_then(|v| v.as_str()),
        Some("Foo")
    );
    assert_eq!(
        params[1].pointer("/name").and_then(|v| v.as_str()),
        Some("a")
    );
}

#[test]
fn constructor_type_is_preserved() {
    let src = "<script lang=\"ts\">\n  let z: new (a: string) => Foo;\n</script>";
    let ast = parse_to_json(src);
    let ctor = find_node(&ast, "TSConstructorType").expect("TSConstructorType must be present");
    assert_eq!(ctor.get("abstract"), Some(&Value::Bool(false)));
    assert_eq!(
        ctor.pointer("/parameters/0/name").and_then(|v| v.as_str()),
        Some("a")
    );
    assert_eq!(
        ctor.pointer("/typeAnnotation/typeAnnotation/typeName/name")
            .and_then(|v| v.as_str()),
        Some("Foo")
    );
}

// #1694: generic function-like nodes must emit `typeParameters`, matching
// acorn-typescript's shape and key position.

#[test]
fn generic_function_declaration_emits_type_parameters() {
    let src = "<script lang=\"ts\">function f<T>(x: T){}</script>";
    let ast = parse_to_json(src);
    let f = find_node(&ast, "FunctionDeclaration").expect("FunctionDeclaration");
    // `<T>` sits at bytes 28..31; the single param is `T`.
    assert_eq!(
        f.pointer("/typeParameters/type").and_then(|v| v.as_str()),
        Some("TSTypeParameterDeclaration")
    );
    assert_eq!(
        f.pointer("/typeParameters/start").and_then(|v| v.as_u64()),
        Some(28)
    );
    assert_eq!(
        f.pointer("/typeParameters/end").and_then(|v| v.as_u64()),
        Some(31)
    );
    assert_eq!(
        f.pointer("/typeParameters/params/0/name")
            .and_then(|v| v.as_str()),
        Some("T")
    );
    // acorn emits `typeParameters` between `async` and `params`.
    let s = parse_to_string(src);
    assert_key_order(&s, "\"async\"", "\"typeParameters\"", "\"params\"");
}

#[test]
fn generic_function_expression_emits_type_parameters() {
    let src = "<script lang=\"ts\">const f = function<T>(x: T){}</script>";
    let ast = parse_to_json(src);
    let f = find_node(&ast, "FunctionExpression").expect("FunctionExpression");
    assert_eq!(
        f.pointer("/typeParameters/params/0/name")
            .and_then(|v| v.as_str()),
        Some("T")
    );
    let s = parse_to_string(src);
    assert_key_order(&s, "\"async\"", "\"typeParameters\"", "\"params\"");
}

#[test]
fn generic_arrow_emits_type_parameters_after_body() {
    let src = "<script lang=\"ts\">const g = <T>(x: T)=>{}</script>";
    let ast = parse_to_json(src);
    let a = find_node(&ast, "ArrowFunctionExpression").expect("ArrowFunctionExpression");
    assert_eq!(
        a.pointer("/typeParameters/params/0/name")
            .and_then(|v| v.as_str()),
        Some("T")
    );
    // Unlike declarations/expressions, acorn appends `typeParameters` after `body`.
    let s = parse_to_string(src);
    // Restrict to the arrow subtree to avoid matching an outer `params`/`body`.
    let arrow_at = s.find("\"ArrowFunctionExpression\"").unwrap();
    assert_key_order(
        &s[arrow_at..],
        "\"params\"",
        "\"body\"",
        "\"typeParameters\"",
    );
}

#[test]
fn non_generic_function_omits_type_parameters() {
    let ast = parse_to_json("<script>function f(x){}</script>");
    let f = find_node(&ast, "FunctionDeclaration").expect("FunctionDeclaration");
    assert!(f.get("typeParameters").is_none());
}

#[test]
fn class_method_generics_stay_off_the_inner_function() {
    // acorn-typescript attaches a method's generics to the MethodDefinition, not
    // the inner FunctionExpression, so the inner function must omit them.
    let ast = parse_to_json("<script lang=\"ts\">class C { m<T>(x: T){} }</script>");
    let f = find_node(&ast, "FunctionExpression").expect("FunctionExpression");
    assert!(f.get("typeParameters").is_none());
}

#[test]
fn object_method_generics_emit_type_parameters_after_body() {
    // Object-method inner functions keep their generics, but acorn-typescript
    // appends `typeParameters` after `body` (like arrows), not in the
    // declaration/expression slot before `params`.
    let src = "<script lang=\"ts\">const o = { m<T>(x: T){ return x } }</script>";
    let ast = parse_to_json(src);
    let f = find_node(&ast, "FunctionExpression").expect("FunctionExpression");
    assert_eq!(
        f.pointer("/typeParameters/params/0/name")
            .and_then(|v| v.as_str()),
        Some("T")
    );
    let s = parse_to_string(src);
    let fn_at = s.find("\"FunctionExpression\"").unwrap();
    assert_key_order(&s[fn_at..], "\"params\"", "\"body\"", "\"typeParameters\"");
}

// #1692: the TS optional-parameter marker (`b?`) must round-trip as
// `optional: true` (after `name`, before `typeAnnotation`, omitted when false).

fn first_param<'a>(ast: &'a Value, ty: &str) -> &'a Value {
    let node = find_node(ast, ty).unwrap_or_else(|| panic!("{ty} must be present"));
    &node
        .get("params")
        .and_then(|p| p.as_array())
        .expect("params")[0]
}

#[test]
fn optional_parameter_marker_on_function_declaration() {
    let ast = parse_to_json("<script lang=\"ts\">function f(b?: number){}</script>");
    let p = first_param(&ast, "FunctionDeclaration");
    assert_eq!(p.pointer("/name").and_then(|v| v.as_str()), Some("b"));
    assert_eq!(p.get("optional"), Some(&Value::Bool(true)));
    // The identifier span extends over the annotation (matching acorn).
    assert_eq!(p.get("end").and_then(|v| v.as_u64()), Some(39));
    assert_eq!(
        p.pointer("/typeAnnotation/typeAnnotation/type")
            .and_then(|v| v.as_str()),
        Some("TSNumberKeyword")
    );
}

#[test]
fn optional_parameter_marker_on_arrow() {
    let ast = parse_to_json("<script lang=\"ts\">const g = (b?: number) => {};</script>");
    let p = first_param(&ast, "ArrowFunctionExpression");
    assert_eq!(p.get("optional"), Some(&Value::Bool(true)));
    assert_eq!(
        p.pointer("/typeAnnotation/typeAnnotation/type")
            .and_then(|v| v.as_str()),
        Some("TSNumberKeyword")
    );
}

#[test]
fn optional_parameter_without_annotation_extends_span_over_question_mark() {
    let ast = parse_to_json("<script lang=\"ts\">function f(b?){}</script>");
    let p = first_param(&ast, "FunctionDeclaration");
    assert_eq!(p.get("optional"), Some(&Value::Bool(true)));
    // `b?` spans bytes 29..31 (the `?` is included), with no typeAnnotation.
    assert_eq!(p.get("start").and_then(|v| v.as_u64()), Some(29));
    assert_eq!(p.get("end").and_then(|v| v.as_u64()), Some(31));
    assert!(p.get("typeAnnotation").is_none());
}

#[test]
fn required_parameter_omits_optional() {
    let ast = parse_to_json("<script lang=\"ts\">function f(b: number){}</script>");
    let p = first_param(&ast, "FunctionDeclaration");
    assert!(p.get("optional").is_none());
    // `optional` must sit before `typeAnnotation` when present.
    let s = parse_to_string("<script lang=\"ts\">function f(b?: number){}</script>");
    assert_key_order(&s, "\"name\"", "\"optional\"", "\"typeAnnotation\"");
}
