//! `parse()` shapes compared field-for-field against the official parser.
//!
//! Every expected value is the official parser's own output on the same source
//! (Svelte 5.57.1). Positions are byte offsets: sources are ASCII except where a
//! test says otherwise and derives the offset from the source.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::compiler::print::print_with_source;
use rsvelte_core::{
    CompileOptions, GenerateMode, ParseOptions, compile, compiler::CssMode, convert_to_legacy,
    parse,
};
use serde_json::{Value, json};

fn modern(src: &str) -> Value {
    let ast = parse(
        src,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern: true,
            ..Default::default()
        },
    )
    .expect("parse");
    let s = with_serialize_arena(&ast.arena, || serde_json::to_string(&ast).unwrap());
    serde_json::from_str(&s).unwrap()
}

fn legacy(src: &str) -> Value {
    let ast = parse(
        src,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse");
    convert_to_legacy(src, ast)
}

fn comment(value: &str, start: usize, end: usize, position: Option<u64>) -> Value {
    let mut c = json!({ "type": "CSSComment", "value": value, "start": start, "end": end });
    if let Some(position) = position {
        c["position"] = json!(position);
    }
    c
}

#[test]
fn value_and_prelude_comments_are_cut_out_and_recorded_with_their_position() {
    let src = "<style>\n\tp { color: /*a*/ red /*b*/ blue; }\n\t@media /* m */ screen { p { color: red } }\n</style>";
    for (label, css) in [
        ("modern", modern(src)["css"].clone()),
        ("legacy", legacy(src)["css"].clone()),
    ] {
        assert_eq!(
            css["children"][0]["block"]["children"][0]["value"], "red  blue",
            "{label}"
        );
        assert_eq!(css["children"][1]["prelude"], "screen", "{label}");
        assert_eq!(
            css["comments"],
            json!([
                comment("a", 20, 25, Some(0)),
                comment("b", 30, 35, Some(4)),
                comment(" m ", 52, 59, Some(0)),
            ]),
            "{label}"
        );
    }
}

#[test]
fn a_value_comment_position_counts_utf16_units() {
    let src = "<style>\n\tp { font-family: \"日本\" /* 注 */ serif; }\n</style>";
    let css = modern(src)["css"].clone();
    assert_eq!(
        css["children"][0]["block"]["children"][0]["value"],
        "\"日本\"  serif"
    );
    let start = src.find("/* 注").unwrap();
    assert_eq!(
        css["comments"],
        json!([comment(" 注 ", start, start + "/* 注 */".len(), Some(5))])
    );
}

#[test]
fn comments_in_strings_and_url_stay_in_the_value() {
    let src = "<style>\n\tp { content: \"/* no */\"; background: url(/*x*/a.png) /* y */ none; }\n</style>";
    let css = modern(src)["css"].clone();
    let decls = &css["children"][0]["block"]["children"];
    assert_eq!(decls[0]["value"], "\"/* no */\"");
    assert_eq!(decls[1]["value"], "url(/*x*/a.png)  none");
    assert_eq!(css["comments"].as_array().unwrap().len(), 1);
    assert_eq!(css["comments"][0]["value"], " y ");
}

#[test]
fn a_hex_escape_terminator_belongs_to_the_selector_before_a_combinator() {
    let src = "<style>\n\t.\\61  b { color: red; }\n</style>";
    let css = modern(src)["css"].clone();
    let rel = &css["children"][0]["prelude"]["children"][0]["children"];
    assert_eq!(
        (rel[0]["start"].clone(), rel[0]["end"].clone()),
        (json!(9), json!(14))
    );
    assert_eq!(rel[0]["selectors"][0]["end"], 14);
    assert_eq!(
        (rel[1]["start"].clone(), rel[1]["end"].clone()),
        (json!(14), json!(16))
    );
}

#[test]
fn pseudo_element_args_start_after_a_leading_comment() {
    let src = "<style>\n\t.x::part(/* a */ label) { color: red; }\n</style>";
    let css = modern(src)["css"].clone();
    let args = &css["children"][0]["prelude"]["children"][0]["children"][0]["selectors"][1]["args"];
    assert_eq!(
        (args["start"].clone(), args["end"].clone()),
        (json!(26), json!(31))
    );
}

#[test]
fn an_empty_quoted_style_directive_value_is_one_empty_text() {
    let src = "<div style:color=\"\"></div>";
    let value = modern(src)["fragment"]["nodes"][0]["attributes"][0]["value"].clone();
    assert_eq!(
        value,
        json!([{ "start": 18, "end": 18, "type": "Text", "raw": "", "data": "" }])
    );
}

#[test]
fn whitespace_before_a_trailing_svelte_options_is_kept() {
    let src = "<p>a</p>\n\n<svelte:options runes />";
    let nodes = modern(src)["fragment"]["nodes"].clone();
    let shape: Vec<_> = nodes
        .as_array()
        .unwrap()
        .iter()
        .map(|n| (n["type"].clone(), n["start"].clone(), n["end"].clone()))
        .collect();
    assert_eq!(
        shape,
        vec![
            (json!("RegularElement"), json!(0), json!(8)),
            (json!("Text"), json!(8), json!(10)),
        ]
    );
}

#[test]
fn legacy_empty_await_branches_end_at_the_brace_before_them() {
    let block = legacy("{#await p}{:then}{:catch}{/await}")["html"]["children"][0].clone();
    for key in ["pending", "then", "catch"] {
        assert_eq!(
            (block[key]["start"].clone(), block[key]["end"].clone()),
            (json!(10), json!(10)),
            "{key}"
        );
    }
}

#[test]
fn an_at_rule_header_is_emitted_from_the_source() {
    let src = "<p>x</p>\n<style>\n\t@media /* m */ screen { p { color: red } }\n</style>";
    let out = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile");
    assert_eq!(
        out.css.expect("css").code,
        "\n\t@media /* m */ screen { p.svelte-70o1m8 { color: red } }\n"
    );
}

#[test]
fn print_reinserts_value_and_prelude_comments() {
    let src = "<style>\n\tp { color: r /* v */ ed; }\n\t@media screen/* m */and (width > 0) { p { color: red } }\n</style>";
    let ast = parse(
        src,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern: true,
            ..Default::default()
        },
    )
    .expect("parse");
    let code = print_with_source(&ast, None, Some(src))
        .expect("print")
        .code;
    assert!(code.contains("\t\tcolor: r /* v */ ed;\n"), "{code}");
    assert!(
        code.contains("\t@media screen/* m */and (width > 0) {\n"),
        "{code}"
    );
}

