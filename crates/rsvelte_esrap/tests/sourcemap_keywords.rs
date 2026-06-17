//! Port of esrap's `test/sourcemap-keywords.test.js`.
//!
//! esrap brackets keyword writes (`let`/`function`/`async`/`export`/`if`/…) with
//! source-map `Location` anchors so a debugger's breakpoint lands on the keyword
//! token, not just identifiers and braces. This suite parses each snippet with
//! oxc, prints it via [`rsvelte_esrap::print_with_map`], and asserts that the
//! generated position of each keyword maps back to the keyword's source column —
//! the exact assertions the JS test makes.
//!
//! The JS test parses with `sourceType: 'module'`, `fileExtension: 'ts'`, so we
//! parse with `SourceType` module + TypeScript (the `declare let` snippet needs
//! TS).

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

use rsvelte_esrap::{PrintWithMap, print_with_map};

/// Generated `(line0, col0)` of `index` within `code` — a port of the JS test's
/// `generatedLineColumn`: line is the count of `\n` before `index`, column is the
/// distance from the last preceding `\n`.
fn generated_line_column(code: &str, index: usize) -> (usize, usize) {
    let before = &code[..index];
    let gen_line = before.matches('\n').count();
    let gen_col = before.len() - before.rfind('\n').map(|p| p + 1).unwrap_or(0);
    (gen_line, gen_col)
}

/// Port of the JS `mappingAtSubstring`: locate `needle` in the generated `code`,
/// find the segment on that generated line whose generated column equals the
/// needle's column, and return it. Asserts both the substring and the segment
/// exist.
fn mapping_at_substring(code: &str, needle: &str, mappings: &[Vec<[i64; 4]>]) -> [i64; 4] {
    let idx = code
        .find(needle)
        .unwrap_or_else(|| panic!("needle not in output: {needle:?}\n--- code ---\n{code}"));
    let (gen_line, gen_col) = generated_line_column(code, idx);
    let line = mappings
        .get(gen_line)
        .unwrap_or_else(|| panic!("no mapping line {gen_line} for needle {needle:?}"));
    *line
        .iter()
        .find(|s| s[0] == gen_col as i64)
        .unwrap_or_else(|| {
            panic!(
                "no segment at gen_col {gen_col} on line {gen_line} for needle {needle:?}: {line:?}"
            )
        })
}

struct Mapped {
    source: String,
    code: String,
    mappings: Vec<Vec<[i64; 4]>>,
}

/// Parse `source` as a TS module and print it with mappings — the JS `mapped`.
fn mapped(source: &str) -> Mapped {
    let allocator = Allocator::default();
    let source_type = SourceType::default()
        .with_module(true)
        .with_typescript(true);
    let ret = Parser::new(&allocator, source, source_type).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse errors for {source:?}: {:?}",
        ret.diagnostics
    );
    let PrintWithMap { code, mappings } = print_with_map(&ret.program, source);
    assert!(!mappings.is_empty(), "no mappings produced for {source:?}");
    Mapped {
        source: source.to_string(),
        code,
        mappings,
    }
}

/// `source.indexOf(needle)` as an `i64`, the expected 0-based source column for a
/// keyword on line 0.
fn src_col(source: &str, needle: &str) -> i64 {
    source.find(needle).expect("needle in source") as i64
}

#[test]
fn keywords_let_function_async_export() {
    {
        let m = mapped("let alpha = 1;");
        let seg = mapping_at_substring(&m.code, "let", &m.mappings);
        assert_eq!(seg[2], 0);
        assert_eq!(seg[3], src_col(&m.source, "let"));
    }

    {
        let m = mapped("async function bar() {}");
        let seg_async = mapping_at_substring(&m.code, "async", &m.mappings);
        assert_eq!(seg_async[2], 0);
        assert_eq!(seg_async[3], src_col(&m.source, "async"));

        let seg_fn = mapping_at_substring(&m.code, "function", &m.mappings);
        assert_eq!(seg_fn[2], 0);
        assert_eq!(seg_fn[3], src_col(&m.source, "function"));
    }

    {
        let m = mapped("export default function qux() {}");
        let seg_export = mapping_at_substring(&m.code, "export", &m.mappings);
        assert_eq!(seg_export[2], 0);
        assert_eq!(seg_export[3], src_col(&m.source, "export"));

        let seg_default = mapping_at_substring(&m.code, "default", &m.mappings);
        assert_eq!(seg_default[2], 0);
        assert_eq!(seg_default[3], src_col(&m.source, "default"));

        let seg_fn = mapping_at_substring(&m.code, "function", &m.mappings);
        assert_eq!(seg_fn[2], 0);
        assert_eq!(seg_fn[3], src_col(&m.source, "function"));
    }
}

