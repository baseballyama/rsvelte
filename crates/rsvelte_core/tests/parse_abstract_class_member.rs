//! An abstract method is a class member, not a hole in the class body.
//!
//! rsvelte dropped every `TSAbstract*` member at parse, which does not just
//! lose the member: it shifts every LATER member up one slot, so a positional
//! comparison against official reads the wrong pair at every index after it.
//! That is how one dropped `abstract describe(): string` produced a
//! `PropertyDefinition.declare` reported as both extra and missing in the same
//! file — index 1 held official's un-`declare`d `id` against rsvelte's
//! `declare size`, and index 2 the reverse.
//!
//! Expectations are the official compiler's own output
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`), measured on the
//! same sources: three members, an abstract method whose `value` is a
//! `TSDeclareMethod` with a `returnType` and no `body`, and a concrete method
//! whose `value` is a `FunctionExpression` that keeps its `body`.

use rsvelte_core::Allocator;
use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse};
use serde_json::Value;

const SOURCE: &str = "<script lang=\"ts\">\n\
    \tabstract class B {\n\
    \t\tabstract describe<T>(a: T): string;\n\
    \t\tdeclare size: number;\n\
    \t\tconcrete() { return 1; }\n\
    \t}\n\
    \tnew (class extends B { describe(a){return ''} })();\n\
    </script>\n\
    <p>x</p>";

fn ast(src: &str) -> Value {
    let allocator = Allocator::default();
    let parsed = parse(src, &allocator, ParseOptions::public_api()).expect("parses");
    with_serialize_arena(&parsed.arena, || {
        serde_json::to_value(&parsed).expect("serializes")
    })
}

fn nodes_of<'a>(value: &'a Value, ty: &str, out: &mut Vec<&'a Value>) {
    match value {
        Value::Object(map) => {
            if map.get("type").and_then(Value::as_str) == Some(ty) {
                out.push(value);
            }
            for v in map.values() {
                nodes_of(v, ty, out);
            }
        }
        Value::Array(items) => {
            for v in items {
                nodes_of(v, ty, out);
            }
        }
        _ => {}
    }
}

/// The declared `abstract class B`'s member list.
fn members(src: &str) -> Vec<Value> {
    let tree = ast(src);
    let mut found = Vec::new();
    nodes_of(&tree, "ClassDeclaration", &mut found);
    assert!(!found.is_empty(), "no ClassDeclaration");
    found[0]["body"]["body"]
        .as_array()
        .expect("class body")
        .clone()
}

fn key_name(member: &Value) -> &str {
    member["key"]["name"].as_str().unwrap_or("<none>")
}

#[test]
fn an_abstract_method_keeps_its_slot_in_the_class_body() {
    let members = members(SOURCE);
    assert_eq!(
        members.iter().map(key_name).collect::<Vec<_>>(),
        ["describe", "size", "concrete"],
        "member list"
    );
    // The alignment property the drop broke, stated directly: the member after
    // the abstract one is the `declare` field, at ITS index.
    assert_eq!(members[1]["declare"], Value::Bool(true));
    assert_eq!(members[0]["abstract"], Value::Bool(true));
}

#[test]
fn an_abstract_methods_value_is_a_bodyless_ts_declare_method() {
    let members = members(SOURCE);
    let value = &members[0]["value"];
    assert_eq!(value["type"], Value::String("TSDeclareMethod".into()));
    assert_eq!(value["expression"], Value::Bool(false));
    assert_eq!(value.get("body"), None, "a TSDeclareMethod has no body");
    assert_eq!(
        value["returnType"]["typeAnnotation"]["type"],
        Value::String("TSStringKeyword".into()),
        "return type: {value}"
    );
}

/// CONTROL — the concrete sibling. `abstract` must be absent rather than
/// `false`, and its value must still be a `FunctionExpression` that kept its
/// body: a fix that renamed every method value would pass the row above.
#[test]
fn a_concrete_method_is_untouched() {
    let members = members(SOURCE);
    let concrete = &members[2];
    assert_eq!(concrete.get("abstract"), None);
    assert_eq!(
        concrete["value"]["type"],
        Value::String("FunctionExpression".into())
    );
    assert_eq!(
        concrete["value"]["body"]["type"],
        Value::String("BlockStatement".into())
    );
}

/// An abstract PROPERTY stays dropped: official keeps it in the AST and then
/// emits `abstract p;`, which acorn rejects
/// (`upstream_issues/3082-svelte-abstract-property-not-erased.md`), so matching
/// the parse would only be half of a decision this repo has already taken the
/// other half of. No `.svelte` file in the collected corpus carries one, so
/// nothing is gated either way — this row exists so the asymmetry with the
/// method reads as a choice rather than an oversight.
#[test]
fn an_abstract_property_is_still_dropped() {
    let members = members(
        "<script lang=\"ts\">\n\
         \tabstract class B {\n\
         \t\tabstract p: string;\n\
         \t\tconcrete() { return 1; }\n\
         \t}\n\
         \tnew (class extends B { p = ''; })();\n\
         </script>",
    );
    assert_eq!(
        members.iter().map(key_name).collect::<Vec<_>>(),
        ["concrete"]
    );
}
