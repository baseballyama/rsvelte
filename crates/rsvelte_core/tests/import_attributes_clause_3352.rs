//! The client script pipeline decided where an `import` ends by scanning one
//! line, so an import-attributes clause that did not sit on that line was cut
//! off the statement (#3352).
//!
//! `with { … }` carries no `[no LineTerminator here]` restriction, so the clause
//! may begin on any later line and may itself span lines. The line scanner read
//! the module specifier at end-of-line as the statement's ASI end, hoisted the
//! import without its clause, and routed `with { type: "json" };` into the
//! component body — where it is not a statement any JavaScript parser accepts.
//! The same-line, semicolon-terminated spelling was the one layout that worked,
//! which is why the corpus never saw it.

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

/// Every target hoists the instance script's imports through `extract_imports`,
/// so asserting one target would leave the others live.
#[track_caller]
fn assert_every_target_keeps_the_clause(src: &str, what: &str) {
    for (generate, dev, label) in [
        (GenerateMode::Client, false, "client"),
        (GenerateMode::Server, false, "server"),
        (GenerateMode::Client, true, "client-dev"),
    ] {
        let out = compile_with(src, generate, dev);
        let what = format!("{what} ({label})");
        assert_parses(&out, &what);
        assert!(
            out.contains("import d from \"./d.json\" with { type: \"json\" };"),
            "{what}: the import lost its attributes clause:\n{out}"
        );
        assert!(
            !out.lines()
                .any(|line| line.trim_start().starts_with("with ")
                    || line.trim_start().starts_with("with{")),
            "{what}: the clause was left behind as a statement:\n{out}"
        );
    }
}

const TEMPLATE: &str = "</script>\n\n<p>{z}</p>";

/// The reported shape: the clause starts on the line after the specifier.
#[test]
fn a_clause_on_the_next_line_stays_with_the_import() {
    let src = format!(
        "<script>\n\timport d from \"./d.json\"\n\t\twith {{ type: \"json\" }};\n\tlet z = d;\n{TEMPLATE}"
    );
    assert_every_target_keeps_the_clause(&src, "clause on the next line");
}

/// Semicolon-free source. ASI does not end the statement before a `with`, so the
/// clause's `}` is the terminator — the scanner had no notion of one.
#[test]
fn a_clause_on_the_next_line_without_a_semicolon_stays_with_the_import() {
    let src = format!(
        "<script>\n\timport d from \"./d.json\"\n\t\twith {{ type: \"json\" }}\n\tlet z = d\n{TEMPLATE}"
    );
    assert_every_target_keeps_the_clause(&src, "clause on the next line, no semicolon");
}

/// Same line, but semicolon-free: the line no longer ends at the specifier, so
/// the old scan called the import *incomplete* and swallowed the next statement.
#[test]
fn a_same_line_clause_without_a_semicolon_ends_the_import() {
    let src = format!(
        "<script>\n\timport d from \"./d.json\" with {{ type: \"json\" }}\n\tlet z = d\n{TEMPLATE}"
    );
    assert_every_target_keeps_the_clause(&src, "same-line clause, no semicolon");
}

/// The clause itself spans lines. Its inner `"json"` ends a line, which the ASI
/// rule read as a module specifier — brace depth is what separates the two.
#[test]
fn a_clause_spanning_lines_stays_with_the_import() {
    let src = format!(
        "<script>\n\timport d from \"./d.json\" with {{\n\t\ttype: \"json\"\n\t}};\n\tlet z = d;\n{TEMPLATE}"
    );
    assert_every_target_keeps_the_clause(&src, "clause spanning lines");
}

/// Both at once: the clause starts on a later line *and* spans lines.
#[test]
fn a_clause_that_starts_late_and_spans_lines_stays_with_the_import() {
    let src = format!(
        "<script>\n\timport d from \"./d.json\"\n\t\twith {{\n\t\t\ttype: \"json\"\n\t\t}};\n\tlet z = d;\n{TEMPLATE}"
    );
    assert_every_target_keeps_the_clause(&src, "late, multi-line clause");
}

/// The keyword and its `{` on separate lines. Nothing on the `with` line can
/// end the statement, and nothing on the `{ … }` line names the clause, so the
/// two facts have to be carried from the line that read the specifier.
#[test]
fn a_clause_split_between_its_keyword_and_its_brace_stays_with_the_import() {
    let src = format!(
        "<script>\n\timport d from \"./d.json\"\n\t\twith\n\t\t{{ type: \"json\" }};\n\tlet z = d;\n{TEMPLATE}"
    );
    assert_every_target_keeps_the_clause(&src, "keyword and brace on separate lines");
}

