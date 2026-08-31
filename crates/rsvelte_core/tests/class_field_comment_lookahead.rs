//! A comment line inside a class field's initializer must not be read as a
//! token by the server's conditional-initializer lookahead.
//!
//! `transform_class_fields_server` decides whether `id =` opens a multi-line
//! conditional by reading the next two non-empty lines and asking whether one
//! starts with `?`. A comment is not a token, so a comment between the `=` and
//! the `?` pushed the `?` out of that two-line window: the field was emitted as
//! a single line and the emitter appended a `;`, producing `id =;` and orphaning
//! both arms of the ternary. Output no JS parser accepts.
//!
//! The lookahead now reads a comment-blanked view of the class body
//! (`js_scan::blank_comments`), which is the same "code bytes only" rule as
//! `class_body::find_class_header` and `js_scan::find_code`.
//!
//! Client output matches official on every cell of this shape; the defect is
//! server-only. The class must also hold a rune field, which is what makes the
//! server run its class-field rewrite at all.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn compile(src: &str, generate: GenerateMode) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            generate,
            filename: Some("toc.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .expect("module should compile")
    .js
    .code
}

#[track_caller]
fn assert_parses(code: &str, what: &str) {
    let allocator = oxc_allocator::Allocator::default();
    let ret = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "{what}: emitted JS does not parse: {:?}\n--- output ---\n{code}",
        ret.diagnostics
    );
}

/// The seed shape, reduced from svelte-put `toc.svelte.js`.
fn source(comment: &str) -> String {
    format!(
        "export class T {{\n\tid =\n\t\t'crypto' in globalThis && crypto.randomUUID\n{comment}\t\t\t? crypto.randomUUID()\n\t\t\t: Math.random().toString(36).slice(2);\n\n\tactive = $state(undefined);\n}}\n"
    )
}

#[track_caller]
fn assert_field_survives(code: &str, what: &str) {
    assert_parses(code, what);
    assert!(
        !code.contains("id =;") && !code.contains("id = ;"),
        "{what}: the field was truncated at its `=`:\n{code}"
    );
    assert!(
        code.contains("crypto.randomUUID()") && code.contains("Math.random()"),
        "{what}: an arm of the conditional initializer is missing:\n{code}"
    );
}

#[test]
fn a_line_comment_before_the_question_mark_keeps_the_initializer() {
    let out = compile(&source("\t\t\t// ; c\n"), GenerateMode::Server);
    assert_field_survives(&out, "line comment");
}

#[test]
fn a_block_comment_before_the_question_mark_keeps_the_initializer() {
    let out = compile(&source("\t\t\t/* ; c */\n"), GenerateMode::Server);
    assert_field_survives(&out, "block comment");
}

#[test]
fn a_comment_with_no_delimiter_reaches_the_same_arm() {
    // Unlike the chain-collapse defect, the comment's contents are irrelevant:
    // it is counted as a line, not read.
    let out = compile(&source("\t\t\t// c\n"), GenerateMode::Server);
    assert_field_survives(&out, "plain comment");
}

#[test]
fn a_multi_line_block_comment_keeps_the_initializer() {
    let out = compile(
        &source("\t\t\t/*\n\t\t\t * c\n\t\t\t */\n"),
        GenerateMode::Server,
    );
    assert_field_survives(&out, "multi-line block comment");
}

#[test]
fn the_uncommented_field_is_unchanged() {
    // CONTROL: without the comment the `?` is already inside the window, so
    // this cell passes before the fix as well as after it.
    let out = compile(&source(""), GenerateMode::Server);
    assert_field_survives(&out, "no comment (control)");
}

#[test]
fn the_client_is_unaffected() {
    // CONTROL: the client matched official on every cell of this shape.
    for comment in ["", "\t\t\t// ; c\n", "\t\t\t/* ; c */\n"] {
        let out = compile(&source(comment), GenerateMode::Client);
        assert_field_survives(&out, "client");
    }
}

#[test]
fn the_rune_field_still_lowers() {
    // CONTROL: the fix must not disturb the rewrite the `$state` field triggers.
    let out = compile(&source("\t\t\t// ; c\n"), GenerateMode::Server);
    assert!(
        out.contains("active = undefined"),
        "the `$state` field did not lower:\n{out}"
    );
}
