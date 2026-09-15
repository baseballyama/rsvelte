//! A comment inside a TypeScript *annotation* reaches the public `parse()` AST.
//!
//! Annotations, type arguments, type parameters and return types are serialized
//! from an opaque `Value`, so the nested nodes' own serializers never run and the
//! comment side table was consulted for declarations only. Every context below
//! used to serialize the annotation with no comment at all.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};
use serde_json::Value;

fn parse_to_json(source: &str) -> Value {
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern: true,
            capture_comments: true,
            ..Default::default()
        },
    )
    .expect("parse should succeed");
    with_serialize_arena(&ast.arena, || serde_json::to_value(&ast).unwrap())
}

fn find_node<'a>(value: &'a Value, type_name: &str) -> Option<&'a Value> {
    match value {
        Value::Object(map) => {
            if map.get("type").and_then(Value::as_str) == Some(type_name) {
                return Some(value);
            }
            map.values().find_map(|value| find_node(value, type_name))
        }
        Value::Array(values) => values.iter().find_map(|value| find_node(value, type_name)),
        _ => None,
    }
}

fn leading_texts(node: &Value) -> Vec<String> {
    node.get("leadingComments")
        .and_then(Value::as_array)
        .map(|comments| {
            comments
                .iter()
                .filter_map(|comment| comment.get("value").and_then(Value::as_str))
                .map(str::to_owned)
                .collect()
        })
        .unwrap_or_default()
}

fn property_signature_comments(source: &str) -> Vec<String> {
    let ast = parse_to_json(source);
    let property = find_node(&ast, "TSPropertySignature").expect("property signature");
    leading_texts(property)
}

fn script(body: &str) -> String {
    format!("<script lang=\"ts\">\n{body}\n</script>\n")
}

const ANNOTATION: &str = "{\n\t/** doc */\n\tb: string;\n}";

#[test]
fn every_annotation_context_carries_its_interior_comment() {
    let annotation = ANNOTATION;
    let cases = [
        ("type alias", script(&format!("type T = {annotation};"))),
        (
            "plain declarator",
            script(&format!("let x: {annotation} = {{ b: '' }};")),
        ),
        (
            "destructured declarator",
            script(&format!("let {{ b }}: {annotation} = {{ b: '' }};")),
        ),
        (
            "destructured props",
            script(&format!("let {{ b }}: {annotation} = $props();")),
        ),
        (
            "function parameter",
            script(&format!(
                "function f(p: {annotation}) {{ return p; }}\nf({{ b: '' }});"
            )),
        ),
        (
            "destructured parameter",
            script(&format!(
                "function f({{ b }}: {annotation}) {{ return b; }}\nf({{ b: '' }});"
            )),
        ),
        (
            "as-expression",
            script(&format!("let v = ({{ b: '' }}) as {annotation};")),
        ),
        (
            "type argument",
            script(&format!("let m = new Map<string, {annotation}>();")),
        ),
    ];

    for (label, source) in cases {
        assert_eq!(
            property_signature_comments(&source),
            vec!["* doc "],
            "{label} must keep the comment inside its annotation"
        );
    }
}

#[test]
fn an_uncommented_annotation_gains_no_comment_field() {
    let ast = parse_to_json(&script("let x: { b: string } = { b: '' };"));
    let property = find_node(&ast, "TSPropertySignature").expect("property signature");
    assert!(
        property.get("leadingComments").is_none(),
        "Acorn omits the field entirely when a node owns no comment"
    );
}

#[test]
fn a_return_type_keeps_its_interior_comment() {
    let ast = parse_to_json(&script(
        "function f(): { /** doc */ b: string } {\n\treturn { b: '' };\n}\nf();",
    ));
    let property = find_node(&ast, "TSPropertySignature").expect("property signature");
    assert_eq!(leading_texts(property), vec!["* doc "]);
}
