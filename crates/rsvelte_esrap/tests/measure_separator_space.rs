//! `measure` counts a separator space.
//!
//! esrap's `measure` sums the *string* commands and skips the sentinels
//! (`margin`/`newline`/`indent`/`dedent`/`space`), but the only place it emits
//! the non-string `space` command is the `else` of an `IfStatement`. Every
//! separator — between call arguments, array elements, object properties — is
//! `context.write(' ')`, a string, and so counts towards the fit test.
//!
//! This port defers a separator space as a layout byte so it can still be
//! retracted into a newline, which put it on the wrong side of that split: each
//! one was subtracted from `measure`, and a declaration list whose true length
//! is 51 measured 50 and stayed on one line.
//!
//! Every expectation below is esrap 2.2.12's own output for the same source.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::{PrintOptions, print, print_with_map};

fn both_printers(source: &str) -> String {
    let alloc = Allocator::default();
    let ret = Parser::new(&alloc, source, SourceType::default().with_module(true)).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse error for {source:?}: {:?}",
        ret.diagnostics
    );
    let direct = print(&ret.program, source);
    let deferred = print_with_map(&ret.program, source, &PrintOptions::default()).code;
    assert_eq!(direct, deferred, "direct/deferred mismatch for {source:?}");
    direct
}

/// `handle_var_declaration` breaks when `measure() + 2 * (n - 1) > 50`. Both
/// pairs below differ by exactly one character, and in each the shorter one
/// measures 50 and the longer 51 — which is only true when the space after the
/// argument comma is counted.
#[test]
fn one_argument_separator_decides_a_declaration_list() {
    assert_eq!(
        both_printers("let tmp = void 0, a = z.proxy(z.fallback(tmp.a, 1));"),
        "let tmp = void 0,\n\ta = z.proxy(z.fallback(tmp.a, 1));"
    );
    assert_eq!(
        both_printers("let tmp = void 0, a = z.proxy(z.fallbac(tmp.a, 1));"),
        "let tmp = void 0, a = z.proxy(z.fallbac(tmp.a, 1));"
    );
}

#[test]
fn three_argument_separators_decide_a_declaration_list() {
    assert_eq!(
        both_printers("let aaa = fn(p, q), bbb = fn(r, s), ccc = fn(t, uv);"),
        "let aaa = fn(p, q),\n\tbbb = fn(r, s),\n\tccc = fn(t, uv);"
    );
    assert_eq!(
        both_printers("let aaa = fn(p, q), bbb = fn(r, s), ccc = fn(t, u);"),
        "let aaa = fn(p, q), bbb = fn(r, s), ccc = fn(t, u);"
    );
}

/// The one place esrap really does emit its non-string `space` command. It is
/// not inside anything `measure` decides, so counting it changes no output —
/// recorded so the difference from upstream is deliberate rather than unnoticed.
#[test]
fn an_else_keeps_its_space() {
    assert_eq!(
        both_printers("if (a) b(); else c();"),
        "if (a) b(); else c();"
    );
}
