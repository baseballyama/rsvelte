use num_bigint::BigUint;
use num_traits::ToPrimitive;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;

use super::Value;

/// `Number.parseFloat`: the longest prefix that reads as a decimal number.
pub(super) fn parse_float(text: &str) -> f64 {
    let text = text.trim_start_matches(is_ecmascript_whitespace);
    let (sign, unsigned) = match text.as_bytes().first() {
        Some(b'-') => (-1.0, &text[1..]),
        Some(b'+') => (1.0, &text[1..]),
        _ => (1.0, text),
    };
    if unsigned.starts_with("Infinity") {
        return sign * f64::INFINITY;
    }
    let bytes = unsigned.as_bytes();
    let digits = |from: usize| {
        from + bytes[from..]
            .iter()
            .take_while(|b| b.is_ascii_digit())
            .count()
    };
    let integer = digits(0);
    let mut end = integer;
    if bytes.get(end) == Some(&b'.') {
        end = digits(end + 1);
    }
    // A lone `.` holds no digit.
    if end == 0 || (end == 1 && integer == 0) {
        return f64::NAN;
    }
    if matches!(bytes.get(end), Some(b'e' | b'E')) {
        let signed = end + 1 + usize::from(matches!(bytes.get(end + 1), Some(b'+' | b'-')));
        let exponent = digits(signed);
        if exponent > signed {
            end = exponent;
        }
    }
    sign * unsigned[..end].parse::<f64>().unwrap_or(f64::NAN)
}

/// `Number.parseInt`, with `radix` already `ToInt32`.
pub(super) fn parse_int(text: &str, radix: i32) -> f64 {
    let text = text.trim_start_matches(is_ecmascript_whitespace);
    let (sign, mut unsigned) = match text.as_bytes().first() {
        Some(b'-') => (-1.0, &text[1..]),
        Some(b'+') => (1.0, &text[1..]),
        _ => (1.0, text),
    };
    // Only a radix of 0 or 16 reads a `0x` prefix.
    let radix = match radix {
        0 | 16 if matches!(unsigned.get(..2), Some("0x" | "0X")) => {
            unsigned = &unsigned[2..];
            16
        }
        0 => 10,
        2..=36 => radix.cast_unsigned(),
        _ => return f64::NAN,
    };
    let end = unsigned
        .find(|c: char| !c.is_digit(radix))
        .unwrap_or(unsigned.len());
    let digits = &unsigned[..end];
    if digits.is_empty() {
        return f64::NAN;
    }
    // A decimal reads as a literal does; any other radix is exact before it rounds once.
    let magnitude = if radix == 10 {
        digits.parse::<f64>().unwrap_or(f64::NAN)
    } else {
        BigUint::parse_bytes(digits.as_bytes(), radix)
            .and_then(|n| n.to_f64())
            .unwrap_or(f64::NAN)
    };
    sign * magnitude
}

/// `String.fromCodePoint`, or its kind where it would throw.
#[expect(
    clippy::cast_sign_loss,
    clippy::cast_possible_truncation,
    reason = "each code point is checked to be whole and in range first"
)]
pub(super) fn from_code_points(a: &[Value]) -> Value {
    let mut units = Vec::with_capacity(a.len());
    for value in a {
        let n = value.to_number();
        if n.fract() != 0.0 || !(0.0..=1_114_111.0).contains(&n) {
            return Value::AnyString;
        }
        let code = n as u32;
        let mut buffer = [0; 2];
        match char::from_u32(code) {
            Some(c) => units.extend_from_slice(c.encode_utf16(&mut buffer)),
            // A lone surrogate is one unit.
            None => units.push(code as u16),
        }
    }
    Value::String(String::from_utf16_lossy(&units))
}
