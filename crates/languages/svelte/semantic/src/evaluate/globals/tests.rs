use super::{f16round, text};

/// `String(n)`, with negative zero told apart.
fn shown(n: f64) -> String {
    if n == 0.0 && n.is_sign_negative() {
        "-0".to_owned()
    } else {
        rsvelte_typescript_semantic::number::number(n)
    }
}

// Each expected value is what Node 26 prints.
#[test]
fn parse_int_reads_as_javascript_does() {
    for (text, radix, expected) in [
        ("  -0x1f", 0, "-31"),
        ("ff", 16, "255"),
        ("0x1f", 10, "0"),
        ("z", 36, "35"),
        ("5", 1, "NaN"),
        ("9007199254740993", 0, "9007199254740992"),
        ("999999999999999999999999", 0, "1e+24"),
        ("1e3", 0, "1"),
        ("-0", 0, "-0"),
        ("7fffffffffffffffff", 16, "2.3611832414348226e+21"),
    ] {
        assert_eq!(
            shown(text::parse_int(text, radix)),
            expected,
            "{text} {radix}"
        );
    }
}

#[test]
fn parse_float_reads_as_javascript_does() {
    for (text, expected) in [
        (".", "NaN"),
        ("1e", "1"),
        ("1e3x", "1000"),
        ("-.5e-2", "-0.005"),
        ("0x1f", "0"),
        ("+Infinityx", "Infinity"),
        ("-0", "-0"),
    ] {
        assert_eq!(shown(text::parse_float(text)), expected, "{text}");
    }
}

#[test]
fn f16round_rounds_as_javascript_does() {
    for (x, expected) in [
        (1.337, "1.3369140625"),
        (65519.0, "65504"),
        (65520.0, "Infinity"),
        (1e-8, "0"),
        (6e-8, "5.960464477539063e-8"),
        (-0.1, "-0.0999755859375"),
    ] {
        assert_eq!(shown(f16round(x)), expected, "{x}");
    }
}