/// The same split, semicolon-free — so the clause's `}` is the only terminator
/// and the line carrying it is the one that has to recognise the clause.
#[test]
fn a_split_clause_without_a_semicolon_stays_with_the_import() {
    let src = format!(
        "<script>\n\timport d from \"./d.json\"\n\t\twith\n\t\t{{ type: \"json\" }}\n\tlet z = d\n{TEMPLATE}"
    );
    assert_every_target_keeps_the_clause(&src, "split clause, no semicolon");
}

/// A multi-line specifier list closes on the `} from "…"` line, which is the
/// same ASI end — so the clause has to survive that path too.
#[test]
fn a_clause_after_a_multi_line_specifier_list_stays_with_the_import() {
    let src = format!(
        "<script>\n\timport {{\n\t\tdefault as d\n\t}} from \"./d.json\"\n\t\twith {{ type: \"json\" }};\n\tlet z = d;\n{TEMPLATE}"
    );
    for (generate, dev, label) in [
        (GenerateMode::Client, false, "client"),
        (GenerateMode::Server, false, "server"),
        (GenerateMode::Client, true, "client-dev"),
    ] {
        let out = compile_with(&src, generate, dev);
        assert_parses(&out, &format!("clause after a specifier list ({label})"));
        assert!(
            out.contains("from \"./d.json\" with { type: \"json\" };"),
            "clause after a specifier list ({label}): clause lost:\n{out}"
        );
    }
}

/// A side-effect import — no `from`, so a different printer arm.
///
/// Official esrap returns before writing the clause. That changes whether the
/// emitted module can load, so rsvelte deliberately keeps the attribute rather
/// than reproducing the runtime defect (#3635).
#[test]
fn a_clause_after_a_side_effect_import_stays_with_the_import() {
    let src = format!(
        "<script>\n\timport \"./d.json\"\n\t\twith {{ type: \"json\" }};\n\tlet z = 1;\n{TEMPLATE}"
    );
    for (generate, dev, label) in [
        (GenerateMode::Client, false, "client"),
        (GenerateMode::Server, false, "server"),
        (GenerateMode::Client, true, "client-dev"),
    ] {
        let out = compile_with(&src, generate, dev);
        assert_parses(&out, &format!("side-effect import ({label})"));
        assert!(
            out.contains("import \"./d.json\" with { type: \"json\" };"),
            "side-effect import ({label}): clause lost or moved:\n{out}"
        );
    }
}

/// Control — the one layout that already worked. An over-broad fix that changes
/// how a complete single-line import is hoisted breaks this first.
#[test]
fn a_same_line_clause_with_a_semicolon_is_unchanged() {
    let src = format!(
        "<script>\n\timport d from \"./d.json\" with {{ type: \"json\" }};\n\tlet z = d;\n{TEMPLATE}"
    );
    assert_every_target_keeps_the_clause(&src, "same-line clause with a semicolon");
}

/// Control — a semicolon-free import followed by an ordinary statement must
/// still be split there. Treating "the statement might continue" as "it does"
/// swallows the next line.
#[test]
fn a_semicolon_free_import_still_ends_before_the_next_statement() {
    let src = "<script>\n\timport d from \"./d.json\"\n\tlet z = d\n</script>\n\n<p>{z}</p>";
    let out = compile_with(src, GenerateMode::Client, false);
    assert_parses(&out, "semicolon-free import");
    assert!(
        out.contains("import d from \"./d.json\";"),
        "the import moved: {out}"
    );
    assert!(
        out.contains("let z = d"),
        "the following statement was swallowed into the import: {out}"
    );
}

/// Control — `assert` is a plain identifier, and a call to one on the line after
/// a semicolon-free import is not an import-attributes clause. (The deprecated
/// `assert { … }` clause spelling is rejected by both compilers while parsing,
/// so no source carrying it reaches this pass.)
#[test]
fn a_call_on_the_line_after_an_import_is_not_a_clause() {
    let src = "<script>\n\timport { assert } from \"./a.js\"\n\tassert(1)\n\tlet z = 1\n</script>\n\n<p>{z}</p>";
    let out = compile_with(src, GenerateMode::Client, false);
    assert_parses(&out, "assert call after an import");
    assert!(
        out.contains("import { assert } from \"./a.js\";"),
        "the import moved: {out}"
    );
    assert!(
        out.contains("assert(1)"),
        "the call was swallowed into the import: {out}"
    );
}

/// Control — the clause keyword inside a string literal is text. The lookahead
/// reads the next *code* token, not the next bytes.
#[test]
fn the_word_with_inside_a_string_is_not_a_clause() {
    let src = "<script>\n\timport d from \"./d.json\"\n\tconst s = \"with { type: 'json' }\"\n\tlet z = s\n</script>\n\n<p>{z}</p>";
    let out = compile_with(src, GenerateMode::Client, false);
    assert_parses(&out, "the word with inside a string");
    assert!(
        out.contains("import d from \"./d.json\";"),
        "the import moved: {out}"
    );
    assert!(
        out.contains("with { type: 'json' }"),
        "the string was swallowed into the import: {out}"
    );
}
