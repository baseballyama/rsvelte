//! An `export` that is not the first token on its line (#4418).
//!
//! The client instance-script pipeline decides where a statement begins by
//! reading LINES, so `let x = 1; export let p = 1;` reaches the legacy prop
//! lowering as one unit; that lowering asks whether the unit *starts* with
//! `export`, answers no, and copies the line into the component function
//! verbatim — where `export` is not JavaScript. Upstream reprints the body
//! through esrap and gives every statement its own line, so the fix inserts the
//! newline the loop expects rather than teaching the scan a new shape.
//!
//! Two properties are asserted separately, because they fail separately:
//! the output has to be JavaScript at all (`SemanticBuilder`, not just the
//! parser — `export` below the top level is an EARLY error and OXC's parser
//! accepts it), and the prop has to be lowered. A fix that split the line but
//! left the lowering alone passes the first and fails the second.
//!
//! Every expectation is read out of `svelte.compile({ generate: 'client' })`
//! at `VERSION === '5.57.0'`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `(name, script body, the `$.prop` lines official emits, in order)`.
#[rustfmt::skip]
const CELLS: &[(&str, &str, &[&str])] = &[
    ("bare",            "export let p = 1;",                            &["let p = $.prop($$props, 'p', 8, 1);"]),
    ("after_let",       "let x = 1; export let p = 1;",                 &["let p = $.prop($$props, 'p', 8, 1);"]),
    ("own_line",        "let x = 1;\nexport let p = 1;",                &["let p = $.prop($$props, 'p', 8, 1);"]),
    ("two_exports",     "export let a = 1; export let p = 2;",          &["let a = $.prop($$props, 'a', 8, 1);", "let p = $.prop($$props, 'p', 8, 2);"]),
    ("export_first",    "export let p = 1; let x = 1;",                 &["let p = $.prop($$props, 'p', 8, 1);"]),
    ("after_empty",     "; export let p = 1;",                          &["let p = $.prop($$props, 'p', 8, 1);"]),
    ("leading_space",   "   export let p = 1;",                         &["let p = $.prop($$props, 'p', 8, 1);"]),
    ("after_string",    "let s = 'export let q = 1;'; export let p = 1;", &["let p = $.prop($$props, 'p', 8, 1);"]),
    ("after_block",     "if (1) {} export let p = 1;",                  &["let p = $.prop($$props, 'p', 8, 1);"]),
    ("no_initializer",  "let a = 1; export let p;",                     &["let p = $.prop($$props, 'p', 8);"]),
    ("renamed",         "let a = 1; export { a as p };",                &["let a = $.prop($$props, 'p', 8, 1);"]),
    ("const_after",     "let a = 1; export const p = 1;",               &["let a = 1;", "const p = 1;", "$.bind_prop($$props, 'p', p);"]),
    ("const_first",     "export const p = 1; let a = 1;",               &["const p = 1;", "let a = 1;", "$.bind_prop($$props, 'p', p);"]),
    ("fn_after",        "let a = 1; export function p() {}",            &["let a = 1;", "function p() {}", "$.bind_prop($$props, 'p', p);"]),
    ("fn_first",        "export function p() {} let a = 1;",            &["function p() {}", "let a = 1;", "$.bind_prop($$props, 'p', p);"]),
];

/// The negative control: an `export let` that exists only inside a string
/// literal declares no prop, so the component takes no `$$props` at all. It is
/// the cell that separates "the line is split by the AST" from "the line is
/// split by a byte scan for the word".
const ONLY_IN_A_STRING: &str = "let s = 'export let q = 1;';";

fn client(body: &str) -> String {
    compile(
        &format!("<script>{body}</script><span>{{p}}</span>"),
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

/// `export` below the top level is a JavaScript **early** error, which OXC
/// settles in `SemanticBuilder` rather than in the parser — so a parser-only
/// oracle here would pass on exactly the output this issue is about.
fn rejects(code: &str) -> Option<String> {
    let allocator = oxc_allocator::Allocator::default();
    let parsed = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    if let Some(first) = parsed.diagnostics.first() {
        return Some(first.to_string());
    }
    let built = oxc_semantic::SemanticBuilder::new_compiler().build(&parsed.program);
    built.diagnostics.first().map(|error| error.to_string())
}

#[test]
fn every_host_emits_javascript() {
    for (name, body, _) in CELLS {
        let code = client(body);
        assert!(
            rejects(&code).is_none(),
            "{name}: `{body}` emitted output no JS parser accepts: {}\n{code}",
            rejects(&code).unwrap_or_default()
        );
    }
    assert!(rejects(&client(ONLY_IN_A_STRING)).is_none());
}

#[test]
fn every_host_lowers_the_prop() {
    for (name, body, expected) in CELLS {
        let code = client(body);
        for line in *expected {
            assert!(
                code.contains(line),
                "{name}: `{body}` did not emit `{line}`\n{code}"
            );
        }
    }
}

#[test]
fn an_export_inside_a_string_declares_no_prop() {
    let code = client(ONLY_IN_A_STRING);
    assert!(
        !code.contains("$.prop("),
        "no prop is declared here\n{code}"
    );
    assert!(
        code.contains("let s = 'export let q = 1;';"),
        "the string is passed through\n{code}"
    );
}

/// The rejection oracle has to be able to fail, or the test above is a
/// tautology — and the shape it must reject is the exact one this issue
/// produced, not a generic syntax error.
#[test]
fn the_rejection_oracle_sees_an_export_in_statement_position() {
    assert!(rejects("export default function X() {\n\texport let p = 1;\n}").is_some());
    assert!(rejects("export default function X() {\n\tlet p = 1;\n}").is_none());
}
