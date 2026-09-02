//! Four node kinds were dropped from the public `parse()` AST by catch-all arms
//! in the program serialization, so everything that reads rsvelte's AST without
//! compiling — `rsvelte_lint`, svelte2tsx, the language server, the playground —
//! saw a statement or a class member that is not there (issue #4195).
//!
//! The detector has to be a unit test: the `parse()` AST ratchet's population is
//! the collected corpus, and none of these four constructs has a carrier there.
//! Every expectation below was printed from official's own `parse()` in
//! `submodules/svelte`, not inferred from rsvelte's output.
//!
//! `IfStatement` and a class `static {}` block are the controls the issue used,
//! and they are here for the same reason: a serialization that dropped
//! everything would pass a test that only asserts the four are present.

use rsvelte_core::ast::arena::CommentCaptureGuard;
use rsvelte_core::{ParseOptions, convert_to_legacy, parse};
use serde_json::Value;

fn instance_body(source: &str) -> Vec<Value> {
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
    let legacy = convert_to_legacy(source, ast);
    legacy["instance"]["content"]["body"]
        .as_array()
        .expect("instance body")
        .clone()
}

/// The same host every expectation was measured in: a `lang="ts"` instance
/// script whose first statement is ordinary, so the subject is always last.
fn last_statement(statement: &str) -> Value {
    let source = format!("<script lang=\"ts\">\n\tlet a = 1;\n\t{statement}\n</script>\n");
    instance_body(&source)
        .pop()
        .unwrap_or_else(|| panic!("{statement:?} produced no trailing statement"))
}

#[test]
fn an_import_equals_declaration_reaches_the_program_body() {
    let node = last_statement("import fs = require('fs');");
    assert_eq!(node["type"], "TSImportEqualsDeclaration");
    assert_eq!(node["start"], 32);
    assert_eq!(node["end"], 58);
    assert_eq!(node["importKind"], "value");
    assert_eq!(node["isExport"], false);
    assert_eq!(node["id"]["type"], "Identifier");
    assert_eq!(node["id"]["name"], "fs");
    assert_eq!(node["id"]["start"], 39);
    assert_eq!(node["id"]["end"], 41);
}

#[test]
fn an_external_module_reference_carries_its_literal() {
    let node = last_statement("import fs = require('fs');");
    let reference = &node["moduleReference"];
    assert_eq!(reference["type"], "TSExternalModuleReference");
    assert_eq!(reference["start"], 44);
    assert_eq!(reference["end"], 57);
    assert_eq!(reference["expression"]["type"], "Literal");
    assert_eq!(reference["expression"]["value"], "fs");
    // Official writes the source spelling, not the cooked value.
    assert_eq!(reference["expression"]["raw"], "'fs'");
    assert_eq!(reference["expression"]["start"], 52);
    assert_eq!(reference["expression"]["end"], 56);
}

#[test]
fn an_export_assignment_reaches_the_program_body() {
    let node = last_statement("export = a;");
    assert_eq!(node["type"], "TSExportAssignment");
    assert_eq!(node["start"], 32);
    assert_eq!(node["end"], 43);
    assert_eq!(node["expression"]["type"], "Identifier");
    assert_eq!(node["expression"]["name"], "a");
    assert_eq!(node["expression"]["start"], 41);
    assert_eq!(node["expression"]["end"], 42);
}

#[test]
fn a_namespace_export_declaration_reaches_the_program_body() {
    let node = last_statement("export as namespace N;");
    assert_eq!(node["type"], "TSNamespaceExportDeclaration");
    assert_eq!(node["start"], 32);
    assert_eq!(node["end"], 54);
    assert_eq!(node["id"]["type"], "Identifier");
    assert_eq!(node["id"]["name"], "N");
    assert_eq!(node["id"]["start"], 52);
    assert_eq!(node["id"]["end"], 53);
}

#[test]
fn a_class_body_index_signature_reaches_the_class_body() {
    let node = last_statement("class C { [k: string]: number }");
    assert_eq!(node["type"], "ClassDeclaration");
    let members = node["body"]["body"].as_array().expect("class body");
    assert_eq!(members.len(), 1, "the index signature is the only member");
    let member = &members[0];
    assert_eq!(member["type"], "TSIndexSignature");
    assert_eq!(member["start"], 42);
    assert_eq!(member["end"], 61);
    // acorn-typescript's `parameters` entry spans the whole `k: string`.
    let parameters = member["parameters"].as_array().expect("parameters");
    assert_eq!(parameters.len(), 1);
    assert_eq!(parameters[0]["type"], "Identifier");
    assert_eq!(parameters[0]["name"], "k");
    assert_eq!(parameters[0]["start"], 43);
    assert_eq!(parameters[0]["end"], 52);
    assert_eq!(
        parameters[0]["typeAnnotation"]["typeAnnotation"]["type"],
        "TSStringKeyword"
    );
    assert_eq!(
        member["typeAnnotation"]["typeAnnotation"]["type"],
        "TSNumberKeyword"
    );
}

#[test]
fn the_controls_are_still_present() {
    let if_statement = last_statement("if (a) { a; }");
    assert_eq!(if_statement["type"], "IfStatement");

    let class = last_statement("class C { static { 1; } }");
    let members = class["body"]["body"].as_array().expect("class body");
    assert_eq!(members.len(), 1);
    assert_eq!(members[0]["type"], "StaticBlock");
}
