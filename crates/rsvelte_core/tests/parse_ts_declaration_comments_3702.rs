//! Regression coverage for the TypeScript-declaration half of #3702.
//!
//! The public `parse()` AST used to omit whole interface and type-alias
//! declarations. Its comment walker then skipped every comment owned by those
//! absent subtrees, so comments on the declaration and its members disappeared.

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

fn comment_count(node: &Value, field: &str) -> usize {
    node.get(field)
        .and_then(Value::as_array)
        .map_or(0, Vec::len)
}

#[test]
fn declarations_and_member_comments_survive_parse_serialization() {
    let ast = parse_to_json(
        r#"<script lang="ts">
// interface docs
interface Props {
  name: string, // property docs
  ready(): void
}

// alias docs
type Alias<T> = T | null;
</script>"#,
    );

    let interface = find_node(&ast, "TSInterfaceDeclaration").expect("interface declaration");
    assert_eq!(comment_count(interface, "leadingComments"), 1);
    assert!(interface.get("loc").is_some(), "interface loc must survive");
    assert!(
        interface.get("typeParameters").is_none(),
        "Acorn omits absent interface type parameters"
    );
    assert!(
        interface.get("extends").is_none(),
        "Acorn omits an empty interface heritage list"
    );

    let property = find_node(interface, "TSPropertySignature").expect("property signature");
    let type_annotation = property
        .get("typeAnnotation")
        .expect("property type annotation");
    assert_eq!(comment_count(type_annotation, "trailingComments"), 1);

    let method = find_node(interface, "TSMethodSignature").expect("method signature");
    assert_eq!(method.get("computed"), Some(&Value::Bool(false)));
    assert_eq!(method.get("kind").and_then(Value::as_str), Some("method"));
    assert_eq!(
        method
            .get("parameters")
            .and_then(Value::as_array)
            .map(Vec::len),
        Some(0)
    );
    assert_eq!(
        method
            .pointer("/typeAnnotation/typeAnnotation/type")
            .and_then(Value::as_str),
        Some("TSVoidKeyword")
    );

    let alias = find_node(&ast, "TSTypeAliasDeclaration").expect("type alias declaration");
    assert_eq!(comment_count(alias, "leadingComments"), 1);
    assert_eq!(
        alias
            .pointer("/typeParameters/type")
            .and_then(Value::as_str),
        Some("TSTypeParameterDeclaration")
    );
    assert_eq!(
        alias
            .pointer("/typeAnnotation/type")
            .and_then(Value::as_str),
        Some("TSUnionType")
    );
}

#[test]
fn comments_inside_an_export_default_interface_are_walked() {
    let ast = parse_to_json(
        r#"<script lang="ts">
export default interface Props {
  // member docs
  value: string
}
</script>"#,
    );

    let export = find_node(&ast, "ExportDefaultDeclaration").expect("default export");
    let interface = export
        .get("declaration")
        .expect("exported interface declaration");
    assert_eq!(
        interface.get("type").and_then(Value::as_str),
        Some("TSInterfaceDeclaration")
    );
    let property = find_node(interface, "TSPropertySignature").expect("property signature");
    assert_eq!(comment_count(property, "leadingComments"), 1);
}
