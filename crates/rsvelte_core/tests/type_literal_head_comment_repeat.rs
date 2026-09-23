//! A comment consumed while acorn-typescript parses a type SPECULATIVELY used to
//! be printed twice: `tsLookAhead` left `isLookahead` unset, so the comment fired
//! `onComment` during the lookahead and again after the rewind. rsvelte carried a
//! port of that doubling, keyed on the speculated region (the opener to the token
//! that settles the ambiguity).
//!
//! `@sveltejs/acorn-typescript` 1.0.13 fixed it and Svelte 5.57.1 brings it in, so
//! the port is gone and this grid is the guard against re-introducing it. The 33
//! rows are kept exactly as they were — they are the cells that discriminated
//! between the several rules the doubling could have followed, so they are also
//! the cells a partial removal would leave doubling. Every expected count is
//! re-derived from the oracle (`submodules/svelte/.../src/compiler/index.js`,
//! `generate: 'client'`, `dev: false`) at 5.57.1: all 33 are 1, where 19 of them
//! were 2 at 5.57.0.
//!
//! The rows that used to double, and are therefore the live ones here: a `{`
//! opening an object or mapped type (through intersections, unions, nesting,
//! generics, an `as` clause, an index signature, a parenthesised type and an
//! array of a literal), and the `(` of a function type's parameter list including
//! an empty one. The rest were already 1 and stay as negative controls — a fix
//! that stopped doubling by disabling comment re-emission altogether would drive
//! them to 0.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn marker_count(decl: &str, marker: &str) -> usize {
    let src =
        format!("<script lang=\"ts\">\n{decl}\nlet p: P = $props();\n</script>\n<p>{{p}}</p>\n");
    compile(
        &src,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
    .matches(marker)
    .count()
}

#[test]
fn no_type_head_repeats_its_comment() {
    let cells: [(&str, &str, usize); 33] = [
        (
            "type alias, first member",
            "type P = {\n/** MARK */\nm0?: string;\nm1?: string };",
            1,
        ),
        (
            "type alias, second member",
            "type P = {\nm0?: string;\n/** MARK */\nm1?: string };",
            1,
        ),
        (
            "intersection member literal",
            "type Q = { z?: string };\ntype P = Q & {\n/** MARK */\nm0?: string };",
            1,
        ),
        (
            "union member literal",
            "type Q = { z?: string };\ntype P = Q | {\n/** MARK */\nm0?: string };",
            1,
        ),
        (
            "interface, first member",
            "interface P {\n/** MARK */\nm0?: string;\nm1?: string }",
            1,
        ),
        (
            "interface extends, first member",
            "interface Q { z?: string }\ninterface P extends Q {\n/** MARK */\nm0?: string }",
            1,
        ),
        (
            "nested literal, inner first",
            "type P = { outer?: {\n/** MARK */\ninner?: string } };",
            1,
        ),
        (
            "second member after a fn type",
            "type P = {\nf?: () => void;\n/** MARK */\nm1?: string };",
            1,
        ),
        (
            "first member is a fn type",
            "type P = {\n/** MARK */\nf?: () => void;\nm1?: string };",
            1,
        ),
        (
            "generic type alias",
            "type P<T> = {\n/** MARK */\nm0?: T };",
            1,
        ),
        (
            "two comments before the first",
            "type P = {\n/** A */\n/** MARK */\nm0?: string;\nm1?: string };",
            1,
        ),
        (
            "comment on the brace line",
            "type P = { /** MARK */\nm0?: string;\nm1?: string };",
            1,
        ),
        (
            "comment before the brace",
            "type P =\n/** MARK */\n{ m0?: string };",
            1,
        ),
        (
            "empty literal",
            "type P = {\n/** MARK */\n};\ntype R = { m0?: string };",
            1,
        ),
        (
            "line comment, first member",
            "type P = {\n// MARK\nm0?: string;\nm1?: string };",
            1,
        ),
        (
            "block comment, first member",
            "type P = {\n/* MARK */\nm0?: string;\nm1?: string };",
            1,
        ),
        (
            "trailing the first member",
            "type P = {\nm0?: string; /** MARK */\nm1?: string };",
            1,
        ),
        (
            "mapped type head",
            "type P = {\n/** MARK */\n[k in 'a' | 'b']?: string };",
            1,
        ),
        (
            "mapped type after the key",
            "type P = {\n[k in 'a' | 'b']?:\n/** MARK */\nstring };",
            1,
        ),
        (
            "mapped type with an as clause",
            "type P = {\n/** MARK */\n[k in 'a' as `x${k}`]?: string };",
            1,
        ),
        (
            "fn type parameter list",
            "type F = (\n/** MARK */\na: string) => void;\ntype P = { z?: string };",
            1,
        ),
        (
            "fn type, empty parameter list",
            "type F = (\n/** MARK */\n) => void;\ntype P = { z?: string };",
            1,
        ),
        (
            "fn type, second parameter",
            "type F = (a: string,\n/** MARK */\nb: string) => void;\ntype P = { z?: string };",
            1,
        ),
        (
            "fn type inside an interface",
            "interface P { m: (\n/** MARK */\na: string) => void }",
            1,
        ),
        (
            "constructor type parameter list",
            "type F = new (\n/** MARK */\na: string) => object;\ntype P = { z?: string };",
            1,
        ),
        (
            "method signature parameter list",
            "type P = { m(\n/** MARK */\na: string): void; z?: string };",
            1,
        ),
        (
            "tuple element",
            "type T = [\n/** MARK */\nstring];\ntype P = { z?: string };",
            1,
        ),
        (
            "type argument list",
            "type Q<T> = T;\ntype T = Q<\n/** MARK */\nstring>;\ntype P = { z?: string };",
            1,
        ),
        (
            "conditional type",
            "type T = string extends\n/** MARK */\nstring ? 1 : 2;\ntype P = { z?: string };",
            1,
        ),
        (
            "index signature in a literal",
            "type P = {\n/** MARK */\n[k: string]: string };",
            1,
        ),
        (
            "index signature in an interface",
            "interface P {\n/** MARK */\n[k: string]: string }",
            1,
        ),
        (
            "parenthesised type",
            "type T = (\n/** MARK */\nstring);\ntype P = { z?: string };",
            1,
        ),
        (
            "array of literal",
            "type T = {\n/** MARK */\na?: string }[];\ntype P = { z?: string };",
            1,
        ),
    ];

    let mut wrong = Vec::new();
    for (name, decl, want) in cells {
        let got = marker_count(decl, "MARK");
        if got != want {
            wrong.push(format!("{name}: want {want}, got {got}"));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}

/// Two speculative type heads in one script, the shape that used to double both.
/// Asserting both markers keeps a partial removal — one that stops doubling only
/// the script's first re-emitted comment — from passing.
#[test]
fn neither_literal_in_a_script_repeats_its_comment() {
    let decl = "type A = {\n/** OTHER */\na?: string };\ntype P = {\n/** MARK */\nm0?: string };";
    assert_eq!(
        marker_count(decl, "OTHER"),
        1,
        "the first literal's comment"
    );
    assert_eq!(
        marker_count(decl, "MARK"),
        1,
        "the second literal's comment"
    );
}
