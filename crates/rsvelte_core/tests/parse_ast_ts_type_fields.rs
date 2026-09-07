//! `parse()` is a public export, and until these fields were emitted its output
//! described a TypeScript script with every type erased: acorn-typescript
//! stamps the annotation on the node, and rsvelte dropped it. One test per
//! field, because a single "all nine agree" assertion is satisfied by the eight
//! that already work.
//!
//! Every expected value here was printed by the official compiler
//! (`submodules/svelte/.../compiler/index.js`, the entry point the gates use)
//! and pasted; none was read back out of rsvelte, which would pass whenever the
//! two are broken the same way. The offsets are absolute into `ts()`'s wrapper,
//! so changing that helper invalidates them.
//!
//! The absence rows are not decoration. `definite` and the annotation fields
//! are omitted rather than written empty, so a port that always emits them
//! diverges on every plain script — the direction no positive row can see.

use rsvelte_core::ast::arena::CommentCaptureGuard;
use rsvelte_core::{ParseOptions, convert_to_legacy, parse};
use serde_json::Value;

fn modern_ast(source: &str) -> Value {
    let _capture = CommentCaptureGuard::new();
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern: true,
            skip_expression_loc: true,
            capture_comments: true,
            ..Default::default()
        },
    )
    .expect("parse should succeed");
    convert_to_legacy(source, ast)
}

fn ts(body: &str) -> String {
    format!("<script lang=\"ts\">\n\t{body}\n</script>\n<i>x</i>")
}

fn js(body: &str) -> String {
    format!("<script>\n\t{body}\n</script>\n<i>x</i>")
}

/// Every node of `type` anywhere in the tree. The ratchet keys these fields by
/// node type rather than by position, so the assertion has to as well.
fn collect(node: &Value, ty: &str, out: &mut Vec<Value>) {
    match node {
        Value::Array(items) => {
            for item in items {
                collect(item, ty, out);
            }
        }
        Value::Object(map) => {
            if map.get("type").and_then(Value::as_str) == Some(ty) {
                out.push(node.clone());
            }
            for value in map.values() {
                collect(value, ty, out);
            }
        }
        _ => {}
    }
}

/// The first node of `ty` that carries `field`, or `None` when none does.
fn field_of(source: &str, ty: &str, field: &str) -> Option<Value> {
    let ast = modern_ast(source);
    let mut nodes = Vec::new();
    collect(&ast, ty, &mut nodes);
    assert!(
        !nodes.is_empty(),
        "no {ty} in the tree at all - the cell does not reach the field"
    );
    nodes
        .into_iter()
        .find(|n| n.get(field).is_some())
        .map(|n| n[field].clone())
}

fn expect_field(source: &str, ty: &str, field: &str) -> Value {
    field_of(source, ty, field).unwrap_or_else(|| panic!("no {ty} carries `{field}`"))
}

/// `start`/`end` are what separate an emitted-at-the-wrong-offset field from a
/// correct one, and presence alone cannot see the difference.
fn assert_span(node: &Value, ty: &str, start: u64, end: u64) {
    assert_eq!(node["type"], ty, "{node}");
    assert_eq!(node["start"].as_u64(), Some(start), "{node}");
    assert_eq!(node["end"].as_u64(), Some(end), "{node}");
}

#[test]
fn a_call_expression_keeps_its_type_arguments() {
    let v = expect_field(&ts("f<number>(1);"), "CallExpression", "typeArguments");
    assert_span(&v, "TSTypeParameterInstantiation", 21, 29);
    assert_span(&v["params"][0], "TSNumberKeyword", 22, 28);
}

#[test]
fn a_new_expression_keeps_its_type_arguments() {
    let v = expect_field(&ts("new C<number>(1);"), "NewExpression", "typeArguments");
    assert_span(&v, "TSTypeParameterInstantiation", 25, 33);
    assert_span(&v["params"][0], "TSNumberKeyword", 26, 32);
}

#[test]
fn a_function_expression_keeps_its_return_type() {
    let v = expect_field(
        &ts("const g = function (): number { return 1; };"),
        "FunctionExpression",
        "returnType",
    );
    assert_span(&v, "TSTypeAnnotation", 41, 49);
    assert_span(&v["typeAnnotation"], "TSNumberKeyword", 43, 49);
}

