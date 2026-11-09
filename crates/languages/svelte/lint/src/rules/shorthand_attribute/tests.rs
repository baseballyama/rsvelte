use super::super::testing::lint;

const RULE: &str = "svelte/shorthand-attribute";

// Upstream fixes these to `{(a)}` and `{/*x*/a}`, which `svelte/compiler` rejects
// (`attribute_empty_shorthand`); the report stays.
#[test]
fn a_shorthand_that_would_not_compile_is_not_written() {
    for source_text in [
        "<script>let a;</script><div a={(a)}></div>",
        "<script>let a;</script><div a={/*x*/a}></div>",
    ] {
        let (reports, fixed) = lint(RULE, "[]", source_text);
        assert_eq!(
            reports,
            ["1:29 Expected shorthand attribute."],
            "{source_text}"
        );
        assert_eq!(fixed, source_text);
    }
}

#[test]
fn spaces_inside_the_braces_still_compile() {
    let (_, fixed) = lint(RULE, "[]", "<script>let a;</script><div a={ a }></div>");
    assert_eq!(fixed, "<script>let a;</script><div { a }></div>");
}
