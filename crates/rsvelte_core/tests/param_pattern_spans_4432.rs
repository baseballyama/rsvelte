//! A template expression is parsed inside `wrap_for_parse("(", ..)`, so a node
//! at relative `p` sits at `base + p - 1`. Two conventions for carrying that
//! subtraction live in `read/expression.rs`: the pattern converters pre-subtract
//! it into their base, and `convert_expression` subtracts it from the span
//! itself. Every place the first hands a base to the second has to convert
//! between them, and only one of the four did — so the default value of a
//! destructured parameter reported a span one byte early, and a `function`
//! expression's parameters one byte late.
//!
//! Expectations are the official compiler's own answers, taken by running the
//! pinned `submodules/svelte` parser on these sources; a span is asserted as the
//! source text it slices to, because a bare number cannot be read.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};
use serde_json::Value;

fn ast_of(source: &str) -> Value {
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse should succeed");
    with_serialize_arena(&ast.arena, || serde_json::to_value(&ast).unwrap())
}

fn collect<'a>(value: &'a Value, want: &str, out: &mut Vec<&'a Value>) {
    match value {
        Value::Object(map) => {
            if map.get("type").and_then(|t| t.as_str()) == Some(want) {
                out.push(value);
            }
            for child in map.values() {
                collect(child, want, out);
            }
        }
        Value::Array(items) => {
            for child in items {
                collect(child, want, out);
            }
        }
        _ => {}
    }
}

fn slice(source: &str, node: &Value) -> String {
    let start = node.get("start").and_then(Value::as_u64).expect("start") as usize;
    let end = node.get("end").and_then(Value::as_u64).expect("end") as usize;
    assert!(start <= end && end <= source.len(), "span {start}..{end}");
    source[start..end].to_string()
}

fn source(template: &str) -> String {
    format!("<script>let z=1,k='a',o={{k:1}},f=x=>x,xs=[];</script>\n{template}\n")
}

/// `(cell, template, the text official's `AssignmentPattern.right` covers)`.
const DEFAULTS: &[(&str, &str, &str)] = &[
    ("obj", "{(({ a = 1 }) => a)({})}", "1"),
    ("arr", "{(([a = 1]) => a)([])}", "1"),
    ("plain", "{((a = 1) => a)()}", "1"),
    ("nested-obj", "{(({ a: { b = 2 } }) => b)({ a: {} })}", "2"),
    ("obj-rename", "{(({ a: q = 3 }) => q)({})}", "3"),
    ("obj-computed-key", "{(({ [k]: v = 4 }) => v)({})}", "4"),
    ("arr-hole", "{(([, a = 5]) => a)([])}", "5"),
    ("arr-nested-obj", "{(([{ a = 6 }]) => a)([{}])}", "6"),
    ("obj-in-arr", "{(({ a: [b = 7] }) => b)({ a: [] })}", "7"),
    ("obj-rest-after", "{(({ a = 8, ...r }) => a)({})}", "8"),
    ("second-param", "{((x, { a = 9 }) => a)(0, {})}", "9"),
    (
        "fn-expr",
        "{(function ({ a = 10 }) { return a; })({})}",
        "10",
    ),
    ("member", "{(({ a = o.k }) => a)({})}", "o.k"),
    ("call", "{(({ a = f(1) }) => a)({})}", "f(1)"),
    ("arrow", "{(({ a = () => 1 }) => a)({})}", "() => 1"),
    ("each-pattern", "{#each xs as { a = 1 }}{a}{/each}", "1"),
];

/// `(cell, template, the text official's parameter spans cover)`.
const PARAMS: &[(&str, &str, &[&str])] = &[
    ("arrow-ident", "{((a) => a)(1)}", &["a"]),
    ("fnexpr-ident", "{(function (a) { return a; })(1)}", &["a"]),
    (
        "fnexpr-two",
        "{(function (a, b) { return a; })(1,2)}",
        &["a", "b"],
    ),
    (
        "fnexpr-object",
        "{(function ({ a }) { return a; })({})}",
        &["{ a }"],
    ),
    (
        "fnexpr-rest",
        "{(function (...r) { return r; })(1)}",
        &["...r"],
    ),
    (
        "fnexpr-named",
        "{(function nm(a) { return a; })(1)}",
        &["a"],
    ),
    ("arrow-object", "{(({ a }) => a)({})}", &["{ a }"]),
];

#[test]
fn a_parameter_default_covers_the_value_the_source_wrote() {
    let mut wrong = Vec::new();
    for (cell, template, want) in DEFAULTS {
        let src = source(template);
        let value = ast_of(&src);
        let mut found = Vec::new();
        collect(&value, "AssignmentPattern", &mut found);
        let Some(node) = found.first() else {
            wrong.push(format!("{cell}: no AssignmentPattern"));
            continue;
        };
        let right = node.get("right").expect("right");
        let got = slice(&src, right);
        if got != *want {
            wrong.push(format!("{cell}: right is {got:?}, official says {want:?}"));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}

#[test]
fn a_function_parameter_covers_the_pattern_the_source_wrote() {
    let mut wrong = Vec::new();
    for (cell, template, want) in PARAMS {
        let src = source(template);
        let value = ast_of(&src);
        let mut found = Vec::new();
        collect(&value, "FunctionExpression", &mut found);
        collect(&value, "ArrowFunctionExpression", &mut found);
        let Some(node) = found.first() else {
            wrong.push(format!("{cell}: no function node"));
            continue;
        };
        let params: Vec<String> = node
            .get("params")
            .and_then(Value::as_array)
            .expect("params")
            .iter()
            .map(|p| slice(&src, p))
            .collect();
        if params != *want {
            wrong.push(format!(
                "{cell}: params are {params:?}, official says {want:?}"
            ));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}

/// Both tables have to contain a cell that separates the two conventions from
/// each other, or a fix that applies one of them everywhere passes.
#[test]
fn the_tables_carry_both_conventions() {
    let arrow_defaults = DEFAULTS
        .iter()
        .filter(|(_, t, _)| !t.contains("function") && t.contains("=>"))
        .count();
    let fn_defaults = DEFAULTS
        .iter()
        .filter(|(_, t, _)| t.contains("function"))
        .count();
    let each_defaults = DEFAULTS
        .iter()
        .filter(|(_, t, _)| t.contains("#each"))
        .count();
    assert!(
        arrow_defaults >= 10,
        "arrow-hosted defaults: {arrow_defaults}"
    );
    assert!(fn_defaults >= 1, "function-hosted defaults: {fn_defaults}");
    assert!(each_defaults >= 1, "each-hosted defaults: {each_defaults}");

    let arrow_params = PARAMS
        .iter()
        .filter(|(_, t, _)| !t.contains("function"))
        .count();
    let fn_params = PARAMS
        .iter()
        .filter(|(_, t, _)| t.contains("function"))
        .count();
    assert!(arrow_params >= 2, "arrow parameter cells: {arrow_params}");
    assert!(fn_params >= 4, "function parameter cells: {fn_params}");
}
