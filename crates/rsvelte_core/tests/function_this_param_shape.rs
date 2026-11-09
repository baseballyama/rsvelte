//! `FunctionDeclaration.params` loses two independent things, so a single "the
//! shapes agree" assertion is satisfied by whichever half is already right and
//! each rule gets its own test. TSESTree models a TypeScript `this` parameter
//! as an ordinary leading `params[0]`, which the declaration converter never
//! consulted; and a rest parameter lives in `params.rest`, which the same
//! converter never emitted — so `function f(...a)` and `export function f(...a)`
//! disagreed with each other, the export form alone routing to the Value form.
//!
//! The expected values are official's own output for the same source
//! (`submodules/svelte/.../compiler/index.js`, `parse({ modern: true })`), not
//! an inference from rsvelte's.

use rsvelte_core::ast::arena::CommentCaptureGuard;
use rsvelte_core::{ParseOptions, convert_to_legacy, parse};
use serde_json::Value;

fn instance_body(source: &str) -> Value {
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
    convert_to_legacy(source, ast)["instance"]["content"]["body"].clone()
}

fn ts(body: &str) -> String {
    format!("<script lang=\"ts\">\n{body}\n</script>\n<div></div>\n")
}

#[test]
fn a_function_declaration_carries_its_this_parameter() {
    let source = ts("function f(this: any, a) {}\nlet b = f;");
    let params = instance_body(&source)[0]["params"].clone();
    assert_eq!(params.as_array().map(Vec::len), Some(2), "{params}");
    let this_at = source.find("this: any").unwrap();
    assert_eq!(params[0]["type"], "Identifier", "{params}");
    assert_eq!(params[0]["name"], "this");
    assert_eq!(params[0]["start"], this_at);
    assert_eq!(params[0]["end"], this_at + "this: any".len());
    assert_eq!(params[0]["typeAnnotation"]["type"], "TSTypeAnnotation");
    assert_eq!(params[1]["name"], "a");
}

#[test]
fn a_this_parameter_is_the_only_parameter_when_it_stands_alone() {
    let params = instance_body(&ts("function f(this: any) {}\nlet b = f;"))[0]["params"].clone();
    assert_eq!(params.as_array().map(Vec::len), Some(1), "{params}");
    assert_eq!(params[0]["name"], "this");
}

#[test]
fn a_function_expression_carries_its_this_parameter() {
    let body = instance_body(&ts("const f = function (this: any, a) {};\nlet b = f;"));
    let params = body[0]["declarations"][0]["init"]["params"].clone();
    assert_eq!(params.as_array().map(Vec::len), Some(2), "{params}");
    assert_eq!(params[0]["name"], "this");
}

// Without this cell the two above pass for a converter that prepends a `this`
// parameter unconditionally.
#[test]
fn a_declaration_with_no_this_parameter_gains_none() {
    let params = instance_body(&ts("function f(a) {}\nlet b = f;"))[0]["params"].clone();
    assert_eq!(params.as_array().map(Vec::len), Some(1), "{params}");
    assert_eq!(params[0]["name"], "a", "{params}");
}

#[test]
fn a_rest_parameter_does_not_cost_the_this_parameter() {
    let params =
        instance_body(&ts("function f(this: any, ...a) {}\nlet b = f;"))[0]["params"].clone();
    assert_eq!(params.as_array().map(Vec::len), Some(2), "{params}");
    assert_eq!(params[0]["name"], "this");
    assert_eq!(params[1]["type"], "RestElement", "{params}");
}

#[test]
fn a_declaration_carries_a_rest_parameter_with_no_this_parameter() {
    let source = ts("function f(...a: any[]) {}\nlet b = f;");
    let params = instance_body(&source)[0]["params"].clone();
    assert_eq!(params.as_array().map(Vec::len), Some(1), "{params}");
    let rest_at = source.find("...a: any[]").unwrap();
    assert_eq!(params[0]["type"], "RestElement", "{params}");
    assert_eq!(params[0]["start"], rest_at);
    assert_eq!(params[0]["end"], rest_at + "...a: any[]".len());
    assert_eq!(params[0]["argument"]["name"], "a");
    // Official puts a rest parameter's annotation on the `RestElement`, not on
    // its argument.
    assert_eq!(params[0]["typeAnnotation"]["type"], "TSTypeAnnotation");
    assert_eq!(
        params[0]["typeAnnotation"]["typeAnnotation"]["type"],
        "TSArrayType"
    );
    assert_eq!(
        params[0]["argument"]["typeAnnotation"],
        Value::Null,
        "{params}"
    );
}