fn loc(line: u64, start: u64, end: u64) -> Value {
    json!({ "start": { "line": line, "column": start }, "end": { "line": line, "column": end } })
}

fn literal(start: u64, value: u64) -> Value {
    json!({
        "type": "Literal", "start": start, "end": start + 1, "loc": loc(1, start, start + 1),
        "value": value, "raw": value.to_string()
    })
}

#[test]
fn a_snippet_parameter_keeps_its_parenthesized_expressions() {
    let src = "{#snippet one(a, b = 1, c = (2, 3))}x{/snippet}";
    let expected = json!({
        "type": "AssignmentPattern", "start": 24, "end": 34, "loc": loc(1, 24, 34),
        "left": { "type": "Identifier", "start": 24, "end": 25, "loc": loc(1, 24, 25), "name": "c" },
        "right": {
            "type": "ParenthesizedExpression", "start": 28, "end": 34, "loc": loc(1, 28, 34),
            "expression": {
                "type": "SequenceExpression", "start": 29, "end": 33, "loc": loc(1, 29, 33),
                "expressions": [literal(29, 2), literal(32, 3)]
            }
        }
    });
    assert_eq!(
        modern(src)["fragment"]["nodes"][0]["parameters"][2],
        expected
    );
    assert_eq!(
        legacy(src)["html"]["children"][0]["parameters"][2],
        expected
    );
}

#[test]
fn a_snippet_parameter_pair_wraps_the_outermost_node_it_encloses() {
    let src = "{#snippet s(a = (b?.c), d = ((1)))}x{/snippet}";
    let parameters = modern(src)["fragment"]["nodes"][0]["parameters"].clone();
    let chain = &parameters[0]["right"];
    assert_eq!(chain["type"], "ParenthesizedExpression");
    assert_eq!((&chain["start"], &chain["end"]), (&json!(16), &json!(22)));
    assert_eq!(chain["expression"]["type"], "ChainExpression");
    assert_eq!(
        chain["expression"]["expression"]["type"],
        "MemberExpression"
    );
    assert_eq!(
        parameters[1]["right"],
        json!({
            "type": "ParenthesizedExpression", "start": 28, "end": 33, "loc": loc(1, 28, 33),
            "expression": {
                "type": "ParenthesizedExpression", "start": 29, "end": 32, "loc": loc(1, 29, 32),
                "expression": literal(30, 1)
            }
        })
    );
}

fn loose(src: &str, modern_ast: bool) -> Value {
    let ast = parse(
        src,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern: modern_ast,
            loose: true,
            ..Default::default()
        },
    )
    .expect("parse");
    if !modern_ast {
        return convert_to_legacy(src, ast);
    }
    let mut value = with_serialize_arena(&ast.arena, || serde_json::to_value(&ast).unwrap());
    rsvelte_core::ast::template::mark_unclosed_ancestors(&mut value, &ast.unclosed_ancestors);
    value
}

#[test]
fn a_loose_parse_ends_only_the_innermost_open_node() {
    let nodes = loose("<div><b>x", true)["fragment"]["nodes"].clone();
    assert_eq!(nodes[0]["end"], -1);
    assert_eq!(nodes[0]["fragment"]["nodes"][0]["end"], 9);

    let html = loose("<div><b>x", false)["html"].clone();
    assert_eq!((&html["start"], &html["end"]), (&json!(0), &json!(-1)));
    assert_eq!(html["children"][0]["end"], -1);
    assert_eq!(html["children"][0]["children"][0]["end"], 9);

    let if_block = loose("{#if a}x{:else if b}<b>y", true)["fragment"]["nodes"][0].clone();
    let elseif = &if_block["alternate"]["nodes"][0];
    assert_eq!(if_block["end"], -1);
    assert_eq!((&elseif["start"], &elseif["end"]), (&json!(8), &json!(-1)));
    assert_eq!(elseif["consequent"]["nodes"][0]["end"], 24);
}

#[test]
fn an_unclosed_else_if_is_the_block_left_open() {
    let err = parse(
        "{#if a}x{:else if b}y",
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect_err("unclosed");
    let rendered = format!("{err:?}");
    assert!(rendered.contains("block_unclosed"), "{rendered}");
    assert!(rendered.contains("span: (8, 9)"), "{rendered}");
}
