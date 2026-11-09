use super::super::testing::lint;

const RULE: &str = "svelte/no-unused-class-name";

// Upstream reports `Unused class ""` for the space after the expression.
#[test]
fn a_space_beside_an_expression_names_no_class() {
    for value in ["{b} ", " {b}"] {
        let source = format!("<script>let b;</script><div class=\"{value}\"></div>");
        assert_eq!(lint(RULE, "[]", &source).0, Vec::<String>::new(), "{value}");
    }
}
