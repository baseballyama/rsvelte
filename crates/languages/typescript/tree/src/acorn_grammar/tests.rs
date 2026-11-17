use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;

use crate::{Acorn, Tree};

/// Where acorn stops in `text`, a module read as acorn reads it: at a syntax error the part
/// reports, or where the tree shows syntax acorn rejects.
fn acorn_stops_at(text: &str, source_type: SourceType) -> Option<(String, u32)> {
    let mut failed = None;
    let built = Tree::build(text, |builder| {
        builder.read_as_acorn();
        let range = Span::new(0, text.len() as u32);
        builder
            .program(range, source_type)
            .map(drop)
            .map_err(|error| {
                failed = Some(error.acorn.clone());
                error.into()
            })
    });
    let Ok((tree, ())) = built else {
        return match failed {
            Some(Some(Acorn::Fails { message, at })) => Some((message.into_owned(), at)),
            other => panic!("{text:?}: acorn says nothing ({other:?})"),
        };
    };
    tree.acorn_rejection().map(|error| match error.acorn {
        Some(Acorn::Fails { message, at }) => (message.into_owned(), at),
        other => panic!("{text:?}: acorn fails, not {other:?}"),
    })
}

#[test]
fn a_function_declared_as_a_statement_body_stops_acorn_in_module_code() {
    for (text, at) in [
        ("if (true) function g() {}", 10),
        ("if (true) {} else function g() {}", 18),
        ("lbl: function g() {}", 5),
        ("a: b: function g() {}", 6),
        ("while (0) function g() {}", 10),
        ("do function g() {} while (0)", 3),
        ("for (;;) function g() {}", 9),
        ("for (x of y) function g() {}", 13),
        ("function f() { if (true) function g() {} }", 25),
        // oxc's parser rejects these itself, at the same place.
        ("if (true) async function g() {}", 10),
        ("if (true) function* g() {}", 10),
    ] {
        for source_type in [SourceType::mjs(), SourceType::ts()] {
            assert_eq!(
                acorn_stops_at(text, source_type),
                Some(("Unexpected token".to_owned(), at)),
                "{text:?}"
            );
        }
    }
}

#[test]
fn a_function_declared_in_a_block_is_read() {
    for text in ["if (true) { function g() {} }", "lbl: { function g() {} }"] {
        assert_eq!(acorn_stops_at(text, SourceType::mjs()), None, "{text:?}");
    }
}

#[test]
fn each_rejection_stops_acorn_where_upstream_does() {
    let javascript = SourceType::mjs();
    let typescript = SourceType::ts();
    let unexpected = "Unexpected token";
    for (text, source_type, message, at) in [
        ("using x = y;", javascript, unexpected, 6),
        (
            "async function f() { await using x = y; }",
            javascript,
            unexpected,
            33,
        ),
        ("import defer * as x from 'a';", javascript, unexpected, 13),
        ("import source x from 'a';", javascript, unexpected, 14),
        (
            "import a from 'a' assert { type: 'json' };",
            javascript,
            unexpected,
            18,
        ),
        ("@dec class C {}", javascript, "Unexpected character '@'", 0),
        ("class C { accessor x = 1; }", javascript, unexpected, 19),
        (
            "class C { override m() {} }",
            typescript,
            concat!(
                "This member cannot have an 'override' modifier because its containing class ",
                "does not extend another class."
            ),
            10,
        ),
        (
            "export declare global { }",
            typescript,
            "'export declare' must be followed by an ambient declaration.",
            15,
        ),
    ] {
        assert_eq!(
            acorn_stops_at(text, source_type),
            Some((message.to_owned(), at)),
            "{text:?}"
        );
    }
}
