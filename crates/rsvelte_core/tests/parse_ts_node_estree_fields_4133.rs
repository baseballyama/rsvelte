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

fn all<'a>(value: &'a Value, node_type: &str, out: &mut Vec<&'a Value>) {
    match value {
        Value::Object(map) => {
            if map.get("type").and_then(Value::as_str) == Some(node_type) {
                out.push(value);
            }
            for (key, v) in map {
                if key != "loc" {
                    all(v, node_type, out);
                }
            }
        }
        Value::Array(items) => items.iter().for_each(|v| all(v, node_type, out)),
        _ => {}
    }
}

fn span(node: &Value) -> (u64, u64) {
    (
        node.get("start").and_then(Value::as_u64).unwrap(),
        node.get("end").and_then(Value::as_u64).unwrap(),
    )
}

#[test]
fn a_negative_literal_type_is_a_unary_expression() {
    let tree = ast("<script lang=\"ts\">type A = -1 | -1n;</script>");
    let mut types = Vec::new();
    all(&tree, "TSLiteralType", &mut types);
    let literals: Vec<&Value> = types.iter().map(|t| &t["literal"]).collect();
    assert_eq!(literals.len(), 2);
    assert_eq!(str_field(literals[0], "type"), Some("UnaryExpression"));
    assert_eq!(str_field(literals[0], "operator"), Some("-"));
    assert_eq!(span(literals[0]), (27, 29));
    assert_eq!(literals[0]["argument"]["value"], 1);
    assert_eq!(span(&literals[0]["argument"]), (28, 29));
    assert_eq!(str_field(literals[1], "type"), Some("UnaryExpression"));
    assert_eq!(str_field(&literals[1]["argument"], "bigint"), Some("1"));
    assert_eq!(str_field(&literals[1]["argument"], "raw"), Some("1n"));
}

#[test]
fn a_type_parameter_list_records_its_trailing_comma() {
    let tree = ast("<script lang=\"ts\">const f = <T,>(x: T) => x;</script>");
    let decl = find(&tree, "TSTypeParameterDeclaration").unwrap();
    assert_eq!(decl["extra"]["trailingComma"], 30);
    let tree = ast("<script lang=\"ts\">const f = <T>(x: T) => x;</script>");
    let decl = find(&tree, "TSTypeParameterDeclaration").unwrap();
    assert!(decl.get("extra").is_none());
}

#[test]
fn regex_flags_keep_their_source_order() {
    let tree = ast("<script>const r = /a/ig;</script>");
    let literal = find(&tree, "Literal").unwrap();
    assert_eq!(literal["regex"]["flags"], "ig");
}

#[test]
fn an_optional_call_inside_a_member_chain_stays_optional() {
    let tree = ast("<script>const o = a?.find?.(1).value;</script>");
    let call = find(&tree, "CallExpression").unwrap();
    assert_eq!(span(call), (18, 30));
    assert_eq!(call["optional"], true);
}

#[test]
fn a_decorator_call_has_no_optional_and_starts_at_its_callee() {
    let tree = ast("<script lang=\"ts\">@dec() class D {}\n@(x?.y)() class G {}</script>");
    let mut decorators = Vec::new();
    all(&tree, "Decorator", &mut decorators);
    assert_eq!(decorators.len(), 2);
    assert!(decorators[0]["expression"].get("optional").is_none());
    assert_eq!(span(&decorators[1]["expression"]), (38, 45));
    assert!(decorators[1]["expression"].get("optional").is_none());
    assert_eq!(
        decorators[1]["expression"]["callee"]["expression"]["optional"],
        true
    );
}

#[test]
fn a_private_brand_check_is_a_binary_in_expression() {
    let tree = ast("<script>class P { #v; static has(o) { return #v in o; } }</script>");
    let binary = find(&tree, "BinaryExpression").unwrap();
    assert_eq!(span(binary), (45, 52));
    assert_eq!(str_field(binary, "operator"), Some("in"));
    assert_eq!(
        str_field(&binary["left"], "type"),
        Some("PrivateIdentifier")
    );
    assert_eq!(str_field(&binary["left"], "name"), Some("v"));
    assert_eq!(span(&binary["left"]), (45, 47));
}

#[test]
fn a_typescript_template_expression_parses_await_as_a_module_would() {
    let tree = ast("<script lang=\"ts\">let a;</script>\n{await (a)}");
    let await_expr = find(&tree, "AwaitExpression").expect("AwaitExpression present");
    assert_eq!(span(await_expr), (35, 44));
    assert_eq!(span(&await_expr["argument"]), (42, 43));
}

#[test]
fn a_computed_signature_key_keeps_its_expression() {
    let tree = ast("<script lang=\"ts\">const K = \"k\"; interface W { [K]?: number }</script>");
    let signature = find(&tree, "TSPropertySignature").unwrap();
    assert_eq!(str_field(&signature["key"], "name"), Some("K"));
    assert_eq!(span(&signature["key"]), (48, 49));
}

#[test]
fn an_async_arrow_rest_parameter_ends_before_its_annotation() {
    let tree = ast("<script lang=\"ts\">const a = async (...args: any) => 1;</script>");
    let rest = find(&tree, "RestElement").unwrap();
    assert_eq!(span(rest), (35, 42));
    let tree = ast("<script lang=\"ts\">const a = (...args: any) => 1;</script>");
    let rest = find(&tree, "RestElement").unwrap();
    assert_eq!(span(rest), (29, 41));
}

#[test]
fn a_generic_method_value_starts_at_its_parameters() {
    let tree = ast("<script lang=\"ts\">class M { m<U>(u: U) {} }</script>");
    let function = find(&tree, "FunctionExpression").unwrap();
    assert_eq!(span(function), (32, 41));
}

#[test]
fn a_script_spread_attribute_is_read_as_a_static_name() {
    let tree = ast("<script {...wheee}></script>");
    let attribute = find(&tree["instance"], "Attribute").unwrap();
    assert_eq!(str_field(attribute, "name"), Some("{...wheee}"));
    assert_eq!(span(attribute), (8, 18));
    assert_eq!(attribute["value"], true);
    assert_eq!(attribute["name_loc"]["end"]["character"], 18);
}
