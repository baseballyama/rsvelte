use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};
use serde_json::Value;

fn collect_directives<'a>(value: &'a Value, out: &mut Vec<&'a serde_json::Map<String, Value>>) {
    match value {
        Value::Array(items) => {
            for item in items {
                collect_directives(item, out);
            }
        }
        Value::Object(object) => {
            if object
                .get("type")
                .and_then(Value::as_str)
                .is_some_and(|kind| kind.ends_with("Directive"))
            {
                out.push(object);
            }
            for child in object.values() {
                collect_directives(child, out);
            }
        }
        _ => {}
    }
}

#[test]
fn expressionless_directives_serialize_an_explicit_null_expression() {
    let source = "<div on:click use:action transition:fade animate:flip let:item></div>";
    let ast = parse(
        source,
        &rsvelte_core::Allocator::default(),
        ParseOptions::public_api(),
    )
    .expect("component should parse");
    let value = with_serialize_arena(&ast.arena, || serde_json::to_value(&ast).unwrap());
    let mut directives = Vec::new();
    collect_directives(&value, &mut directives);

    for kind in [
        "OnDirective",
        "UseDirective",
        "TransitionDirective",
        "AnimateDirective",
        "LetDirective",
    ] {
        let directive = directives
            .iter()
            .find(|node| node.get("type").and_then(Value::as_str) == Some(kind))
            .unwrap_or_else(|| panic!("missing {kind}"));
        assert_eq!(directive.get("expression"), Some(&Value::Null), "{kind}");
    }
}
