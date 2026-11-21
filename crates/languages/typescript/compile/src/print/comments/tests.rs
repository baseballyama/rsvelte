use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

use super::super::{Comments, print_with};

/// The printed text without whitespace, which is what the expected values, from esrap 2.4.0 over
/// acorn's comments, are compared in.
fn placed(source: &str) -> String {
    let allocator = Allocator::default();
    let program = Parser::new(&allocator, source, SourceType::mjs())
        .parse()
        .program;
    (print_with(&program, Comments::Placed).chars())
        .filter(|c| !c.is_whitespace())
        .collect()
}

#[test]
fn leading_trailing_and_closing_comments_land_where_esrap_writes_them() {
    assert_eq!(
        placed(concat!(
            "// a\nlet x = 1; // b\n/** c */\nfunction f(p /* d */, q) {\n",
            "\treturn g(p, // e\n\t\tq);\n} // f\n/* g */",
        )),
        "//aletx=1;//b/**c*/functionf(p,/*d*/q){returng(p,//eq);}//f/*g*/"
    );
}

#[test]
fn a_jsdoc_type_before_an_expression_keeps_its_parentheses() {
    assert_eq!(
        placed("let a = /** @type {number} */ (b);"),
        "leta=/**@type{number}*/(b);"
    );
}

#[test]
fn list_items_and_class_members_keep_their_comments() {
    assert_eq!(
        placed("const o = {\n\ta: 1, // x\n\tb: [1, /* y */ 2]\n};"),
        "consto={a:1,//xb:[1,/*y*/2]};"
    );
    assert_eq!(
        placed("class A {\n\t// m\n\tx = 1; // n\n\tf() {} // o\n}"),
        "classA{//mx=1;//nf(){}//o}"
    );
    assert_eq!(
        placed("f(a, b /* last */);\nlet [c, /* hole */ , d] = e;"),
        "f(a,b/*last*/);let[c,/*hole*/,d]=e;"
    );
}
