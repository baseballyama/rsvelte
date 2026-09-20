//! `parse()` dropped a script's directive prologue and never emitted acorn's
//! `directive` field (#4133, ratchet key `ExpressionStatement.directive#missing`).
//!
//! OXC lifts a directive prologue out of `Program::body` into
//! `Program::directives`; ESTree keeps them as ordinary `ExpressionStatement`s.
//! Function bodies were already converted — a script's own program was not, so
//! `<script>'use strict';</script>` lost the statement entirely.
//!
//! Every expectation is read out of `submodules/svelte`'s own `parse()`.
//!
//! What this does NOT fix: `compile()` still drops the same statement, for an
//! unrelated reason measured separately — phase 3's chunk re-parse
//! (`3_transform/js_ast/to_oxc.rs`) collects `ret.program.body` and discards
//! `ret.program.directives`. A directive that is not first survives compilation
//! today, which is how the two were told apart.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};
use serde_json::Value;

fn ast(source: &str) -> Value {
    let allocator = oxc_allocator::Allocator::default();
    let parsed = parse(source, &allocator, ParseOptions::default()).expect("parse should succeed");
    with_serialize_arena(&parsed.arena, || serde_json::to_value(&parsed).unwrap())
}

fn instance_body(source: &str) -> Vec<Value> {
    ast(source)["instance"]["content"]["body"]
        .as_array()
        .cloned()
        .unwrap_or_default()
}

fn statement(node: &Value) -> (String, Option<String>) {
    (
        node["type"].as_str().unwrap_or_default().to_owned(),
        node.get("directive")
            .and_then(Value::as_str)
            .map(str::to_owned),
    )
}

#[test]
fn a_script_directive_prologue_is_a_statement_carrying_its_directive() {
    let source = "<script>'use strict';\nfoo();</script>";
    let body = instance_body(source);

    assert_eq!(body.len(), 2, "the prologue is a statement, got {body:?}");
    assert_eq!(
        statement(&body[0]),
        (
            "ExpressionStatement".to_owned(),
            Some("use strict".to_owned())
        )
    );
    let start = body[0]["start"].as_u64().unwrap() as usize;
    let end = body[0]["end"].as_u64().unwrap() as usize;
    assert_eq!(&source[start..end], "'use strict';");
    assert!(body[0].get("loc").is_some());

    // The ordinary statement after it carries no `directive` at all — acorn
    // omits the field rather than writing null.
    assert_eq!(
        statement(&body[1]),
        ("ExpressionStatement".to_owned(), None)
    );
}

#[test]
fn every_statement_of_a_multi_directive_prologue_survives_in_order() {
    let body = instance_body("<script>'use strict';\n\"second\";\nfoo();</script>");
    assert_eq!(body.len(), 3);
    assert_eq!(
        body.iter().map(statement).collect::<Vec<_>>(),
        vec![
            (
                "ExpressionStatement".to_owned(),
                Some("use strict".to_owned())
            ),
            ("ExpressionStatement".to_owned(), Some("second".to_owned())),
            ("ExpressionStatement".to_owned(), None),
        ]
    );
}

#[test]
fn a_module_script_prologue_survives_too() {
    let tree = ast("<script module>'use strict';\nexport const a = 1;</script>");
    let body = tree["module"]["content"]["body"].as_array().unwrap();
    assert_eq!(body.len(), 2);
    assert_eq!(
        statement(&body[0]),
        (
            "ExpressionStatement".to_owned(),
            Some("use strict".to_owned())
        )
    );
}

#[test]
fn a_function_body_directive_carries_the_field() {
    let body = instance_body("<script>function f() { 'inner'; return 1; }</script>");
    let inner = body[0]["body"]["body"].as_array().unwrap();
    assert_eq!(
        statement(&inner[0]),
        ("ExpressionStatement".to_owned(), Some("inner".to_owned()))
    );
}

#[test]
fn a_string_statement_that_is_not_first_is_not_a_directive() {
    let body = instance_body("<script>foo();\n'not a directive';</script>");
    assert_eq!(body.len(), 2);
    assert_eq!(
        statement(&body[1]),
        ("ExpressionStatement".to_owned(), None)
    );
}

#[test]
fn a_string_statement_inside_a_block_is_not_a_directive() {
    let body = instance_body("<script>{ 'not a directive'; }</script>");
    let inner = body[0]["body"].as_array().unwrap();
    assert_eq!(
        statement(&inner[0]),
        ("ExpressionStatement".to_owned(), None)
    );
}
