use super::{Unparsed, same_tree};

#[test]
fn layout_comments_and_literal_spelling_are_ignored() {
    let expected = "import 'a';\nexport default function f() {\n\tg(\"x\", 0x10);\n}";
    let actual = "import 'a';\n\nexport default function f() {\n  // note\n  g('x', 16);\n}\n";
    assert_eq!(same_tree(expected, actual), Ok(true));
}

#[test]
fn meaning_is_compared() {
    assert_eq!(same_tree("f(a, b);", "f(b, a);"), Ok(false));
    assert_eq!(same_tree("`a\\n`;", "`a\n`;"), Ok(false));
}

#[test]
fn pure_marks_are_compared() {
    assert_eq!(same_tree("/* @__PURE__ */ f();", "f();"), Ok(false));
    assert_eq!(
        same_tree("/* @__PURE__ */ f();", "/*#__PURE__*/f();"),
        Ok(true)
    );
}

#[test]
fn parentheses_are_not_nodes() {
    assert_eq!(same_tree("(a + b) * c;", "((a + b)) * c;"), Ok(true));
    assert_eq!(
        same_tree("(function () {})();", "(function () {}());"),
        Ok(true)
    );
    assert_eq!(same_tree("f((() => 1));", "f(() => 1);"), Ok(true));
}

#[test]
fn marks_on_functions_are_ignored() {
    assert_eq!(
        same_tree(
            "/* @__NO_SIDE_EFFECTS__ */ function f() {}",
            "function f() {}"
        ),
        Ok(true)
    );
}

#[test]
fn a_side_that_does_not_parse_is_named() {
    assert!(matches!(
        same_tree("f(", "f();"),
        Err(Unparsed::Expected(_))
    ));
    assert!(matches!(same_tree("f();", "f("), Err(Unparsed::Actual(_))));
}
