use oxc_ast::ast::BinaryOperator;

use super::{
    exponentiate, math_max, math_min, math_round, math_sign, numeric_binary, string_to_number,
    to_int32,
};

// Expected values are what Node prints for `Number(s)`, `n | 0`, `a ** b` and `a op b`.

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
    for source in [
        "0x", "-0x10", "0x1g", "0x+1", "0o+7", "0b+1", "1_0", "infinity", ".",
    ] {
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

// Expected values are what Node 26 prints for each call, with `Object.is(x, -0)` telling the zeros
// apart.
#[test]
fn math_keeps_the_sign_of_zero() {
    let same = |got: f64, expected: f64| {
        got.to_bits() == expected.to_bits() || (got.is_nan() && expected.is_nan())
    };
    for (x, expected) in [
        (-0.3, -0.0),
        (-0.5, -0.0),
        (-0.6, -1.0),
        (2.5, 3.0),
        (-2.5, -2.0),
        (-0.0, -0.0),
        (0.499_999_999_999_999_94, 0.0),
        (f64::INFINITY, f64::INFINITY),
        (f64::NAN, f64::NAN),
    ] {
        assert!(same(math_round(x), expected), "round({x})");
    }
    for (values, max, min) in [
        (&[-0.0, 0.0][..], 0.0, -0.0),
        (&[0.0, -0.0][..], 0.0, -0.0),
        (&[][..], f64::NEG_INFINITY, f64::INFINITY),
        (&[f64::NAN, 1.0][..], f64::NAN, f64::NAN),
        (&[1.0, 3.0, 2.0][..], 3.0, 1.0),
    ] {
        assert!(same(math_max(values.iter().copied()), max), "max{values:?}");
        assert!(same(math_min(values.iter().copied()), min), "min{values:?}");
    }
    for (x, expected) in [
        (-0.0, -0.0),
        (0.0, 0.0),
        (-3.0, -1.0),
        (f64::NAN, f64::NAN),
        (f64::INFINITY, 1.0),
    ] {
        assert!(same(math_sign(x), expected), "sign({x})");
    }
}

#[test]
fn numeric_binary_masks_shift_counts_and_keeps_signs_as_javascript_does() {
    use BinaryOperator as B;
    for (operator, a, b, expected) in [
        (B::ShiftLeft, 1.0, 33.0, 2.0_f64),
        (B::ShiftLeft, 1.0, -1.0, -2_147_483_648.0),
        (B::ShiftRightZeroFill, -1.0, 0.0, 4_294_967_295.0),
        (B::ShiftRightZeroFill, 1.0, 32.0, 1.0),
        (B::ShiftRightZeroFill, -1.0, 31.0, 1.0),
        (B::ShiftRight, -8.0, 1.0, -4.0),
        (B::BitwiseOR, 4_294_967_301.0, 0.0, 5.0),
        (B::BitwiseAnd, 7.0, -0.5, 0.0),
        (B::BitwiseXOR, f64::NAN, 3.0, 3.0),
        (B::Remainder, -5.0, 3.0, -2.0),
        (B::Exponential, 2.0, -1074.0, 5e-324),
    ] {
        let actual = numeric_binary(operator, a, b).expect("an arithmetic operator");
        assert_eq!(actual.to_bits(), expected.to_bits(), "{a} {operator:?} {b}");
    }
    for (operator, a, b) in [
        (B::Remainder, 5.0, -0.0),
        (B::Exponential, 1.0, f64::INFINITY),
    ] {
        assert!(numeric_binary(operator, a, b).expect("arithmetic").is_nan());
    }
    assert_eq!(numeric_binary(B::Addition, 1.0, 2.0), None);
}
