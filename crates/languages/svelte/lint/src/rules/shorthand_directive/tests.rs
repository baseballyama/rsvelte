use super::super::testing::lint;

// Upstream writes `style:color={color}|important`: the compiler then reads the value as the text
// `{color}|important` and the directive loses its modifier.
#[test]
fn the_value_goes_after_the_modifiers() {
    let (reports, fixed) = lint(
        "svelte/shorthand-directive",
        r#"[{"prefer": "never"}]"#,
        "<script>let color = 1;</script><div style:color|important></div>",
    );
    assert_eq!(reports, ["1:37 Expected regular directive syntax."]);
    assert_eq!(
        fixed,
        "<script>let color = 1;</script><div style:color|important={color}></div>"
    );
}
