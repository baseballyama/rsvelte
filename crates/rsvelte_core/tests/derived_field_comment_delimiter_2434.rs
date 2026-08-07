//! Regression tests for #2434 cause 2 — a delimiter inside a comment ended a
//! multi-line `$derived` class field early.
//!
//! The server class transform locates the end of a rune's argument with
//! `find_matching_paren_server`, which counted brackets over a bare
//! `char_indices()`. A `)` or `}` inside a comment closed the count early, so
//! the extracted value stopped short and the closing `))` was lost —
//! `missing ) after argument list`. The #2253 class.
//!
//! It now counts over `js_scan::code_bytes`, so comments and string, template
//! and regex literals are all opaque. Fixing the shared function rather than a
//! caller covers all six call sites.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn compile_server(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            generate: GenerateMode::Server,
            filename: Some("m.svelte.js".to_string()),
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

/// The shape from the issue: a multi-line `$derived` field whose value is an
/// arrow returning an object literal, so the field ends on `}))`.
fn module_with(comment: &str) -> String {
    format!(
        "class S {{\n\
         \topts;\n\
         \tconstructor(opts) {{ this.opts = opts; }}\n\
         \t#props = $derived(() => ({{\n\
         \t{comment}\n\
         \t\tid: this.opts.id,\n\
         \t\trole: \"meter\"\n\
         \t}}));\n\
         \tget props() {{ return this.#props(); }}\n\
         }}\n\
         export function make(o) {{ return new S(o); }}\n"
    )
}

/// Controls — a comment with no bracket in it never reproduced, so these pass
/// before the fix and pin that the accumulation is otherwise unchanged.
#[test]
fn comment_without_a_delimiter_is_unaffected() {
    for c in ["// c", "/* c */", "// ; c"] {
        let code = compile_server(&module_with(c));
        assert_parses(&code, &format!("control {c:?}"));
    }
}

/// The repros: the same comment carrying a closing delimiter.
#[test]
fn line_comment_carrying_a_close_paren() {
    let code = compile_server(&module_with("// ) c"));
    assert_parses(&code, "// ) c");
}

#[test]
fn line_comment_carrying_a_close_brace() {
    let code = compile_server(&module_with("// } c"));
    assert_parses(&code, "// } c");
}

#[test]
fn block_comment_carrying_a_close_paren() {
    let code = compile_server(&module_with("/* ) c */"));
    assert_parses(&code, "/* ) c */");
}

/// An *opening* delimiter does not reproduce, and is kept as a control rather
/// than as a repro: it inflates the count so the brackets never balance, the
/// accumulator never completes, and the field falls through to another path
/// that emits valid output. Only a closing delimiter ends the field early.
#[test]
fn line_comment_carrying_an_open_paren() {
    let code = compile_server(&module_with("// ( c"));
    assert_parses(&code, "// ( c");
}

/// A string literal is opaque for the same reason a comment is.
#[test]
fn string_literal_containing_a_close_paren() {
    let src = "class S {\n\tv;\n\t#props = $derived(() => ({\n\t\tid: \")\",\n\t\trole: \"meter\"\n\t}));\n\tget props() { return this.#props(); }\n}\nexport function make(o) { return new S(o); }\n";
    let code = compile_server(src);
    assert_parses(&code, "string containing a close paren");
}

/// A block comment spanning lines: the count is taken over the whole
/// accumulated field, so the delimiter stays invisible across the line break.
#[test]
fn block_comment_spanning_lines_carrying_a_delimiter() {
    let src = "class S {\n\tv;\n\t#props = $derived(() => ({\n\t\t/* a\n\t\t ) still comment\n\t\t */\n\t\trole: \"meter\"\n\t}));\n\tget props() { return this.#props(); }\n}\nexport function make(o) { return new S(o); }\n";
    let code = compile_server(src);
    assert_parses(&code, "block comment spanning lines");
}

/// Every comment kind at every line boundary inside the field — the sweep the
/// issue's triage ran, kept as a single assertion so a new delimiter kind that
/// regresses is caught without adding a test per shape.
///
/// It asserts the field was **transformed** as well as that the output parses.
/// The two are independent: if the accumulator ends the field early, the value
/// extraction finds no closing paren, the field is dropped entirely, and the
/// module still parses — a silent miscompile the parse oracle cannot see.
#[test]
fn every_comment_kind_at_every_slot_parses_and_transforms() {
    let base = module_with("// placeholder");
    let lines: Vec<&str> = base
        .lines()
        .filter(|l| !l.contains("placeholder"))
        .collect();

    let mut unparseable = Vec::new();
    let mut dropped = Vec::new();
    for kind in [
        "// c",
        "/* c */",
        "// ; c",
        "// ) c",
        "// } c",
        "/* ) c */",
        // Enough closing delimiters to zero a naive running bracket count.
        "// ) ) )",
        "/* ) ) ) */",
    ] {
        for slot in 1..lines.len() {
            let mut m: Vec<String> = lines.iter().map(|s| s.to_string()).collect();
            m.insert(slot, format!("\t{kind}"));
            let code = compile_server(&m.join("\n"));
            let allocator = oxc_allocator::Allocator::default();
            let ret =
                oxc_parser::Parser::new(&allocator, &code, oxc_span::SourceType::mjs()).parse();
            if !ret.diagnostics.is_empty() {
                unparseable.push(format!("{kind:?}@{slot}"));
            }
            if !code.contains("$.derived(") {
                dropped.push(format!("{kind:?}@{slot}"));
            }
        }
    }
    assert!(
        unparseable.is_empty(),
        "{} mutant(s) emit unparseable JS: {unparseable:?}",
        unparseable.len()
    );
    assert!(
        dropped.is_empty(),
        "{} mutant(s) silently lost the derived field: {dropped:?}",
        dropped.len()
    );
}
