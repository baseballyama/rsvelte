//! `parse()` reported a `TSModuleDeclaration` with no `id`, no `declare` and no
//! `global`, and gave it a `BlockStatement` body spanning the whole declaration
//! where acorn-typescript emits a `TSModuleBlock` spanning the braces.
//!
//! Every expected value here was printed from
//! `submodules/svelte/.../compiler/index.js`. The inputs are ASCII-only, so
//! byte and UTF-16 offsets coincide.

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

/// The first instance-script statement of `<script lang="ts">{body}</script>`.
fn first_statement(body: &str) -> Value {
    parse_to_json(&format!("<script lang=\"ts\">{body}</script>"))
        .pointer("/instance/content/body/0")
        .unwrap_or_else(|| panic!("no statement for: {body}"))
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
fn a_namespace_names_itself_and_its_body_is_a_module_block() {
    let node = first_statement("namespace N { const a = 1; }");
    assert_eq!(ty(&node, ""), "TSModuleDeclaration");
    assert_eq!(at(&node, ""), (18, 46));
    assert_eq!(ty(&node, "/id"), "Identifier");
    assert_eq!(node["id"]["name"], "N");
    assert_eq!(at(&node, "/id"), (28, 29));
    // The block spans the braces, not the declaration.
    assert_eq!(ty(&node, "/body"), "TSModuleBlock");
    assert_eq!(at(&node, "/body"), (30, 46));
    assert_eq!(ty(&node, "/body/body/0"), "VariableDeclaration");
    // Both flags are omitted when false.
    assert!(node.get("declare").is_none());
    assert!(node.get("global").is_none());

    // `module N { … }` is the same node under a different keyword.
    let module = first_statement("module N { const a = 1; }");
    assert_eq!(ty(&module, ""), "TSModuleDeclaration");
    assert_eq!(at(&module, "/id"), (25, 26));
    assert_eq!(ty(&module, "/body"), "TSModuleBlock");

    let empty = first_statement("namespace N { }");
    assert_eq!(at(&empty, "/body"), (30, 33));
    assert_eq!(empty["body"]["body"], Value::Array(vec![]));
}

#[test]
fn declare_and_global_are_present_only_when_true() {
    let declared = first_statement("declare namespace N { const a: number; }");
    assert_eq!(declared["declare"], Value::Bool(true));
    assert!(declared.get("global").is_none());

    // `declare global { … }` has no name in the grammar; acorn-typescript
    // synthesizes an `Identifier` over the `global` keyword.
    let global = first_statement("declare global { const a: number; }");
    assert_eq!(global["global"], Value::Bool(true));
    assert_eq!(global["declare"], Value::Bool(true));
    assert_eq!(ty(&global, "/id"), "Identifier");
    assert_eq!(global["id"]["name"], "global");
    assert_eq!(at(&global, "/id"), (26, 32));

    // `declare module 'x'` names itself with a string `Literal`.
    let external = first_statement("declare module \"x\" { const a: number; }");
    assert_eq!(external["declare"], Value::Bool(true));
    assert_eq!(ty(&external, "/id"), "Literal");
    assert_eq!(external["id"]["value"], "x");
    assert_eq!(external["id"]["raw"], "\"x\"");
    assert_eq!(at(&external, "/id"), (33, 36));

    // A bodyless external module keeps its id and drops `body` entirely.
    let bodyless = first_statement("declare module \"x\";");
    assert_eq!(ty(&bodyless, "/id"), "Literal");
    assert!(bodyless.get("body").is_none());
}

#[test]
fn a_dotted_name_nests_a_module_declaration_where_a_block_would_be() {
    // acorn-typescript parses `namespace A.B { … }` as `A` whose body IS `B`.
    let dotted = first_statement("namespace A.B { const a = 1; }");
    assert_eq!(at(&dotted, ""), (18, 48));
    assert_eq!(dotted["id"]["name"], "A");
    assert_eq!(ty(&dotted, "/body"), "TSModuleDeclaration");
    assert_eq!(at(&dotted, "/body"), (30, 48));
    assert_eq!(dotted["body"]["id"]["name"], "B");
    assert_eq!(ty(&dotted, "/body/body"), "TSModuleBlock");
    assert_eq!(at(&dotted, "/body/body"), (32, 48));

    let three = first_statement("namespace A.B.C { const a = 1; }");
    assert_eq!(ty(&three, "/body"), "TSModuleDeclaration");
    assert_eq!(ty(&three, "/body/body"), "TSModuleDeclaration");
    assert_eq!(ty(&three, "/body/body/body"), "TSModuleBlock");

    // A source-nested namespace is a statement INSIDE the block, which is a
    // different shape from the dotted one.
    let nested = first_statement("namespace A { namespace B { const a = 1; } }");
    assert_eq!(ty(&nested, "/body"), "TSModuleBlock");
    assert_eq!(ty(&nested, "/body/body/0"), "TSModuleDeclaration");
}
