//! Follow-up to #1648: the remaining TS assertion forms it deferred —
//! `TSTypeAssertion` (`<T>x`), `TSInstantiationExpression` (`f<T>`), and a
//! non-null `!` sitting inside an optional chain — must also be preserved in the
//! public `parse()` AST (mirroring svelte/compiler) and erased at compile time.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{CompileOptions, GenerateMode, ParseOptions, compile, parse};
use serde_json::Value;

fn parse_to_value(source: &str) -> Value {
    let ast = parse(source, ParseOptions::default()).expect("parse should succeed");
    with_serialize_arena(&ast.arena, || serde_json::to_value(&ast).unwrap())
}

/// Depth-first search for the first node whose `type` equals `ty`.
fn find_node<'a>(v: &'a Value, ty: &str) -> Option<&'a Value> {
    match v {
        Value::Object(map) => {
            if map.get("type").and_then(|t| t.as_str()) == Some(ty) {
                return Some(v);
            }
            for (_, child) in map {
                if let Some(found) = find_node(child, ty) {
                    return Some(found);
                }
            }
            None
        }
        Value::Array(arr) => arr.iter().find_map(|c| find_node(c, ty)),
        _ => None,
    }
}

/// Ordered keys of an object node (serde_json `preserve_order` is enabled, so
/// this reflects svelte/compiler's serialization order).
fn keys_of(node: &Value) -> Vec<&str> {
    node.as_object()
        .map(|m| m.keys().map(String::as_str).collect())
        .unwrap_or_default()
}

// ── parse-shape: TSTypeAssertion (`<T>x`) ──────────────────────────────────

#[test]
fn ts_type_assertion_preserves_wrapper_type_annotation_before_expression() {
    let source = "<script lang=\"ts\">let a = <string>'';</script>";
    let ast = parse_to_value(source);
    let node = find_node(&ast, "TSTypeAssertion").expect("TSTypeAssertion must be preserved");

    assert_eq!(
        node.pointer("/expression/type").and_then(Value::as_str),
        Some("Literal")
    );
    assert_eq!(
        node.pointer("/typeAnnotation/type").and_then(Value::as_str),
        Some("TSStringKeyword")
    );
    // svelte/compiler emits `typeAnnotation` before `expression`.
    let keys = keys_of(node);
    let ta = keys.iter().position(|k| *k == "typeAnnotation").unwrap();
    let ex = keys.iter().position(|k| *k == "expression").unwrap();
    assert!(
        ta < ex,
        "typeAnnotation must serialize before expression, keys: {keys:?}"
    );
}

// ── parse-shape: TSInstantiationExpression (`f<T>`) ────────────────────────

#[test]
fn ts_instantiation_preserves_wrapper_and_type_arguments() {
    let source = "<script lang=\"ts\">const e = f<number>;</script>";
    let ast = parse_to_value(source);
    let node =
        find_node(&ast, "TSInstantiationExpression").expect("TSInstantiationExpression preserved");

    assert_eq!(
        node.pointer("/expression/name").and_then(Value::as_str),
        Some("f")
    );
    assert_eq!(
        node.pointer("/typeArguments/type").and_then(Value::as_str),
        Some("TSTypeParameterInstantiation")
    );
}

// ── parse-shape: non-null inside an optional chain (`a!?.b`) ────────────────

#[test]
fn non_null_inside_optional_chain_preserves_wrapper() {
    let source = "<script lang=\"ts\">let x = a!?.b;</script>";
    let ast = parse_to_value(source);
    // The chain's member object is the `a!` non-null assertion.
    let member = find_node(&ast, "MemberExpression").expect("MemberExpression");
    assert_eq!(
        member.pointer("/object/type").and_then(Value::as_str),
        Some("TSNonNullExpression")
    );
    assert_eq!(
        member
            .pointer("/object/expression/name")
            .and_then(Value::as_str),
        Some("a")
    );
}

#[test]
fn non_null_as_member_object_preserves_wrapper() {
    // `a!.b` — plain member access whose object is a non-null assertion.
    let source = "<script lang=\"ts\">let x = a!.b;</script>";
    let ast = parse_to_value(source);
    let member = find_node(&ast, "MemberExpression").expect("MemberExpression");
    assert_eq!(
        member.pointer("/object/type").and_then(Value::as_str),
        Some("TSNonNullExpression")
    );
}

// ── parse-shape: template expression tag ───────────────────────────────────

#[test]
fn ts_type_assertion_in_template_expression_tag_preserved() {
    let source = "<script lang=\"ts\">let d = 0;</script>{<number>d}";
    let ast = parse_to_value(source);
    let node = find_node(&ast, "TSTypeAssertion").expect("TSTypeAssertion in template preserved");
    assert_eq!(
        node.pointer("/typeAnnotation/type").and_then(Value::as_str),
        Some("TSNumberKeyword")
    );
}

// ── codegen erasure: compile output must not carry the assertions ──────────

fn client_code(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("client compile should succeed")
    .js
    .code
}

fn server_code(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("server compile should succeed")
    .js
    .code
}

#[test]
fn type_assertion_and_instantiation_erased_from_codegen() {
    // `<T>x` and `f<T>` used in a template expression must not leak their type
    // syntax (or an `Unknown:` placeholder) into client or server output.
    let source = "<script lang=\"ts\">let d = 0; function f<T>(): number { return 0; }</script>{<number>d}{f<number>()}";
    for code in [client_code(source), server_code(source)] {
        assert!(
            !code.contains("Unknown:"),
            "TS wrapper leaked into codegen:\n{code}"
        );
        assert!(
            !code.contains("<number>"),
            "type assertion leaked into codegen:\n{code}"
        );
    }
}

#[test]
fn non_null_in_chain_erased_from_codegen() {
    let source = "<script lang=\"ts\">let a = { b: 1 };</script>{a!?.b}";
    for code in [client_code(source), server_code(source)] {
        assert!(
            !code.contains("Unknown:"),
            "TS wrapper leaked into codegen:\n{code}"
        );
    }
}
