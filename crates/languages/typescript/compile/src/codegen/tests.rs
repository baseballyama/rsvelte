use super::number;

#[test]
fn number_to_string_matches_javascript() {
    for (v, javascript) in [
        (0.0, "0"),
        (-0.0, "0"),
        (1.0, "1"),
        (-42.5, "-42.5"),
        (0.1 + 0.2, "0.30000000000000004"),
        (1e21, "1e+21"),
        (123_456_789_012_345_680_000.0, "123456789012345680000"),
        (1e-7, "1e-7"),
        (0.000_001, "0.000001"),
        (1.5e-10, "1.5e-10"),
        (f64::INFINITY, "Infinity"),
        (f64::NAN, "NaN"),
    ] {
        assert_eq!(number(v), javascript, "{v:?}");
    }
}
