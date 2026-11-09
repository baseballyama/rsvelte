use rsvelte_kernel::source::positions::Span;

use super::{StaticValues, Value};
use crate::parser::parse_program;
use crate::scope::analyze;
use crate::syntax_tree::{Kind, SyntaxTree};

/// The value of the last statement of `source_text`, an expression, with scopes resolved.
fn value(source_text: &str) -> Option<Value> {
    let mut tree = SyntaxTree::new();
    let program = parse_program(
        &mut tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        true,
    )
    .expect("the test input parses");
    let semantic = analyze(&tree, program, &[]);
    let Kind::Program(statements) = tree.kind(program) else {
        unreachable!("a program")
    };
    let Some(Kind::ExpressionStatement(expression)) = statements.last().map(|&s| tree.kind(s))
    else {
        panic!("the last statement is an expression")
    };
    StaticValues::new(&tree, source_text, Some(&semantic)).value(expression)
}

#[expect(
    clippy::unnecessary_wraps,
    reason = "compared with what `value` returns"
)]
fn string(s: &str) -> Option<Value> {
    Some(Value::String(s.into()))
}

fn is_nan(source_text: &str) -> bool {
    matches!(value(source_text), Some(Value::Number(n)) if n.is_nan())
}

#[expect(
    clippy::unnecessary_wraps,
    reason = "compared with what `value` returns"
)]
const fn boolean(b: bool) -> Option<Value> {
    Some(Value::Boolean(b))
}

#[test]
fn browser_global_guards_compare_with_known_constants() {
    // `globalThis.window` is not known, so only the constant side has a value.
    assert_eq!(value("const U = undefined; U"), Some(Value::Undefined));
    assert_eq!(value("const UN = 'undefined'; UN"), string("undefined"));
    assert_eq!(value("'undef' + 'ined'"), string("undefined"));
    assert_eq!(value("const U = undefined; globalThis.window !== U"), None);
    assert_eq!(value("typeof window"), None);
}

#[test]
fn variables_hold_their_initializer_while_nothing_writes_them() {
    assert_eq!(value("let t = 'checkbox'; t"), string("checkbox"));
    assert_eq!(value("var t = 'checkbox'; t"), string("checkbox"));
    assert_eq!(value("let t = 'checkbox'; t = 'radio'; t"), None);
    assert_eq!(value("let t = 'checkbox'; t += 'x'; t"), None);
    assert_eq!(value("let t; t"), None);
    assert_eq!(value("const a = b, b = a; a"), None, "a cycle has no value");
    assert_eq!(
        value("const { h } = { h: 1 }; h"),
        None,
        "upstream does not destructure"
    );
    assert_eq!(value("function f() {} f"), None);
}

#[test]
fn type_syntax_is_transparent() {
    assert_eq!(value("const t = 'radio' as const; t"), string("radio"));
    assert_eq!(value("('a' satisfies string) + <string>'b'"), string("ab"));
    assert_eq!(value("const t: string = 'x'; t!"), string("x"));
}

#[test]
fn objects_and_arrays_are_read_through_members_unless_mutated() {
    assert_eq!(
        value("const o = { type: 'radio' }; o.type"),
        string("radio")
    );
    assert_eq!(
        value("const o = { a: { b: 2 } }; o['a'].b"),
        Some(Value::Number(2.0))
    );
    assert_eq!(
        value("const o = { type: 'radio' }; o.type = 'x'; o.type"),
        None
    );
    assert_eq!(value("const a = ['x']; a.push('y'); a[0]"), None);
    assert_eq!(
        value("const a = ['x', 'y']; a.length"),
        Some(Value::Number(2.0))
    );
    assert_eq!(
        value("const a = [1, ...[2, 3]]; a.join('-')"),
        string("1-2-3")
    );
    assert_eq!(value("({ ...{ a: 1 }, a: 2 }).a"), Some(Value::Number(2.0)));
    assert_eq!(value("({ a: 1 }).missing"), Some(Value::Undefined));
    assert_eq!(
        value("({ a: 1 }).toString"),
        None,
        "inherited members are functions"
    );
    assert_eq!(value("({ get a() { return 1 } }).a"), None);
    assert_eq!(value("({ __proto__: { a: 1 } }).a"), None);
    assert_eq!(
        value("const o = {}; o === o"),
        None,
        "identity is not tracked"
    );
}

