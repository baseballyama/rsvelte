//! Arrow-function parameters inside template expressions (event handlers) must
//! carry their real source spans in the public `parse()` AST, matching
//! svelte/compiler. The fast-path template arrow parser previously stubbed them
//! to `start == end == 0`.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};
use serde_json::Value;

fn first_arrow_params(source: &str) -> Vec<Value> {
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse should succeed");
    let value = with_serialize_arena(&ast.arena, || serde_json::to_value(&ast).unwrap());

    fn find(v: &Value) -> Option<&Value> {
        match v {
            Value::Object(m) => {
                if m.get("type").and_then(|t| t.as_str()) == Some("ArrowFunctionExpression") {
                    return Some(v);
                }
                m.values().find_map(find)
            }
            Value::Array(a) => a.iter().find_map(find),
            _ => None,
        }
    }
    let arrow = find(&value).expect("arrow function present");
    arrow
        .get("params")
        .and_then(|p| p.as_array())
        .cloned()
        .unwrap_or_default()
}

fn assert_span(source: &str, node: &Value, expected: &str) {
    let start = node.get("start").and_then(|s| s.as_u64()).unwrap() as usize;
    let end = node.get("end").and_then(|e| e.as_u64()).unwrap() as usize;
    assert!(start < end, "expected non-empty span, got {start}..{end}");
    assert_eq!(&source[start..end], expected);
    assert!(node.get("loc").is_some(), "param should carry a loc");
}

#[test]
fn multi_param_event_handler_spans() {
    let source = "<button onclick={(color, e) => handle(color, e)}>x</button>";
    let params = first_arrow_params(source);
    assert_eq!(params.len(), 2);
    assert_span(source, &params[0], "color");
    assert_span(source, &params[1], "e");
}

#[test]
fn single_param_event_handler_span() {
    let source = "<button onclick={(a) => a}>x</button>";
    let params = first_arrow_params(source);
    assert_eq!(params.len(), 1);
    assert_span(source, &params[0], "a");
}

#[test]
fn on_directive_event_handler_spans() {
    let source = "<button on:click={(color, e) => handle(color, e)}>x</button>";
    let params = first_arrow_params(source);
    assert_eq!(params.len(), 2);
    assert_span(source, &params[0], "color");
    assert_span(source, &params[1], "e");
}
