//! A function with no body is spelled `TSDeclareFunction` by acorn-typescript,
//! and `parse()` used to drop the statement entirely. Dropping it is not one
//! missing node: `diffKeys` walks a body array index by index, so every sibling
//! after it pairs against the wrong node.
//!
//! Every expected value here was printed by
//! `submodules/svelte/packages/svelte/src/compiler/index.js`, not inferred from
//! rsvelte's output. Two of them are the reason the file has one test per rule:
//! `declare` is stamped only where the keyword is written, so an overload
//! signature carries none, and `returnType` is emitted on an ordinary
//! `FunctionDeclaration` too.

use rsvelte_core::ast::arena::CommentCaptureGuard;
use rsvelte_core::{CompileOptions, GenerateMode, ParseOptions, compile, convert_to_legacy, parse};
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
fn a_declare_function_is_a_tsdeclarefunction_carrying_declare() {
    let body = instance_body(&ts("declare function f(a: number): void;\nlet x = 1;"));
    assert_eq!(body[0]["type"], "TSDeclareFunction", "{body}");
    assert_eq!(body[0]["declare"], true, "{body}");
    assert_eq!(body[0]["params"].as_array().map(Vec::len), Some(1));
}

#[test]
fn a_declare_function_has_no_body_key_at_all() {
    let body = instance_body(&ts("declare function f(a: number): void;\nlet x = 1;"));
    // Upstream omits the key; a `null` here would be a different shape.
    assert!(
        body[0].get("body").is_none(),
        "expected no `body` key, got {}",
        body[0]
    );
}

#[test]
fn dropping_the_statement_no_longer_shifts_its_siblings() {
    let body = instance_body(&ts("declare function f(a: number): void;\nlet x = 1;"));
    assert_eq!(body.as_array().map(Vec::len), Some(2), "{body}");
    assert_eq!(body[1]["type"], "VariableDeclaration", "{body}");
}

#[test]
fn an_overload_signature_is_a_tsdeclarefunction_without_declare() {
    let body = instance_body(&ts(
        "function k(a: number): void;\nfunction k(a: any): void {}",
    ));
    assert_eq!(body[0]["type"], "TSDeclareFunction", "{body}");
    // `declare` is stamped from the keyword, which an overload does not write.
    assert!(
        body[0].get("declare").is_none(),
        "expected no `declare` key, got {}",
        body[0]
    );
    assert_eq!(body[1]["type"], "FunctionDeclaration", "{body}");
    assert_eq!(body[1]["body"]["type"], "BlockStatement", "{body}");
}

#[test]
fn a_return_type_annotation_is_emitted_when_present() {
    let body = instance_body(&ts("declare function f(a: number): void;\nlet x = 1;"));
    assert_eq!(body[0]["returnType"]["type"], "TSTypeAnnotation", "{body}");
}

#[test]
fn an_unannotated_declare_function_has_no_return_type_key() {
    let body = instance_body(&ts("declare function h(a: string);\nlet x = 1;"));
    assert_eq!(body[0]["type"], "TSDeclareFunction", "{body}");
    assert!(
        body[0].get("returnType").is_none(),
        "expected no `returnType` key, got {}",
        body[0]
    );
}

#[test]
fn an_ordinary_function_also_carries_its_return_type() {
    let body = instance_body(&ts("function n(a: number): string { return ''; }"));
    assert_eq!(body[0]["type"], "FunctionDeclaration", "{body}");
    assert_eq!(body[0]["returnType"]["type"], "TSTypeAnnotation", "{body}");
    assert_eq!(body[0]["body"]["type"], "BlockStatement", "{body}");
}

#[test]
fn an_ordinary_function_is_not_relabelled() {
    // The negative control: asserting the new type name alone would also pass
    // if every function became a `TSDeclareFunction`.
    let body = instance_body(&ts("function o(a) { return a; }"));
    assert_eq!(body[0]["type"], "FunctionDeclaration", "{body}");
    assert!(body[0].get("declare").is_none(), "{body}");
    assert!(body[0].get("returnType").is_none(), "{body}");
}

#[test]
fn compile_still_erases_a_bodiless_function() {
    // Upstream's eraser is `TSDeclareFunction() { return b.empty; }`, so the
    // node reaching phase 2 must not survive into generated output.
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let js = compile(
            &ts("declare function f(a: number): void;\nfunction k(a: number): void;\nfunction k(a: any): void {}\nlet x = 1;"),
            CompileOptions {
                generate,
                filename: Some("A.svelte".to_string()),
                ..Default::default()
            },
        )
        .expect("compile")
        .js
        .code;
        assert!(!js.contains("declare"), "{generate:?}: {js}");
        // The overload's implementation survives; its signature does not.
        assert_eq!(js.matches("function k(").count(), 1, "{generate:?}: {js}");
    }
}