#[test]
fn strings_have_their_methods_and_utf16_lengths() {
    assert_eq!(value("'CheckBox'.toLowerCase()"), string("checkbox"));
    assert_eq!(value("' radio\\u00a0'.trim()"), string("radio"));
    assert_eq!(value("'abc'.slice(-2)"), string("bc"));
    assert_eq!(value("'abc'.substring(2, 0)"), string("ab"));
    assert_eq!(value("'abc'.at(-1)"), string("c"));
    assert_eq!(value("'abc'.indexOf('c')"), Some(Value::Number(2.0)));
    assert_eq!(value("'abcabc'.lastIndexOf('b')"), Some(Value::Number(4.0)));
    assert_eq!(value("'5'.padStart(3, '0')"), string("005"));
    assert_eq!(value("'😀'.length"), Some(Value::Number(2.0)));
    assert_eq!(
        value("'😀'[0]"),
        None,
        "a lone surrogate is not a Rust string"
    );
    assert_eq!(value("'abc'.replace('a', 'b')"), None, "not modeled");
    assert_eq!(value("String(12) + Number('0x10')"), string("1216"));
}

#[test]
fn operators_follow_javascript_conversions() {
    assert_eq!(value("1 + '1'"), string("11"));
    assert_eq!(value("'3' * '4'"), Some(Value::Number(12.0)));
    assert_eq!(value("[1, 2] + ''"), string("1,2"));
    assert_eq!(value("null == undefined"), boolean(true));
    assert_eq!(value("null == 0"), boolean(false));
    assert_eq!(value("'1' == 1"), boolean(true));
    assert_eq!(value("NaN <= NaN"), boolean(false));
    assert_eq!(value("'a' < 'b'"), boolean(true));
    assert_eq!(value("-1 >>> 28"), Some(Value::Number(15.0)));
    assert_eq!(value("1 << 33"), Some(Value::Number(2.0)));
    assert!(is_nan("1 ** NaN"));
    assert_eq!(value("typeof 'x'"), string("string"));
    assert_eq!(value("typeof String"), string("function"));
    assert_eq!(value("void x"), Some(Value::Undefined));
    assert_eq!(value("' 12 ' - 0"), Some(Value::Number(12.0)));
    assert!(
        is_nan("'inf' - 0"),
        "Rust's float grammar is not JavaScript's"
    );
    assert_eq!(value("'a' in x"), None);
}

#[test]
fn conditionals_and_logic_pick_the_branch_the_test_selects() {
    assert_eq!(value("const t = true ? 'radio' : x; t"), string("radio"));
    assert_eq!(value("false ? x : `a${1 + 1}b`"), string("a2b"));
    assert_eq!(value("0 || 'b'"), string("b"));
    assert_eq!(value("'a' || x"), string("a"));
    assert_eq!(value("null ?? 'd'"), string("d"));
    assert_eq!(value("x ? 'a' : 'b'"), None);
    assert_eq!(value("(1, 2)"), Some(Value::Number(2.0)));
}

#[test]
fn optional_chains_short_circuit_on_nullish() {
    assert_eq!(value("const o = null; o?.a.b"), Some(Value::Undefined));
    assert_eq!(value("const o = null; o?.a()"), Some(Value::Undefined));
    assert_eq!(
        value("const o = null; o.a"),
        None,
        "reading a member of null throws"
    );
}

#[test]
fn shadowed_globals_are_variables() {
    assert_eq!(value("undefined"), Some(Value::Undefined));
    assert_eq!(value("let undefined = 1; undefined = 2; undefined"), None);
    assert_eq!(
        value("Math.max(1, 3, 2) + Math.PI * 0"),
        Some(Value::Number(3.0))
    );
    assert_eq!(
        value("const Math = { PI: 3 }; Math.PI"),
        Some(Value::Number(3.0))
    );
}
