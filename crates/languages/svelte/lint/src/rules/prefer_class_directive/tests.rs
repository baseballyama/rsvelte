use super::super::testing::lint;

const RULE: &str = "svelte/prefer-class-directive";

// Upstream writes a second `class:x`, which Svelte rejects as a duplicate attribute.
#[test]
fn a_class_with_a_directive_is_reported_without_a_fix() {
    let source = "<script>let a, b;</script><div class={a ? \"\" : \"x\"} class:x={b}></div>";
    let (reports, fixed) = lint(RULE, "[]", source);
    assert_eq!(reports.len(), 1);
    assert_eq!(fixed, source);
}
