//! `parse()` reported a class `implements` clause as the boolean `true`, so
//! `ClassDeclaration.implements#type` sat in the parse-AST ratchet on both the
//! modern and the legacy axis (#4133). acorn-typescript emits an array of
//! `TSExpressionWithTypeArguments` between `superClass` and `body` — the same
//! node it gives an interface `extends` clause, down to naming the
//! instantiation `typeParameters`.
//!
//! Only `parse()` ever read the field, which is why the boolean went unnoticed;
//! the ratchet is a corpus instrument and the export forms have no corpus
//! carrier, so the shapes are pinned here.
//!
//! Every expectation below is read out of `submodules/svelte`'s own
//! `parse(src, { modern: true })`, not from rsvelte's output — and out of it
//! after a `JSON.parse(JSON.stringify(...))` round-trip, because
//! acorn-typescript leaves `typeParameters: undefined` an own property that
//! `Object.keys` reports and the gate's own comparison never sees.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};
use serde_json::Value;

fn ast(source: &str) -> Value {
    let allocator = oxc_allocator::Allocator::default();
    let parsed = parse(source, &allocator, ParseOptions::default()).expect("parse should succeed");
    with_serialize_arena(&parsed.arena, || serde_json::to_value(&parsed).unwrap())
}

fn find<'a>(value: &'a Value, node_type: &str) -> Option<&'a Value> {
    match value {
        Value::Object(map) => {
            if map.get("type").and_then(Value::as_str) == Some(node_type) {
                return Some(value);
            }
            map.values().find_map(|v| find(v, node_type))
        }
        Value::Array(items) => items.iter().find_map(|v| find(v, node_type)),
        _ => None,
    }
}

fn keys(node: &Value) -> Vec<&str> {
    node.as_object()
        .expect("object node")
        .keys()
        .map(String::as_str)
        .collect()
}

fn slice<'a>(source: &'a str, node: &Value) -> &'a str {
    let start = node.get("start").and_then(Value::as_u64).unwrap() as usize;
    let end = node.get("end").and_then(Value::as_u64).unwrap() as usize;
    &source[start..end]
}

fn class_in(source: &str) -> Value {
    let tree = ast(source);
    find(&tree, "ClassDeclaration")
        .expect("ClassDeclaration present")
        .clone()
}

fn implements_of(node: &Value) -> &Vec<Value> {
    node.get("implements")
        .and_then(Value::as_array)
        .expect("implements is an array")
}

#[test]
fn a_single_clause_is_a_ts_expression_with_type_arguments() {
    let source = "<script lang=\"ts\">\nclass A implements B {}\n</script>";
    let class = class_in(source);
    let clauses = implements_of(&class);

    assert_eq!(clauses.len(), 1);
    let clause = &clauses[0];
    assert_eq!(
        keys(clause),
        vec!["type", "start", "end", "loc", "expression"]
    );
    assert_eq!(
        clause.get("type").and_then(Value::as_str),
        Some("TSExpressionWithTypeArguments")
    );
    assert_eq!(slice(source, clause), "B");

    let expression = clause.get("expression").expect("expression present");
    assert_eq!(
        expression.get("type").and_then(Value::as_str),
        Some("Identifier")
    );
    assert_eq!(expression.get("name").and_then(Value::as_str), Some("B"));
    assert_eq!(slice(source, expression), "B");
}

#[test]
fn a_clause_with_type_arguments_names_them_type_parameters() {
    let source = "<script lang=\"ts\">\nclass A implements B, C<D> {}\n</script>";
    let class = class_in(source);
    let clauses = implements_of(&class);

    assert_eq!(clauses.len(), 2);
    assert_eq!(slice(source, &clauses[0]), "B");

    let second = &clauses[1];
    assert_eq!(
        keys(second),
        vec![
            "type",
            "start",
            "end",
            "loc",
            "expression",
            "typeParameters"
        ]
    );
    assert_eq!(slice(source, second), "C<D>");
    assert_eq!(
        second
            .get("expression")
            .and_then(|e| e.get("name"))
            .and_then(Value::as_str),
        Some("C")
    );

    let arguments = second
        .get("typeParameters")
        .expect("typeParameters present");
    assert_eq!(
        arguments.get("type").and_then(Value::as_str),
        Some("TSTypeParameterInstantiation")
    );
    assert_eq!(slice(source, arguments), "<D>");
    let params = arguments
        .get("params")
        .and_then(Value::as_array)
        .expect("params array");
    assert_eq!(params.len(), 1);
    assert_eq!(
        params[0].get("type").and_then(Value::as_str),
        Some("TSTypeReference")
    );
    assert_eq!(slice(source, &params[0]), "D");
}

#[test]
fn implements_sits_between_super_class_and_body() {
    let source = "<script lang=\"ts\">\nclass A<T> extends X<Y> implements B {}\n</script>";
    let class = class_in(source);

    assert_eq!(
        keys(&class),
        vec![
            "type",
            "start",
            "end",
            "loc",
            "id",
            "typeParameters",
            "superClass",
            "superTypeParameters",
            "implements",
            "body"
        ]
    );
}

/// Live control: the field is absent, not `false` or `[]`, on the plain-JS
/// majority — the shape every non-TypeScript component gets.
#[test]
fn a_class_without_the_clause_omits_the_field() {
    let class = class_in("<script lang=\"ts\">\nclass A {}\n</script>");

    assert_eq!(class.get("implements"), None);
    assert_eq!(
        keys(&class),
        vec!["type", "start", "end", "loc", "id", "superClass", "body"]
    );
}

#[test]
fn an_exported_class_keeps_the_clause() {
    let source = "<script lang=\"ts\">\nexport class A implements B {}\n</script>";
    let class = class_in(source);

    assert_eq!(
        keys(&class),
        vec![
            "type",
            "start",
            "end",
            "loc",
            "id",
            "superClass",
            "implements",
            "body"
        ]
    );
    assert_eq!(slice(source, &implements_of(&class)[0]), "B");
}

#[test]
fn an_export_default_class_keeps_the_clause() {
    let source = "<script lang=\"ts\">\nexport default class A implements B {}\n</script>";
    let class = class_in(source);

    assert_eq!(
        keys(&class),
        vec![
            "type",
            "start",
            "end",
            "loc",
            "id",
            "superClass",
            "implements",
            "body"
        ]
    );
    assert_eq!(slice(source, &implements_of(&class)[0]), "B");
}

/// Live control for the clause builder both heritage lists now share: an
/// interface `extends` entry is the same node and must not have moved.
#[test]
fn an_interface_extends_entry_is_unchanged() {
    let source = "<script lang=\"ts\">\ninterface I extends J<K> {}\n</script>";
    let tree = ast(source);
    let interface = find(&tree, "TSInterfaceDeclaration").expect("TSInterfaceDeclaration present");

    assert_eq!(
        keys(interface),
        vec!["type", "start", "end", "loc", "id", "extends", "body"]
    );
    let extends = interface
        .get("extends")
        .and_then(Value::as_array)
        .expect("extends array");
    assert_eq!(extends.len(), 1);
    assert_eq!(
        keys(&extends[0]),
        vec![
            "type",
            "start",
            "end",
            "loc",
            "expression",
            "typeParameters"
        ]
    );
    assert_eq!(slice(source, &extends[0]), "J<K>");
    assert_eq!(
        extends[0]
            .get("typeParameters")
            .and_then(|a| a.get("type"))
            .and_then(Value::as_str),
        Some("TSTypeParameterInstantiation")
    );
}
