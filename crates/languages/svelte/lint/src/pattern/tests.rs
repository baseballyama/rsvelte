use super::Pattern;

#[test]
fn a_plain_string_matches_only_itself() {
    let pattern = Pattern::new("class").expect("valid");
    assert!(pattern.matches("class"));
    assert!(!pattern.matches("class:a"));
    assert!(Pattern::new("/a/1").expect("valid").matches("/a/1"));
}

#[test]
fn a_slashed_string_is_a_regular_expression() {
    let pattern = Pattern::new("/^class:/u").expect("valid");
    assert!(pattern.matches("class:a"));
    assert!(!pattern.matches("a class:"));
    assert!(Pattern::new("/A/i").expect("valid").matches("a"));
    assert!(Pattern::new("/a/b/").expect("valid").matches("xa/b"));
    let sticky = Pattern::new("/b/y").expect("valid");
    assert!(sticky.matches("ba") && !sticky.matches("ab"));
}

#[test]
fn without_u_a_pattern_sees_utf16_code_units() {
    let one = Pattern::new("/^.$/").expect("valid");
    assert!(one.matches("\u{FB01}") && !one.matches("\u{1F600}"));
    assert!(Pattern::new("/^..$/").expect("valid").matches("\u{1F600}"));
    assert!(Pattern::new("/^.$/u").expect("valid").matches("\u{1F600}"));
    let braces = Pattern::new("/^\\u{2}$|[bc]/").expect("valid");
    assert!(braces.matches("uu") && braces.matches("c") && !braces.matches("\u{2}"));
    let unicode = Pattern::new("/^\\u{2}$/u").expect("valid");
    assert!(unicode.matches("\u{2}") && !unicode.matches("uu"));
    assert!(Pattern::new("/^\\\\u{2}$/").expect("valid").matches("\\uu"));
}

#[test]
fn invalid_flags_or_patterns_are_errors() {
    for flags in ["/a/x", "/a/ii", "/a/uv"] {
        assert!(
            Pattern::new(flags).unwrap_err().contains("flags"),
            "{flags}"
        );
    }
    assert!(Pattern::new("/(/u").unwrap_err().contains("expression"));
}