// A rest parameter with no type annotation must not gain one; without this the
// cell above passes for a converter that emits `typeAnnotation` unconditionally.
#[test]
fn an_untyped_rest_parameter_gains_no_type_annotation() {
    let params =
        instance_body("<script>\nfunction f(...a) {}\nlet b = f;\n</script>\n")[0]["params"]
            .clone();
    assert_eq!(params.as_array().map(Vec::len), Some(1), "{params}");
    assert_eq!(params[0]["type"], "RestElement", "{params}");
    assert_eq!(params[0]["typeAnnotation"], Value::Null, "{params}");
}

// The statement form reached the typed converter directly and the export form
// reached the Value form, so the two hosts answered differently for one source.
#[test]
fn the_statement_and_export_hosts_agree_on_a_rest_parameter() {
    // The two sources put the parameter at different offsets, so the comparison
    // is over the shape and not over the spans.
    let shape = |params: &Value| {
        serde_json::json!([
            params[0]["type"],
            params[0]["argument"]["name"],
            params[0]["typeAnnotation"]["typeAnnotation"]["type"],
            params.as_array().map(Vec::len),
        ])
    };
    let bare = instance_body(&ts("function f(...a: any[]) {}\nlet b = f;"))[0]["params"].clone();
    let exported =
        instance_body(&ts("export function f(...a: any[]) {}"))[0]["declaration"]["params"].clone();
    assert_eq!(
        shape(&bare),
        serde_json::json!(["RestElement", "a", "TSArrayType", 1]),
        "{bare}"
    );
    assert_eq!(
        shape(&bare),
        shape(&exported),
        "bare={bare} exported={exported}"
    );
}

// The template converters are a separate port from the script ones above and
// dropped the `this` parameter while the script side kept it.
fn template_function_params(source: &str, modern: bool) -> Value {
    use rsvelte_core::ast::arena::with_serialize_arena;
    fn strip_loc(v: &Value) -> Value {
        match v {
            Value::Array(items) => Value::Array(items.iter().map(strip_loc).collect()),
            Value::Object(map) => Value::Object(
                map.iter()
                    .filter(|(k, _)| *k != "loc")
                    .map(|(k, v)| (k.clone(), strip_loc(v)))
                    .collect(),
            ),
            other => other.clone(),
        }
    }
    fn walk(v: &Value, out: &mut Vec<Value>) {
        match v {
            Value::Array(items) => items.iter().for_each(|i| walk(i, out)),
            Value::Object(map) => {
                if let Some(params) = map.get("params").filter(|p| p.is_array()) {
                    out.push(serde_json::json!([
                        map["type"],
                        map["start"],
                        strip_loc(params)
                    ]));
                }
                for (k, child) in map {
                    if k != "loc" {
                        walk(child, out);
                    }
                }
            }
            _ => {}
        }
    }
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern,
            ..Default::default()
        },
    )
    .expect("parse should succeed");
    let (json, root) = if modern {
        let s = with_serialize_arena(&ast.arena, || serde_json::to_string(&ast).unwrap());
        (serde_json::from_str::<Value>(&s).unwrap(), "fragment")
    } else {
        (convert_to_legacy(source, ast), "html")
    };
    let mut out = Vec::new();
    walk(&json[root], &mut out);
    Value::Array(out)
}

// Expected values: official `parse()` (5.57.0; modern and legacy identical) on
// the same source.
const TEMPLATE_FUNCTIONS: &str = "<script lang=\"ts\">\n\tlet v = $state('');\n</script>\n\n<input onblur={function (this: HTMLInputElement, e: Event) { v = this.value; }} />\n<input onfocus={function (this: HTMLInputElement) { function g(this: Window, n: number) { return n; } v = this.value + g(1); }} />\n<input onclick={function (e: Event) { v = ''; }} />\n";

