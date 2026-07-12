//! Regression tests for the `{@html}` / `{@render}` / `{@const}` / `{@debug}`
//! special-tag scanners.
//!
//! These tags used bespoke brace-depth loops to locate their closing `}`. The
//! loops handled some, but not all, JavaScript lexical contexts, so a brace
//! inside a comment or a regex literal terminated the tag early. They are now
//! routed through the shared `find_matching_bracket`, which skips strings,
//! template literals, comments, and regex literals exactly like upstream's
//! `read_expression`. Each case below is cross-checked against the official
//! Svelte compiler.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};

fn ast_json(src: &str) -> serde_json::Value {
    let ast = parse(src, ParseOptions::default()).expect("parse should succeed");
    let s = with_serialize_arena(&ast.arena, || serde_json::to_string(&ast).unwrap());
    serde_json::from_str(&s).unwrap()
}

/// Find the first node with `type == ty` and return its `end` offset.
fn find_node_end(value: &serde_json::Value, ty: &str) -> Option<u64> {
    match value {
        serde_json::Value::Object(map) => {
            if map.get("type").and_then(|t| t.as_str()) == Some(ty) {
                return map.get("end").and_then(|e| e.as_u64());
            }
            map.values().find_map(|v| find_node_end(v, ty))
        }
        serde_json::Value::Array(items) => items.iter().find_map(|it| find_node_end(it, ty)),
        _ => None,
    }
}

fn assert_tag_spans_whole(src: &str, ty: &str) {
    let json = ast_json(src);
    let end =
        find_node_end(&json, ty).unwrap_or_else(|| panic!("no {ty} node parsed from {src:?}"));
    assert_eq!(
        end as usize,
        src.len(),
        "{ty} should end at the trailing `}}` (src {src:?})"
    );
}

#[test]
fn html_tag_comment_with_brace() {
    // The `}` inside the block comment must not close the tag early.
    assert_tag_spans_whole("{@html x /* } */ + y}", "HtmlTag");
}

#[test]
fn html_tag_string_with_brace() {
    assert_tag_spans_whole(r#"{@html obj["}"]}"#, "HtmlTag");
}

#[test]
fn render_tag_regex_with_brace() {
    // `/}/g` is a regex literal, not a division, so its `}` is not the closer.
    assert_tag_spans_whole("{@render foo(/}/g)}", "RenderTag");
}

#[test]
fn render_tag_string_with_brace() {
    assert_tag_spans_whole(r#"{@render foo(obj["}"])}"#, "RenderTag");
}

#[test]
fn const_tag_regex_with_brace() {
    assert_tag_spans_whole("{@const re = /}/}", "ConstTag");
}

#[test]
fn const_tag_comment_with_brace() {
    assert_tag_spans_whole("{@const x = a /* } */}", "ConstTag");
}

#[test]
fn debug_tag_comment_with_brace() {
    // Official accepts this: `foo` is an identifier and the comment is dropped.
    assert_tag_spans_whole("{@debug foo /* } */}", "DebugTag");
}

#[test]
fn debug_tag_string_stops_at_real_close() {
    // The `}` inside the string must not close the tag; the trailing `X` stays a
    // separate text node, so the DebugTag ends before it.
    let src = r#"{@debug a["}"]}X"#;
    let json = ast_json(src);
    let end = find_node_end(&json, "DebugTag").expect("DebugTag");
    assert_eq!(end as usize, src.len() - 1, "DebugTag must end before `X`");
}

// ---- {@const} sequence-expression detection ---------------------------------
// A comma at the top level of the initializer means a sequence expression, which
// upstream rejects — unless the whole thing is wrapped in parentheses. Detecting
// this from the parsed initializer (rather than a byte-level comma scan) keeps
// commas inside regex / string / comment literals from being mistaken for a
// sequence separator.

fn parse_ok(src: &str) -> bool {
    parse(src, ParseOptions::default()).is_ok()
}

fn parse_err_code(src: &str) -> Option<String> {
    match parse(src, ParseOptions::default()) {
        Ok(_) => None,
        Err(e) => Some(format!("{e:?}")),
    }
}

#[test]
fn const_tag_regex_comma_is_not_a_sequence() {
    // `/a,b/` contains a comma but is a single regex literal — must not error.
    assert!(
        parse_ok("{@const x = /a,b/.test(y)}"),
        "regex comma wrongly treated as a sequence separator"
    );
}

#[test]
fn const_tag_parenthesized_sequence_is_allowed() {
    assert!(
        parse_ok("{@const a = (b, c)}"),
        "parenthesized sequence should be allowed"
    );
}

#[test]
fn const_tag_bare_sequence_is_rejected() {
    let code = parse_err_code("{@const a = b, c = d}").expect("bare sequence must error");
    assert!(
        code.contains("const_tag_invalid_expression"),
        "expected const_tag_invalid_expression, got {code}"
    );
}
