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

// Upstream writes `style:font-family=""Arial""`.
#[test]
fn a_value_with_a_double_quote_is_reported_without_a_fix() {
    let source = "<div style='font-family: \"Arial\"'></div>";
    let (reports, fixed) = lint(RULE, "[]", source);
    assert_eq!(reports.len(), 1);
    assert_eq!(fixed, source);
}

// Upstream drops `!important`.
#[test]
fn a_conditional_keeps_important() {
    let source = "<script>let c;</script><div style={c ? \"color: red !important\" : \"\"}></div>";
    let (_, fixed) = lint(RULE, "[]", source);
    assert_eq!(
        fixed,
        "<script>let c;</script><div style:color|important={c ? \"red\" : null}></div>"
    );
}

// Upstream moves `color: red` to a directive, which then wins over `color: blue`.
#[test]
fn a_property_set_twice_is_reported_without_a_fix() {
    let source = "<div style=\"color: red; Color: blue\"></div>";
    let (reports, fixed) = lint(RULE, "[]", source);
    assert_eq!(reports.len(), 2);
    assert_eq!(fixed, source);
    let source =
        "<script>let c;</script><div style=\"{c ? 'color: red' : ''}; color: blue\"></div>";
    let (reports, fixed) = lint(RULE, "[]", source);
    assert_eq!(reports.len(), 2);
    assert_eq!(fixed, source);
}
