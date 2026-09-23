//! Two `parse()` shapes rsvelte got wrong, both keyed in
//! `parse-ast-known-failures.json` until this change (#4133).
//!
//! 1. Upstream picks one acorn variant per component (`1-parse/acorn.js`), so a
//!    template expression in a `lang="ts"` component is parsed by
//!    acorn-typescript and carries its shapes — including a dynamic import that
//!    spells its second argument `arguments` and omits `options` entirely.
//!    rsvelte parsed the expression with the TypeScript grammar but converted it
//!    as if it were JavaScript, so `options: null` appeared on 34 corpus files,
//!    and a second argument written there was dropped outright.
//! 2. `element.js:361` assigns the preceding HTML comment **node** to
//!    `css.content.comment`; rsvelte assigned its text.
//!
//! Every expected value below was printed by the official compiler
//! (`submodules/svelte/.../compiler/index.js`) and pasted.

use rsvelte_core::ast::arena::CommentCaptureGuard;
use rsvelte_core::{CompileOptions, GenerateMode, ParseOptions, compile, convert_to_legacy, parse};
use serde_json::Value;

fn ast(source: &str, modern: bool) -> Value {
    let _capture = CommentCaptureGuard::new();
    let parsed = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern,
            skip_expression_loc: true,
            capture_comments: true,
            ..Default::default()
        },
    )
    .expect("parse should succeed");
    convert_to_legacy(source, parsed)
}

fn first(node: &Value, ty: &str) -> Option<Value> {
    match node {
        Value::Array(items) => items.iter().find_map(|item| first(item, ty)),
        Value::Object(map) => {
            if map.get("type").and_then(Value::as_str) == Some(ty) {
                return Some(node.clone());
            }
            map.values().find_map(|value| first(value, ty))
        }
        _ => None,
    }
}

#[test]
fn a_dynamic_import_in_a_ts_component_template_omits_options() {
    let source = "<script lang=\"ts\"></script>{#await import(\"x\")}a{/await}";
    let node = first(&ast(source, true), "ImportExpression").expect("ImportExpression");
    assert!(
        node.get("options").is_none(),
        "acorn-typescript writes no `options`: {node}"
    );
}

#[test]
fn a_dynamic_import_in_a_js_component_template_keeps_options() {
    // The other side of the same branch: acorn does write the field, as null.
    let source = "<script></script>{#await import(\"x\")}a{/await}";
    let node = first(&ast(source, true), "ImportExpression").expect("ImportExpression");
    assert_eq!(node.get("options"), Some(&Value::Null), "{node}");
}

#[test]
fn a_second_import_argument_in_a_template_is_not_dropped() {
    let source = "<script></script>{#await import(\"x\", { with: { type: \"json\" } })}a{/await}";
    let node = first(&ast(source, true), "ImportExpression").expect("ImportExpression");
    assert_eq!(
        node["options"]["type"].as_str(),
        Some("ObjectExpression"),
        "{node}"
    );
}

#[test]
fn the_comment_before_a_style_tag_is_stored_as_a_node() {
    let source = "<p></p>\n<!-- svelte-ignore css_unused_selector -->\n<style>a{color:red}</style>";
    for modern in [true, false] {
        let root = ast(source, modern);
        let css = root.get("css").expect("css");
        let comment = &css["content"]["comment"];
        assert_eq!(comment["type"].as_str(), Some("Comment"), "{comment}");
        assert_eq!(comment["start"].as_u64(), Some(8), "{comment}");
        assert_eq!(comment["end"].as_u64(), Some(50), "{comment}");
        assert_eq!(
            comment["data"].as_str(),
            Some(" svelte-ignore css_unused_selector "),
            "{comment}"
        );
    }
}

#[test]
fn a_style_tag_with_no_preceding_comment_keeps_a_null() {
    let source = "<p></p>\n<style>a{color:red}</style>";
    let root = ast(source, true);
    assert_eq!(root["css"]["content"]["comment"], Value::Null, "{root}");
}

#[test]
fn the_svelte_ignore_comment_still_silences_the_unused_selector_warning() {
    // The one consumer of the field reads it through the node now; a shape
    // change that left it reading the whole object would re-enable the warning.
    let source = "<p></p>\n<!-- svelte-ignore css_unused_selector -->\n<style>a{color:red}</style>";
    let warnings = compile(
        source,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings;
    assert!(
        !warnings.iter().any(|w| w.code == "css_unused_selector"),
        "{warnings:?}"
    );
}
