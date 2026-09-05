//! Upstream's `read_combinator` (`1-parse/read/style.js`) captures a descendant
//! combinator's `start` before `allow_whitespace()` and its `end` after, so the node
//! spans the whole whitespace run; an explicit combinator is the run's own token only.
//! rsvelte spanned exactly one character for the descendant case.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};
use serde_json::Value;

/// Every `Combinator` in source order, as `(name, start, end)`.
fn combinators(source: &str) -> Vec<(String, usize, usize)> {
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse should succeed");
    let value = with_serialize_arena(&ast.arena, || serde_json::to_value(&ast).unwrap());

    fn walk(v: &Value, out: &mut Vec<(String, usize, usize)>) {
        match v {
            Value::Object(m) => {
                if m.get("type").and_then(|t| t.as_str()) == Some("Combinator") {
                    out.push((
                        m.get("name")
                            .and_then(|n| n.as_str())
                            .unwrap_or("")
                            .to_string(),
                        m.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize,
                        m.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize,
                    ));
                }
                for x in m.values() {
                    walk(x, out);
                }
            }
            Value::Array(a) => {
                for x in a {
                    walk(x, out);
                }
            }
            _ => {}
        }
    }
    let mut out = Vec::new();
    walk(&value, &mut out);
    out.sort_by_key(|c| c.1);
    out
}

/// `(label, selector, expected combinators as (name, covered text))`.
/// Expected values are the official compiler's, read off `svelte/compiler`'s `parse()`.
const CELLS: &[(&str, &str, &[(&str, &str)])] = &[
    ("one space", ".a .b", &[(" ", " ")]),
    ("three spaces", ".a   .b", &[(" ", "   ")]),
    ("newline + indent", ".a\n  .b", &[(" ", "\n  ")]),
    ("tab run", ".a\t\t.b", &[(" ", "\t\t")]),
    (
        "two descendant runs",
        ".a   .b   .c",
        &[(" ", "   "), (" ", "   ")],
    ),
    // Negative controls: an explicit combinator never absorbs the whitespace around it.
    ("child, spaced", ".a > .b", &[(">", ">")]),
    ("child, tight", ".a>.b", &[(">", ">")]),
    ("adjacent sibling", ".a + .b", &[("+", "+")]),
    ("general sibling", ".a ~ .b", &[("~", "~")]),
];

fn wrap(selector: &str) -> String {
    format!(
        "<p class=\"a\"><b class=\"b\"><i class=\"c\"></i></b></p><style>{selector}{{color:red}}</style>"
    )
}

#[test]
fn descendant_combinator_spans_its_whole_whitespace_run() {
    let mut failures = Vec::new();
    for (label, selector, expected) in CELLS {
        let source = wrap(selector);
        let got = combinators(&source);
        let rendered: Vec<(String, String)> = got
            .iter()
            .map(|(n, s, e)| (n.clone(), source[*s..*e].to_string()))
            .collect();
        let want: Vec<(String, String)> = expected
            .iter()
            .map(|(n, t)| ((*n).to_string(), (*t).to_string()))
            .collect();
        if rendered != want {
            failures.push(format!("{label}: want {want:?}, got {rendered:?}"));
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}

#[test]
fn the_table_exercises_both_sides_of_the_run_length_axis() {
    // A run of length 1 agrees under either rule, so the table would measure nothing
    // if every descendant cell were a single space.
    let long_runs = CELLS
        .iter()
        .flat_map(|(_, _, exp)| exp.iter())
        .filter(|(name, text)| *name == " " && text.chars().count() > 1)
        .count();
    let single = CELLS
        .iter()
        .flat_map(|(_, _, exp)| exp.iter())
        .filter(|(name, text)| *name == " " && text.chars().count() == 1)
        .count();
    let explicit = CELLS
        .iter()
        .flat_map(|(_, _, exp)| exp.iter())
        .filter(|(name, _)| *name != " ")
        .count();
    assert!(
        long_runs >= 4,
        "no descendant cell has a run longer than one character, so the assertion above cannot fail: {long_runs}"
    );
    assert!(
        single >= 1,
        "no single-character descendant control: {single}"
    );
    assert!(explicit >= 4, "no explicit-combinator controls: {explicit}");
}
