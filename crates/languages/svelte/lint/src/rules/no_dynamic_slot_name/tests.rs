use super::super::testing::lint;

const MESSAGE: &str = "`<slot>` name cannot be dynamic.";

// Upstream writes `name="a"b"` and `name="xa"b"`, which end the value at the inner quote, and
// `name=xa by`, which the space splits into two attributes.
#[test]
fn a_name_that_the_markup_cannot_hold_as_written_is_not_fixed() {
    for source_text in [
        "<slot name={'a\"b'} />",
        "<slot name=\"x{'a\"b'}\" />",
        "<slot name=x{\"a b\"}y />",
    ] {
        let (reports, fixed) = lint("svelte/no-dynamic-slot-name", "[]", source_text);
        assert_eq!(reports.len(), 1, "{source_text}");
        assert!(reports[0].ends_with(MESSAGE), "{reports:?}");
        assert_eq!(fixed, source_text);
    }
}

#[test]
fn a_plain_name_is_fixed() {
    let (_, fixed) = lint("svelte/no-dynamic-slot-name", "[]", "<slot name={'ab'} />");
    assert_eq!(fixed, "<slot name=\"ab\" />");
}
