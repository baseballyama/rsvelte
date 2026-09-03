//! The seven `TSType` variants that used to fall through `convert_ts_type`'s
//! catch-all and serialize as a span-bearing `TSUnknownKeyword` stub.
//!
//! Every expected value here — node types, field names and byte offsets — was
//! printed from `submodules/svelte/.../compiler/index.js`, not inferred from
//! rsvelte's own output. The inputs are ASCII-only, so byte and UTF-16 offsets
//! coincide.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};
use serde_json::Value;

fn parse_to_json(source: &str) -> Value {
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern: true,
            ..Default::default()
        },
    )
    .expect("parse should succeed");
    serde_json::from_str(&with_serialize_arena(&ast.arena, || {
        serde_json::to_string(&ast).unwrap()
    }))
    .unwrap()
}

/// The `typeAnnotation` of the first instance-script statement, which every
/// input below spells as a `type X = …` alias.
fn alias_annotation(body: &str) -> Value {
    let ast = parse_to_json(&format!("<script lang=\"ts\">{body}</script>"));
    ast.pointer("/instance/content/body/0/typeAnnotation")
        .unwrap_or_else(|| panic!("no alias annotation for: {body}"))
        .clone()
}

fn ty(value: &Value, pointer: &str) -> String {
    value
        .pointer(&format!("{pointer}/type"))
        .and_then(|v| v.as_str())
        .unwrap_or_else(|| panic!("no type at {pointer} in {value}"))
        .to_string()
}

fn at(value: &Value, pointer: &str) -> (u64, u64) {
    let node = value
        .pointer(pointer)
        .unwrap_or_else(|| panic!("no node at {pointer} in {value}"));
    (
        node["start"].as_u64().expect("start"),
        node["end"].as_u64().expect("end"),
    )
}

#[test]
fn conditional_type_carries_its_four_arms() {
    let annotation = alias_annotation("type C<T> = T extends string ? 1 : 2;");
    assert_eq!(ty(&annotation, ""), "TSConditionalType");
    assert_eq!(at(&annotation, ""), (30, 54));
    assert_eq!(ty(&annotation, "/checkType"), "TSTypeReference");
    assert_eq!(ty(&annotation, "/extendsType"), "TSStringKeyword");
    assert_eq!(ty(&annotation, "/trueType"), "TSLiteralType");
    assert_eq!(ty(&annotation, "/falseType"), "TSLiteralType");
    assert_eq!(at(&annotation, "/extendsType"), (40, 46));
}

#[test]
fn infer_type_carries_a_type_parameter_with_its_constraint() {
    let bare = alias_annotation("type E<T> = T extends Array<infer U> ? U : never;");
    let infer = bare
        .pointer("/extendsType/typeArguments/params/0")
        .expect("infer under the type arguments")
        .clone();
    assert_eq!(ty(&infer, ""), "TSInferType");
    assert_eq!(at(&infer, ""), (46, 53));
    assert_eq!(ty(&infer, "/typeParameter"), "TSTypeParameter");
    assert_eq!(at(&infer, "/typeParameter"), (52, 53));
    assert_eq!(infer["typeParameter"]["name"], "U");
    assert!(infer["typeParameter"].get("constraint").is_none());

    let constrained =
        alias_annotation("type F<T> = T extends Array<infer U extends string> ? U : never;");
    let infer = constrained
        .pointer("/extendsType/typeArguments/params/0")
        .expect("infer under the type arguments")
        .clone();
    assert_eq!(at(&infer, ""), (46, 68));
    assert_eq!(at(&infer, "/typeParameter"), (52, 68));
    assert_eq!(ty(&infer, "/typeParameter/constraint"), "TSStringKeyword");
}

