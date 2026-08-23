//! Regression test for the multi-declarator fit measure
//! (baseballyama/rsvelte#3216).
//!
//! esrap's `handle_var_declaration` breaks the declarators one per line when
//! `child_context.measure() + 2 * (n - 1) > 50`, and `measure` counts every
//! literal string written while rendering them — the ` ` esrap emits between a
//! call's arguments included (`context.write(' ')`). This port materialises that
//! separator as a retro-patchable layout span, which `measure()` subtracts, so
//! the declaration measured one byte short per inner separator and stayed on one
//! line at exactly the boundary.
//!
//! Expected outputs below were taken from the official Svelte compiler
//! (`let { a = 1 } = $state()` lowers to the 51-column declaration below).

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::print;

fn print_src(src: &str) -> String {
    let alloc = Allocator::default();
    let ret = Parser::new(&alloc, src, SourceType::default().with_module(true)).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse error: {:?}",
        ret.diagnostics
    );
    print(&ret.program, src)
}

/// `let ` + `tmp = void 0` + `a = $.proxy($.fallback(tmp.a, 1))` is 49 columns,
/// plus 2 for the `, ` join = 51 > 50, so it breaks. The one space inside
/// `$.fallback(tmp.a, 1)` is what takes it over the line.
#[test]
fn a_declaration_one_column_over_the_limit_breaks() {
    let src = "let tmp = void 0, a = $.proxy($.fallback(tmp.a, 1));";
    assert_eq!(
        print_src(src),
        "let tmp = void 0,\n\ta = $.proxy($.fallback(tmp.a, 1));"
    );
}

/// One column under the limit (50) stays on one line — the boundary has to move
/// in only one direction.
#[test]
fn a_declaration_at_the_limit_stays_on_one_line() {
    let src = "let tmp = void 0, a = $.proxy($.fallback(tmp.a, 1));";
    let shorter = src.replace("$.fallback", "$.fallbac");
    assert_eq!(
        print_src(&shorter),
        "let tmp = void 0, a = $.proxy($.fallbac(tmp.a, 1));"
    );
}

/// A declaration with no inner separator space is unaffected by the change.
#[test]
fn a_declaration_without_inner_separators_is_unchanged() {
    let src = "const aaaaaaaaaaaaaaaa = 111111111, bbbbbbbbbbbbbbbb = 222222222;";
    assert_eq!(
        print_src(src),
        "const aaaaaaaaaaaaaaaa = 111111111,\n\tbbbbbbbbbbbbbbbb = 222222222;"
    );
}
