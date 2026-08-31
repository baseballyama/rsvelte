//! A class-member modifier is emitted only where the source WROTE it.
//!
//! acorn-typescript's rule, measured against the submodule compiler: a plain
//! `class C { a = 1; m() {} }` carries no modifier field at all, and each of
//! `readonly` / `private` / `declare` / `?` / `!` / `override` / `accessor`
//! adds exactly the one field it spells. Absence and `false` are therefore
//! different facts, which is why every row below asserts a field is ABSENT
//! rather than asserting it is `false`.
//!
//! rsvelte was wrong in both directions: it emitted none of the six written
//! modifiers, and it emitted `accessor` on every property whether written or
//! not. A fix for either direction alone leaves the other, which is what the
//! two control rows at the bottom are for.

use rsvelte_core::Allocator;
use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse};
use serde_json::Value;

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

/// The LAST member of `ty` in a `lang="ts"` script holding `member`.
///
/// `override` is rejected by the parser unless the class extends something, so
/// a member that needs a superclass gets one — and the base class is why this
/// takes the last match rather than the first.
fn member(member: &str, ty: &str) -> Value {
    let needs_super = member.contains("override");
    let base = if needs_super {
        "class B { g() {} }\n  "
    } else {
        ""
    };
    let heritage = if needs_super { " extends B" } else { "" };
    let src = format!(
        "<script lang=\"ts\">\n  {base}class C{heritage} {{\n    {member}\n  }}\n</script>"
    );
    let tree = ast(&src);
    let mut found = Vec::new();
    nodes_of(&tree, ty, &mut found);
    assert!(!found.is_empty(), "no {ty} for {member:?}");
    found[found.len() - 1].clone()
}

fn field(node: &Value, name: &str) -> Option<Value> {
    node.get(name).cloned()
}

#[test]
fn a_written_modifier_is_present_with_the_value_acorn_gives_it() {
    for (source, ty, name, expected) in [
        (
            "readonly a = 1;",
            "PropertyDefinition",
            "readonly",
            Value::Bool(true),
        ),
        (
            "declare c: number;",
            "PropertyDefinition",
            "declare",
            Value::Bool(true),
        ),
        (
            "d?: number;",
            "PropertyDefinition",
            "optional",
            Value::Bool(true),
        ),
        (
            "e!: number;",
            "PropertyDefinition",
            "definite",
            Value::Bool(true),
        ),
        (
            "accessor f = 1;",
            "PropertyDefinition",
            "accessor",
            Value::Bool(true),
        ),
        (
            "private b = 1;",
            "PropertyDefinition",
            "accessibility",
            Value::String("private".into()),
        ),
        (
            "protected h = 1;",
            "PropertyDefinition",
            "accessibility",
            Value::String("protected".into()),
        ),
        (
            "override g() {}",
            "MethodDefinition",
            "override",
            Value::Bool(true),
        ),
        (
            "private m() {}",
            "MethodDefinition",
            "accessibility",
            Value::String("private".into()),
        ),
        (
            "n?(): void {}",
            "MethodDefinition",
            "optional",
            Value::Bool(true),
        ),
    ] {
        assert_eq!(
            field(&member(source, ty), name),
            Some(expected),
            "{source:?} should carry `{name}`"
        );
    }
}

/// CONTROL — the same members with nothing written. Every modifier must be
/// ABSENT, not `false`: a fix that emits the field unconditionally passes the
/// row above and fails here.
#[test]
fn an_unwritten_modifier_is_absent_rather_than_false() {
    let property = member("a = 1;", "PropertyDefinition");
    for name in [
        "readonly",
        "declare",
        "optional",
        "definite",
        "override",
        "accessibility",
        "accessor",
    ] {
        assert_eq!(field(&property, name), None, "PropertyDefinition.{name}");
    }
    let method = member("m() {}", "MethodDefinition");
    for name in ["override", "optional", "accessibility"] {
        assert_eq!(field(&method, name), None, "MethodDefinition.{name}");
    }
}

/// CONTROL — the fields every member carries unconditionally still do. The
/// rule above is about TS modifiers only, and `static`/`computed` are not
/// modifiers in that sense: acorn emits them on every member.
#[test]
fn the_unconditional_fields_are_untouched() {
    let property = member("a = 1;", "PropertyDefinition");
    assert_eq!(field(&property, "static"), Some(Value::Bool(false)));
    assert_eq!(field(&property, "computed"), Some(Value::Bool(false)));
    let method = member("static m() {}", "MethodDefinition");
    assert_eq!(field(&method, "static"), Some(Value::Bool(true)));
    assert_eq!(field(&method, "kind"), Some(Value::String("method".into())));
}

/// The same rule at the OTHER entry point. A class body can also be reached
/// through a TEMPLATE expression (`<svelte:options customElement={{ extend: c =>
/// class extends c { … } }} />`), which is a third converter — and it emitted no
/// modifier at all while the script paths emitted every one. Upstream has one
/// parser and one answer, so the grid has to cross the entry point.
///
/// Expectations measured on the official compiler for this exact source.
#[test]
fn a_template_expressions_class_body_answers_the_same() {
    let src = "<svelte:options customElement={{\n\ttag: \"custom-element\",\n\textend: (c) => {\n\t\treturn class extends c {\n\t\t\tpublic test: string = \"test\";\n\t\t\tprotected readonly n = 1;\n\t\t\tdeclare d: number;\n\t\t\toverride m() {}\n\t\t}\n\t},\n}}/>\n\n<script lang=\"ts\">\n\tlet { name } = $props();\n</script>\n\n<p>{name}</p>";
    let tree = ast(src);
    let mut raw = Vec::new();
    nodes_of(&tree, "PropertyDefinition", &mut raw);
    nodes_of(&tree, "MethodDefinition", &mut raw);
    // `<svelte:options>` keeps its attribute value in two places, so every
    // member is reached twice; the members themselves are the unique starts.
    let mut found: Vec<Value> = Vec::new();
    for node in raw {
        if !found.iter().any(|seen| seen["start"] == node["start"]) {
            found.push(node.clone());
        }
    }
    assert_eq!(found.len(), 4, "class members reached: {found:#?}");

    let by_key = |name: &str| -> Value {
        found
            .iter()
            .find(|node| node["key"]["name"] == Value::String(name.into()))
            .unwrap_or_else(|| panic!("no member `{name}`"))
            .clone()
    };
    assert_eq!(
        field(&by_key("test"), "accessibility"),
        Some(Value::String("public".into()))
    );
    assert_eq!(
        field(&by_key("n"), "accessibility"),
        Some(Value::String("protected".into()))
    );
    assert_eq!(field(&by_key("n"), "readonly"), Some(Value::Bool(true)));
    assert_eq!(field(&by_key("d"), "declare"), Some(Value::Bool(true)));
    assert_eq!(field(&by_key("m"), "override"), Some(Value::Bool(true)));
    // CONTROL — still written-only at this entry point too.
    assert_eq!(field(&by_key("n"), "declare"), None);
    assert_eq!(field(&by_key("m"), "accessibility"), None);
}
