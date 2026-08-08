//! A `;` inside a comment terminated the import statement the client script
//! pipeline hoists, so the specifier list was cut in half.
//!
//! `extract_imports` accumulates a multi-line `import` until a line "closes" it,
//! and both the close test and `import_statement_end` read raw bytes. A
//! `// ; c` line inside the specifier list closed the import after the previous
//! specifier, terminated it with the comment's own `;`, and routed the rest of
//! the statement — starting mid-comment — into the component body. The output
//! stops being JavaScript.
//!
//! Found by the corpus mutation sweep (#2601) on
//! `flowbite-svelte/…/Navbar__m0__line-with-semi.svelte`, whose mutant puts the
//! comment inside a 20-specifier import.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_with(src: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[track_caller]
fn assert_parses(code: &str, what: &str) {
    assert!(!code.contains("COMPILE_ERROR"), "{what}: {code}");
    let allocator = oxc_allocator::Allocator::default();
    let ret = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "{what}: emitted JS does not parse: {:?}\n--- output ---\n{code}",
        ret.diagnostics
    );
}

/// Every target compiles the instance script through `extract_imports`, so the
/// defect is target-independent — asserting one would leave two live.
#[track_caller]
fn assert_all_targets_parse(src: &str, what: &str) {
    for (generate, dev, label) in [
        (GenerateMode::Client, false, "client"),
        (GenerateMode::Server, false, "server"),
        (GenerateMode::Client, true, "client-dev"),
    ] {
        assert_parses(
            &compile_with(src, generate, dev),
            &format!("{what} ({label})"),
        );
    }
}

const IMPORTED: &str = "<p>{n}{A}{B}</p>";

/// The reported shape: a line comment carrying `;` inside the specifier list.
#[test]
fn a_semicolon_in_a_line_comment_does_not_end_the_import() {
    let src = format!(
        "<script>\n  import {{\n    A,\n    // ; c\n    B\n  }} from \"somewhere\";\n  let n = 1;\n</script>\n\n{IMPORTED}"
    );
    let out = compile_with(&src, GenerateMode::Client, false);
    assert_parses(&out, "line comment with a semicolon");
    assert!(
        out.contains("import { A, B } from \"somewhere\"")
            || out.contains("B\n} from \"somewhere\""),
        "the specifier list lost `B`: {out}"
    );
    assert_all_targets_parse(&src, "line comment with a semicolon");
}

/// A block comment on its own line inside the list. `ScanState` already carried
/// the open-comment state across lines for the *starts an import* decision; the
/// terminator search did not consult it.
#[test]
fn a_semicolon_in_a_block_comment_does_not_end_the_import() {
    let src = format!(
        "<script>\n  import {{\n    A,\n    /* ; */\n    B\n  }} from \"somewhere\";\n  let n = 1;\n</script>\n\n{IMPORTED}"
    );
    assert_all_targets_parse(&src, "block comment with a semicolon");
}

/// A block comment that opens on one line and closes on the next, carrying the
/// `;` on the continuation line — the only case a per-line scan cannot get right
/// without the carried state.
#[test]
fn a_semicolon_in_a_multi_line_block_comment_does_not_end_the_import() {
    let src = format!(
        "<script>\n  import {{\n    A,\n    /* open\n       ; still comment */\n    B\n  }} from \"somewhere\";\n  let n = 1;\n</script>\n\n{IMPORTED}"
    );
    assert_all_targets_parse(&src, "multi-line block comment with a semicolon");
}

/// Control that already passed: a `;` inside the module specifier string. Kept
/// because it is the property the old byte scan *did* have, and a rewrite that
/// lost it would otherwise go unnoticed.
#[test]
fn a_semicolon_inside_the_specifier_string_still_does_not_end_the_import() {
    let src = "<script>\n  import A from \"a;b\";\n  let n = 1;\n</script>\n\n<p>{n}{A}</p>";
    let out = compile_with(src, GenerateMode::Client, false);
    assert_parses(&out, "semicolon inside the specifier");
    assert!(
        out.contains("\"a;b\""),
        "the specifier was truncated: {out}"
    );
}

/// Control: a comment with no delimiter in it. This one passes without the fix,
/// which is what makes the set above discriminating rather than merely green.
#[test]
fn a_plain_comment_in_the_specifier_list_is_unaffected() {
    let src = format!(
        "<script>\n  import {{\n    A,\n    // c\n    B\n  }} from \"somewhere\";\n  let n = 1;\n</script>\n\n{IMPORTED}"
    );
    assert_all_targets_parse(&src, "plain comment");
}

/// Negative control: an import that really does end with `;` followed by code on
/// the same physical line must still be split there. Making the scanner ignore
/// comments must not make it ignore the terminator it is looking for.
#[test]
fn a_real_semicolon_still_splits_the_line() {
    let src = "<script>\n  import {\n    A\n  } from \"somewhere\"; let n = 1;\n</script>\n\n<p>{n}{A}</p>";
    let out = compile_with(src, GenerateMode::Client, false);
    assert_parses(&out, "real semicolon splits");
    assert!(
        out.contains("let n = 1") || out.contains("n = 1"),
        "the statement after the import was swallowed into the import: {out}"
    );
}