const TEMPLATE_FUNCTIONS_OFFICIAL: &str = r#"[["FunctionExpression",66,[{"type":"Identifier","start":76,"end":98,"name":"this","typeAnnotation":{"type":"TSTypeAnnotation","start":80,"end":98,"typeAnnotation":{"type":"TSTypeReference","start":82,"end":98,"typeName":{"type":"Identifier","start":82,"end":98,"name":"HTMLInputElement"}}}},{"type":"Identifier","start":100,"end":108,"name":"e","typeAnnotation":{"type":"TSTypeAnnotation","start":101,"end":108,"typeAnnotation":{"type":"TSTypeReference","start":103,"end":108,"typeName":{"type":"Identifier","start":103,"end":108,"name":"Event"}}}}]],["FunctionExpression",150,[{"type":"Identifier","start":160,"end":182,"name":"this","typeAnnotation":{"type":"TSTypeAnnotation","start":164,"end":182,"typeAnnotation":{"type":"TSTypeReference","start":166,"end":182,"typeName":{"type":"Identifier","start":166,"end":182,"name":"HTMLInputElement"}}}}]],["FunctionDeclaration",186,[{"type":"Identifier","start":197,"end":209,"name":"this","typeAnnotation":{"type":"TSTypeAnnotation","start":201,"end":209,"typeAnnotation":{"type":"TSTypeReference","start":203,"end":209,"typeName":{"type":"Identifier","start":203,"end":209,"name":"Window"}}}},{"type":"Identifier","start":211,"end":220,"name":"n","typeAnnotation":{"type":"TSTypeAnnotation","start":212,"end":220,"typeAnnotation":{"type":"TSNumberKeyword","start":214,"end":220}}}]],["FunctionExpression",281,[{"type":"Identifier","start":291,"end":299,"name":"e","typeAnnotation":{"type":"TSTypeAnnotation","start":292,"end":299,"typeAnnotation":{"type":"TSTypeReference","start":294,"end":299,"typeName":{"type":"Identifier","start":294,"end":299,"name":"Event"}}}}]]]"#;

const TEMPLATE_METHODS: &str = "<script lang=\"ts\"></script>\n{#if { m(this: Window, a: number) { return a; } }}x{/if}\n{#if class { m(this: Window) {} }}y{/if}\n";

const TEMPLATE_METHODS_OFFICIAL: &str = r#"[["FunctionExpression",36,[{"type":"Identifier","start":37,"end":49,"name":"this","typeAnnotation":{"type":"TSTypeAnnotation","start":41,"end":49,"typeAnnotation":{"type":"TSTypeReference","start":43,"end":49,"typeName":{"type":"Identifier","start":43,"end":49,"name":"Window"}}}},{"type":"Identifier","start":51,"end":60,"name":"a","typeAnnotation":{"type":"TSTypeAnnotation","start":52,"end":60,"typeAnnotation":{"type":"TSNumberKeyword","start":54,"end":60}}}]],["FunctionExpression",99,[{"type":"Identifier","start":100,"end":112,"name":"this","typeAnnotation":{"type":"TSTypeAnnotation","start":104,"end":112,"typeAnnotation":{"type":"TSTypeReference","start":106,"end":112,"typeName":{"type":"Identifier","start":106,"end":112,"name":"Window"}}}}]]]"#;

// The same converter also dropped every other parameter's annotation; the arrow
// and declaration converters already went through `FormalParameter`.
const TEMPLATE_TYPED_PARAMS: &str = "<script lang=\"ts\"></script>\n{#if function (a: number = 1, b?: string, { c }: { c: number } = { c: 1 }, ...d: number[]) {}}x{/if}\n{#if { m(a: number = 1) {} }}y{/if}\n";

