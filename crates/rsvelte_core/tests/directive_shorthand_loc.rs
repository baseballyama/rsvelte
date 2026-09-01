//! `bind:`/`class:` shorthand synthesizes its `Identifier`, and upstream writes
//! no `loc` on a node it built by hand (`1-parse/state/element.js:707-716`).
//! rsvelte attached one and then removed it again where the expression's name
//! equalled the directive's — a predicate that also fires on `bind:map={map}`,
//! whose expression *was* parsed and *does* carry a `loc`. So the two ports were
//! wrong in opposite directions: `bind:` stripped too much, `class:` too little.
//!
//! Expectations are pinned as constants, taken from the official compiler on
//! 2026-09-02, so this test does not pass by agreeing with a broken oracle.

use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse, remove_bom};

/// Every directive expression's `loc` presence, in source order.
fn directive_expression_locs(source: &str, modern: bool) -> Vec<bool> {
    let source = remove_bom(source);
    let allocator = rsvelte_core::Allocator::default();
    let ast = parse(source, &allocator, ParseOptions::public_api()).expect("parses");
    let value: serde_json::Value = if modern {
        rsvelte_core::ast::arena::with_serialize_arena(&ast.arena, || {
            serde_json::to_value(&ast).expect("serializes")
        })
    } else {
        serde_json::to_value(rsvelte_core::convert_to_legacy(source, ast)).expect("serializes")
    };

    let mut out = Vec::new();
    collect(&value, &mut out);
    out
}

fn collect(value: &serde_json::Value, out: &mut Vec<bool>) {
    match value {
        serde_json::Value::Object(map) => {
            if matches!(
                map.get("type").and_then(serde_json::Value::as_str),
                Some("BindDirective" | "Binding" | "ClassDirective" | "Class")
            ) {
                let has_loc = map
                    .get("expression")
                    .and_then(serde_json::Value::as_object)
                    .is_some_and(|expression| expression.contains_key("loc"));
                out.push(has_loc);
            }
            for nested in map.values() {
                collect(nested, out);
            }
        }
        serde_json::Value::Array(items) => {
            for item in items {
                collect(item, out);
            }
        }
        _ => {}
    }
}

/// `(source, does official put a `loc` on the directive's expression?)`
const CASES: &[(&str, bool)] = &[
    ("<Widget bind:foo/>", false),
    ("<Widget bind:map={map}/>", true),
    ("<Widget bind:other={map}/>", true),
    ("<p class:red></p>", false),
    ("<p class:red={red}></p>", true),
    ("<p class:red={other}></p>", true),
];

#[test]
fn shorthand_directive_expression_has_no_loc_and_an_explicit_one_keeps_it() {
    let mut failures = Vec::new();
    for modern in [false, true] {
        for (source, expected) in CASES {
            let locs = directive_expression_locs(source, modern);
            assert_eq!(
                locs.len(),
                1,
                "{source} ({}) should hold exactly one directive",
                if modern { "modern" } else { "legacy" }
            );
            if locs[0] != *expected {
                failures.push(format!(
                    "{source} ({}): expected loc={expected}, got loc={}",
                    if modern { "modern" } else { "legacy" },
                    locs[0]
                ));
            }
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
