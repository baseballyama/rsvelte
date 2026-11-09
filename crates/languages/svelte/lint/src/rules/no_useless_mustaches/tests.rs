use super::super::testing::lint;

const RULE: &str = "svelte/no-useless-mustaches";
const MESSAGE: &str = "Unexpected mustache interpolation with a string literal value.";

/// The fixed code, after checking that every mustache of `source_text` is reported.
fn fixed(options: &str, source_text: &str) -> String {
    let (reports, fixed) = lint(RULE, options, source_text);
    assert_eq!(
        reports.len(),
        source_text.matches("{'").count(),
        "{source_text}: {reports:?}"
    );
    assert!(reports.iter().all(|r| r.ends_with(MESSAGE)), "{reports:?}");
    fixed
}

// Upstream fixes these to markup that the compiler decodes to another string (checked with
// `svelte/compiler`'s `parse`): `&amp;` is `&`, and `\0` is not `0`.
#[test]
fn a_fix_that_would_decode_differently_is_withheld() {
    for source_text in [
        "<p>{'&amp;'}</p>",
        "<p title={'&amp;'}></p>",
        "<p title=\"x{'&lt;'}\"></p>",
        "<p>{'\\0'}</p>",
        "<p>&am{'p;'}</p>",
    ] {
        assert_eq!(fixed("[]", source_text), source_text);
    }
}

#[test]
fn a_reference_split_between_mustaches_keeps_its_first_half() {
    assert_eq!(fixed("[]", "<p>{'&am'}{'p;'}</p>"), "<p>{'&am'}p;</p>");
}

#[test]
fn an_ampersand_that_starts_no_reference_is_fixed() {
    assert_eq!(fixed("[]", "<p>{'a & b'}</p>"), "<p>a & b</p>");
    assert_eq!(
        fixed("[]", "<p title={'a & b'}></p>"),
        "<p title=\"a & b\"></p>"
    );
}

#[test]
fn a_digit_escape_is_a_string_escape() {
    let (reports, _) = lint(RULE, r#"[{"ignoreStringEscape": true}]"#, "<p>{'\\0'}</p>");
    assert_eq!(reports, Vec::<String>::new());
}
