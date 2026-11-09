use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_syntax::parser::parse_program;
use rsvelte_typescript_syntax::syntax_tree::SyntaxTree;

use super::refuse_strict_errors;

fn refused(source_text: &str) -> bool {
    let mut tree = SyntaxTree::default();
    let range = Span::new(0, u32::try_from(source_text.len()).expect("short"));
    parse_program(&mut tree, source_text, range, false).expect("parses");
    refuse_strict_errors(&tree, source_text).is_err()
}

/// Each is rejected by acorn and Babel as module code (measured with the oracle).
#[test]
fn what_strict_mode_rejects_is_refused() {
    for source_text in [
        "\"\\8\";",
        "'\\01';",
        "`\\1`;",
        "\"\\x0\";",
        "\"\\u{110000}\";",
        "1__0;",
        "1_;",
        "0x_1;",
        "07;",
        "static;",
        "let x = implements;",
        "a?.b = 1;",
        "++a?.b;",
        "++\"s\";",
        "(1)++;",
        "new a?.b();",
        "[a, ...b,] = c;",
        "(a, a) => a;",
        "(a = 1) => { \"use strict\"; };",
        "delete x;",
        "-x ** 2;",
        "({ __proto__: 1, \"__proto__\": 2 });",
        "/(?<a>x)(?<a>y)/;",
        "/\\p{Foo}/u;",
    ] {
        assert!(refused(source_text), "{source_text:?}");
    }
}

#[test]
fn what_strict_mode_accepts_is_kept() {
    for source_text in [
        "\"\\0\";",
        "\"\\x41\\u0041\\u{10FFFF}\";",
        "1_000.5_5e10;",
        "0xA_b;",
        "a.static;",
        "({ static: 1 });",
        "a?.b;",
        "++a.b; a[0]--;",
        "(-x) ** 2;",
        "f((-x) ** 2);",
        "[a, ...b] = c;",
        "(a, b) => a;",
        "(a) => { \"use strict\"; };",
        "delete a.b;",
        "({ __proto__: 1, __proto__ });",
        "/(?<a>x)/;",
        "/\\p{L}/;",
    ] {
        assert!(!refused(source_text), "{source_text:?}");
    }
}
