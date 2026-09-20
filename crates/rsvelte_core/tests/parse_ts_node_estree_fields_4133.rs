//! `parse()` returned `TSParameterProperty` and `Decorator` as bare
//! `{type, start, end}` nodes, so six keys sat in the parse-AST ratchet:
//! `.accessibility#missing`, `.readonly#missing`, `.parameter#missing`,
//! `Decorator.loc#missing` and `Decorator.expression#missing`, on both the
//! modern and the legacy axis (#4133).
//!
//! Both nodes exist only so the TypeScript stripper can raise
//! "not supported", which is why nothing but `parse()` ever read them and why
//! the fields went missing unnoticed. The ratchet is a corpus instrument and a
//! comment-only carrier would not hold it, so the shapes are pinned here.
//!
//! Every expectation below is read out of `submodules/svelte`'s own
//! `parse(src, { modern })`, not from rsvelte's output.

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

fn str_field<'a>(node: &'a Value, key: &str) -> Option<&'a str> {
    node.get(key).and_then(Value::as_str)
}

#[test]
fn a_parameter_property_carries_its_accessibility_readonly_and_parameter() {
    let source =
        "<script lang=\"ts\">class A { constructor(private readonly x: number) {} }</script>";
    let tree = ast(source);
    let node = find(&tree, "TSParameterProperty").expect("TSParameterProperty present");

    assert_eq!(str_field(node, "accessibility"), Some("private"));
    assert_eq!(node.get("readonly").and_then(Value::as_bool), Some(true));

    let parameter = node.get("parameter").expect("parameter present");
    assert_eq!(str_field(parameter, "type"), Some("Identifier"));
    assert_eq!(str_field(parameter, "name"), Some("x"));
    assert!(
        parameter.get("typeAnnotation").is_some(),
        "the parameter keeps its `: number` annotation"
    );

    let start = node.get("start").and_then(Value::as_u64).unwrap() as usize;
    let end = node.get("end").and_then(Value::as_u64).unwrap() as usize;
    assert_eq!(&source[start..end], "private readonly x: number");
    assert!(node.get("loc").is_some(), "the node carries a loc");
}

#[test]
fn an_accessibility_modifier_without_readonly_omits_the_readonly_field() {
    let tree = ast("<script lang=\"ts\">class A { constructor(public y) {} }</script>");
    let node = find(&tree, "TSParameterProperty").expect("TSParameterProperty present");

    assert_eq!(str_field(node, "accessibility"), Some("public"));
    assert!(
        node.get("readonly").is_none(),
        "upstream omits `readonly` rather than writing false, got {node}"
    );
}

#[test]
fn a_plain_constructor_parameter_builds_no_parameter_property() {
    let tree = ast("<script lang=\"ts\">class A { constructor(x: number) {} }</script>");
    assert!(
        find(&tree, "TSParameterProperty").is_none(),
        "the node exists only for a modifier"
    );
}

#[test]
fn a_class_decorator_carries_its_loc_and_expression() {
    let source = "<script lang=\"ts\">@dec\nclass A {}</script>";
    let tree = ast(source);
    let node = find(&tree, "Decorator").expect("Decorator present");

    let expression = node.get("expression").expect("expression present");
    assert_eq!(str_field(expression, "type"), Some("Identifier"));
    assert_eq!(str_field(expression, "name"), Some("dec"));

    let loc = node.get("loc").expect("the node carries a loc");
    assert_eq!(loc["start"]["line"].as_u64(), Some(1));
    assert_eq!(loc["start"]["column"].as_u64(), Some(18));
    assert_eq!(loc["end"]["column"].as_u64(), Some(22));

    let start = node.get("start").and_then(Value::as_u64).unwrap() as usize;
    let end = node.get("end").and_then(Value::as_u64).unwrap() as usize;
    assert_eq!(&source[start..end], "@dec");
}

#[test]
fn a_decorator_expression_is_the_whole_call_not_just_its_callee() {
    let source = "<script lang=\"ts\">@dec({ a: 1 })\nclass A {}</script>";
    let tree = ast(source);
    let node = find(&tree, "Decorator").expect("Decorator present");

    let expression = node.get("expression").expect("expression present");
    assert_eq!(str_field(expression, "type"), Some("CallExpression"));
    let start = expression.get("start").and_then(Value::as_u64).unwrap() as usize;
    let end = expression.get("end").and_then(Value::as_u64).unwrap() as usize;
    assert_eq!(&source[start..end], "dec({ a: 1 })");
}

#[test]
fn an_undecorated_class_builds_no_decorator() {
    let tree = ast("<script lang=\"ts\">class A { m() {} }</script>");
    assert!(find(&tree, "Decorator").is_none());
}
