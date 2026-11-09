use super::super::testing::lint;

const RULE: &str = "svelte/prefer-style-directive";

// From ESLint with eslint-plugin-svelte 3.23.1 on the same input.
#[test]
fn a_conditional_writes_the_value_postcss_cleans() {
    let source = "<script>let c;</script><div style=\"{c ? 'color: a /* c */ b' : ''}\"></div>";
    let (_, fixed) = lint(RULE, "[]", source);
    assert_eq!(
        fixed,
        "<script>let c;</script><div style:color={c ? 'a  b' : null}></div>"
    );
}

// Upstream slices the source by the cleaned value's length and writes `style:color="a /*"`.
#[test]
fn a_declaration_writes_the_whole_cleaned_value() {
    let (_, fixed) = lint(RULE, "[]", "<div style=\"color: a /* c */ b;\"></div>");
    assert_eq!(fixed, "<div style:color=\"a  b\"></div>");
}