const TEMPLATE_TYPED_PARAMS_OFFICIAL: &str = r#"[["FunctionExpression",33,[{"type":"AssignmentPattern","start":43,"end":56,"left":{"type":"Identifier","start":43,"end":52,"name":"a","typeAnnotation":{"type":"TSTypeAnnotation","start":44,"end":52,"typeAnnotation":{"type":"TSNumberKeyword","start":46,"end":52}}},"right":{"type":"Literal","start":55,"end":56,"value":1,"raw":"1"}},{"type":"Identifier","start":58,"end":68,"name":"b","optional":true,"typeAnnotation":{"type":"TSTypeAnnotation","start":60,"end":68,"typeAnnotation":{"type":"TSStringKeyword","start":62,"end":68}}},{"type":"AssignmentPattern","start":70,"end":101,"left":{"type":"ObjectPattern","start":70,"end":90,"properties":[{"type":"Property","start":72,"end":73,"method":false,"shorthand":true,"computed":false,"key":{"type":"Identifier","start":72,"end":73,"name":"c"},"value":{"type":"Identifier","start":72,"end":73,"name":"c"},"kind":"init"}],"typeAnnotation":{"type":"TSTypeAnnotation","start":75,"end":90,"typeAnnotation":{"type":"TSTypeLiteral","start":77,"end":90,"members":[{"type":"TSPropertySignature","start":79,"end":88,"computed":false,"key":{"type":"Identifier","start":79,"end":80,"name":"c"},"typeAnnotation":{"type":"TSTypeAnnotation","start":80,"end":88,"typeAnnotation":{"type":"TSNumberKeyword","start":82,"end":88}}}]}}},"right":{"type":"ObjectExpression","start":93,"end":101,"properties":[{"type":"Property","start":95,"end":99,"method":false,"shorthand":false,"computed":false,"key":{"type":"Identifier","start":95,"end":96,"name":"c"},"value":{"type":"Literal","start":98,"end":99,"value":1,"raw":"1"},"kind":"init"}]}},{"type":"RestElement","start":103,"end":117,"argument":{"type":"Identifier","start":106,"end":107,"name":"d"},"typeAnnotation":{"type":"TSTypeAnnotation","start":107,"end":117,"typeAnnotation":{"type":"TSArrayType","start":109,"end":117,"elementType":{"type":"TSNumberKeyword","start":109,"end":115}}}}]],["FunctionExpression",137,[{"type":"AssignmentPattern","start":138,"end":151,"left":{"type":"Identifier","start":138,"end":147,"name":"a","typeAnnotation":{"type":"TSTypeAnnotation","start":139,"end":147,"typeAnnotation":{"type":"TSNumberKeyword","start":141,"end":147}}},"right":{"type":"Literal","start":150,"end":151,"value":1,"raw":"1"}}]]]"#;

#[test]
fn template_function_parameters_keep_their_annotations() {
    let expected: Value = serde_json::from_str(TEMPLATE_TYPED_PARAMS_OFFICIAL).unwrap();
    for modern in [true, false] {
        let actual = template_function_params(TEMPLATE_TYPED_PARAMS, modern);
        assert_eq!(actual, expected, "modern={modern}");
    }
}

#[test]
fn template_functions_carry_their_this_parameter() {
    let expected: Value = serde_json::from_str(TEMPLATE_FUNCTIONS_OFFICIAL).unwrap();
    for modern in [true, false] {
        let actual = template_function_params(TEMPLATE_FUNCTIONS, modern);
        assert_eq!(actual, expected, "modern={modern}");
    }
}

#[test]
fn template_methods_carry_their_this_parameter() {
    let expected: Value = serde_json::from_str(TEMPLATE_METHODS_OFFICIAL).unwrap();
    for modern in [true, false] {
        let actual = template_function_params(TEMPLATE_METHODS, modern);
        assert_eq!(actual, expected, "modern={modern}");
    }
}

// The `this` parameter is type-only, so compiled output must not bind it.
// Expected lines are official's client output for the same source.
#[test]
fn a_template_this_parameter_is_erased_from_compiled_output() {
    use rsvelte_core::{CompileOptions, GenerateMode, compile};
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let client = matches!(generate, GenerateMode::Client);
        let out = compile(
            TEMPLATE_FUNCTIONS,
            CompileOptions {
                filename: Some("A.svelte".to_string()),
                generate,
                ..Default::default()
            },
        )
        .expect("compile");
        let code = out.js.code;
        assert!(!code.contains("(this"), "{code}");
        let typed = compile(
            TEMPLATE_TYPED_PARAMS,
            CompileOptions {
                filename: Some("A.svelte".to_string()),
                generate,
                ..Default::default()
            },
        )
        .expect("compile")
        .js
        .code;
        for line in [
            "function (a = 1, b, { c } = { c: 1 }, ...d) {}",
            "{ m(a = 1) {} }",
        ] {
            assert!(typed.contains(line), "missing {line:?} in\n{typed}");
        }
        let methods = compile(
            TEMPLATE_METHODS,
            CompileOptions {
                filename: Some("A.svelte".to_string()),
                generate,
                ..Default::default()
            },
        )
        .expect("compile")
        .js
        .code;
        assert!(methods.contains("m(a) {"), "{methods}");
        assert!(methods.contains("m() {}"), "{methods}");
        assert!(!methods.contains("this"), "{methods}");
        if client {
            for line in [
                "$.event('blur', input, function (e) {",
                "$.event('focus', input_1, function () {",
                "function g(n) {",
                "$.delegated('click', input_2, function (e) {",
            ] {
                assert!(code.contains(line), "missing {line:?} in\n{code}");
            }
        }
    }
}
