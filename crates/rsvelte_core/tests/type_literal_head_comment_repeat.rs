//! A comment consumed while acorn-typescript parses a type SPECULATIVELY is
//! printed twice: `tsLookAhead` leaves `isLookahead` unset, so the comment fires
//! `onComment` during the lookahead and again after the rewind. The doubled
//! region runs from the opener to the token that settles the ambiguity — a `{`
//! that could open an object or a mapped type, and a `(` that could open a
//! function type's parameters or a parenthesised type.
//!
//! rsvelte repeated "the first comment re-emitted anywhere in the script"
//! instead. That is a different rule which agrees on the commonest shape and
//! diverges in three directions: it repeated an `interface` member's comment,
//! it repeated a later member's comment, and it did NOT repeat the first-member
//! comment of a second type literal in the same script.
//!
//! Every expected count is generated from the oracle
//! (`submodules/svelte/.../src/compiler/index.js`, `generate: 'client'`,
//! `dev: false`), never inferred from the rule.
//!
//! The rows that discriminate, and what each one kills:
//!
//! - `interface, first member` kills "any named object type doubles".
//! - `comment before the brace` kills "any comment in the erased declaration
//!   doubles" — it is outside the braces.
//! - `intersection` / `union` / `nested` / `generic` / `array of literal` kill
//!   "only a type alias whose annotation is directly a literal doubles".
//! - `trailing the first member` and `second member after a fn type` kill "the
//!   first comment inside the braces doubles": the position is measured against
//!   the first MEMBER, not against the first comment.
//! - `constructor type parameter list` and `method signature parameter list`
//!   kill "any `(` doubles". Both are `(` at the head of a parameter list and
//!   neither doubles, because `new` and the method name have already settled
//!   what follows — which is what says the rule is about SPECULATION and not
//!   about the bracket.
//! - `mapped type head` is the cell a `TSTypeLiteral`-only rule fails, and it
//!   is not hypothetical: `appwrite-console`'s `settings/migrations/details.svelte`
//!   carries it and a `TSTypeLiteral`-only fix regressed that file.
//! - `tuple element`, `type argument list` and `conditional type` are the
//!   negative controls for openers that are not speculation sites.
//!
//! `empty literal` and `fn type, empty parameter list` are why each region ends
//! at the closer when there is no first member or parameter.
//!
//! The function-type rows have no corpus carrier, for two separate reasons: no
//! `.svelte` component holds the shape, and the one `.svelte.ts` that does
//! (`runed`'s `resource.svelte.ts`) is esbuild-stripped by the gate's own
//! preparation — which erases the TYPE, so there is no speculation site left,
//! not merely no comment (esbuild keeps a comment inside an object literal or a
//! class body).

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
fn only_a_speculatively_parsed_type_head_repeats_its_comment() {
    let cells: [(&str, &str, usize); 33] = [
        (
            "type alias, first member",
            "type P = {\n/** MARK */\nm0?: string;\nm1?: string };",
            2,
        ),
        (
            "type alias, second member",
            "type P = {\nm0?: string;\n/** MARK */\nm1?: string };",
            1,
        ),
        (
            "intersection member literal",
            "type Q = { z?: string };\ntype P = Q & {\n/** MARK */\nm0?: string };",
            2,
        ),
        (
            "union member literal",
            "type Q = { z?: string };\ntype P = Q | {\n/** MARK */\nm0?: string };",
            2,
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
            2,
        ),
        (
            "second member after a fn type",
            "type P = {\nf?: () => void;\n/** MARK */\nm1?: string };",
            1,
        ),
        (
            "first member is a fn type",
            "type P = {\n/** MARK */\nf?: () => void;\nm1?: string };",
            2,
        ),
        (
            "generic type alias",
            "type P<T> = {\n/** MARK */\nm0?: T };",
            2,
        ),
        (
            "two comments before the first",
            "type P = {\n/** A */\n/** MARK */\nm0?: string;\nm1?: string };",
            2,
        ),
        (
            "comment on the brace line",
            "type P = { /** MARK */\nm0?: string;\nm1?: string };",
            2,
        ),
        (
            "comment before the brace",
            "type P =\n/** MARK */\n{ m0?: string };",
            1,
        ),
        (
            "empty literal",
            "type P = {\n/** MARK */\n};\ntype R = { m0?: string };",
            2,
        ),
        (
            "line comment, first member",
            "type P = {\n// MARK\nm0?: string;\nm1?: string };",
            2,
        ),
        (
            "block comment, first member",
            "type P = {\n/* MARK */\nm0?: string;\nm1?: string };",
            2,
        ),
        (
            "trailing the first member",
            "type P = {\nm0?: string; /** MARK */\nm1?: string };",
            1,
        ),
        (
            "mapped type head",
            "type P = {\n/** MARK */\n[k in 'a' | 'b']?: string };",
            2,
        ),
        (
            "mapped type after the key",
            "type P = {\n[k in 'a' | 'b']?:\n/** MARK */\nstring };",
            1,
        ),
        (
            "mapped type with an as clause",
            "type P = {\n/** MARK */\n[k in 'a' as `x${k}`]?: string };",
            2,
        ),
        (
            "fn type parameter list",
            "type F = (\n/** MARK */\na: string) => void;\ntype P = { z?: string };",
            2,
        ),
        (
            "fn type, empty parameter list",
            "type F = (\n/** MARK */\n) => void;\ntype P = { z?: string };",
            2,
        ),
        (
            "fn type, second parameter",
            "type F = (a: string,\n/** MARK */\nb: string) => void;\ntype P = { z?: string };",
            1,
        ),
        (
            "fn type inside an interface",
            "interface P { m: (\n/** MARK */\na: string) => void }",
            2,
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
            2,
        ),
        (
            "index signature in an interface",
            "interface P {\n/** MARK */\n[k: string]: string }",
            1,
        ),
        (
            "parenthesised type",
            "type T = (\n/** MARK */\nstring);\ntype P = { z?: string };",
            2,
        ),
        (
            "array of literal",
            "type T = {\n/** MARK */\na?: string }[];\ntype P = { z?: string };",
            2,
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

/// The direction rsvelte emitted too FEW in: upstream repeats the head comment
/// of EVERY speculative type, and rsvelte repeated only the script's first
/// re-emitted comment. Both markers are asserted, because a fix that repeats
/// every re-emitted comment would satisfy the second one alone.
#[test]
fn every_speculative_type_head_repeats_not_only_the_scripts_first() {
    let decl = "type A = {\n/** OTHER */\na?: string };\ntype P = {\n/** MARK */\nm0?: string };";
    assert_eq!(
        marker_count(decl, "OTHER"),
        2,
        "the first literal's comment"
    );
    assert_eq!(
        marker_count(decl, "MARK"),
        2,
        "the second literal's comment"
    );
}
