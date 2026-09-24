//! `{let …}` / `{const …}` is parsed by acorn as a statement
//! (`1-parse/state/tag.js` `parse_statement_at`), so its declaration and
//! declarators carry a `loc`; `{@const}` builds its declaration by hand and has
//! none. Expectations are the official compiler's output for `SOURCE`.

use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse};

const SOURCE: &str = "{let a = 1, b = 2}\n{const c = 3}\n{#each x as y}{@const z = y}{/each}\n";

type Declaration = (&'static str, u64, u64, Option<[u64; 4]>);

const MODERN: &[Declaration] = &[
    ("VariableDeclaration", 1, 17, Some([1, 1, 1, 17])),
    ("VariableDeclarator", 5, 10, Some([1, 5, 1, 10])),
    ("VariableDeclarator", 12, 17, Some([1, 12, 1, 17])),
    ("VariableDeclaration", 20, 31, Some([2, 1, 2, 12])),
    ("VariableDeclarator", 26, 31, Some([2, 7, 2, 12])),
    ("VariableDeclaration", 49, 60, None),
    ("VariableDeclarator", 55, 60, None),
];

fn declarations(modern: bool) -> Vec<(String, u64, u64, Option<[u64; 4]>)> {
    let allocator = rsvelte_core::Allocator::default();
    let ast = parse(SOURCE, &allocator, ParseOptions::public_api()).expect("parses");
    let value: serde_json::Value = if modern {
        rsvelte_core::ast::arena::with_serialize_arena(&ast.arena, || {
            serde_json::to_value(&ast).expect("serializes")
        })
    } else {
        serde_json::to_value(rsvelte_core::convert_to_legacy(SOURCE, ast)).expect("serializes")
    };
    let mut out = Vec::new();
    collect(&value, &mut out);
    out
}

fn collect(value: &serde_json::Value, out: &mut Vec<(String, u64, u64, Option<[u64; 4]>)>) {
    match value {
        serde_json::Value::Object(map) => {
            if let Some(kind @ ("VariableDeclaration" | "VariableDeclarator")) =
                map.get("type").and_then(serde_json::Value::as_str)
            {
                let number = |v: &serde_json::Value| v.as_u64().expect("number");
                let loc = map.get("loc").map(|loc| {
                    [
                        number(&loc["start"]["line"]),
                        number(&loc["start"]["column"]),
                        number(&loc["end"]["line"]),
                        number(&loc["end"]["column"]),
                    ]
                });
                out.push((
                    kind.to_string(),
                    number(&map["start"]),
                    number(&map["end"]),
                    loc,
                ));
            }
            for nested in map.values() {
                collect(nested, out);
            }
        }
        serde_json::Value::Array(items) => items.iter().for_each(|item| collect(item, out)),
        _ => {}
    }
}

fn expected(rows: &[Declaration]) -> Vec<(String, u64, u64, Option<[u64; 4]>)> {
    rows.iter()
        .map(|&(kind, start, end, loc)| (kind.to_string(), start, end, loc))
        .collect()
}

#[test]
fn a_declaration_tag_carries_acorn_locations_and_a_const_tag_does_not() {
    assert_eq!(declarations(true), expected(MODERN));
}

#[test]
fn the_legacy_shape_keeps_the_declaration_tag_locations() {
    assert_eq!(declarations(false), expected(&MODERN[..5]));
}