#[test]
fn an_arrow_function_keeps_its_return_type() {
    let v = expect_field(
        &ts("const h = (): number => 1;"),
        "ArrowFunctionExpression",
        "returnType",
    );
    assert_span(&v, "TSTypeAnnotation", 32, 40);
    assert_span(&v["typeAnnotation"], "TSNumberKeyword", 34, 40);
}

#[test]
fn a_class_declaration_keeps_its_type_parameters() {
    let v = expect_field(
        &ts("class K<T> { v: T; }"),
        "ClassDeclaration",
        "typeParameters",
    );
    assert_span(&v, "TSTypeParameterDeclaration", 27, 30);
    assert_span(&v["params"][0], "TSTypeParameter", 28, 29);
    assert_eq!(v["params"][0]["name"], "T");
}

#[test]
fn a_class_heritage_keeps_its_super_type_parameters() {
    let v = expect_field(
        &ts("class L extends M<number> {}"),
        "ClassDeclaration",
        "superTypeParameters",
    );
    assert_span(&v, "TSTypeParameterInstantiation", 37, 45);
    assert_span(&v["params"][0], "TSNumberKeyword", 38, 44);
}

#[test]
fn a_method_keeps_its_type_parameters() {
    let v = expect_field(
        &ts("class N { m<T>(x: T) { return x; } }"),
        "MethodDefinition",
        "typeParameters",
    );
    assert_span(&v, "TSTypeParameterDeclaration", 31, 34);
    assert_span(&v["params"][0], "TSTypeParameter", 32, 33);
}

#[test]
fn a_class_property_keeps_its_type_annotation() {
    let v = expect_field(
        &ts("class O { p: number = 1; }"),
        "PropertyDefinition",
        "typeAnnotation",
    );
    assert_span(&v, "TSTypeAnnotation", 31, 39);
    assert_span(&v["typeAnnotation"], "TSNumberKeyword", 33, 39);
}

/// The typed class-element arm bails whenever a property is annotated, so the
/// real producer is the `Value` path -- and there are three of those, in two
/// offset conventions. One test each: a fix reaching one writer looks exactly
/// like a fix reaching all of them.
#[test]
fn a_property_in_a_class_expression_keeps_its_type_annotation() {
    let v = expect_field(
        &ts("const C2 = class { p: number = 1; };"),
        "PropertyDefinition",
        "typeAnnotation",
    );
    assert_span(&v, "TSTypeAnnotation", 40, 48);
    assert_span(&v["typeAnnotation"], "TSNumberKeyword", 42, 48);
}

#[test]
fn an_accessor_property_keeps_its_type_annotation() {
    let v = expect_field(
        &ts("class P { accessor a: number = 1; }"),
        "PropertyDefinition",
        "typeAnnotation",
    );
    assert_span(&v, "TSTypeAnnotation", 40, 48);
    assert_span(&v["typeAnnotation"], "TSNumberKeyword", 42, 48);
}

#[test]
fn an_uninitialized_property_keeps_its_type_annotation() {
    let v = expect_field(
        &ts("class Q { r: string; }"),
        "PropertyDefinition",
        "typeAnnotation",
    );
    assert_span(&v, "TSTypeAnnotation", 31, 39);
    assert_span(&v["typeAnnotation"], "TSStringKeyword", 33, 39);
}

#[test]
fn a_definite_assignment_declarator_is_marked_definite() {
    let v = expect_field(&ts("let q!: number;"), "VariableDeclarator", "definite");
    assert_eq!(v, Value::Bool(true), "{v}");
}

#[test]
fn a_declarator_without_the_bang_omits_definite_entirely() {
    // acorn writes no key rather than `false`, so emitting `false` would
    // diverge on every declarator in every script.
    assert_eq!(
        field_of(&ts("let r: number = 1;"), "VariableDeclarator", "definite"),
        None
    );
    assert_eq!(
        field_of(&js("let r = 1;"), "VariableDeclarator", "definite"),
        None
    );
}

#[test]
fn a_plain_script_emits_no_type_fields() {
    // The over-emission direction: acorn without the TypeScript plugin has no
    // such keys, so a port that always writes them is wrong on ordinary JS.
    let src = js("f(1);\n\tconst g = function () { return 1; };\n\tclass K {}");
    assert_eq!(field_of(&src, "CallExpression", "typeArguments"), None);
    assert_eq!(field_of(&src, "FunctionExpression", "returnType"), None);
    assert_eq!(field_of(&src, "ClassDeclaration", "typeParameters"), None);
    assert_eq!(
        field_of(&src, "ClassDeclaration", "superTypeParameters"),
        None
    );
}
