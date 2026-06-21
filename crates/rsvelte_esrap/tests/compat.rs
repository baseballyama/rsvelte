//! Port of esrap's `test/compat.test.js`: plain JS, a TS type annotation, and a
//! TS `declare module` + mapped type all print as expected.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::print;

fn print_src(source: &str, ts: bool) -> String {
    let alloc = Allocator::default();
    let st = SourceType::default().with_module(true).with_typescript(ts);
    let ret = Parser::new(&alloc, source, st).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse error: {:?}",
        ret.diagnostics
    );
    print(&ret.program, source)
}

#[test]
fn plain_js() {
    assert_eq!(print_src("const x = 1;", false), "const x = 1;");
}

#[test]
fn ts_type_annotation() {
    assert_eq!(
        print_src("const x: number = 1;", true),
        "const x: number = 1;"
    );
}

/// A `// line` comment positioned before a destructured property must force the
/// object pattern multiline and sit on its own line — mirroring esrap's `_`
/// wildcard, which flushes leading comments before every node. Without this the
/// comment swallows the following token (`tabindex = // for safari 0,`), making
/// the output unparseable. Oracle (esrap 2.2.11) verified byte-for-byte.
#[test]
fn object_pattern_leading_line_comment_forces_multiline() {
    let input =
        "let {\n\tchildren,\n\tid = 1,\n\t// for safari\n\ttabindex = 0,\n\t...rest\n} = $$props;";
    assert_eq!(print_src(input, false), input);
}

#[test]
fn ts_module_and_mapped_type() {
    let input = "declare module \"svelte\" {\n}\n\ntype M = { [K in keyof JSON]: K }\n";
    assert_eq!(
        print_src(input, true),
        "declare module \"svelte\" {\n}\n\ntype M = {[K in keyof JSON]: K};"
    );
}