#[test]
fn declare_let_maps_declare_and_let() {
    let m = mapped("declare let beta: number;");

    let seg_declare = mapping_at_substring(&m.code, "declare", &m.mappings);
    assert_eq!(seg_declare[2], 0);
    assert_eq!(seg_declare[3], src_col(&m.source, "declare"));

    let seg_let = mapping_at_substring(&m.code, "let", &m.mappings);
    assert_eq!(seg_let[2], 0);
    assert_eq!(seg_let[3], src_col(&m.source, "let"));
}

#[test]
fn class_static_and_get() {
    {
        let m = mapped("class C { static meth() {} }");
        let seg_static = mapping_at_substring(&m.code, "static", &m.mappings);
        assert_eq!(seg_static[3], src_col(&m.source, "static"));
    }

    {
        let m = mapped("class D { get x() { return 1; } }");
        let seg_get = mapping_at_substring(&m.code, "get", &m.mappings);
        assert_eq!(seg_get[3], src_col(&m.source, "get"));
    }
}

#[test]
fn throw_return_await() {
    {
        let m = mapped("function f() { throw new Error('x'); }");
        let seg = mapping_at_substring(&m.code, "throw", &m.mappings);
        assert_eq!(seg[3], src_col(&m.source, "throw"));
    }

    {
        let m = mapped("function f() { return 42; }");
        let seg = mapping_at_substring(&m.code, "return", &m.mappings);
        assert_eq!(seg[3], src_col(&m.source, "return"));
    }

    {
        let m = mapped("async function f() { await thing(); }");
        let seg = mapping_at_substring(&m.code, "await", &m.mappings);
        assert_eq!(seg[3], src_col(&m.source, "await"));
    }
}

#[test]
fn if_else() {
    let m = mapped("if (x) { a(); } else { b(); }");

    let seg_if = mapping_at_substring(&m.code, "if", &m.mappings);
    assert_eq!(seg_if[3], src_col(&m.source, "if"));

    let seg_else = mapping_at_substring(&m.code, "else", &m.mappings);
    assert_eq!(seg_else[3], src_col(&m.source, "else"));
}

#[test]
fn try_catch_finally() {
    let m = mapped("try { a(); } catch (e) { b(); } finally { c(); }");

    let seg_try = mapping_at_substring(&m.code, "try", &m.mappings);
    assert_eq!(seg_try[3], src_col(&m.source, "try"));

    let seg_catch = mapping_at_substring(&m.code, "catch", &m.mappings);
    assert_eq!(seg_catch[3], src_col(&m.source, "catch"));

    let seg_finally = mapping_at_substring(&m.code, "finally", &m.mappings);
    assert_eq!(seg_finally[3], src_col(&m.source, "finally"));
}

#[test]
fn do_while() {
    let m = mapped("do { a(); } while (cond);");

    let seg_do = mapping_at_substring(&m.code, "do", &m.mappings);
    assert_eq!(seg_do[3], src_col(&m.source, "do"));

    let seg_while = mapping_at_substring(&m.code, "while", &m.mappings);
    assert_eq!(seg_while[3], src_col(&m.source, "while"));
}

#[test]
fn switch_case_default() {
    let m = mapped("switch (x) { case 1: a(); break; default: b(); }");

    let seg_switch = mapping_at_substring(&m.code, "switch", &m.mappings);
    assert_eq!(seg_switch[3], src_col(&m.source, "switch"));

    let seg_case = mapping_at_substring(&m.code, "case", &m.mappings);
    assert_eq!(seg_case[3], src_col(&m.source, "case"));

    let seg_default = mapping_at_substring(&m.code, "default", &m.mappings);
    assert_eq!(seg_default[3], src_col(&m.source, "default"));
}

#[test]
fn decorator_prefixed_class_falls_back_gracefully() {
    let m = mapped("@dec\nclass D {}");
    assert!(m.code.contains("class"));
    assert!(!m.mappings.is_empty());
}
