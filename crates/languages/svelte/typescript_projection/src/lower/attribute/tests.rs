use super::is_number;

#[test]
fn a_number_is_what_javascript_s_is_nan_accepts() {
    for text in [
        "0",
        "-1",
        " 2 ",
        "+3",
        ".5",
        "5.",
        "1e3",
        "1E-3",
        "0x1F",
        "0o7",
        "0b10",
        "-Infinity",
    ] {
        assert!(is_number(text), "{text}");
    }
    for text in [
        "", "  ", "a", "1px", "-0x1", "1_000", ".", "e3", "1e", "0x", "infinity",
    ] {
        assert!(!is_number(text), "{text}");
    }
}
