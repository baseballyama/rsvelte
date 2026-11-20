use super::{exponentiate, string_to_number, to_int32};

// Expected values are what Node prints for `Number(s)`, `n | 0` and `a ** b`.

#[test]
fn string_to_number_rounds_radix_literals_once() {
    let ones = format!("0b{}", "1".repeat(70));
    let huge = format!("0x{}", "F".repeat(300));
    for (source, expected) in [
        ("0x10000000000000000", 18_446_744_073_709_552_000.0),
        ("0x200000000000018", 144_115_188_075_855_900.0),
        ("0x10000000000000800", 18_446_744_073_709_552_000.0),
        ("0x10000000000000801", 18_446_744_073_709_556_000.0),
        (ones.as_str(), 1.180_591_620_717_411_3e21),
        ("0o7777777777777777777777777", 3.777_893_186_295_716e22),
        (" 0X1f ", 31.0),
        ("1e1000", f64::INFINITY),
        (huge.as_str(), f64::INFINITY),
    ] {
        assert_eq!(
            string_to_number(source).to_bits(),
            f64::to_bits(expected),
            "{source}"
        );
    }
    for source in ["0x", "-0x10", "0x1g", "1_0", "infinity", "."] {
        assert!(string_to_number(source).is_nan(), "{source}");
    }
}

#[test]
fn to_int32_reduces_modulo_two_to_the_32() {
    for (n, expected) in [
        (1e20, 1_661_992_960),
        (-1e20, -1_661_992_960),
        (2_147_483_648.0, -2_147_483_648),
        (4_294_967_297.5, 1),
        (-0.5, 0),
        (f64::NAN, 0),
    ] {
        assert_eq!(to_int32(n), expected, "{n}");
    }
}

#[test]
fn exponentiate_is_nan_where_javascript_differs_from_powf() {
    assert!(exponentiate(1.0, f64::INFINITY).is_nan());
    assert!(exponentiate(-8.0, 1.0 / 3.0).is_nan());
    assert_eq!(exponentiate(2.0, 10.0).to_bits(), f64::to_bits(1024.0));
}