#[test]
fn mapped_type_synthesizes_one_type_parameter_from_key_and_constraint() {
    let plain = alias_annotation("type M = { [K in \"a\"]: number };");
    assert_eq!(ty(&plain, ""), "TSMappedType");
    assert_eq!(at(&plain, ""), (27, 49));
    // acorn-typescript spans the synthesized parameter over `K in "a"`.
    assert_eq!(at(&plain, "/typeParameter"), (30, 38));
    assert_eq!(plain["typeParameter"]["name"], "K");
    assert_eq!(ty(&plain, "/typeParameter/constraint"), "TSLiteralType");
    assert_eq!(plain["nameType"], Value::Null);
    assert_eq!(ty(&plain, "/typeAnnotation"), "TSNumberKeyword");
    assert!(plain.get("optional").is_none());
    assert!(plain.get("readonly").is_none());

    // A bare modifier is `true`; `+`/`-` keep their source spelling.
    let bare = alias_annotation("type M2 = { readonly [K in \"a\" as `x${K}`]?: number };");
    assert_eq!(bare["readonly"], Value::Bool(true));
    assert_eq!(bare["optional"], Value::Bool(true));
    assert_eq!(ty(&bare, "/nameType"), "TSLiteralType");

    let minus = alias_annotation("type M3 = { -readonly [K in \"a\"]-?: number };");
    assert_eq!(minus["readonly"], "-");
    assert_eq!(minus["optional"], "-");

    let plus = alias_annotation("type M4 = { +readonly [K in \"a\"]+?: number };");
    assert_eq!(plus["readonly"], "+");
    assert_eq!(plus["optional"], "+");

    // `nameType` is always present; `typeAnnotation` is omitted when absent.
    let no_annotation = alias_annotation("type M5 = { [K in \"a\"] };");
    assert_eq!(no_annotation["nameType"], Value::Null);
    assert!(no_annotation.get("typeAnnotation").is_none());
}

#[test]
fn type_query_carries_expr_name_and_type_arguments() {
    let ast = parse_to_json("<script lang=\"ts\">const q = 1; type Q = typeof q;</script>");
    let query = ast
        .pointer("/instance/content/body/1/typeAnnotation")
        .expect("alias annotation")
        .clone();
    assert_eq!(ty(&query, ""), "TSTypeQuery");
    assert_eq!(at(&query, ""), (40, 48));
    assert_eq!(ty(&query, "/exprName"), "Identifier");
    assert_eq!(at(&query, "/exprName"), (47, 48));
    assert!(query.get("typeArguments").is_none());

    let dotted =
        parse_to_json("<script lang=\"ts\">declare const n: any; type Q = typeof n.a.b;</script>");
    let query = dotted
        .pointer("/instance/content/body/1/typeAnnotation")
        .expect("alias annotation")
        .clone();
    assert_eq!(ty(&query, "/exprName"), "TSQualifiedName");
    assert_eq!(ty(&query, "/exprName/left"), "TSQualifiedName");
    assert_eq!(ty(&query, "/exprName/right"), "Identifier");

    // No `declare function g` to bind: `parse()` does not resolve the operand,
    // and rsvelte drops a `TSDeclareFunction` from the body altogether.
    let with_args = alias_annotation("type Q2 = typeof g<number>;");
    assert_eq!(at(&with_args, ""), (28, 44));
    let query = with_args;
    assert_eq!(ty(&query, "/typeArguments"), "TSTypeParameterInstantiation");

    // `typeof import('x')` reaches the import-type builder through `exprName`.
    let of_import = alias_annotation("type Q3 = typeof import(\"x\");");
    assert_eq!(ty(&of_import, "/exprName"), "TSImportType");
    assert_eq!(at(&of_import, "/exprName"), (35, 46));
}

#[test]
fn import_type_names_its_specifier_argument() {
    let plain = alias_annotation("type I = import(\"x\").T;");
    assert_eq!(ty(&plain, ""), "TSImportType");
    assert_eq!(at(&plain, ""), (27, 40));
    // acorn-typescript calls the specifier `argument`, where oxc calls it `source`.
    assert_eq!(ty(&plain, "/argument"), "Literal");
    assert_eq!(plain["argument"]["value"], "x");
    assert_eq!(plain["argument"]["raw"], "\"x\"");
    assert_eq!(at(&plain, "/argument"), (34, 37));
    assert_eq!(ty(&plain, "/qualifier"), "Identifier");
    assert_eq!(at(&plain, "/qualifier"), (39, 40));

    let dotted = alias_annotation("type I2 = import(\"x\").A.B;");
    assert_eq!(ty(&dotted, "/qualifier"), "TSQualifiedName");
    assert_eq!(ty(&dotted, "/qualifier/left"), "Identifier");
    assert_eq!(ty(&dotted, "/qualifier/right"), "Identifier");

    let with_args = alias_annotation("type I3 = import(\"x\").T<number>;");
    assert_eq!(
        ty(&with_args, "/typeArguments"),
        "TSTypeParameterInstantiation"
    );
    assert_eq!(ty(&with_args, "/typeArguments/params/0"), "TSNumberKeyword");
}

