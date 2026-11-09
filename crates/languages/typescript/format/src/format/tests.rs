use super::expressions::print_number;
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
        ("1_0.5_0", "1_0.5_0"),
        ("1.0_0", "1.0_0"),
        ("0.0_0", "0.0_0"),
        ("1.5_0e1", "1.5_0e1"),
        ("1_0e0", "1_0e0"),
        ("1.500e+0010", "1.5e10"),
        ("1e-0", "1"),
        ("1.e5", "1e5"),
        ("-.5", "-0.5"),
        ("1.00", "1.0"),
        ("5", "5"),
        ("1e0_0", "1e0_0"),
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
