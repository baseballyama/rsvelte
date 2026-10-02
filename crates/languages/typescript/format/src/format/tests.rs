use super::*;

#[test]
fn numbers_print_like_prettier() {
    for (raw, want) in [
        ("1", "1"),
        ("1.0", "1.0"),
        ("1.50", "1.5"),
        ("1.", "1"),
        (".5", "0.5"),
        ("1E+05", "1e5"),
        ("2e-007", "2e-7"),
        ("3e0", "3"),
        ("0XAB", "0xab"),
    ] {
        assert_eq!(print_number(raw), want, "{raw}");
    }
}

#[test]
fn strings_prefer_double_quotes_unless_that_needs_more_escapes() {
    assert_eq!(make_string("a", preferred_quote("a", false)), "\"a\"");
    let q = "say \"hi\"";
    assert_eq!(make_string(q, preferred_quote(q, false)), "'say \"hi\"'");
    assert_eq!(
        make_string("it\\'s", preferred_quote("it\\'s", false)),
        "\"it's\""
    );
    assert_eq!(make_string("\\d", '"'), "\"d\"");
}