#[test]
fn type_predicate_carries_parameter_name_asserts_and_annotation() {
    // A predicate is return-position-only, and rsvelte does not yet emit a
    // function DECLARATION's `returnType`, so a `TSFunctionType` is the host
    // that reaches this arm today.
    let plain = alias_annotation("type P = (a: unknown) => a is string;");
    let predicate = plain["typeAnnotation"]["typeAnnotation"].clone();
    assert_eq!(ty(&predicate, ""), "TSTypePredicate");
    assert_eq!(at(&predicate, ""), (43, 54));
    assert_eq!(ty(&predicate, "/parameterName"), "Identifier");
    assert_eq!(predicate["asserts"], Value::Bool(false));
    // The predicate's own annotation is a `TSTypeAnnotation` wrapper.
    assert_eq!(ty(&predicate, "/typeAnnotation"), "TSTypeAnnotation");
    assert_eq!(
        ty(&predicate, "/typeAnnotation/typeAnnotation"),
        "TSStringKeyword"
    );

    let asserts = alias_annotation("type P2 = (a: unknown) => asserts a is string;");
    let predicate = asserts["typeAnnotation"]["typeAnnotation"].clone();
    assert_eq!(predicate["asserts"], Value::Bool(true));

    // `asserts x` with no `is` keeps a present-but-null `typeAnnotation`.
    let bare = alias_annotation("type P3 = (a: unknown) => asserts a;");
    let predicate = bare["typeAnnotation"]["typeAnnotation"].clone();
    assert_eq!(predicate["typeAnnotation"], Value::Null);
    assert_eq!(predicate["asserts"], Value::Bool(true));

    // A `this` predicate names the parameter with a `TSThisType` node.
    let this = alias_annotation("type P4 = (this: unknown) => this is string;");
    let predicate = this["typeAnnotation"]["typeAnnotation"].clone();
    assert_eq!(ty(&predicate, "/parameterName"), "TSThisType");
}

#[test]
fn template_literal_type_is_a_ts_literal_type_over_a_template_literal() {
    // acorn-typescript has no `TSTemplateLiteralType` node at all.
    let annotation = alias_annotation("type T1 = `a${string}b`;");
    assert_eq!(ty(&annotation, ""), "TSLiteralType");
    assert_eq!(at(&annotation, ""), (28, 41));
    assert_eq!(ty(&annotation, "/literal"), "TemplateLiteral");
    assert_eq!(at(&annotation, "/literal"), (28, 41));
    assert_eq!(ty(&annotation, "/literal/expressions/0"), "TSStringKeyword");
    let quasis = annotation["literal"]["quasis"].as_array().expect("quasis");
    assert_eq!(quasis.len(), 2);
    assert_eq!(quasis[0]["value"]["raw"], "a");
    assert_eq!(quasis[0]["tail"], Value::Bool(false));
    assert_eq!(
        (quasis[0]["start"].as_u64(), quasis[0]["end"].as_u64()),
        (Some(29), Some(30))
    );
    assert_eq!(quasis[1]["value"]["raw"], "b");
    assert_eq!(quasis[1]["tail"], Value::Bool(true));

    // An empty leading quasi is a zero-width element, not an absent one.
    let empty = alias_annotation("type T2 = `${number}`;");
    let quasis = empty["literal"]["quasis"].as_array().expect("quasis");
    assert_eq!(quasis.len(), 2);
    assert_eq!(quasis[0]["value"]["raw"], "");
    assert_eq!(
        (quasis[0]["start"].as_u64(), quasis[0]["end"].as_u64()),
        (Some(29), Some(29))
    );
    assert_eq!(ty(&empty, "/literal/expressions/0"), "TSNumberKeyword");
}

#[test]
fn none_of_the_seven_degrades_to_an_unknown_keyword_stub() {
    for body in [
        "type C<T> = T extends string ? 1 : 2;",
        "type E<T> = T extends Array<infer U> ? U : never;",
        "type M = { [K in \"a\"]: number };",
        "type I = import(\"x\").T;",
        "type T1 = `a${string}b`;",
    ] {
        let annotation = alias_annotation(body);
        assert!(
            !annotation.to_string().contains("TSUnknownKeyword"),
            "unexpected TSUnknownKeyword stub for: {body}"
        );
    }

    // `typeof` and a type predicate are not alias annotations, so they need
    // their own entry points.
    for source in [
        "<script lang=\"ts\">const q = 1; type Q = typeof q;</script>",
        // `unknown` would itself be a legitimate `TSUnknownKeyword`.
        "<script lang=\"ts\">type P = (a: string) => a is string;</script>",
    ] {
        let ast = parse_to_json(source);
        assert!(
            !ast.to_string().contains("TSUnknownKeyword"),
            "unexpected TSUnknownKeyword stub for: {source}"
        );
    }
}
