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
fn invalid_flags_or_patterns_are_errors() {
    for flags in ["/a/x", "/a/ii", "/a/uv"] {
        assert!(
            Pattern::new(flags).unwrap_err().contains("flags"),
            "{flags}"
        );
    }
    assert!(Pattern::new("/(/u").unwrap_err().contains("expression"));
}
