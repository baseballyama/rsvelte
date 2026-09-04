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
